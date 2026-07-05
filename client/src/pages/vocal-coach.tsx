import { Mic, Video, Waves } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

export default function VocalCoach() {
  return (
    <AppLayout title="Vocal Coach" subtitle="Record yourself and get professional-level feedback.">
      <div className="rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8">
        <h2 className="serif text-2xl font-semibold">Vocal Coach</h2>
        <p className="text-sm text-muted-dark">Record yourself and get professional-level feedback.</p>

        <div className="mt-5 rounded-2xl border-l-4 border-[color:oklch(0.68_0.20_25)] bg-[color:var(--bg)]/50 p-5 text-sm">
          <span className="text-[color:oklch(0.78_0.18_28)] font-semibold">Record yourself singing,</span> then get detailed feedback from Solfai acting as a professional choir director. Works best with 5–30 seconds of clear singing.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="pill" style={{ background: "linear-gradient(135deg, oklch(0.68 0.20 25), oklch(0.55 0.22 20))", color: "var(--paper)" }}>
            <Mic size={14} /> Record
          </button>
          <button className="pill" style={{ background: "var(--bg)", color: "var(--paper)", border: "1px solid var(--border-dark)" }}>
            <Video size={14} /> Video Record
          </button>
        </div>

        <div className="mt-8">
          <div className="eyebrow eyebrow-dot text-[color:var(--teal)] mb-3">Past Recordings</div>
          <div className="rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/40 p-5 flex items-center gap-4">
            <span className="grid place-items-center h-10 w-10 rounded-full bg-[color:var(--bg-2)]"><Waves size={16} className="text-[color:var(--teal)]" /></span>
            <div>
              <div className="font-semibold">Unknown</div>
              <div className="text-xs text-muted-dark">7/4/2026</div>
            </div>
            <div className="ml-auto h-1 w-40 rounded-full bg-[color:var(--bg-2)] overflow-hidden">
              <div className="h-full w-2/3 bg-[color:var(--teal)]/60" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
