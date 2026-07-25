// tools/test-native-drop.mjs — simulates a REAL, OS-level, trusted file drag
// via the Chrome DevTools Protocol (Input.dispatchDragEvent with `files`),
// NOT a synthetic page-JS DragEvent. This matters because JS-constructed
// events dispatched via element.dispatchEvent() are untrusted (isTrusted:
// false) and Chromium never runs its native "open dropped file" default
// action for untrusted events — so a test built that way can pass 100% of
// the time even if the real native default action would still fire for an
// actual user dragging a file from Explorer. This test drives the actual
// browser drag pipeline the same way a real user's drop does.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE_URL = process.env.PAGE_URL || 'http://localhost:3300/classic/';
const xmlPath = new URL('../test-data/ave-maria-soprano.musicxml', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const mxlPath = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
});

// track any new tab/page the browser opens (the exact reported bug: file opens in a new tab)
const newTargets = [];
browser.on('targetcreated', (t) => newTargets.push(t));

try {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  await page.goto(PAGE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForFunction('typeof handleFile === "function"', { timeout: 15000 });

  // native drag+drop test, at a point OUTSIDE #uploadZone — e.g. over the top nav / hero area
  const dropAt = async (filePath, label) => {
    newTargets.length = 0;
    const vp = page.viewport();
    const x = Math.floor(vp.width / 2);
    const y = 40; // near the very top of the page — outside the upload zone, over nav/hero
    const before = browser.targets().length;

    await client.send('Input.dispatchDragEvent', {
      type: 'dragEnter', x, y,
      data: { items: [{ mimeType: 'text/plain', data: '' }], files: [filePath], dragOperationsMask: 1 },
    });
    await new Promise(r => setTimeout(r, 100));
    await client.send('Input.dispatchDragEvent', {
      type: 'dragOver', x, y,
      data: { items: [{ mimeType: 'text/plain', data: '' }], files: [filePath], dragOperationsMask: 1 },
    });
    await new Promise(r => setTimeout(r, 100));
    await client.send('Input.dispatchDragEvent', {
      type: 'drop', x, y,
      data: { items: [{ mimeType: 'text/plain', data: '' }], files: [filePath], dragOperationsMask: 1 },
    });
    await new Promise(r => setTimeout(r, 800));

    const afterTargetCount = browser.targets().length;
    ok(`${label}: no new tab/window opened`, afterTargetCount === before, `targets before=${before} after=${afterTargetCount}`);

    const state = await page.evaluate(() => ({
      analyzeText: document.getElementById('analyzeBtn')?.textContent.trim(),
      analyzeDisabled: document.getElementById('analyzeBtn')?.disabled,
      uploadTitle: document.querySelector('#uploadZone .upload-title')?.textContent.trim(),
      uploadSub: document.querySelector('#uploadZone .upload-sub')?.textContent.trim(),
      url: location.href,
    }));
    ok(`${label}: page did not navigate away`, state.url.includes('/classic'), state.url);
    ok(`${label}: picked up by handleFile (Parse MusicXML button)`, /Parse MusicXML/i.test(state.analyzeText || '') && state.analyzeDisabled === false, JSON.stringify(state));

    // reset for next drop
    await page.evaluate(() => {
      document.getElementById('analyzeBtn').disabled = true;
      document.getElementById('analyzeBtn').textContent = 'Analyze Sheet Music';
      document.querySelector('#uploadZone .upload-title').textContent = 'Drop your sheet music here';
    });
  };

  await dropAt(xmlPath, 'NATIVE drop .musicxml (outside zone, near top nav)');
  await dropAt(mxlPath, 'NATIVE drop .mxl (outside zone, near top nav)');

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
