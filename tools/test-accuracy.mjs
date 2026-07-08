// tools/test-accuracy.mjs — Solfai accuracy harness.
//
// Runs labeled test PDFs through the REAL /api/analyze pipeline and scores
// key signature (accidental count, mode, full key) and time signature against
// visually-verified ground truth in test-data/labels.json.
//
// Usage:
//   node tools/test-accuracy.mjs                       # local server, rasterized pages (classic-UI path)
//   node tools/test-accuracy.mjs --raw-pdf             # send raw PDF base64 (new-React-UI path)
//   node tools/test-accuracy.mjs --target=https://solfai-v2.onrender.com
//   node tools/test-accuracy.mjs --only=daniel         # substring filter
//   node tools/test-accuracy.mjs --tag=baseline        # tag saved into the results file
//
// Results are printed as a table and saved to tools/results/<timestamp>-<tag>.json
// so before/after comparisons survive across sessions.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { rasterizePdf } from './rasterize.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? true] : [a, true];
}));
const TARGET = args.target || 'http://localhost:3000';
const RAW_PDF = !!args['raw-pdf'];
const ONLY = args.only || null;
const TAG = args.tag || (RAW_PDF ? 'raw-pdf' : 'rasterized');
const PART = args.part || 'Soprano';
const TIMEOUT_MS = Number(args.timeout || 300000);

const labels = JSON.parse(readFileSync(join(ROOT, 'test-data', 'labels.json'), 'utf8'));

// ── key parsing helpers ────────────────────────────────────────────────────
const KEY_TO_COUNTS = {
  'c major': [0, 0], 'a minor': [0, 0],
  'f major': [1, 0], 'd minor': [1, 0],
  'bb major': [2, 0], 'g minor': [2, 0],
  'eb major': [3, 0], 'c minor': [3, 0],
  'ab major': [4, 0], 'f minor': [4, 0],
  'db major': [5, 0], 'bb minor': [5, 0],
  'gb major': [6, 0], 'eb minor': [6, 0],
  'cb major': [7, 0], 'ab minor': [7, 0],
  'g major': [0, 1], 'e minor': [0, 1],
  'd major': [0, 2], 'b minor': [0, 2],
  'a major': [0, 3], 'f# minor': [0, 3],
  'e major': [0, 4], 'c# minor': [0, 4],
  'b major': [0, 5], 'g# minor': [0, 5],
  'f# major': [0, 6], 'd# minor': [0, 6],
  'c# major': [0, 7], 'a# minor': [0, 7],
};

