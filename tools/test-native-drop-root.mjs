// tools/test-native-drop-root.mjs — same trusted, CDP-level drag simulation
// as test-native-drop.mjs, but against the ROOT domain's real live frontend
// (glass-clef-craft, served via gcc-frontend), which is what real users
// actually land on. Verifies MusicXML/.mxl drag-drop now works there too.
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE_URL = process.env.PAGE_URL || 'http://localhost:3300/';
const xmlPath = new URL('../test-data/ave-maria-soprano.musicxml', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const mxlPath = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-testid="composer-form"]', { timeout: 20000 });
  ok('root page loads (gcc-frontend live)', true);

  const dropAt = async (filePath, label, x, y) => {
    const before = browser.targets().length;
    await client.send('Input.dispatchDragEvent', { type: 'dragEnter', x, y, data: { items: [{ mimeType: 'text/plain', data: '' }], files: [filePath], dragOperationsMask: 1 } });
    await new Promise(r => setTimeout(r, 100));
    await client.send('Input.dispatchDragEvent', { type: 'dragOver', x, y, data: { items: [{ mimeType: 'text/plain', data: '' }], files: [filePath], dragOperationsMask: 1 } });
    await new Promise(r => setTimeout(r, 100));
    await client.send('Input.dispatchDragEvent', { type: 'drop', x, y, data: { items: [{ mimeType: 'text/plain', data: '' }], files: [filePath], dragOperationsMask: 1 } });
    await new Promise(r => setTimeout(r, 800));

    const after = browser.targets().length;
    ok(`${label}: no new tab/window opened`, after === before, `targets before=${before} after=${after}`);

    const state = await page.evaluate(() => ({
      url: location.href,
      fileChipText: document.querySelector('[data-testid="analyze-file-chip"]')?.textContent || null,
      runDisabled: document.querySelector('[data-testid="composer-send"]')?.disabled,
    }));
    ok(`${label}: page did not navigate away`, state.url === PAGE_URL || state.url === PAGE_URL.replace(/\/$/, '') , state.url);
    ok(`${label}: picked up as a real upload (file chip shown, Run enabled)`, !!state.fileChipText && state.runDisabled === false, JSON.stringify(state));
  };

  // drop OUTSIDE the composer entirely — near the top of the page, over the hero
  await dropAt(xmlPath, 'ROOT native drop .musicxml (outside composer)', 640, 60);

  // reset upload between drops
  await page.evaluate(() => { document.querySelector('[data-testid="analyze-file-remove"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await new Promise(r => setTimeout(r, 300));

  await dropAt(mxlPath, 'ROOT native drop .mxl (outside composer)', 640, 60);

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
