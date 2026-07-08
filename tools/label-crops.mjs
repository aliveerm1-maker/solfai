// tools/label-crops.mjs — generate small top-strip crops of page 1 of each test
// PDF so ground-truth key/time signatures can be verified by eye cheaply.
// Uses pdf.js's own canvasFactory for ALL canvases (mixing external canvas
// packages with pdf.js v4 internals fails with class-identity type errors).
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pdfOpenOpts } from './rasterize.mjs';

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const PDF_DIR = 'test-data/pdfs';
const OUT = 'tools/label-crops';
mkdirSync(OUT, { recursive: true });

// Which page to crop per file (0-based); default 0. Override for cover pages:
//   PAGE_PICK='{"locus-iste.pdf":1}' node tools/label-crops.mjs
const PAGE_PICK = JSON.parse(process.env.PAGE_PICK || '{}');

for (const f of readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'))) {
  try {
    const doc = await pdfjs.getDocument(pdfOpenOpts(new Uint8Array(readFileSync(join(PDF_DIR, f))))).promise;
    const cf = doc.canvasFactory;
    const pick = Math.min(PAGE_PICK[f] ?? 0, doc.numPages - 1);
    const page = await doc.getPage(pick + 1);
    const vp = page.getViewport({ scale: 3.0 });
    const full = cf.create(Math.ceil(vp.width), Math.ceil(vp.height));
    full.context.fillStyle = '#fff';
    full.context.fillRect(0, 0, full.canvas.width, full.canvas.height);
    await page.render({ canvasContext: full.context, viewport: vp }).promise;

    const cw = Math.floor(full.canvas.width * 0.72), ch = Math.floor(full.canvas.height * 0.42);
    const outW = 1100, outH = Math.floor(outW * ch / cw);
    const out2 = cf.create(outW, outH);
    out2.context.drawImage(full.canvas, 0, 0, cw, ch, 0, 0, outW, outH);
    const outPath = join(OUT, f.replace('.pdf', '.jpg'));
    writeFileSync(outPath, out2.canvas.toBuffer('image/jpeg', 0.85));
    console.log(`${f}: totalPages=${doc.numPages} pick=${pick} -> ${outPath}`);
    await doc.destroy();
  } catch (e) {
    console.log(`${f}: FAILED ${e.message.slice(0, 100)}`);
  }
}
