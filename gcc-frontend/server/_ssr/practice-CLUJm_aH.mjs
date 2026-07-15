import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { C as Music2, R as ChevronRight, T as Metronome, b as Pause, h as RotateCcw, n as Waves, r as Volume2, v as Play, z as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as StaffLines, t as AppLayout } from "./StaffLines-BwQzv5RY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-CLUJm_aH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MetIcon = Metronome ?? Music2;
var MEASURES = [
	{
		n: 1,
		notes: [
			"Do",
			"Re",
			"Mi",
			"Fa"
		],
		difficulty: 1
	},
	{
		n: 2,
		notes: [
			"Sol",
			"La",
			"Sol",
			"Fa"
		],
		difficulty: 1
	},
	{
		n: 3,
		notes: [
			"Mi",
			"Re",
			"Do",
			"—"
		],
		difficulty: 1
	},
	{
		n: 4,
		notes: [
			"Do",
			"Mi",
			"Sol",
			"Do'"
		],
		difficulty: 2
	},
	{
		n: 5,
		notes: [
			"Ti",
			"La",
			"Sol",
			"Fa"
		],
		difficulty: 2
	},
	{
		n: 6,
		notes: [
			"Mi",
			"Fi",
			"Sol",
			"—"
		],
		difficulty: 3
	},
	{
		n: 7,
		notes: [
			"La",
			"Ti",
			"Do'",
			"Re'"
		],
		difficulty: 3
	},
	{
		n: 8,
		notes: [
			"Do'",
			"Ti",
			"La",
			"Sol"
		],
		difficulty: 2
	}
];
var DRILLS = [
	{
		name: "Melodic minor scale · G",
		meta: "3 min · warm-up",
		state: "queued"
	},
	{
		name: "Interval drill · tritone vs P5",
		meta: "4 min · adaptive",
		state: "in progress"
	},
	{
		name: "Rhythm dictation · 4/4",
		meta: "5 min · quarter + eighth",
		state: "queued"
	},
	{
		name: "Solfège phrase loops · mm. 34–52",
		meta: "8 min · Speak the Truth",
		state: "up next"
	}
];
function Practice() {
	const [current, setCurrent] = (0, import_react.useState)(4);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [tempo, setTempo] = (0, import_react.useState)(76);
	const measure = MEASURES[current - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1240px] px-6 pt-14 pb-16",
		"data-testid": "practice-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-12 gap-6 items-end mb-10",
				"data-testid": "practice-masthead",
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
					className: "col-span-12 lg:col-span-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[13px] text-muted-dark leading-relaxed",
						children: "Play each measure with the reference piano, then sing it back. Solfai listens, marks the ones you nail and loops the ones you don't."
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 relative",
				"data-testid": "score-strip",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark",
						children: "Score · Tenor · Speak the Truth"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mono-cap text-[11px] text-muted-dark",
						children: [
							"Measure ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-paper",
								children: String(current).padStart(2, "0")
							}),
							" / 118"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative overflow-hidden border border-[color:var(--border-dark)]",
					style: {
						borderRadius: "3px",
						background: "linear-gradient(180deg, var(--bg-2) 0%, var(--bg-3) 100%)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 pointer-events-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
							className: "absolute left-0 right-0 top-6 h-16 w-full",
							opacity: .16,
							strokeWidth: .8
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
							className: "absolute left-0 right-0 bottom-6 h-16 w-full",
							opacity: .1,
							strokeWidth: .8
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative flex items-stretch gap-px overflow-x-auto no-scrollbar",
						"data-testid": "measure-track",
						children: MEASURES.map((m) => {
							const active = m.n === current;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setCurrent(m.n),
								"data-testid": `measure-${m.n}`,
								className: "group relative shrink-0 w-[168px] flex flex-col items-start justify-between px-5 py-5 border-r border-[color:var(--border-dark)] transition-colors " + (active ? "bg-[color:var(--bg)]/60" : "hover:bg-[color:var(--bg)]/40"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 w-full",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mono-cap text-[10.5px] uppercase tracking-[0.22em] " + (active ? "text-[color:var(--gold)]" : "text-muted-dark"),
												children: ["m. ", String(m.n).padStart(2, "0")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 h-px bg-[color:var(--border-dark)]" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex gap-[3px]",
												children: [
													1,
													2,
													3
												].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-1 rounded-full " + (d <= m.difficulty ? "bg-[color:var(--gold)]" : "bg-[color:var(--border-dark)]") }, d))
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-6 grid grid-cols-4 gap-1 w-full",
										children: m.notes.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "serif text-[22px] leading-none font-medium text-center " + (n === "—" ? "text-muted-dark/40" : active ? "text-paper" : "text-paper/70"),
											children: n === "—" ? "—" : n
										}, i))
									}),
									active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0 bottom-0 h-[2px] bg-[color:var(--gold)]" })
								]
							}, m.n);
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid grid-cols-12 gap-6",
				"data-testid": "focus-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-8 relative overflow-hidden border border-[color:var(--border-gold)]",
					style: {
						borderRadius: "3px",
						background: "linear-gradient(160deg, var(--bg-3) 0%, var(--bg-2) 60%, var(--bg-2) 100%)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute -right-24 -top-24 h-64 w-64 opacity-40 pointer-events-none",
						style: { background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 45%, transparent), transparent 65%)" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative p-8 lg:p-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
									children: "Focus measure"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "4/4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "opacity-40",
											children: "·"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [tempo, " bpm"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "opacity-40",
											children: "·"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "E♭ major" })
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex items-baseline gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "serif italic text-[80px] leading-[0.9] font-light text-[color:var(--gold)]",
									children: ["m.", String(current).padStart(2, "0")]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[13px] text-muted-dark",
									children: "of 118"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 relative",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-4 gap-2",
									"data-testid": "focus-solfege",
									children: measure.notes.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative border border-[color:var(--border-dark)] bg-[color:var(--bg)]/50 py-6 text-center " + (n === "—" ? "opacity-40" : ""),
										style: { borderRadius: "2px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[9.5px] uppercase tracking-[0.28em] text-muted-dark mb-1",
											children: ["beat ", i + 1]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "serif text-[38px] font-medium text-paper leading-none",
											children: n === "—" ? "rest" : n
										})]
									}, i))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap items-center gap-3",
								"data-testid": "playback-controls",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCurrent((c) => Math.max(1, c - 1)),
										"data-testid": "prev-measure",
										className: "grid h-11 w-11 place-items-center border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/40 transition-colors",
										style: { borderRadius: "2px" },
										"aria-label": "Previous measure",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 16 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setPlaying((p) => !p),
										"data-testid": "play-toggle",
										className: "inline-flex items-center gap-2 h-11 px-6 text-[12px] font-bold uppercase tracking-[0.22em]",
										style: {
											background: "var(--gold)",
											color: "var(--ink)",
											borderRadius: "2px"
										},
										children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 14 }), " Pause"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 14 }), " Play measure"] })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCurrent((c) => Math.min(MEASURES.length, c + 1)),
										"data-testid": "next-measure",
										className: "grid h-11 w-11 place-items-center border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/40 transition-colors",
										style: { borderRadius: "2px" },
										"aria-label": "Next measure",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 16 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-2 h-6 w-px bg-[color:var(--border-dark)]" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										"data-testid": "loop-measure",
										className: "inline-flex items-center gap-2 h-11 px-4 text-[11.5px] font-semibold uppercase tracking-[0.22em] border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/40 transition-colors",
										style: { borderRadius: "2px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 13 }), " Loop"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										"data-testid": "metronome-toggle",
										className: "inline-flex items-center gap-2 h-11 px-4 text-[11.5px] font-semibold uppercase tracking-[0.22em] border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/40 transition-colors",
										style: { borderRadius: "2px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetIcon, { size: 13 }), " Click"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "ml-auto flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 12 }), " reference piano"]
									})
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-4 space-y-5",
					"data-testid": "right-rail",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative border border-[color:var(--border-dark)] p-6",
						style: {
							borderRadius: "3px",
							background: "var(--bg-2)"
						},
						"data-testid": "tempo-panel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
								children: "Tempo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-baseline gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "serif text-[64px] leading-none font-medium text-paper mono-cap",
									children: tempo
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] uppercase tracking-[0.28em] text-muted-dark",
									children: "bpm"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 40,
								max: 180,
								value: tempo,
								onChange: (e) => setTempo(Number(e.target.value)),
								"data-testid": "tempo-slider",
								className: "mt-6 w-full accent-[color:var(--gold)]"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex justify-between text-[10px] uppercase tracking-[0.22em] text-muted-dark mono-cap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "40" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-paper/70",
										children: "score · 76"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "180" })
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative border border-[color:var(--border-dark)]",
						style: {
							borderRadius: "3px",
							background: "var(--bg-2)"
						},
						"data-testid": "drills-queue",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-5 pt-5 pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
								children: "Today's queue"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono-cap text-[10.5px] text-muted-dark",
								children: "4 items"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-[color:var(--border-dark)]",
							children: DRILLS.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "group flex items-center gap-3 px-5 py-3 hover:bg-[color:var(--bg)]/40 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mono-cap text-[10px] text-muted-dark w-6",
										children: String(i + 1).padStart(2, "0")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[12.5px] font-semibold text-paper truncate",
											children: d.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10.5px] text-muted-dark truncate",
											children: d.meta
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[9.5px] uppercase tracking-[0.22em] px-2 py-0.5 " + (d.state === "in progress" ? "text-[color:var(--gold)] border border-[color:var(--gold)]/50" : d.state === "up next" ? "text-paper/85 border border-[color:var(--border-dark)]" : "text-muted-dark border border-[color:var(--border-dark)]"),
										style: { borderRadius: "2px" },
										children: d.state
									})
								]
							}, d.name))
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				"data-testid": "ear-training-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-12 gap-6 items-end mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-12 lg:col-span-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
							children: "Ear training"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "mt-3 serif-tight text-[32px] md:text-[40px] leading-[1] font-medium text-paper",
							children: ["Two notes. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "italic font-light text-[color:var(--gold)]",
								children: "Name the distance."
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-12 lg:col-span-4 text-[13px] text-muted-dark",
						children: "Adaptive difficulty. Answer wrong and we tighten the interval set until you can hear it."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative border border-[color:var(--border-dark)] overflow-hidden",
					style: {
						borderRadius: "3px",
						background: "linear-gradient(160deg, color-mix(in oklab, var(--bg-3) 92%, oklch(0.4 0.14 300) 8%), var(--bg-2))"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-12 gap-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 md:col-span-5 p-8 md:p-10 border-r border-[color:var(--border-dark)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10.5px] uppercase tracking-[0.28em] text-muted-dark",
									children: "Current interval"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 serif italic text-[72px] leading-none text-[color:var(--gold)] font-light",
									children: "?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-dark",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waves, { size: 12 }), " ready · press play"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										"data-testid": "ear-play",
										className: "inline-flex items-center gap-2 h-11 px-5 text-[11.5px] font-bold uppercase tracking-[0.22em]",
										style: {
											background: "var(--gold)",
											color: "var(--ink)",
											borderRadius: "2px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 13 }), " Play interval"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										"data-testid": "ear-replay",
										className: "inline-flex items-center gap-2 h-11 px-4 text-[11.5px] font-semibold uppercase tracking-[0.22em] border border-[color:var(--border-dark)] text-muted-dark hover:text-paper transition-colors",
										style: { borderRadius: "2px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 13 }), " Replay"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-8 grid grid-cols-3 gap-px bg-[color:var(--border-dark)]",
									children: [
										{
											k: "Correct",
											v: "1",
											accent: true
										},
										{
											k: "Total",
											v: "6",
											accent: false
										},
										{
											k: "Streak",
											v: "0",
											accent: false
										}
									].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-[color:var(--bg-2)] p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[9.5px] uppercase tracking-[0.24em] text-muted-dark",
											children: s.k
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 serif text-[26px] leading-none font-medium " + (s.accent ? "text-[color:var(--gold)]" : "text-paper"),
											children: s.v
										})]
									}, s.k))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 md:col-span-7 p-8 md:p-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow text-muted-dark mb-4",
									children: "Your guess"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-3 gap-2",
									"data-testid": "interval-answers",
									children: [
										"m2",
										"M2",
										"m3",
										"M3",
										"P4",
										"TT",
										"P5",
										"m6",
										"M6",
										"m7",
										"M7",
										"P8"
									].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										"data-testid": `interval-${n}`,
										className: "group relative border border-[color:var(--border-dark)] bg-[color:var(--bg)]/40 py-5 hover:border-[color:var(--gold)]/50 hover:bg-[color:var(--bg)]/60 transition-colors",
										style: { borderRadius: "2px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "serif text-[24px] font-medium text-paper",
											children: n
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[9.5px] uppercase tracking-[0.24em] text-muted-dark mt-0.5 opacity-70",
											children: n === "TT" ? "tritone" : n.startsWith("P") ? "perfect" : n.startsWith("M") ? "major" : "minor"
										})]
									}, n))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-[color:var(--gold)] shadow-[0_0_8px_var(--gold)]" }), "Difficulty · Easy · ascending only"]
								})
							]
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				"data-testid": "achievements-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Achievements"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono-cap text-[10.5px] text-muted-dark",
						children: "3 / 8 earned"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-[color:var(--border-dark)]",
					children: [
						{
							n: "01",
							name: "First Steps",
							note: "Complete your first analysis",
							earned: true
						},
						{
							n: "02",
							name: "Perfect Ten",
							note: "10 perfect practice measures",
							earned: true
						},
						{
							n: "03",
							name: "Week Warrior",
							note: "7-day practice streak",
							earned: true
						},
						{
							n: "04",
							name: "Interval Master",
							note: "Identify all intervals correctly",
							earned: false
						},
						{
							n: "05",
							name: "Dedicated",
							note: "50 practice sessions",
							earned: false
						},
						{
							n: "06",
							name: "Sharp Ear",
							note: "10 ear-training streak",
							earned: false
						},
						{
							n: "07",
							name: "Choir Ready",
							note: "Master all voice parts",
							earned: false
						},
						{
							n: "08",
							name: "Studio Regular",
							note: "100 recordings reviewed",
							earned: false
						}
					].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-testid": `achievement-${a.n}`,
						className: "group flex items-center gap-6 py-4 border-b border-[color:var(--border-dark)] hover:bg-[color:var(--bg-2)]/40 transition-colors px-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mono-cap text-[11px] " + (a.earned ? "text-[color:var(--gold)]" : "text-muted-dark/60"),
								children: a.n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 min-w-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif text-[18px] " + (a.earned ? "text-paper" : "text-paper/50"),
									children: a.name
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[12.5px] " + (a.earned ? "text-muted-dark" : "text-muted-dark/60"),
								children: a.note
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] uppercase tracking-[0.24em] px-2 py-0.5 " + (a.earned ? "text-[color:var(--gold)] border border-[color:var(--gold)]/40" : "text-muted-dark/60 border border-[color:var(--border-dark)]"),
								style: { borderRadius: "2px" },
								children: a.earned ? "earned" : "locked"
							})
						]
					}, a.n))
				})]
			})
		]
	}) });
}
//#endregion
export { Practice as component };
