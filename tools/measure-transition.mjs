// tools/measure-transition.mjs — measures the State1→State2 transition from
// INSIDE the page with a MutationObserver, so the number isn't inflated by
// puppeteer's polling round-trips. Also reports how much of any delay is
// main-thread stall (headless software WebGL rendering the 3D hero clef)
// vs. the transition itself.
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3300';
const mxlPath = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const args = ['--no-sandbox'];
if (process.env.GPU === 'off') args.push('--disable-gpu');

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForSelector('[data-testid="composer-form"]', { timeout: 20000 });

const input = await page.$('[data-testid="analyze-file-input"]');
await input.uploadFile(mxlPath);
await page.waitForFunction(() => {
  const b = document.querySelector('[data-testid="composer-send"]');
  return !!b && !b.disabled;   // must EXIST and be enabled
}, { timeout: 20000 });
// WARMUP=0 clicks Run the instant the composer is ready — i.e. while the 3D
// hero clef may still be doing its expensive first-frame WebGL setup.
const warmup = process.env.WARMUP === '0' ? 0 : 1500;
if (warmup) await sleep(warmup);

// Arm an in-page observer, then click. Records the exact ms from the click
// event to the session shell existing in the DOM. Also samples main-thread
// responsiveness (rAF gaps) during the transition to expose stalls.
const result = await page.evaluate(async () => {
  const gaps = [];
  let last = performance.now();
  let sampling = true;
  const sample = () => {
    const now = performance.now();
    gaps.push(now - last);
    last = now;
    if (sampling) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);

  const done = new Promise((resolve) => {
    const obs = new MutationObserver(() => {
      if (document.querySelector('[data-testid="session-shell"]')) {
        obs.disconnect();
        resolve(performance.now());
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });

  const t0 = performance.now();
  document.querySelector('[data-testid="composer-send"]').click();
  const t1 = await done;
  sampling = false;

  return {
    transitionMs: Math.round(t1 - t0),
    maxFrameGapMs: Math.round(Math.max(...gaps)),
    medianFrameGapMs: Math.round(gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] || 0),
  };
});

console.log(`GPU: ${process.env.GPU === 'off' ? 'disabled (software)' : 'enabled'}`);
console.log(`transition click → session shell in DOM : ${result.transitionMs}ms`);
console.log(`worst main-thread frame gap during it   : ${result.maxFrameGapMs}ms`);
console.log(`median frame gap                        : ${result.medianFrameGapMs}ms`);
console.log(result.transitionMs < 600 ? '\nPASS: under 600ms' : '\nOVER 600ms — investigate');
await browser.close();
process.exit(result.transitionMs < 600 ? 0 : 1);
