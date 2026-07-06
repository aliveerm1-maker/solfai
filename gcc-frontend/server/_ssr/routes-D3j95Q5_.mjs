import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { C as FileMusic, N as ArrowUp, O as Clock3, S as Flame, T as Ear, b as Mic, f as Radio, g as Paperclip, h as PenLine, j as Check, r as Upload, s as Sparkles, t as Waves, u as ScanLine, y as Music2 } from "../_libs/lucide-react.mjs";
import { t as AppLayout } from "./AppLayout-BmG4-j5Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D3j95Q5_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ambient_hero_default = "/assets/ambient-hero-okG-UHeq.jpg";
var mode_sightread_default = "/assets/mode-sightread-qk9ZN2RX.jpg";
var mode_eartrain_default = "/assets/mode-eartrain-CfLuFQ4b.jpg";
var mode_vocal_default = "/assets/mode-vocal-fHlAYhRN.jpg";
var mode_compose_default = "/assets/mode-compose-jZNjbegc.jpg";
var TrebleClef3D = (0, import_react.lazy)(() => import("./TrebleClef3D-DrZL-EBM.mjs").then((m) => ({ default: m.TrebleClef3D })));
var PARTS = [
	"Soprano",
	"Alto",
	"Tenor",
	"Bass"
];
var MODES = [
	{
		id: "analyze",
		label: "Analyze",
		tagline: "Read a score end-to-end",
		icon: ScanLine,
		art: mode_sightread_default,
		placeholder: "Drop a PDF, MusicXML or photo — Solfai returns key, tempo, range, and section notes.",
		actions: [
			{
				icon: Upload,
				label: "Upload a score",
				hint: "PDF · MusicXML · Image"
			},
			{
				icon: FileMusic,
				label: "Paste a link",
				hint: "IMSLP · CPDL · MuseScore"
			},
			{
				icon: Waves,
				label: "Find starting pitch",
				hint: "From any measure"
			},
			{
				icon: Music2,
				label: "Solfege my part",
				hint: "Movable-do transcription"
			}
		],
		suggestions: [
			"Summarize the harmonic structure of this piece",
			"Highlight the hardest 8 measures for tenors",
			"What key does the bridge modulate to?",
			"Transpose measures 12–24 down a minor third"
		]
	},
	{
		id: "sightread",
		label: "Sight-read",
		tagline: "Real-time solfege coach",
		icon: PenLine,
		art: mode_sightread_default,
		placeholder: "Load a passage and Solfai will beat, blink, and prompt you through it at your tempo.",
		actions: [
			{
				icon: Upload,
				label: "Load passage",
				hint: "Any 4–32 bars"
			},
			{
				icon: Clock3,
				label: "Set tempo",
				hint: "Metronome + count-in"
			},
			{
				icon: Music2,
				label: "Chunk & loop",
				hint: "Auto phrase splits"
			},
			{
				icon: Flame,
				label: "Streak mode",
				hint: "Nail 5 passes in a row"
			}
		],
		suggestions: [
			"Slow the tricky measures to 70% until I hit them clean",
			"Loop measures 45–52 with a 4-beat count-in",
			"Quiz me on interval names as I go"
		]
	},
	{
		id: "ear",
		label: "Ear Training",
		tagline: "Intervals · chords · dictation",
		icon: Ear,
		art: mode_eartrain_default,
		placeholder: "Pick a drill — intervals, triads, cadences, or full melodic dictation.",
		actions: [
			{
				icon: Waves,
				label: "Interval drill",
				hint: "P4, P5, tritone…"
			},
			{
				icon: Music2,
				label: "Chord quality",
				hint: "maj / min / dim / aug"
			},
			{
				icon: PenLine,
				label: "Melodic dictation",
				hint: "4–8 bars, notate it"
			},
			{
				icon: Flame,
				label: "Daily streak",
				hint: "5 min · 10 questions"
			}
		],
		suggestions: [
			"Ascending intervals within an octave, adaptive difficulty",
			"Dictation in E♭ major, quarter and eighth notes only",
			"Drill me on tritone vs perfect fifth for 3 minutes"
		]
	},
	{
		id: "vocal",
		label: "Vocal Coach",
		tagline: "Feedback on your take",
		icon: Radio,
		art: mode_vocal_default,
		placeholder: "Record 5–30 seconds. Solfai returns pitch, timing, vowel shape and dynamics.",
		actions: [
			{
				icon: Mic,
				label: "Record now",
				hint: "Latest passage"
			},
			{
				icon: Upload,
				label: "Upload a take",
				hint: "m4a · wav · mp3"
			},
			{
				icon: Waves,
				label: "Pitch overlay",
				hint: "vs. reference line"
			},
			{
				icon: FileMusic,
				label: "Warm-ups",
				hint: "In the piece's key"
			}
		],
		suggestions: [
			"Grade my last recording measure-by-measure",
			"Am I flat on any sustained notes?",
			"Give me 3 warm-ups for the tenor bridge"
		]
	},
	{
		id: "compose",
		label: "Compose",
		tagline: "Write, arrange, transpose",
		icon: PenLine,
		art: mode_compose_default,
		placeholder: "Describe a phrase, arrangement, or exercise — Solfai drafts the notation.",
		actions: [
			{
				icon: PenLine,
				label: "New exercise",
				hint: "8-bar sight-reader"
			},
			{
				icon: Music2,
				label: "Reharmonize",
				hint: "Give a chart new colors"
			},
			{
				icon: Waves,
				label: "Voice a chord",
				hint: "SATB voicing tool"
			},
			{
				icon: Upload,
				label: "Import lead sheet",
				hint: "MusicXML in, SATB out"
			}
		],
		suggestions: [
			"Write an 8-bar SATB warm-up in F, ending on a picardy third",
			"Reharmonize this refrain with a secondary dominant",
			"Compose a 16-bar sight-reading exercise, level 3/5"
		]
	}
];
function Home() {
	const [modeId, setModeId] = (0, import_react.useState)("analyze");
	const mode = (0, import_react.useMemo)(() => MODES.find((m) => m.id === modeId), [modeId]);
	const [part, setPart] = (0, import_react.useState)("Soprano");
	const [text, setText] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-[calc(100vh-3.5rem)] overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: ambient_hero_default,
					alt: "",
					"aria-hidden": true,
					width: 1536,
					height: 768,
					className: "absolute inset-0 w-full h-[70vh] object-cover object-top opacity-[0.28]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { background: "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--bg) 55%, transparent) 45%, var(--bg) 85%)" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { background: "radial-gradient(ellipse 70% 45% at 50% 0%, color-mix(in oklab, var(--teal) 18%, transparent), transparent 65%)" }
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto w-full max-w-3xl px-5 pt-14 pb-16 flex flex-col items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative h-36 w-36 -mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute -inset-8 rounded-full blur-3xl opacity-70",
						style: { background: "radial-gradient(circle, color-mix(in oklab, var(--teal) 45%, transparent), transparent 65%)" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full" }),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-40 w-28",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrebleClef3D, {})
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 inline-flex items-center gap-2 rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 px-3 py-1 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-[color:var(--teal)] shadow-[0_0_10px_var(--teal)]" }), "Solfai · v0.4 preview"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-5 text-center serif text-4xl md:text-5xl font-semibold tracking-tight text-paper",
					children: [
						"Good afternoon,",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "italic text-gradient-amber",
							children: "Ali"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 max-w-lg text-center text-[15px] text-muted-dark",
					children: [mode.tagline, ". Switch modes below — Solfai reshapes itself around what you're trying to do."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-7 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1.5 rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 backdrop-blur-xl p-1.5 overflow-x-auto no-scrollbar",
						children: MODES.map((m) => {
							const active = m.id === modeId;
							const Icon = m.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setModeId(m.id),
								className: "flex-1 min-w-max flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap transition " + (active ? "text-[color:var(--ink)] shadow-[0_10px_30px_-12px_var(--teal)]" : "text-muted-dark hover:text-paper"),
								style: active ? { background: "linear-gradient(135deg, var(--teal), var(--teal-deep))" } : void 0,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 13 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.label }),
									active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 12 })
								]
							}, m.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
					},
					className: "relative mt-4 w-full rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/85 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-5 pt-3.5 text-[11px] uppercase tracking-[0.22em] text-muted-dark",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(mode.icon, {
									size: 12,
									className: "text-[color:var(--teal)]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-paper/85 font-semibold",
									children: mode.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "opacity-60",
									children: "mode"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-auto normal-case tracking-normal text-[11px] text-muted-dark",
									children: ["Voice · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-paper/85 font-semibold",
										children: part
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: text,
							onChange: (e) => setText(e.target.value),
							placeholder: mode.placeholder,
							rows: 2,
							className: "block w-full resize-none bg-transparent px-5 pt-2 pb-3 text-[15px] leading-relaxed placeholder:text-muted-dark focus:outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-3 pb-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid place-items-center h-9 w-9 rounded-full border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--teal)]/50 transition",
									"aria-label": "Attach",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden sm:flex items-center rounded-full border border-[color:var(--border-dark)] p-0.5 text-[11px] font-semibold uppercase tracking-widest",
									children: PARTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setPart(p),
										className: "px-3 py-1 rounded-full transition " + (part === p ? "bg-[color:var(--teal)] text-[color:var(--ink)]" : "text-muted-dark hover:text-paper"),
										children: p.slice(0, 1)
									}, p))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "grid place-items-center h-9 w-9 rounded-full border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--teal)]/50 transition",
										"aria-label": "Voice",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { size: 15 })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: "grid place-items-center h-9 w-9 rounded-full transition disabled:opacity-40",
										disabled: !text.trim(),
										style: {
											background: "linear-gradient(135deg, var(--teal), var(--teal-deep))",
											color: "var(--ink)"
										},
										"aria-label": "Send",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
											size: 16,
											strokeWidth: 2.5
										})
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid w-full grid-cols-2 md:grid-cols-4 gap-2.5",
					children: mode.actions.map(({ icon: Icon, label, hint }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "group text-left rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/55 p-3.5 hover:border-[color:var(--teal)]/45 hover:bg-[color:var(--bg-2)]/85 transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid place-items-center h-7 w-7 rounded-lg bg-[color:var(--bg)] ring-1 ring-[color:var(--border-dark)] group-hover:ring-[color:var(--teal)]/40 transition",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									size: 13,
									className: "text-[color:var(--teal)]"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[13px] font-semibold text-paper",
								children: label
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] text-muted-dark leading-snug",
							children: hint
						})]
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 mb-3 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							size: 12,
							className: "text-[color:var(--teal)]"
						}), " Try asking"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: mode.suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setText(s),
							className: "rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/40 px-3.5 py-1.5 text-[12.5px] text-muted-dark hover:text-paper hover:border-[color:var(--teal)]/40 transition",
							children: s
						}, s))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 w-full grid grid-cols-1 md:grid-cols-3 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2 rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/55 p-4 flex items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid place-items-center h-11 w-11 rounded-xl bg-[color:var(--bg)] ring-1 ring-[color:var(--border-dark)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileMusic, {
									size: 16,
									className: "text-[color:var(--teal)]"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif text-[15px] font-semibold truncate",
									children: "Continue: Speak the Truth — Tenor"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11.5px] text-muted-dark",
									children: "E♭ major · 4/4 · 76 bpm · measure 34 of 118"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "text-[11px] font-bold uppercase tracking-widest text-[color:var(--teal)] hover:underline",
								children: "Resume →"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/55 p-4 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center h-11 w-11 rounded-xl",
							style: { background: "linear-gradient(135deg, oklch(0.82 0.14 78), oklch(0.62 0.15 55))" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
								size: 16,
								className: "text-[color:var(--ink)]"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leading-tight",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[12px] uppercase tracking-[0.22em] text-muted-dark",
									children: "Streak"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif text-[18px] font-semibold",
									children: "12 days"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10.5px] text-muted-dark",
									children: "3 drills to keep it alive"
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 text-[10.5px] text-muted-dark",
					children: "Solfai can misread messy scans. Verify key and rhythm before performance."
				})
			]
		})]
	}) });
}
//#endregion
export { Home as component };
