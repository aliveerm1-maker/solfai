// tools/test-root-musicxml-e2e.mjs — true end-to-end on the root domain UI:
// native drop of a .mxl file -> click Run -> real POST /api/parse-musicxml ->
// real result rendered. Also regression-checks that image/PDF Analyze still
// works on the same page after these changes.
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE_URL = process.env.PAGE_URL || 'http://localhost:3300/';
const mxlPath = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const pdfPath = new URL('../test-data/pdfs/abendlied.pdf', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  await page.setViewport({ width: 1280, height: 1000 });
  const reqs = [];
  page.on('request', r => { if (r.url().includes('/api/')) reqs.push(r.method() + ' ' + new URL(r.url()).pathname); });

  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-testid="composer-form"]', { timeout: 20000 });

  // native drop the .mxl at the composer
  await client.send('Input.dispatchDragEvent', { type: 'dragEnter', x: 640, y: 400, data: { items: [{ mimeType: 'text/plain', data: '' }], files: [mxlPath], dragOperationsMask: 1 } });
  await client.send('Input.dispatchDragEvent', { type: 'dragOver', x: 640, y: 400, data: { items: [{ mimeType: 'text/plain', data: '' }], files: [mxlPath], dragOperationsMask: 1 } });
  await client.send('Input.dispatchDragEvent', { type: 'drop', x: 640, y: 400, data: { items: [{ mimeType: 'text/plain', data: '' }], files: [mxlPath], dragOperationsMask: 1 } });
  await new Promise(r => setTimeout(r, 500));

  await page.click('[data-testid="composer-send"]');
  let e2eOk = false, e2eDetail = '';
  try {
    await page.waitForSelector('[data-testid="analyze-result-title"]', { timeout: 30000 });
    e2eOk = true;
    e2eDetail = await page.evaluate(() => document.querySelector('[data-testid="analyze-stat-grid"]')?.textContent || '');
  } catch (e) { e2eDetail = 'no result rendered: ' + e.message.slice(0, 80); }
  ok('.mxl dropped -> Run -> real result renders (Key/Meter/Tempo grid)', e2eOk, e2eDetail);
  ok('real POST /api/parse-musicxml fired', reqs.includes('POST /api/parse-musicxml'), reqs.join(','));

  // regression: fresh page, PDF via file input, Run -> /api/analyze still works
  const page2 = await browser.newPage();
  page2.on('pageerror', e => console.log('[pageerror]', String(e)));
  page2.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
  page2.on('request', r => { if (r.url().includes('/api/')) reqs.push(r.method() + ' ' + new URL(r.url()).pathname); });
  await page2.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page2.waitForSelector('[data-testid="composer-form"]', { timeout: 20000 });
  reqs.length = 0;
  const input = await page2.$('[data-testid="analyze-file-input"]');
  await input.uploadFile(pdfPath);
  let ready = true;
  try {
    await page2.waitForFunction(() => document.querySelector('[data-testid="composer-send"]') && !document.querySelector('[data-testid="composer-send"]').disabled, { timeout: 40000 });
  } catch (e) { ready = false; }
  ok('PDF via file input becomes ready to run', ready, ready ? '' : await page2.evaluate(() => document.body.innerText.slice(0, 200)));
  if (ready) await page2.click('[data-testid="composer-send"]');
  let pdfOk = false;
  try {
    await page2.waitForSelector('[data-testid="analyze-result-title"]', { timeout: 60000 });
    pdfOk = true;
  } catch (e) { /* keyless server -> Gemini call fails; that's expected without a key */ }
  const errShown = await page2.evaluate(() => document.body.innerText);
  ok('PDF via file input still triggers real /api/analyze (regression)', reqs.includes('POST /api/analyze'), reqs.join(','));
  ok('PDF path result or honest error shown (no silent failure)', pdfOk || /fail|error|configured/i.test(errShown));

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
