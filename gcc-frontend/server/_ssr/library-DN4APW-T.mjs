import { s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { M as BookOpen, w as Ellipsis } from "../_libs/lucide-react.mjs";
import { t as AppLayout } from "./AppLayout-BmG4-j5Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-DN4APW-T.js
var import_jsx_runtime = require_jsx_runtime();
var PIECES = [
	{
		title: "Speak the Truth",
		part: "Tenor",
		date: "7/4/2026"
	},
	{
		title: "Speak the Truth",
		part: "Soprano",
		date: "7/4/2026"
	},
	{
		title: "Speak the Truth",
		part: "Soprano",
		date: "7/4/2026"
	},
	{
		title: "Didn't My Lord Deliver Daniel?",
		part: "Soprano",
		date: "7/1/2026"
	},
	{
		title: "Didn't My Lord Deliver Daniel?",
		part: "Tenor",
		date: "7/1/2026"
	},
	{
		title: "Didn't My Lord Deliver Daniel?",
		part: "Soprano",
		date: "6/24/2026"
	}
];
function LibraryPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		title: "Library",
		subtitle: "Everything stays in rhythm.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between mb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow eyebrow-dot text-[color:var(--teal)] mb-2",
							children: "Recent Analyses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "serif text-2xl font-semibold",
							children: "Your saved pieces"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-dark mt-1",
							children: "Review recent analyses and reopen practice resources."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-xs font-semibold text-[color:var(--teal)] uppercase tracking-widest",
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 space-y-3",
					children: PIECES.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-4 rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/40 p-4 hover:border-[color:var(--teal)]/40 transition",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-11 w-11 rounded-lg",
								style: { background: "linear-gradient(135deg, color-mix(in oklab, var(--teal) 30%, transparent), color-mix(in oklab, var(--teal-deep) 30%, transparent))" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif font-semibold truncate",
									children: p.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-dark",
									children: [
										p.part,
										" · ",
										p.date
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "ml-auto text-muted-dark hover:text-paper",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { size: 18 })
							})
						]
					}, i))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8 h-fit",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
							size: 16,
							className: "text-[color:var(--teal)]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow text-[color:var(--teal)]",
							children: "Resources"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "serif text-xl font-semibold mb-5",
						children: "Study tools"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: [
							"Choir Quick Reference",
							"Pitch Guide",
							"Keyboard Shortcuts"
						].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "w-full rounded-full border border-[color:var(--teal)]/40 bg-[color:var(--bg)]/50 px-4 py-3 text-sm font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal)]/10 transition",
							children: r
						}, r))
					})
				]
			})]
		})
	});
}
//#endregion
export { LibraryPage as component };
