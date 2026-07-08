// tools/rasterize.mjs — Node-side PDF → JPEG page rasterizer.
// Mirrors the classic frontend exactly: pdf.js getViewport({ scale: 3.0 }),
// JPEG quality 0.92. Used by the accuracy harness (and, later, potentially by
// the server itself as a fallback for clients that send raw PDFs).
//
// IMPORTANT: all canvases come from doc.canvasFactory (pdf.js's own internal
// @napi-rs/canvas factory). Mixing external canvas packages with pdf.js v4
// internals fails with type errors (Path2D / canvas class identity).
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { basename, join } from 'path';
import { createRequire } from 'module';

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
const require = createRequire(import.meta.url);
const PDFJS_ROOT = join(require.resolve('pdfjs-dist/package.json'), '..');

export function pdfOpenOpts(data) {
  return {
    data,
    disableFontFace: true,   // render glyphs as paths — no DOM fonts in Node
    standardFontDataUrl: join(PDFJS_ROOT, 'standard_fonts') + '/',
    cMapUrl: join(PDFJS_ROOT, 'cmaps') + '/',
    cMapPacked: true,
    verbosity: 0,
  };
}

export async function rasterizePdf(pdfBuffer, { scale = 3.0, quality = 0.92, maxPages = 5 } = {}) {
  const doc = await pdfjs.getDocument(pdfOpenOpts(new Uint8Array(pdfBuffer))).promise;
  const cf = doc.canvasFactory;
  const pages = [];
  const meta = [];
  const n = Math.min(doc.numPages, maxPages);
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i);
    const vp = page.getViewport({ scale });
    const { canvas, context } = cf.create(Math.ceil(vp.width), Math.ceil(vp.height));
    context.fillStyle = '#ffffff';           // PDF pages can have transparent bg
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport: vp }).promise;
    const jpeg = canvas.toBuffer('image/jpeg', quality);
    pages.push(jpeg.toString('base64'));
    meta.push({ page: i, width: canvas.width, height: canvas.height, jpegBytes: jpeg.length });
  }
  await doc.destroy();
  return { pages, meta, numPages: doc.numPages };
}

// CLI: node tools/rasterize.mjs <file.pdf> [outDir] — dumps pages as JPEGs + prints meta
if (process.argv[1] && process.argv[1].endsWith('rasterize.mjs') && process.argv[2]) {
  const file = process.argv[2];
  const outDir = process.argv[3] || 'tools/raster-out';
  mkdirSync(outDir, { recursive: true });
  const buf = readFileSync(file);
  const { pages, meta, numPages } = await rasterizePdf(buf);
  console.log(`${basename(file)}: ${numPages} page(s) in PDF, rasterized ${pages.length}`);
  meta.forEach((m, idx) => {
    const out = join(outDir, `${basename(file).replace(/\.pdf$/i, '')}-p${m.page}.jpg`);
    writeFileSync(out, Buffer.from(pages[idx], 'base64'));
    console.log(`  p${m.page}: ${m.width}x${m.height}px, ${(m.jpegBytes / 1024).toFixed(0)} KB -> ${out}`);
  });
}
