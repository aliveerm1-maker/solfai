// tools/test-shell-ui.mjs — verifies the single-persistent-shell architecture.
//
// BUG 1 guard: the sidebar/header/layout DOM NODES must survive the upload →
// results transition. Node identity is the ground truth — a selector match
// only proves *a* sidebar exists, not that it's the same one. If someone
// reintroduces a second shell component, these assertions fail.
//
// BUG 2 guard: no "/classic" link or "Classic Studio" string may appear
// anywhere in the rendered app, in any content state.
//
// Runs keyless on purpose: /api/parse-musicxml and /api/sight-reading are both
// pure server-side JS, so a real .mxl upload and a real generated exercise
// exercise the true paths without an API key.
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3300';
const SHOTS = new URL('../screenshots/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const mxlPath = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? '✓' : '✗ FAIL'} ${n}${d ? ' — ' + d : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const SECTIONS = [
  ['overview', /Ave Maria|Key/i],
  ['solfege', /Solf|Starting notes|Do|Re|Mi/i],
  ['rhythm', /Time signature|4\/4/i],
  ['measures', /Measure/i],
  ['tips', /practice/i],
  ['composer', /Bach|Gounod/i],
  ['pronunciation', /Diction|pronunciation|guide|language/i],
  ['eartraining', /in progress|ear training/i],
  ['vocalcoach', /Vocal Coach/i],
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|favicon|CORS|ERR_FAILED|githack|hdr/i.test(m.text())) errors.push(m.text()); });
  const apiCalls = [];
  page.on('request', r => { if (r.url().includes('/api/')) apiCalls.push(r.method() + ' ' + new URL(r.url()).pathname); });
  let navigations = 0, loads = 0;
  page.on('framenavigated', f => { if (f === page.mainFrame()) navigations++; });
  page.on('load', () => loads++);
  await page.setViewport({ width: 1440, height: 950 });

  const noClassic = async (where) => {
    const hits = await page.evaluate(() => {
      const txt = document.body.innerText;
      const hrefs = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
      return {
        text: /classic studio/i.test(txt),
        href: hrefs.some(h => h && h.includes('/classic')),
      };
    });
    ok(`${where}: no "Classic Studio" text, no /classic link`, !hits.text && !hits.href,
      hits.text ? 'text found' : hits.href ? 'href found' : '');
  };

  // ── 1. Fresh load ──
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-testid="analyze-file-input"]', { timeout: 30000 });
  await sleep(1600);
  ok('LOAD: hero + persistent sidebar render', await page.$('[data-testid="hero-section"]') !== null && await page.$('[data-testid="sidebar"]') !== null);
  await noClassic('hero');
  await page.screenshot({ path: SHOTS + 'shell-1-hero.png' });

  // ── 2. Upload, tag the shell nodes, Run ──
  const input = await page.$('[data-testid="analyze-file-input"]');
  await input.uploadFile(mxlPath);
  await page.waitForFunction(() => { const b = document.querySelector('[data-testid="composer-send"]'); return !!b && !b.disabled; }, { timeout: 20000 });

  await page.evaluate(() => {
    window.__spa = 'alive';
    window.__nodes = {
      sidebar: document.querySelector('[data-testid="sidebar"]'),
      layout: document.querySelector('[data-testid="app-layout"]'),
      main: document.querySelector('[data-testid="main-content"]'),
    };
  });
  const navBefore = navigations, loadBefore = loads;

  const transitionMs = await page.evaluate(async () => {
    const seen = new Promise(res => {
      const obs = new MutationObserver(() => {
        if (document.querySelector('[data-testid="session-nav"]')) { obs.disconnect(); res(performance.now()); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    });
    const t0 = performance.now();
    document.querySelector('[data-testid="composer-send"]').click();
    return Math.round((await seen) - t0);
  });
  await page.waitForSelector('[data-testid="section-overview"]', { timeout: 40000 });
  await sleep(400);

  ok('TRANSITION: content swaps in under 600ms', transitionMs < 600, `${transitionMs}ms`);
  ok('TRANSITION: no router navigation', navigations - navBefore === 0);
  ok('TRANSITION: no full page load', loads - loadBefore === 0);

  // ── THE BUG 1 ASSERTIONS — node identity ──
  const survived = await page.evaluate(() => ({
    sidebar: document.contains(window.__nodes.sidebar),
    layout: document.contains(window.__nodes.layout),
    main: document.contains(window.__nodes.main),
    sameSidebar: document.querySelector('[data-testid="sidebar"]') === window.__nodes.sidebar,
    spa: window.__spa,
  }));
  ok('BUG1: the SAME sidebar node survives (never unmounted)', survived.sidebar && survived.sameSidebar);
  ok('BUG1: the SAME app-layout node survives', survived.layout);
  ok('BUG1: the SAME main-content node survives', survived.main);
  ok('BUG1: no page reload (SPA marker intact)', survived.spa === 'alive');
  ok('BUG1: section list appears INSIDE the persistent sidebar',
    await page.evaluate(() => !!document.querySelector('[data-testid="sidebar"] [data-testid="session-nav"]')));
  ok('BUG1: Recents still visible during a session (nav never replaced)',
    await page.evaluate(() => !!document.querySelector('[data-testid="sidebar"] [data-testid="recents-empty"]')));

  await noClassic('results');
  await page.screenshot({ path: SHOTS + 'shell-2-results.png' });

  // ── 3. Every section, sidebar identity re-checked each time ──
  for (const [id, expect] of SECTIONS) {
    const clicked = await page.evaluate(sid => {
      const el = document.querySelector(`[data-testid="session-nav-${sid}"]`);
      if (!el) return false; el.click(); return true;
    }, id);
    if (!clicked) { ok(`SECTION ${id}: nav item exists`, false); continue; }
    await sleep(200);
    const st = await page.evaluate(sid => ({
      rendered: !!document.querySelector(`[data-testid="section-${sid}"]`),
      sameSidebar: document.querySelector('[data-testid="sidebar"]') === window.__nodes.sidebar,
      body: document.querySelector('[data-testid="session-content"]')?.innerText || '',
    }), id);
    ok(`SECTION ${id}: renders, same sidebar node`, st.rendered && st.sameSidebar && expect.test(st.body));
  }
  await noClassic('all sections');

  // in-progress state must be honest and link nowhere
  await page.evaluate(() => document.querySelector('[data-testid="session-nav-eartraining"]').click());
  await sleep(250);
  const ip = await page.evaluate(() => {
    const box = document.querySelector('[data-testid="section-in-progress"]');
    return { present: !!box, links: box ? box.querySelectorAll('a[href]').length : -1, text: box?.innerText || '' };
  });
  ok('BUG2: ear training shows honest in-progress panel', ip.present && /still in progress/i.test(ip.text));
  ok('BUG2: in-progress panel contains no links out', ip.links === 0);
  await page.screenshot({ path: SHOTS + 'shell-3-inprogress.png' });

  // ── 4. Sight-read — REAL generated exercise ──
  await page.evaluate(() => document.querySelector('[data-testid="session-new-analysis"]').click());
  await page.waitForSelector('[data-testid="hero-section"]', { timeout: 8000 });
  await sleep(400);
  ok('RETURN: back to hero, same sidebar node',
    await page.evaluate(() => document.querySelector('[data-testid="sidebar"]') === window.__nodes.sidebar));

  await page.evaluate(() => document.querySelector('[data-testid="sightread-link"]').click());
  await page.waitForSelector('[data-testid="sightread-panel"]', { timeout: 8000 });
  apiCalls.length = 0;
  await page.evaluate(() => document.querySelector('[data-testid="sr-generate"]').click());
  await page.waitForSelector('[data-testid="sr-exercise"]', { timeout: 15000 }).catch(() => {});
  await sleep(300);
  const sr = await page.evaluate(() => {
    const ex = document.querySelector('[data-testid="sr-exercise"]');
    return { present: !!ex, text: ex?.innerText || '' };
  });
  ok('SIGHT-READ: fires real POST /api/sight-reading', apiCalls.includes('POST /api/sight-reading'), apiCalls.join(','));
  ok('SIGHT-READ: renders a real generated exercise', sr.present && /Bar 1/i.test(sr.text));
  ok('SIGHT-READ: same sidebar node still alive',
    await page.evaluate(() => document.querySelector('[data-testid="sidebar"]') === window.__nodes.sidebar));
  await page.screenshot({ path: SHOTS + 'shell-4-sightread.png' });
  await noClassic('sight-read');

  // ── 5. Other routes must also be free of /classic ──
  for (const route of ['/library', '/practice', '/vocal-coach']) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 20000 });
    await sleep(500);
    await noClassic(`route ${route}`);
  }

  // ── 6. Mobile ──
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-testid="analyze-file-input"]', { timeout: 30000 });
  await sleep(1000);
  await page.evaluate(() => document.querySelector('[data-testid="mobile-nav-open"]').click());
  await sleep(300);
  ok('MOBILE: hamburger opens the nav drawer', await page.$('[data-testid="session-drawer"]') !== null);
  await page.screenshot({ path: SHOTS + 'shell-5-mobile-drawer.png' });

  ok('no runtime errors across the whole flow', errors.length === 0, errors.slice(0, 3).join(' | '));

  console.log(`\nScreenshots → ${SHOTS}`);
  console.log(`${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`);
} finally {
  await browser.close();
}
process.exit(fail === 0 ? 0 : 1);
