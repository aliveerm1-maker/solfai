import { Link, useLocation } from "react-router-dom";
import { Plus, Search, Library as LibIcon, PlayCircle, Mic, Music, Settings, ChevronDown, PanelLeft, Command, Flame, LogOut } from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { Equalizer } from "@/components/Equalizer";
import { useAuth } from "@/lib/auth";

type NavItem = { to: "/" | "/library" | "/practice" | "/vocal-coach"; label: string; icon: typeof Plus; primary?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "New analysis", icon: Plus, primary: true },
  { to: "/library", label: "Search library", icon: Search },
  { to: "/library", label: "Library", icon: LibIcon },
  { to: "/practice", label: "Practice", icon: PlayCircle },
  { to: "/vocal-coach", label: "Vocal Coach", icon: Mic },
];

const RECENTS = [
  "Speak the Truth — Tenor",
  "Didn't My Lord Deliver Daniel?",
  "Ave Verum Corpus — Alto",
  "Sicut Cervus warm-up",
  "Interval drill · P5s",
];

export function ClefMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 500" className={className} aria-hidden>
      <defs>
        <linearGradient id="clefMarkGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.93 0.11 82)" />
          <stop offset=".55" stopColor="oklch(0.78 0.15 68)" />
          <stop offset="1" stopColor="oklch(0.52 0.12 55)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#clefMarkGold)"
        fillRule="evenodd"
        d="M 108 8 C 88 8 72 27 72 51 C 72 71 82 92 93 111 C 68 132 40 158 40 197 C 40 236 68 264 106 269 L 116 341 C 118 351 118 361 116 370 C 112 388 96 400 78 400 C 60 400 46 386 46 368 C 46 356 54 346 66 342 C 60 332 56 322 60 310 C 40 316 26 336 26 360 C 26 390 52 414 84 414 C 116 414 142 390 142 358 C 142 352 141 346 140 340 L 128 264 C 156 258 178 234 178 204 C 178 178 160 158 138 152 L 133 122 C 152 100 168 76 168 50 C 168 27 152 8 132 8 Z M 120 44 C 129 44 136 52 136 62 C 136 78 126 96 112 112 L 108 84 C 106 68 110 44 120 44 Z M 116 176 L 126 240 C 143 236 155 222 155 204 C 155 188 138 176 116 176 Z M 104 176 C 86 178 72 190 72 208 C 72 226 86 240 104 240 C 106 240 108 240 110 240 L 100 176 Z"
      />
    </svg>
  );
}

function ProgressRing({ value, size = 34 }: { value: number; size?: number }) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="color-mix(in oklab, white 8%, transparent)" strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--teal)" strokeWidth={3} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value/100)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--teal) 70%, transparent))" }} />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="var(--paper)">{value}</text>
    </svg>
  );
}

