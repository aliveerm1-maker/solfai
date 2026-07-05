// server.js — Solfai v10: Maximum Accuracy Overhaul
// Architecture: Code calculates, AI extracts. All Gemini params snake_case.
// Features: 5-way consensus voting, dedicated key/pitch extraction, note-by-note
//   reconciliation, enhanced music theory validation, enharmonic awareness,
//   weighted majority voting, correction cache, vocal coach, MusicXML parser.

import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import { createHash, randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { Note, Scale, Interval } from 'tonal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOAD_DIR = join(tmpdir(), 'solfai-uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({ dest: UPLOAD_DIR });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// ─── Frontend serving ─────────────────────────────────────
// Primary UI: the Lovable React SPA (client/dist). The fully-functional classic
// single-file UI is preserved at /classic so NO functionality is lost.
const CLIENT_DIST = join(__dirname, 'client', 'dist');
const HAS_CLIENT_BUILD = existsSync(join(CLIENT_DIST, 'index.html'));

// Classic UI preserved: upload, analyze, solfege, vocal coach, transpose, etc.
app.use('/classic', express.static(join(__dirname, 'public')));

if (HAS_CLIENT_BUILD) {
  app.use(express.static(CLIENT_DIST));                                     // React SPA = front door
  app.use('/assets', express.static(join(__dirname, 'public', 'assets'))); // fallback for classic static assets (logo, etc.)
  console.log('[Solfai] Serving Lovable SPA from client/dist (classic UI at /classic)');
} else {
  // SPA not built yet — serve the classic app at root so nothing breaks.
  app.use(express.static(join(__dirname, 'public')));
  console.log('[Solfai] client/dist not found — serving classic UI at / (run: npm run build)');
}

// ─── Config ───────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.5-pro';
const GEMINI_FLASH = 'gemini-2.5-flash';

// Diagnostic verbosity. Set SOLFAI_VERBOSE=1 in the environment (e.g. Render env
// vars) to dump large payloads — full Gemini raw text, full note arrays — into the
// trace. Per-step trace lines always fire regardless (they're cheap and essential).
const VERBOSE = process.env.SOLFAI_VERBOSE === '1';

const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

// ─── Diagnostic Trace System ──────────────────────────────
// Every analysis gets a short trace ID; all its logs share that ID so they can be
// grepped together, and a single SUMMARY block at the end shows each stage's input
// and output side by side. Reading one SUMMARY reveals which stage produced a bad
// value. Usage: const trace = makeTrace(); trace.log('STEP', {...}); trace.summary();
function makeTrace() {
  const id = Math.random().toString(36).slice(2, 8);
  const t0 = Date.now();
  const steps = [];
  return {
    id,
    log(step, data) {
      const ms = Date.now() - t0;
      steps.push({ step, ms, data });
      console.log(`[SOLFAI][${id}][+${ms}ms][${step}]`, JSON.stringify(data));
    },
    warn(step, data) {
      const ms = Date.now() - t0;
      steps.push({ step, ms, data, level: 'WARN' });
      console.warn(`[SOLFAI][${id}][+${ms}ms][WARN][${step}]`, JSON.stringify(data));
    },
    summary() {
      console.log(`[SOLFAI][${id}][SUMMARY] ====================`);
      for (const s of steps) {
        console.log(`[SOLFAI][${id}][SUMMARY] ${s.step}${s.level === 'WARN' ? ' ⚠' : ''}:`, JSON.stringify(s.data));
      }
      console.log(`[SOLFAI][${id}][SUMMARY] total=${Date.now() - t0}ms ====================`);
    },
  };
}
// ─── OMR Microservice ─────────────────────────────────────
// Posts a page image to the OMR service and returns the MusicXML string, or null
// on any failure. All outcomes are logged through the caller's trace.
async function tryOmrService(imageBuffer, mimeType, trace) {
  if (!RUNPOD_ENDPOINT_ID || !RUNPOD_API_KEY) {
    trace?.warn('OMR_CONFIG_MISSING', { hasEndpointId: !!RUNPOD_ENDPOINT_ID, hasApiKey: !!RUNPOD_API_KEY });
    return null;
  }
  const url = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/runsync`;
  try {
    trace?.log('OMR_START', { url, mimeType, bytes: imageBuffer.length });
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ input: { image_base64: imageBuffer.toString('base64') } }),
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      trace?.warn('OMR_HTTP_ERROR', { status: response.status, body: errText.slice(0, 200) });
      return null;
    }
    const data = await response.json().catch(() => null);
    const error = data?.error ?? data?.output?.error;
    if (error) {
      trace?.warn('OMR_RUNPOD_ERROR', { error: typeof error === 'string' ? error.slice(0, 200) : error });
      return null;
    }
    const musicxml = data?.output?.musicxml ?? data?.musicxml ?? null;
    if (typeof musicxml !== 'string' || !musicxml.includes('<score-partwise')) {
      trace?.warn('OMR_NO_MUSICXML', { bodyPrefix: JSON.stringify(data)?.slice(0, 120) });
      return null;
    }
    trace?.log('OMR_DONE', { xmlLength: musicxml.length });
    return musicxml;
  } catch (err) {
    trace?.warn('OMR_EXCEPTION', { error: err.message });
    return null;
  }
}

// Google AI Studio (Gemini Developer API). Auth is the AIzaSy API key sent via
// the x-goog-api-key header. NOTE: do NOT switch this to the Vertex AI endpoint
// ({loc}-aiplatform.googleapis.com/.../projects/...) unless you also switch auth
// to an OAuth2 service-account bearer token — that endpoint rejects API keys.
function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}
function geminiHeaders(apiKey) {
  return { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey };
}
const CORRECTIONS_FILE = join(__dirname, 'corrections.json');

// Voting weights: Pro is more accurate, counts double
const WEIGHT_PRO = 2;
const WEIGHT_FLASH = 1;

// ─── Correction Cache ─────────────────────────────────────
function loadCorrections() {
  try {
    if (existsSync(CORRECTIONS_FILE)) {
      return JSON.parse(readFileSync(CORRECTIONS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('[Solfai] Failed to load corrections:', err.message);
  }
  return {};
}

function saveCorrections(data) {
  try {
    writeFileSync(CORRECTIONS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[Solfai] Failed to save corrections:', err.message);
  }
}

function hashImage(base64Data) {
  const chunk = (base64Data || '').substring(0, 50000);
  return createHash('md5').update(chunk).digest('hex');
}

// ─── Piece Database (piece-database.json) ────────────────
// The library's own catalog of ~1001 pieces with verified title/composer/voicing
// and honest key/time fills. Loaded once at startup; mutated by user corrections.
const PIECE_DB_FILE = join(__dirname, 'piece-database.json');
let pieceDb = { _meta: {}, pieces: [] };

function loadPieceDb() {
  try {
    if (existsSync(PIECE_DB_FILE)) {
      pieceDb = JSON.parse(readFileSync(PIECE_DB_FILE, 'utf8'));
      console.log(`[Solfai] Piece database: ${pieceDb.pieces?.length ?? 0} entries`);
    }
  } catch (err) {
    console.error('[Solfai] Failed to load piece database:', err.message);
  }
}

function savePieceDb() {
  try {
    const pieces = pieceDb.pieces || [];
    pieceDb._meta = {
      ...pieceDb._meta,
      filled_key: pieces.filter(p => p.key !== null).length,
      filled_time: pieces.filter(p => p.time !== null).length,
      high_confidence: pieces.filter(p => p.confidence === 'high').length,
      medium_confidence: pieces.filter(p => p.confidence === 'medium').length,
      needs_verification: pieces.filter(p => p.confidence === 'low').length,
      last_updated: new Date().toISOString().slice(0, 10),
    };
    writeFileSync(PIECE_DB_FILE, JSON.stringify(pieceDb, null, 2));
  } catch (err) {
    console.error('[Solfai] Failed to save piece database:', err.message);
  }
}

function normStr(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function lookupPieceDb(title, composer) {
  const pieces = pieceDb.pieces || [];
  if (!pieces.length || !title || title === 'unknown') return null;
  const nt = normStr(title);
  const nc = normStr(composer);

  // 1. Exact title + composer match
  for (const p of pieces) {
    if (!p.title) continue;
    if (normStr(p.title) === nt) {
      if (!nc || !p.composer ||
          normStr(p.composer).includes(nc) || nc.includes(normStr(p.composer))) {
        return p;
      }
    }
  }

  // 2. Fuzzy title match with optional composer boost
  const tw = nt.split(/\s+/).filter(w => w.length > 2);
  let best = null, bestScore = 0;
  for (const p of pieces) {
    if (!p.title) continue;
    const pw = normStr(p.title).split(/\s+/).filter(w => w.length > 2);
    if (!tw.length || !pw.length) continue;
    const hits = tw.filter(w => pw.some(x => x.includes(w) || w.includes(x)));
    let score = hits.length / Math.max(tw.length, pw.length);
    if (nc && p.composer && normStr(p.composer).includes(nc)) score += 0.3;
    if (score > bestScore && score >= 0.5) { bestScore = score; best = p; }
  }
  return best;
}

loadPieceDb();

// ─── Response schema with enum constraints ────────────────
const ANALYZE_SCHEMA = {
  type: "OBJECT",
  properties: {
    key_signature: {
      type: "STRING",
      description: "The key signature. Count accidentals carefully between the clef and time signature. Pick the closest match.",
      enum: [
        "C major", "G major", "D major", "A major", "E major", "B major",
        "F# major", "C# major", "Cb major",
        "F major", "Bb major", "Eb major", "Ab major", "Db major", "Gb major",
        "A minor", "E minor", "B minor", "F# minor", "C# minor", "G# minor",
        "D# minor", "A# minor",
        "D minor", "G minor", "C minor", "F minor", "Bb minor", "Eb minor", "Ab minor"
      ]
    },
    time_signature: {
      type: "STRING",
      description: "The time signature at the beginning of the piece.",
      enum: ["4/4", "3/4", "2/4", "4/8", "6/8", "9/8", "12/8", "2/2", "3/8", "3/2", "6/4", "5/4", "7/8"]
    },
    tempo: {
      type: "STRING",
      description: "The tempo marking written on the score (e.g., 'Andante', 'Allegro q=120'). Write 'none' if not visible.",
    },
    dynamics: {
      type: "STRING",
      description: "Opening dynamic marking (e.g., 'mp', 'f', 'pp') and any subsequent changes. Write 'none' if not visible."
    },
    flat_count: {
      type: "INTEGER",
      description: "Number of flats in the key signature. 0 if no flats. Count each flat symbol (♭) between clef and time signature."
    },
    sharp_count: {
      type: "INTEGER",
      description: "Number of sharps in the key signature. 0 if no sharps. Count each sharp symbol (♯) between clef and time signature."
    },
    first_notes: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "First 12 note names AS SOUNDING for the selected vocal part only, with octave (e.g., ['C4','E4','G4']). CRITICAL: apply the key signature — if the key signature has a Bb and a note sits on the B line with no natural sign, write 'Bb4', NOT 'B4'. Same for every flatted/sharped letter in the signature. Only write the plain letter when a natural sign cancels the signature."
    },
    drawn_accidentals: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Accidental symbols PRINTED DIRECTLY BEFORE individual noteheads in the first 8 measures (not the key signature itself). Format: pitch with the drawn symbol, e.g. ['Eb4','F#5','Bn4'] (use 'n' suffix for natural signs). Empty array if none."
    },
    last_notes: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Last 6 note letter names with octave for the selected vocal part (the final notes of the piece, e.g. ['G4','D4','C4']). Include accidentals: 'Bb4', 'F#4'. The very last note is the most important — pieces almost always end on the tonic."
    },
    first_lyrics: {
      type: "STRING",
      description: "The first line of lyrics visible under the vocal part, copied exactly as written."
    },
    piece_title: {
      type: "STRING",
      description: "Title of the piece if visible on the score. Write 'unknown' if not visible."
    },
    composer_name: {
      type: "STRING",
      description: "Composer name if visible on the score. Write 'unknown' if not visible."
    },
    lyrics_language: {
      type: "STRING",
      description: "Language of the lyrics.",
      enum: ["English", "Latin", "German", "French", "Italian", "Spanish", "Hebrew", "Russian", "Other"]
    },
    difficulty_overall: { type: "INTEGER", description: "Overall difficulty 1-10 for a community choir singer." },
    difficulty_rhythm: { type: "INTEGER", description: "Rhythm complexity 1-10." },
    difficulty_pitch: { type: "INTEGER", description: "Pitch range difficulty 1-10." },
    difficulty_intervals: { type: "INTEGER", description: "Interval difficulty 1-10." },
    difficulty_text: { type: "INTEGER", description: "Text/language difficulty 1-10." },
  },
  required: ["key_signature", "time_signature", "dynamics", "flat_count", "sharp_count", "difficulty_overall"]
};

// Dedicated key signature extraction schema (simpler, focused)
const KEY_SIG_SCHEMA = {
  type: "OBJECT",
  description: "CRITICAL: flat_count and sharp_count are MUTUALLY EXCLUSIVE. A key signature has EITHER flats OR sharps, NEVER BOTH. If you see 3 flats: flat_count=3, sharp_count=0. If you see 2 sharps: flat_count=0, sharp_count=2. Setting both to non-zero is ALWAYS wrong.",
  properties: {
    flat_count: {
      type: "INTEGER",
      description: "Number of flat symbols (♭) between the clef and time signature. MUST be 0 if sharp_count > 0."
    },
    sharp_count: {
      type: "INTEGER",
      description: "Number of sharp symbols (♯) between the clef and time signature. MUST be 0 if flat_count > 0."
    },
    confidence: {
      type: "STRING",
      enum: ["certain", "likely", "uncertain"]
    },
    reasoning: {
      type: "STRING",
      description: "Describe what you see step by step. Example: 'I see a flat on the B line, a flat on the E space, a flat on the A line = 3 flats total. No sharps visible.'"
    }
  },
  required: ["flat_count", "sharp_count", "confidence", "reasoning"]
};

// Dedicated last note schema for cross-validation
const LAST_NOTE_SCHEMA = {
  type: "OBJECT",
  properties: {
    pitch: {
      type: "STRING",
      description: "The very last sung note with octave number.",
      enum: [
        "C3", "C#3", "D3", "Eb3", "E3", "F3", "F#3", "G3", "Ab3", "A3", "Bb3", "B3",
        "C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "Ab4", "A4", "Bb4", "B4",
        "C5", "C#5", "D5", "Eb5", "E5", "F5", "F#5", "G5", "Ab5", "A5", "Bb5", "B5",
        "C6", "D6", "E6", "F6", "G6"
      ]
    },
    confidence: {
      type: "STRING",
      enum: ["certain", "likely", "uncertain"]
    }
  },
  required: ["pitch"]
};

// Dedicated time signature schema
const TIME_SIG_SCHEMA = {
  type: "OBJECT",
  properties: {
    time_signature: {
      type: "STRING",
      description: "The time signature as two numbers separated by a slash.",
      enum: ["4/4", "3/4", "2/4", "6/8", "9/8", "12/8", "2/2", "3/8", "3/2", "6/4", "5/4", "7/8"]
    },
    confidence: {
      type: "STRING",
      enum: ["certain", "likely", "uncertain"]
    },
    what_i_see: {
      type: "STRING",
      description: "Describe exactly what numbers you see stacked vertically. Example: 'I see a 3 on top and a 4 below = 3/4' or 'I see a C symbol = 4/4'"
    }
  },
  required: ["time_signature", "confidence", "what_i_see"]
};

// ─── Key from flat/sharp count (CODE, not AI) ─────────────
const KEY_FROM_COUNT = {
  '0': { major: 'C major', minor: 'A minor' },
  '1b': { major: 'F major', minor: 'D minor' },
  '2b': { major: 'Bb major', minor: 'G minor' },
  '3b': { major: 'Eb major', minor: 'C minor' },
  '4b': { major: 'Ab major', minor: 'F minor' },
  '5b': { major: 'Db major', minor: 'Bb minor' },
  '6b': { major: 'Gb major', minor: 'Eb minor' },
  '7b': { major: 'Cb major', minor: 'Ab minor' },
  '1s': { major: 'G major', minor: 'E minor' },
  '2s': { major: 'D major', minor: 'B minor' },
  '3s': { major: 'A major', minor: 'F# minor' },
  '4s': { major: 'E major', minor: 'C# minor' },
  '5s': { major: 'B major', minor: 'G# minor' },
  '6s': { major: 'F# major', minor: 'D# minor' },
  '7s': { major: 'C# major', minor: 'A# minor' },
};

// A key-sig read whose reasoning matches this means the page it saw has no music
// (title/cover/blank page). Such reads return 0 flats / 0 sharps and would poison
// the key vote, so they are discarded rather than counted.
const NON_MUSIC_PAGE_PATTERNS = /title page|does not contain any musical notation|no staves|no clef|no key signature visible|cannot see a time signature|no music/i;

// ─── Choir Piece Database (known correct values) ────────
const CHOIR_PIECE_DATABASE = [
  // Handel
  { title: "Hallelujah Chorus", composer: "Handel", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "And the Glory of the Lord", composer: "Handel", key: "A major", time: "3/4", sopranoStart: "E5", altoStart: "A4", tenorStart: "C#4", bassStart: "A3" },
  { title: "For Unto Us a Child Is Born", composer: "Handel", key: "G major", time: "4/4", sopranoStart: "G4", altoStart: "D4", tenorStart: "B3", bassStart: "G3" },
  { title: "Worthy Is the Lamb", composer: "Handel", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Since by Man Came Death", composer: "Handel", key: "A minor", time: "4/4", sopranoStart: "E5", altoStart: "C5", tenorStart: "A4", bassStart: "A3" },
  { title: "All We Like Sheep", composer: "Handel", key: "A major", time: "4/4", sopranoStart: "A4", altoStart: "E4", tenorStart: "C#4", bassStart: "A3" },
  { title: "He Shall Feed His Flock", composer: "Handel", key: "Bb major", time: "12/8", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "F3" },
  { title: "His Yoke Is Easy", composer: "Handel", key: "Bb major", time: "4/4", sopranoStart: "Bb4", altoStart: "F4", tenorStart: "D4", bassStart: "Bb3" },
  { title: "O Thou That Tellest", composer: "Handel", key: "D major", time: "6/8", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Surely He Hath Borne Our Griefs", composer: "Handel", key: "F minor", time: "4/4", sopranoStart: "F5", altoStart: "C5", tenorStart: "Ab4", bassStart: "F3" },
  // Bach
  { title: "Ave Maria", composer: "Bach/Gounod", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "Jesu Joy of Man's Desiring", composer: "Bach", key: "G major", time: "9/8", sopranoStart: "B4", altoStart: "G4", tenorStart: "D4", bassStart: "G3" },
  { title: "Sheep May Safely Graze", composer: "Bach", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "Bb4", tenorStart: "D4", bassStart: "Bb3" },
  { title: "O Sacred Head Now Wounded", composer: "Bach", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Wachet Auf", composer: "Bach", key: "Eb major", time: "4/4", sopranoStart: "Eb5", altoStart: "Bb4", tenorStart: "G4", bassStart: "Eb3" },
  { title: "Komm Susser Tod", composer: "Bach", key: "Eb major", time: "3/4", sopranoStart: "Bb4", altoStart: "Eb4", tenorStart: "G3", bassStart: "Eb3" },
  // Mozart Requiem
  { title: "Requiem - Introitus", composer: "Mozart", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Requiem - Dies Irae", composer: "Mozart", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Requiem - Rex Tremendae", composer: "Mozart", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "Bb4", tenorStart: "D4", bassStart: "Bb3" },
  { title: "Requiem - Confutatis", composer: "Mozart", key: "A minor", time: "4/4", sopranoStart: "E5", altoStart: "C5", tenorStart: "A4", bassStart: "A3" },
  { title: "Requiem - Lacrimosa", composer: "Mozart", key: "D minor", time: "12/8", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Ave Verum Corpus", composer: "Mozart", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D4" },
  { title: "Laudate Dominum", composer: "Mozart", key: "F major", time: "6/8", sopranoStart: "F5", altoStart: "C5", tenorStart: "A4", bassStart: "F3" },
  // Faure Requiem
  { title: "Requiem - Introit et Kyrie", composer: "Faure", key: "D minor", time: "4/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "D4", bassStart: "D3" },
  { title: "Requiem - Sanctus", composer: "Faure", key: "Eb major", time: "3/4", sopranoStart: "Bb4", altoStart: "Eb4", tenorStart: "Bb3", bassStart: "Eb3" },
  { title: "Requiem - Pie Jesu", composer: "Faure", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "Bb4", tenorStart: "D4", bassStart: "Bb3" },
  { title: "Requiem - In Paradisum", composer: "Faure", key: "D major", time: "3/4", sopranoStart: "A4", altoStart: "F#4", tenorStart: "D4", bassStart: "A3" },
  { title: "Cantique de Jean Racine", composer: "Faure", key: "Db major", time: "4/4", sopranoStart: "Ab4", altoStart: "F4", tenorStart: "Db4", bassStart: "Ab3" },
  // Brahms Requiem
  { title: "Ein Deutsches Requiem - I", composer: "Brahms", key: "F major", time: "4/4", sopranoStart: "F4", altoStart: "C4", tenorStart: "A3", bassStart: "F3" },
  { title: "Ein Deutsches Requiem - II", composer: "Brahms", key: "Bb minor", time: "3/4", sopranoStart: "Bb4", altoStart: "F4", tenorStart: "Db4", bassStart: "Bb3" },
  { title: "Ein Deutsches Requiem - IV", composer: "Brahms", key: "Eb major", time: "3/4", sopranoStart: "Bb4", altoStart: "Eb4", tenorStart: "Bb3", bassStart: "Eb3" },
  { title: "How Lovely Is Thy Dwelling Place", composer: "Brahms", key: "Eb major", time: "3/4", sopranoStart: "Bb4", altoStart: "Eb4", tenorStart: "Bb3", bassStart: "Eb3" },
  // Christmas
  { title: "O Come All Ye Faithful", composer: "Wade", key: "G major", time: "4/4", sopranoStart: "G4", altoStart: "D4", tenorStart: "B3", bassStart: "G3" },
  { title: "Silent Night", composer: "Gruber", key: "Bb major", time: "6/8", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "F3" },
  { title: "Hark the Herald Angels Sing", composer: "Mendelssohn", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Joy to the World", composer: "Mason", key: "D major", time: "2/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "O Holy Night", composer: "Adam", key: "C major", time: "6/8", sopranoStart: "C4", altoStart: "E4", tenorStart: "C4", bassStart: "C3" },
  { title: "The First Noel", composer: "Traditional", key: "D major", time: "3/4", sopranoStart: "F#4", altoStart: "D4", tenorStart: "A3", bassStart: "D3" },
  { title: "O Little Town of Bethlehem", composer: "Redner", key: "F major", time: "4/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "C4", bassStart: "F3" },
  { title: "Away in a Manger", composer: "Murray", key: "F major", time: "3/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "What Child Is This", composer: "Traditional", key: "E minor", time: "3/4", sopranoStart: "E4", altoStart: "B3", tenorStart: "G3", bassStart: "E3" },
  { title: "O Come O Come Emmanuel", composer: "Traditional", key: "E minor", time: "4/4", sopranoStart: "E4", altoStart: "B3", tenorStart: "G3", bassStart: "E3" },
  { title: "Angels We Have Heard on High", composer: "Traditional", key: "F major", time: "4/4", sopranoStart: "F4", altoStart: "C4", tenorStart: "A3", bassStart: "F3" },
  { title: "Carol of the Bells", composer: "Leontovych", key: "G minor", time: "3/4", sopranoStart: "D5", altoStart: "Bb4", tenorStart: "G4", bassStart: "G3" },
  // Hymns and Anthems
  { title: "Amazing Grace", composer: "Traditional", key: "G major", time: "3/4", sopranoStart: "D4", altoStart: "B3", tenorStart: "G3", bassStart: "G3" },
  { title: "How Great Thou Art", composer: "Hine", key: "Bb major", time: "4/4", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "Bb3" },
  { title: "Be Thou My Vision", composer: "Traditional Irish", key: "Eb major", time: "3/4", sopranoStart: "Eb4", altoStart: "Bb3", tenorStart: "G3", bassStart: "Eb3" },
  { title: "Holy Holy Holy", composer: "Dykes", key: "D major", time: "4/4", sopranoStart: "D4", altoStart: "A3", tenorStart: "F#3", bassStart: "D3" },
  { title: "For the Beauty of the Earth", composer: "Kocher", key: "Ab major", time: "4/4", sopranoStart: "Eb4", altoStart: "C4", tenorStart: "Ab3", bassStart: "Ab3" },
  { title: "Come Thou Fount", composer: "Nettleton", key: "D major", time: "3/4", sopranoStart: "D4", altoStart: "A3", tenorStart: "F#3", bassStart: "D3" },
  { title: "It Is Well with My Soul", composer: "Bliss", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "Great Is Thy Faithfulness", composer: "Runyan", key: "D major", time: "3/4", sopranoStart: "D4", altoStart: "A3", tenorStart: "F#3", bassStart: "D3" },
  { title: "A Mighty Fortress Is Our God", composer: "Luther", key: "C major", time: "4/4", sopranoStart: "C5", altoStart: "G4", tenorStart: "E4", bassStart: "C3" },
  // African American Spirituals
  { title: "Swing Low Sweet Chariot", composer: "Traditional Spiritual", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Deep River", composer: "Traditional Spiritual", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "Eb4", tenorStart: "G3", bassStart: "Eb3" },
  { title: "Steal Away", composer: "Traditional Spiritual", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "Ab4", tenorStart: "C4", bassStart: "Ab3" },
  { title: "Go Down Moses", composer: "Traditional Spiritual", key: "E minor", time: "4/4", sopranoStart: "E4", altoStart: "B3", tenorStart: "G3", bassStart: "E3" },
  { title: "Wade in the Water", composer: "Traditional Spiritual", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Elijah Rock", composer: "Hairston", key: "G minor", time: "4/4", sopranoStart: "D5", altoStart: "Bb4", tenorStart: "G4", bassStart: "G3" },
  { title: "There Is a Balm in Gilead", composer: "Traditional Spiritual", key: "F major", time: "4/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "C4", bassStart: "F3" },
  { title: "Every Time I Feel the Spirit", composer: "Traditional Spiritual", key: "G major", time: "4/4", sopranoStart: "D5", altoStart: "B4", tenorStart: "G4", bassStart: "G3" },
  { title: "Joshua Fit the Battle of Jericho", composer: "Traditional Spiritual", key: "D minor", time: "2/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "D4", bassStart: "D3" },
  { title: "Ain't Got Time to Die", composer: "Johnson", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "Ride On King Jesus", composer: "Hairston", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Eb3" },
  { title: "Soon I Will Be Done", composer: "Dawson", key: "C minor", time: "4/4", sopranoStart: "G4", altoStart: "Eb4", tenorStart: "C4", bassStart: "C3" },
  // Classical Choral Works
  { title: "Gloria", composer: "Vivaldi", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Dixit Dominus", composer: "Handel", key: "G minor", time: "4/4", sopranoStart: "D5", altoStart: "Bb4", tenorStart: "G4", bassStart: "G3" },
  { title: "Zadok the Priest", composer: "Handel", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Requiem - Dies Irae", composer: "Verdi", key: "G minor", time: "4/4", sopranoStart: "G5", altoStart: "D5", tenorStart: "Bb4", bassStart: "G3" },
  { title: "Requiem - Sanctus", composer: "Verdi", key: "F major", time: "4/4", sopranoStart: "F5", altoStart: "C5", tenorStart: "A4", bassStart: "F3" },
  { title: "Missa Solemnis - Kyrie", composer: "Beethoven", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Ode to Joy", composer: "Beethoven", key: "D major", time: "4/4", sopranoStart: "F#4", altoStart: "D4", tenorStart: "A3", bassStart: "D3" },
  { title: "Carmina Burana - O Fortuna", composer: "Orff", key: "D minor", time: "3/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Chichester Psalms - I", composer: "Bernstein", key: "G major", time: "7/4", sopranoStart: "D5", altoStart: "B4", tenorStart: "G4", bassStart: "G3" },
  { title: "Locus Iste", composer: "Bruckner", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "Os Justi", composer: "Bruckner", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "C3" },
  { title: "The Armed Man - Kyrie", composer: "Jenkins", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Spem in Alium", composer: "Tallis", key: "A major", time: "4/4", sopranoStart: "A4", altoStart: "E4", tenorStart: "C#4", bassStart: "A3" },
  // Madrigals
  { title: "April Is in My Mistress' Face", composer: "Morley", key: "G major", time: "4/4", sopranoStart: "G4", altoStart: "D4", tenorStart: "B3", bassStart: "G3" },
  { title: "Now Is the Month of Maying", composer: "Morley", key: "G major", time: "4/4", sopranoStart: "D5", altoStart: "B4", tenorStart: "G4", bassStart: "G3" },
  { title: "The Silver Swan", composer: "Gibbons", key: "G major", time: "4/4", sopranoStart: "G4", altoStart: "D4", tenorStart: "B3", bassStart: "G3" },
  { title: "Since Robin Hood", composer: "Weelkes", key: "G major", time: "4/4", sopranoStart: "G4", altoStart: "D4", tenorStart: "B3", bassStart: "G3" },
  { title: "Fair Phyllis", composer: "Farmer", key: "G major", time: "4/4", sopranoStart: "G4", altoStart: "D4", tenorStart: "B3", bassStart: "G3" },
  // Romantic/Modern Choral
  { title: "Lux Aurumque", composer: "Whitacre", key: "Ab major", time: "4/4", sopranoStart: "Ab4", altoStart: "Eb4", tenorStart: "C4", bassStart: "Ab3" },
  { title: "Sleep", composer: "Whitacre", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Seal Lullaby", composer: "Whitacre", key: "Eb major", time: "6/8", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Sure on This Shining Night", composer: "Lauridsen", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "C3" },
  { title: "O Magnum Mysterium", composer: "Lauridsen", key: "D major", time: "4/4", sopranoStart: "F#4", altoStart: "D4", tenorStart: "A3", bassStart: "D3" },
  { title: "Dirait-on", composer: "Lauridsen", key: "Bb major", time: "6/8", sopranoStart: "F5", altoStart: "D5", tenorStart: "Bb4", bassStart: "F3" },
  { title: "Totus Tuus", composer: "Gorecki", key: "Ab major", time: "4/4", sopranoStart: "Ab4", altoStart: "Eb4", tenorStart: "C4", bassStart: "Ab3" },
  { title: "Ave Maria", composer: "Biebl", key: "F major", time: "4/4", sopranoStart: "F5", altoStart: "C5", tenorStart: "A4", bassStart: "F3" },
  { title: "Prayer of the Children", composer: "Bestor", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "In the Bleak Midwinter", composer: "Holst", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "I Vow to Thee My Country", composer: "Holst", key: "Ab major", time: "3/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "Faire Is the Heaven", composer: "Harris", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Like as the Hart", composer: "Howells", key: "G major", time: "4/4", sopranoStart: "D5", altoStart: "B4", tenorStart: "G4", bassStart: "G3" },
  // Faure/Durufle/Rutter
  { title: "Requiem - Pie Jesu", composer: "Rutter", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "D5", tenorStart: "Bb4", bassStart: "F3" },
  { title: "For the Beauty of the Earth", composer: "Rutter", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "The Lord Bless You and Keep You", composer: "Rutter", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Look at the World", composer: "Rutter", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Requiem - Introit", composer: "Durufle", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Ubi Caritas", composer: "Durufle", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "C3" },
  // Opera choruses / Oratorio
  { title: "Va Pensiero", composer: "Verdi", key: "F# minor", time: "4/4", sopranoStart: "C#5", altoStart: "A4", tenorStart: "F#4", bassStart: "F#3" },
  { title: "Anvil Chorus", composer: "Verdi", key: "C major", time: "4/4", sopranoStart: "E5", altoStart: "C5", tenorStart: "G4", bassStart: "C3" },
  { title: "Elijah - And Then Shall Your Light Break Forth", composer: "Mendelssohn", key: "F major", time: "4/4", sopranoStart: "F5", altoStart: "C5", tenorStart: "A4", bassStart: "F3" },
  { title: "Elijah - He Watching Over Israel", composer: "Mendelssohn", key: "F major", time: "6/8", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  // Contemporary/Pop-influenced
  { title: "Bohemian Rhapsody", composer: "Mercury/arr.", key: "Bb major", time: "4/4", sopranoStart: "Bb4", altoStart: "F4", tenorStart: "D4", bassStart: "Bb3" },
  { title: "Africa", composer: "Toto/arr.", key: "A major", time: "4/4", sopranoStart: "A4", altoStart: "E4", tenorStart: "C#4", bassStart: "A3" },
  { title: "Loch Lomond", composer: "Traditional Scottish", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Danny Boy", composer: "Traditional Irish", key: "Eb major", time: "4/4", sopranoStart: "Eb4", altoStart: "Bb3", tenorStart: "G3", bassStart: "Eb3" },
  { title: "Shenandoah", composer: "Traditional American", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Battle Hymn of the Republic", composer: "Steffe", key: "Bb major", time: "4/4", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "Bb3" },
  // ─── EXPANDED: School Choir Standards ───
  { title: "Cantate Domino", composer: "Pitoni", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Sicut Cervus", composer: "Palestrina", key: "C major", time: "4/4", sopranoStart: "G4", altoStart: "E4", tenorStart: "C4", bassStart: "C3" },
  { title: "Ave Maria", composer: "Arcadelt", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "Jubilate Deo", composer: "Praetorius", key: "F major", time: "4/4", sopranoStart: "F4", altoStart: "C4", tenorStart: "A3", bassStart: "F3" },
  { title: "Dona Nobis Pacem", composer: "Traditional", key: "F major", time: "3/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Ubi Caritas", composer: "Ola Gjeilo", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Northern Lights", composer: "Ola Gjeilo", key: "D major", time: "4/4", sopranoStart: "A4", altoStart: "F#4", tenorStart: "D4", bassStart: "A3" },
  { title: "The Ground", composer: "Ola Gjeilo", key: "F minor", time: "4/4", sopranoStart: "C5", altoStart: "Ab4", tenorStart: "F4", bassStart: "C3" },
  { title: "Alleluia", composer: "Thompson", key: "G major", time: "4/4", sopranoStart: "D5", altoStart: "B4", tenorStart: "G4", bassStart: "G3" },
  { title: "Choose Something Like a Star", composer: "Thompson", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "The Road Not Taken", composer: "Thompson", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "Frostiana - The Pasture", composer: "Thompson", key: "F major", time: "6/8", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Gloria", composer: "Rutter", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "D5", tenorStart: "Bb4", bassStart: "F3" },
  { title: "Magnificat", composer: "Rutter", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "This Is the Day", composer: "Rutter", key: "D major", time: "4/4", sopranoStart: "A4", altoStart: "F#4", tenorStart: "D4", bassStart: "D3" },
  { title: "All Things Bright and Beautiful", composer: "Rutter", key: "G major", time: "4/4", sopranoStart: "D4", altoStart: "B3", tenorStart: "G3", bassStart: "G3" },
  // ─── EXPANDED: Popular Arrangements ───
  { title: "Can You Feel the Love Tonight", composer: "John/arr.", key: "Bb major", time: "4/4", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "Bb3" },
  { title: "Circle of Life", composer: "John/arr.", key: "Bb major", time: "4/4", sopranoStart: "Bb4", altoStart: "F4", tenorStart: "D4", bassStart: "Bb3" },
  { title: "Somewhere Over the Rainbow", composer: "Arlen/arr.", key: "Eb major", time: "4/4", sopranoStart: "Eb4", altoStart: "Bb3", tenorStart: "G3", bassStart: "Eb3" },
  { title: "Bridge Over Troubled Water", composer: "Simon/arr.", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Lean on Me", composer: "Withers/arr.", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "You Raise Me Up", composer: "Lovland/arr.", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Hallelujah", composer: "Cohen/arr.", key: "C major", time: "6/8", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "Fix You", composer: "Coldplay/arr.", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Stand By Me", composer: "King/arr.", key: "A major", time: "4/4", sopranoStart: "A4", altoStart: "E4", tenorStart: "C#4", bassStart: "A3" },
  { title: "Don't Stop Believin'", composer: "Journey/arr.", key: "E major", time: "4/4", sopranoStart: "B4", altoStart: "G#4", tenorStart: "E4", bassStart: "B3" },
  { title: "Hey Jude", composer: "Beatles/arr.", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Let It Be", composer: "Beatles/arr.", key: "C major", time: "4/4", sopranoStart: "G4", altoStart: "E4", tenorStart: "C4", bassStart: "C3" },
  { title: "Imagine", composer: "Lennon/arr.", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "One Day More", composer: "Schonberg/arr.", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Seasons of Love", composer: "Larson/arr.", key: "Bb major", time: "4/4", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "Bb3" },
  { title: "When You Believe", composer: "Schwartz/arr.", key: "A minor", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "A3", bassStart: "A3" },
  // ─── EXPANDED: Gospel ───
  { title: "Oh Happy Day", composer: "Hawkins", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Total Praise", composer: "Smallwood", key: "Db major", time: "4/4", sopranoStart: "Ab4", altoStart: "F4", tenorStart: "Db4", bassStart: "Db3" },
  { title: "Order My Steps", composer: "Burleigh", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Eb3" },
  { title: "His Eye Is on the Sparrow", composer: "Gabriel", key: "C major", time: "3/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "How Great Is Our God", composer: "Tomlin/arr.", key: "C major", time: "4/4", sopranoStart: "G4", altoStart: "E4", tenorStart: "C4", bassStart: "C3" },
  { title: "Baba Yetu", composer: "Tin", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "10000 Reasons", composer: "Redman/arr.", key: "G major", time: "4/4", sopranoStart: "D4", altoStart: "B3", tenorStart: "G3", bassStart: "G3" },
  { title: "Amazing Grace My Chains Are Gone", composer: "Tomlin/arr.", key: "G major", time: "3/4", sopranoStart: "D4", altoStart: "B3", tenorStart: "G3", bassStart: "G3" },
  { title: "Cornerstone", composer: "Hillsong/arr.", key: "C major", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "G3", bassStart: "C3" },
  { title: "In Christ Alone", composer: "Getty/arr.", key: "D major", time: "3/4", sopranoStart: "D4", altoStart: "A3", tenorStart: "F#3", bassStart: "D3" },
  // ─── EXPANDED: World Music ───
  { title: "Hine Ma Tov", composer: "Traditional Hebrew", key: "D minor", time: "4/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "D4", bassStart: "D3" },
  { title: "Shalom Chaverim", composer: "Traditional Hebrew", key: "D minor", time: "4/4", sopranoStart: "D4", altoStart: "A3", tenorStart: "F3", bassStart: "D3" },
  { title: "Bashana Haba'ah", composer: "Hirsh", key: "A minor", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "A3", bassStart: "A3" },
  { title: "Oseh Shalom", composer: "Traditional Hebrew", key: "D minor", time: "3/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Tshotsholoza", composer: "Traditional South African", key: "G major", time: "4/4", sopranoStart: "D5", altoStart: "B4", tenorStart: "G4", bassStart: "G3" },
  { title: "Siyahamba", composer: "Traditional South African", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Banuwa", composer: "Traditional Liberian", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Nkosi Sikelel iAfrika", composer: "Sontonga", key: "Bb major", time: "4/4", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "Bb3" },
  { title: "Arirang", composer: "Traditional Korean", key: "G major", time: "3/4", sopranoStart: "D5", altoStart: "B4", tenorStart: "G4", bassStart: "G3" },
  { title: "Sakura", composer: "Traditional Japanese", key: "A minor", time: "4/4", sopranoStart: "E4", altoStart: "C4", tenorStart: "A3", bassStart: "A3" },
  { title: "La Llorona", composer: "Traditional Mexican", key: "E minor", time: "3/4", sopranoStart: "E4", altoStart: "B3", tenorStart: "G3", bassStart: "E3" },
  { title: "Guantanamera", composer: "Traditional Cuban", key: "C major", time: "4/4", sopranoStart: "G4", altoStart: "E4", tenorStart: "C4", bassStart: "C3" },
  { title: "Hava Nagila", composer: "Traditional Hebrew", key: "E minor", time: "4/4", sopranoStart: "E4", altoStart: "B3", tenorStart: "G3", bassStart: "E3" },
  { title: "Tuuliansen Alla", composer: "Traditional Finnish", key: "D minor", time: "3/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "D4", bassStart: "D3" },
  // ─── EXPANDED: Contest Pieces ───
  { title: "The Battle of Jericho", composer: "Hogan", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Set Me as a Seal", composer: "Clausen", key: "Db major", time: "4/4", sopranoStart: "Ab4", altoStart: "F4", tenorStart: "Db4", bassStart: "Ab3" },
  { title: "Stars", composer: "Esenvalds", key: "D major", time: "4/4", sopranoStart: "A4", altoStart: "F#4", tenorStart: "D4", bassStart: "D3" },
  { title: "Only in Sleep", composer: "Esenvalds", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "Leonardo Dreams of His Flying Machine", composer: "Whitacre", key: "D minor", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F4", bassStart: "D3" },
  { title: "Cloudburst", composer: "Whitacre", key: "Ab major", time: "4/4", sopranoStart: "Ab4", altoStart: "Eb4", tenorStart: "C4", bassStart: "Ab3" },
  { title: "Water Night", composer: "Whitacre", key: "Db major", time: "4/4", sopranoStart: "Ab4", altoStart: "F4", tenorStart: "Db4", bassStart: "Ab3" },
  { title: "Daemon Irrepit Callidus", composer: "Gyongyosi", key: "G minor", time: "4/4", sopranoStart: "D5", altoStart: "Bb4", tenorStart: "G4", bassStart: "G3" },
  { title: "Io Vivat", composer: "Lassus", key: "C major", time: "4/4", sopranoStart: "C5", altoStart: "G4", tenorStart: "E4", bassStart: "C3" },
  { title: "Ave Verum Corpus", composer: "Byrd", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Ave Verum Corpus", composer: "Elgar", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "D5", tenorStart: "Bb4", bassStart: "F3" },
  { title: "Festival Sanctus", composer: "Leavitt", key: "D major", time: "4/4", sopranoStart: "D5", altoStart: "A4", tenorStart: "F#4", bassStart: "D3" },
  { title: "Ezekiel Saw the Wheel", composer: "Dawson", key: "G minor", time: "4/4", sopranoStart: "D5", altoStart: "Bb4", tenorStart: "G4", bassStart: "G3" },
  { title: "There Will Be Rest", composer: "Ticheli", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "Earth Song", composer: "Ticheli", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "Simple Gifts", composer: "Copland/arr.", key: "F major", time: "2/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "I Believe", composer: "Drake/arr.", key: "Eb major", time: "4/4", sopranoStart: "Eb4", altoStart: "Bb3", tenorStart: "G3", bassStart: "Eb3" },
  { title: "The Awakening", composer: "Ellingboe", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "C3" },
  { title: "Will the Circle Be Unbroken", composer: "Traditional/arr.", key: "G major", time: "4/4", sopranoStart: "D4", altoStart: "B3", tenorStart: "G3", bassStart: "G3" },
  { title: "Down to the River to Pray", composer: "Traditional/arr.", key: "F major", time: "4/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "C4", bassStart: "F3" },
  { title: "Plenty Good Room", composer: "Hogan", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Eb3" },
  { title: "My Lord What a Morning", composer: "Burleigh/arr.", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Entreat Me Not to Leave You", composer: "Gounod", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "D5", tenorStart: "Bb4", bassStart: "F3" },
  { title: "The Music of Living", composer: "Forrest", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "Witness", composer: "Hogan", key: "C minor", time: "4/4", sopranoStart: "G4", altoStart: "Eb4", tenorStart: "C4", bassStart: "C3" },
  { title: "Panis Angelicus", composer: "Franck", key: "A major", time: "4/4", sopranoStart: "E5", altoStart: "C#5", tenorStart: "A4", bassStart: "A3" },
  { title: "Miserere Mei Deus", composer: "Allegri", key: "G minor", time: "4/4", sopranoStart: "G4", altoStart: "D4", tenorStart: "Bb3", bassStart: "G3" },
  { title: "O Magnum Mysterium", composer: "Victoria", key: "F major", time: "4/4", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "F3" },
  { title: "Bogoroditse Devo", composer: "Rachmaninoff", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "Now Thank We All Our God", composer: "Cruger/arr.", key: "F major", time: "4/4", sopranoStart: "F4", altoStart: "C4", tenorStart: "A3", bassStart: "F3" },
  { title: "Shalom Rav", composer: "Friedman", key: "D minor", time: "4/4", sopranoStart: "D4", altoStart: "A3", tenorStart: "F3", bassStart: "D3" },
  { title: "Adon Olam", composer: "Traditional Hebrew", key: "G major", time: "4/4", sopranoStart: "D4", altoStart: "B3", tenorStart: "G3", bassStart: "G3" },
  { title: "Requiem Aeternam", composer: "Howells", key: "D minor", time: "4/4", sopranoStart: "A4", altoStart: "F4", tenorStart: "D4", bassStart: "D3" },
  { title: "If Ye Love Me", composer: "Tallis", key: "F major", time: "4/4", sopranoStart: "F4", altoStart: "C4", tenorStart: "A3", bassStart: "F3" },
  { title: "Hear My Prayer", composer: "Mendelssohn", key: "Bb major", time: "4/4", sopranoStart: "F5", altoStart: "D5", tenorStart: "Bb4", bassStart: "F3" },
  { title: "O Nata Lux", composer: "Lauridsen", key: "D major", time: "4/4", sopranoStart: "F#4", altoStart: "D4", tenorStart: "A3", bassStart: "D3" },
  { title: "Mid-Winter", composer: "Lauridsen", key: "F major", time: "6/8", sopranoStart: "C5", altoStart: "A4", tenorStart: "F4", bassStart: "C3" },
  { title: "I Carry Your Heart", composer: "Stroope", key: "Ab major", time: "4/4", sopranoStart: "Eb5", altoStart: "C5", tenorStart: "Ab4", bassStart: "Ab3" },
  { title: "She Walks in Beauty", composer: "Stroope", key: "Eb major", time: "4/4", sopranoStart: "Bb4", altoStart: "G4", tenorStart: "Eb4", bassStart: "Bb3" },
  { title: "It Don't Mean a Thing", composer: "Ellington/arr.", key: "G minor", time: "4/4", sopranoStart: "D5", altoStart: "Bb4", tenorStart: "G4", bassStart: "G3" },
  { title: "Come Alive", composer: "Pasek & Paul/arr.", key: "A major", time: "4/4", sopranoStart: "A4", altoStart: "E4", tenorStart: "C#4", bassStart: "A3" },
  { title: "This Is Me", composer: "Pasek & Paul/arr.", key: "Bb major", time: "4/4", sopranoStart: "F4", altoStart: "D4", tenorStart: "Bb3", bassStart: "Bb3" },
  { title: "A Million Dreams", composer: "Pasek & Paul/arr.", key: "G major", time: "4/4", sopranoStart: "D4", altoStart: "B3", tenorStart: "G3", bassStart: "G3" },
];

function lookupPiece(title, composer) {
  if (!title || title === 'unknown') return null;
  const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const normTitle = normalize(title);
  const normComposer = normalize(composer);

  // Exact title match first
  for (const piece of CHOIR_PIECE_DATABASE) {
    if (normalize(piece.title) === normTitle) {
      if (!normComposer || normalize(piece.composer).includes(normComposer) || normComposer.includes(normalize(piece.composer))) {
        return piece;
      }
    }
  }

  // Fuzzy title match: check if significant words overlap
  const titleWords = normTitle.split(/\s+/).filter(w => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;

  for (const piece of CHOIR_PIECE_DATABASE) {
    const pieceWords = normalize(piece.title).split(/\s+/).filter(w => w.length > 2);
    const matchingWords = titleWords.filter(w => pieceWords.some(pw => pw.includes(w) || w.includes(pw)));
    const score = matchingWords.length / Math.max(titleWords.length, pieceWords.length);

    // Boost score if composer matches
    let composerBoost = 0;
    if (normComposer && normalize(piece.composer).includes(normComposer)) {
      composerBoost = 0.3;
    }

    const finalScore = score + composerBoost;
    if (finalScore > bestScore && finalScore >= 0.5) {
      bestScore = finalScore;
      bestMatch = piece;
    }
  }

  return bestMatch;
}

// ─── Mode Detection (music theory, not AI voting) ─────────
// A key signature maps to exactly one relative major/minor pair (e.g. 1 flat =
// F major OR D minor). Which one it is can be COMPUTED from the actual notes far
// more reliably than guessed by the AI. Per the project rule "code calculates, AI
// extracts": the notes are extracted by Gemini, but the major/minor decision is
// pure music theory done here in code.
//
// Evidence, in priority order:
//   1. Final note  — pieces overwhelmingly end on the tonic.
//   2. First note  — pieces frequently begin on the tonic.
//   3. Raised leading tone — minor keys almost always contain the raised 7th
//      (e.g. G# in A minor) as an accidental that is NOT in the relative major scale.
//   4. Tonic frequency — count notes on the major tonic vs the minor tonic.
function detectModeFromNotes(flatCount, sharpCount, allNotes = [], firstNotes = [], lastNote = null, trace = null) {
  let code;
  if (sharpCount > 0) code = `${sharpCount}s`;
  else if (flatCount > 0) code = `${flatCount}b`;
  else code = '0';

  const entry = KEY_FROM_COUNT[code];
  if (!entry) {
    return { mode: 'major', confidence: 0.0, evidence: { reason: 'no_key_entry_default_major' } };
  }

  const majorTonic = entry.major.split(' ')[0]; // 'F major' → 'F'
  const minorTonic = entry.minor.split(' ')[0]; // 'D minor' → 'D'
  const majorChroma = Note.chroma(majorTonic);
  const minorChroma = Note.chroma(minorTonic);
  // Raised leading tone of the minor key = minor tonic + 11 semitones (the major 7th
  // above the minor tonic). E.g. A minor → G# (chroma 8). Chroma comparison handles
  // enharmonic spellings (E# == F, etc.).
  const leadingToneChroma = (minorChroma + 11) % 12;

  const log = (step, data) => {
    if (trace) trace.log(`MODE_DETECT_${step}`, data);
    else console.log(`[SOLFAI] [MODE_DETECT] ${step.toLowerCase()} —`, JSON.stringify(data));
  };

  const chromaOf = (n) => {
    if (!n) return null;
    const c = Note.chroma(String(n).trim());
    return (c === null || c === undefined) ? null : c;
  };

  const firstNote = (firstNotes && firstNotes.length) ? firstNotes[0] : null;
  const lastChroma = chromaOf(lastNote);
  const firstChroma = chromaOf(firstNote);

  // Tonic-frequency counts and leading-tone presence across all notes
  let majorTonicCount = 0, minorTonicCount = 0, hasLeadingTone = false;
  for (const n of (allNotes || [])) {
    const c = chromaOf(n);
    if (c === null) continue;
    if (c === majorChroma) majorTonicCount++;
    if (c === minorChroma) minorTonicCount++;
    if (c === leadingToneChroma) hasLeadingTone = true;
  }

  log('CANDIDATES', { major: entry.major, minor: entry.minor, majorTonic, minorTonic });
  log('SIGNALS', { lastNote: lastNote || null, firstNote: firstNote || null, hasLeadingTone, majorTonicCount, minorTonicCount });

  // Weighted scoring
  let majorScore = 0, minorScore = 0;
  if (lastChroma !== null) {
    if (lastChroma === minorChroma) minorScore += 5;
    else if (lastChroma === majorChroma) majorScore += 5;
  }
  if (firstChroma !== null) {
    if (firstChroma === minorChroma) minorScore += 2;
    else if (firstChroma === majorChroma) majorScore += 2;
  }
  if (hasLeadingTone) minorScore += 4;
  minorScore += minorTonicCount;
  majorScore += majorTonicCount;

  const total = majorScore + minorScore;
  log('SCORES', { majorScore, minorScore });

  if (total === 0) {
    log('DECISION', { mode: 'major', confidence: 0.0, reason: 'no_notes_default_major' });
    return { mode: 'major', confidence: 0.0, evidence: { reason: 'no_notes_default_major', majorScore, minorScore } };
  }

  const mode = minorScore > majorScore ? 'minor' : 'major';
  const confidence = Math.min(1, Math.abs(majorScore - minorScore) / total);
  log('DECISION', { mode, confidence: Math.round(confidence * 100) / 100 });

  return {
    mode,
    confidence,
    evidence: { lastNote: lastNote || null, firstNote: firstNote || null, hasLeadingTone, majorTonicCount, minorTonicCount, majorScore, minorScore },
  };
}

// ═══ NOTE-CONTENT KEY INFERENCE (last-resort fallback) ═══
// When the key signature is unreadable (title pages, blank renders) but real notes
// were extracted, score every accidental-count candidate by how many extracted
// pitch classes belong to its scale. Pure code — no AI. Ties prefer fewer accidentals.
function inferKeyFromNoteContent(notes = [], trace = null) {
  const chromas = notes
    .map(n => Note.chroma(String(n).trim().replace(/\d+$/, '')))
    .filter(c => c !== null && c !== undefined);
  if (chromas.length < 6) return null; // not enough evidence

  const scored = [];
  for (const [code, entry] of Object.entries(KEY_FROM_COUNT)) {
    const scale = Scale.get(`${entry.major.split(' ')[0]} major`);
    if (!scale?.notes?.length) continue;
    const scaleChromas = new Set(scale.notes.map(n => Note.chroma(n)));
    const inScale = chromas.filter(c => scaleChromas.has(c)).length;
    const accidentals = code === '0' ? 0 : parseInt(code);
    scored.push({ code, inScale, accidentals });
  }
  scored.sort((a, b) => b.inScale - a.inScale || a.accidentals - b.accidentals);
  const best = scored[0];
  if (!best) return null;

  const flats = best.code.endsWith('b') ? parseInt(best.code) : 0;
  const sharps = best.code.endsWith('s') ? parseInt(best.code) : 0;
  trace?.log('KEY_INFERRED_FROM_NOTES', {
    code: best.code, matched: `${best.inScale}/${chromas.length}`,
    runnersUp: scored.slice(1, 3).map(s => `${s.code}:${s.inScale}`),
  });
  return { flats, sharps, code: best.code, matched: best.inScale, total: chromas.length };
}

// ═══ KEY HYPOTHESIS TOURNAMENT ═══
// Vision counting has a known ±1 error mode. Instead of blindly trusting the voted
// accidental count, run the winner AND its neighbors (±1 accidental) through a
// music-theory scorer. Pure code — the notes get the final say.
//
// Signals per candidate:
//   • vote share      — how much of the weighted read vote it got            (0–3 pts)
//   • final note      — pieces end on the tonic (or dominant) of the real key (0–2.5)
//   • drawn accidentals — a repeatedly-drawn accidental that belongs to a
//     NEIGHBOR's key signature means the signature was undercounted           (0–2/each)
//   • note fit        — extracted pitches that clash with a candidate's scale
//     count against it                                                        (−0.75/clash)
function keyHypothesisTournament(votedFlats, votedSharps, voteShare, allNotes = [], drawnAccidentals = [], lastNote = null, trace = null) {
  const codeOf = (f, s) => (s > 0 ? `${s}s` : f > 0 ? `${f}b` : '0');
  const votedCode = codeOf(votedFlats, votedSharps);

  // Candidate set: voted count and its ±1 neighbors on the circle of fifths
  const ORDER = ['7b','6b','5b','4b','3b','2b','1b','0','1s','2s','3s','4s','5s','6s','7s'];
  const idx = ORDER.indexOf(votedCode);
  if (idx === -1) return { flats: votedFlats, sharps: votedSharps, changed: false };
  const candidates = [ORDER[idx - 1], ORDER[idx], ORDER[idx + 1]].filter(Boolean);

  const noteChromas = allNotes
    .map(n => Note.chroma(String(n).trim().replace(/\d+$/, '')))
    .filter(c => c !== null && c !== undefined);

  // Parse drawn accidentals like 'Eb4', 'F#5' ('n' naturals carry no signature evidence)
  const drawnPcs = (drawnAccidentals || [])
    .map(a => String(a).trim().replace(/\d+$/, ''))
    .filter(a => /[b#]$/.test(a));

  const scores = candidates.map(code => {
    const entry = KEY_FROM_COUNT[code];
    if (!entry) return { code, score: -Infinity };
    const majorTonic = entry.major.split(' ')[0];
    const minorTonic = entry.minor.split(' ')[0];
    const scale = Scale.get(`${majorTonic} major`);
    const scaleChromas = new Set(scale.notes.map(n => Note.chroma(n)));
    const signaturePcs = new Set(scale.notes.filter(n => /[b#]/.test(n)));

    let score = 0;
    const detail = { code };

    // 1. Vote share — the voted candidate carries its electoral weight
    if (code === votedCode) { score += 3 * voteShare; detail.voteBonus = +(3 * voteShare).toFixed(2); }

    // 2. Final note is the strongest tonality anchor
    if (lastNote) {
      const lastChroma = Note.chroma(String(lastNote).replace(/\d+$/, ''));
      if (lastChroma === Note.chroma(majorTonic) || lastChroma === Note.chroma(minorTonic)) {
        score += 2.5; detail.finalNoteTonic = true;
      } else if (lastChroma === (Note.chroma(majorTonic) + 7) % 12) {
        score += 1; detail.finalNoteDominant = true;
      }
    }

    // 3. Drawn accidentals that live in THIS candidate's signature are evidence the
    //    engraver drew them because the (undercounted) signature was missing them.
    let accHits = 0;
    for (const pc of drawnPcs) if (signaturePcs.has(pc)) accHits++;
    if (accHits) { score += Math.min(accHits * 2, 4); detail.drawnAccidentalHits = accHits; }

    // 4. Extracted notes clashing with the candidate's scale count against it
    const clashes = noteChromas.filter(c => !scaleChromas.has(c)).length;
    score -= clashes * 0.75;
    detail.noteClashes = clashes;

    detail.score = +score.toFixed(2);
    return { code, score, detail };
  });

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];
  trace?.log('KEY_TOURNAMENT', { voted: votedCode, ranking: scores.map(s => s.detail) });

  if (winner.code !== votedCode) {
    console.log(`[Solfai] Tournament overturned key vote: ${votedCode} → ${winner.code}`);
  }
  return {
    flats: winner.code.endsWith('b') ? parseInt(winner.code) : 0,
    sharps: winner.code.endsWith('s') ? parseInt(winner.code) : 0,
    changed: winner.code !== votedCode,
    margin: scores.length > 1 ? +(winner.score - scores[1].score).toFixed(2) : 99,
  };
}

// Apply a key signature to extracted note letters in code — fixes signature-blind
// extraction (Gemini reading 'E5' off the staff position when the key makes it Eb5).
// Letters carrying an explicit accidental or natural marker are left untouched.
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
function applyKeySignatureToNotes(notes = [], flats = 0, sharps = 0) {
  if (!flats && !sharps) return notes;
  const altered = new Set(flats > 0 ? FLAT_ORDER.slice(0, flats) : SHARP_ORDER.slice(0, sharps));
  const mark = flats > 0 ? 'b' : '#';
  return notes.map(n => {
    const s = String(n).trim();
    const m = s.match(/^([A-Ga-g])(n|b|#|bb|##)?(\d*)$/);
    if (!m) return s;
    const [, letter, acc, oct] = m;
    if (acc === 'n') return letter.toUpperCase() + (oct || ''); // explicit natural
    if (acc) return s;                                          // already marked
    if (altered.has(letter.toUpperCase())) return letter.toUpperCase() + mark + (oct || '');
    return s;
  });
}

function resolveKeyFromCounts(flatCount, sharpCount, allNotes = [], firstNotes = [], lastNote = null, trace = null) {
  let code;
  if (sharpCount > 0) code = `${sharpCount}s`;
  else if (flatCount > 0) code = `${flatCount}b`;
  else code = '0';

  const entry = KEY_FROM_COUNT[code];
  if (!entry) {
    // Count out of range — default to C major rather than trusting raw Gemini text strings
    return { key: 'C major', confident: false, codeSaid: 'C major', minorVoteRatio: 0 };
  }

  // Major/minor is computed from the notes (final note + leading tone + tonic
  // frequency), NOT from AI voting or title keywords.
  const modeResult = detectModeFromNotes(flatCount, sharpCount, allNotes, firstNotes, lastNote, trace);
  const keyName = modeResult.mode === 'minor' ? entry.minor : entry.major;

  const accLabel = sharpCount > 0 ? `${sharpCount} sharp${sharpCount > 1 ? 's' : ''}` :
    flatCount > 0 ? `${flatCount} flat${flatCount > 1 ? 's' : ''}` : 'no sharps or flats';

  // minorVoteRatio preserved for downstream compatibility: now derived from the
  // mode-detection confidence (likelihood the piece is minor).
  const minorVoteRatio = modeResult.mode === 'minor' ? modeResult.confidence : (1 - modeResult.confidence);

  console.log(`[Solfai] Mode detect: ${keyName} (${modeResult.mode}, confidence ${Math.round(modeResult.confidence * 100)}%)`);

  return {
    key: `${keyName} (${accLabel})`,
    confident: modeResult.confidence >= 0.4,
    codeSaid: keyName,
    minorVoteRatio,
  };
}

// ─── Weighted Majority Voting ─────────────────────────────
// Each vote has a value and a weight. Returns the value with highest total weight.
function weightedVote(votes) {
  const tally = {};
  for (const { value, weight } of votes) {
    if (value == null || value === '' || value === undefined) continue;
    const key = String(value).trim().toLowerCase();
    if (!tally[key]) tally[key] = { value: String(value).trim(), totalWeight: 0, count: 0 };
    tally[key].totalWeight += weight;
    tally[key].count++;
  }

  let best = null;
  for (const entry of Object.values(tally)) {
    if (!best || entry.totalWeight > best.totalWeight) best = entry;
  }
  return best ? best.value : null;
}

// Returns the winner AND the confidence margin (0.5=tie, 1.0=unanimous)
function weightedVoteWithMargin(votes) {
  const tally = {};
  for (const { value, weight } of votes) {
    if (value == null || value === '' || value === undefined) continue;
    const key = String(value).trim().toLowerCase();
    if (!tally[key]) tally[key] = { value: String(value).trim(), totalWeight: 0, count: 0 };
    tally[key].totalWeight += weight;
    tally[key].count++;
  }

  const sorted = Object.values(tally).sort((a, b) => b.totalWeight - a.totalWeight);
  if (!sorted.length) return { value: null, margin: 0, isUnanimous: false, isTie: false };

  const totalWeight = sorted.reduce((s, e) => s + e.totalWeight, 0);
  const margin = totalWeight > 0 ? sorted[0].totalWeight / totalWeight : 0;

  return {
    value: sorted[0].value,
    margin,                       // 0.5 = pure tie, 1.0 = unanimous
    isUnanimous: margin > 0.99,
    isTie: sorted.length > 1 && Math.abs(sorted[0].totalWeight - sorted[1].totalWeight) < 0.01,
    runnerUp: sorted[1]?.value || null,
    runnerUpMargin: totalWeight > 0 ? (sorted[1]?.totalWeight || 0) / totalWeight : 0,
  };
}

// ─── Enharmonic Equivalence ───────────────────────────────
const ENHARMONIC_MAP = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#',
  'E#': 'F', 'Fb': 'E',
  'B#': 'C', 'Cb': 'B',
};

function areEnharmonic(note1, note2) {
  if (!note1 || !note2) return false;
  const pc1 = note1.replace(/\d+$/, '');
  const pc2 = note2.replace(/\d+$/, '');
  const oct1 = note1.match(/\d+$/)?.[0];
  const oct2 = note2.match(/\d+$/)?.[0];
  if (pc1 === pc2 && oct1 === oct2) return true;

  const midi1 = Note.midi(note1);
  const midi2 = Note.midi(note2);
  if (midi1 !== null && midi2 !== null) return midi1 === midi2;

  return false;
}

// Pick the enharmonic spelling that matches the key signature
function correctEnharmonicForKey(noteName, tonic) {
  if (!noteName || !tonic) return noteName;

  const scaleInfo = Scale.get(`${tonic} major`);
  const scaleNotes = scaleInfo.notes || [];
  const scalePCs = new Set(scaleNotes.map(n => Note.get(n).pc));

  const pc = noteName.replace(/\d+$/, '');
  const oct = noteName.match(/\d+$/)?.[0] || '';

  if (scalePCs.has(pc)) return noteName;

  const enharm = ENHARMONIC_MAP[pc];
  if (enharm && scalePCs.has(enharm)) return enharm + oct;

  return noteName;
}

// ─── Solfege from note names (CODE, not AI) ───────────────
const NOTE_TO_SEMI = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };

function noteToSolfege(noteName, tonicName) {
  if (!noteName || !tonicName) return '?';
  const getSemi = (n) => {
    const letter = n[0].toUpperCase();
    let s = NOTE_TO_SEMI[letter];
    if (s == null) return null;
    for (let i = 1; i < n.length; i++) {
      if (n[i] === '#' || n[i] === '♯') s++;
      if (n[i] === 'b' || n[i] === '♭') s--;
    }
    return ((s % 12) + 12) % 12;
  };
  const ts = getSemi(tonicName);
  const ns = getSemi(noteName);
  if (ts == null || ns == null) return '?';
  const interval = ((ns - ts) % 12 + 12) % 12;
  const map = { 0: 'Do', 2: 'Re', 4: 'Mi', 5: 'Fa', 7: 'Sol', 9: 'La', 11: 'Ti', 1: 'Di', 3: 'Me', 6: 'Fi', 8: 'Si', 10: 'Te' };
  return map[interval] || '?';
}

// ─── Interval and Scale Degree Helpers ────────────────────
function getIntervalName(note1, note2) {
  const midi1 = Note.midi(note1);
  const midi2 = Note.midi(note2);
  if (midi1 === null || midi2 === null) return null;
  const semitones = midi2 - midi1;
  const direction = semitones > 0 ? 'up' : semitones < 0 ? 'down' : '';
  const abs = Math.abs(semitones);
  const names = { 0:'P1', 1:'m2', 2:'M2', 3:'m3', 4:'M3', 5:'P4', 6:'TT', 7:'P5', 8:'m6', 9:'M6', 10:'m7', 11:'M7', 12:'P8' };
  const name = names[abs] || (abs > 12 ? names[abs % 12] + ' (compound)' : `${abs} semitones`);
  return direction ? `${name} ${direction}` : 'unison';
}

function noteToScaleDegree(noteName, tonicName) {
  if (!noteName || !tonicName) return null;
  const solfege = noteToSolfege(noteName, tonicName);
  const map = { 'Do':1, 'Re':2, 'Mi':3, 'Fa':4, 'Sol':5, 'La':6, 'Ti':7, 'Di':'#1', 'Me':'b3', 'Fi':'#4', 'Si':'#5', 'Te':'b7' };
  return map[solfege] || null;
}

// ─── Note-by-Note Reconciliation ──────────────────────────
// Instead of comparing entire measure strings, compare individual notes
// across multiple extractions and pick the winner for each position.
function noteByNoteReconcile(measureSets, tonic, voicePart) {
  const maxMeasures = Math.max(...measureSets.map(s => s.length));
  const reconciled = [];
  const range = VOCAL_RANGES[voicePart] || VOCAL_RANGES['Soprano'];

  for (let mIdx = 0; mIdx < maxMeasures; mIdx++) {
    const candidates = measureSets.map(s => s[mIdx]).filter(Boolean);
    if (!candidates.length) continue;

    // Find the measure with the most notes (likely most complete)
    const maxNotes = Math.max(...candidates.map(c => (c.notes || []).length));

    const reconciledNotes = [];
    const noteConfidences = [];

    for (let nIdx = 0; nIdx < maxNotes; nIdx++) {
      const noteVotes = [];

      for (let cIdx = 0; cIdx < candidates.length; cIdx++) {
        const notes = candidates[cIdx].notes || [];
        if (nIdx < notes.length && notes[nIdx] !== '[?]') {
          // Determine weight based on which extraction this is
          // First 3 are Pro (weight 2), last 2 are Flash (weight 1)
          const weight = cIdx < 3 ? WEIGHT_PRO : WEIGHT_FLASH;
          noteVotes.push({ value: notes[nIdx], weight });
        }
      }

      if (noteVotes.length === 0) {
        reconciledNotes.push('[?]');
        noteConfidences.push('low');
        continue;
      }

      // Group votes by enharmonic equivalence
      const groups = [];
      for (const vote of noteVotes) {
        let found = false;
        for (const group of groups) {
          if (areEnharmonic(group.canonical, vote.value)) {
            group.totalWeight += vote.weight;
            group.count++;
            found = true;
            break;
          }
        }
        if (!found) {
          groups.push({ canonical: vote.value, totalWeight: vote.weight, count: 1 });
        }
      }

      groups.sort((a, b) => b.totalWeight - a.totalWeight);
      let winner = groups[0].canonical;

      // Correct enharmonic spelling for key
      winner = correctEnharmonicForKey(winner, tonic);

      // Validate against vocal range
      const midi = Note.midi(winner);
      if (midi !== null) {
        if (midi < range.low - 3 && midi + 12 <= range.high + 3) {
          const pc = Note.get(winner).pc;
          const oct = Note.get(winner).oct;
          winner = pc + (oct + 1);
        } else if (midi > range.high + 3 && midi - 12 >= range.low - 3) {
          const pc = Note.get(winner).pc;
          const oct = Note.get(winner).oct;
          winner = pc + (oct - 1);
        }
      }

      reconciledNotes.push(winner);

      // Confidence based on agreement
      const totalVotes = noteVotes.length;
      const winnerWeight = groups[0].totalWeight;
      const totalWeight = noteVotes.reduce((s, v) => s + v.weight, 0);

      if (totalVotes >= 3 && winnerWeight >= totalWeight * 0.8) {
        noteConfidences.push('high');
      } else if (totalVotes >= 2 && winnerWeight >= totalWeight * 0.5) {
        noteConfidences.push('medium');
      } else {
        noteConfidences.push('low');
      }
    }

    // Pick best lyrics from candidates
    const lyrics = candidates.map(c => c.lyrics || '').sort((a, b) => b.length - a.length)[0] || '';

    const measureNum = candidates[0].num ?? (mIdx + 1);
    const hasDisagreement = noteConfidences.some(c => c === 'low' || c === 'medium');
    const overallConfidence = noteConfidences.every(c => c === 'high') ? 'high' :
      noteConfidences.some(c => c === 'low') ? 'low' : 'medium';

    reconciled.push({
      num: measureNum,
      notes: reconciledNotes,
      lyrics,
      confidence: overallConfidence,
      disagreement: hasDisagreement,
      noteConfidences,
    });
  }

  return reconciled;
}

// ─── Music Theory Validation (enhanced with enharmonic awareness) ──
const VOCAL_RANGES = {
  'Soprano': { low: 60, high: 79 },  // C4-G5
  'Alto': { low: 55, high: 76 },     // G3-E5
  'Tenor': { low: 48, high: 69 },    // C3-A4
  'Bass': { low: 40, high: 64 },     // E2-E4
};

function validateAndFixNotes(measures, tonic, voicePart) {
  const range = VOCAL_RANGES[voicePart] || VOCAL_RANGES['Soprano'];
  let corrections = 0;

  const scaleName = `${tonic} major`;
  const scaleInfo = Scale.get(scaleName);
  const scaleNotes = scaleInfo.notes.length > 0 ? scaleInfo.notes : [];

  const keyAccidentals = {};
  for (const sn of scaleNotes) {
    const parsed = Note.get(sn);
    if (parsed.acc) {
      keyAccidentals[parsed.letter] = parsed.acc;
    }
  }

  // Build set of valid pitch classes in the key (for diatonic checking)
  const diatonicPCs = new Set(scaleNotes.map(n => Note.get(n).pc));

  for (const m of measures) {
    if (!m.notes || !m.notes.length) continue;
    const fixed = [];

    for (let i = 0; i < m.notes.length; i++) {
      let n = m.notes[i];
      if (n === '[?]') { fixed.push(n); continue; }

      const parsed = Note.get(n);
      if (!parsed.midi) { fixed.push(n); continue; }

      // Fix 1: Enharmonic correction — use spelling that matches key
      const correctedEnharm = correctEnharmonicForKey(n, tonic);
      if (correctedEnharm !== n) {
        n = correctedEnharm;
        corrections++;
      }

      // Fix 2: Key signature accidental enforcement
      // ONLY apply if neighbors are diatonic — a natural surrounded by diatonic notes is likely a misread.
      // If surrounded by non-diatonic notes, the natural is likely intentional (Picardy third, borrowed chord, etc.)
      const reParsed = Note.get(n);
      if (!reParsed.acc && keyAccidentals[reParsed.letter]) {
        const prevRaw = i > 0 ? m.notes[i - 1] : null;
        const nextRaw = i < m.notes.length - 1 ? m.notes[i + 1] : null;
        const prevDiatonic = !prevRaw || prevRaw === '[?]' || diatonicPCs.has(Note.get(prevRaw).pc);
        const nextDiatonic = !nextRaw || nextRaw === '[?]' || diatonicPCs.has(Note.get(nextRaw).pc);

        // Only auto-correct if BOTH neighbors are diatonic (isolated natural = likely misread)
        // If a neighbor is also non-diatonic, this is likely borrowed chord territory — leave it alone
        if (prevDiatonic && nextDiatonic) {
          const corrected = reParsed.letter + keyAccidentals[reParsed.letter] + reParsed.oct;
          const corrMidi = Note.midi(corrected);
          if (corrMidi && corrMidi >= range.low - 5 && corrMidi <= range.high + 5) {
            n = corrected;
            corrections++;
          }
        }
      }

      // Fix 3: Octave plausibility — snap to vocal range
      let midi = Note.midi(n);
      if (midi !== null) {
        if (midi < range.low - 3 && midi + 12 <= range.high + 3) {
          n = Note.get(n).pc + (Note.get(n).oct + 1);
          corrections++;
        } else if (midi > range.high + 3 && midi - 12 >= range.low - 3) {
          n = Note.get(n).pc + (Note.get(n).oct - 1);
          corrections++;
        }
      }

      // Fix 4: Interval smoothing — if jump > major 9th, try other octave
      if (i > 0 && fixed[i - 1] !== '[?]') {
        const prevMidi = Note.midi(fixed[i - 1]);
        const currMidi = Note.midi(n);
        if (prevMidi !== null && currMidi !== null) {
          const jump = Math.abs(currMidi - prevMidi);
          if (jump > 14) {
            const up = currMidi + 12;
            const down = currMidi - 12;
            const jumpUp = Math.abs(up - prevMidi);
            const jumpDown = Math.abs(down - prevMidi);
            if (jumpDown < jump && down >= range.low - 2) {
              n = Note.get(n).pc + (Note.get(n).oct - 1);
              corrections++;
            } else if (jumpUp < jump && up <= range.high + 2) {
              n = Note.get(n).pc + (Note.get(n).oct + 1);
              corrections++;
            }
          }
        }
      }

      // Fix 5: Chromatic passing tone detection
      // If a non-diatonic note appears between two diatonic notes a step apart,
      // it's likely a chromatic passing tone — leave it alone. But if it's
      // isolated and could be a misread, check if the diatonic version fits better.
      if (i > 0 && i < m.notes.length - 1) {
        const pc = Note.get(n).pc;
        if (!diatonicPCs.has(pc)) {
          const prevNote = fixed[i - 1];
          const nextNote = m.notes[i + 1];
          const prevMidi = Note.midi(prevNote);
          const nextMidi = Note.midi(nextNote);
          const currMidi = Note.midi(n);

          if (prevMidi && nextMidi && currMidi) {
            const isPassing = (
              (currMidi > prevMidi && currMidi < nextMidi) ||
              (currMidi < prevMidi && currMidi > nextMidi)
            ) && Math.abs(currMidi - prevMidi) <= 2 && Math.abs(nextMidi - currMidi) <= 2;

            // If NOT a chromatic passing tone, it might be a misread
            if (!isPassing) {
              // Check if natural version is diatonic and in range
              const natural = Note.get(n).letter + (Note.get(n).oct || '');
              const naturalMidi = Note.midi(natural);
              if (naturalMidi && diatonicPCs.has(Note.get(natural).pc) &&
                  naturalMidi >= range.low - 2 && naturalMidi <= range.high + 2) {
                // Also check with key accidental
                const withKeyAcc = keyAccidentals[Note.get(n).letter]
                  ? Note.get(n).letter + keyAccidentals[Note.get(n).letter] + Note.get(n).oct
                  : natural;
                if (diatonicPCs.has(Note.get(withKeyAcc).pc)) {
                  n = withKeyAcc;
                  corrections++;
                }
              }
            }
          }
        }
      }

      fixed.push(n);
    }

    m.notes = fixed;
    m.theoryCorrected = corrections > 0;
  }

  return corrections;
}

// ─── Duration-Aware Validation ───────────────────────────
// Checks if note durations in each measure sum to the time signature
const DURATION_VALUES = {
  'whole': 4, 'half': 2, 'dotted half': 3, 'quarter': 1, 'dotted quarter': 1.5,
  'eighth': 0.5, 'dotted eighth': 0.75, 'sixteenth': 0.25, 'dotted sixteenth': 0.375,
  'half note': 2, 'quarter note': 1, 'eighth note': 0.5, 'sixteenth note': 0.25,
  'w': 4, 'h': 2, 'q': 1, 'e': 0.5, 's': 0.25,
  '1': 4, '2': 2, '4': 1, '8': 0.5, '16': 0.25,
};

function parseDurationBeats(durStr) {
  if (!durStr) return null;
  const lower = durStr.toLowerCase().trim();
  return DURATION_VALUES[lower] || null;
}

function getBeatsPerMeasure(timeSig) {
  if (!timeSig) return 4;
  const parts = timeSig.split('/');
  if (parts.length !== 2) return 4;
  const num = parseInt(parts[0]);
  const denom = parseInt(parts[1]);
  if (isNaN(num) || isNaN(denom)) return 4;
  return num * (4 / denom);
}

function validateDurations(measures, timeSig) {
  const expectedBeats = getBeatsPerMeasure(timeSig);
  let warnings = 0;

  for (const m of measures) {
    if (!m.durations || !m.durations.length) continue;

    let totalBeats = 0;
    for (const dur of m.durations) {
      const beats = parseDurationBeats(dur);
      if (beats !== null) totalBeats += beats;
    }

    if (totalBeats > 0 && Math.abs(totalBeats - expectedBeats) > 0.25) {
      m.durationWarning = `Durations sum to ${totalBeats} beats, expected ${expectedBeats} in ${timeSig}`;
      warnings++;
    }
  }

  return warnings;
}

// ─── Image Quality Assessment ─────────────────────────────
// Analyzes image quality before sending to Gemini: resolution, contrast, sharpness
async function assessImageQuality(base64Data) {
  try {
    const buf = Buffer.from(base64Data, 'base64');
    const meta = await sharp(buf).metadata();
    const { width, height, channels, size } = meta;

    // Resolution score (0-100): minimum 600px wide for readable music
    const minDim = Math.min(width, height);
    const resolutionScore = Math.min(100, Math.round((minDim / 1200) * 100));

    // Contrast/sharpness via stats on grayscale version
    const stats = await sharp(buf).grayscale().stats();
    const channel = stats.channels[0];

    // Standard deviation of pixel values — higher = better contrast for sheet music
    // Sheet music typically has high contrast (black on white), stdev should be > 60
    const contrastScore = Math.min(100, Math.round((channel.stdev / 80) * 100));

    // Check if image is mostly white (expected for sheet music) or dark (phone photo in low light)
    const meanBrightness = channel.mean;
    const brightnessScore = meanBrightness > 200 ? 100 :
      meanBrightness > 150 ? 80 :
      meanBrightness > 100 ? 50 : 20;

    // File size check — very small files are likely low quality
    const sizeScore = size > 500000 ? 100 : size > 100000 ? 70 : size > 30000 ? 40 : 15;

    // Composite score
    const overall = Math.round(
      resolutionScore * 0.35 +
      contrastScore * 0.30 +
      brightnessScore * 0.20 +
      sizeScore * 0.15
    );

    // Determine quality tier and advice
    let tier, advice;
    if (overall >= 75) {
      tier = 'good';
      advice = null;
    } else if (overall >= 50) {
      tier = 'fair';
      advice = 'Image quality is moderate. For best results, use a flatbed scanner or a well-lit, straight-on photo.';
    } else {
      tier = 'poor';
      advice = 'Image quality is low. Try: (1) scanning the sheet music with a flatbed scanner, (2) taking a photo in bright, even lighting without shadows, (3) using a higher resolution camera.';
    }

    // Detect likely phone photo vs scan
    const isPhonePhoto = meanBrightness < 180 && channel.stdev < 70;

    return {
      width, height,
      resolution: resolutionScore,
      contrast: contrastScore,
      brightness: brightnessScore,
      overall,
      tier,
      advice,
      isPhonePhoto,
      needsEnhancement: overall < 70,
    };
  } catch (e) {
    console.warn('[Solfai] Image quality assessment failed:', e.message);
    return { overall: 50, tier: 'unknown', advice: null, isPhonePhoto: false, needsEnhancement: false };
  }
}

// ─── Adaptive Preprocessing Strategy ─────────────────────
// Selects the best preprocessing mode based on image characteristics
function selectPreprocessingStrategy(quality) {
  if (quality.isPhonePhoto) {
    return { primary: 'high_contrast', secondary: 'binarize', weight: 'high_contrast' };
  }
  if (quality.contrast < 40) {
    return { primary: 'high_contrast', secondary: 'binarize', weight: 'high_contrast' };
  }
  if (quality.overall >= 80) {
    return { primary: 'full', secondary: 'full', weight: 'full' };
  }
  return { primary: 'binarize', secondary: 'high_contrast', weight: 'binarize' };
}

// ─── Image preprocessing with sharp ───────────────────────
async function preprocessForGemini(base64Data, mode = 'full') {
  try {
    const buf = Buffer.from(base64Data, 'base64');
    let pipeline;

    if (mode === 'key_region') {
      // Crop first 20% of width × first 20% of height — exactly the key sig zone between clef and time sig
      const meta = await sharp(buf).metadata();
      pipeline = sharp(buf)
        .extract({
          left: 0, top: 0,
          width: Math.floor(meta.width * 0.20),
          height: Math.floor(meta.height * 0.20)
        })
        .resize({ width: 2400 })  // high-res zoom for counting accidentals
        .grayscale()
        .normalise()
        .sharpen({ sigma: 2.5 })
        .threshold()  // Otsu's method
        .jpeg({ quality: 97 });
    } else if (mode === 'time_sig_region') {
      // Crop first 25% width × first 25% height — covers both key sig and time sig area
      // Upscale to 2400px so the stacked numbers are clearly visible
      const meta = await sharp(buf).metadata();
      pipeline = sharp(buf)
        .extract({
          left: 0, top: 0,
          width: Math.floor(meta.width * 0.25),
          height: Math.floor(meta.height * 0.25)
        })
        .resize({ width: 2400 })
        .grayscale()
        .normalise()
        .linear(1.5, -30)  // boost contrast to make numbers crisp
        .sharpen({ sigma: 2.0 })
        .jpeg({ quality: 97 });
    } else if (mode === 'key_region_extreme') {
      // 7x zoom into ONLY the key signature zone for desperate retries (left 12% x top 15%)
      const meta = await sharp(buf).metadata();
      pipeline = sharp(buf)
        .extract({
          left: Math.floor(meta.width * 0.03),
          top: Math.floor(meta.height * 0.01),
          width: Math.floor(meta.width * 0.12),
          height: Math.floor(meta.height * 0.15)
        })
        .resize({ width: 2400 })  // extreme zoom
        .grayscale()
        .linear(2.0, -50)         // aggressive contrast boost before thresholding
        .threshold()              // Otsu
        .jpeg({ quality: 99 });
    } else if (mode === 'first_system') {
      // Crop to first ~30% of height for starting pitch detection
      const meta = await sharp(buf).metadata();
      pipeline = sharp(buf)
        .extract({
          left: 0, top: 0,
          width: meta.width,
          height: Math.floor(meta.height * 0.3)
        })
        .resize({ width: 1600 })
        .grayscale()
        .normalise()
        .sharpen({ sigma: 2.0 })
        .threshold()  // Otsu
        .jpeg({ quality: 96 });
    } else if (mode === 'binarize') {
      pipeline = sharp(buf)
        .grayscale()
        .normalise()
        .sharpen({ sigma: 2.0 })
        .threshold()  // Otsu
        .jpeg({ quality: 95 });
    } else if (mode === 'high_contrast') {
      // Maximum contrast for difficult images — linear boost then Otsu
      pipeline = sharp(buf)
        .grayscale()
        .normalise()
        .linear(1.8, -40)  // boost contrast before threshold
        .sharpen({ sigma: 3.0 })
        .threshold()       // Otsu on boosted image
        .jpeg({ quality: 97 });
    } else if (mode === 'annotated') {
      // Red semi-transparent rectangle overlay on key signature area (top-left 35% x 22%)
      const meta = await sharp(buf).metadata();
      const overlayWidth = Math.floor(meta.width * 0.35);
      const overlayHeight = Math.floor(meta.height * 0.22);
      const overlaySvg = Buffer.from(
        `<svg width="${overlayWidth}" height="${overlayHeight}">
          <rect x="0" y="0" width="${overlayWidth}" height="${overlayHeight}"
                fill="red" fill-opacity="0.25" stroke="red" stroke-width="4" stroke-opacity="0.8"/>
        </svg>`
      );
      pipeline = sharp(buf)
        .composite([{
          input: overlaySvg,
          top: 0,
          left: 0,
        }])
        .sharpen({ sigma: 1.5 })
        .jpeg({ quality: 95 });
    } else if (mode === 'first_2_measures') {
      // Crop left 50% width x top 30% height, resize to 2000px wide for 2x zoom
      const meta = await sharp(buf).metadata();
      pipeline = sharp(buf)
        .extract({
          left: 0, top: 0,
          width: Math.floor(meta.width * 0.5),
          height: Math.floor(meta.height * 0.3)
        })
        .resize({ width: 2000 })
        .grayscale()
        .normalise()
        .sharpen({ sigma: 2.5 })
        .jpeg({ quality: 97 });
    } else {
      pipeline = sharp(buf)
        .grayscale()
        .normalise()
        .sharpen({ sigma: 1.5 })
        .jpeg({ quality: 92 });
    }

    const processed = await pipeline.toBuffer();
    return processed.toString('base64');
  } catch (e) {
    console.error('[Solfai] Preprocessing failed, using original:', e.message);
    return base64Data;
  }
}

// ─── Image segmentation for tall images ───────────────────
async function segmentImage(base64Data, maxSegments = 4) {
  try {
    const buf = Buffer.from(base64Data, 'base64');
    const meta = await sharp(buf).metadata();

    if (meta.height < meta.width * 0.8 || meta.height < 800) {
      return null;
    }

    const numSegments = Math.min(maxSegments, Math.ceil(meta.height / (meta.width * 0.35)));
    if (numSegments <= 1) return null;

    const overlapPx = Math.floor(meta.height * 0.03); // 3% overlap to avoid cutting through staves
    const segmentHeight = Math.ceil(meta.height / numSegments);
    const segments = [];

    for (let i = 0; i < numSegments; i++) {
      const top = Math.max(0, i * segmentHeight - (i > 0 ? overlapPx : 0));
      const height = Math.min(segmentHeight + overlapPx, meta.height - top);
      if (height < 100) break;

      const segBuf = await sharp(buf)
        .extract({ left: 0, top, width: meta.width, height })
        .grayscale()
        .normalise()
        .sharpen({ sigma: 2.0 })
        .threshold(160)
        .jpeg({ quality: 95 })
        .toBuffer();

      segments.push(segBuf.toString('base64'));
    }

    return segments.length > 1 ? segments : null;
  } catch (e) {
    console.error('[Solfai] Segmentation failed:', e.message);
    return null;
  }
}

// ─── Image builder ────────────────────────────────────────
function buildImageParts(imageBase64, imageMime, pdfPages) {
  const parts = [];

  // PDF handling: ALWAYS prefer rendered JPEG pages over raw PDF binary.
  // Gemini handles JPEG images much more reliably than raw PDF data.
  if (pdfPages?.length > 0) {
    for (const page of pdfPages.slice(0, 5)) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: page } });
    }
    return parts;
  }

  // For PDFs without pre-rendered pages, send the raw PDF as fallback
  if (imageMime === 'application/pdf' && imageBase64) {
    parts.push({ inlineData: { mimeType: 'application/pdf', data: imageBase64 } });
    return parts;
  }

  // Regular image
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: imageMime || 'image/jpeg', data: imageBase64 } });
  }
  return parts;
}

// Watermark ignore instruction — added to EVERY prompt sent to Gemini
const WATERMARK_NOTE = `IMPORTANT: This image may contain watermark text printed diagonally across the page saying things like "For perusal purposes only" or "Preview copy" or similar. Completely ignore all watermark text — it is not part of the music. Do not let it affect your reading of any musical symbols, notes, or markings.`;

// ─── Gemini caller with retry + exponential backoff ───────
async function callGemini(apiKey, systemPrompt, userParts, opts = {}) {
  const {
    temperature = 0,
    maxOutputTokens = 16384,
    model = GEMINI_MODEL,
    responseSchema = null,
    tools = null,
    thinkingBudget = 8000,
    trace = null,
    label = model,
  } = opts;

  // Consistent diagnostic logging for failures/retries/empty responses. Uses the
  // trace format when a trace is supplied, otherwise plain console. This is how we
  // catch "one of the N voting calls silently failed and skewed the vote".
  const logCall = (data) => {
    if (trace) trace.warn('CALLGEMINI', { label, ...data });
    else console.warn(`[SOLFAI][CALLGEMINI][${label}]`, JSON.stringify(data));
  };

  const url = geminiUrl(model);

  const genConfig = {
    temperature,
    max_output_tokens: maxOutputTokens,
    thinking_config: { thinking_budget: thinkingBudget },
    media_resolution: 'MEDIA_RESOLUTION_HIGH',
  };

  if (responseSchema) {
    genConfig.response_mime_type = 'application/json';
    genConfig.response_schema = responseSchema;
  }

  const body = {
    contents: [{ role: 'user', parts: userParts }],
    system_instruction: { parts: [{ text: systemPrompt }] },
    generation_config: genConfig,
  };

  if (tools) body.tools = tools;

  const maxAttempts = 3;
  let maxTokensHits = 0;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: geminiHeaders(apiKey),
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        let detail = `Gemini error: ${resp.status}`;
        try { detail = JSON.parse(errText).error?.message || detail; } catch (e) { /* ignore */ }

        if ((resp.status === 429 || resp.status >= 500) && attempt < maxAttempts) {
          const delay = attempt * 2000;
          logCall({ attempt, maxAttempts, status: resp.status, retrying: true, delayMs: delay });
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        logCall({ attempt, maxAttempts, status: resp.status, retrying: false, fatal: true, detail });
        throw new Error(detail);
      }

      const data = await resp.json();
      const candidate = data.candidates?.[0];

      // Check for blocked/empty responses
      if (!candidate) {
        const blockReason = data.promptFeedback?.blockReason;
        if (blockReason) {
          console.warn(`[Solfai] Gemini blocked: ${blockReason}`);
          throw new Error(`Gemini blocked response: ${blockReason}`);
        }
        throw new Error('No candidates in Gemini response');
      }

      const finishReason = candidate.finishReason;
      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        console.warn(`[Solfai] Gemini finish reason: ${finishReason}`);
      }

      if (!candidate.content?.parts) {
        logCall({ attempt, status: resp.status, empty: true, finishReason, blockReason: data.promptFeedback?.blockReason });
        // MAX_TOKENS: the model spent its whole budget (often on thinking tokens) and
        // produced no text. Cap output at 8192 — Gemini 2.5 Pro is more reliable at a
        // moderate cap — and retry instead of failing the call.
        if (finishReason === 'MAX_TOKENS') {
          maxTokensHits++;
          if (attempt < maxAttempts) {
            genConfig.max_output_tokens = 8192;
            // Thinking tokens are usually what exhausted the budget — slash them on retry
            // so the model has room to actually answer.
            if (genConfig.thinking_config) {
              genConfig.thinking_config.thinking_budget = Math.min(
                genConfig.thinking_config.thinking_budget ?? 1024, 1024);
            }
            logCall({ attempt, maxTokens: true, retrying: true, newMaxOutputTokens: 8192, newThinkingBudget: genConfig.thinking_config?.thinking_budget });
            await new Promise(r => setTimeout(r, attempt * 1000));
            continue;
          }
          console.warn('[SOLFAI][CALLGEMINI] All attempts failed with MAX_TOKENS — prompt may be too long');
        }
        throw new Error(`Gemini returned empty response (${finishReason || 'unknown'})`);
      }

      const textParts = candidate.content.parts.filter(p => p.text && !p.thought);
      if (!textParts.length) {
        // May have only thought parts — try to use them
        const allText = candidate.content.parts.filter(p => p.text).map(p => p.text).join('').trim();
        if (allText) return allText;
        throw new Error('Gemini returned no text content');
      }

      return textParts.map(p => p.text).join('').trim();

    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = attempt * 2000;
      logCall({ attempt, maxAttempts, networkError: true, retrying: true, delayMs: delay, message: err.message });
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ─── API Route ────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const trace = makeTrace();
  try {
    const { messages, imageBase64, imageMime, pdfPages, mode, selectedPart } = req.body;
    const part = selectedPart || 'Soprano';
    const imageParts = buildImageParts(imageBase64, imageMime, pdfPages);
    if (!imageParts.length && mode !== 'correct') {
      return res.status(400).json({ error: 'No image provided' });
    }

    trace.log('REQUEST', { mode, part, imageCount: imageParts.length, mime: imageMime || 'jpeg', hasPdfPages: !!pdfPages });
    console.log(`[Solfai v10] mode=${mode}, part=${part}, parts=${imageParts.length}, mime=${imageMime || 'jpeg'}`);

    switch (mode) {
      case 'analyze': return await handleAnalyze(res, apiKey, imageParts, part, imageBase64, pdfPages, trace);
      case 'solfege': return await handleSolfege(res, apiKey, imageParts, part, trace);
      case 'rhythm': return await handleRhythm(res, apiKey, imageParts, part, trace);
      case 'chat': return await handleChat(res, apiKey, messages, imageParts, part, trace);
      case 'correct': return handleCorrection(res, req.body);
      default: return res.status(400).json({ error: 'Invalid mode' });
    }
  } catch (err) {
    console.error('[Solfai] Handler error:', err.message);
    const msg = (err.message || '').toLowerCase();
    let userError, errorCode, retryable;

    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
      userError = 'The AI is busy right now. Your request will be automatically retried.';
      errorCode = 'RATE_LIMITED';
      retryable = true;
    } else if (msg.includes('503') || msg.includes('overloaded') || msg.includes('unavailable')) {
      userError = 'The AI service is temporarily overloaded. Please try again in a minute.';
      errorCode = 'SERVICE_OVERLOADED';
      retryable = true;
    } else if (msg.includes('401') || msg.includes('api key') || msg.includes('403')) {
      userError = 'API authentication error. Please contact support.';
      errorCode = 'AUTH_ERROR';
      retryable = false;
    } else if (msg.includes('blocked')) {
      userError = 'The AI flagged this image. Please use a clean, unmodified sheet music scan without annotations or markings.';
      errorCode = 'CONTENT_BLOCKED';
      retryable = false;
    } else if (msg.includes('empty response') || msg.includes('no text content') || msg.includes('no candidates')) {
      userError = "The AI couldn't read this image clearly. Try: (1) a higher resolution scan (300+ DPI), (2) better lighting without shadows, (3) cropping to just the sheet music.";
      errorCode = 'EMPTY_RESPONSE';
      retryable = true;
    } else if (msg.includes('all ai extraction attempts failed')) {
      userError = 'All analysis attempts failed. This usually means the image is too low quality or the AI service is down. Try a clearer scan or wait a few minutes.';
      errorCode = 'ALL_FAILED';
      retryable = true;
    } else if (msg.includes('no image')) {
      userError = 'No image was received. Please upload a photo or PDF of sheet music.';
      errorCode = 'NO_IMAGE';
      retryable = false;
    } else {
      userError = 'Analysis failed. Try re-uploading with a higher quality image (JPG or PNG, 300+ DPI).';
      errorCode = 'UNKNOWN';
      retryable = true;
    }
    trace.warn('FATAL', { message: err.message, code: errorCode });
    trace.summary();
    return res.status(500).json({ error: userError, errorCode, retryable });
  }
});

// ─── Correction endpoint ──────────────────────────────────
function handleCorrection(res, body) {
  const { imageHash, field, value, pieceTitle, composerName } = body;
  if (!imageHash || !field || !value) {
    return res.status(400).json({ error: 'Missing correction data' });
  }

  // 1. Save to per-image corrections cache (used on re-analysis of the same scan)
  const corrections = loadCorrections();
  if (!corrections[imageHash]) corrections[imageHash] = {};
  corrections[imageHash][field] = value;
  corrections[imageHash]._updated = new Date().toISOString();
  saveCorrections(corrections);
  console.log(`[Solfai] Correction cached: ${field}="${value}" for hash ${imageHash}`);

  // 2. Self-healing write-back to piece-database.json.
  //    Only key/time corrections on identified pieces are written back; other
  //    fields (tempo, dynamics, starting pitch) are image-specific and not
  //    catalogued at the piece level.
  let dbUpdated = false;
  const dbField = field === 'keySignature' ? 'key' : field === 'timeSignature' ? 'time' : null;
  if (dbField && pieceTitle && composerName) {
    const match = lookupPieceDb(pieceTitle, composerName);
    if (match) {
      match[dbField] = value;
      match.confidence = 'high';
      match.source = `user correction (${new Date().toISOString().slice(0, 10)})`;
      savePieceDb();
      dbUpdated = true;
      console.log(`[Solfai] Piece DB updated: #${match.id} "${match.title}" ${dbField}="${value}" → high`);
    }
  }

  return res.status(200).json({ ok: true, dbUpdated });
}

