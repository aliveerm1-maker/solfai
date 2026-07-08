// lib/pdf-raster.mjs — server-side PDF → JPEG page rasterization.
//
// WHY THIS EXISTS: the accuracy pipeline (key-region crops, per-page keysig
// witnesses, OMR, rescue passes) is built around JPEG page images. The classic
// UI rasterizes PDFs client-side (pdf.js scale 3.0) and sends `pdfPages`; the
// React UI sends the raw PDF, which used to silently bypass the entire
// accuracy stack. This module gives the server the same rasterization the
// classic client does, so EVERY client gets the full pipeline.
//
// Settings mirror the classic frontend exactly: scale 3.0, JPEG q0.92, max 5
// pages. All canvases come from pdf.js's own doc.canvasFactory — mixing
// external canvas packages with pdf.js v4 internals fails with class-identity
// type errors (documented in ACCURACY_LOG.md).

import { join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjsPromise;
}

function fontOpts() {
  const root = join(require.resolve('pdfjs-dist/package.json'), '..');
  return {
    disableFontFace: true,
    standardFontDataUrl: join(root, 'standard_fonts') + '/',
    cMapUrl: join(root, 'cmaps') + '/',
    cMapPacked: true,
    verbosity: 0,
  };
}

/**
 * Rasterize a PDF buffer to base64 JPEG pages (classic-client-compatible).
 * Returns { pages: string[], meta: [{page,width,height,jpegBytes}] }.
 * Throws on unrenderable input — callers must treat failure as "fall back to
 * sending the raw PDF" so behavior can never get worse than before.
 */
export async function rasterizePdfServer(pdfBuffer, { scale = 3.0, quality = 0.92, maxPages = 5 } = {}) {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(pdfBuffer), ...fontOpts() }).promise;
  try {
    const cf = doc.canvasFactory;
    const pages = [];
    const meta = [];
    const n = Math.min(doc.numPages, maxPages);
    for (let i = 1; i <= n; i++) {
      const page = await doc.getPage(i);
      const vp = page.getViewport({ scale });
      const { canvas, context } = cf.create(Math.ceil(vp.width), Math.ceil(vp.height));
      context.fillStyle = '#ffffff'; // PDF pages can have transparent backgrounds
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport: vp }).promise;
      const jpeg = canvas.toBuffer('image/jpeg', quality);
      pages.push(jpeg.toString('base64'));
      meta.push({ page: i, width: canvas.width, height: canvas.height, jpegBytes: jpeg.length });
    }
    return { pages, meta, numPages: doc.numPages };
  } finally {
    await doc.destroy().catch(() => {});
  }
}
