import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ScanLine, PenLine, Ear, Radio, Library, PlayCircle, Mic, Music2, Sparkles, ArrowRight } from "lucide-react";

type Cmd = { id: string; label: string; hint: string; icon: typeof Search; run: () => void; group: string; kbd?: string };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands: Cmd[] = useMemo(() => [
    { id: "m-analyze", group: "Modes", label: "Analyze a score", hint: "PDF · MusicXML · Image", icon: ScanLine, run: () => navigate({ pathname: "/", hash: "analyze" }) },
    { id: "m-sight", group: "Modes", label: "Sight-read coach", hint: "Real-time solfege", icon: PenLine, run: () => navigate("/") },
    { id: "m-ear", group: "Modes", label: "Ear training", hint: "Intervals · dictation", icon: Ear, run: () => navigate("/") },
    { id: "m-vocal", group: "Modes", label: "Vocal coach feedback", hint: "Grade a recording", icon: Radio, run: () => navigate("/vocal-coach") },
    { id: "g-library", group: "Go to", label: "Library", hint: "All your pieces", icon: Library, run: () => navigate("/library"), kbd: "G L" },
    { id: "g-practice", group: "Go to", label: "Practice", hint: "Your queued drills", icon: PlayCircle, run: () => navigate("/practice"), kbd: "G P" },
    { id: "g-vocal", group: "Go to", label: "Vocal Coach", hint: "Record & review", icon: Mic, run: () => navigate("/vocal-coach"), kbd: "G V" },
    { id: "a-tune", group: "Actions", label: "Find starting pitch", hint: "From any measure", icon: Music2, run: () => navigate("/") },
    { id: "a-warm", group: "Actions", label: "Daily warm-up", hint: "In today's piece's key", icon: Sparkles, run: () => navigate("/") },
  ], [navigate]);

  const filtered = q.trim()
    ? commands.filter((c) => (c.label + " " + c.hint + " " + c.group).toLowerCase().includes(q.toLowerCase()))
    : commands;

  const grouped = filtered.reduce<Record<string, Cmd[]>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] px-4 animate-fade-in"
      onClick={() => setOpen(false)}
      style={{ background: "color-mix(in oklab, var(--bg) 55%, transparent)", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)] overflow-hidden animate-scale-in"
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[color:var(--border-dark)]">
          <Search size={15} className="text-muted-dark" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search modes, actions, pages…"
            className="flex-1 bg-transparent text-[14px] placeholder:text-muted-dark focus:outline-none"
          />
          <kbd className="text-[10px] font-semibold text-muted-dark px-1.5 py-0.5 rounded border border-[color:var(--border-dark)]">ESC</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-2">
              <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-dark">{group}</div>
              {items.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => { c.run(); setOpen(false); setQ(""); }}
                    className="group w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-[color:var(--bg)]/70 transition"
                  >
                    <span className="grid place-items-center h-7 w-7 rounded-md bg-[color:var(--bg)] ring-1 ring-[color:var(--border-dark)] group-hover:ring-[color:var(--teal)]/40">
                      <Icon size={13} className="text-[color:var(--teal)]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-paper truncate">{c.label}</div>
                      <div className="text-[11px] text-muted-dark truncate">{c.hint}</div>
                    </div>
                    {c.kbd && <kbd className="text-[9.5px] font-semibold text-muted-dark px-1.5 py-0.5 rounded border border-[color:var(--border-dark)]">{c.kbd}</kbd>}
                    <ArrowRight size={13} className="text-muted-dark opacity-0 group-hover:opacity-100 transition" />
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-[13px] text-muted-dark">No matches. Try "warm-up", "record", or "library".</div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-t border-[color:var(--border-dark)] text-[10.5px] text-muted-dark">
          <span>↑↓ navigate · ↵ open</span>
          <span className="flex items-center gap-1">
            Powered by <span className="text-[color:var(--teal)] font-semibold">Solfai</span>
          </span>
        </div>
      </div>
    </div>
  );
}