// ─── Composite Confidence Score ───────────────────────────
// Numeric 0-100 score combining consensus agreement, image quality, database match, and call success rate
function calculateCompositeConfidence({ keyAgreement, imageQuality, dbMatch, successCount, totalCalls }) {
  let score = 0;

  // Key consensus agreement (40 points)
  if (keyAgreement) score += 40;
  else score += 16;

  // Image quality (25 points max)
  score += Math.round((imageQuality / 100) * 25);

  // Database match bonus (15 points)
  if (dbMatch) score += 15;

  // API call success rate (20 points max)
  const successRate = totalCalls > 0 ? successCount / totalCalls : 0;
  score += Math.round(successRate * 20);

  return Math.min(100, Math.max(0, score));
}

// ═══════════════════════════════════════════════════════════
// ─── Extraction validator ─────────────────────────────────
// Runs after all AI extraction is complete. Returns array of warning objects.
const STANDARD_TIME_SIGS = new Set(['4/4','3/4','2/4','6/8','9/8','12/8','2/2','3/8','3/2','6/4','5/4','7/8','3/2','4/8']);
const VOCAL_RANGE_MIDI = {
  Soprano: { low: 60, high: 79 },  // C4–G5
  Alto:    { low: 55, high: 76 },  // G3–E5
  Tenor:   { low: 48, high: 69 },  // C3–A4
  Bass:    { low: 40, high: 64 },  // E2–E4
};

