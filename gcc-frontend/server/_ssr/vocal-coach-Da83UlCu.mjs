import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { P as Check, a as TrendingUp, i as TriangleAlert, o as TrendingDown, r as Upload, s as Square, t as X, v as Mic, x as LoaderCircle } from "../_libs/lucide-react.mjs";
import { r as StaffLines, t as AppLayout } from "./StaffLines-DCfF9t-v.mjs";
import { n as evaluateSinging, t as AnalyzeApiError } from "./analyzeClient-D8-hzk1Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vocal-coach-Da83UlCu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var choir_ambient_default = "/assets/choir_ambient-BpSitkoo.png";
var PARTS = [
	"Soprano",
	"Alto",
	"Tenor",
	"Bass"
];
var SUBSCORES = [
	{
		key: "pitchAccuracy",
		label: "Pitch accuracy"
	},
	{
		key: "rhythm",
		label: "Rhythmic timing"
	},
	{
		key: "toneQuality",
		label: "Tone quality"
	},
	{
		key: "breathSupport",
		label: "Breath support"
	},
	{
		key: "vowelShape",
		label: "Vowel shape"
	},
	{
		key: "diction",
		label: "Diction"
	}
];
function VocalCoach() {
	const [part, setPart] = (0, import_react.useState)("Soprano");
	const [stage, setStage] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [takeName, setTakeName] = (0, import_react.useState)(null);
	const [elapsed, setElapsed] = (0, import_react.useState)(0);
	const mediaRef = (0, import_react.useRef)(null);
	const chunksRef = (0, import_react.useRef)([]);
	const timerRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	async function evaluate(audio, filename) {
		setStage("evaluating");
		setError(null);
		setResult(null);
		setTakeName(filename);
		try {
			const r = await evaluateSinging({
				audio,
				filename,
				selectedPart: part
			});
			setResult(r);
			setStage("done");
		} catch (e) {
			setStage("error");
			setError(e instanceof AnalyzeApiError ? e.message : e instanceof Error ? e.message : "Could not evaluate the recording.");
		}
	}
	async function startRecording() {
		setError(null);
		if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
			setStage("error");
			setError("This browser can't record audio. Use “Upload a take” instead.");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mr = new MediaRecorder(stream);
			chunksRef.current = [];
			mr.ondataavailable = (e) => {
				if (e.data.size) chunksRef.current.push(e.data);
			};
			mr.onstop = () => {
				stream.getTracks().forEach((t) => t.stop());
				evaluate(new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" }), "recording.webm");
			};
			mediaRef.current = mr;
			mr.start();
			setStage("recording");
			setElapsed(0);
			timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1e3);
		} catch {
			setStage("error");
			setError("Microphone access was blocked. Allow mic access, or use “Upload a take”.");
		}
	}
	function stopRecording() {
		if (timerRef.current) {
			window.clearInterval(timerRef.current);
			timerRef.current = null;
		}
		mediaRef.current?.stop();
	}
	function onFile(e) {
		const f = e.target.files?.[0];
		e.target.value = "";
		if (f) evaluate(f, f.name);
	}
	const recording = stage === "recording";
	const busy = recording || stage === "evaluating";
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
							children: "Solfai grades what it actually hears."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-12 lg:col-span-4 text-[13px] text-muted-dark leading-relaxed",
					children: "Record or upload 5–30 seconds of clear singing. Solfai, acting as a choir director, returns real pitch, tone, breath, rhythm and diction scores. Nothing is stored — it evaluates on the spot."
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
										children: ["0:", recording ? String(elapsed).padStart(2, "0") + ".0" : "00.0"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] uppercase tracking-[0.24em] text-muted-dark",
										children: recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[color:var(--gold)]",
											children: "● recording"
										}) : stage === "evaluating" ? "evaluating…" : "ready to record"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow text-muted-dark mb-2",
										children: "Voice part"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1.5",
										children: PARTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setPart(p),
											disabled: busy,
											"data-testid": `vc-part-${p.toLowerCase()}`,
											className: "px-4 py-2 text-[12px] font-semibold uppercase tracking-widest transition-colors disabled:opacity-40 " + (part === p ? "bg-[color:var(--gold)] text-[color:var(--ink)]" : "border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/50"),
											style: { borderRadius: "2px" },
											children: p
										}, p))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex flex-wrap items-center gap-3",
									children: [
										!recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: startRecording,
											disabled: stage === "evaluating",
											"data-testid": "record-toggle",
											className: "inline-flex items-center gap-2 h-12 px-6 text-[12px] font-bold uppercase tracking-[0.22em] disabled:opacity-40",
											style: {
												background: "var(--gold)",
												color: "var(--ink)",
												borderRadius: "2px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { size: 13 }), " Start recording"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: stopRecording,
											"data-testid": "record-toggle",
											className: "inline-flex items-center gap-2 h-12 px-6 text-[12px] font-bold uppercase tracking-[0.22em]",
											style: {
												background: "color-mix(in oklab, oklch(0.65 0.22 25) 92%, black)",
												color: "white",
												borderRadius: "2px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {
												size: 13,
												fill: "currentColor"
											}), " Stop & grade"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => fileRef.current?.click(),
											disabled: busy,
											"data-testid": "upload-take",
											className: "inline-flex items-center gap-2 h-12 px-5 text-[11.5px] font-semibold uppercase tracking-[0.22em] border border-[color:var(--border-dark)] text-paper hover:border-[color:var(--gold)]/50 disabled:opacity-40 transition-colors",
											style: { borderRadius: "2px" },
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 13 }), " Upload a take"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: fileRef,
											type: "file",
											accept: "audio/*,.m4a,.wav,.mp3,.webm,.ogg",
											className: "hidden",
											onChange: onFile,
											"data-testid": "vc-file-input"
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
							className: "col-span-12 md:col-span-5 space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Sing on solfège or an open vowel" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· 5–30 seconds is the sweet spot" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Record somewhere quiet for a cleaner read" })
									]
								})]
							})
						})]
					})
				]
			}),
			stage === "evaluating" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 flex items-center gap-3 border border-[color:var(--border-dark)] bg-[color:var(--bg-2)] px-6 py-5",
				style: { borderRadius: "3px" },
				"data-testid": "vc-loading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					size: 18,
					className: "animate-spin text-[color:var(--gold)]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[13.5px] text-paper/85",
					children: [
						"Listening to your ",
						part.toLowerCase(),
						" take",
						takeName ? ` (${takeName})` : "",
						" — grading pitch, tone and rhythm…"
					]
				})]
			}),
			stage === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 flex items-start gap-3 border border-[color:var(--border-dark)] px-6 py-5",
				style: {
					borderRadius: "3px",
					background: "var(--bg-2)"
				},
				"data-testid": "vc-error",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 16,
					className: "shrink-0 mt-0.5 text-[color:var(--gold)]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] leading-relaxed text-paper/85",
					children: error || "Something went wrong. Please try again."
				})]
			}),
			stage === "done" && result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-14",
				"data-testid": "latest-take-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between mb-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
						children: "Your take"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-3 serif-tight text-[32px] md:text-[40px] leading-[1] font-medium text-paper",
						children: ["An editor's read of ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "italic font-light text-[color:var(--gold)]",
							children: "what Solfai heard."
						})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setStage("idle");
							setResult(null);
						},
						className: "inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.22em] text-muted-dark hover:text-paper transition-colors",
						"data-testid": "vc-dismiss",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 13 }), " New take"]
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
											children: result.overallScore
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "serif italic text-[26px] text-[color:var(--gold)]",
											children: "/100"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 text-[12.5px] text-muted-dark leading-relaxed",
										children: result.detailedFeedback
									})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-12 md:col-span-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border border-[color:var(--border-dark)]",
								style: {
									borderRadius: "3px",
									background: "var(--bg-2)"
								},
								"data-testid": "breakdown-table",
								children: SUBSCORES.map(({ key, label }) => {
									const v = Number(result[key]) || 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-12 items-center gap-4 px-5 py-4 border-b border-[color:var(--border-dark)] last:border-b-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "col-span-5 text-[13px] font-semibold text-paper",
												children: label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "col-span-2 flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mono-cap text-[22px] serif font-medium text-paper",
													children: v
												}), v >= 70 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
													size: 13,
													className: "text-[color:var(--gold)]"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, {
													size: 13,
													className: "text-[color:var(--bronze)]"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "col-span-5 flex justify-end",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "relative h-1 w-full max-w-[160px] bg-[color:var(--bg)] overflow-hidden",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--bronze)]",
														style: { width: `${v}%` }
													})
												})
											})
										]
									}, key);
								})
							}),
							Array.isArray(result.strengths) && result.strengths.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-l-2 border-[color:var(--gold)] pl-6 py-2",
								"data-testid": "vc-strengths",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow text-[color:var(--gold)]",
									children: "What's working"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5",
									children: result.strengths.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-2 text-[13.5px] text-paper/90",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											size: 15,
											className: "mt-0.5 shrink-0 text-[color:var(--gold)]"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s })]
									}, i))
								})]
							}),
							Array.isArray(result.actionItems) && result.actionItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 border-l-2 border-[color:var(--border-dark)] pl-6 py-2",
								"data-testid": "vc-actions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow text-muted-dark",
									children: "Work on next"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1.5",
									children: result.actionItems.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex gap-2 text-[13.5px] text-muted-dark",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--gold)] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a })]
									}, i))
								})]
							})
						]
					})]
				})]
			}),
			stage === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mt-12 border-t border-[color:var(--border-dark)] pt-6",
				"data-testid": "vc-empty",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] text-muted-dark",
					children: "No recordings yet. Your evaluations appear here after you record or upload a take — Solfai grades the audio itself, so every number reflects what it actually heard."
				})
			})
		]
	}) });
}
//#endregion
export { VocalCoach as component };
