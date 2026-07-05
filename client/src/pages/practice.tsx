import { useState } from "react";
import { Play, RotateCcw, Flame, Music2, Target, Trophy, Ear, Star, Dumbbell } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

const DIFFS = ["Easy", "Medium", "Hard"] as const;
const INTERVALS = ["m2", "M2", "M3", "P4", "P5", "P8"];
const ACHIEVEMENTS = [
  { icon: Music2, name: "First Steps", note: "Complete your first analysis", earned: true },
  { icon: Target, name: "Perfect 10", note: "10 perfect practice measures" },
  { icon: Flame, name: "Week Warrior", note: "7-day practice streak" },
  { icon: Music2, name: "Interval Master", note: "Identify all intervals correctly" },
  { icon: Dumbbell, name: "Dedicated", note: "50 practice sessions" },
  { icon: Star, name: "Getting Started", note: "10 practice sessions" },
  { icon: Ear, name: "Sharp Ear", note: "10 ear training streak" },
  { icon: Trophy, name: "Choir Ready", note: "Master all voice parts" },
];

export default function Practice() {
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("Easy");

  return (
    <AppLayout title="Practice" subtitle="Everything stays in rhythm.">
      <div className="rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8 mb-6">
        <h2 className="serif text-2xl font-semibold">Practice Mode</h2>
        <p className="text-sm text-muted-dark">Work through your part one measure at a time.</p>

        <div className="mt-5 rounded-2xl border-l-4 border-[color:var(--teal)] bg-[color:var(--bg)]/50 p-5 text-sm">
          Play each measure with the piano, then sing it yourself. Load Solfege first in the Analyze section.
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button className="pill" style={{ background: "color-mix(in oklab, var(--teal) 25%, transparent)", color: "var(--paper)", border: "1px solid color-mix(in oklab, var(--teal) 40%, transparent)" }}>
            <Play size={14} /> Start Practice
          </button>
          <span className="text-sm text-muted-dark">Analyze a piece and generate Solfege first.</span>
        </div>
      </div>

      <div className="rounded-3xl border border-[color:var(--border-dark)] p-6 lg:p-8"
           style={{ background: "linear-gradient(160deg, color-mix(in oklab, oklch(0.55 0.2 300) 22%, var(--bg-2)), var(--bg-2))" }}>
        <div className="flex items-center gap-2 mb-2">
          <Music2 className="text-[color:oklch(0.78_0.16_310)]" />
          <h2 className="serif text-xl font-semibold">Interval Ear Training</h2>
        </div>
        <p className="text-sm text-muted-dark">Listen to two notes and identify the interval. Train your ear progressively.</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button className="pill" style={{ background: "linear-gradient(135deg, oklch(0.72 0.18 310), oklch(0.62 0.20 285))", color: "var(--paper)" }}>
            <Play size={14} /> Play Interval
          </button>
          <button className="pill" style={{ background: "var(--bg)", color: "var(--paper)", border: "1px solid var(--border-dark)" }}>
            <RotateCcw size={14} /> Replay
          </button>
          <div className="ml-2 flex rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg)]/60 p-1">
            {DIFFS.map((d) => (
              <button key={d} onClick={() => setDiff(d)}
                className={"px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition " + (d === diff ? "bg-[color:var(--teal)] text-[color:var(--ink)]" : "text-muted-dark")}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-dark mb-3">Pick the interval:</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {INTERVALS.map((n) => (
              <button key={n} className="rounded-xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/50 py-3 font-semibold hover:border-[color:var(--teal)]/60 transition">{n}</button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-8 text-sm">
          <div>Correct: <span className="text-[color:var(--teal)] serif text-xl font-semibold ml-1">1</span></div>
          <div>Total: <span className="text-[color:var(--teal)] serif text-xl font-semibold ml-1">6</span></div>
          <div>Streak: <span className="text-[color:var(--teal)] serif text-xl font-semibold ml-1">0</span></div>
        </div>
      </div>

      <div className="mt-10">
        <div className="eyebrow eyebrow-dot text-[color:var(--teal)] mb-4">Achievements</div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {ACHIEVEMENTS.map(({ icon: Icon, name, note, earned }) => (
            <div key={name} className={"rounded-2xl border p-4 text-center " + (earned ? "border-[color:var(--teal)]/50 bg-[color:var(--bg-2)]/70" : "border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/40 opacity-70")}>
              <Icon className={"mx-auto mb-2 " + (earned ? "text-[color:var(--teal)]" : "text-muted-dark")} />
              <div className="text-sm font-semibold">{name}</div>
              <div className="text-[11px] text-muted-dark mt-1 leading-snug">{note}</div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