function validateExtraction(keySignature, timeSignature, notes, part) {
  const warnings = [];

  // 1. Key validation
  if (!keySignature || keySignature === 'Unknown') {
    warnings.push({ field: 'key', level: 'error', message: 'Key signature could not be determined — check the score manually.' });
  } else {
    const validKeys = Object.values(KEY_FROM_COUNT).flatMap(e => [e.major, e.minor]);
    // The display string carries a "(N flats)" suffix — strip it before checking,
    // otherwise every single key looks "unusual".
    const bareKey = keySignature.replace(/\s*\(.*\)\s*$/, '').trim();
    if (!validKeys.includes(bareKey)) {
      warnings.push({ field: 'key', level: 'warning', message: `Key "${keySignature}" is unusual — verify accidental count.` });
    }
  }

  // 2. Time signature validation
  if (!timeSignature || timeSignature === 'Not determined') {
    warnings.push({ field: 'time', level: 'warning', message: 'Time signature not found — defaulted. Check score.' });
  } else if (!STANDARD_TIME_SIGS.has(timeSignature)) {
    warnings.push({ field: 'time', level: 'warning', message: `Time signature "${timeSignature}" is uncommon — verify.` });
  }

  // 3. Vocal range validation — quick MIDI approximation
  if (notes && notes.length > 0) {
    const BASE_MIDI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const range = VOCAL_RANGE_MIDI[part] || VOCAL_RANGE_MIDI.Soprano;
    const outOfRange = [];
    for (const n of notes) {
      if (!n || n === '[?]') continue;
      const m = String(n).match(/^([A-G])([b#]?)(\d)$/);
      if (!m) continue;
      let midi = BASE_MIDI[m[1]] + (parseInt(m[3]) + 1) * 12;
      if (m[2] === '#') midi++;
      if (m[2] === 'b') midi--;
      if (midi < range.low - 2 || midi > range.high + 2) outOfRange.push(n);
    }
    if (outOfRange.length > 3) {
      warnings.push({ field: 'notes', level: 'warning', message: `${outOfRange.length} notes outside ${part} range — possible wrong staff or octave error.` });
    }
  }

  return warnings;
}

// ANALYZE — 5-way consensus + dedicated key/pitch extraction
// ═══════════════════════════════════════════════════════════
async function handleAnalyze(res, apiKey, imageParts, part, rawBase64, pdfPages, trace = null) {
  const hashSrc = pdfPages?.[0] || rawBase64 || '';
  const imgHash = hashImage(hashSrc);
  const corrections = loadCorrections();
  const cached = corrections[imgHash];
  trace?.log('CACHE', { imgHash: imgHash.slice(0, 12), hit: !!cached, cachedFields: cached ? Object.keys(cached) : [] });

  // ═══ IMAGE QUALITY PRE-CHECK ═══
  const firstJpegForQuality = imageParts.find(p => p.inlineData?.mimeType === 'image/jpeg');
  let imageQuality = { overall: 75, tier: 'good', advice: null, isPhonePhoto: false, needsEnhancement: false };
  if (firstJpegForQuality) {
    imageQuality = await assessImageQuality(firstJpegForQuality.inlineData.data);
    console.log(`[Solfai] Image quality: ${imageQuality.overall}/100 (${imageQuality.tier}), phone=${imageQuality.isPhonePhoto}`);
  }

  // ═══ ADAPTIVE PREPROCESSING ═══
  const strategy = selectPreprocessingStrategy(imageQuality);
  const preprocessMode = imageQuality.needsEnhancement ? strategy.primary : 'full';

  // Preprocess images in parallel using adaptive strategy
  const processedParts = await Promise.all(
    imageParts.slice(0, 5).map(async (p) => {
      if (p.inlineData?.mimeType === 'application/pdf') return p;
      if (p.inlineData?.mimeType === 'image/jpeg') {
        try {
          const enhanced = await preprocessForGemini(p.inlineData.data, preprocessMode);
          return { inlineData: { mimeType: 'image/jpeg', data: enhanced } };
        } catch (e) { return p; }
      }
      return p;
    })
  );

  // Prepare specialized image crops IN PARALLEL
  const firstJpeg = imageParts.find(p => p.inlineData?.mimeType === 'image/jpeg');
  let keyRegionParts = [];
  // Key-region crops from up to the first 3 pages — the key signature repeats on
  // every system of every page, so multi-page reads give independent votes and
  // survive cover pages without a rescue pass.
  const allJpegPages = imageParts.filter(p => p.inlineData?.mimeType === 'image/jpeg');
  let keyRegionByPage = [];

  let annotatedKeyParts = [];
  let first2MeasuresParts = [];

  let timeSigRegionParts = [];

  if (firstJpeg) {
    const cropPages = allJpegPages.slice(0, 3);
    const [keyCrops, firstSysData, hiContrast, annotatedData, first2MData, timeSigData] = await Promise.all([
      Promise.all(cropPages.map(p =>
        preprocessForGemini(p.inlineData.data, 'key_region').catch(() => null))),
      preprocessForGemini(firstJpeg.inlineData.data, 'first_system').catch(() => null),
      preprocessForGemini(firstJpeg.inlineData.data, 'high_contrast').catch(() => null),
      preprocessForGemini(firstJpeg.inlineData.data, 'annotated').catch(() => null),
      preprocessForGemini(firstJpeg.inlineData.data, 'first_2_measures').catch(() => null),
      preprocessForGemini(firstJpeg.inlineData.data, 'time_sig_region').catch(() => null),
    ]);
    keyRegionByPage = keyCrops.map((data, i) => data
      ? { part: { inlineData: { mimeType: 'image/jpeg', data } }, page: i + 1 }
      : { part: cropPages[i], page: i + 1 });
    if (keyCrops[0]) keyRegionParts = [{ inlineData: { mimeType: 'image/jpeg', data: keyCrops[0] } }];
    if (hiContrast) {
      processedParts.push({ inlineData: { mimeType: 'image/jpeg', data: hiContrast } });
    }
    if (annotatedData) annotatedKeyParts = [{ inlineData: { mimeType: 'image/jpeg', data: annotatedData } }];
    if (first2MData) first2MeasuresParts = [{ inlineData: { mimeType: 'image/jpeg', data: first2MData } }];
    if (timeSigData) timeSigRegionParts = [{ inlineData: { mimeType: 'image/jpeg', data: timeSigData } }];
  }

  // Extraction phases run in parallel

  const keySigPrompt = `You are a music engraver counting accidentals in a key signature.

${WATERMARK_NOTE}

YOUR ONLY JOB: Count the symbols between the CLEF and the TIME SIGNATURE on the first staff.
- Sharp symbols look like a hashtag # (two vertical lines crossed by two horizontal lines).
- Flat symbols look like a lowercase b with a rounded bottom.
- Count carefully — do NOT guess. Do NOT name the key.
- Do NOT count accidentals before individual notes (only the group right after the clef).
- Do NOT count natural signs (♮) — they look like a box with tails.
- Do NOT count the clef symbol itself.

HOW TO COUNT — step by step:
Step 1: Locate the clef symbol at the far left of the first staff (treble clef looks like an ornate spiral; bass clef looks like a reversed C with two dots).
Step 2: Scan RIGHT from the clef. Stop when you reach two stacked numbers (the time signature) or a barline.
Step 3: In that zone, count EACH sharp # symbol you see. Write them out: "sharp 1, sharp 2, sharp 3..."
Step 4: Count EACH flat b symbol you see. Write them out: "flat 1, flat 2..."
Step 5: A key can have sharps OR flats but NEVER both. If you somehow see both, recount — you are making an error.
Step 6: Report flat_count and sharp_count. If nothing is there, both are 0 (C major / A minor).

Examples: "4 sharps" means sharp_count=4, flat_count=0. "2 flats" means flat_count=2, sharp_count=0. "0 accidentals" means both=0.

CRITICAL: flat_count and sharp_count are MUTUALLY EXCLUSIVE. Never set both to non-zero.`;

  const fullExtractPrompt = `You are an expert music engraver and choir director reading sheet music with extreme precision.

${WATERMARK_NOTE}

CRITICAL RULES:
- If any image is a title/cover page with no staves or notes, SKIP IT and look at the next image.

KEY SIGNATURE: Count accidentals (♭ flats or ♯ sharps) that appear between the clef symbol and the time signature. These define the key signature. Do NOT count accidentals before individual notes. Key has EITHER flats OR sharps, never both.

TIME SIGNATURE: Look for two numbers stacked vertically right after the key signature. The TOP number = beats per measure. The BOTTOM number = note value that gets one beat. Common values: 4/4, 3/4, 6/8, 2/4, 3/8. If you see a plain C symbol = 4/4. If you see C with a vertical line through it = 2/2 (cut time). Write exactly what you see (e.g., "3/4" not "3-4").

TEMPO: Look for tempo markings, usually written in Italian above the first measure (Andante, Allegro, Moderato, Largo, Vivace, Presto, etc.) or as a metronome mark showing a note = number (e.g., ♩=120). If you see both a word and a number, report both (e.g., "Andante ♩=72"). If nothing is written, report "none".

DYNAMICS: Look for dynamic markings — small italic letters usually below the staff: pp (very soft), p (soft), mp (medium soft), mf (medium loud), f (loud), ff (very loud), sfz (sudden accent), cresc (getting louder), dim/decrescendo (getting softer). Report the opening marking and any changes seen. If none visible, report "none".

SATB STAFF IDENTIFICATION:
  Step 1: Count staves in the first system top to bottom. Treble clef (spiral curl) = higher voice; bass clef (dotted C) = lower voice; treble-8 (spiral with "8" below) = Tenor.
  Step 2: For each treble staff, check stem direction. Stems UP = higher voice (Soprano/Tenor). Stems DOWN = lower voice (Alto/Bass).
  Step 3: Verify the staff has LYRICS underneath it. Vocal parts always have text syllables below notes.
  Step 4: Grand-staff piano accompaniment (no lyrics) — IGNORE entirely.
  Result: Soprano=top treble stems up, Alto=bottom treble stems down, Tenor=treble-8 stems up OR bass staff stems up, Bass=bass staff stems down.

MAJOR vs MINOR — visual evidence only. Do NOT default to major:
  1. Look for the word "minor", "moll", "mineur", or "min." in tempo or title
  2. Check if the 7th degree appears raised (e.g., G# in A minor) → likely minor
  3. Look at the final chord for a raised 3rd (Picardy third) → minor
  4. Only if all above inconclusive, report as the major key`;

  const timeSigPrompt = `You are a music reader identifying the time signature.

${WATERMARK_NOTE}

The time signature appears as TWO NUMBERS STACKED VERTICALLY, right after the key signature accidentals and before the first notes.
- The TOP number tells you how many beats per measure (e.g., 3 means 3 beats).
- The BOTTOM number tells you which note gets one beat (e.g., 4 means a quarter note).
- A plain C symbol means 4/4 (common time).
- A C with a vertical line through it means 2/2 (cut time / alla breve).
- Report ONLY the fraction. Examples: "3/4" or "6/8" or "4/4". Do NOT guess — only report what you clearly see.
- If you cannot see a time signature at all, default to "4/4" with confidence "uncertain".

STEP BY STEP:
Step 1: Find the clef at the left of the first staff.
Step 2: Scan right past any flat/sharp accidentals (the key signature).
Step 3: You should now see either two stacked numbers OR a C symbol.
Step 4: Read the top number, then the bottom number.
Step 5: Report as top/bottom (e.g., "3/4").`;

  const extractText = `Extract all musical data for the ${part} part. Skip title/cover pages. Be precise about accidental counting.`;

  // OMR: launch in parallel with Gemini calls on the first PDF page
  const pdfPagesArr = Array.isArray(pdfPages) ? pdfPages : [];
  let omrPromise = Promise.resolve(null);
  if (pdfPagesArr.length > 0) {
    const omrBuf = Buffer.from(pdfPagesArr[0], 'base64');
    omrPromise = tryOmrService(omrBuf, 'image/jpeg', trace);
  }

  // Launch extraction phases in parallel
  // Key sig: 5 dedicated reads spread across pages (the signature repeats on every
  //          system, so different pages are independent witnesses — off-by-one vision
  //          errors don't repeat identically across pages)
  // Time sig: 2 dedicated reads (Pro cropped, Flash full)
  // Full extraction: 2 reads (Pro + Flash)
  const pg1 = keyRegionByPage[0]?.part;
  const pg2 = keyRegionByPage[1]?.part;
  const pg3 = keyRegionByPage[2]?.part;
  const allPromises = [
    // KEY SIG read 1: Pro with key_region crop of page 1
    callGemini(apiKey, keySigPrompt,
      [{ text: 'Count the exact number of sharp or flat symbols in the key signature zone. Show your work.' },
       ...(pg1 ? [pg1] : processedParts.slice(0, 1))],
      { temperature: 0, maxOutputTokens: 2048, responseSchema: KEY_SIG_SCHEMA, thinkingBudget: 1024 }
    ),
    // KEY SIG read 2: Pro with key_region crop of page 2 (independent witness)
    callGemini(apiKey, keySigPrompt,
      [{ text: 'Independent count on this page: how many sharps or flats are in the key signature? Count carefully.' },
       ...(pg2 ? [pg2] : processedParts.slice(0, 1))],
      { temperature: 0, maxOutputTokens: 2048, responseSchema: KEY_SIG_SCHEMA, thinkingBudget: 1024 }
    ),
    // KEY SIG read 3: Flash with key_region crop of page 3 (independent witness)
    callGemini(apiKey, keySigPrompt,
      [{ text: 'Third independent read: count sharps or flats in the key signature on this page.' },
       ...(pg3 ? [pg3] : processedParts.slice(0, 1))],
      { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 1024, responseSchema: KEY_SIG_SCHEMA, thinkingBudget: 0 }
    ),
    // KEY SIG read 4: Pro with full page-1 image (context read — sees whole staves)
    callGemini(apiKey, keySigPrompt,
      [{ text: 'Full-page read: count the sharps or flats printed right after each clef. They repeat on every staff — verify your count on at least two staves.' },
       ...processedParts.slice(0, 1)],
      { temperature: 0, maxOutputTokens: 2048, responseSchema: KEY_SIG_SCHEMA, thinkingBudget: 1024 }
    ),
    // KEY SIG read 5: Flash with page-2 full image (cheap extra witness)
    callGemini(apiKey, keySigPrompt,
      [{ text: 'Count sharps or flats in the key signature. Cross-check on two different staves before answering.' },
       ...(allJpegPages[1] ? [allJpegPages[1]] : processedParts.slice(0, 1))],
      { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 1024, responseSchema: KEY_SIG_SCHEMA, thinkingBudget: 0 }
    ),

    // TIME SIG read 1: Pro with time_sig_region crop
    callGemini(apiKey, timeSigPrompt,
      [{ text: 'Read the two stacked numbers that form the time signature.' },
       ...(timeSigRegionParts.length ? timeSigRegionParts : processedParts.slice(0, 1))],
      { temperature: 0, maxOutputTokens: 1024, responseSchema: TIME_SIG_SCHEMA, thinkingBudget: 512 }
    ),
    // TIME SIG read 2: Flash with full image
    callGemini(apiKey, timeSigPrompt,
      [{ text: 'What is the time signature? Report as top_number/bottom_number.' },
       ...processedParts.slice(0, 1)],
      { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 64, responseSchema: TIME_SIG_SCHEMA, thinkingBudget: 0 }
    ),

    // FULL EXTRACTION: 2 reads (Pro + Flash) — key/time sig here are secondary votes only
    callGemini(apiKey, fullExtractPrompt,
      [{ text: extractText }, ...processedParts],
      { temperature: 0, maxOutputTokens: 4096, responseSchema: ANALYZE_SCHEMA, thinkingBudget: 12000 }
    ),
    callGemini(apiKey, fullExtractPrompt,
      [{ text: `Independent verification: ${extractText} Double-check each value.` }, ...processedParts],
      { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 4096, responseSchema: ANALYZE_SCHEMA, thinkingBudget: 0 }
    ),
  ];

  // Use allSettled so one failed call doesn't kill everything; OMR runs in parallel
  const [settled, omrXml0] = await Promise.all([Promise.allSettled(allPromises), omrPromise]);
  const results = settled.map((s, i) => {
    if (s.status === 'fulfilled') return s.value;
    console.warn(`[Solfai] Gemini call ${i} failed: ${s.reason?.message || s.reason}`);
    return null;
  });

  // Check if we have at least SOME results to work with
  const successCount = results.filter(r => r !== null).length;
  if (successCount === 0) {
    throw new Error('All AI extraction attempts failed. The image may be too low quality or the AI service may be down.');
  }
  console.log(`[Solfai] ${successCount}/${results.length} Gemini calls succeeded`);

  // Parse results — indices match the 9-call allPromises array:
  //   0: key sig Pro (page-1 key_region crop)
  //   1: key sig Pro (page-2 key_region crop)
  //   2: key sig Flash (page-3 key_region crop)
  //   3: key sig Pro (page-1 full image)
  //   4: key sig Flash (page-2 full image)
  //   5: time sig Pro (time_sig_region crop)
  //   6: time sig Flash (full image)
  //   7: full extraction Pro
  //   8: full extraction Flash

  // Parse key signature votes (indices 0-4)
  const keyVotes = [];
  let titlePageSkips = 0;
  for (const [i, weight] of [[0, WEIGHT_PRO], [1, WEIGHT_PRO], [2, WEIGHT_FLASH], [3, WEIGHT_PRO], [4, WEIGHT_FLASH]]) {
    if (!results[i]) continue;
    try {
      const ks = JSON.parse(results[i]);
      // Discard reads of a title/cover/blank page — they return 0/0 and poison the vote.
      if (ks.reasoning && NON_MUSIC_PAGE_PATTERNS.test(ks.reasoning)) {
        trace?.warn('KEYSIG_SKIP', { read: i + 1, reason: 'title/blank page detected', reasoning: String(ks.reasoning).slice(0, 120) });
        titlePageSkips++;
        continue;
      }
      // Enforce mutual exclusion — flats and sharps can never both be non-zero
      if (Number(ks.flat_count) > 0 && Number(ks.sharp_count) > 0) {
        console.warn(`[Solfai] Impossible key sig (${ks.flat_count}b + ${ks.sharp_count}s) — keeping higher count, zeroing the other`);
        if (Number(ks.flat_count) >= Number(ks.sharp_count)) ks.sharp_count = 0;
        else ks.flat_count = 0;
      }
      if (ks.reasoning) console.log(`[Solfai] Key sig reasoning (read ${i+1}): ${ks.reasoning}`);
      keyVotes.push({ flatCount: Number(ks.flat_count) || 0, sharpCount: Number(ks.sharp_count) || 0, weight, confidence: ks.confidence });
    } catch (e) {
      console.warn(`[Solfai] Key sig read ${i + 1} parse failed`);
    }
  }

  // Rescue pass: page 0 was a title page, so OMR on page 0 was wasted — retry on page 1
  let omrXml = omrXml0;
  if (!omrXml && titlePageSkips > 0 && keyVotes.length === 0 && pdfPagesArr.length > 1) {
    trace?.log('OMR_RESCUE', { reason: 'page 0 is title page, retrying OMR on page 1' });
    const buf1 = Buffer.from(pdfPagesArr[1], 'base64');
    omrXml = await tryOmrService(buf1, 'image/jpeg', trace);
  }

  // Vote the (flatCount, sharpCount) PAIR — they are mutually exclusive in music.
  // Voting them independently can produce impossible combos like "2 flats AND 3 sharps".
  // Also scale each vote's weight by Gemini's reported confidence.
  const pairVotes = keyVotes.map(v => {
    const confMult = v.confidence === 'certain' ? 1.5 : v.confidence === 'uncertain' ? 0.6 : 1.0;
    const effectiveWeight = v.weight * confMult;
    const pairKey = v.sharpCount > 0 ? `${v.sharpCount}s` : v.flatCount > 0 ? `${v.flatCount}b` : '0';
    return { value: pairKey, weight: effectiveWeight };
  });
  const winningPair = weightedVote(pairVotes); // e.g. "3b", "2s", "0"
  const votedFlats = (winningPair && winningPair.endsWith('b')) ? parseInt(winningPair) : 0;
  const votedSharps = (winningPair && winningPair.endsWith('s')) ? parseInt(winningPair) : 0;

  console.log(`[Solfai] Key votes: ${keyVotes.map(v => `${v.flatCount}b/${v.sharpCount}s`).join(', ')} → ${votedFlats}b/${votedSharps}s`);
  trace?.log('GEMINI_KEYSIG', { votes: keyVotes.map(v => ({ f: v.flatCount, s: v.sharpCount, conf: v.confidence })), votedFlats, votedSharps });

  // ═══ MUSIC-PAGE RESCUE PASS ═══
  // All dedicated key reads saw a title/blank page (page 1 is often a cover). Every
  // crop above derives from imageParts[0], so they were all reading the same cover.
  // Walk the REMAINING pages until one actually contains music, and read the key
  // signature from THAT page. This is the fix for multi-page PDFs with cover pages.
  let musicPageJpeg = null;
  if (keyVotes.length === 0 && titlePageSkips > 0 && imageParts.length > 1) {
    const jpegPages = imageParts.filter(p => p.inlineData?.mimeType === 'image/jpeg');
    for (let pg = 1; pg < jpegPages.length; pg++) {
      try {
        const cropped = await preprocessForGemini(jpegPages[pg].inlineData.data, 'key_region').catch(() => null);
        const rescuePart = cropped
          ? { inlineData: { mimeType: 'image/jpeg', data: cropped } }
          : jpegPages[pg];
        const rescueRaw = await callGemini(apiKey, keySigPrompt,
          [{ text: `RESCUE READ (page ${pg + 1} of the PDF — earlier pages had no music): count the sharps or flats in the key signature.` },
           rescuePart],
          { temperature: 0, maxOutputTokens: 2048, responseSchema: KEY_SIG_SCHEMA, thinkingBudget: 1024 }
        );
        const rs = JSON.parse(rescueRaw);
        if (rs.reasoning && NON_MUSIC_PAGE_PATTERNS.test(rs.reasoning)) {
          trace?.warn('KEYSIG_RESCUE_SKIP', { page: pg + 1, reasoning: String(rs.reasoning).slice(0, 120) });
          continue; // this page is also a cover/blank — try the next one
        }
        if (Number(rs.flat_count) > 0 && Number(rs.sharp_count) > 0) {
          if (Number(rs.flat_count) >= Number(rs.sharp_count)) rs.sharp_count = 0;
          else rs.flat_count = 0;
        }
        keyVotes.push({ flatCount: Number(rs.flat_count) || 0, sharpCount: Number(rs.sharp_count) || 0, weight: WEIGHT_PRO * 1.5, confidence: rs.confidence });
        musicPageJpeg = jpegPages[pg];
        trace?.log('KEYSIG_RESCUE', { page: pg + 1, flats: Number(rs.flat_count) || 0, sharps: Number(rs.sharp_count) || 0, conf: rs.confidence, reasoning: String(rs.reasoning || '').slice(0, 120) });
        console.log(`[Solfai] Key rescue (page ${pg + 1}): ${rs.flat_count}b/${rs.sharp_count}s`);
        break; // found a music page — done
      } catch (e) {
        trace?.warn('KEYSIG_RESCUE_FAIL', { page: pg + 1, error: e.message });
      }
    }
  }

  // Parse dedicated time sig votes (indices 5-6)
  const timeSigDedicatedVotes = [];
  for (const [i, weight] of [[5, WEIGHT_PRO], [6, WEIGHT_FLASH]]) {
    if (!results[i]) continue;
    try {
      const ts = JSON.parse(results[i]);
      if (ts.time_signature) {
        if (ts.what_i_see) console.log(`[Solfai] Time sig read ${i-4}: "${ts.what_i_see}" → ${ts.time_signature} (${ts.confidence})`);
        const confMult = ts.confidence === 'certain' ? 1.5 : ts.confidence === 'uncertain' ? 0.6 : 1.0;
        timeSigDedicatedVotes.push({ value: ts.time_signature, weight: weight * confMult });
      }
    } catch (e) {
      console.warn(`[Solfai] Time sig dedicated read ${i-4} parse failed`);
    }
  }

  // Parse full extraction results (indices 7-8)
  const fullExtractions = [];
  for (const [i, weight] of [[7, WEIGHT_PRO], [8, WEIGHT_FLASH]]) {
    if (!results[i]) { fullExtractions.push({}); continue; }
    try {
      fullExtractions.push(JSON.parse(results[i]));
    } catch (e) {
      console.warn(`[Solfai] Full extraction ${i - 6} parse failed`);
      fullExtractions.push({});
    }
  }

  trace?.log('GEMINI_TIMESIG', { values: timeSigDedicatedVotes.map(v => v.value) });

  const allEmpty = fullExtractions.every(ext => !ext.first_notes?.length && !ext.last_notes?.length);
  if (allEmpty && titlePageSkips >= (imageParts.length - 1)) {
    trace?.warn('SUSPICIOUS_UPLOAD', {
      reason: 'Every page read as title/blank AND zero notes extracted anywhere — likely a bad scan, corrupted page render, or conversion bug, not a real title-heavy score.',
      pageCount: imageParts.length,
      titlePageSkips,
    });
  }

  // Use primary Pro extraction as base, enriched by consensus
  const raw = fullExtractions[0];
  trace?.log('GEMINI_FULL', { firstNotes: raw?.first_notes, lastNotes: raw?.last_notes, title: raw?.piece_title });
  if (VERBOSE) trace?.log('GEMINI_FULL_RAW', { extractions: fullExtractions });

  // Also get flat/sharp counts from full extractions for cross-validation
  const fullKeyVotes = fullExtractions.map((ext, i) => ({
    flatCount: Number(ext.flat_count) || 0,
    sharpCount: Number(ext.sharp_count) || 0,
    weight: i < 2 ? WEIGHT_PRO : WEIGHT_FLASH,
  }));

  // Combine dedicated key reads with full extraction key reads, vote as pairs
  const allKeyVotes = [...keyVotes, ...fullKeyVotes];
  const allPairVotes = allKeyVotes.map(v => {
    const pairKey = v.sharpCount > 0 ? `${v.sharpCount}s` : v.flatCount > 0 ? `${v.flatCount}b` : '0';
    return { value: pairKey, weight: v.weight };
  });
  const finalPair = weightedVote(allPairVotes);
  const finalFlats = (finalPair && finalPair.endsWith('b')) ? parseInt(finalPair) : 0;
  const finalSharps = (finalPair && finalPair.endsWith('s')) ? parseInt(finalPair) : 0;

  console.log(`[Solfai] Combined key votes (${allKeyVotes.length} total): ${finalFlats}b/${finalSharps}s`);

  // ═══ DATABASE LOOKUP — validate/override AI values ═══
  const pieceTitle = raw.piece_title || 'unknown';
  const composerName = raw.composer_name || 'unknown';

  // Code-calculated key from voted flat/sharp count. Major/minor is computed from the
  // actual notes (final note + leading tone + tonic frequency), not from AI voting.
  const noteEvidence = fullExtractions.flatMap(ext => [
    ...(Array.isArray(ext.first_notes) ? ext.first_notes : []),
    ...(Array.isArray(ext.last_notes) ? ext.last_notes : []),
  ]);
  const longestFirstNotes = fullExtractions
    .map(ext => (Array.isArray(ext.first_notes) ? ext.first_notes : []))
    .sort((a, b) => b.length - a.length)[0] || [];
  const longestLastNotes = fullExtractions
    .map(ext => (Array.isArray(ext.last_notes) ? ext.last_notes : []))
    .sort((a, b) => b.length - a.length)[0] || [];
  const finalNote = longestLastNotes.length ? longestLastNotes[longestLastNotes.length - 1] : null;

  // ═══ HYPOTHESIS TOURNAMENT ═══
  // Vision counting has a ±1 error mode. Run the voted count and its circle-of-fifths
  // neighbors through a music-theory scorer; the notes get the final say.
  const drawnAccidentals = fullExtractions.flatMap(ext =>
    Array.isArray(ext.drawn_accidentals) ? ext.drawn_accidentals : []);
  const voteShareForTournament = weightedVoteWithMargin(allPairVotes).margin || 0.7;
  const tournament = keyHypothesisTournament(
    finalFlats, finalSharps, voteShareForTournament,
    noteEvidence, drawnAccidentals, finalNote, trace
  );
  const tFlats = tournament.flats;
  const tSharps = tournament.sharps;
  if (tournament.changed) {
    console.log(`[Solfai] Key count after tournament: ${finalFlats}b/${finalSharps}s → ${tFlats}b/${tSharps}s (margin ${tournament.margin})`);
  }

  let keyResult = resolveKeyFromCounts(tFlats, tSharps, noteEvidence, longestFirstNotes, finalNote, trace);
  if (tournament.changed) {
    keyResult.keyWarning = keyResult.keyWarning ||
      'Key adjusted by note-content analysis (the drawn accidentals/final note disagreed with the raw signature count). Please verify.';
  }
  // If every dedicated key read (including the page-by-page rescue pass) saw a
  // title/blank page, the count comes only from full-extraction votes — which read
  // the same images. Rather than silently defaulting to C major, infer the best-fit
  // key from the extracted note content (pure code, honest warning attached).
  if (titlePageSkips > 0 && keyVotes.length === 0) {
    keyResult.confident = false;
    trace?.warn('KEYSIG_ALL_SKIPPED', { skips: titlePageSkips, rescueTried: imageParts.length > 1, fellBackTo: 'note-content inference' });
    const inferred = inferKeyFromNoteContent(noteEvidence, trace);
    if (inferred && (inferred.flats !== finalFlats || inferred.sharps !== finalSharps)) {
      const inferredResult = resolveKeyFromCounts(inferred.flats, inferred.sharps, noteEvidence, longestFirstNotes, finalNote, trace);
      console.log(`[Solfai] Key inferred from note content: ${keyResult.key} → ${inferredResult.key} (${inferred.matched}/${inferred.total} notes fit)`);
      keyResult = inferredResult;
      keyResult.confident = false;
      keyResult.keyWarning = 'Key signature was unreadable (cover/blank pages) — key inferred from the notes themselves. Please verify.';
    } else {
      keyResult.keyWarning = 'Key signature pages were unreadable (title/cover pages); key may be wrong — please verify.';
    }
  }
  trace?.log('KEY_RESOLVED', { key: keyResult.key, confident: keyResult.confident, minorRatio: keyResult.minorVoteRatio });

  // Apply cached corrections
  let finalKey = cached?.keySignature || keyResult.key;
  let tonic = finalKey.split(' ')[0];
  const dbMatch = lookupPiece(pieceTitle, composerName);
  trace?.log('DB_MATCH', { matched: !!dbMatch, title: dbMatch?.title || null, hasKey: !!dbMatch?.key, source: dbMatch?.source || null });
  let dbOverrideApplied = false;

  if (dbMatch) {
    console.log(`[Solfai] Database match: "${dbMatch.title}" by ${dbMatch.composer}`);

    // Override key if AI disagrees with database
    const dbKeyNorm = dbMatch.key.toLowerCase().replace(/\s+/g, '');
    const aiKeyNorm = finalKey.toLowerCase().replace(/\s+/g, '').replace(/\(.*\)/, '').trim();
    if (dbKeyNorm !== aiKeyNorm && !cached?.keySignature) {
      console.log(`[Solfai] DB override: key "${finalKey}" → "${dbMatch.key}"`);
      finalKey = dbMatch.key;
      tonic = finalKey.split(' ')[0];
      dbOverrideApplied = true;
    }
  }

  // ═══ CONFIDENCE-WEIGHTED RETRY ═══
  // Use real weighted margin (0.5=tie, 1.0=unanimous) instead of count equality
  const keyVoteResult = weightedVoteWithMargin(pairVotes);
  const keyConfidenceRatio = keyVoteResult.margin; // 1.0 = all agree, 0.5 = tie

  console.log(`[Solfai] Key confidence: ${Math.round(keyConfidenceRatio * 100)}% (${keyVoteResult.isUnanimous ? 'unanimous' : keyVoteResult.isTie ? 'TIE' : 'majority'})`);

  // Retry key if < 70% agreement and we have image data.
  // Use the rescued music page when the cover turned out to be a title page.
  const retrySourceJpeg = musicPageJpeg || firstJpeg;
  if (keyConfidenceRatio < 0.7 && retrySourceJpeg) {
    // Below 50% confidence = tie → use extreme zoom; otherwise high_contrast is enough
    const retryMode = keyConfidenceRatio < 0.55 ? 'key_region_extreme' : 'high_contrast';
    console.log(`[Solfai] Low key confidence (${Math.round(keyConfidenceRatio * 100)}%), retrying with ${retryMode}${musicPageJpeg ? ' on rescued music page' : ''}...`);
    try {
      const hcData = await preprocessForGemini(retrySourceJpeg.inlineData.data, retryMode);
      const retryResult = await callGemini(apiKey, keySigPrompt,
        [{ text: 'CRITICAL RETRY: Show your work step by step. Count every accidental carefully. This is a tie-breaker read.' },
         { inlineData: { mimeType: 'image/jpeg', data: hcData } }],
        { temperature: 0, maxOutputTokens: 2048, responseSchema: KEY_SIG_SCHEMA, thinkingBudget: 1024 }
      );
      const retryKs = JSON.parse(retryResult);
      if (retryKs.reasoning) console.log(`[Solfai] Retry reasoning: ${retryKs.reasoning}`);
      if (Number(retryKs.flat_count) > 0 && Number(retryKs.sharp_count) > 0) {
        if (Number(retryKs.flat_count) >= Number(retryKs.sharp_count)) retryKs.sharp_count = 0;
        else retryKs.flat_count = 0;
      }
      keyVotes.push({ flatCount: Number(retryKs.flat_count) || 0, sharpCount: Number(retryKs.sharp_count) || 0, weight: WEIGHT_PRO, confidence: retryKs.confidence });
      // Re-vote with the extra data
      const reFlatWinner = weightedVote(keyVotes.map(v => ({ value: v.flatCount, weight: v.weight })));
      const reSharpWinner = weightedVote(keyVotes.map(v => ({ value: v.sharpCount, weight: v.weight })));
      console.log(`[Solfai] Key retry vote: ${Number(reFlatWinner) || 0}b/${Number(reSharpWinner) || 0}s`);
    } catch (e) {
      console.warn('[Solfai] Key retry failed:', e.message);
    }
  }

  // ═══ CROSS-VALIDATE last note — 3-way vote with confidence gate ═══
  let lastNoteWarning = null;
  let lastNotePitch = null;
  try {
    const lastNotePrompt = `You are a music reading specialist. Find the VERY LAST SUNG NOTE in the ${part} vocal part.

${WATERMARK_NOTE}

Look at the FINAL measure — the measure just before the double barline at the end of the piece.
TREBLE CLEF: Lines bottom→top E4 G4 B4 D5 F5. Spaces F4 A4 C5 E5. Middle C (C4) = space below first ledger line below staff.
BASS CLEF: Lines G2 B2 D3 F3 A3. Spaces A2 C3 E3 G3. Middle C (C4) = first ledger line above bass staff.
For SATB: Soprano=top treble stems up, Alto=bottom treble stems down, Tenor=treble-8/bass stems up, Bass=bottom bass stems down.

Step 1: Find the double barline at the very end.
Step 2: Identify the note immediately before it (ignoring any rests).
Step 3: Is the note head ON a line or IN a space? Count from the bottom.
Step 4: Apply any key signature accidentals unless cancelled by a natural sign.`;

    // 3-way vote: 2x Pro + 1x Flash
    const [lastRead1, lastRead2, lastRead3] = await Promise.allSettled([
      callGemini(apiKey, lastNotePrompt,
        [{ text: `Find last sung note for ${part}. Think carefully.` }, ...processedParts.slice(0, 2)],
        { temperature: 0, maxOutputTokens: 1024, responseSchema: LAST_NOTE_SCHEMA, thinkingBudget: 512 }),
      callGemini(apiKey, lastNotePrompt,
        [{ text: `Independent read — find last sung note for ${part}.` }, ...processedParts.slice(0, 2)],
        { temperature: 0, maxOutputTokens: 1024, responseSchema: LAST_NOTE_SCHEMA, thinkingBudget: 512 }),
      callGemini(apiKey, lastNotePrompt,
        [{ text: `Find last sung note for ${part}.` }, ...processedParts.slice(0, 1)],
        { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 128, responseSchema: LAST_NOTE_SCHEMA, thinkingBudget: 0 }),
    ]);

    const lastNoteVotes = [];
    for (const [idx, settled] of [[0, lastRead1], [1, lastRead2], [2, lastRead3]]) {
      if (settled.status !== 'fulfilled') continue;
      try {
        const d = JSON.parse(settled.value);
        if (d.pitch) lastNoteVotes.push({ value: d.pitch, weight: idx < 2 ? WEIGHT_PRO : WEIGHT_FLASH });
      } catch(e) {}
    }

    const lastNoteVoteResult = weightedVoteWithMargin(lastNoteVotes);
    lastNotePitch = lastNoteVoteResult.value;
    console.log(`[Solfai] Last note votes: ${lastNoteVotes.map(v=>v.value).join(', ')} → ${lastNotePitch} (${Math.round(lastNoteVoteResult.margin * 100)}% confidence)`);

    // Only cross-validate if 60%+ of weighted votes agree — below that the reads disagree too much
    if (lastNotePitch && lastNoteVoteResult.margin >= 0.6) {
      const lastDegree = noteToScaleDegree(lastNotePitch.replace(/\d+$/, ''), tonic);
      if (lastDegree !== null && ![1, 5].includes(lastDegree)) {
        lastNoteWarning = `Last note ${lastNotePitch} is scale degree ${lastDegree} in ${tonic} — expected Do(1) or Sol(5). Verify ending.`;
        console.warn(`[Solfai] Warning: ${lastNoteWarning}`);
      } else {
        console.log(`[Solfai] Last note ${lastNotePitch} is scale degree ${lastDegree} in ${tonic} — valid ending ✓`);
      }
    } else if (lastNoteVoteResult.margin < 0.6) {
      console.warn(`[Solfai] Last note reads disagree (${Math.round(lastNoteVoteResult.margin * 100)}% agreement) — skipping cross-validation to avoid false warnings`);
    }
  } catch (e) {
    console.warn('[Solfai] Last note cross-validation failed:', e.message);
  }

  // Consensus on time signature — dedicated reads get higher weight than embedded in full extraction
  const allTimeSigVotes = [
    ...timeSigDedicatedVotes,  // dedicated reads (higher quality)
    ...fullExtractions.map((ext, i) => ({
      value: ext.time_signature,
      weight: (i === 0 ? WEIGHT_PRO : WEIGHT_FLASH) * 0.7,  // slightly less weight than dedicated
    })).filter(v => v.value),
  ];
  const timeSigVoteResult = weightedVoteWithMargin(allTimeSigVotes);
  let votedTime = timeSigVoteResult.value || raw.time_signature;
  const timeSigConfidence = timeSigVoteResult.margin;
  console.log(`[Solfai] Time sig votes: ${allTimeSigVotes.map(v => v.value).join(', ')} → ${votedTime} (${Math.round(timeSigConfidence * 100)}% confidence)`);
  trace?.log('TIME_RESOLVED', { timeSignature: votedTime, confidence: Math.round(timeSigConfidence * 100) / 100 });

  // Capture Gemini's raw votes before any DB/OMR overrides (used for OMR cross-check)
  const geminiVotedKey  = keyResult.codeSaid;
  const geminiVotedTime = timeSigVoteResult.value || raw.time_signature;

  const votedTempo = weightedVote(
    fullExtractions.map((ext, i) => ({
      value: ext.tempo,
      weight: i < 2 ? WEIGHT_PRO : WEIGHT_FLASH,
    }))
  ) || raw.tempo;

  // ═══ PIECE DATABASE LOOKUP (piece-database.json) ═══
  // The library's own catalog. Overrides key/time only when confidence is
  // medium or high AND no user correction is already cached for this image.
  const pieceDbEntry = lookupPieceDb(pieceTitle, composerName);
  let pieceDbKeyOverride = false;
  let pieceDbTimeOverride = false;

  if (pieceDbEntry) {
    console.log(`[Solfai] Piece DB match: #${pieceDbEntry.id} "${pieceDbEntry.title}" (${pieceDbEntry.confidence})`);
    trace?.log('PIECE_DB_MATCH', { id: pieceDbEntry.id, title: pieceDbEntry.title, confidence: pieceDbEntry.confidence, hasKey: !!pieceDbEntry.key, hasTime: !!pieceDbEntry.time });
    if (!pieceDbEntry.key) {
      // Entry exists but carries no key data — nothing to apply. Say so plainly
      // instead of silently doing nothing (this is what looked like a broken override).
      trace?.warn('PIECE_DB_NO_KEY', { id: pieceDbEntry.id, note: 'matched entry has key:null — no override possible' });
    }
    const confOk = pieceDbEntry.confidence === 'high' || pieceDbEntry.confidence === 'medium';

    // Override key when the DB is confident, OR when the DB confidence is low but
    // Gemini's own key reading is also unconfident — a known DB entry beats an
    // uncertain AI reading (e.g. a title page that produced 0/0). Only a CONFIDENT
    // Gemini reading is allowed to keep a low-confidence DB entry from applying.
    const keyConfOk = confOk || !keyResult.confident;
    if (keyConfOk && pieceDbEntry.key && !cached?.keySignature && !dbOverrideApplied) {
      const source = confOk ? 'db_confident' : 'db_override_uncertain_gemini';
      console.log(`[Solfai] Piece DB key override (${source}): "${finalKey}" → "${pieceDbEntry.key}"`);
      finalKey = pieceDbEntry.key;
      tonic = finalKey.split(' ')[0];
      pieceDbKeyOverride = true;
      trace?.log('DB_APPLY', { field: 'key', source, value: pieceDbEntry.key });
    }

    // Override time: only if DB has data, confidence is sufficient, and user
    // hasn't corrected it via the cached corrections map.
    if (confOk && pieceDbEntry.time && !cached?.timeSignature) {
      console.log(`[Solfai] Piece DB time override: "${votedTime}" → "${pieceDbEntry.time}"`);
      votedTime = pieceDbEntry.time;
      pieceDbTimeOverride = true;
    }
  }

  // ═══ OMR INTEGRATION (PDF path only) ════════════════════════════════════
  // tryOmrService ran in parallel; results are now in omrXml.
  // OMR overrides Gemini voting but yields to user cache and piece databases.
  if (omrXml && omrXml.includes('<score-partwise')) {
    try {
      const omrParsed = parseMusicXML(omrXml, part);
      if (!omrParsed.error) {
        const hasKeyEl    = omrXml.includes('<key>');
        const hasTimeEl   = omrXml.includes('<time>');
        const omrNoteCount = (omrParsed.measures || []).reduce((s, m) => s + (m.notes?.length || 0), 0);
        const omrSane     = hasKeyEl && hasTimeEl && omrNoteCount >= 4;
        trace?.log('OMR_PARSED', { key: omrParsed.keySignature, time: omrParsed.timeSignature, notes: omrNoteCount, sane: omrSane });

        if (omrSane) {
          const omrKey  = omrParsed.keySignature;
          const omrTime = omrParsed.timeSignature;
          const normK   = s => s.toLowerCase().replace(/\s+/g, '').replace(/\(.*\)/g, '');
          const keyAgrees  = normK(omrKey) === normK(geminiVotedKey);
          const timeAgrees = omrTime === geminiVotedTime;
          trace?.log('OMR_CROSS_CHECK', { omrKey, omrTime, geminiKey: geminiVotedKey, geminiTime: geminiVotedTime, keyAgrees, timeAgrees });

          if (!cached?.keySignature && !dbOverrideApplied && !pieceDbKeyOverride) {
            finalKey = omrKey;
            tonic    = omrParsed.tonic || omrKey.split(' ')[0];
            trace?.log('OMR_KEY_APPLIED', { key: omrKey });
          }
          if (!cached?.timeSignature && !pieceDbTimeOverride) {
            votedTime = omrTime;
            trace?.log('OMR_TIME_APPLIED', { time: omrTime });
          }

          if (!keyAgrees || !timeAgrees) {
            const disagreement = `OMR reads ${omrKey} / ${omrTime}; Gemini reads ${geminiVotedKey} / ${geminiVotedTime}. Preferring OMR (structural analysis) — verify if unexpected.`;
            trace?.warn('OMR_GEMINI_DISAGREE', { omrKey, omrTime, geminiKey: geminiVotedKey, geminiTime: geminiVotedTime });
            keyResult.keyWarning = keyResult.keyWarning
              ? `${keyResult.keyWarning} ${disagreement}`
              : disagreement;
          } else {
            trace?.log('OMR_GEMINI_AGREE', { key: omrKey, time: omrTime });
          }
        } else {
          trace?.warn('OMR_INSANE', { notes: omrNoteCount, hasKeyEl, hasTimeEl });
        }
      } else {
        trace?.warn('OMR_PARSE_FAILED', { error: omrParsed.error });
      }
    } catch (omrErr) {
      trace?.warn('OMR_PARSE_ERROR', { error: omrErr.message });
    }
  }

  // Pre-calculate solfege from first_notes (use longest first_notes array).
  // Apply the FINAL key signature in code first — Gemini often reads staff position
  // only ('E5' when the 2-flat signature makes it Eb5). Code fixes what vision misses.
  const keyForSig = finalKey.toLowerCase();
  const sigFlats = tFlats, sigSharps = tSharps;
  const bestFirstNotesRaw = fullExtractions
    .map(ext => ext.first_notes || [])
    .sort((a, b) => b.length - a.length)[0];
  const bestFirstNotes = applyKeySignatureToNotes(bestFirstNotesRaw, sigFlats, sigSharps);
  const sigCorrections = bestFirstNotes.filter((n, i) => n !== bestFirstNotesRaw[i]).length;
  if (sigCorrections > 0) {
    console.log(`[Solfai] Key signature applied to ${sigCorrections} extracted notes (signature-blind extraction fixed in code)`);
  }
  const firstNotesSolfege = bestFirstNotes.map(n =>
    noteToSolfege(n.replace(/\d+$/, ''), tonic)
  );
  trace?.log('NOTES', { firstCount: bestFirstNotes.length, sample: bestFirstNotes.slice(0, 8), sigCorrections, tonic, solfegeSample: firstNotesSolfege.slice(0, 8) });

  // Confidence report
  const keyAgreement = allKeyVotes.every(v => v.flatCount === finalFlats && v.sharpCount === finalSharps);

  console.log(`[Solfai] Confidence: key=${keyAgreement ? 'unanimous' : 'voted'}`);

  // ═══ PASS 2: Human analysis with Google Search grounding ═══
  const pass2SystemPrompt = `You are a patient, encouraging choir director writing a practice guide for a ${part} singer.
Write in a warm, supportive tone. Reference specific measures when giving tips. Be practical and specific.
If you can identify the piece, use Google Search to verify the key and get accurate composer biography and piece history.
${WATERMARK_NOTE}`;

  const pass2UserText = `Write a complete analysis for this ${part} singer.

Verified musical data (consensus of ${allKeyVotes.length} independent reads):
- Key: ${finalKey}${!keyResult.confident ? ' (Note: key reading is uncertain — verify against the score)' : ''}
- Time Signature: ${votedTime}
- Tempo: ${votedTempo}
- Composer: ${raw.composer_name || 'unknown'}
- Title: ${raw.piece_title || 'unknown'}
- Language: ${raw.lyrics_language || 'English'}
- First line of lyrics: "${raw.first_lyrics || 'not extracted'}"

Write a JSON response with this exact structure:
{
  "overview": "2-3 paragraphs about the piece and what the ${part} singer needs to know",
  "practiceTips": ["5-8 specific, actionable tips referencing measures where possible"],
  "composerBio": "2-3 sentences about the composer, or null if unknown",
  "pieceInfo": "historical context and performance notes, or null if unknown",
  "pronunciation": {
    "language": "${raw.lyrics_language || 'English'}",
    "needsGuide": ${(raw.lyrics_language || 'English').toLowerCase() !== 'english'},
    "words": []
  }
}

For pronunciation.words: include EVERY unique word from visible lyrics with IPA and English approximation.
Format: {"word": "Ave", "ipa": "/ˈaː.ve/", "approx": "AH-veh"}
For English: set needsGuide to false and words to [].
Output ONLY valid JSON.`;

  const pass2Raw = await callGemini(apiKey, pass2SystemPrompt, [
    { text: pass2UserText },
    ...processedParts.slice(0, 3),
  ], {
    temperature: 0.7,
    maxOutputTokens: 8192,
    thinkingBudget: 4000,
    tools: [{ googleSearch: {} }],
  });

  let analysis;
  try {
    const cleaned = pass2Raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    analysis = JSON.parse(cleaned);
  } catch (e) {
    console.error('[Solfai] Pass 2 parse failed:', e.message);
    analysis = { overview: '', practiceTips: [], pronunciation: { language: 'English', needsGuide: false, words: [] } };
  }

  // Run validation
  const firstNotesList = bestFirstNotes || [];
  const extractionWarnings = validateExtraction(finalKey, votedTime, firstNotesList, part);
  if (extractionWarnings.length) {
    console.warn(`[Solfai] Validation warnings: ${extractionWarnings.map(w => w.message).join('; ')}`);
  }

  const timeSigConfLabel = timeSigConfidence >= 0.9 ? 'high' : timeSigConfidence >= 0.7 ? 'medium' : 'low';

  const structured = {
    keySignature: finalKey,
    keyConfident: keyResult.confident || keyAgreement,
    keyWarning: keyResult.keyWarning
      ? keyResult.keyWarning
      : (!keyResult.confident ? 'Key reading is uncertain — please verify the key signature against the score.' : null),
    timeSignature: votedTime || 'Not determined',
    timeSigConfidence: timeSigConfLabel,
    tempo: votedTempo === 'none' ? 'No tempo marking' : (votedTempo || 'Not marked'),
    dynamics: raw.dynamics === 'none' ? 'None visible' : (raw.dynamics || 'None visible'),
    difficulty: {
      overall: raw.difficulty_overall || 5,
      rhythm: raw.difficulty_rhythm || 4,
      range: raw.difficulty_pitch || 4,
      intervals: raw.difficulty_intervals || 4,
      text: raw.difficulty_text || 3,
    },
    firstNotesSolfege: firstNotesSolfege.length > 0 ? firstNotesSolfege : null,
    firstNotes: bestFirstNotes,
    firstLyrics: raw.first_lyrics || null,
    overview: analysis.overview || '',
    practiceTips: Array.isArray(analysis.practiceTips) ? analysis.practiceTips : [],
    composerName: raw.composer_name && raw.composer_name !== 'unknown' ? raw.composer_name : null,
    composerBio: analysis.composerBio || null,
    pieceTitle: raw.piece_title && raw.piece_title !== 'unknown' ? raw.piece_title : null,
    pieceInfo: analysis.pieceInfo || null,
    pronunciation: analysis.pronunciation || { language: 'English', needsGuide: false, words: [] },
    _imageHash: imgHash,
    _imageQuality: {
      score: imageQuality.overall,
      tier: imageQuality.tier,
      advice: imageQuality.advice,
    },
    _confidenceScore: calculateCompositeConfidence({
      keyAgreement,
      imageQuality: imageQuality.overall,
      dbMatch: !!dbMatch,
      successCount,
      totalCalls: results.length,
    }),
    _selfConsistency: {
      keysAgree: keyAgreement,
      totalKeyReads: allKeyVotes.length,
      timeSigConfidence: timeSigConfLabel,
      timeSigReads: allTimeSigVotes.length,
    },
    _validationWarnings: extractionWarnings,
    _dbMatch: dbMatch ? { title: dbMatch.title, composer: dbMatch.composer, overrideApplied: dbOverrideApplied } : null,
    _pieceDbMatch: pieceDbEntry ? {
      id: pieceDbEntry.id,
      title: pieceDbEntry.title,
      composer: pieceDbEntry.composer,
      arranger: pieceDbEntry.arranger,
      voicing: pieceDbEntry.specific_voicing,
      confidence: pieceDbEntry.confidence,
      keyOverrideApplied: pieceDbKeyOverride,
      timeOverrideApplied: pieceDbTimeOverride,
    } : null,
    _crossValidation: {
      lastNotePitch,
      lastNoteWarning,
    },
  };

  trace?.log('RESPONSE', { key: structured.keySignature, time: structured.timeSignature, difficulty: structured.difficulty?.overall, noteCount: structured.firstNotes?.length });
  trace?.summary();
  return res.status(200).json({ structured, text: buildTextSummary(structured, part) });
}

function buildTextSummary(s, part) {
  return [
    `Key Signature: ${s.keySignature}${s.keyWarning ? ' ⚠️ ' + s.keyWarning : ''}`,
    `Time Signature: ${s.timeSignature}`,
    `Tempo: ${s.tempo}`,
    `Dynamics: ${s.dynamics}`,
    `Difficulty Overall: ${s.difficulty.overall}/10`,
    `---`,
    `BREAKDOWN:`,
    s.overview,
    `---`,
    `PRACTICE TIPS:`,
    ...s.practiceTips.map((t, i) => `${i + 1}. ${t}`),
    s.composerName ? `COMPOSER: ${s.composerName}. ${s.composerBio || ''}` : '',
    s.pieceTitle ? `PIECE INFO: ${s.pieceTitle}. ${s.pieceInfo || ''}` : '',
  ].filter(Boolean).join('\n');
}

// ─── Interval Plausibility Check ──────────────────────────
// After reconciliation, any leap > major 10th (16 semitones) in choral music
// is almost certainly an octave misread. Attempt to correct by moving the note
// one octave in the direction that minimizes the jump.
function fixLargeIntervalErrors(measures, voicePart) {
  const range = VOCAL_RANGES[voicePart] || VOCAL_RANGES['Soprano'];
  const MAX_LEAP = 16; // major 10th — impossible in normal choral writing
  let fixes = 0;

  for (const m of measures) {
    if (!m.notes || m.notes.length < 2) continue;

    for (let i = 1; i < m.notes.length; i++) {
      const prev = m.notes[i - 1];
      const curr = m.notes[i];
      if (prev === '[?]' || curr === '[?]') continue;

      const prevMidi = Note.midi(prev);
      const currMidi = Note.midi(curr);
      if (prevMidi === null || currMidi === null) continue;

      const jump = Math.abs(currMidi - prevMidi);
      if (jump > MAX_LEAP) {
        const currNote = Note.get(curr);
        const downMidi = currMidi - 12;
        const upMidi = currMidi + 12;
        const jumpDown = Math.abs(downMidi - prevMidi);
        const jumpUp = Math.abs(upMidi - prevMidi);

        let fixed = null;
        if (jumpDown < jump && jumpDown <= MAX_LEAP && downMidi >= range.low - 5) {
          fixed = currNote.pc + (currNote.oct - 1);
        } else if (jumpUp < jump && jumpUp <= MAX_LEAP && upMidi <= range.high + 5) {
          fixed = currNote.pc + (currNote.oct + 1);
        }

        if (fixed) {
          console.log(`[Solfai] Interval fix m${m.num}: ${prev}→${curr} (${jump} semitones) corrected to ${prev}→${fixed}`);
          m.notes[i] = fixed;
          if (!m.autoCorrections) m.autoCorrections = [];
          m.autoCorrections.push({ noteIndex: i, original: curr, corrected: fixed, reason: 'large_interval_octave_fix' });
          fixes++;
        }
      }
    }
  }

  return fixes;
}

// ═══════════════════════════════════════════════════════════
// SOLFEGE — 5-way extraction + note-by-note reconciliation
// ═══════════════════════════════════════════════════════════
async function handleSolfege(res, apiKey, imageParts, part, trace = null) {
  const startTime = Date.now();

  // Preprocess images with binarization
  const processedParts = await Promise.all(
    imageParts.slice(0, 4).map(async (p) => {
      if (p.inlineData?.mimeType === 'image/jpeg') {
        try {
          const enhanced = await preprocessForGemini(p.inlineData.data, 'binarize');
          return { inlineData: { mimeType: 'image/jpeg', data: enhanced } };
        } catch (e) { return p; }
      }
      return p;
    })
  );

  // High contrast version for Flash reads
  const firstJpeg = imageParts.find(p => p.inlineData?.mimeType === 'image/jpeg');
  let highContrastParts = processedParts;
  if (firstJpeg) {
    try {
      const hc = await preprocessForGemini(firstJpeg.inlineData.data, 'high_contrast');
      highContrastParts = [{ inlineData: { mimeType: 'image/jpeg', data: hc } }];
    } catch (e) { /* use processed */ }
  }

  // Key region crop for key sig extraction
  let keyRegionPart = null;
  if (firstJpeg) {
    try {
      const keyData = await preprocessForGemini(firstJpeg.inlineData.data, 'key_region');
      keyRegionPart = { inlineData: { mimeType: 'image/jpeg', data: keyData } };
    } catch (e) { /* use full image */ }
  }

  const solfegeKeySigPrompt = `You are a music engraver counting accidentals in a key signature.

${WATERMARK_NOTE}

YOUR ONLY JOB: Count the symbols between the CLEF and the TIME SIGNATURE on the first staff.
- Sharp symbols look like a hashtag # (two vertical bars crossed by two horizontal lines).
- Flat symbols look like a lowercase b with a rounded bottom.
- Count carefully — do NOT guess. Do NOT name the key.
- Do NOT count accidentals before individual notes.
- Do NOT count natural signs (♮).
- A key has EITHER sharps OR flats, NEVER both.

Count step by step: "sharp 1, sharp 2..." or "flat 1, flat 2..." then report the total.

Output ONLY JSON: {"sharps": N, "flats": N}`;

  const solfegeStaffPrompt = `You are reading sheet music. Which staff number (counting from top, starting at 1) has lyrics below it?

${WATERMARK_NOTE}

For SATB: Soprano=staff 1 (top treble), Alto=staff 2 (bottom treble), Tenor=staff 3 (treble-8 or bass), Bass=staff 4 (bottom bass).
Skip title/cover pages.
Output ONLY JSON: {"vocal_staff_number": N, "total_staves": M, "clef": "treble" or "bass" or "treble-8", "part_confirmed": "${part}"}`;

  // Step 1: Staff ID + key sig extraction IN PARALLEL (3 key reads)
  const [staffRaw, keySig1Raw, keySig2Raw, keySig3Raw] = await Promise.all([
    callGemini(apiKey, solfegeStaffPrompt,
      [{ text: `Identify the ${part} vocal staff.` }, ...processedParts],
      { temperature: 0, maxOutputTokens: 2048, thinkingBudget: 1024 }
    ),
    // Key sig read 1: Pro with key_region crop (tightest zoom)
    callGemini(apiKey, solfegeKeySigPrompt,
      [{ text: 'Count the exact number of sharp # or flat b symbols in the key signature zone.' },
       ...(keyRegionPart ? [keyRegionPart] : processedParts.slice(0, 1))],
      { temperature: 0, maxOutputTokens: 1024, thinkingBudget: 512 }
    ),
    // Key sig read 2: Pro with full image (independent)
    callGemini(apiKey, solfegeKeySigPrompt,
      [{ text: 'Independent read: count sharps or flats between clef and time signature.' },
       ...processedParts.slice(0, 1)],
      { temperature: 0, maxOutputTokens: 1024, thinkingBudget: 512 }
    ),
    // Key sig read 3: Flash (tie-breaker)
    callGemini(apiKey, solfegeKeySigPrompt,
      [{ text: 'Third independent count: sharps or flats in key signature.' },
       ...processedParts.slice(0, 1)],
      { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 64, thinkingBudget: 0 }
    ),
  ]);

  let staffInfo = { vocal_staff_number: 1, total_staves: 1, clef: 'treble' };
  try { staffInfo = JSON.parse(staffRaw.replace(/```json?|```/gi, '').trim()); }
  catch (e) { /* use defaults */ }

  // Parse and vote on key signature
  const keyReadResults = [keySig1Raw, keySig2Raw, keySig3Raw];
  const keySigVotes = [];
  for (let i = 0; i < keyReadResults.length; i++) {
    try {
      const ks = JSON.parse(keyReadResults[i].replace(/```json?|```/gi, '').trim());
      keySigVotes.push({
        flats: Number(ks.flats) || 0,
        sharps: Number(ks.sharps) || 0,
        weight: i < 2 ? WEIGHT_PRO : WEIGHT_FLASH,
      });
    } catch (e) { /* skip */ }
  }

  const votedFlats = Number(weightedVote(keySigVotes.map(v => ({ value: v.flats, weight: v.weight })))) || 0;
  const votedSharps = Number(weightedVote(keySigVotes.map(v => ({ value: v.sharps, weight: v.weight })))) || 0;

  // Solfege path reads the key signature before notes are extracted, so there's no
  // note evidence here — mode detection defaults to major and we use the tonic only.
  const keyResult = resolveKeyFromCounts(votedFlats, votedSharps, [], [], null);
  const extractedKey = keyResult.codeSaid || keyResult.key;
  console.log(`[Solfai] Key sig voted: ${keySigVotes.map(v => `${v.flats}b/${v.sharps}s`).join(', ')} → ${extractedKey}`);

  const clefRef = staffInfo.clef === 'bass'
    ? `BASS CLEF — Lines bottom→top: G2 B2 D3 F3 A3. Spaces: A2 C3 E3 G3.`
    : staffInfo.clef === 'treble-8'
      ? `TREBLE-8 CLEF (all pitches one octave LOWER than treble) — Lines: E3 G3 B3 D4 F4. Spaces: F3 A3 C4 E4.`
      : `TREBLE CLEF — Lines bottom→top: E4 G4 B4 D5 F5. Spaces: F4 A4 C5 E5.
A note ON a line: line through center of head. A note IN a space: between two lines.
CRITICAL: 3rd line = B4, 3rd space = C5 — they look close but differ.
Middle C (C4) = first ledger line below staff.`;

  const scaleNotes = extractedKey ? Scale.get(extractedKey + ' major').notes.join(', ') : '';
  const keyConstraint = extractedKey
    ? `\nKEY SIGNATURE CONSTRAINT: This piece is in ${extractedKey}. Scale notes: ${scaleNotes}. Every note with a key sig accidental MUST include it unless cancelled by a natural sign (♮).`
    : '';

  const outputFormat = `Output ONLY a JSON array of measure objects. Each: {"num": 1, "notes": ["C4","D4","E4"], "lyrics": "glo-ri-a", "pickup": false, "repeatStart": false, "repeatEnd": false, "keyChange": null}
Rules:
- If measure 1 has fewer beats than the time signature indicates, mark it as "pickup": true (anacrusis)
- Note any repeat signs: set "repeatStart": true if measure begins with ||: and "repeatEnd": true if measure ends with :||
- If D.C., D.S., or coda symbols appear, include "direction": "D.C." / "D.S." / "coda" on that measure
- If the key signature changes mid-piece, set "keyChange": "new key name" on the measure where it changes
- If the clef changes mid-piece (e.g., treble to bass or vice versa), add "clefChange": "bass" or "clefChange": "treble" on that measure. Re-read all subsequent notes using the new clef reference.
- Include accidentals: Bb4, F#4, Eb5
- Key signature accidentals apply to ALL notes of that pitch class unless cancelled by natural
- Use [?] for unreadable notes
- Include ALL visible measures across ALL pages
- Vocal range check: Soprano C4-G5, Alto G3-E5, Tenor C3-A4, Bass E2-E4
- IGNORE watermark text completely${keyConstraint}`;

  const sysBase = `You are a professional music copyist transcribing choral music with extreme precision.
Target: Staff #${staffInfo.vocal_staff_number} from the top — ${part} vocal part.
${clefRef}

${WATERMARK_NOTE}

STAFF IDENTIFICATION — verify you are on the correct staff before reading notes:
- Count staves top to bottom in the first system.
- Check stem direction: stems UP = higher voice (Soprano/Tenor); stems DOWN = lower voice (Alto/Bass).
- Verify your staff has LYRICS underneath it (vocal staves always have text syllables below notes).
- If you see a grand staff bracket with no lyrics = piano accompaniment — SKIP IT entirely.

NOTE READING PROCEDURE — apply to EVERY note individually:
1. Is the note head ON a line (a line passes through the middle of the oval) or IN a space (the oval sits between two lines)?
2. Count from the BOTTOM of the staff: bottom line = 1, first space = 1, second line = 2, etc.
3. Look up pitch from the clef reference above.
4. Check for accidentals DIRECTLY before this note (♯ ♭ ♮) — only if within the same measure.
5. Apply key signature accidentals UNLESS a natural sign (♮) cancels them.
6. Verify octave: notes above the top line are octave 5 (treble), notes below bottom line go down an octave.
7. Ledger lines above top staff line: G5 (1 ledger), B5 (space above 1st ledger), D6 (2nd ledger). Below: C4 (1 ledger below bottom = middle C), A3 (space below 1st ledger).

TIED NOTES vs REPEATED NOTES — CRITICAL:
- TIE = curved line connecting two note heads of THE SAME pitch → count as ONE note
- SLUR = curved line over DIFFERENT pitches → these are SEPARATE notes, count each
- Rule: same pitch + curved connection = tie = output only once

${outputFormat}`;

  const sysVerify = `You are double-checking a music transcription with extreme care.
Staff #${staffInfo.vocal_staff_number} from the top — ${part} vocal part.
${clefRef}

${WATERMARK_NOTE}

Read EVERY note TWICE before writing it. For each note:
1. Confirm: is the note head ON a line or IN a space?
2. Which line/space counting from the bottom?
3. What pitch does that position name in this clef?
4. Are there key signature accidentals applying to this note?
5. Are there any accidentals (♯ ♭ ♮) directly before this note in this measure?

Pay special attention to these common errors:
- B4 vs C5: the 3rd line (B4) vs 3rd space (C5) look very similar — is the note ON the line or in the space?
- Key signature accidentals: every note of that pitch class carries the accidental unless cancelled by ♮
- Octave number: count carefully for notes on or near ledger lines
- Tied notes: same pitch connected by a curve = count ONCE only

${outputFormat}`;

  function parseExtraction(raw) {
    try {
      const cleaned = raw.replace(/```json?|```/gi, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed.measures)) return parsed.measures;
      return [];
    } catch (e) {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) { try { return JSON.parse(match[0]); } catch (e2) { /* ignore */ } }
      return [];
    }
  }

  // Step 2: Try image segmentation for tall images
  let segmentedMeasures = null;
  if (firstJpeg) {
    const segments = await segmentImage(firstJpeg.inlineData.data, 4);
    if (segments) {
      console.log(`[Solfai] Image segmented into ${segments.length} strips`);
      try {
        const segResults = await Promise.all(segments.map((seg, idx) =>
          callGemini(apiKey, sysBase,
            [{ text: `Extract notes for ${part} from segment ${idx + 1} of ${segments.length}. JSON array only.` },
            { inlineData: { mimeType: 'image/jpeg', data: seg } }],
            { temperature: 0, maxOutputTokens: 4096, thinkingBudget: 4000 }
          )
        ));
        segmentedMeasures = segResults.flatMap(r => parseExtraction(r));
        // Re-number measures sequentially
        segmentedMeasures.forEach((m, i) => { m.num = i + 1; });
      } catch (e) {
        console.warn('[Solfai] Segmented extraction failed:', e.message);
      }
    }
  }

  // Step 3: FIVE extractions in PARALLEL (3x Pro + 2x Flash)
  const extractionPromises = [
    // Pro extraction 1
    callGemini(apiKey, sysBase,
      [{ text: `Extract all notes for ${part} (staff #${staffInfo.vocal_staff_number}). JSON array only.` }, ...processedParts],
      { temperature: 0, maxOutputTokens: 8192, thinkingBudget: 8000 }
    ),
    // Pro extraction 2 (verification)
    callGemini(apiKey, sysVerify,
      [{ text: `Verification pass — carefully re-read each note for ${part} (staff #${staffInfo.vocal_staff_number}). JSON array only.` }, ...processedParts],
      { temperature: 0, maxOutputTokens: 8192, thinkingBudget: 8000 }
    ),
    // Pro extraction 3 (with high contrast image)
    callGemini(apiKey, sysBase,
      [{ text: `Third independent read: Extract all notes for ${part} (staff #${staffInfo.vocal_staff_number}). JSON array only.` },
       ...(highContrastParts.length ? highContrastParts : processedParts)],
      { temperature: 0, maxOutputTokens: 8192, thinkingBudget: 8000 }
    ),
    // Flash extraction 1
    callGemini(apiKey, sysBase,
      [{ text: `Extract all notes for ${part} (staff #${staffInfo.vocal_staff_number}). JSON array only.` }, ...processedParts],
      { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 4096, thinkingBudget: 0 }
    ),
    // Flash extraction 2
    callGemini(apiKey, sysVerify,
      [{ text: `Verify and extract all notes for ${part} (staff #${staffInfo.vocal_staff_number}). JSON array only.` },
       ...(highContrastParts.length ? highContrastParts : processedParts)],
      { model: GEMINI_FLASH, temperature: 0, maxOutputTokens: 4096, thinkingBudget: 0 }
    ),
  ];

  // allSettled so one extraction that exhausts its retries (e.g. persistent
  // MAX_TOKENS) doesn't crash the whole request — we reconcile from whatever survives.
  const extractionSettled = await Promise.allSettled(extractionPromises);
  const extractionResults = extractionSettled.map((s, i) => {
    if (s.status === 'fulfilled') return s.value;
    console.warn(`[Solfai] Note extraction ${i} failed: ${s.reason?.message || s.reason}`);
    return null;
  });

  const measureSets = extractionResults.map(r => parseExtraction(r));
  // Include segmented results if available
  if (segmentedMeasures?.length) measureSets.push(segmentedMeasures);

  // If every extraction came back empty (e.g. all hit MAX_TOKENS), there is nothing
  // to reconcile — warn so the trace shows why the note output is thin.
  if (measureSets.every(s => !s || s.length === 0)) {
    trace?.warn('NOTES_FALLBACK', { reason: 'all note extractions empty (possible MAX_TOKENS)', usingFirstNotesOnly: true });
  }

  const tonic = extractedKey?.split(' ')[0] || 'C';
  console.log(`[Solfai] Extractions: ${measureSets.map((s, i) => `${i < 3 ? 'Pro' : i < 5 ? 'Flash' : 'Seg'}=${s.length}m`).join(', ')}, tonic=${tonic}`);

  // Step 4: Note-by-note reconciliation across ALL extractions
  const reconciledMeasures = noteByNoteReconcile(measureSets, tonic, part);

  // Step 5: Music theory validation
  const theoryCorrections = validateAndFixNotes(reconciledMeasures, tonic, part);
  if (theoryCorrections > 0) {
    console.log(`[Solfai] Theory validation corrected ${theoryCorrections} notes`);
  }

  // Step 5b: Interval plausibility sweep — fix residual octave errors that survived voting
  const intervalFixes = fixLargeIntervalErrors(reconciledMeasures, part);
  if (intervalFixes > 0) {
    console.log(`[Solfai] Interval plausibility: corrected ${intervalFixes} large leap(s)`);
  }

  // Step 6: Code-calculate solfege, scale degrees, and intervals
  const VALID_SOLFEGE = new Set(['Do', 'Di', 'Re', 'Ri', 'Me', 'Mi', 'Fa', 'Fi', 'Sol', 'Si', 'La', 'Li', 'Te', 'Ti', '?']);
  for (const m of reconciledMeasures) {
    m.solfege = (m.notes || []).map(n =>
      n === '[?]' ? '?' : noteToSolfege(n.replace(/\d+$/, ''), tonic)
    );
    m.scaleDegrees = (m.notes || []).map(n =>
      n === '[?]' ? null : noteToScaleDegree(n.replace(/\d+$/, ''), tonic)
    );
    m.intervals = (m.notes || []).map((n, i, arr) => {
      if (i === 0 || n === '[?]' || arr[i - 1] === '[?]') return null;
      return getIntervalName(arr[i - 1], n);
    });
    m.valid = m.solfege.every(s => VALID_SOLFEGE.has(s));
  }

  // Step 7: Duration validation — flag measures with implausible note counts
  // Extract time signature from the first measure's context or infer from note counts
  const timeSigFromMeasures = reconciledMeasures.find(m => m.timeSig)?.timeSig || null;
  const beatsPerMeasure = timeSigFromMeasures ? getBeatsPerMeasure(timeSigFromMeasures) : null;
  let durationWarnings = 0;
  if (beatsPerMeasure) {
    // Max plausible notes per measure: beats * 4 (allowing sixteenth notes)
    // Min plausible notes (non-pickup): 1
    const maxNotesPlausible = Math.ceil(beatsPerMeasure * 4);
    for (const m of reconciledMeasures) {
      const noteCount = (m.notes || []).filter(n => n !== '[?]').length;
      if (noteCount > maxNotesPlausible && !m.pickup) {
        m.durationWarning = `Too many notes (${noteCount}) for ${timeSigFromMeasures} (max ~${maxNotesPlausible})`;
        durationWarnings++;
      } else if (noteCount === 0 && !m.pickup) {
        m.durationWarning = 'Empty measure — possible extraction error';
        durationWarnings++;
      }
    }
  } else {
    // No time sig available: use median note count to flag outliers
    const noteCounts = reconciledMeasures
      .filter(m => !m.pickup && (m.notes || []).length > 0)
      .map(m => (m.notes || []).length);
    if (noteCounts.length >= 3) {
      const sorted = [...noteCounts].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const threshold = Math.max(median * 3, 12);
      for (const m of reconciledMeasures) {
        const noteCount = (m.notes || []).filter(n => n !== '[?]').length;
        if (noteCount > threshold && !m.pickup) {
          m.durationWarning = `Unusually many notes (${noteCount}) — median is ${median}. Possible extraction error.`;
          durationWarnings++;
        }
      }
    }
  }
  if (durationWarnings > 0) {
    console.log(`[Solfai] Duration validation: ${durationWarnings} measures flagged`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const highConfCount = reconciledMeasures.filter(m => m.confidence === 'high').length;
  console.log(`[Solfai] Solfege complete: ${reconciledMeasures.length} measures (${highConfCount} high-conf) in ${elapsed}s`);

  // Build text output
  let textOutput = `Key: ${tonic} (Do = ${tonic})\nStaff: ${part} (staff #${staffInfo.vocal_staff_number} of ${staffInfo.total_staves || 1})\n\n`;
  for (const m of reconciledMeasures) {
    textOutput += `m.${m.num}:\n`;
    textOutput += `  Notes:   ${(m.notes || []).join(' ')}\n`;
    textOutput += `  Solfege: ${(m.solfege || []).join(' ')}\n`;
    textOutput += `  Lyrics:  "${m.lyrics || ''}"\n`;
    if (m.confidence !== 'high') textOutput += `  ⚠ Confidence: ${m.confidence}\n`;
    if (m.durationWarning) textOutput += `  ⚠ Duration: ${m.durationWarning}\n`;
    textOutput += '\n';
  }

  if (!reconciledMeasures.length) {
    textOutput += 'No measures could be extracted. Try uploading a clearer image.';
  }

  return res.status(200).json({
    structured: {
      key: tonic,
      tonic,
      staffNum: staffInfo.vocal_staff_number,
      totalStaves: staffInfo.total_staves || 1,
      clef: staffInfo.clef || 'treble',
      measures: reconciledMeasures,
      disagreements: reconciledMeasures.filter(m => m.disagreement).length,
      theoryCorrections,
      durationWarnings,
      extractionCount: measureSets.length,
      highConfidenceCount: highConfCount,
    },
    text: textOutput,
  });
}

// ─── RHYTHM ───────────────────────────────────────────────
async function handleRhythm(res, apiKey, imageParts, part, trace = null) {
  const processedParts = await Promise.all(
    imageParts.slice(0, 4).map(async (p) => {
      if (p.inlineData?.mimeType === 'image/jpeg') {
        try {
          const enhanced = await preprocessForGemini(p.inlineData.data, 'full');
          return { inlineData: { mimeType: 'image/jpeg', data: enhanced } };
        } catch (e) { return p; }
      }
      return p;
    })
  );

  const systemPrompt = `You are a rhythm coach helping a choir singer learn their part.
Skip title/cover pages.
${WATERMARK_NOTE}
SATB: Soprano=top treble stems up, Alto=bottom treble stems down, Tenor=top bass/treble-8 stems up, Bass=bottom bass stems down.`;

  const userText = `For the ${part} voice, provide a complete rhythm guide:

1. State the time signature and what note value gets one beat.
2. For each visible measure:
   m.X: Beat pattern: "1 + 2 + 3 + 4 +" | Note values: [list] | Watch out for: [tricky rhythm]

Counting patterns:
- 4/4: "1 + 2 + 3 + 4 +"
- 3/4: "1 + 2 + 3 +"
- 6/8: "1-la-li 2-la-li"
- 2/4: "1 + 2 +"
- 2/2 (cut time): "1 + 2 +"
- 4/8: "1-e-+ 2-e-+"

Be thorough. Include ALL measures across all pages.`;

  const text = await callGemini(apiKey, systemPrompt,
    [{ text: userText }, ...processedParts],
    { temperature: 0, thinkingBudget: 6000 }
  );
  return res.status(200).json({ text });
}

// ─── CHAT ─────────────────────────────────────────────────
async function handleChat(res, apiKey, messages, imageParts, part, trace = null) {
  const systemPrompt = `You are Solfai, a patient and encouraging choir director and music theory coach. The student sings ${part}.
Always reference the actual sheet music. Only cite content you can see in the images.
Be warm, specific, and practical. Use movable Do solfege.
Never invent measures or notes not in the score.
Skip title/cover pages.
${WATERMARK_NOTE}
SATB: Soprano=top treble stems up, Alto=bottom treble stems down, Tenor=top bass/treble-8 stems up, Bass=bottom bass stems down.`;

  const contents = [];
  const chatImages = imageParts.slice(0, 3);
  let attached = false;

  if (messages?.length > 0) {
    for (const msg of messages) {
      if (msg.role === 'user') {
        const parts = [{ text: msg.parts?.[0]?.text || msg.text || '' }];
        if (!attached) { parts.push(...chatImages); attached = true; }
        contents.push({ role: 'user', parts });
      } else if (msg.role === 'model') {
        contents.push({ role: 'model', parts: [{ text: msg.parts?.[0]?.text || msg.text || '' }] });
      }
    }
  }
  if (!contents.length) {
    contents.push({ role: 'user', parts: [{ text: 'Help me with this sheet music.' }, ...chatImages] });
  }

  const url = geminiUrl(GEMINI_MODEL);

  const body = {
    contents,
    system_instruction: { parts: [{ text: systemPrompt }] },
    generation_config: {
      temperature: 0.7,
      max_output_tokens: 4096,
      thinking_config: { thinking_budget: 4000 },
      media_resolution: 'MEDIA_RESOLUTION_HIGH',
    },
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: geminiHeaders(apiKey),
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      let detail = `Gemini error: ${resp.status}`;
      try { detail = JSON.parse(errText).error?.message || detail; } catch (e) { /* ignore */ }
      if ((resp.status === 429 || resp.status >= 500) && attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, attempt * 2000));
        continue;
      }
      throw new Error(detail);
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.filter(p => p.text && !p.thought)
      .map(p => p.text).join('') || '';

    return res.status(200).json({ text: text.trim() });
  }
}

// ─── Evaluate Singing ─────────────────────────────────────
app.post('/api/evaluate-singing', upload.single('audio'), async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

  const filePath = req.file.path;
  try {
    const { pieceTitle, keySignature, startingPitch, solfege, selectedPart } = req.body;
    const audioBuffer = readFileSync(filePath);
    const audioBase64 = audioBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'audio/webm';

    const systemPrompt = `You are a professional choir director and vocal coach evaluating a student's singing. Be encouraging, specific, and constructive. Always find something positive first.`;

    const userText = `Listen to this audio of a student singing. They are a ${selectedPart || 'choir'} singer.
Context: ${pieceTitle ? `Piece: "${pieceTitle}"` : 'Unknown piece'}, Key: ${keySignature || 'unknown'}, Starting pitch: ${startingPitch || 'unknown'}.
${solfege ? `Expected solfege: ${solfege}` : ''}

Evaluate as a professional choir director. Return ONLY valid JSON:
{
  "overallScore": <integer 0-100>,
  "pitchAccuracy": <integer 0-100>,
  "toneQuality": <integer 0-100>,
  "breathSupport": <integer 0-100>,
  "vowelShape": <integer 0-100>,
  "rhythm": <integer 0-100>,
  "diction": <integer 0-100>,
  "detailedFeedback": "<2-3 sentences of warm, specific, constructive feedback>",
  "actionItems": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "strengths": ["<positive observation 1>", "<positive observation 2>"]
}

Most student singers score 40-75. Only score below 30 if clearly off-pitch or unclear.`;

    const url = geminiUrl(GEMINI_MODEL);
    const body = {
      contents: [{ role: 'user', parts: [
        { text: userText },
        { inlineData: { mimeType, data: audioBase64 } }
      ] }],
      system_instruction: { parts: [{ text: systemPrompt }] },
      generation_config: {
        temperature: 0.3,
        max_output_tokens: 1024,
        response_mime_type: 'application/json',
        thinking_config: { thinking_budget: 2000 },
      },
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: geminiHeaders(apiKey),
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      let detail = `Gemini error: ${resp.status}`;
      try { detail = JSON.parse(errText).error?.message || detail; } catch (e) { /* ignore */ }
      throw new Error(detail);
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts
      ?.filter(p => p.text && !p.thought).map(p => p.text).join('') || '{}';

    let result;
    try {
      result = JSON.parse(text.replace(/```json?|```/gi, '').trim());
    } catch (e) {
      result = {
        overallScore: 60, pitchAccuracy: 60, toneQuality: 60,
        breathSupport: 60, vowelShape: 60, rhythm: 60, diction: 60,
        detailedFeedback: 'Great effort! Keep practicing.',
        actionItems: ['Focus on pitch accuracy', 'Work on breath support', 'Practice regularly'],
        strengths: ['Good effort', 'Consistent rhythm']
      };
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[Solfai] Evaluate-singing error:', err.message);
    return res.status(500).json({ error: err.message });
  } finally {
    try { unlinkSync(filePath); } catch (e) { /* ignore */ }
  }
});

// ─── MusicXML Parser (MuseScore-style) ───────────────────
// Pitch:    step + alter + octave → e.g. "F#4", "Bb3"
// Duration: <type> fraction × dots × tuplet ratio
// Validate: sum durations per measure vs time signature
// Also extracts: tempo, dynamics, rehearsal marks, multi-verse lyrics, clef changes
function parseMusicXML(xmlString, targetPart) {
  // ── Part list ─────────────────────────────────────────────
  const partList = [];
  const partListMatch = xmlString.match(/<part-list>([\s\S]*?)<\/part-list>/);
  if (partListMatch) {
    const partRegex = /<score-part\s+id="([^"]+)"[\s\S]*?<part-name>([^<]*)<\/part-name>/g;
    let pm;
    while ((pm = partRegex.exec(partListMatch[1])) !== null) {
      partList.push({ id: pm[1], name: pm[2].trim() });
    }
  }

  const target = (targetPart || 'Soprano').toLowerCase();
  let partId = partList[0]?.id || 'P1';
  for (const p of partList) {
    if (p.name.toLowerCase().includes(target)) { partId = p.id; break; }
  }

  // ── Key signature ─────────────────────────────────────────
  let fifths = 0;
  const fifthsMatch = xmlString.match(/<fifths>(-?\d+)<\/fifths>/);
  if (fifthsMatch) fifths = parseInt(fifthsMatch[1], 10);

  const modeMatch = xmlString.match(/<mode>(major|minor)<\/mode>/i);
  const mode = modeMatch ? modeMatch[1].toLowerCase() : 'major';

  const sharpCount = fifths > 0 ? fifths : 0;
  const flatCount  = fifths < 0 ? Math.abs(fifths) : 0;
  const code = sharpCount > 0 ? `${sharpCount}s` : flatCount > 0 ? `${flatCount}b` : '0';
  const keyEntry = KEY_FROM_COUNT[code];
  const keySignature = keyEntry ? (keyEntry[mode] || keyEntry.major) : 'C major';
  const tonic = keySignature.split(' ')[0];

  // ── Time signature ────────────────────────────────────────
  let timeSignature = '4/4';
  const beatsMatch    = xmlString.match(/<beats>(\d+)<\/beats>/);
  const beatTypeMatch = xmlString.match(/<beat-type>(\d+)<\/beat-type>/);
  if (beatsMatch && beatTypeMatch) timeSignature = `${beatsMatch[1]}/${beatTypeMatch[1]}`;

  // ── Title & composer ──────────────────────────────────────
  const SOFTWARE_NAMES = /music21|sibelius|finale|musescore|audiveris|lilypond|dorico|noteflight|flat\.io/i;
  const titleMatch = xmlString.match(/<movement-title>([^<]+)<\/movement-title>/)
    || xmlString.match(/<work-title>([^<]+)<\/work-title>/);
  const pieceTitle = titleMatch ? titleMatch[1].trim() : null;
  const composerRaw = (xmlString.match(/<creator[^>]*type="composer"[^>]*>([^<]+)<\/creator>/)
    || xmlString.match(/<creator[^>]*>([^<]+)<\/creator>/) || [])[1]?.trim() || null;
  const composerName = composerRaw && !SOFTWARE_NAMES.test(composerRaw) ? composerRaw : null;

  // ── Duration table (fraction of a whole note) ─────────────
  const TYPE_FRACTION = {
    'breve': 2, 'whole': 1, 'half': 0.5, 'quarter': 0.25,
    'eighth': 0.125, '16th': 0.0625, '32nd': 0.03125, '64th': 0.015625,
  };

  function calcDuration(noteXml) {
    const tm = noteXml.match(/<type>([^<]+)<\/type>/);
    if (!tm) return null;
    const base = TYPE_FRACTION[tm[1].trim()];
    if (base === undefined) return null;
    const dotCount = (noteXml.match(/<dot\/>/g) || []).length;
    let dur = base, add = base / 2;
    for (let i = 0; i < dotCount; i++) { dur += add; add /= 2; }
    const am = noteXml.match(/<actual-notes>(\d+)<\/actual-notes>/);
    const nm2 = noteXml.match(/<normal-notes>(\d+)<\/normal-notes>/);
    if (am && nm2) {
      const actual = parseInt(am[1], 10), normal = parseInt(nm2[1], 10);
      if (actual > 0) dur = dur * normal / actual;
    }
    return dur;
  }

  // ── Extract directions from a measure block ────────────────
  // Returns { tempoChanges, dynamicChanges, rehearsalMarks }
  const DYNAMIC_TAGS = ['ppppp','pppp','ppp','pp','mp','mf','ffff','fff','ff','sfzp','sfz','sfp','sf','fp','rfz','rf','fz','sff','pf','n','f','p'];
  function extractDirections(measureXml, measureNum) {
    const tempoEntries = [], dynEntries = [], rehearsals = [];
    const dirRegex = /<direction[^>]*>([\s\S]*?)<\/direction>/g;
    let dm;
    while ((dm = dirRegex.exec(measureXml)) !== null) {
      const dx = dm[1];

      // Tempo: <words> text + optional <metronome>
      const wordsM  = dx.match(/<words[^>]*>([^<]{1,80})<\/words>/);
      const bpmM    = dx.match(/<per-minute>([\d.]+)<\/per-minute>/);
      const buM     = dx.match(/<beat-unit>([^<]+)<\/beat-unit>/);
      // <sound tempo> inside direction or measure
      const soundM  = dx.match(/<sound[^>]+\btempo="([\d.]+)"/);

      const wordsText = wordsM ? wordsM[1].trim() : null;
      const bpm = bpmM ? parseFloat(bpmM[1]) : soundM ? parseFloat(soundM[1]) : null;
      const beatUnit = buM ? buM[1].trim() : 'quarter';

      if (wordsText || bpm !== null) {
        tempoEntries.push({ measure: measureNum, text: wordsText, bpm, beatUnit });
      }

      // Dynamics block
      const dynBlockM = dx.match(/<dynamics[^>]*>([\s\S]*?)<\/dynamics>/);
      if (dynBlockM) {
        for (const tag of DYNAMIC_TAGS) {
          if (dynBlockM[1].includes(`<${tag}/>`)) {
            dynEntries.push({ measure: measureNum, mark: tag });
            break;
          }
        }
      }
      // Wedge (crescendo / diminuendo)
      const wedgeM = dx.match(/<wedge[^>]+type="(crescendo|diminuendo|stop)"/);
      if (wedgeM && wedgeM[1] !== 'stop') {
        dynEntries.push({ measure: measureNum, mark: wedgeM[1] === 'crescendo' ? 'cresc.' : 'dim.' });
      }

      // Rehearsal mark
      const rehearsalM = dx.match(/<rehearsal[^>]*>([^<]+)<\/rehearsal>/);
      if (rehearsalM) rehearsals.push({ measure: measureNum, mark: rehearsalM[1].trim() });
    }

    // <sound tempo> at measure level (outside direction)
    const msoundM = measureXml.match(/<sound[^>]+\btempo="([\d.]+)"/);
    if (msoundM && !tempoEntries.some(t => t.bpm === parseFloat(msoundM[1]))) {
      tempoEntries.push({ measure: measureNum, text: null, bpm: parseFloat(msoundM[1]), beatUnit: 'quarter' });
    }

    return { tempoEntries, dynEntries, rehearsals };
  }

  // ── Part XML ──────────────────────────────────────────────
  const partRx = new RegExp(`<part\\s+id="${partId}"[^>]*>([\\s\\S]*?)<\\/part>`);
  const partMatch = xmlString.match(partRx);
  if (!partMatch) {
    return { error: `Could not find part "${targetPart}" in the MusicXML file.`, parts: partList };
  }

  const defaultExpected = getBeatsPerMeasure(timeSignature) / 4;
  const partXml = partMatch[1];
  const measures = [];
  const allTempoChanges = [];
  const allDynamicChanges = [];
  const allRehearsalMarks = [];
  const clefChanges = [];

  // Track current clef (from measure 1 attributes)
  let currentClef = 'treble';

  const measureRegex = /<measure[^>]*number="(\d+)"[^>]*>([\s\S]*?)<\/measure>/g;
  let mm;
  while ((mm = measureRegex.exec(partXml)) !== null) {
    const measureNum = parseInt(mm[1], 10);
    const measureXml = mm[2];
    const notes = [], durations = [];
    const lyricsByVerse = {}; // { '1': ['A','ve'], '2': ['A','men'] }
    let totalDur = 0, hasValidDur = false;

    // Per-measure time-sig override
    const mb  = measureXml.match(/<beats>(\d+)<\/beats>/);
    const mbt = measureXml.match(/<beat-type>(\d+)<\/beat-type>/);
    const expected = (mb && mbt) ? parseInt(mb[1]) / parseInt(mbt[1]) : defaultExpected;

    // Clef: initial clef in measure 1, then detect mid-piece changes
    const clefM = measureXml.match(/<clef[^>]*>([\s\S]*?)<\/clef>/);
    if (clefM) {
      const signM = clefM[1].match(/<sign>([A-Z])<\/sign>/);
      if (signM) {
        const newClef = signM[1] === 'G' ? 'treble' : signM[1] === 'F' ? 'bass' : signM[1] === 'C' ? 'alto/tenor' : signM[1];
        if (measureNum === 1) {
          currentClef = newClef;
        } else if (newClef !== currentClef) {
          clefChanges.push({ measure: measureNum, from: currentClef, to: newClef });
          currentClef = newClef;
        }
      }
    }

    // Direction elements (tempo, dynamics, rehearsal)
    const { tempoEntries, dynEntries, rehearsals } = extractDirections(measureXml, measureNum);
    allTempoChanges.push(...tempoEntries);
    allDynamicChanges.push(...dynEntries);
    allRehearsalMarks.push(...rehearsals);

    // Notes
    const noteRegex = /<note>([\s\S]*?)<\/note>/g;
    let nm;
    while ((nm = noteRegex.exec(measureXml)) !== null) {
      const noteXml = nm[1];
      const isChord = noteXml.includes('<chord');
      const isRest  = noteXml.includes('<rest');

      const dur = calcDuration(noteXml);
      if (dur !== null && !isChord) { totalDur += dur; hasValidDur = true; }

      if (isRest || isChord) continue;

      const stepM   = noteXml.match(/<step>([A-G])<\/step>/);
      const octaveM = noteXml.match(/<octave>(\d)<\/octave>/);
      const alterM  = noteXml.match(/<alter>(-?[\d.]+)<\/alter>/);

      if (stepM && octaveM) {
        let n = stepM[1];
        const alter = alterM ? parseFloat(alterM[1]) : 0;
        if      (alter ===  2) n += '##';
        else if (alter ===  1) n += '#';
        else if (alter === -1) n += 'b';
        else if (alter === -2) n += 'bb';
        n += octaveM[1];
        notes.push(n);
        if (dur !== null) durations.push(dur);
      }

      // Multi-verse lyrics: capture each <lyric number="N">
      const lyricRx = /<lyric(?:\s[^>]*)?>[\s\S]*?<text>([^<]*)<\/text>[\s\S]*?<\/lyric>/g;
      let lm;
      while ((lm = lyricRx.exec(noteXml)) !== null) {
        // Determine verse number from the outer <lyric number="N"> tag
        const verseM = lm[0].match(/number="(\d+)"/);
        const verse = verseM ? verseM[1] : '1';
        if (!lyricsByVerse[verse]) lyricsByVerse[verse] = [];
        lyricsByVerse[verse].push(lm[1]);
      }
    }

    // Duration validation
    let durationWarning = null;
    if (hasValidDur) {
      const diff = Math.abs(totalDur - expected);
      if (diff > 0.01) {
        const got = +(totalDur * 4).toFixed(3);
        const exp = +(expected * 4).toFixed(3);
        durationWarning = `got ${got} beats, expected ${exp} (${timeSignature})`;
      }
    }

    if (notes.length > 0 || durationWarning) {
      measures.push({
        num: measureNum, notes, durations,
        lyrics: lyricsByVerse['1']?.join(' ') || '',
        lyrics2: lyricsByVerse['2']?.join(' ') || undefined,
        durationWarning,
      });
    }
  }

  // ── Fallback: if no tempo found in target part, scan the whole document ──
  if (allTempoChanges.length === 0) {
    const bpmM    = xmlString.match(/<per-minute>([\d.]+)<\/per-minute>/);
    const soundM  = xmlString.match(/<sound[^>]+\btempo="([\d.]+)"/);
    const wordsM  = xmlString.match(/<words[^>]*>([^<]{2,80})<\/words>/);
    const bpm     = bpmM ? parseFloat(bpmM[1]) : soundM ? parseFloat(soundM[1]) : null;
    const text    = wordsM ? wordsM[1].trim() : null;
    if (bpm !== null || text) allTempoChanges.push({ measure: 1, text, bpm, beatUnit: 'quarter', global: true });
  }

  // ── Merge tempo entries from the same measure ─────────────
  // Text and BPM often appear in adjacent <direction> elements
  const mergedTempoChanges = [];
  for (const t of allTempoChanges) {
    const last = mergedTempoChanges[mergedTempoChanges.length - 1];
    if (last && last.measure === t.measure) {
      if (!last.text && t.text) last.text = t.text;
      if (last.bpm === null && t.bpm !== null) { last.bpm = t.bpm; last.beatUnit = t.beatUnit; }
    } else {
      mergedTempoChanges.push({ ...t });
    }
  }

  // ── Format the initial tempo for display ──────────────────
  let tempoDisplay = null;
  const firstTempo = mergedTempoChanges[0] || null;
  if (firstTempo) {
    const parts = [];
    if (firstTempo.text) parts.push(firstTempo.text);
    if (firstTempo.bpm) parts.push(`♩=${Math.round(firstTempo.bpm)}`);
    tempoDisplay = parts.join(' ') || null;
  }

  return {
    tonic, keySignature, timeSignature, mode,
    measures, partId, partList, sharpCount, flatCount,
    pieceTitle, composerName,
    initialClef: currentClef,
    tempo: { display: tempoDisplay, text: firstTempo?.text || null, bpm: firstTempo?.bpm || null },
    tempoChanges: mergedTempoChanges,
    openingDynamic: allDynamicChanges[0]?.mark || null,
    dynamicChanges: allDynamicChanges,
    rehearsalMarks: allRehearsalMarks,
    clefChanges,
  };
}

