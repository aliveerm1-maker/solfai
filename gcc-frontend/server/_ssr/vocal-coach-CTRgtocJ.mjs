import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { B as ArrowRight, a as Upload, c as TrendingDown, i as Video, r as Volume2, s as TrendingUp, u as Square, v as Play, w as Mic } from "../_libs/lucide-react.mjs";
import { n as StaffLines, t as AppLayout } from "./StaffLines-BwQzv5RY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vocal-coach-CTRgtocJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var choir_ambient_default = "/assets/choir_ambient-BpSitkoo.png";
var PAST = [
	{
		id: 1,
		name: "Speak the Truth — mm. 34–52",
		when: "Today · 14:22",
		grade: 87,
		dur: "0:24"
	},
	{
		id: 2,
		name: "Ave Verum — sustain study",
		when: "Yesterday",
		grade: 74,
		dur: "0:31"
	},
	{
		id: 3,
		name: "Sicut Cervus warm-up",
		when: "Mon",
		grade: 92,
		dur: "0:18"
	},
	{
		id: 4,
		name: "Interval walk · P5 → P4",
		when: "Sun",
		grade: 68,
		dur: "0:12"
	}
];
function VocalCoach() {
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [elapsed] = (0, import_react.useState)(12.4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1240px] px-6 pt-14 pb-16",
		"data-testid": "vocal-coach-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-12 gap-6 items-end mb-10",
				"data-testid": "vocal-masthead",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Section III · Vocal Coach"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 serif-tight text-[52px] md:text-[68px] leading-[0.98] font-medium text-paper",
						children: ["Sing five seconds.", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block italic font-light text-[color:var(--gold)]/90",
							children: "Solfai marks the ones that soar."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-12 lg:col-span-4 text-[13px] text-muted-dark leading-relaxed",
					children: "Works best on 5–30 seconds of clear singing. You'll get pitch accuracy, timing, vowel shape and dynamics — measure by measure."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-gold" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 relative overflow-hidden border border-[color:var(--border-gold)]",
				style: { borderRadius: "3px" },
				"data-testid": "studio-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: choir_ambient_default,
						alt: "",
						"aria-hidden": true,
						className: "absolute inset-0 h-full w-full object-cover object-center opacity-45"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0",
						style: { background: "linear-gradient(180deg, color-mix(in oklab, var(--bg) 55%, transparent) 0%, color-mix(in oklab, var(--bg) 85%, transparent) 100%)" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
						className: "absolute left-0 right-0 top-1/2 h-20 w-full -translate-y-1/2",
						opacity: .18
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative grid grid-cols-12 gap-6 p-8 md:p-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 md:col-span-7",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
									children: "Live capture"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-baseline gap-5",
									"data-testid": "capture-timer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "serif italic text-[80px] leading-[0.9] font-light text-paper mono-cap",
										children: ["0:", recording ? elapsed.toFixed(1).padStart(4, "0") : "00.0"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] uppercase tracking-[0.24em] text-muted-dark",
										children: recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[color:var(--gold)]",
											children: "● recording"
										}) : "ready to record"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 border border-[color:var(--border-dark)] bg-[color:var(--bg)]/60 p-4",
									style: { borderRadius: "2px" },
									"data-testid": "waveform",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-end gap-[3px] h-16",
										children: Array.from({ length: 84 }).map((_, i) => {
											const h = 8 + Math.round(48 * Math.abs(Math.sin(i * .4) * Math.cos(i * .11)));
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-[3px] rounded-full transition-all " + (recording && i < 48 ? "bg-[color:var(--gold)]" : "bg-paper/25"),
												style: { height: `${h}%` }
											}, i);
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted-dark mono-cap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "−∞ dB" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "peak −6 dB" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0 dB" })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex flex-wrap items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setRecording((r) => !r),
											"data-testid": "record-toggle",
											className: "inline-flex items-center gap-2 h-12 px-6 text-[12px] font-bold uppercase tracking-[0.22em]",
											style: {
												background: recording ? "color-mix(in oklab, oklch(0.65 0.22 25) 92%, black)" : "var(--gold)",
												color: recording ? "white" : "var(--ink)",
												borderRadius: "2px"
											},
											children: recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
												size: 13,
												fill: "currentColor"
											}), " Stop"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { size: 13 }), " Start recording"] })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											"data-testid": "upload-take",
											className: "inline-flex items-center gap-2 h-12 px-5 text-[11.5px] font-semibold uppercase tracking-[0.22em] border border-[color:var(--border-dark)] text-paper hover:border-[color:var(--gold)]/50 transition-colors",
											style: { borderRadius: "2px" },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 13 }), " Upload a take"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											"data-testid": "video-record",
											className: "inline-flex items-center gap-2 h-12 px-5 text-[11.5px] font-semibold uppercase tracking-[0.22em] border border-[color:var(--border-dark)] text-muted-dark hover:text-paper transition-colors",
											style: { borderRadius: "2px" },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 13 }), " Video"]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "col-span-12 md:col-span-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-[color:var(--border-dark)] p-5",
								style: {
									borderRadius: "2px",
									background: "color-mix(in oklab, var(--bg) 65%, transparent)"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow text-muted-dark",
										children: "Reference"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 serif text-[19px] font-medium text-paper leading-tight",
										children: "Speak the Truth · Tenor · mm. 34–52"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.24em] text-muted-dark",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 12 }), " E♭ · 4/4 · 76 bpm"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)] hover:text-paper transition-colors",
										children: ["Play reference ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 11 })]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-[color:var(--border-dark)] p-5",
								style: {
									borderRadius: "2px",
									background: "color-mix(in oklab, var(--bg) 65%, transparent)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
									children: "Tips before you sing"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
									className: "mt-3 space-y-1.5 text-[12.5px] leading-relaxed text-muted-dark",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Sing on solfège, not on words" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Match the reference dynamic level" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Breathe at every phrase mark" })
									]
								})]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-14",
				"data-testid": "latest-take-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Latest take"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-3 serif-tight text-[32px] md:text-[40px] leading-[1] font-medium text-paper",
						children: ["Take 04 · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "italic font-light text-[color:var(--gold)]",
							children: "an editor's read."
						})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mono-cap text-[10.5px] text-muted-dark",
						children: "recorded 14:22"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-12 gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-12 md:col-span-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden border border-[color:var(--border-gold)]",
							style: {
								borderRadius: "3px",
								background: "linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 100%)"
							},
							"data-testid": "grade-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute -right-16 -top-16 h-48 w-48 opacity-40 pointer-events-none",
								style: { background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 50%, transparent), transparent 65%)" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow text-muted-dark",
										children: "Overall"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-baseline gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "serif text-[92px] leading-none font-medium text-paper mono-cap",
											children: "87"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "serif italic text-[26px] text-[color:var(--gold)]",
											children: "/100"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 text-[12.5px] text-muted-dark leading-relaxed",
										children: "Confident phrase shape and a solid tenor timbre. Minor pitch drift on the sustained \"sol\" in m. 41."
									})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-12 md:col-span-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border border-[color:var(--border-dark)]",
							style: {
								borderRadius: "3px",
								background: "var(--bg-2)"
							},
							"data-testid": "breakdown-table",
							children: [
								{
									k: "Pitch accuracy",
									v: 91,
									note: "12 of 13 target notes within ±20 cents",
									up: true
								},
								{
									k: "Rhythmic timing",
									v: 84,
									note: "Consistent through m. 47, then rushed",
									up: true
								},
								{
									k: "Vowel shape",
									v: 79,
									note: "Bright /a/ on \"la\", consider rounder /ɑ/",
									up: false
								},
								{
									k: "Dynamics",
									v: 88,
									note: "Nailed the crescendo into m. 42",
									up: true
								}
							].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-12 items-center gap-4 px-5 py-4 border-b border-[color:var(--border-dark)] last:border-b-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "col-span-4 text-[13px] font-semibold text-paper",
										children: r.k
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "col-span-2 flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mono-cap text-[22px] serif font-medium text-paper",
											children: r.v
										}), r.up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
											size: 13,
											className: "text-[color:var(--gold)]"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, {
											size: 13,
											className: "text-[color:var(--bronze)]"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "col-span-5 text-[12px] text-muted-dark leading-snug",
										children: r.note
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "col-span-1 flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "relative h-1 w-16 bg-[color:var(--bg)] overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--bronze)]",
												style: { width: `${r.v}%` }
											})
										})
									})
								]
							}, r.k))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 relative border-l-2 border-[color:var(--gold)] pl-6 py-2",
							"data-testid": "coach-note",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow text-[color:var(--gold)]",
									children: "Coach's note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 serif text-[19px] leading-snug italic font-light text-paper/90",
									children: "\"Try singing mm. 40–44 on a warm /o/ vowel first, then swap back to text. It will settle the pitch on your longest note.\""
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold)] hover:text-paper transition-colors",
									children: ["Send 3 warm-ups ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })]
								})
							]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				"data-testid": "past-recordings-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Past recordings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "text-[10.5px] uppercase tracking-[0.24em] text-muted-dark hover:text-paper transition-colors",
						children: "View all"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-[color:var(--border-dark)]",
					children: PAST.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-testid": `recording-${p.id}`,
						className: "group grid grid-cols-12 items-center gap-4 py-4 border-b border-[color:var(--border-dark)] px-2 hover:bg-[color:var(--bg-2)]/40 transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "col-span-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "grid h-9 w-9 place-items-center border border-[color:var(--border-dark)] text-muted-dark group-hover:text-[color:var(--gold)] group-hover:border-[color:var(--gold)]/45 transition-colors",
									style: { borderRadius: "2px" },
									"aria-label": "Play",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 12 })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif text-[16px] font-medium text-paper truncate",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] uppercase tracking-[0.22em] text-muted-dark mt-0.5",
									children: [
										p.when,
										" · ",
										p.dur
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "col-span-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-end gap-[2px] h-8",
									children: Array.from({ length: 42 }).map((_, i) => {
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-[2px] rounded-full bg-paper/30",
											style: { height: `${15 + Math.round(70 * Math.abs(Math.sin(i * .5 + p.id) * Math.cos(i * .13)))}%` }
										}, i);
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-2 text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "serif text-[26px] font-medium text-paper mono-cap",
									children: p.grade
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "serif italic text-[13px] text-[color:var(--gold)]",
									children: "/100"
								})]
							})
						]
					}, p.id))
				})]
			})
		]
	}) });
}
//#endregion
export { VocalCoach as component };
