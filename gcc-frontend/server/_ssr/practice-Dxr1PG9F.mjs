import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { E as Dumbbell, S as Flame, T as Ear, a as Target, d as RotateCcw, i as Trophy, m as Play, o as Star, y as Music2 } from "../_libs/lucide-react.mjs";
import { t as AppLayout } from "./AppLayout-BmG4-j5Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-Dxr1PG9F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DIFFS = [
	"Easy",
	"Medium",
	"Hard"
];
var INTERVALS = [
	"m2",
	"M2",
	"M3",
	"P4",
	"P5",
	"P8"
];
var ACHIEVEMENTS = [
	{
		icon: Music2,
		name: "First Steps",
		note: "Complete your first analysis",
		earned: true
	},
	{
		icon: Target,
		name: "Perfect 10",
		note: "10 perfect practice measures"
	},
	{
		icon: Flame,
		name: "Week Warrior",
		note: "7-day practice streak"
	},
	{
		icon: Music2,
		name: "Interval Master",
		note: "Identify all intervals correctly"
	},
	{
		icon: Dumbbell,
		name: "Dedicated",
		note: "50 practice sessions"
	},
	{
		icon: Star,
		name: "Getting Started",
		note: "10 practice sessions"
	},
	{
		icon: Ear,
		name: "Sharp Ear",
		note: "10 ear training streak"
	},
	{
		icon: Trophy,
		name: "Choir Ready",
		note: "Master all voice parts"
	}
];
function Practice() {
	const [diff, setDiff] = (0, import_react.useState)("Easy");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, {
		title: "Practice",
		subtitle: "Everything stays in rhythm.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "serif text-2xl font-semibold",
						children: "Practice Mode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-dark",
						children: "Work through your part one measure at a time."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 rounded-2xl border-l-4 border-[color:var(--teal)] bg-[color:var(--bg)]/50 p-5 text-sm",
						children: "Play each measure with the piano, then sing it yourself. Load Solfege first in the Analyze section."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "pill",
							style: {
								background: "color-mix(in oklab, var(--teal) 25%, transparent)",
								color: "var(--paper)",
								border: "1px solid color-mix(in oklab, var(--teal) 40%, transparent)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 14 }), " Start Practice"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-dark",
							children: "Analyze a piece and generate Solfege first."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-[color:var(--border-dark)] p-6 lg:p-8",
				style: { background: "linear-gradient(160deg, color-mix(in oklab, oklch(0.55 0.2 300) 22%, var(--bg-2)), var(--bg-2))" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "text-[color:oklch(0.78_0.16_310)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "serif text-xl font-semibold",
							children: "Interval Ear Training"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-dark",
						children: "Listen to two notes and identify the interval. Train your ear progressively."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "pill",
								style: {
									background: "linear-gradient(135deg, oklch(0.72 0.18 310), oklch(0.62 0.20 285))",
									color: "var(--paper)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 14 }), " Play Interval"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "pill",
								style: {
									background: "var(--bg)",
									color: "var(--paper)",
									border: "1px solid var(--border-dark)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 14 }), " Replay"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-2 flex rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg)]/60 p-1",
								children: DIFFS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setDiff(d),
									className: "px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition " + (d === diff ? "bg-[color:var(--teal)] text-[color:var(--ink)]" : "text-muted-dark"),
									children: d
								}, d))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] uppercase tracking-[0.22em] text-muted-dark mb-3",
							children: "Pick the interval:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 sm:grid-cols-6 gap-2",
							children: INTERVALS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "rounded-xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/50 py-3 font-semibold hover:border-[color:var(--teal)]/60 transition",
								children: n
							}, n))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex gap-8 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Correct: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[color:var(--teal)] serif text-xl font-semibold ml-1",
								children: "1"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Total: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[color:var(--teal)] serif text-xl font-semibold ml-1",
								children: "6"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Streak: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[color:var(--teal)] serif text-xl font-semibold ml-1",
								children: "0"
							})] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow eyebrow-dot text-[color:var(--teal)] mb-4",
					children: "Achievements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3",
					children: ACHIEVEMENTS.map(({ icon: Icon, name, note, earned }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border p-4 text-center " + (earned ? "border-[color:var(--teal)]/50 bg-[color:var(--bg-2)]/70" : "border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/40 opacity-70"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mx-auto mb-2 " + (earned ? "text-[color:var(--teal)]" : "text-muted-dark") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold",
								children: name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-dark mt-1 leading-snug",
								children: note
							})
						]
					}, name))
				})]
			})
		]
	});
}
//#endregion
export { Practice as component };