// ─── MusicXML Upload Route ────────────────────────────────
const musicxmlUpload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 10 * 1024 * 1024 } });
app.post('/api/parse-musicxml', musicxmlUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const filePath = req.file.path;
  try {
    const selectedPart = req.body.selectedPart || 'Soprano';
    const apiKey = process.env.GEMINI_API_KEY;
    let xmlString;

    const originalName = (req.file.originalname || '').toLowerCase();
    const buf = readFileSync(filePath);

    if (originalName.endsWith('.mxl') || (buf[0] === 0x50 && buf[1] === 0x4B)) {
      const zip = new AdmZip(buf);
      const entries = zip.getEntries();
      // Prefer .musicxml inside the archive, skip META-INF
      const xmlEntry = entries.find(e =>
        !e.entryName.startsWith('META-INF') && e.entryName.endsWith('.musicxml')
      ) || entries.find(e =>
        !e.entryName.startsWith('META-INF') && e.entryName.endsWith('.xml')
      );
      if (!xmlEntry) return res.status(400).json({ error: 'No MusicXML file found inside the .mxl archive.' });
      xmlString = xmlEntry.getData().toString('utf8');
    } else {
      xmlString = buf.toString('utf8');
    }

    if (!xmlString.includes('<score-partwise') && !xmlString.includes('<score-timewise')) {
      return res.status(400).json({ error: 'This does not appear to be a valid MusicXML file.' });
    }

    const result = parseMusicXML(xmlString, selectedPart);
    if (result.error) return res.status(400).json(result);

    // ── Solfege (tonal.js — never Gemini) ───────────────────
    const VALID_SOLFEGE = new Set(['Do','Di','Re','Ri','Me','Mi','Fa','Fi','Sol','Si','La','Li','Te','Ti','?']);
    const durationWarnings = [];
    for (const m of result.measures) {
      m.solfege = (m.notes || []).map(n => noteToSolfege(n.replace(/\d+$/, ''), result.tonic));
      m.valid = m.solfege.every(s => VALID_SOLFEGE.has(s));
      m.confidence = 'high';
      m.disagreement = false;
      if (m.durationWarning) durationWarnings.push(`Measure ${m.num}: ${m.durationWarning}`);
    }

    // ── Use parser-extracted metadata ────────────────────────
    const pieceTitle   = result.pieceTitle   || '';
    const composerName = result.composerName || '';
    const firstLyrics  = result.measures.slice(0, 3).map(m => m.lyrics).filter(Boolean).join(' ');
    const measureCount = result.measures.length;
    const noteCount    = result.measures.reduce((s, m) => s + (m.notes?.length || 0), 0);

    // ── Format tempo & dynamics strings for display ──────────
    const tempoStr = result.tempo?.display || null;

    let dynamicsStr = null;
    if (result.openingDynamic) {
      const extraChanges = result.dynamicChanges.length - 1;
      dynamicsStr = result.openingDynamic
        + (extraChanges > 0 ? ` (${extraChanges} change${extraChanges > 1 ? 's' : ''})` : '');
    }

    console.log(`[Solfai] MusicXML parsed: ${measureCount} measures, ${noteCount} notes, part=${selectedPart}, key=${result.keySignature}, time=${result.timeSignature}, tempo=${tempoStr || 'none'}, dynamics=${dynamicsStr || 'none'}, warnings=${durationWarnings.length}`);

    // ── Gemini: practice guide only (facts already known) ────
    let analysis = { overview: '', practiceTips: [], composerBio: null, pieceInfo: null,
      pronunciation: { language: 'English', needsGuide: false, words: [] } };

    if (apiKey && measureCount > 0) {
      try {
        const sysPrompt = `You are a patient, encouraging choir director writing a practice guide.
Write in a warm, supportive tone. Be practical and specific.
Use Google Search to verify composer biography and historical context when the piece is identifiable.`;

        const userText = `Write a practice guide for a ${selectedPart} singer.

Verified musical facts (parsed directly from MusicXML — 100% accurate, do NOT guess or alter these):
- Key: ${result.keySignature}
- Time signature: ${result.timeSignature}
- Measures: ${measureCount}  Notes: ${noteCount}
${tempoStr      ? `- Tempo: ${tempoStr}` : ''}
${dynamicsStr   ? `- Opening dynamic: ${dynamicsStr}` : ''}
${pieceTitle    ? `- Title: "${pieceTitle}"` : ''}
${composerName  ? `- Composer: ${composerName}` : ''}
${firstLyrics   ? `- Opening lyrics: "${firstLyrics}"` : ''}
${result.rehearsalMarks.length ? `- Rehearsal marks: ${result.rehearsalMarks.map(r => `${r.mark} (m.${r.measure})`).join(', ')}` : ''}
${durationWarnings.length ? `- Duration notes: ${durationWarnings.slice(0,3).join('; ')}` : ''}

Return ONLY this JSON (no markdown):
{
  "overview": "2-3 paragraphs: what is this piece, what does the ${selectedPart} singer need to know",
  "practiceTips": ["5-8 specific actionable tips"],
  "composerBio": "2-3 sentences about the composer, or null",
  "pieceInfo": "historical context and performance notes, or null",
  "pronunciation": { "language": "English", "needsGuide": false, "words": [] }
}`;

        const raw = await callGemini(apiKey, sysPrompt, [{ text: userText }], {
          temperature: 0.7,
          maxOutputTokens: 4096,
          thinkingBudget: 2000,
          tools: [{ googleSearch: {} }],
        });
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        analysis = JSON.parse(cleaned);
      } catch (e) {
        console.error('[Solfai] MusicXML write-up failed:', e.message);
      }
    }

    const structured = {
      source: 'musicxml',
      keySignature: result.keySignature,
      keyConfident: true,
      keyWarning: null,
      timeSignature: result.timeSignature,
      tempo: tempoStr || 'Not found in score',
      dynamics: dynamicsStr || 'Not found in score',
      tonic: result.tonic,
      difficulty: { overall: 5, rhythm: 4, range: 4, intervals: 4, text: 3 },
      firstNotesSolfege: result.measures[0]?.solfege?.slice(0, 3) || null,
      firstNotes: result.measures[0]?.notes?.slice(0, 3) || null,
      firstLyrics: firstLyrics || null,
      overview: analysis.overview || '',
      practiceTips: Array.isArray(analysis.practiceTips) ? analysis.practiceTips : [],
      composerName: composerName || null,
      composerBio: analysis.composerBio || null,
      pieceTitle: pieceTitle || null,
      pieceInfo: analysis.pieceInfo || null,
      pronunciation: analysis.pronunciation || { language: 'English', needsGuide: false, words: [] },
      staffNum: 1,
      totalStaves: result.partList.length,
      clef: result.initialClef || 'treble',
      measures: result.measures,
      disagreements: 0,
      durationWarnings,
      rehearsalMarks: result.rehearsalMarks,
      tempoChanges: result.tempoChanges,
      dynamicChanges: result.dynamicChanges,
      clefChanges: result.clefChanges,
      _confidenceScore: 100,
      _selfConsistency: { keysAgree: true, totalKeyReads: 1 },
      _dbMatch: null,
    };

    return res.status(200).json({
      structured,
      text: buildTextSummary(structured, selectedPart),
      parts: result.partList.map(p => p.name),
    });
  } catch (err) {
    console.error('[Solfai] MusicXML parse error:', err.message);
    return res.status(500).json({ error: 'Failed to parse MusicXML: ' + err.message });
  } finally {
    try { unlinkSync(filePath); } catch (e) { /* ignore */ }
  }
});

