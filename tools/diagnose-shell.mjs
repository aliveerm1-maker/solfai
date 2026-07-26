// tools/diagnose-shell.mjs — READ-ONLY diagnostic for the "Run feels like a
// page load" report. Determines empirically whether the transition is:
//   (a) a router navigation, (b) a full page load, or
//   (c) a same-route swap of two different shell components (sidebar unmounts).
// Tags the live sidebar DOM node before clicking Run and checks afterwards
// whether that exact node survived — node identity is the ground truth for
// "did the sidebar unmount".
import puppeteer from 'puppeteer-core';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE || 'http://localhost:3300';
const mxl = new URL('../test-data/ave-maria-soprano.mxl', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950 });

let navigations = 0, loads = 0;
page.on('framenavigated', f => { if (f === page.mainFrame()) navigations++; });
page.on('load', () => loads++);

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForSelector('[data-testid="composer-file-input"]', { timeout: 30000 });
await sleep(1500);

const navBefore = navigations, loadBefore = loads;
const urlBefore = page.url();

// Tag the live shell nodes so we can detect unmount by identity, not by selector.
const before = await page.evaluate(() => {
  const sidebar = document.querySelector('[data-testid="sidebar"]');
  const layout = document.querySelector('[data-testid="app-layout"]');
  const topbar = document.querySelector('[data-testid="top-bar"]');
  if (sidebar) sidebar.__tag = 'SIDEBAR_ORIGINAL';
  if (layout) layout.__tag = 'LAYOUT_ORIGINAL';
  if (topbar) topbar.__tag = 'TOPBAR_ORIGINAL';
  window.__tagged = { sidebar, layout, topbar };
  return {
    sidebar: !!sidebar, layout: !!layout, topbar: !!topbar,
    sidebarText: sidebar?.innerText.replace(/\s+/g, ' ').slice(0, 90) || null,
  };
});

// Selecting a file auto-submits (handleFile -> runFlow), no Send click needed.
const input = await page.$('[data-testid="composer-file-input"]');
await input.uploadFile(mxl);
// results view = the overview section rendering inside the SAME shell
await page.waitForSelector('[data-testid="chat-message-assistant"]', { timeout: 60000 });
await sleep(600);

const after = await page.evaluate(() => {
  const t = window.__tagged;
  const nowSidebar = document.querySelector('[data-testid="sidebar"]');
  const nowSessionSidebar = document.querySelector("[data-testid=\"recents-list\"]");
  return {
    // did the ORIGINAL nodes survive in the document?
    originalSidebarStillInDom: !!t.sidebar && document.contains(t.sidebar),
    originalLayoutStillInDom: !!t.layout && document.contains(t.layout),
    originalTopbarStillInDom: !!t.topbar && document.contains(t.topbar),
    appLayoutSidebarExists: !!nowSidebar,
    sessionSidebarExists: !!nowSessionSidebar,
    sessionSidebarText: nowSessionSidebar?.innerText.replace(/\s+/g, ' ').slice(0, 90) || null,
    sameNode: !!nowSidebar && nowSidebar === t.sidebar,
  };
});

console.log('── BUG 1 DIAGNOSIS ──────────────────────────────────');
console.log(`URL before Run : ${urlBefore}`);
console.log(`URL after  Run : ${page.url()}`);
console.log(`URL changed              : ${urlBefore !== page.url() ? 'YES' : 'NO'}`);
console.log(`main-frame navigations   : ${navigations - navBefore}`);
console.log(`full page loads          : ${loads - loadBefore}`);
console.log('');
console.log('BEFORE Run:');
console.log(`  AppLayout sidebar present : ${before.sidebar}`);
console.log(`  sidebar contents          : ${before.sidebarText}`);
console.log('');
console.log('AFTER Run:');
console.log(`  ORIGINAL sidebar node still in DOM : ${after.originalSidebarStillInDom}`);
console.log(`  ORIGINAL app-layout still in DOM   : ${after.originalLayoutStillInDom}`);
console.log(`  ORIGINAL top-bar still in DOM      : ${after.originalTopbarStillInDom}`);
console.log(`  AppLayout sidebar exists at all    : ${after.appLayoutSidebarExists}`);
console.log(`  section list inside SAME sidebar  : ${after.sessionSidebarExists}`);
console.log(`  session sidebar contents           : ${after.sessionSidebarText}`);
console.log('');
const routeChange = (navigations - navBefore) > 0 || urlBefore !== page.url();
const hardLoad = (loads - loadBefore) > 0;
const shellSwap = !after.originalSidebarStillInDom;
console.log('VERDICT:');
console.log(`  (a) router navigation       : ${routeChange ? 'YES' : 'NO'}`);
console.log(`  (b) full page reload        : ${hardLoad ? 'YES' : 'NO'}`);
console.log(`  (c) shell swap / unmount    : ${shellSwap ? 'YES — sidebar is torn down and rebuilt' : 'NO'}`);
await browser.close();
