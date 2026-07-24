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

// ── dynamics envelope (mirror of window.SolfegePlayer.buildGainEnvelope) ──
const DYN_LEVEL = { ppp:0.08, pp:0.12, p:0.2, mp:0.3, mf:0.42, f:0.58, ff:0.78, fff:0.9, fp:0.2, sf:0.6 };
const levelOf = mark => { const k = String(mark||'').toLowerCase().replace(/[^a-z]/g,''); return DYN_LEVEL[k] != null ? DYN_LEVEL[k] : null; };
function buildGainEnvelope(structured, events) {
  const DEFAULT = 0.42;
  if (!events.length) return () => DEFAULT;
  const totalSec = events[events.length-1].startSec + events[events.length-1].durSec;
  const mstart = {}; for (const e of events) if (mstart[e.measureNum] == null) mstart[e.measureNum] = e.startSec;
  const dyn = (structured.dynamicChanges || []).map(d => ({ measure: d.measure, mark: String(d.mark||'') }))
    .filter(d => mstart[d.measure] != null).sort((a,b) => a.measure - b.measure);
  const pts = []; let cur = DEFAULT;
  const firstConcrete = dyn.find(d => levelOf(d.mark) != null);
  if (firstConcrete && firstConcrete.measure <= events[0].measureNum) cur = levelOf(firstConcrete.mark);
  pts.push({ t: 0, level: cur });
  for (let i = 0; i < dyn.length; i++) {
    const d = dyn[i], t = mstart[d.measure], lvl = levelOf(d.mark);
    if (lvl != null) { pts.push({ t, level: cur }); pts.push({ t, level: lvl }); cur = lvl; }
    else if (/cres/i.test(d.mark) || /dim|decres/i.test(d.mark)) {
      const dir = /cres/i.test(d.mark) ? 1 : -1;
      const nextC = dyn.slice(i+1).find(x => levelOf(x.mark) != null);
      let tEnd, lEnd;
      if (nextC) { tEnd = mstart[nextC.measure]; lEnd = levelOf(nextC.mark); }
      else { tEnd = totalSec; lEnd = Math.min(0.9, Math.max(0.08, cur + dir*0.18)); }
      pts.push({ t, level: cur }); pts.push({ t: tEnd, level: lEnd }); cur = lEnd;
    }
  }
  pts.push({ t: totalSec + 0.001, level: cur });
  pts.sort((a,b) => a.t - b.t);
  const fn = tt => { let i=0; while(i+1<pts.length && pts[i+1].t<=tt) i++; const a=pts[i]; if(i+1>=pts.length) return a.level; const b=pts[i+1]; if(b.t<=a.t) return b.level; return a.level+(b.level-a.level)*((tt-a.t)/(b.t-a.t)); };
  fn._mstart = mstart;
  return fn;
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

// ── dynamics: ave-maria = p@1, cresc@3, mf@4, pp@6 ──
const gainAt = buildGainEnvelope(S, sched.events);
const ms = gainAt._mstart;
ok('opening dynamic p → 0.20 gain', approx(gainAt(ms[1]), 0.2, 1e-6), gainAt(ms[1]).toFixed(3));
ok('m2 holds p (0.20)', approx(gainAt(ms[2]), 0.2, 1e-6));
ok('mf@m4 → 0.42 gain', approx(gainAt(ms[4]), 0.42, 1e-6), gainAt(ms[4]).toFixed(3));
ok('pp@m6 → 0.12 gain', approx(gainAt(ms[6]), 0.12, 1e-6), gainAt(ms[6]).toFixed(3));
// cresc. across m3: strictly rising from 0.20 toward 0.42
const m3a = gainAt(ms[3] + 0.01), m3mid = gainAt((ms[3]+ms[4])/2), m3b = gainAt(ms[4] - 0.01);
ok('cresc. m3 ramps upward (p→mf, strictly rising)', m3a < m3mid && m3mid < m3b && m3a >= 0.2 - 1e-6 && m3b <= 0.42 + 1e-6,
   `${m3a.toFixed(3)} < ${m3mid.toFixed(3)} < ${m3b.toFixed(3)}`);
ok('m5 (poco rit, non-dynamic) holds mf 0.42', approx(gainAt(ms[5]), 0.42, 1e-6));

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed  |  totalSec=${sched.totalSec.toFixed(3)}  notes=${totalNotes}  sumDurWhole=${sumDur}`);
process.exit(fail === 0 ? 0 : 1);
