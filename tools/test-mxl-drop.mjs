// tools/test-mxl-drop.mjs — verifies dropping a real .mxl (compressed
// MusicXML) file end-to-end: drop is caught, uploaded as .mxl, server unzips
// it in memory and parses the inner score, player mounts.
// Requires a running server (default http://localhost:3300/classic/) + Chrome.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE_URL = process.env.PAGE_URL || 'http://localhost:3300/classic/';
const mxl = readFileSync(new URL('../test-data/ave-maria-soprano.mxl', import.meta.url));

let pass = 0, fail = 0;
const ok = (n, c, d='') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  const errors = [];
  const IGNORE = /GSI_LOGGER|given origin is not allowed|accounts\.google|Failed to load resource|net::ERR|gstatic/i;
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push(m.text()); });
  const reqs = [];
  page.on('request', r => { if (r.url().includes('/api/parse-musicxml')) reqs.push(r.method()); });

  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction('typeof handleFile === "function"', { timeout: 15000 });
  ok('page loaded, handleFile present', true);

  // dispatch a real 'drop' DragEvent carrying the binary .mxl (zip) as a File,
  // outside the upload zone — the originally-reported bug path.
  const bytesArray = Array.from(mxl);
  const result = await page.evaluate((bytes) => {
    const file = new File([new Uint8Array(bytes)], 'ave-maria-soprano.mxl', { type: 'application/vnd.recordare.musicxml' });
    const dt = new DataTransfer(); dt.items.add(file);
    const ev = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
    document.body.dispatchEvent(ev);
    return {
      defaultPrevented: ev.defaultPrevented,
      analyzeDisabled: document.getElementById('analyzeBtn').disabled,
      analyzeText: document.getElementById('analyzeBtn').textContent.trim(),
      uploadTitle: document.querySelector('#uploadZone .upload-title').textContent.trim(),
      uploadSub: document.querySelector('#uploadZone .upload-sub').textContent.trim(),
    };
  }, bytesArray);

  ok('drop .mxl OUTSIDE zone: default prevented (no new-tab open)', result.defaultPrevented === true);
  ok('drop .mxl OUTSIDE zone: picked up as MusicXML (btn "Parse MusicXML")', /Parse MusicXML/i.test(result.analyzeText) && result.analyzeDisabled === false, result.analyzeText);
  ok('drop .mxl OUTSIDE zone: upload UI reflects the file', /ave-maria/i.test(result.uploadTitle) && /MusicXML ready/i.test(result.uploadSub), result.uploadTitle);

  // click Analyze -> real POST of the .mxl to /api/parse-musicxml -> server
  // unzips in memory, finds the inner score, parses it, player mounts.
  await page.evaluate(() => document.getElementById('analyzeBtn').click());
  let e2eOk = false, e2eDetail = '';
  try {
    await page.waitForSelector('#solfegeOutput #spBar', { timeout: 25000 });
    e2eOk = true;
    e2eDetail = await page.evaluate(() => {
      const meas = document.querySelectorAll('#solfegeOutput .sp-measure').length;
      return `player mounted, ${meas} measures`;
    });
  } catch (e) { e2eDetail = 'no player bar appeared: ' + e.message.slice(0, 80); }
  ok('.mxl uploaded → server unzips + parses → player mounts (true end-to-end)', e2eOk, e2eDetail);
  ok('real POST /api/parse-musicxml fired', reqs.includes('POST'), reqs.join(','));

  ok('no runtime errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally { await browser.close(); }
process.exit(fail === 0 ? 0 : 1);
