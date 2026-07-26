// tools/test-musicxml-parser.mjs — regression test for parseMusicXML against
// BOTH MusicXML dialects. Runs against a live server (no need to export the
// function) via POST /api/parse-musicxml.
//
// The bug this locks down: `<note>` legitimately carries attributes
// (`<note default-x="82.13">`) in Audiveris / MuseScore / Finale output. The
// parser matched only a bare `<note>`, so those files silently yielded ZERO
// notes — and, worse, the OMR override's `omrNoteCount >= 4` sanity gate could
// never pass, disabling OMR entirely on the vision path.
import { readFileSync } from 'fs';

const BASE = process.env.BASE || 'http://localhost:3300';
let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

async function parse(path, selectedPart) {
  const buf = readFileSync(new URL(path, import.meta.url));
  const fd = new FormData();
  fd.append('file', new Blob([buf]), path.split('/').pop());
  fd.append('selectedPart', selectedPart);
  const res = await fetch(`${BASE}/api/parse-musicxml`, { method: 'POST', body: fd });
  return { status: res.status, body: await res.json() };
}

const countNotes = s => (s.measures || []).reduce((n, m) => n + (m.notes?.length || 0), 0);

// ── 1. ATTRIBUTED <note ...> — the Audiveris dialect that was broken ──
{
  const { status, body } = await parse('../test-data/audiveris-attributed-notes.musicxml', 'Voice');
  ok('attributed-note file: HTTP 200', status === 200, `got ${status}`);
  const s = body.structured || {};
  const notes = countNotes(s);
  ok('attributed-note file: notes are parsed (was 0 before the fix)', notes > 0, `${notes} notes`);
  ok('attributed-note file: measures are parsed', (s.measures || []).length > 0, `${(s.measures || []).length} measures`);
  ok('attributed-note file: solfège computed for real notes',
    (s.measures || []).some(m => (m.solfege || []).some(x => x && x !== '?')),
    JSON.stringify((s.measures || [])[0]?.solfege));
  ok('attributed-note file: key still read correctly', s.keySignature === 'B major', s.keySignature);
  ok('attributed-note file: time still read correctly', s.timeSignature === '3/2', s.timeSignature);
}

// ── 2. BARE <note> — the dialect that already worked, must not regress ──
{
  const { status, body } = await parse('../test-data/ave-maria-soprano.musicxml', 'Soprano');
  ok('bare-note file: HTTP 200', status === 200, `got ${status}`);
  const s = body.structured || {};
  ok('bare-note file: still parses notes (no regression)', countNotes(s) > 0, `${countNotes(s)} notes`);
  ok('bare-note file: still 6 measures', (s.measures || []).length === 6, `${(s.measures || []).length}`);
  ok('bare-note file: key unchanged (C major)', s.keySignature === 'C major', s.keySignature);
  ok('bare-note file: meter unchanged (4/4)', s.timeSignature === '4/4', s.timeSignature);
}

// ── 3. Missing voice part must be SURFACED, not silently substituted ──
{
  // The Audiveris file has parts ["Voice","Piano"] — there is no Soprano.
  const { body } = await parse('../test-data/audiveris-attributed-notes.musicxml', 'Soprano');
  const s = body.structured || {};
  ok('missing part: partFallback is reported', !!s.partFallback, JSON.stringify(s.partFallback));
  if (s.partFallback) {
    ok('missing part: names what was requested', s.partFallback.requested === 'Soprano', s.partFallback.requested);
    ok('missing part: lists the parts that DO exist',
      Array.isArray(s.partFallback.available) && s.partFallback.available.includes('Voice'),
      JSON.stringify(s.partFallback.available));
  }
}

// ── 4. Single-part score must NOT be flagged as a fallback ──
{
  const { body } = await parse('../test-data/ave-maria-soprano.musicxml', 'Soprano');
  ok('single-part score: no spurious fallback warning', !body.structured?.partFallback,
    JSON.stringify(body.structured?.partFallback));
}

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
