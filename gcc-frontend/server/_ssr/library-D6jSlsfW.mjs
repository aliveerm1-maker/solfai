import { s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as ScanLine } from "../_libs/lucide-react.mjs";
import { r as StaffLines, t as AppLayout } from "./StaffLines-xn9fxfO3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-D6jSlsfW.js
var import_jsx_runtime = require_jsx_runtime();
var bronze_material_default = "/assets/bronze_material-Ca4AnOB5.png";
var RESOURCES = [
	{
		name: "Pitch guide & keyboard",
		meta: "Play any pitch, hear intervals",
		asset: "01"
	},
	{
		name: "Choir quick reference",
		meta: "Solfège syllables & cheat sheet",
		asset: "02"
	},
	{
		name: "Transpose a part",
		meta: "Move your line to a new key",
		asset: "03"
	}
];
function LibraryPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1240px] px-6 pt-14 pb-16",
		"data-testid": "library-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-12 gap-6 items-end mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Section IV · Library"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 serif-tight text-[52px] md:text-[68px] leading-[0.98] font-medium text-paper",
						children: ["Every piece you read,", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block italic font-light text-[color:var(--gold)]/90",
							children: "catalogued and waiting."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-12 lg:col-span-4 text-[13px] text-muted-dark leading-relaxed",
					children: "A synced, per-account library is on the way — it'll store each analysis so you can reopen its solfège and practice tools. It's genuinely empty until then; no placeholder pieces."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 grid grid-cols-12 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-12 xl:col-span-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden border border-[color:var(--border-dark)] px-8 py-14 text-center",
						style: {
							borderRadius: "3px",
							background: "linear-gradient(180deg, var(--bg-2) 0%, var(--bg-3) 100%)"
						},
						"data-testid": "library-empty",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
							className: "absolute left-0 right-0 top-1/2 h-16 w-full -translate-y-1/2",
							opacity: .12
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)] justify-center",
									children: "Recent analyses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-4 serif text-[30px] font-medium text-paper",
									children: "No saved pieces yet"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 mx-auto max-w-md text-[13px] text-muted-dark leading-relaxed",
									children: "Saved pieces need per-account storage, which isn't built yet. Analyze a score and it will show up here once account sync ships — nothing is stored between visits today."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 flex flex-wrap items-center justify-center gap-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/",
										"data-testid": "library-analyze",
										className: "inline-flex items-center gap-2 px-5 h-10 text-[11.5px] font-bold uppercase tracking-[0.18em]",
										style: {
											background: "var(--gold)",
											color: "var(--ink)",
											borderRadius: "2px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { size: 14 }), " Analyze a score"]
									})
								})
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "col-span-12 xl:col-span-4 space-y-6",
					"data-testid": "resources-rail",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden border border-[color:var(--border-gold)]",
						style: { borderRadius: "3px" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: bronze_material_default,
								alt: "",
								"aria-hidden": true,
								className: "h-40 w-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0",
								style: { background: "linear-gradient(180deg, transparent 40%, var(--bg) 100%)" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute bottom-4 left-5 right-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
									children: "Study tools"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 serif text-[22px] font-medium text-paper leading-tight",
									children: "Field guides for the singer."
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: RESOURCES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-testid": `resource-${r.asset}`,
						className: "w-full flex items-center gap-4 py-4 border-b border-[color:var(--border-dark)] px-2 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono-cap text-[11px] text-[color:var(--gold)]/60",
								children: r.asset
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif text-[16px] font-medium text-muted-dark",
									children: r.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11.5px] text-muted-dark/70",
									children: r.meta
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-[8.5px] font-bold uppercase tracking-[0.16em] px-2 py-1 border border-[color:var(--border-dark)] text-muted-dark",
								style: { borderRadius: "2px" },
								children: "In progress"
							})
						]
					}, r.name)) })]
				})]
			})
		]
	}) });
}
//#endregion
export { LibraryPage as component };
