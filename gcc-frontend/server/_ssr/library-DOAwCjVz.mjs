import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Funnel, B as ArrowRight, D as List, N as Ellipsis, k as Grid2x2, l as Star, p as Search, v as Play } from "../_libs/lucide-react.mjs";
import { n as StaffLines, t as AppLayout } from "./StaffLines-BwQzv5RY.mjs";
import { n as parchment_texture_default, t as bronze_material_default } from "./bronze_material-Dk6Ht3dD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-DOAwCjVz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PIECES = [
	{
		id: 1,
		title: "Speak the Truth",
		composer: "Andrea Ramsey",
		part: "Tenor",
		key: "E♭",
		meter: "4/4",
		bpm: 76,
		date: "Jul 4, 2026",
		status: "in progress",
		starred: true
	},
	{
		id: 2,
		title: "Speak the Truth",
		composer: "Andrea Ramsey",
		part: "Soprano",
		key: "E♭",
		meter: "4/4",
		bpm: 76,
		date: "Jul 4, 2026",
		status: "in progress"
	},
	{
		id: 3,
		title: "Didn't My Lord Deliver Daniel?",
		composer: "Trad. spiritual",
		part: "Soprano",
		key: "d min",
		meter: "12/8",
		bpm: 108,
		date: "Jul 1, 2026",
		status: "mastered",
		starred: true
	},
	{
		id: 4,
		title: "Didn't My Lord Deliver Daniel?",
		composer: "Trad. spiritual",
		part: "Tenor",
		key: "d min",
		meter: "12/8",
		bpm: 108,
		date: "Jul 1, 2026",
		status: "mastered"
	},
	{
		id: 5,
		title: "Ave Verum Corpus",
		composer: "W. A. Mozart",
		part: "Alto",
		key: "D",
		meter: "3/4",
		bpm: 60,
		date: "Jun 24, 2026",
		status: "queued"
	},
	{
		id: 6,
		title: "Sicut Cervus",
		composer: "Palestrina",
		part: "SATB",
		key: "F",
		meter: "cut",
		bpm: 72,
		date: "Jun 20, 2026",
		status: "queued",
		starred: true
	},
	{
		id: 7,
		title: "The Road Home",
		composer: "Stephen Paulus",
		part: "Alto",
		key: "G",
		meter: "4/4",
		bpm: 68,
		date: "Jun 12, 2026",
		status: "in progress"
	}
];
var RESOURCES = [
	{
		name: "Choir quick reference",
		meta: "Solfège syllables, cheat sheet",
		asset: "01"
	},
	{
		name: "Pitch guide",
		meta: "Interval singing patterns",
		asset: "02"
	},
	{
		name: "Keyboard shortcuts",
		meta: "Fly through Solfai",
		asset: "03"
	}
];
function LibraryPage() {
	const [view, setView] = (0, import_react.useState)("list");
	const [q, setQ] = (0, import_react.useState)("");
	const filtered = PIECES.filter((p) => (p.title + " " + p.composer + " " + p.part).toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1240px] px-6 pt-14 pb-16",
		"data-testid": "library-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-12 gap-6 items-end mb-10",
				"data-testid": "library-masthead",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Section IV · Library"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 serif-tight text-[52px] md:text-[68px] leading-[0.98] font-medium text-paper",
						children: ["Every piece you've read,", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block italic font-light text-[color:var(--gold)]/90",
							children: "catalogued and waiting."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-12 lg:col-span-4 text-[13px] text-muted-dark leading-relaxed",
					children: "Reopen any analysis to jump back into practice mode — same voice part, same key, same measure you left off."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 flex flex-wrap items-center gap-3",
				"data-testid": "library-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-[260px] flex items-center gap-3 border border-[color:var(--border-dark)] bg-[color:var(--bg-2)] px-4 h-11",
						style: { borderRadius: "2px" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								size: 14,
								className: "text-muted-dark"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search titles, composers, or parts…",
								"data-testid": "library-search",
								className: "flex-1 bg-transparent text-[13px] placeholder:text-muted-dark focus:outline-none"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "text-[9.5px] font-semibold mono-cap px-1.5 py-0.5 border border-[color:var(--border-dark)] text-muted-dark",
								children: "⌘K"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						"data-testid": "filter-button",
						className: "inline-flex items-center gap-2 h-11 px-4 text-[11.5px] font-semibold uppercase tracking-[0.22em] border border-[color:var(--border-dark)] text-muted-dark hover:text-paper transition-colors",
						style: { borderRadius: "2px" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { size: 13 }), " Filter"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-px overflow-hidden border border-[color:var(--border-dark)]",
						style: { borderRadius: "2px" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setView("list"),
							"data-testid": "view-list",
							className: "grid h-11 w-11 place-items-center transition-colors " + (view === "list" ? "bg-[color:var(--bg-3)] text-paper" : "bg-[color:var(--bg-2)] text-muted-dark hover:text-paper"),
							"aria-label": "List view",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { size: 14 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setView("grid"),
							"data-testid": "view-grid",
							className: "grid h-11 w-11 place-items-center transition-colors " + (view === "grid" ? "bg-[color:var(--bg-3)] text-paper" : "bg-[color:var(--bg-2)] text-muted-dark hover:text-paper"),
							"aria-label": "Grid view",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid2x2, { size: 14 })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 grid grid-cols-12 gap-6",
				"data-testid": "library-content",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 xl:col-span-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "eyebrow text-muted-dark",
							children: [
								"Recent analyses · ",
								filtered.length,
								" pieces"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
							children: "sorted by date"
						})]
					}), view === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "border-t border-[color:var(--border-dark)]",
						"data-testid": "library-list",
						children: filtered.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "group grid grid-cols-12 items-center gap-4 py-4 border-b border-[color:var(--border-dark)] px-2 hover:bg-[color:var(--bg-2)]/40 transition-colors",
							"data-testid": `piece-${p.id}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "col-span-1 mono-cap text-[11px] text-muted-dark",
									children: String(i + 1).padStart(2, "0")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [p.starred && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											size: 12,
											className: "text-[color:var(--gold)]",
											fill: "currentColor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "serif text-[19px] font-medium text-paper truncate",
											children: p.title
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11.5px] text-muted-dark mt-0.5 italic",
										children: p.composer
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "col-span-1 text-[11px] uppercase tracking-[0.22em] text-muted-dark",
									children: p.part
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2 mono-cap text-[12.5px] text-paper/85",
									children: [
										p.key,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-dark/70",
											children: [
												"· ",
												p.meter,
												" · ",
												p.bpm
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "col-span-2 text-[11px] uppercase tracking-[0.22em]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: p.status === "in progress" ? "text-[color:var(--gold)]" : p.status === "mastered" ? "text-paper" : "text-muted-dark",
										children: p.status
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-1 flex justify-end gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/practice",
										"data-testid": `piece-open-${p.id}`,
										className: "grid h-9 w-9 place-items-center border border-[color:var(--border-dark)] text-muted-dark hover:text-[color:var(--gold)] hover:border-[color:var(--gold)]/45 transition-colors",
										style: { borderRadius: "2px" },
										"aria-label": "Open",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 11 })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "grid h-9 w-9 place-items-center border border-[color:var(--border-dark)] text-muted-dark hover:text-paper transition-colors",
										style: { borderRadius: "2px" },
										"aria-label": "More",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { size: 13 })
									})]
								})
							]
						}, p.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						"data-testid": "library-grid",
						children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-testid": `piece-card-${p.id}`,
							className: "group relative overflow-hidden border border-[color:var(--border-dark)] hover:border-[color:var(--gold)]/45 transition-colors",
							style: {
								borderRadius: "3px",
								background: "var(--bg-2)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-24 overflow-hidden border-b border-[color:var(--border-dark)]",
								style: { background: "linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 100%)" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
										className: "absolute left-0 right-0 top-1/2 h-16 w-full -translate-y-1/2",
										opacity: .24
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute top-2 right-2 flex items-center gap-1",
										children: [p.starred && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
											size: 11,
											className: "text-[color:var(--gold)]",
											fill: "currentColor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono-cap text-[9.5px] uppercase tracking-[0.24em] text-muted-dark",
											children: p.date
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute bottom-2 left-4 serif italic text-[26px] font-light text-[color:var(--gold)]",
										children: p.key
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "serif text-[18px] font-medium text-paper truncate",
										children: p.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11.5px] italic text-muted-dark truncate mt-0.5",
										children: p.composer
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											p.part,
											" · ",
											p.meter
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: p.status === "in progress" ? "text-[color:var(--gold)]" : "",
											children: p.status
										})]
									})
								]
							})]
						}, p.id))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "col-span-12 xl:col-span-4 space-y-6",
					"data-testid": "resources-rail",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: RESOURCES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							"data-testid": `resource-${r.asset}`,
							className: "group w-full flex items-center gap-4 py-4 border-b border-[color:var(--border-dark)] px-2 hover:bg-[color:var(--bg-2)]/50 text-left transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mono-cap text-[11px] text-[color:var(--gold)]",
									children: r.asset
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "serif text-[16px] font-medium text-paper",
										children: r.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11.5px] text-muted-dark",
										children: r.meta
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
									size: 14,
									className: "text-muted-dark group-hover:text-[color:var(--gold)] transition-colors"
								})
							]
						}, r.name)) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden",
							style: { borderRadius: "3px" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: parchment_texture_default,
								alt: "",
								"aria-hidden": true,
								className: "absolute inset-0 h-full w-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative p-6",
								style: {
									background: "linear-gradient(180deg, color-mix(in oklab, var(--cream) 88%, transparent) 0%, color-mix(in oklab, var(--cream-deep) 90%, transparent) 100%)",
									color: "var(--ink)"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow eyebrow-dot text-[color:var(--bronze)]",
										children: "Solfège as second nature"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 serif italic text-[19px] leading-snug font-light text-[color:var(--ink)]",
										children: "\"The syllables aren't crutches. They're the shape of the interval before your voice ever finds it.\""
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 mono-cap text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--ink-soft)]",
										children: "— Section leader's field notes"
									})
								]
							})]
						})
					]
				})]
			})
		]
	}) });
}
//#endregion
export { LibraryPage as component };
