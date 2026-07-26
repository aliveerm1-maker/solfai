import { s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as ArrowRight, O as Ear, j as CirclePlay, u as ScanLine } from "../_libs/lucide-react.mjs";
import { r as StaffLines, t as AppLayout } from "./StaffLines-xn9fxfO3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-Bf4iUp-2.js
var import_jsx_runtime = require_jsx_runtime();
var TOOLS = [
	{
		icon: ScanLine,
		title: "Start from an analysis",
		body: "Analyze a score to get its key, meter and your part in movable-do solfège, measure by measure.",
		to: "/",
		ready: true,
		cta: "Go to Analyze"
	},
	{
		icon: CirclePlay,
		title: "Measure-by-measure playback",
		body: "Hearing each measure in real rhythm at the written tempo needs an audio engine in this UI, which isn't written yet. The measure data itself is already exact for MusicXML uploads — you can read it under Solfège today.",
		ready: false
	},
	{
		icon: Ear,
		title: "Interval ear training",
		body: "Hear two notes, name the interval, get scored. This needs both playback and a scoring loop here, and there's no backend for it yet — so it stays honest until it's real.",
		ready: false
	}
];
function Practice() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1240px] px-6 pt-14 pb-16",
		"data-testid": "practice-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-12 gap-6 items-end mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Section II · Practice"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 serif-tight text-[52px] md:text-[68px] leading-[0.98] font-medium text-paper",
						children: ["One measure at a time,", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block italic font-light text-[color:var(--gold)]/90",
							children: "until it sings itself."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-12 lg:col-span-4 text-[13px] text-muted-dark leading-relaxed",
					children: "Only the analyze entry point is built here so far. Anything marked in progress is genuinely unfinished — we would rather say so than fake it. No invented streaks, scores or achievements anywhere on this page."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 relative overflow-hidden border border-[color:var(--border-dark)]",
				style: {
					borderRadius: "3px",
					background: "linear-gradient(180deg, var(--bg-2) 0%, var(--bg-3) 100%)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
					className: "absolute left-0 right-0 top-1/2 h-16 w-full -translate-y-1/2",
					opacity: .12
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative divide-y divide-[color:var(--border-dark)]",
					children: TOOLS.map((t) => {
						const Icon = t.icon;
						const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid place-items-center h-12 w-12 border border-[color:var(--border-dark)] bg-[color:var(--bg)]/50 shrink-0",
								style: { borderRadius: "2px" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									size: 18,
									className: t.ready ? "text-[color:var(--gold)]" : "text-muted-dark"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block serif text-[20px] font-medium " + (t.ready ? "text-paper" : "text-muted-dark"),
									children: t.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[12.5px] text-muted-dark mt-1 leading-snug max-w-2xl",
									children: t.body
								})]
							}),
							t.ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)] shrink-0",
								children: [
									t.cta,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 13 })
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-[8.5px] font-bold uppercase tracking-[0.16em] px-2 py-1 border border-[color:var(--border-dark)] text-muted-dark",
								style: { borderRadius: "2px" },
								children: "In progress"
							})
						] });
						return t.ready && t.to ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: t.to,
							className: "group flex items-center gap-5 px-6 md:px-8 py-6 transition-colors hover:bg-[color:var(--bg)]/40",
							"data-testid": "practice-tool",
							children: inner
						}, t.title) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "group flex items-center gap-5 px-6 md:px-8 py-6 transition-colors",
							"data-testid": "practice-tool",
							children: inner
						}, t.title);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-[12px] text-muted-dark",
				children: "Progress tracking (streaks, achievements, session history) will arrive once accounts sync. We removed the placeholder numbers so nothing on this page is fabricated."
			})
		]
	}) });
}
//#endregion
export { Practice as component };
