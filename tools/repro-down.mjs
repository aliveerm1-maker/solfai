import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox']});
const p = await b.newPage();
// serve the page from cache-less reload against a DEAD backend by intercepting
await p.setRequestInterception(true);
p.on('request', r => {
  if (r.url().includes('/api/')) return r.abort('connectionrefused');
  r.continue();
});
await p.goto('http://localhost:3300/', {waitUntil:'domcontentloaded', timeout:30000}).catch(()=>{});
await p.waitForSelector('[data-testid="composer-file-input"]', {timeout:30000});
await new Promise(r=>setTimeout(r,1200));
const i = await p.$('[data-testid="composer-file-input"]');
await i.uploadFile('C:/Users/857525/Documents/IMSLP02361.xml');
await new Promise(r=>setTimeout(r,6000));
const t = await p.evaluate(()=>document.body.innerText);
const m = t.match(/Failed to fetch|Load failed|NetworkError|error[^\n]*/i);
console.log('UI SHOWS:', m ? m[0] : '(no error found)');
await b.close();
