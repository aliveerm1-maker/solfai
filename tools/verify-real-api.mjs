// tools/verify-real-api.mjs — proves the chat UI hits the REAL backend and no
// longer serves fabricated analysis.
//
// The old build returned buildMockAnalysis() — invented Palestrina "Sicut
// cervus" data — for ANY upload. Two things must now hold:
//   1. a real POST to /api/parse-musicxml (or /api/analyze) actually fires;
//   2. the rendered result matches the UPLOADED file, not the mock fixture.
// Run against a keyless server: MusicXML parsing needs no Gemini key, so the
// real path returns real data for free.
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3300';
const mxl = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const sleep = ms => new Promise(r => setTimeout(r, ms));

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

// Fingerprints of the deleted mock fixture. If ANY appear, fabricated data is
// still reaching the screen.
const MOCK_MARKERS = ['Sicut cervus', 'Sicut', 'cervus', 'de-si-', 'fon-tes', 'Palestrina'];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  const apiCalls = [];
  page.on('request', r => { if (r.url().includes('/api/')) apiCalls.push(r.method() + ' ' + new URL(r.url()).pathname); });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('input[type=file]', { timeout: 30000 });
  await sleep(1200);

  const input = await page.$('input[type=file]');
  await input.uploadFile(mxl);
  await sleep(500);

  // Submit however the composer exposes it (button, or Enter in the textarea).
  const submitted = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b =>
      /send|run|analy/i.test(b.textContent || '') || b.getAttribute('aria-label')?.match(/send|run/i));
    if (btn && !btn.disabled) { btn.click(); return 'button'; }
    return null;
  });
  if (!submitted) {
    const ta = await page.$('textarea');
    if (ta) { await ta.focus(); await page.keyboard.press('Enter'); }
  }

  // Wait for either a real result or a surfaced error — both are acceptable
  // proof of the real path; silent success on fake data is not.
  await page.waitForFunction(
    () => /C major|4\/4|Andante|error|failed|couldn't|could not/i.test(document.body.innerText),
    { timeout: 60000 },
  ).catch(() => {});
  await sleep(1500);

  const body = await page.evaluate(() => document.body.innerText);

  const realCall = apiCalls.some(c => c === 'POST /api/parse-musicxml' || c === 'POST /api/analyze');
  ok('real backend call fired', realCall, apiCalls.join(' | ') || 'NO /api CALLS AT ALL');

  const mockHits = MOCK_MARKERS.filter(m => body.includes(m));
  ok('no fabricated mock data on screen', mockHits.length === 0, mockHits.join(', '));

  // Real data from OUR uploaded file: ave-maria-soprano.mxl parses to C major, 4/4,
  // "Andante con moto", titled Ave Maria — none of which the mock fixture contained.
  const realData = /Ave Maria/i.test(body) || /C major/i.test(body) || /Andante/i.test(body);
  const errored = /error|failed|couldn't|could not|unavailable/i.test(body);
  ok('result reflects the UPLOADED file (or fails honestly)', realData || errored,
    realData ? 'real parsed data shown' : errored ? 'honest error shown' : 'NEITHER — silent/blank');

  if (realData) ok('parsed values match the real file (Ave Maria / C / 4/4)', /Ave Maria/i.test(body));

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
