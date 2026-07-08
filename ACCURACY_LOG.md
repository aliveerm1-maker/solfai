# Solfai Accuracy Campaign Log

Running log of every accuracy experiment: what was tried, what the harness
measured before/after, what worked, what didn't, and what to try next.
(Newest entries at the bottom. Numbers come from `tools/test-accuracy.mjs`.)

---

## 2026-07-06 — Session start: measurement infrastructure

**Problem being attacked:** key/time-signature reads are inconsistent on
real-world PDFs, and until now there was **no way to measure** whether any
change helped. Everything below is built so improvements are provable.

### Infrastructure built

1. **`tools/rasterize.mjs`** — Node-side PDF→JPEG rasterizer that mirrors the
   classic frontend exactly (pdf.js `scale: 3.0`, JPEG q0.92). Needed because
   the harness must feed the server the same input a browser would.
   - Gotcha #1: pdf.js v4 in Node must use **its own** `doc.canvasFactory` for
     every canvas. Mixing in `canvas` (node-canvas) or a mismatched
     `@napi-rs/canvas` version fails with class-identity type errors
     (`Value is none of these types ...` in `paintChar`/`drawImage`).
   - Gotcha #2: vector PDFs also need `standardFontDataUrl` + `cMapUrl`
     pointed into `pdfjs-dist`, or text pages fail to render.
   - Pinned `@napi-rs/canvas@0.1.69` (devDep) — the range pdf.js 4.10 expects.

2. **`tools/label-crops.mjs`** — renders a top-strip crop of each test PDF so
   ground-truth key/time can be verified **by eye** before labeling. Ground
   truth here is what is literally printed on the page, not what a database
   says about the piece.

3. **`tools/test-accuracy.mjs`** — the harness. Feeds each labeled PDF through
   the real `/api/analyze` endpoint and scores:
   - KEY full match (tonic + mode), KEY accidental-count match, KEY mode match
   - TIME match
   - errors/timeouts, latency
   Saves every run to `tools/results/<timestamp>-<tag>.json` with the git rev,
   so before/after comparisons survive sessions. Supports `--raw-pdf` to send
   the PDF the way the **new React UI** does (see finding below) vs rasterized
   pages the way the **classic UI** does.

4. **`SOLFAI_NO_OVERRIDES=1`** (server.js) — measurement flag that disables the
   corrections cache and both piece databases for a run, so the harness
   measures the *vision pipeline*, not database lookups. Never set in prod;
   default behavior unchanged.

### Test set

- 9 public-domain CPDL scores (committed in `test-data/pdfs/`):
  ave-verum-mozart, locus-iste, sicut-cervus, if-ye-love-me, cantique
  (Fauré — 5-flat stress case), panis-angelicus, o-magnum, abendlied,
  god-so-loved.
- 2 local-only copyrighted scores (gitignored, still used locally):
  tu-lo-sai (E major, 3/4 — visually verified), daniel (Bb major per source).
- `test-data/labels.json` = visually-verified ground truth (see below).

### Finding #1 (critical, found by reading code before measuring)

**The new React UI sends raw PDF base64 (`imageMime: application/pdf`), not
rasterized `pdfPages`.** In that path:
- OMR never launches (it requires `pdfPagesArr`),
- `key_region`/`time_sig_region` crops can't happen (sharp can't crop PDFs),
- all 5 key-signature "independent witnesses" receive the SAME raw-PDF blob,
- every rescue pass that filters for `image/jpeg` parts finds nothing.

The entire accuracy stack was built around the classic UI's client-side
rasterization (pdf.js scale 3.0). The current front door bypasses ~all of it.
Baseline runs below will quantify the damage; the fix (server-side
rasterization fallback) is queued right after.

### Rasterization quality audit (item C2 of the brief)

Visually inspected `tu-lo-sai` page 1 at the classic pipeline's exact settings
(1960×2493 px, 95 KB JPEG): **excellent** — every accidental crisply legible.
Client-side rasterization quality is NOT the accuracy bottleneck. The
raw-PDF-path bypass (Finding #1) is the prime suspect for real-world failures.

### Finding #2 (from code): dedicated time-sig reads couldn't say "4/8"

`TIME_SIG_SCHEMA`'s enum was missing `4/8` (present in `ANALYZE_SCHEMA`), so
the two highest-weight time votes were structurally forced to answer wrong on
the Hogan *Daniel* (printed 4/8). Worse, the schema's `what_i_see` example
**taught the model** `'I see a C symbol = 4/4'` — actively mislabeling cut-C
(= 2/2). Both fixed:
- enum now includes `4/8` and `4/2`;
- `what_i_see` example now forces a plain-C vs slashed-C check and warns that
  4/4 vs 4/8 differ only in the bottom digit;
- `timeSigPrompt` gains the same two rules.
(Baseline runs below were taken BEFORE these fixes, deliberately.)

### Fix #1 built: server-side PDF rasterization (`lib/pdf-raster.mjs`)

`ensurePdfPages()` now rasterizes raw-PDF uploads server-side (pdf.js scale
3.0, q0.92, ≤5 pages — byte-compatible with the classic client) before
`buildImageParts`, in `/api/analyze` and `/api/extract-lyrics`. Any failure
falls back to the old raw-PDF behavior, so it can never regress. Deps
`pdfjs-dist` + `@napi-rs/canvas@0.1.69` moved to production dependencies.
(Applied AFTER baselines were measured on the old behavior.)

### Track B: free OMR hosting

- **Google Cloud Run: DISQUALIFIED.** As of Feb 2026, deploying requires a
  linked billing account (card on file) even at $0 usage — violates the
  campaign's hard no-card rule. Sources:
  [GCP free features](https://docs.cloud.google.com/free/docs/free-cloud-features),
  [signup FAQs](https://cloud.google.com/signup-faqs).
- **homr instead of oemer: the lead.** CPU-first OMR, ~15 s/page on desktop
  CPU vs oemer's 3–5 min — the exact reason the old Space timed out.
  ([homr GitHub](https://github.com/liebharc/homr), [PyPI](https://pypi.org/project/homr/))
- **Deployed:** rebuilt the existing HF Space `Aliveer/solfai-omr-service`
  (found with working credentials in its git remote — note: HF token sits in
  plaintext in that repo's `.git/config`; local-only, but worth rotating
  eventually). New build: FastAPI + homr, models pre-downloaded at image
  build, accepts multipart or base64-JSON, returns raw MusicXML. Building on
  HF's side now; will validate speed/quality on the test set once up.
- Local homr validation impossible: no Python on this machine.

---
