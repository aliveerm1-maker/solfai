import { Suspense, lazy, useMemo, useRef, useState } from "react";
import {
  ArrowUp, Paperclip, Mic, FileMusic, Sparkles, Music2, Waves, Upload,
  ScanLine, Ear, PenLine, Radio, Check, Flame, Clock3, Loader2, X,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { analyzeScore, type AnalyzeResult } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ambientHero from "@/assets/ambient-hero.jpg";
import modeSightread from "@/assets/mode-sightread.jpg";
import modeEartrain from "@/assets/mode-eartrain.jpg";
import modeVocal from "@/assets/mode-vocal.jpg";
import modeCompose from "@/assets/mode-compose.jpg";

const TrebleClef3D = lazy(() =>
  import("@/components/TrebleClef3D").then((m) => ({ default: m.TrebleClef3D })),
);

const PARTS = ["Soprano", "Alto", "Tenor", "Bass"] as const;

type ModeId = "analyze" | "sightread" | "ear" | "vocal" | "compose";

const MODES: {
  id: ModeId;
  label: string;
  tagline: string;
  icon: typeof ScanLine;
  art: string;
  placeholder: string;
  actions: { icon: typeof Upload; label: string; hint: string }[];
  suggestions: string[];
}[] = [
  {
    id: "analyze",
    label: "Analyze",
    tagline: "Read a score end-to-end",
    icon: ScanLine,
    art: modeSightread,
    placeholder: "Drop a PDF, MusicXML or photo — Solfai returns key, tempo, range, and section notes.",
    actions: [
      { icon: Upload, label: "Upload a score", hint: "PDF · MusicXML · Image" },
      { icon: FileMusic, label: "Paste a link", hint: "IMSLP · CPDL · MuseScore" },
      { icon: Waves, label: "Find starting pitch", hint: "From any measure" },
      { icon: Music2, label: "Solfege my part", hint: "Movable-do transcription" },
    ],
    suggestions: [
      "Summarize the harmonic structure of this piece",
      "Highlight the hardest 8 measures for tenors",
      "What key does the bridge modulate to?",
      "Transpose measures 12–24 down a minor third",
    ],
  },
  {
    id: "sightread",
    label: "Sight-read",
    tagline: "Real-time solfege coach",
    icon: PenLine,
    art: modeSightread,
    placeholder: "Load a passage and Solfai will beat, blink, and prompt you through it at your tempo.",
    actions: [
      { icon: Upload, label: "Load passage", hint: "Any 4–32 bars" },
      { icon: Clock3, label: "Set tempo", hint: "Metronome + count-in" },
      { icon: Music2, label: "Chunk & loop", hint: "Auto phrase splits" },
      { icon: Flame, label: "Streak mode", hint: "Nail 5 passes in a row" },
    ],
    suggestions: [
      "Slow the tricky measures to 70% until I hit them clean",
      "Loop measures 45–52 with a 4-beat count-in",
      "Quiz me on interval names as I go",
    ],
  },
  {
    id: "ear",
    label: "Ear Training",
    tagline: "Intervals · chords · dictation",
    icon: Ear,
    art: modeEartrain,
    placeholder: "Pick a drill — intervals, triads, cadences, or full melodic dictation.",
    actions: [
      { icon: Waves, label: "Interval drill", hint: "P4, P5, tritone…" },
      { icon: Music2, label: "Chord quality", hint: "maj / min / dim / aug" },
      { icon: PenLine, label: "Melodic dictation", hint: "4–8 bars, notate it" },
      { icon: Flame, label: "Daily streak", hint: "5 min · 10 questions" },
    ],
    suggestions: [
      "Ascending intervals within an octave, adaptive difficulty",
      "Dictation in E♭ major, quarter and eighth notes only",
      "Drill me on tritone vs perfect fifth for 3 minutes",
    ],
  },
  {
    id: "vocal",
    label: "Vocal Coach",
    tagline: "Feedback on your take",
    icon: Radio,
    art: modeVocal,
    placeholder: "Record 5–30 seconds. Solfai returns pitch, timing, vowel shape and dynamics.",
    actions: [
      { icon: Mic, label: "Record now", hint: "Latest passage" },
      { icon: Upload, label: "Upload a take", hint: "m4a · wav · mp3" },
      { icon: Waves, label: "Pitch overlay", hint: "vs. reference line" },
      { icon: FileMusic, label: "Warm-ups", hint: "In the piece's key" },
    ],
    suggestions: [
      "Grade my last recording measure-by-measure",
      "Am I flat on any sustained notes?",
      "Give me 3 warm-ups for the tenor bridge",
    ],
  },
  {
    id: "compose",
    label: "Compose",
    tagline: "Write, arrange, transpose",
    icon: PenLine,
    art: modeCompose,
    placeholder: "Describe a phrase, arrangement, or exercise — Solfai drafts the notation.",
    actions: [
      { icon: PenLine, label: "New exercise", hint: "8-bar sight-reader" },
      { icon: Music2, label: "Reharmonize", hint: "Give a chart new colors" },
      { icon: Waves, label: "Voice a chord", hint: "SATB voicing tool" },
      { icon: Upload, label: "Import lead sheet", hint: "MusicXML in, SATB out" },
    ],
    suggestions: [
      "Write an 8-bar SATB warm-up in F, ending on a picardy third",
      "Reharmonize this refrain with a secondary dominant",
      "Compose a 16-bar sight-reading exercise, level 3/5",
    ],
  },
];

export default function Home() {
  const [modeId, setModeId] = useState<ModeId>("analyze");
  const mode = useMemo(() => MODES.find((m) => m.id === modeId)!, [modeId]);
  const [part, setPart] = useState<(typeof PARTS)[number]>("Soprano");
  const [text, setText] = useState("");

  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.given_name || user?.name?.split(" ")[0] || "";

  // ── Real backend wiring (flagship Analyze flow → /api/analyze) ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFile = () => fileInputRef.current?.click();

  const runAnalyze = async (f: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await analyzeScore({ file: f, part });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      void runAnalyze(f);
    }
    e.target.value = "";
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (file) void runAnalyze(file);
    else pickFile();
  };

  const onActionClick = (label: string) => {
    if (/upload|load|import|take/i.test(label)) pickFile();
  };

  const structured = result?.structured;

  return (
    <AppLayout>
      <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* hidden file input drives the real /api/analyze flow */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xml,.musicxml,.mxl,image/*"
          className="hidden"
          onChange={onFileChosen}
        />

        {/* Ambient hero image */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src={ambientHero}
            alt=""
            aria-hidden
            width={1536}
            height={768}
            className="absolute inset-0 w-full h-[70vh] object-cover object-top opacity-[0.28]"
          />
          <div className="absolute inset-0"
               style={{ background: "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--bg) 55%, transparent) 45%, var(--bg) 85%)" }} />
          <div className="absolute inset-0"
               style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, color-mix(in oklab, var(--teal) 18%, transparent), transparent 65%)" }} />
        </div>

        <div className="relative mx-auto w-full max-w-3xl px-5 pt-14 pb-16 flex flex-col items-center">
          {/* Floating clef */}
          <div className="relative h-36 w-36 -mb-3">
            <div className="absolute -inset-8 rounded-full blur-3xl opacity-70"
                 style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--teal) 45%, transparent), transparent 65%)" }} />
            <Suspense fallback={<div className="h-full w-full" />}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-28"><TrebleClef3D /></div>
              </div>
            </Suspense>
          </div>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 px-3 py-1 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--teal)] shadow-[0_0_10px_var(--teal)]" />
            Solfai · v0.4 preview
          </div>

          <h1 className="mt-5 text-center serif text-4xl md:text-5xl font-semibold tracking-tight text-paper">
            {greeting}
            {firstName && (
              <>
                ,{" "}
                <span className="italic text-gradient-amber">{firstName}</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-lg text-center text-[15px] text-muted-dark">
            {mode.tagline}. Switch modes below — Solfai reshapes itself around what you're trying to do.
          </p>

          {/* Mode picker */}
          <div className="mt-7 w-full">
            <div className="flex items-center gap-1.5 rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 backdrop-blur-xl p-1.5 overflow-x-auto no-scrollbar">
              {MODES.map((m) => {
                const active = m.id === modeId;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModeId(m.id)}
                    className={
                      "flex-1 min-w-max flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap transition " +
                      (active
                        ? "text-[color:var(--ink)] shadow-[0_10px_30px_-12px_var(--teal)]"
                        : "text-muted-dark hover:text-paper")
                    }
                    style={
                      active
                        ? { background: "linear-gradient(135deg, var(--teal), var(--teal-deep))" }
                        : undefined
                    }
                  >
                    <Icon size={13} />
                    <span>{m.label}</span>
                    {active && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="relative mt-4 w-full rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/85 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center gap-2 px-5 pt-3.5 text-[11px] uppercase tracking-[0.22em] text-muted-dark">
              <mode.icon size={12} className="text-[color:var(--teal)]" />
              <span className="text-paper/85 font-semibold">{mode.label}</span>
              <span className="opacity-60">mode</span>
              <span className="ml-auto normal-case tracking-normal text-[11px] text-muted-dark">
                Voice · <span className="text-paper/85 font-semibold">{part}</span>
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode.placeholder}
              rows={2}
              className="block w-full resize-none bg-transparent px-5 pt-2 pb-3 text-[15px] leading-relaxed placeholder:text-muted-dark focus:outline-none"
            />

            {/* selected file chip */}
            {file && (
              <div className="mx-5 mb-1 flex items-center gap-2 rounded-full border border-[color:var(--teal)]/40 bg-[color:var(--bg)]/50 px-3 py-1.5 text-[12px] w-fit">
                <FileMusic size={13} className="text-[color:var(--teal)]" />
                <span className="text-paper/90 max-w-[280px] truncate">{file.name}</span>
                <button type="button" onClick={() => { setFile(null); setResult(null); setError(null); }} aria-label="Remove file" className="text-muted-dark hover:text-paper">
                  <X size={13} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 pb-3">
              <button type="button" onClick={pickFile} className="grid place-items-center h-9 w-9 rounded-full border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--teal)]/50 transition" aria-label="Attach">
                <Paperclip size={15} />
              </button>
              <div className="hidden sm:flex items-center rounded-full border border-[color:var(--border-dark)] p-0.5 text-[11px] font-semibold uppercase tracking-widest">
                {PARTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPart(p)}
                    className={
                      "px-3 py-1 rounded-full transition " +
                      (part === p ? "bg-[color:var(--teal)] text-[color:var(--ink)]" : "text-muted-dark hover:text-paper")
                    }
                  >
                    {p.slice(0, 1)}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" className="grid place-items-center h-9 w-9 rounded-full border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--teal)]/50 transition" aria-label="Voice">
                  <Mic size={15} />
                </button>
                <button
                  type="submit"
                  className="grid place-items-center h-9 w-9 rounded-full transition disabled:opacity-40"
                  disabled={loading}
                  style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-deep))", color: "var(--ink)" }}
                  aria-label={file ? "Analyze" : "Upload a score"}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : file ? <ArrowUp size={16} strokeWidth={2.5} /> : <Upload size={16} strokeWidth={2.5} />}
                </button>
              </div>
            </div>
          </form>

          {/* ── Analysis status + results ── */}
          {(loading || error || structured) && (
            <div className="mt-5 w-full">
              {loading && (
                <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/70 px-5 py-4 text-sm text-muted-dark">
                  <Loader2 size={16} className="animate-spin text-[color:var(--teal)]" />
                  Reading your score — key, tempo, range and starting pitch…
                </div>
              )}
              {error && !loading && (
                <div className="rounded-2xl border border-[color:oklch(0.62_0.22_25)]/45 bg-[color:oklch(0.62_0.22_25)]/10 px-5 py-4 text-sm text-[color:oklch(0.85_0.10_25)]">
                  {error}
                </div>
              )}
              {structured && !loading && (
                <div className="rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/70 p-6 fade-up">
                  <div className="eyebrow eyebrow-dot text-[color:var(--teal)] mb-3">Analysis</div>
                  {(structured.pieceTitle || structured.composerName) && (
                    <div className="mb-4">
                      <div className="serif text-xl font-semibold text-paper">{structured.pieceTitle || "Your score"}</div>
                      {structured.composerName && <div className="text-[12px] text-muted-dark">{structured.composerName}</div>}
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { k: "Key", v: structured.keySignature },
                      { k: "Time", v: structured.timeSignature },
                      { k: "Tempo", v: structured.tempo },
                      { k: "Starting pitch", v: structured.startingPitch },
                    ].filter((x) => x.v).map((x) => (
                      <div key={x.k} className="rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/50 p-3.5">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-dark">{x.k}</div>
                        <div className="serif text-[16px] font-semibold text-paper mt-1">{String(x.v)}</div>
                      </div>
                    ))}
                  </div>

                  {Array.isArray(structured.firstNotesSolfege) && structured.firstNotesSolfege.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[10.5px] uppercase tracking-[0.22em] text-muted-dark mb-2">Opening solfege · {part}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {structured.firstNotesSolfege.map((s, i) => (
                          <span key={i} className="rounded-lg border border-[color:var(--border-dark)] bg-[color:var(--bg)]/60 px-2.5 py-1 text-[12.5px] text-paper">
                            {s}{Array.isArray(structured.firstNotes) && structured.firstNotes[i] ? <span className="text-muted-dark"> · {structured.firstNotes[i]}</span> : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {structured.firstLyrics && (
                    <div className="mt-4 text-[13px] text-muted-dark">
                      <span className="text-paper/80 font-semibold">Lyrics:</span> {structured.firstLyrics}
                    </div>
                  )}

                  {structured.overview && (
                    <p className="mt-4 text-[13.5px] leading-relaxed text-muted-dark">{structured.overview}</p>
                  )}

                  {Array.isArray(structured.practiceTips) && structured.practiceTips.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[10.5px] uppercase tracking-[0.22em] text-muted-dark mb-2">Practice tips</div>
                      <ul className="space-y-2">
                        {structured.practiceTips.slice(0, 5).map((t, i) => (
                          <li key={i} className="flex gap-2 text-[13px] text-muted-dark">
                            <Check size={14} className="mt-0.5 shrink-0 text-[color:var(--teal)]" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-5 text-[11px] text-muted-dark">
                    Need the full toolkit (measure-by-measure solfege, transpose, sight-reading)?{" "}
                    <a href="/classic" className="text-[color:var(--teal)] font-semibold hover:underline">Open the classic studio →</a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick actions — mode-specific */}
          <div className="mt-6 grid w-full grid-cols-2 md:grid-cols-4 gap-2.5">
            {mode.actions.map(({ icon: Icon, label, hint }) => (
              <button
                key={label}
                onClick={() => onActionClick(label)}
                className="group text-left rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/55 p-3.5 hover:border-[color:var(--teal)]/45 hover:bg-[color:var(--bg-2)]/85 transition"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="grid place-items-center h-7 w-7 rounded-lg bg-[color:var(--bg)] ring-1 ring-[color:var(--border-dark)] group-hover:ring-[color:var(--teal)]/40 transition">
                    <Icon size={13} className="text-[color:var(--teal)]" />
                  </span>
                  <span className="text-[13px] font-semibold text-paper">{label}</span>
                </div>
                <div className="text-[11px] text-muted-dark leading-snug">{hint}</div>
              </button>
            ))}
          </div>

          {/* Suggestions — mode-specific */}
          <div className="mt-8 w-full">
            <div className="flex items-center gap-2 mb-3 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark">
              <Sparkles size={12} className="text-[color:var(--teal)]" /> Try asking
            </div>
            <div className="flex flex-wrap gap-2">
              {mode.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setText(s)}
                  className="rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/40 px-3.5 py-1.5 text-[12.5px] text-muted-dark hover:text-paper hover:border-[color:var(--teal)]/40 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Continue + streak row */}
          <div className="mt-10 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/55 p-4 flex items-center gap-4">
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-[color:var(--bg)] ring-1 ring-[color:var(--border-dark)]">
                <FileMusic size={16} className="text-[color:var(--teal)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="serif text-[15px] font-semibold truncate">Continue: Speak the Truth — Tenor</div>
                <div className="text-[11.5px] text-muted-dark">E♭ major · 4/4 · 76 bpm · measure 34 of 118</div>
              </div>
              <button className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--teal)] hover:underline">
                Resume →
              </button>
            </div>
            <div className="rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/55 p-4 flex items-center gap-3">
              <div className="grid place-items-center h-11 w-11 rounded-xl"
                   style={{ background: "linear-gradient(135deg, oklch(0.82 0.14 78), oklch(0.62 0.15 55))" }}>
                <Flame size={16} className="text-[color:var(--ink)]" />
              </div>
              <div className="leading-tight">
                <div className="text-[12px] uppercase tracking-[0.22em] text-muted-dark">Streak</div>
                <div className="serif text-[18px] font-semibold">12 days</div>
                <div className="text-[10.5px] text-muted-dark">3 drills to keep it alive</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[10.5px] text-muted-dark">
            Solfai can misread messy scans. Verify key and rhythm before performance.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
