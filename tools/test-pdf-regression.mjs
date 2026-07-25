// tools/test-pdf-regression.mjs — quick regression check that PDF upload via
// the file input (not drag-drop) still works after the drop-handler changes.
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGE_URL = process.env.PAGE_URL || 'http://localhost:3300/classic/';

let pass = 0, fail = 0;
const ok = (n, c, d='') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction('typeof handleFile === "function"', { timeout: 15000 });

  const input = await page.$('#fileInput');
  await input.uploadFile(new URL('../test-data/pdfs/abendlied.pdf', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  await page.waitForFunction(
    () => !document.getElementById('analyzeBtn').disabled && /ready/i.test(document.querySelector('#uploadZone .upload-sub').textContent),
    { timeout: 20000 }
  );
  const sub = await page.evaluate(() => document.querySelector('#uploadZone .upload-sub').textContent.trim());
  ok('PDF via file input still processes (regression check)', /ready/i.test(sub), sub);

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally { await browser.close(); }
process.exit(fail === 0 ? 0 : 1);
