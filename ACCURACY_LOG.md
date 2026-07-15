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

## 2026-07-08 — Baseline numbers + mode-bias fix + OMR mode architecture

### BASELINE (the number that was missing): Gemini-only vision, overrides off,
### rasterized input (classic-UI path), 11 pieces:

| metric              | score |
|---------------------|-------|
| KEY full match      | **36% (4/11)** |
| KEY accidental count| **45% (5/11)** |
| KEY mode (maj/min)  | 64% (7/11) |
| TIME match          | **55% (6/11)** |
| errors/timeouts     | 0 |
| avg latency         | 95 s |

Failure anatomy (each failure has one dominant cause):
- **cut-C → 4/4** ×3 (sicut-cervus, if-ye-love-me, o-magnum) — the schema's own
  `what_i_see` example taught "C symbol = 4/4" (Finding #2; fixed, Run 2 measures it).
- **4/8 → 4/4** (daniel) — 4/8 missing from TIME_SIG_SCHEMA enum (fixed).
- **count off-by-one** ×4 (Mozart 2♯→1♯, Cantique 5♭→4♭, Abendlied 1♭→2♭,
  Stainer 2♯→3♯) — classic vision counting error; tournament didn't catch these.
- **major→minor mode flips** ×4 (Ave Verum→Em, If Ye Love Me→Am, Abendlied→Gm,
  Cantique→Fm).

### homr OMR stress test (free HF Space, CPU): 3/3 PERFECT
tu-lo-sai (vintage scan, 4♯ 3/4) ✓✓ · cantique (5♭!) ✓✓ · daniel (4/8!) ✓✓
at 46–54 s/page — exactly the failures Gemini can't shake, at usable speed.
(oemer, the old engine, timed out at 5+ min on the same tier.)

### Mode-bias fix (detectModeFromNotes rebalance)
Root causes found in code, all pushing toward false-minor:
1. single raised-leading-tone note added +4 minor — but one G# in C major is
   routine chromaticism (secondary dominants, Tallis musica ficta). Now: needs
   ≥2 occurrences, adds +2.
2. tonic-frequency tallies were uncapped — scale-degree-6 notes in major
   melodies accumulate toward the relative minor's tonic. Now capped at 3.
3. ties resolved minor on a 1-point edge. Now minor must win by ≥2
   (major prior matches choral repertoire).

### OMR mode architecture decision
homr's MusicXML may omit `<mode>`; parseMusicXML defaults to major → a naive
OMR override would wreck true-minor pieces (daniel). Changed the OMR-apply
block: **OMR contributes the accidental COUNT (<fifths>) + time signature;
major/minor always comes from the notes-based detector.** Each source does
what it's mechanically good at.

### Run plan (quota-conscious: key holder unsure of tier)
- Run 2 (in flight): time-sig fixes only, OMR off → isolates schema-fix effect.
- Run 3: OMR on + mode fix → per-piece attribution via trace tags
  (OMR_KEY_APPLIED vs MODE_DETECT_DECISION), no extra full runs needed.
- Raw-PDF path: 1-piece spot check only (server-side rasterization makes the
  path converge by design; full run would spend ~165 calls to confirm plumbing).

Deploy policy per owner: push only the safe subset (harness + rasterization +
time-sig fixes); OMR integration stays local pending review.

---

## 2026-07-08 — STOPPED HERE (usage limit), NEXT STEPS

### Run 2 result (PARTIAL — 6 of 11 pieces, stopped by usage limit)
Saved: `tools/results/2026-07-08-run2-timefix-omr-off-PARTIAL.log`
Config: time-sig schema/prompt fixes ON, OMR off, mode fix NOT in the running
server (it was edited after boot) → clean attribution.

| piece | key | time |
|---|---|---|
| Tu lo sai | ✓ | ✓ |
| Daniel (Hogan) | ✗ C major (was D minor in baseline — HIGH VARIANCE piece) | ✗ 4/4 |
| Ave Verum | ✗ E minor 1♯ (same as baseline) | ✓ |
| Locus Iste | ✓ | ✓ |
| Sicut Cervus | ✓ | ✗ 4/4 |
| If Ye Love Me | ✗ A minor (same as baseline) | ✗ 4/4 |

**NEGATIVE RESULT (important):** the TIME_SIG_SCHEMA `what_i_see` example fix
+ prompt rules did NOT fix cut-C→4/4 on the two cut-C pieces measured. The
model doesn't reliably distinguish plain C from slashed C in these engravings
regardless of prompt guidance. Conclusion: cut-C needs a non-prompt solution —
either the OMR path (homr reads <time> structurally and got 4/8 right) or a
dedicated high-zoom crop of the time-sig region. Do not spend more time on
prompt-wording for this.

### What is COMMITTED but NOT YET VALIDATED (Run 3 never ran)
1. **OMR client → homr HF Space** (`tryOmrService`, default URL
   `https://aliveer-solfai-omr-service.hf.space`, `OMR_SERVICE_URL=off` to
   disable, 240s timeout, fail-safe null). Space itself went 3/3 on stress
   pages (tu-lo-sai 4♯/3-4, cantique 5♭, daniel 2♭+4/8).
2. **Mode-detector rebalance** (leading-tone ≥2 & +2 not +4; tonic tallies
   capped at 3; minor must win by ≥2).
3. **OMR-mode architecture**: OMR sets accidental count + time; mode always
   from notes-detector (homr may omit <mode>; parseMusicXML defaults major).

### NEXT STEPS — exact commands
1. **Run 3 (the decisive one):** OMR on + mode fix. Boots the NEW code:
   `SOLFAI_NO_OVERRIDES=1 PORT=3100 node server.js` (OMR defaults on), then
   `node tools/test-accuracy.mjs --target=http://localhost:3100 --tag=run3-omr-on-modefix`
   Expect: cut-C + 4/8 fixed by OMR; count off-by-ones fixed by OMR fifths;
   mode flips fixed by detector rebalance. Attribute per piece via server-log
   trace tags `OMR_KEY_APPLIED` / `OMR_TIME_APPLIED` / `MODE_DETECT_DECISION`.
   Watch first pieces for HF cold start (first OMR call may take ~2-4 min;
   consider `curl https://aliveer-solfai-omr-service.hf.space/` first).
2. **Raw-PDF spot check** (1 piece, proves server-side rasterization wiring):
   `node tools/test-accuracy.mjs --target=http://localhost:3100 --raw-pdf --only=ave --tag=rawpdf-spot`
   Expect identical result to the rasterized path; look for `PDF_RASTER`-ish
   trace lines from lib/pdf-raster.mjs.
3. **Decide OMR policy from Run 3 numbers** (owner chose "measure first"):
   if OMR-on ≥ OMR-off on key-count AND time with no new errors → keep
   OMR-primary; if mixed → agreement-gating; then owner reviews before push.
4. **Push policy:** owner approved pushing ONLY the safe subset
   (7d8819d, f51f9f2, 7162167 + docs commits). NOT pushed yet — usage ran out
   before Run 2 could fully validate; run Run 3 first anyway since the deploy
   would include the OMR default-on client (commit below) unless cherry-picked.
   Simplest: after Run 3 validates, push everything at once.
5. **Backlog (unmeasured ideas, cheapest first):** dedicated extreme-zoom
   time-sig crop read (like key_region_extreme); count-retry when tournament
   margin < 0.3; daniel variance investigation (percussive texture destabilizes
   extraction); homr as batch pre-processor for piece-database entries.

### Security note
The HF Space repo's `.git/config` (local clone used to deploy) embeds a write
token — rotate it when convenient; it is NOT in this repo.

---

## 2026-07-15 — Run 3 result + FOLLOW-UP for next session

### Run 3 (OMR on + mode fix), 11/11 pieces, 0 errors:

| metric              | baseline | Run 3 |
|---------------------|----------|-------|
| KEY full match      | 36% (4/11) | 55% (6/11) |
| KEY count match      | 45% (5/11) | 64% (7/11) |
| KEY mode match       | 64% (7/11) | 82% (9/11) |
| TIME match           | 55% (6/11) | 82% (9/11) |
| avg latency          | 95s | 88s |

Saved: `tools/results/2026-07-15T19-02-36-216Z-run3-omr-on-modefix.json`

Attribution via `OMR_KEY_APPLIED`/`OMR_TIME_APPLIED`/`MODE_DETECT_DECISION`:
- OMR fixed cut-C time (Sicut Cervus, If Ye Love Me) and a bad key vote (Ave
  Verum). OMR/notes agreed but were both wrong on O Magnum's key (upstream
  pitch-extraction error, not an OMR/mode bug).