function parseKey(s) {
  if (!s) return null;
  const m = String(s).toLowerCase().match(/([a-g](?:#|b)?)\s*(major|minor)/);
  if (!m) return null;
  const name = `${m[1]} ${m[2]}`;
  const counts = KEY_TO_COUNTS[name];
  return { name, tonic: m[1], mode: m[2], flats: counts?.[0] ?? null, sharps: counts?.[1] ?? null };
}

function normTime(s) {
  if (!s) return null;
  const t = String(s).trim().toLowerCase();
  if (t === 'c' || t === 'common' || t === 'common time') return '4/4';
  if (t === 'cut' || t === 'cut time' || t === 'c|' || t === 'alla breve') return '2/2';
  const m = t.match(/(\d+)\s*\/\s*(\d+)/);
  return m ? `${m[1]}/${m[2]}` : t;
}

// ── run one piece ──────────────────────────────────────────────────────────
async function runPiece(entry) {
  const pdfPath = join(ROOT, 'test-data', 'pdfs', entry.file);
  const buf = readFileSync(pdfPath);
  const body = { mode: 'analyze', selectedPart: entry.part || PART };
  if (RAW_PDF) {
    body.imageBase64 = buf.toString('base64');
    body.imageMime = 'application/pdf';
  } else {
    const { pages } = await rasterizePdf(buf, { scale: 3.0, quality: 0.92, maxPages: 5 });
    body.pdfPages = pages;
  }

  const t0 = Date.now();
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res, data;
  try {
    res = await fetch(`${TARGET}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    data = await res.json().catch(() => ({}));
  } catch (e) {
    clearTimeout(to);
    return { entry, error: e.name === 'AbortError' ? `timeout ${TIMEOUT_MS}ms` : e.message, ms: Date.now() - t0 };
  }
  clearTimeout(to);
  const ms = Date.now() - t0;
  if (!res.ok) return { entry, error: `HTTP ${res.status}: ${(data.error || '').slice(0, 80)}`, ms };

  const s = data.structured || {};
  const predKey = parseKey(s.keySignature);
  const predTime = normTime(s.timeSignature);
  const trueKey = parseKey(entry.key);
  const trueTime = normTime(entry.time);

  return {
    entry, ms,
    predKeyRaw: s.keySignature || null,
    predTimeRaw: s.timeSignature || null,
    keyFull: !!(predKey && trueKey && predKey.name === trueKey.name),
    keyCount: !!(predKey && trueKey && predKey.flats === trueKey.flats && predKey.sharps === trueKey.sharps),
    keyMode: !!(predKey && trueKey && predKey.mode === trueKey.mode),
    timeOk: !!(predTime && trueTime && predTime === trueTime),
  };
}

// ── main ───────────────────────────────────────────────────────────────────
const list = labels.filter(l => !ONLY || l.file.toLowerCase().includes(ONLY.toLowerCase()) || (l.title || '').toLowerCase().includes(ONLY.toLowerCase()));
if (!list.length) { console.error('No labeled pieces match.'); process.exit(1); }

console.log(`Target: ${TARGET}   input: ${RAW_PDF ? 'RAW PDF (new-UI path)' : 'rasterized pages (classic path)'}   pieces: ${list.length}\n`);

const results = [];
for (const entry of list) {
  process.stdout.write(`▶ ${entry.title.padEnd(38)} `);
  const r = await runPiece(entry);
  results.push(r);
  if (r.error) {
    console.log(`ERROR ${r.error} (${(r.ms / 1000).toFixed(0)}s)`);
  } else {
    const k = r.keyFull ? '✓' : `✗ ${r.predKeyRaw}`;
    const t = r.timeOk ? '✓' : `✗ ${r.predTimeRaw}`;
    console.log(`key:${k}  time:${t}  (${(r.ms / 1000).toFixed(0)}s)`);
  }
}

const ok = results.filter(r => !r.error);
const pct = (n, d) => d ? `${Math.round(100 * n / d)}% (${n}/${d})` : 'n/a';
const summary = {
  tag: TAG, target: TARGET, rawPdf: RAW_PDF, when: new Date().toISOString(),
  gitRev: (() => { try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch { return '?'; } })(),
  pieces: list.length,
  completed: ok.length,
  errors: results.length - ok.length,
  keyFullPct: pct(ok.filter(r => r.keyFull).length, ok.length),
  keyCountPct: pct(ok.filter(r => r.keyCount).length, ok.length),
  keyModePct: pct(ok.filter(r => r.keyMode).length, ok.length),
  timePct: pct(ok.filter(r => r.timeOk).length, ok.length),
  avgSeconds: ok.length ? Math.round(ok.reduce((s, r) => s + r.ms, 0) / ok.length / 1000) : null,
};

console.log('\n══════════ SUMMARY ══════════');
console.log(`completed:        ${summary.completed}/${summary.pieces}  (${summary.errors} errors)`);
console.log(`KEY full match:   ${summary.keyFullPct}`);
console.log(`KEY count match:  ${summary.keyCountPct}   (right number of accidentals)`);
console.log(`KEY mode match:   ${summary.keyModePct}   (major/minor)`);
console.log(`TIME match:       ${summary.timePct}`);
console.log(`avg latency:      ${summary.avgSeconds}s`);

const fails = ok.filter(r => !r.keyFull || !r.timeOk);
if (fails.length) {
  console.log('\n── failures ──');
  for (const r of fails) {
    console.log(`  ${r.entry.title}: true ${r.entry.key} ${r.entry.time} → got ${r.predKeyRaw} ${r.predTimeRaw}`);
  }
}
for (const r of results.filter(r => r.error)) console.log(`  ${r.entry.title}: ERROR ${r.error}`);

mkdirSync(join(__dirname, 'results'), { recursive: true });
const outFile = join(__dirname, 'results', `${new Date().toISOString().replace(/[:.]/g, '-')}-${TAG}.json`);
writeFileSync(outFile, JSON.stringify({ summary, results: results.map(r => ({ ...r, entry: { file: r.entry.file, title: r.entry.title, key: r.entry.key, time: r.entry.time } })) }, null, 2));
console.log(`\nSaved: ${outFile}`);