export function AppLayout({ children, contentClassName = "", title, subtitle }: { children: ReactNode; contentClassName?: string; title?: string; subtitle?: string }) {
  const pathname = useLocation().pathname;
  const [open, setOpen] = useState(true);
  const { user, signIn, signOut, renderButton, googleReady, clientId } = useAuth();
  const signInRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user && open) renderButton(signInRef.current);
  }, [user, open, googleReady, clientId, renderButton]);

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <div className="min-h-screen bg-bg text-paper flex">
      <CommandPalette />
      <div className="grain" aria-hidden />

      {/* Sidebar */}
      <aside
        className={
          "hidden md:flex shrink-0 flex-col border-r border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/35 backdrop-blur-xl transition-[width] duration-300 " +
          (open ? "w-[260px]" : "w-[68px]")
        }
      >
        <div className="flex items-center gap-2 px-3.5 pt-4 pb-2">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <span className="relative grid place-items-center h-9 w-9 rounded-xl bg-[color:var(--bg)] ring-1 ring-[color:var(--teal)]/25 overflow-hidden">
              <ClefMark className="h-6 w-6" />
              <span className="absolute inset-0 rounded-xl" style={{ background: "radial-gradient(ellipse at 30% 20%, color-mix(in oklab, var(--teal) 30%, transparent), transparent 60%)" }} />
            </span>
            {open && (
              <div className="leading-tight min-w-0">
                <div className="serif text-[15px] font-semibold tracking-tight">Solfai</div>
                <div className="text-[9.5px] uppercase tracking-[0.22em] text-muted-dark truncate">Sight-read studio</div>
              </div>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto grid place-items-center h-8 w-8 rounded-lg text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/60"
            aria-label="Toggle sidebar"
          >
            <PanelLeft size={15} />
          </button>
        </div>

        <nav className="mt-3 px-2 flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon: Icon, primary }, i) => {
            const active = to === "/" ? pathname === "/" : pathname === to;
            return (
              <Link
                key={i}
                to={to}
                title={label}
                className={
                  "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors " +
                  (primary
                    ? "bg-[color:var(--bg)]/60 ring-1 ring-[color:var(--teal)]/30 text-paper hover:bg-[color:var(--bg)]"
                    : active
                    ? "bg-[color:var(--bg)]/70 text-paper"
                    : "text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50")
                }
              >
                <Icon size={16} className={primary ? "text-[color:var(--teal)]" : ""} />
                {open && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {open && (
          <div className="mt-6 px-4">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted-dark mb-2">Recents</div>
            <ul className="space-y-0.5">
              {RECENTS.map((r) => (
                <li key={r}>
                  <button className="w-full text-left rounded-md px-2 py-1.5 text-[12.5px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50 truncate">
                    {r}
                  </button>
                </li>
              ))}
            </ul>

            {/* Today's practice mini card */}
            <div className="mt-5 rounded-xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/50 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-dark">
                <Flame size={11} className="text-[color:var(--teal)]" /> Today
              </div>
              <div className="mt-2 flex items-center gap-3">
                <ProgressRing value={68} />
                <div className="leading-tight">
                  <div className="serif text-[15px] font-semibold text-paper">17 min</div>
                  <div className="text-[10.5px] text-muted-dark">of 25 goal</div>
                </div>
              </div>
              <div className="mt-2.5 text-[10.5px] text-muted-dark">3 drills · 1 recording</div>
            </div>
          </div>
        )}

        <div className="mt-auto p-3">
          <button onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className={"w-full mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50 transition " + (open ? "" : "justify-center")}>
            <Command size={13} />
            {open && <><span>Quick actions</span><kbd className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[color:var(--border-dark)]">⌘K</kbd></>}
          </button>
          {user ? (
            <div className={"w-full flex items-center gap-3 rounded-xl px-2.5 py-2 " + (open ? "" : "justify-center")}>
              {user.picture ? (
                <img src={user.picture} alt="" referrerPolicy="no-referrer"
                     className="h-8 w-8 rounded-full ring-1 ring-[color:var(--border-dark)]" />
              ) : (
                <span className="grid place-items-center h-8 w-8 rounded-full text-[11px] font-semibold text-[color:var(--ink)]"
                      style={{ background: "linear-gradient(135deg, oklch(0.82 0.14 78), oklch(0.65 0.15 55))" }}>{initials}</span>
              )}
              {open && (
                <>
                  <div className="min-w-0 text-left leading-tight flex-1">
                    <div className="text-[13px] font-semibold truncate">{user.name}</div>
                    <div className="text-[10.5px] text-muted-dark truncate">{user.email}</div>
                  </div>
                  <button onClick={signOut} title="Sign out" aria-label="Sign out"
                          className="grid place-items-center h-7 w-7 rounded-lg text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/60 transition">
                    <LogOut size={14} />
                  </button>
                </>
              )}
            </div>
          ) : open ? (
            clientId ? (
              // Official Google Sign-In button (renders when a client id is configured)
              <div ref={signInRef} className="flex justify-center min-h-[40px]" />
            ) : (
              <button onClick={signIn}
                      className="w-full flex items-center justify-center gap-2 rounded-full border border-[color:var(--border-dark)] px-3 py-2 text-[12px] font-semibold text-muted-dark hover:text-paper hover:border-[color:var(--teal)]/50 transition">
                <Music size={13} className="text-[color:var(--teal)]" /> Sign in with Google
              </button>
            )
          ) : (
            <button onClick={signIn} title="Sign in" aria-label="Sign in"
                    className="w-full grid place-items-center rounded-xl px-2.5 py-2 hover:bg-[color:var(--bg)]/60 transition">
              <Settings size={16} className="text-muted-dark" />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Floating island top bar */}
        <header className="sticky top-4 z-30 mx-auto mt-4 flex items-center gap-2 px-2 py-1.5 pl-4 rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/75 backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7),0_0_0_1px_color-mix(in_oklab,var(--teal)_10%,transparent)]"
                style={{ width: "min(760px, calc(100% - 2.5rem))" }}>
          <span className="absolute -inset-px rounded-full pointer-events-none opacity-60"
                style={{ background: "radial-gradient(ellipse at 20% 0%, color-mix(in oklab, var(--teal) 18%, transparent), transparent 55%)" }} />
          <button className="relative flex items-center gap-2 rounded-full px-2 py-1 text-sm hover:bg-[color:var(--bg)]/40 transition">
            <Music size={14} className="text-[color:var(--teal)]" />
            <span className="serif font-semibold tracking-tight">Solfai</span>
            <ChevronDown size={13} className="text-muted-dark" />
          </button>
          <span className="relative h-4 w-px bg-[color:var(--border-dark)] mx-1" />
          <div className="relative hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-dark">
            <Equalizer bars={4} />
            <span>Live session</span>
          </div>
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="relative ml-2 hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/40 transition"
            aria-label="Open command palette"
          >
            <Search size={12} />
            <span className="normal-case tracking-normal">Search</span>
            <kbd className="text-[9.5px] font-semibold px-1 py-0.5 rounded border border-[color:var(--border-dark)]">⌘K</kbd>
          </button>
          <div className="relative ml-auto flex items-center gap-1.5">
            <button className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/40 transition">
              Share
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest shadow-[0_8px_24px_-8px_var(--teal)]"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-deep))", color: "var(--ink)" }}
            >
              Upgrade
            </button>
          </div>
        </header>

        {(title || subtitle) && (
          <div className="px-5 lg:px-10 pt-8 pb-2 border-b border-[color:var(--border-dark)]/60">
            {title && <h1 className="serif text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>}
            {subtitle && <p className="mt-1.5 text-sm text-muted-dark">{subtitle}</p>}
          </div>
        )}
        <div className={"flex-1 min-w-0 " + ((title || subtitle) ? "px-5 lg:px-10 py-8 " : "") + contentClassName}>{children}</div>
      </main>
    </div>
  );
}
