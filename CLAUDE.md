# Solfai — AI Sheet Music Coach

Express backend (`server.js`, ~5,400 lines, ESM) + React SPA (`client/`, Vite,
served from `client/dist`; legacy single-file UI preserved at `/classic` from
`public/index.html`). No database — file persistence (`corrections.json`,
`piece-database.json`, `shared/`, `analytics/`). Deploys to Render on push to
`main` (auto-deploy — treat every push as a production deploy).

## Core principle
**Code calculates, AI extracts.** Gemini reads raw facts off the page (note
letters, accidental counts); JavaScript + tonal.js compute solfege, keys,
intervals. Never let the AI generate solfege directly. All Gemini API params
snake_case; temperature 0 for extraction.

## Key/time accuracy pipeline (read before touching)
`handleAnalyze` in server.js: 9 parallel Gemini calls (5 key-sig witnesses
across pages, 2 time-sig, 2 full extraction) → pair-voting → hypothesis
tournament (circle-of-fifths neighbors scored by note evidence) →
`detectModeFromNotes` (mode NEVER from AI voting) → optional OMR override
(homr HF Space: OMR sets accidental count + time; mode stays notes-based) →
corrections cache / piece-DB overrides. Diagnostic trace: every analysis logs
a `[SOLFAI][<id>][SUMMARY]` block — read it before theorizing about a failure.

## Accuracy measurement (ALWAYS measure before/after pipeline changes)
- `ACCURACY_LOG.md` — running experiment log. Read the last "STOPPED HERE"
  section first; it lists validated state + exact next commands.
- Harness: `node tools/test-accuracy.mjs --target=http://localhost:3100 --tag=<name>`
  against a server started with `SOLFAI_NO_OVERRIDES=1 PORT=3100 node server.js`
  (flag disables cache + piece DBs so you measure vision, not lookups).
- Ground truth: `test-data/labels.json` — labels are what is PRINTED on each
  page (visually verified; several test editions are transposed, so
  piece-databases would be wrong for them). 2 PDFs are gitignored (copyright).
- Results JSONs/logs are committed in `tools/results/` — the baseline to beat
  is 36% key / 45% count / 55% time (Gemini-only, rasterized, no overrides).
- Env flags: `SOLFAI_NO_OVERRIDES=1` (measurement), `OMR_SERVICE_URL=off`
  (disable OMR) or a URL (default: homr Space `aliveer-solfai-omr-service`).

## Gotchas that cost hours
- pdf.js v4 in Node: use `doc.canvasFactory` for ALL canvases and pass
  `standardFontDataUrl`/`cMapUrl` (see `tools/rasterize.mjs`); mixing canvas
  packages or versions fails with class-identity type errors.
- Clients may send raw PDF base64 (`imageMime: application/pdf`) — the server
  rasterizes via `lib/pdf-raster.mjs` before analysis; never assume `pdfPages`.
- Windows dev box: bash `/tmp` ≠ `C:\tmp`; prefer explicit paths in tools.
- Prompt-wording does NOT fix cut-C vs C time-signature confusion (measured
  negative result) — use OMR or a dedicated zoom crop instead.

## Deploy
`git push origin main` → Render builds `npm install` + `node server.js`.
GEMINI_API_KEY (AI Studio key, `x-goog-api-key` header) set in Render env.
Do not switch to the Vertex project-scoped endpoint with an API key — it
requires OAuth and rejects keys (caused a full production outage once).
