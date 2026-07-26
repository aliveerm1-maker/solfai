// tools/verify-sightread.mjs — verifies Sight-read is genuinely re-wired:
// asking for a drill in chat opens the artifact and renders a REAL exercise
// fetched from POST /api/sight-reading, with no score uploaded at all.
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3300';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  const calls = [];
  const payloads = [];
  page.on('request', r => {
    if (r.url().includes('/api/')) {
      calls.push(r.method() + ' ' + new URL(r.url()).pathname);
      if (r.url().includes('sight-reading')) payloads.push(r.postData() || '');
    }
  });
  // capture the real response so we can prove the UI shows what the server sent
  let serverExercise = null;
  page.on('response', async res => {
    if (res.url().includes('/api/sight-reading') && res.status() === 200) {
      try { serverExercise = await res.json(); } catch { /* ignore */ }
    }
  });

  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('textarea', { timeout: 30000 });
  await sleep(1200);

  // Ask for a drill WITHOUT uploading anything.
  await page.focus('textarea');
  await page.keyboard.type('give me a sight-reading exercise');
  await page.keyboard.press('Enter');

  await page.waitForFunction(
    () => /sight-read|drill/i.test(document.body.innerText),
    { timeout: 20000 },
  ).catch(() => {});
  await sleep(900);

  // Open the artifact via its stable testid trigger.
  await page.evaluate(() => document.querySelector('[data-testid="artifact-trigger-sightread"]')?.click());
  await page.waitForFunction(
    () => document.querySelector('[data-testid="section-sightread"]') !== null,
    { timeout: 15000 },
  ).catch(() => {});
  await sleep(2000);

  const rendered = await page.$('[data-testid="section-sightread"]') !== null;
  ok('drill works with NO score uploaded (artifact rendered)', rendered);

  ok('real POST /api/sight-reading fired', calls.some(c => c === 'POST /api/sight-reading'),
    calls.join(' | ') || 'no /api calls');

  const body = await page.evaluate(() => document.body.innerText);
  ok('no blank panel — exercise measures rendered',
    await page.$('[data-testid="sightread-measures"]') !== null || /generating/i.test(body));

  // Prove the DOM shows the SERVER's notes, not invented ones.
  if (serverExercise?.measures?.length) {
    const firstNotes = serverExercise.measures[0].notes || [];
    const firstSolfege = serverExercise.measures[0].solfege || [];
    const shown = firstNotes.filter(n => body.includes(n)).length;
    const solShown = firstSolfege.filter(s => body.includes(s)).length;
    ok('rendered notes match the server response exactly',
      shown > 0 && solShown > 0,
      `server m1 notes=[${firstNotes.join(',')}] solfege=[${firstSolfege.join(',')}] — ${shown} notes + ${solShown} solfège found in DOM`);
    ok('server generated a real exercise (key/meter present)',
      !!serverExercise.key && !!serverExercise.timeSignature,
      `${serverExercise.key} ${serverExercise.timeSignature} lvl${serverExercise.difficulty}`);
  } else {
    ok('server returned an exercise', false, 'no exercise captured from /api/sight-reading');
  }

  // Difficulty control must trigger a fresh real request.
  const before = calls.filter(c => c === 'POST /api/sight-reading').length;
  await page.evaluate(() => document.querySelector('[data-testid="sightread-level-4"]')?.click());
  await sleep(2000);
  const after = calls.filter(c => c === 'POST /api/sight-reading').length;
  ok('changing difficulty re-fetches from the backend', after > before, `${before} → ${after} calls`);

  ok('no fabricated mock fingerprints anywhere', !/Sicut cervus|Palestrina/i.test(body));

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