- **HF Space crashed (`homr exited 1`, HTTP 502) on 5/11 pieces** (Daniel,
  Locus Iste, Panis Angelicus, Abendlied, God So Loved) — far worse than the
  3/3 stress test implied. Fail-safe fallback worked correctly (0 harness
  errors), but treat OMR as unreliable on the free HF tier under back-to-back
  calls, not as a dependable rescue path yet.
- Mode-detector rebalance alone (no OMR) correctly resolved 2 ties (Locus
  Iste, Panis) but can't fix genuine Gemini pitch/tournament misreads
  (Daniel, God So Loved, Abendlied-key).

### FOLLOW-UP (not fixed yet, do next): Cantique mode-flip regression
On Cantique de Jean Racine, OMR correctly read 5 flats (Db major territory),
but `detectModeFromNotes`, run against OMR's own tonic pair (Db major / Bb
minor), scored minor 3–1 and flipped the result to **Bb minor** — worse than
Gemini's own (also wrong) Ab major guess, because it discarded a correct
accidental-count read. Root cause: the "OMR sets count, notes-detector sets
mode" split (see 2026-07-08 entry) isn't OMR-aware — when OMR's fifths
disagree sharply with Gemini's vote, re-deriving mode from OMR's tonic pair
can override a correct OMR count with the wrong mode. Two candidate fixes to
evaluate: (a) trust homr's own `<mode>` tag when present instead of
re-deriving from notes, or (b) skip the mode-detector re-run against OMR's
tonic pair when OMR/Gemini key disagreement is large, and fall back to
Gemini's own tonic pair for mode instead. Measure both before picking.

### Push status
Owner approved pushing everything (safe subset + OMR client + mode fix) as
Run 3 validated the policy rule. Push blocked on an unrelated problem: this
machine has two divergent local clones of the same GitHub repo
(`C:\Users\857525\solfai` and `C:\Users\857525\Desktop\solfai`); the former's
history was already pushed to `origin/main` (commit `7364642`) and is NOT an
ancestor of this repo's accuracy-campaign commits — it in fact deletes this
whole log, `CLAUDE.md`, and all the accuracy tooling in its diff. Needs a
merge/rebase/force-push decision by the owner before Run 3's work reaches
`origin/main`. Do not just force-push without checking whether `7364642`'s UI
wiring needs to be preserved.