// ─── Manual Note Entry Route ──────────────────────────────
app.post('/api/manual-solfege', (req, res) => {
  const { notes, key } = req.body;
  if (!notes) return res.status(400).json({ error: 'No notes provided' });

  const tonic = (key || 'C').replace(/\s*(major|minor)/i, '').trim();

  const rawMeasures = notes.split('|').map(s => s.trim()).filter(Boolean);
  const measures = rawMeasures.map((m, i) => {
    const noteList = m.split(/[\s,]+/).filter(Boolean);
    return { num: i + 1, notes: noteList, lyrics: '' };
  });

  const VALID_SOLFEGE = new Set(['Do', 'Di', 'Re', 'Ri', 'Me', 'Mi', 'Fa', 'Fi', 'Sol', 'Si', 'La', 'Li', 'Te', 'Ti', '?']);
  for (const m of measures) {
    m.solfege = (m.notes || []).map(n =>
      noteToSolfege(n.replace(/\d+$/, ''), tonic)
    );
    m.valid = m.solfege.every(s => VALID_SOLFEGE.has(s));
    m.confidence = 'high';
    m.disagreement = false;
  }

  console.log(`[Solfai] Manual entry: ${measures.length} measures, key=${tonic}`);

  return res.status(200).json({
    structured: {
      key: tonic,
      tonic,
      staffNum: 1,
      totalStaves: 1,
      clef: 'treble',
      measures,
      disagreements: 0,
      source: 'manual',
    },
    text: measures.map(m =>
      `m.${m.num}:\n  Notes:   ${m.notes.join(' ')}\n  Solfege: ${m.solfege.join(' ')}`
    ).join('\n\n'),
  });
});

