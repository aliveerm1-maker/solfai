// tools/test-player-browser.mjs — real-browser integration test for the solfège
// player. Loads the ACTUAL served page in headless Chrome, mounts the player on
// real MusicXML data, plays it, and asserts the transport bar renders, the
// highlight goes active locked to the audio clock, and the image/PDF gate shows
// the honest "needs MusicXML" message. Catches runtime breakage node can't.
//
// Requires: a server running (default http://localhost:3300/classic) + Chrome.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE_URL = process.env.PAGE_URL || 'http://localhost:3300/classic/';
const fixture = JSON.parse(readFileSync(new URL('./_ave-structured.json', import.meta.url), 'utf8')).structured;
const imageFixture = {
  source: 'gemini', tonic: 'C', keySignature: 'C major', timeSignature: '4/4',
  measures: [{ num: 1, notes: ['C4','D4'], solfege: ['Do','Re'], lyrics: '', confidence: 'medium', disagreement: false }],
  rehearsalMarks: [], durationWarnings: [], dynamicChanges: [], tempoChanges: [],
};

let pass = 0, fail = 0;
const ok = (n, c, d='') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox', '--disable-gpu'],
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  // Ignore pre-existing environmental noise unrelated to the player:
  // Google Sign-In rejects the localhost origin (OAuth client only allows prod),
  // and CDN/network 404s for Tone samples etc. under headless.
  const IGNORE = /GSI_LOGGER|given origin is not allowed|accounts\.google|Failed to load resource|net::ERR|gstatic|Tone\.js/i;
  page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push('console.error: ' + m.text()); });

  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction('typeof SolfegePlayer !== "undefined" && typeof renderSolfege === "function"', { timeout: 15000 });
  ok('page loaded, SolfegePlayer + renderSolfege defined', true);

  // ── mount on MusicXML data ──
  const mountRes = await page.evaluate((fx) => {
    window._solfegeStructured = fx;
    renderSolfege(document.getElementById('solfegeOutput'), fx);
    return {
      hasBar: !!document.getElementById('spBar'),
      measureEls: document.querySelectorAll('#solfegeOutput .sp-measure[data-sp-measure]').length,
      noteEls: document.querySelectorAll('#solfegeOutput .sp-note[data-sp-note]').length,
      hasPlay: !!document.getElementById('spPlay'),
      hasTempo: !!document.getElementById('spTempo'),
      state: SolfegePlayer.getState(),
    };
  }, fixture);
  ok('transport bar mounted for MusicXML', mountRes.hasBar);
  ok('all 6 measures rendered with data-sp-measure', mountRes.measureEls === 6, `${mountRes.measureEls}`);
  ok('all 16 notes rendered with data-sp-note', mountRes.noteEls === 16, `${mountRes.noteEls}`);
  ok('play + tempo controls present', mountRes.hasPlay && mountRes.hasTempo);

  // ── play, then sample the highlight after real audio time elapses ──
  await page.evaluate(() => SolfegePlayer.play());
  await new Promise(r => setTimeout(r, 1300));
  const mid = await page.evaluate(() => {
    const act = document.querySelector('#solfegeOutput .sp-note.sp-active');
    const am = document.querySelector('#solfegeOutput .sp-measure.sp-active');
    return {
      state: SolfegePlayer.getState(),
      activeNote: act ? act.getAttribute('data-sp-note') : null,
      activeMeasure: am ? am.getAttribute('data-sp-measure') : null,
      nowText: (document.getElementById('spNow') || {}).textContent || '',
      progressW: (document.getElementById('spProg') || {}).style?.width || '0%',
    };
  });
  ok('state === playing after play()', mid.state === 'playing', mid.state);
  ok('a note is highlighted (highlight locked to audio)', mid.activeNote !== null, `note idx ${mid.activeNote}`);
  ok('active measure is m1 at ~1.3s (0.833s/note)', mid.activeMeasure === '1', `m${mid.activeMeasure}`);
  ok('now-playing shows a measure', /Measure/i.test(mid.nowText), JSON.stringify(mid.nowText).slice(0,60));
  ok('progress bar advanced', parseFloat(mid.progressW) > 0, mid.progressW);

  // ── pause / stop ──
  const afterPause = await page.evaluate(() => { SolfegePlayer.pause(); return SolfegePlayer.getState(); });
  ok('pause() → paused', afterPause === 'paused');
  const afterStop = await page.evaluate(() => { SolfegePlayer.stop(); return { state: SolfegePlayer.getState(), active: document.querySelectorAll('#solfegeOutput .sp-active').length }; });
  ok('stop() → stopped + highlights cleared', afterStop.state === 'stopped' && afterStop.active === 0, `active=${afterStop.active}`);

  // ── tempo slider halves/scales without error ──
  const tempoOk = await page.evaluate(() => {
    const before = SolfegePlayer._schedule().totalSec;
    SolfegePlayer.setTempo(0.5);
    const after = SolfegePlayer._schedule().totalSec;
    return { before, after };
  });
  ok('tempo 50% doubles total duration', Math.abs(tempoOk.after - tempoOk.before * 2) < 0.01, `${tempoOk.before.toFixed(1)}→${tempoOk.after.toFixed(1)}s`);

  // ── image/PDF gate ──
  const gate = await page.evaluate((fx) => {
    renderSolfege(document.getElementById('solfegeOutput'), fx);
    const un = document.querySelector('#solfegeOutput .sp-unavailable');
    return { hasUnavailable: !!un, mentionsMusicXML: un ? /MusicXML/i.test(un.textContent) : false, hasBar: !!document.getElementById('spBar') };
  }, imageFixture);
  ok('image/PDF source → no player bar', !gate.hasBar);
  ok('image/PDF source → honest "needs MusicXML" message', gate.hasUnavailable && gate.mentionsMusicXML);

  ok('no page/runtime errors during test', errors.length === 0, errors.slice(0,3).join(' | '));

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
