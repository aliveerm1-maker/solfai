import { BookOpen, MoreHorizontal } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

const PIECES = [
  { title: "Speak the Truth", part: "Tenor", date: "7/4/2026" },
  { title: "Speak the Truth", part: "Soprano", date: "7/4/2026" },
  { title: "Speak the Truth", part: "Soprano", date: "7/4/2026" },
  { title: "Didn't My Lord Deliver Daniel?", part: "Soprano", date: "7/1/2026" },
  { title: "Didn't My Lord Deliver Daniel?", part: "Tenor", date: "7/1/2026" },
  { title: "Didn't My Lord Deliver Daniel?", part: "Soprano", date: "6/24/2026" },
];

export default function LibraryPage() {
  return (
    <AppLayout title="Library" subtitle="Everything stays in rhythm.">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <section className="rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="eyebrow eyebrow-dot text-[color:var(--teal)] mb-2">Recent Analyses</div>
              <h2 className="serif text-2xl font-semibold">Your saved pieces</h2>
              <p className="text-sm text-muted-dark mt-1">Review recent analyses and reopen practice resources.</p>
            </div>
            <button className="text-xs font-semibold text-[color:var(--teal)] uppercase tracking-widest">View all</button>
          </div>

          <ul className="mt-6 space-y-3">
            {PIECES.map((p, i) => (
              <li key={i} className="flex items-center gap-4 rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/40 p-4 hover:border-[color:var(--teal)]/40 transition">
                <span className="h-11 w-11 rounded-lg" style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--teal) 30%, transparent), color-mix(in oklab, var(--teal-deep) 30%, transparent))" }} />
                <div className="min-w-0">
                  <div className="serif font-semibold truncate">{p.title}</div>
                  <div className="text-xs text-muted-dark">{p.part} · {p.date}</div>
                </div>
                <button className="ml-auto text-muted-dark hover:text-paper"><MoreHorizontal size={18} /></button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8 h-fit">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-[color:var(--teal)]" />
            <div className="eyebrow text-[color:var(--teal)]">Resources</div>
          </div>
          <h3 className="serif text-xl font-semibold mb-5">Study tools</h3>
          <div className="space-y-3">
            {["Choir Quick Reference", "Pitch Guide", "Keyboard Shortcuts"].map((r) => (
              <button key={r} className="w-full rounded-full border border-[color:var(--teal)]/40 bg-[color:var(--bg)]/50 px-4 py-3 text-sm font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal)]/10 transition">
                {r}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
