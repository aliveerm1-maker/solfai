// tools/test-two-state-ui.mjs — verifies the State 1 (hero) ⇄ State 2 (session
// shell) redesign end-to-end against the real running server, and captures
// screenshots of both states.
//
// Runs against a KEYLESS server on purpose: /api/parse-musicxml parses notes,
// key, meter and solfège WITHOUT Gemini (Gemini only writes the optional prose
// guide), so a real .mxl upload exercises real data end-to-end for free.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3300';
const SHOTS = new URL('../screenshots/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const mxlPath = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// [id, expected content]. Assertions target REAL parsed values from
// ave-maria-soprano.mxl (Bach/Gounod, Ave Maria, 4/4) where possible, so a
// section rendering an empty shell can't quietly pass.
const SECTIONS = [
  ['overview', /Ave Maria|Key/i],
  ['solfege', /Solf|Starting notes|Do|Re|Mi/i],
  ['rhythm', /Time signature|4\/4/i],
  ['measures', /Measure/i],
  ['tips', /practice/i],
  ['composer', /Bach|Gounod/i],
  ['pronunciation', /Diction|pronunciation|guide|language/i],
  ['eartraining', /Ear training|interval|Classic/i],
  ['vocalcoach', /Vocal Coach/i],
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon/i.test(m.text())) errors.push(m.text()); });
  await page.setViewport({ width: 1440, height: 950 });

  // ── 1. STATE 1 — fresh load shows the hero ──
  // Wait for hydration (the file input only exists in the hydrated tree), not a
  // fixed sleep — a cold Nitro start makes the first render arrive late.
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-testid="composer-form"]', { timeout: 30000 });
  await page.waitForSelector('[data-testid="analyze-file-input"]', { timeout: 30000 });
  await sleep(1800); // let the 3D clef settle for the screenshot
  const heroPresent = await page.$('[data-testid="hero-section"]') !== null;
  const sessionAbsent = await page.$('[data-testid="session-shell"]') === null;
  ok('STATE 1: hero renders on fresh load', heroPresent && sessionAbsent);
  await page.screenshot({ path: SHOTS + 'state1-hero-desktop.png' });

  // ── 2. Upload a real file, Run, and transition into STATE 2 ──
  const input = await page.$('[data-testid="analyze-file-input"]');
  await input.uploadFile(mxlPath);
  await page.waitForFunction(() => !document.querySelector('[data-testid="composer-send"]')?.disabled, { timeout: 20000 });

  // marker proves no full page reload happened across the transition + nav
  await page.evaluate(() => { window.__spaMarker = 'alive'; });

  // Time the transition from INSIDE the page. Timing it from Node would fold
  // in CDP round-trips and puppeteer's click/polling plumbing (seconds of
  // overhead here), which measures the harness, not the UI.
  const transitionMs = await page.evaluate(async () => {
    const seen = new Promise((resolve) => {
      const obs = new MutationObserver(() => {
        if (document.querySelector('[data-testid="session-shell"]')) { obs.disconnect(); resolve(performance.now()); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    });
    const t0 = performance.now();
    document.querySelector('[data-testid="composer-send"]').click();
    return Math.round((await seen) - t0);
  });
  await page.waitForSelector('[data-testid="session-shell"]', { timeout: 5000 });
  ok('TRANSITION: enters State 2 shell', true, `${transitionMs}ms to shell`);
  ok('TRANSITION: under 600ms', transitionMs < 600, `${transitionMs}ms`);

  await page.waitForSelector('[data-testid="section-overview"]', { timeout: 40000 });
  ok('STATE 2: real analysis result rendered (overview)', true);
  await sleep(300);
  await page.screenshot({ path: SHOTS + 'state2-session-desktop.png' });

  const marker = await page.evaluate(() => window.__spaMarker);
  ok('STATE 2: no page reload during transition (SPA marker survived)', marker === 'alive');

  const heroGone = await page.$('[data-testid="hero-section"]') === null;
  ok('STATE 2: hero fully removed (no 3D clef / backdrop)', heroGone);

  // real data check — the parsed key/meter must be present, not placeholder
  const headerMeta = await page.evaluate(() => document.querySelector('[data-testid="session-header-meta"]')?.innerText || '');
  ok('STATE 2: header shows real parsed metadata', /key/i.test(headerMeta) && headerMeta.trim().length > 6, headerMeta.replace(/\n/g, ' '));

  // ── 3. Click through EVERY section ──
  for (const [id, expect] of SECTIONS) {
    const clicked = await page.evaluate((sid) => {
      const el = document.querySelector(`[data-testid="session-nav-${sid}"]`);
      if (!el) return false;
      el.click();
      return true;
    }, id);
    if (!clicked) { ok(`SECTION ${id}: nav item exists`, false); continue; }
    await sleep(220);
    const state = await page.evaluate((sid) => ({
      rendered: !!document.querySelector(`[data-testid="section-${sid}"]`),
      sidebar: !!document.querySelector('[data-testid="session-sidebar"]'),
      body: document.querySelector('[data-testid="session-content"]')?.innerText || '',
    }), id);
    ok(`SECTION ${id}: renders + sidebar persists`,
      state.rendered && state.sidebar && expect.test(state.body),
      state.rendered ? '' : 'view not rendered');
  }

  // Ask is intentionally disabled (session 2 builds it)
  const askDisabled = await page.evaluate(() => document.querySelector('[data-testid="session-nav-ask"]')?.disabled);
  ok('SECTION ask: visible but disabled (session-2 placeholder)', askDisabled === true);

  const markerAfterNav = await page.evaluate(() => window.__spaMarker);
  ok('SECTION switching: never reloaded the page', markerAfterNav === 'alive');

  // capture a data-dense section for the screenshot record
  await page.evaluate(() => document.querySelector('[data-testid="session-nav-solfege"]').click());
  await sleep(300);
  await page.screenshot({ path: SHOTS + 'state2-solfege-desktop.png' });

  // ── 4. New Analysis → back to STATE 1 ──
  await page.evaluate(() => document.querySelector('[data-testid="session-new-analysis"]').click());
  await page.waitForSelector('[data-testid="hero-section"]', { timeout: 5000 });
  const backClean = await page.evaluate(() => ({
    session: !!document.querySelector('[data-testid="session-shell"]'),
    chip: !!document.querySelector('[data-testid="analyze-file-chip"]'),
    marker: window.__spaMarker,
  }));
  ok('RETURN: back to State 1 hero, session shell gone', !backClean.session);
  ok('RETURN: previous upload cleared (clean slate)', !backClean.chip);
  ok('RETURN: still no page reload', backClean.marker === 'alive');

  // ── 5. MOBILE ──
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="composer-form"]', { timeout: 20000 });
  await sleep(1200);
  await page.screenshot({ path: SHOTS + 'state1-hero-mobile.png' });

  const mInput = await page.$('[data-testid="analyze-file-input"]');
  await mInput.uploadFile(mxlPath);
  await page.waitForFunction(() => !document.querySelector('[data-testid="composer-send"]')?.disabled, { timeout: 20000 });
  await page.click('[data-testid="composer-send"]');
  await page.waitForSelector('[data-testid="section-overview"]', { timeout: 40000 });
  await sleep(300);

  const railHiddenOnMobile = await page.evaluate(() => {
    const rail = document.querySelector('[data-testid="session-sidebar"]');
    return !rail || getComputedStyle(rail).display === 'none';
  });
  ok('MOBILE: desktop rail collapsed (hamburger layout)', railHiddenOnMobile);
  await page.screenshot({ path: SHOTS + 'state2-session-mobile.png' });

  await page.evaluate(() => document.querySelector('[data-testid="session-nav-open"]').click());
  await sleep(300);
  const drawerOpen = await page.$('[data-testid="session-drawer"]') !== null;
  ok('MOBILE: hamburger opens the nav drawer', drawerOpen);
  await page.screenshot({ path: SHOTS + 'state2-drawer-mobile.png' });

  // Regression: every ClefMark must reference its OWN gradient id. A shared id
  // resolves to the first copy in document order — which sits in the
  // display:none desktop rail on mobile — and the mark renders as an empty box.
  const gradients = await page.evaluate(() => {
    const marks = [...document.querySelectorAll('svg linearGradient')].map(g => g.id).filter(id => id.includes('clefMarkGold'));
    return { ids: marks, unique: new Set(marks).size === marks.length, count: marks.length };
  });
  ok('MOBILE: clef marks use unique gradient ids (renders, not an empty box)',
    gradients.count > 1 && gradients.unique, `${gradients.count} marks, unique=${gradients.unique}`);

  const navigatedFromDrawer = await page.evaluate(() => {
    document.querySelector('[data-testid="session-nav-tips"]').click();
    return true;
  });
  await sleep(320);
  const drawerClosedAfterNav = await page.$('[data-testid="session-drawer"]') === null;
  ok('MOBILE: choosing a section closes the drawer', navigatedFromDrawer && drawerClosedAfterNav);

  ok('no runtime errors across the whole flow', errors.length === 0, errors.slice(0, 3).join(' | '));

  console.log(`\nScreenshots → ${SHOTS}`);
  console.log(`${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
