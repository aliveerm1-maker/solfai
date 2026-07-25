import { s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Ear, I as ArrowRight, N as CirclePlay, d as ScanLine } from "../_libs/lucide-react.mjs";
import { r as StaffLines, t as AppLayout } from "./StaffLines-DCfF9t-v.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-uzApWoAu.js
var import_jsx_runtime = require_jsx_runtime();
var TOOLS = [
	{
		icon: CirclePlay,
		title: "Measure-by-measure practice",
		body: "Play each measure of your part in real rhythm and tempo, loop the tricky spots, and slow it down for practice. Upload a MusicXML score and press Play.",
		to: "/classic",
		classic: true,
		cta: "Open in Classic Studio"
	},
	{
		icon: Ear,
		title: "Interval ear training",
		body: "Hear two notes and name the interval, with adaptive difficulty. Runs in the Classic Studio today.",
		to: "/classic",
		classic: true,
		cta: "Open in Classic Studio"
	},
	{
		icon: ScanLine,
		title: "Start from an analysis",
		body: "Analyze a score first to generate its solfège, then practice it note by note.",
		to: "/",
		classic: false,
		cta: "Go to Analyze"
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
					children: "Practice tools are moving into this studio. Everything below is real and working today — it just opens in the Classic Studio for now. No invented streaks, scores or achievements here."
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
									className: "text-[color:var(--gold)]"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block serif text-[20px] font-medium text-paper",
									children: t.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[12.5px] text-muted-dark mt-1 leading-snug max-w-2xl",
									children: t.body
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden sm:inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)] shrink-0",
								children: [
									t.cta,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 13 })
								]
							})
						] });
						const cls = "group flex items-center gap-5 px-6 md:px-8 py-6 hover:bg-[color:var(--bg)]/40 transition-colors";
						return t.classic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: t.to,
							className: cls,
							"data-testid": "practice-tool",
							children: inner
						}, t.title) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: t.to,
							className: cls,
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