// ─── Transposition Endpoint ───────────────────────────────
app.post('/api/transpose', (req, res) => {
  const { measures, fromKey, toKey } = req.body;
  if (!measures || !fromKey || !toKey) return res.status(400).json({ error: 'Missing data' });

  const fromTonic = fromKey.replace(/\s*(major|minor)/i, '').trim();
  const toTonic = toKey.replace(/\s*(major|minor)/i, '').trim();
  const fromMidi = Note.midi(fromTonic + '4');
  const toMidi = Note.midi(toTonic + '4');
  if (fromMidi === null || toMidi === null) return res.status(400).json({ error: 'Invalid key' });

  const interval = toMidi - fromMidi;
  const transposed = measures.map(m => ({
    ...m,
    notes: (m.notes || []).map(n => {
      const midi = Note.midi(n);
      if (midi === null) return n;
      return Note.fromMidi(midi + interval);
    }),
    solfege: (m.notes || []).map(n => noteToSolfege(n.replace(/\d+$/, ''), toTonic)),
    scaleDegrees: (m.notes || []).map(n => noteToScaleDegree(n.replace(/\d+$/, ''), toTonic)),
  }));

  console.log(`[Solfai] Transposed ${measures.length} measures from ${fromKey} to ${toKey}`);
  return res.json({ measures: transposed, key: toTonic, tonic: toTonic });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Duration Validation (uses shared DURATION_VALUES and getBeatsPerMeasure)
// ═══════════════════════════════════════════════════════════

app.post('/api/validate-durations', (req, res) => {
  const { measures, timeSignature } = req.body;
  if (!measures || !timeSignature) {
    return res.status(400).json({ error: 'Missing measures or timeSignature' });
  }

  const expectedBeats = getBeatsPerMeasure(timeSignature);
  const results = [];

  for (const measure of measures) {
    const num = measure.num || measure.measure;
    const durations = measure.durations || [];
    let totalBeats = 0;

    for (const d of durations) {
      const val = typeof d === 'number' ? d : (parseDurationBeats(d) || 0);
      totalBeats += val;
    }

    const tolerance = 0.01;
    const valid = Math.abs(totalBeats - expectedBeats) < tolerance;
    results.push({
      measure: num,
      expectedBeats,
      actualBeats: totalBeats,
      valid,
      difference: valid ? 0 : +(totalBeats - expectedBeats).toFixed(4),
    });
  }

  const mismatches = results.filter(r => !r.valid);
  console.log(`[Solfai] Duration validation: ${mismatches.length}/${results.length} mismatches for ${timeSignature}`);

  return res.json({
    timeSignature,
    expectedBeatsPerMeasure: expectedBeats,
    totalMeasures: results.length,
    mismatchCount: mismatches.length,
    results,
    mismatches,
  });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Share Analysis
// ═══════════════════════════════════════════════════════════

const SHARED_DIR = join(__dirname, 'shared');
try { mkdirSync(SHARED_DIR, { recursive: true }); } catch (e) { /* exists */ }

app.post('/api/share', (req, res) => {
  const { analysis } = req.body;
  if (!analysis) return res.status(400).json({ error: 'No analysis data provided' });

  const id = randomUUID().replace(/-/g, '').substring(0, 12);
  const filePath = join(SHARED_DIR, `${id}.json`);
  const payload = {
    id,
    analysis,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  try {
    writeFileSync(filePath, JSON.stringify(payload, null, 2));
    console.log(`[Solfai] Shared analysis saved: ${id}`);
    return res.json({ id, url: `/api/shared/${id}` });
  } catch (err) {
    console.error('[Solfai] Share save failed:', err.message);
    return res.status(500).json({ error: 'Failed to save shared analysis' });
  }
});

app.get('/api/shared/:id', (req, res) => {
  const { id } = req.params;
  if (!/^[a-z0-9]+$/i.test(id)) return res.status(400).json({ error: 'Invalid ID' });

  const filePath = join(SHARED_DIR, `${id}.json`);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Shared analysis not found' });

  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    if (new Date(data.expiresAt) < new Date()) {
      try { unlinkSync(filePath); } catch (e) { /* ignore */ }
      return res.status(410).json({ error: 'This shared analysis has expired' });
    }
    return res.json(data);
  } catch (err) {
    console.error('[Solfai] Share read failed:', err.message);
    return res.status(500).json({ error: 'Failed to read shared analysis' });
  }
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Practice Analytics
// ═══════════════════════════════════════════════════════════

const ANALYTICS_DIR = join(__dirname, 'analytics');
try { mkdirSync(ANALYTICS_DIR, { recursive: true }); } catch (e) { /* exists */ }

app.post('/api/analytics', (req, res) => {
  const { userId, piece, duration, measuresPracticed, accuracy, timestamp } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const filePath = join(ANALYTICS_DIR, `${userId.replace(/[^a-z0-9_-]/gi, '_')}.json`);
  let sessions = [];
  try {
    if (existsSync(filePath)) sessions = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) { sessions = []; }

  const session = {
    id: randomUUID().replace(/-/g, '').substring(0, 8),
    piece: piece || 'Unknown',
    duration: duration || 0,
    measuresPracticed: measuresPracticed || [],
    accuracy: accuracy || null,
    timestamp: timestamp || new Date().toISOString(),
  };

  sessions.push(session);
  writeFileSync(filePath, JSON.stringify(sessions, null, 2));

  console.log(`[Solfai] Analytics saved for ${userId}: ${session.piece} (${session.duration}s)`);
  return res.json({ ok: true, session });
});

app.get('/api/analytics/:userId', (req, res) => {
  const { userId } = req.params;
  const filePath = join(ANALYTICS_DIR, `${userId.replace(/[^a-z0-9_-]/gi, '_')}.json`);

  if (!existsSync(filePath)) {
    return res.json({ userId, totalSessions: 0, totalDuration: 0, sessions: [], summary: {} });
  }

  try {
    const sessions = JSON.parse(readFileSync(filePath, 'utf8'));
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const accuracies = sessions.filter(s => s.accuracy != null).map(s => s.accuracy);
    const avgAccuracy = accuracies.length > 0
      ? +(accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(1)
      : null;

    const pieceCounts = {};
    for (const s of sessions) {
      pieceCounts[s.piece] = (pieceCounts[s.piece] || 0) + 1;
    }

    const streakDays = calculateStreak(sessions);

    return res.json({
      userId,
      totalSessions: sessions.length,
      totalDuration,
      averageAccuracy: avgAccuracy,
      streakDays,
      pieceCounts,
      recentSessions: sessions.slice(-20).reverse(),
      summary: {
        totalMinutes: +(totalDuration / 60).toFixed(1),
        mostPracticedPiece: Object.entries(pieceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        sessionsThisWeek: sessions.filter(s => {
          const d = new Date(s.timestamp);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return d >= weekAgo;
        }).length,
      },
    });
  } catch (err) {
    console.error('[Solfai] Analytics read failed:', err.message);
    return res.status(500).json({ error: 'Failed to read analytics' });
  }
});

function calculateStreak(sessions) {
  if (!sessions.length) return 0;
  const days = new Set(sessions.map(s => new Date(s.timestamp).toISOString().split('T')[0]));
  const sortedDays = [...days].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (days.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

// ═══════════════════════════════════════════════════════════
// FEATURE: Warm-up Generator
// ═══════════════════════════════════════════════════════════

const WARM_UP_EXERCISES = {
  highNotes: [
    {
      name: "Ascending Fifth Sirens",
      instructions: "Slide from Do up to Sol on 'ooh', then back down. Start in your low register and move up by half steps.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [0, 2, 4, 5, 7].map(i => Note.fromMidi(midi + i));
      },
    },
    {
      name: "Octave Arpeggios",
      instructions: "Sing Do-Mi-Sol-Do'-Sol-Mi-Do on 'ah'. Breathe at the top. Focus on head voice above the passaggio.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [0, 4, 7, 12, 7, 4, 0].map(i => Note.fromMidi(midi + i));
      },
    },
    {
      name: "Descending Scale from High",
      instructions: "Start at the top of your range and descend stepwise on 'nee-nah-noh'. Keep the placement forward.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [12, 11, 9, 7, 5, 4, 2, 0].map(i => Note.fromMidi(midi + i));
      },
    },
  ],
  intervals: [
    {
      name: "Third Leaps",
      instructions: "Sing Do-Mi, Re-Fa, Mi-Sol ascending by step. Use 'mah' for each note. Keep legato.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [0, 4, 2, 5, 4, 7, 5, 9].map(i => Note.fromMidi(midi + i));
      },
    },
    {
      name: "Fourth and Fifth Practice",
      instructions: "Sing Do-Fa, Do-Sol, alternating. Use 'doo' for lower, 'dee' for upper.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [0, 5, 0, 7, 0, 5, 0, 7, 0].map(i => Note.fromMidi(midi + i));
      },
    },
    {
      name: "Octave Jumps",
      instructions: "Sing Do-Do' on 'yah'. Drop the jaw on the high note. Move up by half steps.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [0, 12, 0, 12, 0].map(i => Note.fromMidi(midi + i));
      },
    },
  ],
  rhythm: [
    {
      name: "Syncopation Builder",
      instructions: "Clap and count: 1-and-2-and-3-and-4-and. Then sing on a single pitch with 'ta' on the off-beats.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return Array(8).fill(Note.fromMidi(midi));
      },
    },
    {
      name: "Dotted Rhythm Practice",
      instructions: "Alternate long-short on a five-note scale. Think 'daah-dit, daah-dit'. Use a metronome.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [0, 2, 4, 5, 7].map(i => Note.fromMidi(midi + i));
      },
    },
    {
      name: "Triplet Flow",
      instructions: "Sing Do-Re-Mi in triplets ascending the scale. Keep even subdivision. Use 'la-la-la'.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return [0, 2, 4, 2, 4, 5, 4, 5, 7].map(i => Note.fromMidi(midi + i));
      },
    },
  ],
  breathing: [
    {
      name: "Long Tone Sustain",
      instructions: "Breathe in for 4 counts, sustain 'ss' for 8 counts, then 'oo' for 8 counts. Gradually increase to 12 and 16.",
      pattern: (startNote) => [startNote],
    },
    {
      name: "Staccato Breath Control",
      instructions: "Sing 8 short 'ha' on a single pitch, then sustain the 9th. Focus on diaphragm engagement.",
      pattern: (startNote) => {
        const midi = Note.midi(startNote);
        if (midi === null) return [];
        return Array(9).fill(Note.fromMidi(midi));
      },
    },
  ],
};

app.post('/api/warmup', (req, res) => {
  const { weaknesses, voicePart, key } = req.body;
  const areas = weaknesses || ['breathing', 'intervals'];
  const tonic = (key || 'C').replace(/\s*(major|minor)/i, '').trim();
  const range = VOCAL_RANGES[voicePart || 'Soprano'] || VOCAL_RANGES['Soprano'];
  const startMidi = Math.floor((range.low + range.high) / 2) - 3;
  const startNote = Note.fromMidi(startMidi);

  const exercises = [];

  exercises.push({
    name: "Lip Trills / Buzzing",
    instructions: "Buzz your lips on a comfortable pitch and slide up and down a fifth. 4 repetitions.",
    notes: [],
    solfege: [],
    category: "warmup",
  });

  for (const area of areas) {
    const pool = WARM_UP_EXERCISES[area] || WARM_UP_EXERCISES.intervals;
    for (const exercise of pool) {
      const notes = exercise.pattern(startNote);
      const solfege = notes.map(n => {
        const pc = typeof n === 'string' ? n.replace(/\d+$/, '') : n;
        return noteToSolfege(pc, tonic);
      });
      exercises.push({
        name: exercise.name,
        instructions: exercise.instructions,
        notes,
        solfege,
        category: area,
      });
    }
  }

  exercises.push({
    name: "Cool Down — Descending Sigh",
    instructions: "Sigh from the top of your range to the bottom on 'hoo'. Let your voice relax completely.",
    notes: [],
    solfege: [],
    category: "cooldown",
  });

  console.log(`[Solfai] Warmup generated: ${exercises.length} exercises for ${areas.join(', ')}`);
  return res.json({ exercises, voicePart: voicePart || 'Soprano', key: tonic });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Sight-Reading Generator
// ═══════════════════════════════════════════════════════════

const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

function generateSightReading(difficulty, key, timeSig, numMeasures, weakSyllables = []) {
  const tonic = (key || 'C').replace(/\s*(major|minor)/i, '').trim();
  const isMinor = (key || '').toLowerCase().includes('minor');
  const scaleType = isMinor ? 'minor' : 'major';
  const scale = SCALE_INTERVALS[scaleType];
  const tonicMidi = Note.midi(tonic + '4') || 60;
  const beatsPerMeasure = getBeatsPerMeasure(timeSig || '4/4');

  const level = Math.max(1, Math.min(5, difficulty || 1));
  const maxInterval = level <= 2 ? 4 : level <= 3 ? 7 : level <= 4 ? 9 : 12;
  const allowAccidentals = level >= 4;
  const rhythmComplexity = level;

  const measures = [];
  let prevScaleDeg = 0;

  for (let m = 0; m < numMeasures; m++) {
    const notes = [];
    let beatsRemaining = beatsPerMeasure;

    while (beatsRemaining > 0.24) {
      let duration;
      if (rhythmComplexity <= 2) {
        duration = beatsRemaining >= 1 ? 1 : beatsRemaining;
      } else if (rhythmComplexity <= 3) {
        const choices = [0.5, 1, 1, 2].filter(d => d <= beatsRemaining);
        duration = choices[Math.floor(Math.random() * choices.length)] || beatsRemaining;
      } else {
        const choices = [0.25, 0.5, 0.5, 1, 1, 1.5, 2].filter(d => d <= beatsRemaining);
        duration = choices[Math.floor(Math.random() * choices.length)] || beatsRemaining;
      }

      let jump = Math.floor(Math.random() * 3) - 1;
      if (level >= 3) jump = Math.floor(Math.random() * 5) - 2;
      let newDeg = prevScaleDeg + jump;
      newDeg = Math.max(-7, Math.min(14, newDeg));

      const octaveOffset = Math.floor(newDeg / 7) * 12;
      const scaleDeg = ((newDeg % 7) + 7) % 7;
      const semitones = scale[scaleDeg] + octaveOffset;
      let midi = tonicMidi + semitones;

      if (allowAccidentals && Math.random() < 0.15) {
        midi += Math.random() < 0.5 ? 1 : -1;
      }

      const noteName = Note.fromMidi(midi);
      const durationName = duration >= 4 ? 'whole' : duration >= 2 ? 'half' :
        duration >= 1.5 ? 'dotted quarter' : duration >= 1 ? 'quarter' :
        duration >= 0.5 ? 'eighth' : 'sixteenth';

      notes.push({
        note: noteName,
        duration: durationName,
        beats: duration,
      });

      prevScaleDeg = newDeg;
      beatsRemaining -= duration;
    }

    const noteNames = notes.map(n => n.note);
    const solfege = noteNames.map(n => noteToSolfege(n.replace(/\d+$/, ''), tonic));

    measures.push({
      num: m + 1,
      notes: noteNames,
      durations: notes.map(n => n.duration),
      solfege,
    });
  }

  // Bias 40% of notes toward weak syllables for adaptive practice
  if (weakSyllables.length > 0) {
    const DEG = {Do:0,Di:0,Re:1,Ri:1,Me:2,Mi:2,Fa:3,Fi:3,Sol:4,Si:4,La:5,Li:5,Te:6,Ti:6};
    const scaleNotes = Scale.get(key).notes;
    const weakDegrees = [...new Set(weakSyllables.map(s=>DEG[s]).filter(d=>d!==undefined))];
    if (weakDegrees.length && scaleNotes.length >= 7) {
      for (const m of measures) {
        for (let i = 0; i < (m.notes||[]).length; i++) {
          if (Math.random() < 0.4) {
            const deg = weakDegrees[Math.floor(Math.random()*weakDegrees.length)];
            const pc = scaleNotes[deg];
            if (pc) {
              const currOct = parseInt((m.notes[i]||'').match(/\d/)?.[0]||'4');
              m.notes[i] = pc + currOct;
            }
          }
        }
      }
    }
  }

  return measures;
}

app.post('/api/sight-reading', (req, res) => {
  const { difficulty, key, timeSignature, measures: numMeasures, weakSyllables } = req.body;
  const measureCount = Math.max(4, Math.min(16, numMeasures || 4));
  const timeSig = timeSignature || '4/4';
  const keyName = key || 'C major';

  const measures = generateSightReading(difficulty || 1, keyName, timeSig, measureCount, weakSyllables || []);
  const tonic = keyName.replace(/\s*(major|minor)/i, '').trim();

  console.log(`[Solfai] Sight-reading generated: ${measureCount} measures, difficulty=${difficulty}, key=${keyName}`);

  return res.json({
    key: keyName,
    tonic,
    timeSignature: timeSig,
    difficulty: difficulty || 1,
    measures,
    instructions: `Sight-read this ${measureCount}-measure melody in ${keyName}. ` +
      `Time signature: ${timeSig}. Difficulty: ${difficulty || 1}/5. ` +
      `Sing on solfege syllables, then try with 'la'.`,
  });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Chord Analysis
// ═══════════════════════════════════════════════════════════

const CHORD_TYPES = [
  { intervals: [0, 4, 7], name: 'Major', symbol: '' },
  { intervals: [0, 3, 7], name: 'minor', symbol: 'm' },
  { intervals: [0, 3, 6], name: 'diminished', symbol: 'dim' },
  { intervals: [0, 4, 8], name: 'augmented', symbol: 'aug' },
  { intervals: [0, 4, 7, 11], name: 'Major 7th', symbol: 'maj7' },
  { intervals: [0, 4, 7, 10], name: 'Dominant 7th', symbol: '7' },
  { intervals: [0, 3, 7, 10], name: 'minor 7th', symbol: 'm7' },
  { intervals: [0, 3, 6, 10], name: 'half-diminished 7th', symbol: 'm7b5' },
  { intervals: [0, 3, 6, 9], name: 'diminished 7th', symbol: 'dim7' },
  { intervals: [0, 5, 7], name: 'sus4', symbol: 'sus4' },
  { intervals: [0, 2, 7], name: 'sus2', symbol: 'sus2' },
];

function identifyChord(noteNames) {
  if (!noteNames || noteNames.length < 2) return null;

  const midis = noteNames
    .map(n => Note.midi(n))
    .filter(m => m !== null)
    .sort((a, b) => a - b);

  if (midis.length < 2) return null;

  const pcs = [...new Set(midis.map(m => m % 12))].sort((a, b) => a - b);

  let bestMatch = null;
  let bestScore = 0;

  for (const root of pcs) {
    const intervals = pcs.map(pc => ((pc - root) % 12 + 12) % 12).sort((a, b) => a - b);

    for (const chord of CHORD_TYPES) {
      const chordIntervals = chord.intervals;
      const matching = chordIntervals.filter(ci => intervals.includes(ci)).length;
      const score = matching / Math.max(chordIntervals.length, intervals.length);

      if (score > bestScore) {
        bestScore = score;
        const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        bestMatch = {
          root: NOTE_NAMES_FLAT[root],
          type: chord.name,
          symbol: NOTE_NAMES_FLAT[root] + chord.symbol,
          confidence: +(score * 100).toFixed(0),
          notes: noteNames,
          pitchClasses: pcs.map(pc => NOTE_NAMES_FLAT[pc]),
        };
      }
    }
  }

  return bestMatch;
}

function analyzeChords(measures) {
  const results = [];
  for (const measure of measures) {
    const notes = measure.notes || [];
    if (notes.length === 0) continue;

    const chord = identifyChord(notes);
    results.push({
      measure: measure.num || null,
      chord: chord ? chord.symbol : 'N/C',
      type: chord ? chord.type : null,
      root: chord ? chord.root : null,
      confidence: chord ? chord.confidence : 0,
      notes,
    });
  }
  return results;
}

app.post('/api/chord-analysis', (req, res) => {
  const { measures } = req.body;
  if (!measures || !Array.isArray(measures)) {
    return res.status(400).json({ error: 'Missing or invalid measures array' });
  }

  const chords = analyzeChords(measures);

  const chordProgression = chords.map(c => c.chord).join(' - ');
  console.log(`[Solfai] Chord analysis: ${chords.length} chords identified`);

  return res.json({
    chords,
    progression: chordProgression,
    totalChords: chords.length,
  });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: IPA Pronunciation (rules-based, no AI)
// ═══════════════════════════════════════════════════════════

const IPA_RULES = {
  latin: {
    replacements: [
      [/ae/gi, 'ɛ'], [/oe/gi, 'e'], [/au/gi, 'aʊ'],
      [/qu/gi, 'kw'], [/gn/gi, 'ɲ'],
      [/ce/gi, 'tʃe'], [/ci/gi, 'tʃi'], [/cy/gi, 'tʃi'],
      [/ch/gi, 'k'], [/ph/gi, 'f'], [/th/gi, 't'],
      [/sc([ei])/gi, 'ʃ$1'],
      [/x/gi, 'ks'],
      [/c(?=[aou])/gi, 'k'], [/c(?=[ei])/gi, 'tʃ'], [/c$/gi, 'k'],
      [/j/gi, 'j'], [/v/gi, 'v'],
      [/a/gi, 'a'], [/e/gi, 'e'], [/i/gi, 'i'], [/o/gi, 'o'], [/u/gi, 'u'],
      [/b/gi, 'b'], [/d/gi, 'd'], [/f/gi, 'f'], [/g/gi, 'ɡ'],
      [/k/gi, 'k'], [/l/gi, 'l'], [/m/gi, 'm'], [/n/gi, 'n'],
      [/p/gi, 'p'], [/r/gi, 'r'], [/s/gi, 's'], [/t/gi, 't'],
    ],
  },
  italian: {
    replacements: [
      [/gli/gi, 'ʎi'], [/gn/gi, 'ɲ'],
      [/sch/gi, 'sk'],
      [/sc([ei])/gi, 'ʃ$1'], [/sc([aou])/gi, 'sk$1'],
      [/ch([ei])/gi, 'k$1'], [/ci([aou])/gi, 'tʃ$1'],
      [/ce/gi, 'tʃe'], [/ci/gi, 'tʃi'],
      [/c([aou])/gi, 'k$1'], [/c$/gi, 'k'],
      [/gh([ei])/gi, 'ɡ$1'], [/gi([aou])/gi, 'dʒ$1'],
      [/ge/gi, 'dʒe'], [/gi/gi, 'dʒi'],
      [/g([aou])/gi, 'ɡ$1'],
      [/zz/gi, 'tts'], [/z/gi, 'dz'],
      [/ss/gi, 'ss'], [/s(?=[aeiou])/gi, 'z'],
      [/rr/gi, 'rr'], [/ll/gi, 'll'], [/mm/gi, 'mm'], [/nn/gi, 'nn'],
      [/qu/gi, 'kw'],
      [/a/gi, 'a'], [/e/gi, 'e'], [/i/gi, 'i'], [/o/gi, 'o'], [/u/gi, 'u'],
      [/b/gi, 'b'], [/d/gi, 'd'], [/f/gi, 'f'], [/h/gi, ''],
      [/k/gi, 'k'], [/l/gi, 'l'], [/m/gi, 'm'], [/n/gi, 'n'],
      [/p/gi, 'p'], [/r/gi, 'r'], [/s/gi, 's'], [/t/gi, 't'], [/v/gi, 'v'],
    ],
  },
  german: {
    replacements: [
      [/sch/gi, 'ʃ'], [/tsch/gi, 'tʃ'], [/ch(?=[ei])/gi, 'ç'], [/ch/gi, 'x'],
      [/sp/gi, 'ʃp'], [/st/gi, 'ʃt'],
      [/ck/gi, 'k'], [/pf/gi, 'pf'], [/tz/gi, 'ts'],
      [/ei/gi, 'aɪ'], [/ie/gi, 'iː'], [/eu/gi, 'ɔʏ'], [/äu/gi, 'ɔʏ'],
      [/au/gi, 'aʊ'],
      [/ä/gi, 'ɛ'], [/ö/gi, 'ø'], [/ü/gi, 'y'], [/ß/gi, 's'],
      [/z/gi, 'ts'], [/w/gi, 'v'], [/v/gi, 'f'], [/j/gi, 'j'],
      [/s(?=[aeiou])/gi, 'z'],
      [/a/gi, 'a'], [/e/gi, 'ə'], [/i/gi, 'ɪ'], [/o/gi, 'o'], [/u/gi, 'ʊ'],
      [/b/gi, 'b'], [/d/gi, 'd'], [/f/gi, 'f'], [/g/gi, 'ɡ'], [/h/gi, 'h'],
      [/k/gi, 'k'], [/l/gi, 'l'], [/m/gi, 'm'], [/n/gi, 'n'],
      [/p/gi, 'p'], [/r/gi, 'ʁ'], [/t/gi, 't'],
    ],
  },
  french: {
    replacements: [
      [/eau/gi, 'o'], [/au/gi, 'o'], [/ou/gi, 'u'],
      [/oi/gi, 'wa'], [/ai/gi, 'ɛ'], [/ei/gi, 'ɛ'],
      [/an/gi, 'ɑ̃'], [/en/gi, 'ɑ̃'], [/am/gi, 'ɑ̃'], [/em/gi, 'ɑ̃'],
      [/in/gi, 'ɛ̃'], [/im/gi, 'ɛ̃'], [/ain/gi, 'ɛ̃'], [/ein/gi, 'ɛ̃'],
      [/on/gi, 'ɔ̃'], [/om/gi, 'ɔ̃'],
      [/un/gi, 'œ̃'], [/um/gi, 'œ̃'],
      [/eu/gi, 'ø'], [/oeu/gi, 'œ'],
      [/ch/gi, 'ʃ'], [/gn/gi, 'ɲ'], [/ph/gi, 'f'], [/th/gi, 't'],
      [/qu/gi, 'k'], [/gu(?=[ei])/gi, 'ɡ'],
      [/c([ei])/gi, 's$1'], [/ç/gi, 's'],
      [/c([aou])/gi, 'k$1'], [/c$/gi, 'k'],
      [/g([ei])/gi, 'ʒ$1'], [/g([aou])/gi, 'ɡ$1'],
      [/j/gi, 'ʒ'], [/ll/gi, 'j'],
      [/é/gi, 'e'], [/è/gi, 'ɛ'], [/ê/gi, 'ɛ'], [/ë/gi, 'ɛ'],
      [/â/gi, 'ɑ'], [/î/gi, 'i'], [/ô/gi, 'o'], [/û/gi, 'y'],
      [/a/gi, 'a'], [/e$/gi, ''], [/e/gi, 'ə'], [/i/gi, 'i'], [/o/gi, 'ɔ'], [/u/gi, 'y'],
      [/b/gi, 'b'], [/d/gi, 'd'], [/f/gi, 'f'], [/h/gi, ''],
      [/k/gi, 'k'], [/l/gi, 'l'], [/m/gi, 'm'], [/n/gi, 'n'],
      [/p/gi, 'p'], [/r/gi, 'ʁ'], [/s/gi, 's'], [/t/gi, 't'], [/v/gi, 'v'],
      [/x/gi, 'ks'], [/z/gi, 'z'],
    ],
  },
  spanish: {
    replacements: [
      [/ch/gi, 'tʃ'], [/ll/gi, 'ʎ'], [/rr/gi, 'r'],
      [/ñ/gi, 'ɲ'], [/qu/gi, 'k'],
      [/gu([ei])/gi, 'ɡ$1'], [/gü([ei])/gi, 'ɡw$1'],
      [/c([ei])/gi, 's$1'], [/c([aou])/gi, 'k$1'], [/c$/gi, 'k'],
      [/g([ei])/gi, 'x$1'], [/g([aou])/gi, 'ɡ$1'],
      [/j/gi, 'x'], [/h/gi, ''], [/v/gi, 'b'], [/z/gi, 's'],
      [/á/gi, 'a'], [/é/gi, 'e'], [/í/gi, 'i'], [/ó/gi, 'o'], [/ú/gi, 'u'],
      [/a/gi, 'a'], [/e/gi, 'e'], [/i/gi, 'i'], [/o/gi, 'o'], [/u/gi, 'u'],
      [/b/gi, 'b'], [/d/gi, 'd'], [/f/gi, 'f'],
      [/k/gi, 'k'], [/l/gi, 'l'], [/m/gi, 'm'], [/n/gi, 'n'],
      [/p/gi, 'p'], [/r/gi, 'ɾ'], [/s/gi, 's'], [/t/gi, 't'],
      [/x/gi, 'ks'], [/y/gi, 'ʝ'], [/w/gi, 'w'],
    ],
  },
  hebrew: {
    replacements: [
      [/sh/gi, 'ʃ'], [/ch/gi, 'x'], [/kh/gi, 'x'], [/ts/gi, 'ts'], [/tz/gi, 'ts'],
      [/th/gi, 't'],
      [/a/gi, 'a'], [/e/gi, 'e'], [/i/gi, 'i'], [/o/gi, 'o'], [/u/gi, 'u'],
      [/b/gi, 'b'], [/d/gi, 'd'], [/f/gi, 'f'], [/g/gi, 'ɡ'], [/h/gi, 'h'],
      [/k/gi, 'k'], [/l/gi, 'l'], [/m/gi, 'm'], [/n/gi, 'n'],
      [/p/gi, 'p'], [/r/gi, 'ʁ'], [/s/gi, 's'], [/t/gi, 't'], [/v/gi, 'v'],
      [/y/gi, 'j'], [/z/gi, 'z'],
    ],
  },
};

function textToIPA(text, language) {
  const lang = (language || 'latin').toLowerCase();
  const rules = IPA_RULES[lang];
  if (!rules) return text.toLowerCase();

  const words = text.split(/\s+/).filter(Boolean);
  return words.map(word => {
    let result = word.toLowerCase();
    for (const [pattern, replacement] of rules.replacements) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }).join(' ');
}

app.post('/api/pronunciation', (req, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  const lang = (language || 'latin').toLowerCase();
  const supportedLanguages = Object.keys(IPA_RULES);
  if (!supportedLanguages.includes(lang)) {
    return res.status(400).json({
      error: `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`,
    });
  }

  const words = text.split(/\s+/).filter(Boolean);
  const pronunciations = words.map(word => ({
    word,
    ipa: `/${textToIPA(word, lang)}/`,
    language: lang,
  }));

  const fullIPA = textToIPA(text, lang);
  console.log(`[Solfai] Pronunciation: ${words.length} words in ${lang}`);

  return res.json({
    language: lang,
    originalText: text,
    ipa: `/${fullIPA}/`,
    words: pronunciations,
  });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Lyrics Extraction (Gemini-powered)
// ═══════════════════════════════════════════════════════════

app.post('/api/extract-lyrics', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const { imageBase64, imageMime, pdfPages, targetLanguage } = req.body;
  const imageParts = buildImageParts(imageBase64, imageMime, pdfPages);
  if (!imageParts.length) return res.status(400).json({ error: 'No image provided' });

  try {
    const processedParts = await Promise.all(
      imageParts.slice(0, 3).map(async (p) => {
        if (p.inlineData?.mimeType === 'image/jpeg') {
          try {
            const enhanced = await preprocessForGemini(p.inlineData.data, 'full');
            return { inlineData: { mimeType: 'image/jpeg', data: enhanced } };
          } catch (e) { return p; }
        }
        return p;
      })
    );

    const systemPrompt = `You are an expert at reading sheet music lyrics. Extract ONLY the text/lyrics that appear below the music staves. Be precise — copy exactly what is printed, including hyphens for syllable breaks. ${WATERMARK_NOTE}`;

    const userText = `Extract all lyrics from this sheet music. Return ONLY valid JSON:
{
  "lyrics": "full text of lyrics with line breaks preserved",
  "language": "detected language",
  "verses": [{"number": 1, "text": "verse text"}],
  "translation": ${targetLanguage ? `"word-by-word translation to ${targetLanguage}"` : 'null'},
  "wordByWord": ${targetLanguage ? `[{"original": "word", "translation": "translated word", "ipa": "/pronunciation/"}]` : '[]'}
}

If the lyrics are not in English${targetLanguage ? ` and target language is ${targetLanguage}` : ''}, provide word-by-word translations.`;

    const raw = await callGemini(apiKey, systemPrompt,
      [{ text: userText }, ...processedParts],
      { temperature: 0, maxOutputTokens: 4096, thinkingBudget: 4000 }
    );

    let result;
    try {
      const cleaned = raw.replace(/```json?|```/gi, '').trim();
      result = JSON.parse(cleaned);
    } catch (e) {
      result = { lyrics: raw, language: 'unknown', verses: [], translation: null, wordByWord: [] };
    }

    console.log(`[Solfai] Lyrics extracted: ${(result.lyrics || '').length} chars, language=${result.language}`);
    return res.json(result);
  } catch (err) {
    console.error('[Solfai] Lyrics extraction error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Performance Order Resolver (repeats, D.C., D.S., coda)
// ═══════════════════════════════════════════════════════════

function resolvePerformanceOrder(measures) {
  if (!measures || !measures.length) return [];

  const order = [];
  let i = 0;
  let repeatStartIdx = 0;
  let hasRepeated = new Set();
  let dsFineActive = false;
  let segnoIdx = null;
  let codaIdx = null;
  let fineIdx = null;
  const MAX_ITERATIONS = measures.length * 4;
  let iterations = 0;

  // Pre-scan for special markers
  for (let m = 0; m < measures.length; m++) {
    const measure = measures[m];
    const dir = (measure.direction || '').toLowerCase();
    if (dir.includes('segno') || dir === 'd.s.' || dir.includes('dal segno')) {
      if (segnoIdx === null) segnoIdx = m;
    }
    if (dir.includes('coda') && codaIdx === null) {
      codaIdx = m;
    }
    if (dir.includes('fine')) {
      fineIdx = m;
    }
  }

  while (i < measures.length && iterations < MAX_ITERATIONS) {
    iterations++;
    const measure = measures[i];
    order.push({
      measureNum: measure.num || (i + 1),
      originalIndex: i,
    });

    if (measure.repeatStart) {
      repeatStartIdx = i;
    }

    const dir = (measure.direction || '').toLowerCase();

    if (measure.repeatEnd && !hasRepeated.has(i)) {
      hasRepeated.add(i);
      i = repeatStartIdx;
      continue;
    }

    if (dir.includes('d.c.') || dir.includes('da capo')) {
      if (dir.includes('al fine') && fineIdx !== null) {
        for (let j = 0; j <= fineIdx; j++) {
          if (j > i) {
            order.push({ measureNum: measures[j].num || (j + 1), originalIndex: j });
          }
        }
        break;
      }
      if (dir.includes('al coda') && codaIdx !== null) {
        for (let j = 0; j < codaIdx; j++) {
          if (j > 0) {
            order.push({ measureNum: measures[j].num || (j + 1), originalIndex: j });
          }
        }
        for (let j = codaIdx; j < measures.length; j++) {
          order.push({ measureNum: measures[j].num || (j + 1), originalIndex: j });
        }
        break;
      }
      i = 0;
      dsFineActive = true;
      continue;
    }

    if ((dir.includes('d.s.') || dir.includes('dal segno')) && segnoIdx !== null) {
      if (dir.includes('al coda') && codaIdx !== null) {
        for (let j = segnoIdx; j < codaIdx; j++) {
          order.push({ measureNum: measures[j].num || (j + 1), originalIndex: j });
        }
        for (let j = codaIdx; j < measures.length; j++) {
          order.push({ measureNum: measures[j].num || (j + 1), originalIndex: j });
        }
        break;
      }
      i = segnoIdx;
      dsFineActive = true;
      continue;
    }

    if (dsFineActive && dir.includes('fine')) {
      break;
    }

    i++;
  }

  return order;
}

app.post('/api/performance-order', (req, res) => {
  const { measures } = req.body;
  if (!measures || !Array.isArray(measures)) {
    return res.status(400).json({ error: 'Missing or invalid measures array' });
  }

  const order = resolvePerformanceOrder(measures);
  const measureSequence = order.map(o => o.measureNum);
  console.log(`[Solfai] Performance order resolved: ${order.length} measures`);

  return res.json({
    order,
    measureSequence,
    totalPerformedMeasures: order.length,
    hasRepeats: order.length > measures.length,
  });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Export Practice Analytics as CSV
// ═══════════════════════════════════════════════════════════

app.post('/api/export-practice', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const filePath = join(ANALYTICS_DIR, `${userId.replace(/[^a-z0-9_-]/gi, '_')}.json`);
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'No analytics data found for this user' });
  }

  try {
    const sessions = JSON.parse(readFileSync(filePath, 'utf8'));
    const headers = ['Date', 'Piece', 'Duration (seconds)', 'Measures Practiced', 'Accuracy'];
    const rows = sessions.map(s => [
      s.timestamp || '',
      `"${(s.piece || '').replace(/"/g, '""')}"`,
      s.duration || 0,
      `"${(s.measuresPracticed || []).join(', ')}"`,
      s.accuracy != null ? s.accuracy : '',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    console.log(`[Solfai] Exported ${sessions.length} sessions for ${userId}`);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="solfai-practice-${userId}.csv"`);
    return res.send(csv);
  } catch (err) {
    console.error('[Solfai] Export failed:', err.message);
    return res.status(500).json({ error: 'Failed to export analytics' });
  }
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Capo Calculator
// ═══════════════════════════════════════════════════════════

const CAPO_NOTE_ORDER = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

function noteIndex(noteName) {
  const normalized = noteName.replace(/\s*(major|minor)/i, '').trim();
  const idx = CAPO_NOTE_ORDER.findIndex(n => n.toLowerCase() === normalized.toLowerCase());
  if (idx >= 0) return idx;

  for (let i = 0; i < CAPO_NOTE_ORDER.length; i++) {
    const n = CAPO_NOTE_ORDER[i];
    const enharm = ENHARMONIC_MAP[n];
    if (enharm && enharm.toLowerCase() === normalized.toLowerCase()) return i;
  }
  return -1;
}

app.post('/api/capo', (req, res) => {
  const { originalKey, targetKey } = req.body;
  if (!originalKey || !targetKey) {
    return res.status(400).json({ error: 'Missing originalKey or targetKey' });
  }

  const origRoot = originalKey.replace(/\s*(major|minor)/i, '').trim();
  const targRoot = targetKey.replace(/\s*(major|minor)/i, '').trim();
  const origIdx = noteIndex(origRoot);
  const targIdx = noteIndex(targRoot);

  if (origIdx < 0 || targIdx < 0) {
    return res.status(400).json({ error: 'Invalid key names' });
  }

  const capoFret = ((targIdx - origIdx) % 12 + 12) % 12;

  const allPositions = [];
  for (let fret = 0; fret <= 12; fret++) {
    const playedKeyIdx = ((origIdx + fret) % 12 + 12) % 12;
    allPositions.push({
      fret,
      soundsAs: CAPO_NOTE_ORDER[playedKeyIdx] + (originalKey.includes('minor') ? ' minor' : ' major'),
      matchesTarget: fret === capoFret,
    });
  }

  console.log(`[Solfai] Capo calculator: ${originalKey} → ${targetKey} = capo ${capoFret}`);

  return res.json({
    originalKey,
    targetKey,
    capoFret,
    explanation: capoFret === 0
      ? `No capo needed — ${originalKey} and ${targetKey} are the same.`
      : `Place capo on fret ${capoFret}. Play ${originalKey} chord shapes to sound as ${targetKey}.`,
    allPositions,
  });
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Historical Context (Gemini + Google Search)
// ═══════════════════════════════════════════════════════════

app.post('/api/piece-context', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const { title, composer } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing piece title' });

  try {
    const systemPrompt = `You are a musicologist and choral music expert. Use Google Search to find accurate, detailed information. Be factual and cite sources when possible.`;

    const userText = `Research the choral piece "${title}"${composer ? ` by ${composer}` : ''} and return ONLY valid JSON:
{
  "title": "${title}",
  "composer": {
    "name": "full name",
    "birth": "birth year",
    "death": "death year or 'living'",
    "nationality": "nationality",
    "bio": "2-3 sentence biography focused on choral work"
  },
  "piece": {
    "year": "year composed or published",
    "occasion": "why/for whom it was written",
    "genre": "e.g., motet, anthem, requiem movement",
    "text_source": "source of the text/lyrics",
    "original_language": "language of original text",
    "duration": "approximate performance duration"
  },
  "performance": {
    "tips": ["3-5 specific performance practice tips"],
    "common_mistakes": ["2-3 common interpretation mistakes"],
    "tempo_guidance": "historical tempo context",
    "notable_recordings": ["1-2 recommended recordings"]
  },
  "historical_context": "2-3 paragraphs about the piece's place in music history"
}`;

    const raw = await callGemini(apiKey, systemPrompt,
      [{ text: userText }],
      {
        temperature: 0.3,
        maxOutputTokens: 4096,
        thinkingBudget: 4000,
        tools: [{ googleSearch: {} }],
      }
    );

    let result;
    try {
      const cleaned = raw.replace(/```json?|```/gi, '').trim();
      result = JSON.parse(cleaned);
    } catch (e) {
      result = {
        title,
        composer: { name: composer || 'Unknown' },
        piece: {},
        performance: { tips: [] },
        historical_context: raw,
      };
    }

    console.log(`[Solfai] Piece context retrieved: "${title}" by ${composer || 'unknown'}`);
    return res.json(result);
  } catch (err) {
    console.error('[Solfai] Piece context error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// CLASS SYSTEM — Teacher dashboard + student enrollment
// ═══════════════════════════════════════════════════════════
const CLASSES_FILE = join(__dirname, 'classes.json');
function loadClasses() {
  try { if (existsSync(CLASSES_FILE)) return JSON.parse(readFileSync(CLASSES_FILE,'utf8')); } catch(e) {}
  return {};
}
function saveClasses(data) {
  try { writeFileSync(CLASSES_FILE, JSON.stringify(data,null,2)); } catch(e) { console.error('[Solfai] saveClasses:',e.message); }
}
function genClassCode() {
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
}

app.post('/api/class/create', (req,res) => {
  const { teacherName, className, pin } = req.body;
  if (!teacherName||!className||!pin||String(pin).length<4)
    return res.status(400).json({error:'Fill all fields. PIN must be ≥4 characters.'});
  const classes = loadClasses();
  const code = genClassCode();
  classes[code] = { code, teacherName, className, pin: String(pin), createdAt: new Date().toISOString(), students: {} };
  saveClasses(classes);
  console.log(`[Solfai] Class created: ${code} "${className}"`);
  res.json({ code, className, teacherName });
});

app.post('/api/class/join', (req,res) => {
  const { code, studentName } = req.body;
  if (!code||!studentName) return res.status(400).json({error:'Missing code or name'});
  const classes = loadClasses();
  const cls = classes[String(code).toUpperCase()];
  if (!cls) return res.status(404).json({error:'Class not found. Double-check your code.'});
  if (!cls.students[studentName])
    cls.students[studentName] = { sessions:[], joinedAt:new Date().toISOString(), lastActive:null };
  saveClasses(classes);
  res.json({ code:cls.code, className:cls.className, teacherName:cls.teacherName });
});

app.post('/api/class/report', (req,res) => {
  const { code, studentName, pieceName, part, accuracy, duration, weakSyllables } = req.body;
  if (!code||!studentName) return res.status(400).json({error:'Missing code or name'});
  const classes = loadClasses();
  const cls = classes[String(code).toUpperCase()];
  if (!cls||!cls.students[studentName]) return res.status(404).json({error:'Not enrolled in this class'});
  const session = { date:new Date().toISOString(), pieceName:pieceName||'Unknown', part:part||'Soprano', accuracy:Number(accuracy)||0, duration:Number(duration)||0, weakSyllables:weakSyllables||[] };
  cls.students[studentName].sessions.push(session);
  cls.students[studentName].lastActive = session.date;
  if (cls.students[studentName].sessions.length > 50)
    cls.students[studentName].sessions = cls.students[studentName].sessions.slice(-50);
  saveClasses(classes);
  res.json({ ok:true });
});

app.get('/api/class/dashboard/:code', (req,res) => {
  const { code } = req.params;
  const { pin } = req.query;
  const classes = loadClasses();
  const cls = classes[String(code).toUpperCase()];
  if (!cls) return res.status(404).json({error:'Class not found'});
  if (cls.pin !== String(pin)) return res.status(403).json({error:'Wrong PIN'});
  const students = Object.entries(cls.students).map(([name,data]) => {
    const sess = data.sessions||[];
    const avg = sess.length ? Math.round(sess.reduce((s,x)=>s+x.accuracy,0)/sess.length) : 0;
    const mins = Math.round(sess.reduce((s,x)=>s+x.duration,0)/60);
    const wc = {}; sess.flatMap(s=>s.weakSyllables||[]).forEach(w=>wc[w]=(wc[w]||0)+1);
    const topWeak = Object.entries(wc).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);
    return { name, sessions:sess.length, avgAccuracy:avg, totalMins:mins, topWeak, lastActive:data.lastActive };
  }).sort((a,b)=>(b.lastActive||'').localeCompare(a.lastActive||''));
  res.json({ className:cls.className, teacherName:cls.teacherName, code:cls.code, studentCount:students.length, students });
});

// ─── Service Worker for PWA offline support ──────────────
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-store');
  // Kill-switch service worker. The previous classic SW cached '/' and could
  // serve stale classic HTML over the new SPA. This unregisters any existing
  // service worker and clears all caches so the SPA always loads fresh.
  res.send(`
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
    } catch (e) {}
    await self.clients.claim();
  })());
});
// No fetch handler: this service worker never serves cached content.
`.trim());
});

// ═══════════════════════════════════════════════════════════
// FEATURE: MusicXML Export
// ═══════════════════════════════════════════════════════════
app.post('/api/export-musicxml', (req, res) => {
  const { measures, keySignature, timeSignature, title, composer, part } = req.body;
  if (!measures?.length) return res.status(400).json({ error: 'No measures provided' });

  const key = keySignature || 'C major';
  const timeSig = timeSignature || '4/4';
  const [timeNum, timeDen] = timeSig.split('/').map(Number);
  const tonic = key.split(' ')[0];

  // Calculate MusicXML key fifths from key signature
  const FIFTHS_MAP = {
    'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7,
    'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6, 'Cb': -7,
  };
  const isMinor = key.toLowerCase().includes('minor');
  const fifths = FIFTHS_MAP[tonic] ?? 0;

  // Map note name to MusicXML step/alter/octave
  function noteToXML(noteStr) {
    const parsed = Note.get(noteStr);
    if (!parsed.name) return null;
    const step = parsed.letter;
    const octave = parsed.oct ?? 4;
    let alter = 0;
    if (parsed.acc === '#') alter = 1;
    else if (parsed.acc === '##') alter = 2;
    else if (parsed.acc === 'b') alter = -1;
    else if (parsed.acc === 'bb') alter = -2;
    return { step, alter, octave };
  }

  // Duration mapping (quarter note = 1 division)
  const DURATION_MAP = {
    'whole': 4, 'half': 2, 'dotted half': 3, 'quarter': 1, 'dotted quarter': 1.5,
    'eighth': 0.5, 'sixteenth': 0.25,
  };

  let measureXML = '';
  for (let i = 0; i < measures.length; i++) {
    const m = measures[i];
    const notes = m.notes || [];
    const durations = m.durations || [];

    let noteXML = '';
    for (let j = 0; j < notes.length; j++) {
      if (notes[j] === '[?]' || notes[j] === 'rest') {
        const dur = durations[j] ? (parseDurationBeats(durations[j]) || 1) : 1;
        noteXML += `      <note><rest/><duration>${dur}</duration><type>quarter</type></note>\n`;
        continue;
      }
      const xml = noteToXML(notes[j]);
      if (!xml) continue;
      const dur = durations[j] ? (parseDurationBeats(durations[j]) || 1) : 1;
      const type = dur >= 4 ? 'whole' : dur >= 2 ? 'half' : dur >= 1 ? 'quarter' : dur >= 0.5 ? 'eighth' : 'sixteenth';
      noteXML += `      <note>\n        <pitch><step>${xml.step}</step>${xml.alter ? `<alter>${xml.alter}</alter>` : ''}<octave>${xml.octave}</octave></pitch>\n        <duration>${dur}</duration>\n        <type>${type}</type>\n      </note>\n`;
    }

    // If no notes parsed, add a whole rest
    if (!noteXML) {
      noteXML = `      <note><rest/><duration>${timeNum}</duration><type>whole</type></note>\n`;
    }

    measureXML += `    <measure number="${i + 1}">\n`;
    if (i === 0) {
      measureXML += `      <attributes>\n        <divisions>1</divisions>\n        <key><fifths>${fifths}</fifths>${isMinor ? '<mode>minor</mode>' : '<mode>major</mode>'}</key>\n        <time><beats>${timeNum}</beats><beat-type>${timeDen}</beat-type></time>\n        <clef><sign>G</sign><line>2</line></clef>\n      </attributes>\n`;
    }
    measureXML += noteXML;
    measureXML += `    </measure>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work><work-title>${(title || 'Solfai Export').replace(/[<>&]/g, '')}</work-title></work>
  <identification>
    <creator type="composer">${(composer || '').replace(/[<>&]/g, '')}</creator>
    <encoding><software>Solfai</software><encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date></encoding>
  </identification>
  <part-list><score-part id="P1"><part-name>${(part || 'Voice').replace(/[<>&]/g, '')}</part-name></score-part></part-list>
  <part id="P1">
${measureXML}  </part>
</score-partwise>`;

  res.setHeader('Content-Type', 'application/vnd.recordare.musicxml+xml');
  res.setHeader('Content-Disposition', `attachment; filename="${(title || 'solfai-export').replace(/[^a-zA-Z0-9-_]/g, '_')}.musicxml"`);
  return res.send(xml);
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Contextual AI Practice Coach
// ═══════════════════════════════════════════════════════════
app.post('/api/practice-coach', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  const { measures, keySignature, part, evaluationResults } = req.body;
  if (!measures?.length) return res.status(400).json({ error: 'No practice data provided' });

  try {
    const weakMeasures = [];
    if (evaluationResults) {
      for (const r of evaluationResults) {
        if (r.score < 70 || r.issues?.length > 0) {
          weakMeasures.push({ measure: r.measure, score: r.score, issues: r.issues || [] });
        }
      }
    }

    const prompt = `You are a warm, encouraging choir coach giving specific practice advice.
The singer is practicing the ${part || 'Soprano'} part in ${keySignature || 'C major'}.

${weakMeasures.length > 0 ? `They struggled with these measures:
${weakMeasures.map(w => `- Measure ${w.measure}: score ${w.score}/100, issues: ${w.issues.join(', ')}`).join('\n')}` : 'They are starting a new practice session.'}

Give 3-5 short, specific tips. Each tip should be actionable and reference music theory concepts
(intervals, solfege syllables, breath marks) where helpful. Keep it encouraging — this is a student, not a professional.

Respond as a JSON array of strings. Each string is one tip. Example:
["Tip 1", "Tip 2", "Tip 3"]`;

    const raw = await callGemini(apiKey, 'You are a choir practice coach.', [{ text: prompt }], {
      model: GEMINI_FLASH,
      temperature: 0.7,
      maxOutputTokens: 1024,
      thinkingBudget: 0,
    });

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const tips = JSON.parse(cleaned);

    return res.json({ tips: Array.isArray(tips) ? tips : [tips], weakMeasures });
  } catch (err) {
    console.error('[Solfai] Practice coach error:', err.message);
    return res.status(500).json({ error: 'Failed to generate coaching tips' });
  }
});

// ═══════════════════════════════════════════════════════════
// FEATURE: Smart Practice Queue
// ═══════════════════════════════════════════════════════════
app.post('/api/smart-practice', (req, res) => {
  const { evaluationHistory, measures, currentMeasure } = req.body;
  if (!measures?.length) return res.status(400).json({ error: 'No measures provided' });

  // Build a weakness map from evaluation history
  const weaknessMap = {};
  if (evaluationHistory?.length) {
    for (const eval_ of evaluationHistory) {
      for (const r of (eval_.results || [])) {
        const key = String(r.measure);
        if (!weaknessMap[key]) weaknessMap[key] = { totalScore: 0, attempts: 0, lastAttempt: 0, issues: new Set() };
        weaknessMap[key].totalScore += r.score || 0;
        weaknessMap[key].attempts += 1;
        weaknessMap[key].lastAttempt = eval_.timestamp || Date.now();
        (r.issues || []).forEach(i => weaknessMap[key].issues.add(i));
      }
    }
  }

  // Score each measure: lower = needs more practice
  const scored = measures.map((m, i) => {
    const num = String(m.num || i + 1);
    const weakness = weaknessMap[num];
    let priority = 50; // default: medium priority

    if (weakness) {
      const avgScore = weakness.totalScore / weakness.attempts;
      priority = 100 - avgScore; // lower avg score = higher priority

      // Spaced repetition: recently practiced measures get lower priority
      const hoursSinceLastAttempt = (Date.now() - weakness.lastAttempt) / (1000 * 60 * 60);
      if (hoursSinceLastAttempt < 1) priority *= 0.5; // just practiced, lower priority
      else if (hoursSinceLastAttempt > 24) priority *= 1.3; // long time ago, boost
    }

    return { measureNum: num, priority: Math.round(priority), avgScore: weakness ? Math.round(weakness.totalScore / weakness.attempts) : null, attempts: weakness?.attempts || 0, issues: weakness ? [...weakness.issues] : [] };
  });

  // Sort by priority (highest first)
  scored.sort((a, b) => b.priority - a.priority);

  // Return top 10 measures to practice
  const queue = scored.slice(0, 10);

  return res.json({ queue, totalMeasures: measures.length, weakMeasureCount: Object.keys(weaknessMap).length });
});

// ─── SPA fallback ─────────────────────────────────────────
// Any non-API, non-classic GET route is handled by the React app's client-side
// router (e.g. /library, /practice, /vocal-coach → serve the SPA shell).
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/classic') || req.path === '/sw.js') return next();
  if (HAS_CLIENT_BUILD) return res.sendFile(join(CLIENT_DIST, 'index.html'));
  return next();
});

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => console.log(`[Solfai v10] Running on port ${PORT}`));
