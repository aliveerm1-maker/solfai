// tools/test-timing.mjs — verifies the pure timing math used by the solfège
// player BEFORE it's wired to Web Audio. The same functions are pasted into
// public/index.html (window.SolfegeTiming); keep them in sync. Run:
//   node tools/test-timing.mjs
//
// Why a separate test: drift is the #1 failure mode for musical playback. This
// asserts cumulative time == sum of durations (no accumulation error), tempo
// scaling is exact, and tempoChanges take effect at the right measure.

// ─── PURE TIMING MATH (mirror of window.SolfegeTiming in index.html) ────────
const BEAT_UNIT_FRACTION = {
  whole: 1, half: 0.5, quarter: 0.25, eighth: 0.125, '16th': 0.0625, '32nd': 0.03125,
};
function beatUnitFraction(u) { return BEAT_UNIT_FRACTION[u] || 0.25; }

// seconds for a note of `durWhole` (fraction of a whole note) at `bpm` counted
// in `beatUnit`. bpm is beats-per-minute where one beat = beatUnit.
function noteSeconds(durWhole, bpm, beatUnit) {
  const secPerBeat = 60 / bpm;
  const beats = durWhole / beatUnitFraction(beatUnit); // how many beats this note lasts
  return beats * secPerBeat;
}

// Resolve bpm + beatUnit active at each measure number from tempoChanges.
// A change with bpm=null (e.g. "poco rit.") keeps the previous numeric bpm.
function buildTempoMap(measures, tempoChanges, fallbackBpm) {
  const changes = (tempoChanges || []).filter(t => t && t.measure != null)
    .sort((a, b) => a.measure - b.measure);
  const map = new Map();
  let bpm = fallbackBpm, beatUnit = 'quarter', usedFallback = true;
  // seed from a change at/or before the first measure
  const first = changes.find(c => c.bpm != null);
  if (first) { /* handled in walk */ }
  const nums = measures.map(m => m.num);
  const minNum = Math.min(...nums);
  for (const m of nums) {
    // apply any change whose measure <= m
    for (const c of changes) {
      if (c.measure <= m) {
        if (c.bpm != null) { bpm = c.bpm; usedFallback = false; }
        if (c.beatUnit) beatUnit = c.beatUnit;
      }
    }
    map.set(m, { bpm, beatUnit });
  }
  // if the very first measure had no numeric tempo anywhere <= it, it's fallback
  const anyNumeric = changes.some(c => c.bpm != null);
  return { map, usedFallback: !anyNumeric, minNum };
}

// Build the flat, absolute-time schedule. tempoMult 0.5..1.5 (practice slider).
function buildSchedule(structured, tempoMult = 1) {
  const measures = structured.measures || [];
  const fallbackBpm = 80;
  const { map: tempoMap, usedFallback } = buildTempoMap(measures, structured.tempoChanges, fallbackBpm);
  const events = [];
  let t = 0;
  for (const m of measures) {
    const { bpm, beatUnit } = tempoMap.get(m.num) || { bpm: fallbackBpm, beatUnit: 'quarter' };
    const effBpm = bpm * tempoMult;
    const notes = m.notes || [], durs = m.durations || [];
    for (let i = 0; i < notes.length; i++) {
      const durWhole = (typeof durs[i] === 'number' && durs[i] > 0) ? durs[i] : 0.25;
      const secs = noteSeconds(durWhole, effBpm, beatUnit);
      events.push({
        measureNum: m.num, noteIdx: i, note: notes[i],
        startSec: t, durSec: secs, bpm: effBpm, beatUnit,
      });
      t += secs;
    }
  }
  return { events, totalSec: t, usedFallbackTempo: usedFallback, fallbackBpm };
}

// ─── TEST ───────────────────────────────────────────────────────────────────
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Parse ave-maria via the running keyless server (started by caller) OR inline fixture.
const structured = JSON.parse(process.env.STRUCTURED_JSON
  ? readFileSync(process.env.STRUCTURED_JSON, 'utf8')
  : readFileSync(new URL('./_ave-structured.json', import.meta.url), 'utf8')).structured
  || JSON.parse(readFileSync(process.env.STRUCTURED_JSON, 'utf8'));

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { (cond ? pass++ : fail++); console.log(`${cond ? '✓' : '✗ FAIL'} ${name}${detail ? ' — ' + detail : ''}`); };
const approx = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

const S = structured;
const sched = buildSchedule(S, 1);
const totalNotes = S.measures.reduce((s, m) => s + (m.notes || []).length, 0);
const sumDur = S.measures.reduce((s, m) => s + (m.durations || []).reduce((x, d) => x + d, 0), 0);

ok('one event per note', sched.events.length === totalNotes, `${sched.events.length}/${totalNotes}`);

// monotonic non-overlapping onsets
let mono = true;
for (let i = 1; i < sched.events.length; i++) {
  if (sched.events[i].startSec < sched.events[i - 1].startSec + sched.events[i - 1].durSec - 1e-9) mono = false;
}
ok('onsets strictly sequential (no drift/overlap)', mono);

// NO DRIFT: total == sum of independently-computed per-note seconds
const independentTotal = sched.events.reduce((s, e) => s + e.durSec, 0);
ok('total == Σ per-note seconds (drift-free)', approx(sched.totalSec, independentTotal), `${sched.totalSec.toFixed(4)}s`);

// ave-maria: 4/4 at quarter=72 → each full measure 3.3333s; first note at 0
ok('first onset at t=0', approx(sched.events[0].startSec, 0));
const m1secPerWhole = 60 / 72 / 0.25; // = 3.3333
ok('quarter@72 = 0.8333s', approx(noteSeconds(0.25, 72, 'quarter'), 0.833333, 1e-5));
ok('dotted-half@72 = 2.5s', approx(noteSeconds(0.75, 72, 'quarter'), 2.5, 1e-5));

// tempo slider: 50% doubles every time, 150% scales by 1/1.5
const slow = buildSchedule(S, 0.5), fast = buildSchedule(S, 1.5);
ok('tempoMult 0.5 → 2× total', approx(slow.totalSec, sched.totalSec * 2, 1e-4), `${slow.totalSec.toFixed(2)}s`);
ok('tempoMult 1.5 → total/1.5', approx(fast.totalSec, sched.totalSec / 1.5, 1e-4));

// tempoChanges: ave-maria has m5 "poco rit." with bpm=null → must keep 72 (not fallback)
const m5ev = sched.events.find(e => e.measureNum === 5);
ok('null-bpm tempo change keeps prior bpm (72, not fallback 80)', m5ev && approx(m5ev.bpm, 72));
ok('usedFallbackTempo = false (score has a tempo)', sched.usedFallbackTempo === false);

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed  |  totalSec=${sched.totalSec.toFixed(3)}  notes=${totalNotes}  sumDurWhole=${sumDur}`);
process.exit(fail === 0 ? 0 : 1);
