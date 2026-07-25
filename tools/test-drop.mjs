// tools/test-drop.mjs — verifies drag-and-drop upload of a real .musicxml file,
// including the bug fix: a file dropped ANYWHERE (not just on #uploadZone) must
// be picked up AND must NOT open in the browser (default prevented).
// Requires a running server (default http://localhost:3300/classic/) + Chrome.
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'fs';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE_URL = process.env.PAGE_URL || 'http://localhost:3300/classic/';
const xml = readFileSync(new URL('../test-data/ave-maria-soprano.musicxml', import.meta.url), 'utf8');

let pass = 0, fail = 0;
const ok = (n, c, d='') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  const errors = [];
  const IGNORE = /GSI_LOGGER|given origin is not allowed|accounts\.google|Failed to load resource|net::ERR|gstatic/i;
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push(m.text()); });

  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction('typeof handleFile === "function"', { timeout: 15000 });
  ok('page loaded, handleFile present', true);

  // helper: dispatch a real drop event carrying a File, on a chosen target
  const doDrop = (selector) => page.evaluate((sel, content) => {
    const file = new File([content], 'ave-maria-soprano.musicxml', { type: '' });
    const dt = new DataTransfer(); dt.items.add(file);
    const target = sel === 'window' ? document.body : document.querySelector(sel);
    const ev = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
    target.dispatchEvent(ev);
    // "Parse MusicXML" button text is set ONLY by the .musicxml branch of
    // handleFile — an observable proof the dropped file was picked up as
    // MusicXML (musicxmlFile is a module-scoped var, not on window).
    return {
      defaultPrevented: ev.defaultPrevented,
      analyzeDisabled: document.getElementById('analyzeBtn').disabled,
      analyzeText: document.getElementById('analyzeBtn').textContent.trim(),
      uploadTitle: document.querySelector('#uploadZone .upload-title').textContent.trim(),
      uploadSub: document.querySelector('#uploadZone .upload-sub').textContent.trim(),
    };
  }, selector, xml);

  const reset = () => page.evaluate(() => {
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('analyzeBtn').textContent = 'Analyze Sheet Music';
    document.querySelector('#uploadZone .upload-title').textContent = 'Drop your sheet music here';
  });

  // 1) DROP OUTSIDE the zone (on body) — the reported bug
  await reset();
  const outside = await doDrop('window');
  ok('drop OUTSIDE zone: default prevented (no new-tab open)', outside.defaultPrevented === true);
  ok('drop OUTSIDE zone: picked up as MusicXML (btn "Parse MusicXML")', /Parse MusicXML/i.test(outside.analyzeText) && outside.analyzeDisabled === false, outside.analyzeText);
  ok('drop OUTSIDE zone: upload UI reflects MusicXML file', /ave-maria/i.test(outside.uploadTitle) && /MusicXML ready/i.test(outside.uploadSub), outside.uploadTitle);

  // 2) DROP ON the zone — still works, single handling
  await reset();
  const onzone = await doDrop('#uploadZone');
  ok('drop ON zone: default prevented', onzone.defaultPrevented === true);
  ok('drop ON zone: picked up as MusicXML', /Parse MusicXML/i.test(onzone.analyzeText));

  // 3) dragover shows the overlay + is cancelable (prevents browser open mid-drag)
  const dragover = await page.evaluate(() => {
    const dt = new DataTransfer();
    // types must include Files for our guard
    Object.defineProperty(dt, 'types', { value: ['Files'] });
    const ev = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt });
    window.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
    window.dispatchEvent(ev);
    return { defaultPrevented: ev.defaultPrevented, overlayShown: document.getElementById('globalDropOverlay').classList.contains('show') };
  });
  ok('dragover with files: default prevented', dragover.defaultPrevented === true);
  ok('dragover with files: drop overlay shown', dragover.overlayShown === true);

  // 4) accept attribute includes MusicXML types
  const accept = await page.evaluate(() => document.getElementById('fileInput').getAttribute('accept'));
  ok('file input accepts .musicxml/.mxl/.xml', /\.musicxml/.test(accept) && /\.mxl/.test(accept) && /\.xml/.test(accept), accept);

  // 5) end-to-end: drop outside, then click Analyze → the REAL module-scoped
  //    musicxmlFile flows through handleMusicXML → parse → render → player bar.
  await reset();
  await doDrop('window');
  await page.evaluate(() => document.getElementById('analyzeBtn').click());
  let e2eOk = false, e2eDetail = '';
  try {
    await page.waitForSelector('#solfegeOutput #spBar', { timeout: 25000 });
    e2eOk = true;
    e2eDetail = await page.evaluate(() => {
      const meas = document.querySelectorAll('#solfegeOutput .sp-measure').length;
      return `player mounted, ${meas} measures`;
    });
  } catch (e) { e2eDetail = 'no player bar appeared: ' + e.message.slice(0,50); }
  ok('dropped file → Analyze → parses & mounts player (true end-to-end)', e2eOk, e2eDetail);

  ok('no runtime errors', errors.length === 0, errors.slice(0,3).join(' | '));
  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally { await browser.close(); }
process.exit(fail === 0 ? 0 : 1);
