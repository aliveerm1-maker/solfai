import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Ear, O as ArrowRight, S as FileMusic, T as Clock3, _ as Music2, d as ScanLine, f as Radio, h as Paperclip, i as TriangleAlert, m as PenLine, n as Waves, r as Upload, t as X, v as Mic, x as Flame, y as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as StaffLines, t as AppLayout } from "./StaffLines-4L9_3J30.mjs";
import { t as bronze_material_default } from "./bronze_material-CBP8JZx1.mjs";
import { a as postAnalyze, i as pdfFileToPages, o as postParseMusicXML, r as imageFileToBase64, t as AnalyzeApiError } from "./analyzeClient-D8-hzk1Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B2Ar1YDn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var parchment_texture_default = "/assets/parchment_texture-CReDGOXh.png";
var glass_clef_study_default = "/assets/glass_clef_study-CEbqousS.png";
var TrebleClef3D = (0, import_react.lazy)(() => import("./TrebleClef3D-zbN2ifz0.mjs").then((m) => ({ default: m.TrebleClef3D })));
var PARTS = [
	"Soprano",
	"Alto",
	"Tenor",
	"Bass",
	"All Parts"
];
var MODES = [
	{
		id: "analyze",
		label: "Analyze",
		tagline: "Read a score end-to-end",
		icon: ScanLine,
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
			"What key does the bridge modulate to?"
		]
	},
	{
		id: "sightread",
		label: "Sight-read",
		tagline: "Real-time solfege coach",
		icon: PenLine,
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
				hint: "5 clean passes in a row"
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
			"Give me three warm-ups for the tenor bridge"
		]
	},
	{
		id: "compose",
		label: "Compose",
		tagline: "Write, arrange, transpose",
		icon: PenLine,
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
	const fileInputRef = (0, import_react.useRef)(null);
	const [analyzeUpload, setAnalyzeUpload] = (0, import_react.useState)(null);
	const [analyzeStage, setAnalyzeStage] = (0, import_react.useState)("idle");
	const [analyzeError, setAnalyzeError] = (0, import_react.useState)(null);
	const [analyzeResult, setAnalyzeResult] = (0, import_react.useState)(null);
	const [analyzeElapsed, setAnalyzeElapsed] = (0, import_react.useState)(0);
	const [isDraggingFile, setIsDraggingFile] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (analyzeStage !== "analyzing") return;
		setAnalyzeElapsed(0);
		const start = Date.now();
		const id = window.setInterval(() => setAnalyzeElapsed(Math.round((Date.now() - start) / 1e3)), 1e3);
		return () => window.clearInterval(id);
	}, [analyzeStage]);
	(0, import_react.useEffect)(() => {
		let depth = 0;
		const hasFiles = (e) => !!(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files"));
		const onDragEnter = (e) => {
			if (!hasFiles(e)) return;
			e.preventDefault();
			depth++;
			setIsDraggingFile(true);
		};
		const onDragOver = (e) => {
			if (!hasFiles(e)) return;
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
		};
		const onDragLeave = (e) => {
			if (!hasFiles(e)) return;
			depth = Math.max(0, depth - 1);
			if (depth === 0) setIsDraggingFile(false);
		};
		const onDrop = (e) => {
			e.preventDefault();
			depth = 0;
			setIsDraggingFile(false);
			const file = e.dataTransfer?.files?.[0];
			if (!file) return;
			setModeId("analyze");
			handleAnalyzeFileSelected(file);
		};
		window.addEventListener("dragenter", onDragEnter);
		window.addEventListener("dragover", onDragOver);
		window.addEventListener("dragleave", onDragLeave);
		window.addEventListener("drop", onDrop);
		return () => {
			window.removeEventListener("dragenter", onDragEnter);
			window.removeEventListener("dragover", onDragOver);
			window.removeEventListener("dragleave", onDragLeave);
			window.removeEventListener("drop", onDrop);
		};
	}, []);
	function openAnalyzeFilePicker() {
		fileInputRef.current?.click();
	}
	function resetAnalyzeUpload() {
		setAnalyzeUpload(null);
		setAnalyzeStage("idle");
		setAnalyzeError(null);
		setAnalyzeResult(null);
	}
	async function handleAnalyzeFileSelected(file) {
		setAnalyzeResult(null);
		setAnalyzeError(null);
		setAnalyzeStage("reading");
		try {
			const lower = file.name.toLowerCase();
			const isMusicXml = lower.endsWith(".musicxml") || lower.endsWith(".mxl") || lower.endsWith(".xml");
			const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
			if (isMusicXml) setAnalyzeUpload({
				name: file.name,
				kind: "musicxml",
				base64: null,
				mime: null,
				pdfPages: [],
				file
			});
			else if (isPdf) {
				const pdfPages = await pdfFileToPages(file);
				setAnalyzeUpload({
					name: file.name,
					kind: "pdf",
					base64: null,
					mime: null,
					pdfPages,
					file: null
				});
			} else if (file.type.startsWith("image/")) {
				const { base64, mime } = await imageFileToBase64(file);
				setAnalyzeUpload({
					name: file.name,
					kind: "image",
					base64,
					mime,
					pdfPages: [],
					file: null
				});
			} else throw new Error("Please upload an image (JPG/PNG), a PDF, or a MusicXML file (.musicxml/.mxl/.xml).");
			setAnalyzeStage("ready");
		} catch (err) {
			setAnalyzeUpload(null);
			setAnalyzeStage("error");
			setAnalyzeError(err instanceof Error ? err.message : "Couldn't read that file.");
		}
	}
	async function runAnalyze() {
		if (!analyzeUpload) return;
		setAnalyzeStage("analyzing");
		setAnalyzeError(null);
		try {
			const result = analyzeUpload.kind === "musicxml" && analyzeUpload.file ? await postParseMusicXML({
				file: analyzeUpload.file,
				selectedPart: part
			}) : await postAnalyze({
				imageBase64: analyzeUpload.base64,
				imageMime: analyzeUpload.mime,
				pdfPages: analyzeUpload.pdfPages,
				selectedPart: part
			});
			setAnalyzeResult(result);
			setAnalyzeStage("done");
		} catch (err) {
			setAnalyzeStage("error");
			setAnalyzeError(err instanceof AnalyzeApiError ? err.message : err instanceof Error ? err.message : "Analysis failed. Please try again.");
		}
	}
	const analyzeCanRun = modeId === "analyze" && !!analyzeUpload && analyzeStage !== "analyzing" && analyzeStage !== "reading";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppLayout, { children: [isDraggingFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[999] flex items-center justify-center pointer-events-none",
		style: { background: "color-mix(in oklab, var(--ink) 78%, transparent)" },
		"data-testid": "global-drop-overlay",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative border border-[color:var(--border-gold)] px-12 py-10 text-center",
			style: {
				background: "var(--bg-2)",
				borderRadius: "3px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
				className: "absolute left-0 right-0 top-1/2 h-16 w-full -translate-y-1/2",
				opacity: .14
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileMusic, {
						size: 38,
						className: "mx-auto text-[color:var(--gold)]"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 serif text-[24px] font-medium text-paper",
						children: "Drop to upload"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1.5 text-[12px] text-muted-dark",
						children: "Image, PDF, or MusicXML (.musicxml · .mxl · .xml)"
					})
				]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden",
				"data-testid": "hero-section",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute inset-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0",
								style: { background: "radial-gradient(ellipse 55% 75% at 78% 22%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 62%), radial-gradient(ellipse 45% 60% at 8% 88%, color-mix(in oklab, var(--bronze) 18%, transparent), transparent 60%)" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
								className: "absolute left-0 right-0 top-[38%] h-24 w-full",
								opacity: .14
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
								className: "absolute left-0 right-0 top-[72%] h-24 w-full",
								opacity: .09
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto grid w-full max-w-[1240px] grid-cols-12 gap-6 px-6 pt-16 pb-10 lg:pt-24 lg:pb-16",
						"data-testid": "hero-grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 lg:col-span-7 flex flex-col justify-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
									"data-testid": "hero-eyebrow",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Solfai · Vol. 04 · Preview" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "mt-6 serif-tight text-[54px] leading-[0.98] font-medium tracking-tight text-paper md:text-[76px] lg:text-[88px]",
									"data-testid": "hero-headline",
									children: [
										"Sight-read",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "italic font-light text-gradient-amber",
											children: "like you mean it."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-7 max-w-xl text-[15.5px] leading-relaxed text-muted-dark",
									"data-testid": "hero-subheadline",
									children: "Drop a score — a photo, PDF or MusicXML. Solfai returns your part in movable-do solfège, the starting pitch, tempo, and the eight measures most likely to bite you."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-9",
									"data-testid": "voice-part-selector",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow text-muted-dark mb-3",
										children: "Voice part"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-1.5",
										children: PARTS.map((p) => {
											const active = p === part;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => setPart(p),
												"data-testid": `voice-part-${p.toLowerCase().replace(/\s/g, "-")}`,
												className: "px-4 py-2 text-[12.5px] font-semibold uppercase tracking-widest transition-colors " + (active ? "bg-[color:var(--gold)] text-[color:var(--ink)]" : "border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/50"),
												style: { borderRadius: "2px" },
												children: p
											}, p);
										})
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-12 lg:col-span-5 relative flex items-center justify-center min-h-[380px] lg:min-h-[540px]",
							"data-testid": "hero-clef-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 pointer-events-none",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute inset-8 rounded-[50%] blur-3xl opacity-70",
										style: { background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 50%, transparent), transparent 65%)" }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
									fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: glass_clef_study_default,
										alt: "",
										"aria-hidden": true,
										className: "max-h-[540px] w-auto object-contain opacity-90"
									}),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative h-full w-full max-w-[440px] flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrebleClef3D, {
											quality: "hero",
											rotationSpeed: .35,
											floatIntensity: .28
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute bottom-4 right-4 hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-dark",
									"data-testid": "hero-clef-caption",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-[color:var(--gold)]/60" }), "Glass clef · study Nº1"]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative mx-auto max-w-[1240px] px-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rule-gold" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative mx-auto w-full max-w-[1240px] px-6 pt-8",
				"data-testid": "mode-picker-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-6 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark",
						children: "Working mode"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 serif text-2xl md:text-[28px] font-medium text-paper",
						"data-testid": "active-mode-tagline",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "italic text-[color:var(--gold)]",
								children: [mode.label, "."]
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-paper/85",
								children: [mode.tagline, "."]
							})
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden sm:block text-[11px] uppercase tracking-[0.24em] text-muted-dark",
						children: ["Voice · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-paper/90 font-semibold",
							children: part
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-5 gap-px overflow-hidden border border-[color:var(--border-dark)]",
					style: {
						background: "var(--border-dark)",
						borderRadius: "3px"
					},
					"data-testid": "mode-picker",
					children: MODES.map((m) => {
						const active = m.id === modeId;
						const Icon = m.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setModeId(m.id),
							"data-testid": `mode-tab-${m.id}`,
							className: "group relative flex flex-col items-start gap-1.5 px-4 py-4 text-left transition-colors " + (active ? "bg-[color:var(--bg-3)]" : "bg-[color:var(--bg-2)] hover:bg-[color:var(--bg-3)]/60"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										size: 13,
										className: active ? "text-[color:var(--gold)]" : "text-muted-dark"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[13px] font-semibold tracking-tight " + (active ? "text-paper" : "text-muted-dark"),
										children: m.label
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10.5px] " + (active ? "text-paper/70" : "text-muted-dark/70"),
									children: m.tagline
								}),
								active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0 bottom-0 h-[2px] bg-[color:var(--gold)]" })
							]
						}, m.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative mx-auto w-full max-w-[1240px] px-6 pt-6",
				"data-testid": "composer-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileInputRef,
					type: "file",
					accept: "image/*,.pdf,application/pdf,.musicxml,.mxl,.xml",
					className: "hidden",
					"data-testid": "analyze-file-input",
					onChange: (e) => {
						const f = e.target.files?.[0];
						e.target.value = "";
						if (f) handleAnalyzeFileSelected(f);
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault();
						if (modeId === "analyze") {
							if (analyzeCanRun) runAnalyze();
							return;
						}
					},
					className: "relative panel-sharp shadow-[0_30px_80px_-40px_rgba(0,0,0,0.7)]",
					"data-testid": "composer-form",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-5 py-2.5 border-b border-[color:var(--border-dark)] text-[10.5px] uppercase tracking-[0.24em] text-muted-dark",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(mode.icon, {
									size: 11,
									className: "text-[color:var(--gold)]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-paper/90 font-semibold",
									children: mode.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "opacity-60",
									children: "· prompt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-auto normal-case tracking-normal text-[10.5px]",
									children: [text.length, " / 2000"]
								})
							]
						}),
						modeId === "analyze" && analyzeUpload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5 px-5 py-2.5 border-b border-[color:var(--border-dark)] bg-[color:var(--bg)]/40",
							"data-testid": "analyze-file-chip",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileMusic, {
									size: 13,
									className: "text-[color:var(--gold)] shrink-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[12.5px] text-paper/90 truncate",
									children: analyzeUpload.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10.5px] text-muted-dark shrink-0",
									children: analyzeUpload.kind === "pdf" ? `${analyzeUpload.pdfPages.length} page${analyzeUpload.pdfPages.length === 1 ? "" : "s"}` : analyzeUpload.kind === "musicxml" ? "MusicXML" : "image"
								}),
								analyzeStage === "reading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									size: 12,
									className: "animate-spin text-muted-dark shrink-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: resetAnalyzeUpload,
									className: "ml-auto grid h-6 w-6 place-items-center text-muted-dark hover:text-paper transition-colors shrink-0",
									"aria-label": "Remove file",
									"data-testid": "analyze-file-remove",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 13 })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: text,
							onChange: (e) => setText(e.target.value),
							placeholder: mode.placeholder,
							rows: 3,
							"data-testid": "composer-input",
							className: "block w-full resize-none bg-transparent px-5 py-4 text-[15px] leading-relaxed placeholder:text-muted-dark focus:outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 px-4 py-3 border-t border-[color:var(--border-dark)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-testid": "composer-attach",
									onClick: modeId === "analyze" ? openAnalyzeFilePicker : void 0,
									className: "grid h-9 w-9 place-items-center text-muted-dark hover:text-paper transition-colors",
									"aria-label": "Attach",
									title: modeId === "analyze" ? "Upload a score (PDF, image, or MusicXML)" : void 0,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"data-testid": "composer-mic",
									disabled: true,
									title: "Voice prompts — coming soon",
									className: "grid h-9 w-9 place-items-center text-muted-dark/50 cursor-not-allowed",
									"aria-label": "Voice (coming soon)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 w-px bg-[color:var(--border-dark)] mx-1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
									children: [mode.actions.length, " quick actions ↓"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-auto flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:block text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
										children: modeId === "analyze" ? "Upload, then Run" : "Enter to send"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: modeId === "analyze" ? !analyzeCanRun : !text.trim(),
										"data-testid": "composer-send",
										className: "inline-flex items-center gap-2 px-4 h-9 text-[11.5px] font-bold uppercase tracking-[0.18em] transition disabled:opacity-40",
										style: {
											background: "var(--gold)",
											color: "var(--ink)",
											borderRadius: "2px"
										},
										children: modeId === "analyze" && analyzeStage === "analyzing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Analyzing ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
											size: 13,
											className: "animate-spin"
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Run ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											size: 13,
											strokeWidth: 2.5
										})] })
									})]
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "relative mx-auto w-full max-w-[1240px] px-6 pt-10 pb-6",
				"data-testid": "actions-section",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
									children: "Quick actions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10.5px] uppercase tracking-[0.22em] text-muted-dark",
									children: ["for ", mode.label]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
								"data-testid": "quick-actions",
								children: mode.actions.map(({ icon: Icon, label, hint }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									"data-testid": `quick-action-${i}`,
									title: modeId === "analyze" && label === "Upload a score" ? void 0 : modeId === "compose" ? "Coming soon" : "Available in the Classic Studio",
									onClick: modeId === "analyze" && label === "Upload a score" ? openAnalyzeFilePicker : modeId === "compose" ? void 0 : () => {
										window.location.href = "/classic";
									},
									className: "group relative overflow-hidden panel-sharp p-5 text-left hover:border-[color:var(--gold)]/45 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute -right-6 -top-6 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity",
										style: { background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 35%, transparent), transparent 65%)" }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex items-start gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid place-items-center h-9 w-9 bg-[color:var(--bg)] border border-[color:var(--border-dark)]",
												style: { borderRadius: "2px" },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
													size: 14,
													className: "text-[color:var(--gold)]"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[13.5px] font-semibold text-paper",
													children: label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11.5px] text-muted-dark leading-snug mt-0.5",
													children: hint
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												size: 13,
												className: "text-muted-dark opacity-0 group-hover:opacity-100 group-hover:text-[color:var(--gold)] transition-all"
											})
										]
									})]
								}, label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8",
								"data-testid": "suggestions",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow text-muted-dark mb-3",
									children: "Try asking"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col gap-1.5",
									children: mode.suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setText(s),
										"data-testid": `suggestion-${s.slice(0, 20)}`,
										className: "group flex items-center gap-3 border-l-2 border-[color:var(--border-dark)] hover:border-[color:var(--gold)] pl-4 pr-3 py-2.5 text-left text-[13.5px] text-muted-dark hover:text-paper transition-all",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "italic serif text-[color:var(--gold)]/80 group-hover:text-[color:var(--gold)]",
												children: "“"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex-1",
												children: s
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												size: 12,
												className: "opacity-0 group-hover:opacity-100 transition-opacity"
											})
										]
									}, s))
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "lg:col-span-5 lg:sticky lg:top-24 h-fit",
						"data-testid": "continue-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden border border-[color:var(--border-gold)]",
							style: {
								background: "linear-gradient(180deg, var(--bg-3) 0%, var(--bg-2) 100%)",
								borderRadius: "3px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[color:var(--gold)] via-[color:var(--bronze)] to-transparent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative p-6",
									children: modeId === "analyze" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyzeResultBody, {
										stage: analyzeStage,
										upload: analyzeUpload,
										error: analyzeError,
										result: analyzeResult,
										elapsed: analyzeElapsed,
										part,
										onUpload: openAnalyzeFilePicker,
										onRetry: runAnalyze,
										onReset: resetAnalyzeUpload
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-testid": "mode-status",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
												children: modeId === "compose" ? "In development" : "Available now"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
												className: "mt-4 serif text-[26px] leading-[1.05] font-medium text-paper",
												children: [mode.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-[color:var(--gold)] italic text-[18px] font-light mt-1",
													children: mode.tagline
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-4 text-[13px] leading-relaxed text-muted-dark",
												children: [
													modeId === "sightread" && "Measure-by-measure solfège playback — in real rhythm at the written tempo, with the current note highlighted — is live in the Classic Studio. Upload a MusicXML score there and press Play.",
													modeId === "ear" && "Interval and chord ear-training drills run in the Classic Studio today. A native drill for this view is on the roadmap.",
													modeId === "vocal" && "Record or upload a take and get real pitch, tone, breath, rhythm and diction feedback — it's fully working.",
													modeId === "compose" && "Drafting exercises, reharmonizing charts and voicing SATB from a lead sheet isn't built yet. We won't fake it — this one is genuinely coming later."
												]
											}),
											modeId === "vocal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/vocal-coach",
												"data-testid": "mode-cta",
												className: "mt-6 inline-flex items-center gap-2 px-4 h-9 text-[11.5px] font-bold uppercase tracking-[0.18em]",
												style: {
													background: "var(--gold)",
													color: "var(--ink)",
													borderRadius: "2px"
												},
												children: ["Go to Vocal Coach ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 13 })]
											}) : modeId === "compose" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-6 inline-flex items-center gap-2 px-4 h-9 text-[11.5px] font-bold uppercase tracking-[0.18em] border border-[color:var(--border-dark)] text-muted-dark",
												style: { borderRadius: "2px" },
												children: "Not ready yet"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: "/classic",
												"data-testid": "mode-cta",
												className: "mt-6 inline-flex items-center gap-2 px-4 h-9 text-[11.5px] font-bold uppercase tracking-[0.18em]",
												style: {
													background: "var(--gold)",
													color: "var(--ink)",
													borderRadius: "2px"
												},
												children: ["Open Classic Studio ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 13 })]
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative h-14 border-t border-[color:var(--border-dark)] overflow-hidden",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: parchment_texture_default,
											alt: "",
											"aria-hidden": true,
											className: "absolute inset-0 h-full w-full object-cover opacity-25"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute inset-0",
											style: { background: "linear-gradient(90deg, var(--bg-2) 0%, transparent 40%, transparent 60%, var(--bg-2) 100%)" }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative flex items-center gap-3 h-full px-6 text-[10.5px] uppercase tracking-[0.24em] text-muted-dark",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
												size: 12,
												className: "text-[color:var(--gold)]"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Movable-do solfège · built for choir" })]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "/classic",
							"data-testid": "classic-link",
							className: "group mt-4 flex items-center justify-between gap-3 border border-[color:var(--border-dark)] px-4 py-4 hover:border-[color:var(--gold)]/45 transition-colors",
							style: {
								borderRadius: "3px",
								background: "var(--bg-2)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[13.5px] font-semibold text-paper",
								children: "Classic Studio"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[11px] text-muted-dark mt-0.5",
								children: "Measure-by-measure playback, transpose, sight-read, pitch guide"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 15,
								className: "text-muted-dark group-hover:text-[color:var(--gold)] transition-colors"
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative mt-16",
				"data-testid": "interlude-section",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider-cool-to-warm" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative overflow-hidden",
						style: {
							background: "var(--parchment)",
							color: "var(--ink)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: parchment_texture_default,
								alt: "",
								"aria-hidden": true,
								className: "absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-multiply"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0",
								style: { background: "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--cream) 40%, transparent) 100%)" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mx-auto max-w-[1240px] px-6 py-16 lg:py-20 grid grid-cols-12 gap-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-12 md:col-span-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow eyebrow-dot text-[color:var(--bronze)]",
										children: "Sight-reader's field notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-4 serif-tight text-[42px] md:text-[52px] leading-[0.98] font-medium text-[color:var(--ink)]",
										children: "The eight bars that always bite."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8",
									children: [
										{
											n: "01",
											h: "Read the key first",
											b: "Before a single note, know your two flats or three sharps. Solfai locks the movable-do frame automatically."
										},
										{
											n: "02",
											h: "Hunt the sequences",
											b: "Melodic sequences look intimidating and read easy. Spot them and half the passage falls into place."
										},
										{
											n: "03",
											h: "Rhythm before pitch",
											b: "Speak solfège in rhythm at 60 bpm. Add pitch only when the rhythm is boringly automatic."
										},
										{
											n: "04",
											h: "Anchor with cadences",
											b: "Every phrase closes on a cadence. Find them first and the phrases outline themselves."
										}
									].map((tip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "serif italic text-[46px] font-light leading-none text-[color:var(--bronze)]/80 min-w-[52px]",
											children: tip.n
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "serif text-[19px] font-medium text-[color:var(--ink)] mb-1",
											children: tip.h
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[13.5px] leading-relaxed text-[color:var(--ink-soft)]",
											children: tip.b
										})] })]
									}, tip.n))
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "divider-warm-to-cool" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative mx-auto max-w-[1240px] px-6 py-16",
				"data-testid": "closing-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-12 gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-12 lg:col-span-5 relative overflow-hidden border border-[color:var(--border-gold)]",
						style: { borderRadius: "3px" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: bronze_material_default,
								alt: "",
								"aria-hidden": true,
								className: "h-64 lg:h-full w-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-0",
								style: { background: "linear-gradient(180deg, transparent 30%, var(--bg) 100%)" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute bottom-5 left-5 right-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
									children: "Studio-grade"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 serif text-[22px] font-medium text-paper leading-tight",
									children: [
										"Bronze-plated confidence ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										" for the section leader."
									]
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-12 lg:col-span-7 grid grid-cols-1 gap-3",
						children: [
							{
								k: "01",
								h: "Movable-do that respects modes",
								b: "Handles minor keys, church modes and mixture without turning into a spreadsheet."
							},
							{
								k: "02",
								h: "Voice-part aware",
								b: "Ask for the tenor line and get the tenor line — with pitch cues, not just notes on a page."
							},
							{
								k: "03",
								h: "Rhythm you can feel",
								b: "Metronome, count-in, and a phrase-loop that adapts to how you're actually singing."
							}
						].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "group flex items-start gap-5 border-t border-[color:var(--border-dark)] pt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mono-cap text-[11px] uppercase tracking-[0.24em] text-[color:var(--gold)] min-w-[28px]",
									children: row.k
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "serif text-[20px] font-medium text-paper mb-1",
										children: row.h
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[13.5px] text-muted-dark leading-relaxed",
										children: row.b
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
									size: 16,
									className: "text-muted-dark group-hover:text-[color:var(--gold)] transition-colors mt-1"
								})
							]
						}, row.k))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 text-center text-[11px] uppercase tracking-[0.28em] text-muted-dark",
					"data-testid": "footer-disclaimer",
					children: "Solfai · a sight-reading studio · Solfai can misread messy scans. Verify key and rhythm before performance."
				})]
			})
		]
	})] });
}
function DifficultyMeter({ label, value }) {
	const pct = Math.max(0, Math.min(100, value / 10 * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 mb-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-16 shrink-0 text-[10px] uppercase tracking-wide text-muted-dark",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative h-[3px] flex-1 overflow-hidden bg-[color:var(--bg)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--bronze)]",
					style: { width: `${pct}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-4 shrink-0 text-right text-[10.5px] mono-cap text-paper/80",
				children: value
			})
		]
	});
}
function AnalyzeResultBody({ stage, upload, error, result, elapsed, part, onUpload, onRetry, onReset }) {
	if (stage === "done" && result) {
		const s = result.structured;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
					children: "Analysis complete"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onReset,
					"data-testid": "analyze-new-upload",
					className: "text-[10.5px] uppercase tracking-[0.22em] text-muted-dark hover:text-paper transition-colors",
					children: "New upload"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "mt-4 serif text-[22px] leading-[1.15] font-medium text-paper",
				"data-testid": "analyze-result-title",
				children: [s.pieceTitle || "Untitled score", s.composerName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[color:var(--gold)] italic text-[15px] font-light mt-1",
					children: s.composerName
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-3 gap-px bg-[color:var(--border-dark)]",
				"data-testid": "analyze-stat-grid",
				children: [
					{
						k: "Key",
						v: s.keySignature.split(" ")[0]
					},
					{
						k: "Meter",
						v: s.timeSignature
					},
					{
						k: "Tempo",
						v: s.tempo
					}
				].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-[color:var(--bg-2)] p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9.5px] uppercase tracking-[0.24em] text-muted-dark",
						children: st.k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 serif text-[18px] font-medium text-paper leading-tight",
						children: st.v
					})]
				}, st.k))
			}),
			s.keyWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-start gap-1.5 text-[11px] text-[color:var(--gold)]",
				"data-testid": "analyze-key-warning",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 12,
					className: "shrink-0 mt-0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.keyWarning })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark mb-2",
						children: "Difficulty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DifficultyMeter, {
						label: "Overall",
						value: s.difficulty.overall
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DifficultyMeter, {
						label: "Rhythm",
						value: s.difficulty.rhythm
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DifficultyMeter, {
						label: "Range",
						value: s.difficulty.range
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DifficultyMeter, {
						label: "Intervals",
						value: s.difficulty.intervals
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DifficultyMeter, {
						label: "Text",
						value: s.difficulty.text
					})
				]
			}),
			s.firstNotesSolfege && s.firstNotesSolfege.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				"data-testid": "analyze-first-notes",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "eyebrow text-muted-dark mb-2",
					children: ["Starting notes · ", part]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: s.firstNotesSolfege.map((sol, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "px-2.5 py-1 text-[11.5px] font-semibold border border-[color:var(--border-dark)] text-paper/90",
						style: { borderRadius: "2px" },
						children: [sol, s.firstNotes?.[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-normal text-muted-dark",
							children: [" · ", s.firstNotes[i]]
						})]
					}, i))
				})]
			}),
			s.overview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-[12.5px] leading-relaxed text-muted-dark line-clamp-6",
				"data-testid": "analyze-overview",
				children: s.overview
			}),
			s.practiceTips.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				"data-testid": "analyze-practice-tips",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow text-muted-dark mb-2",
					children: "Practice tips"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5",
					children: s.practiceTips.slice(0, 5).map((tip, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2 text-[12px] text-paper/85",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[color:var(--gold)]",
							children: "·"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tip })]
					}, i))
				})]
			}),
			s.pronunciation?.needsGuide && s.pronunciation.words.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				"data-testid": "analyze-pronunciation",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "eyebrow text-muted-dark mb-2",
					children: ["Pronunciation · ", s.pronunciation.language]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-x-3 gap-y-1 text-[11.5px]",
					children: s.pronunciation.words.slice(0, 12).map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-paper/85",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "italic text-[color:var(--gold)]",
								children: w.word
							}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-dark",
								children: w.approx
							})
						]
					}, i))
				})]
			})
		] });
	}
	if (stage === "analyzing") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-start",
		"data-testid": "analyze-loading",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
				children: "Analyzing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					size: 20,
					className: "animate-spin text-[color:var(--gold)]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "serif text-[18px] text-paper",
					children: "Reading your score…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] text-muted-dark mono-cap",
					children: [elapsed, "s elapsed"]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-[12.5px] leading-relaxed text-muted-dark",
				children: [
					"Full scores can take up to a minute — Solfai cross-checks the key, tempo, and your ",
					part.toLowerCase(),
					" part before responding."
				]
			})
		]
	});
	if (stage === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "analyze-error",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
				children: "Analysis failed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 16,
					className: "shrink-0 mt-0.5 text-[color:var(--gold)]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] leading-relaxed text-paper/85",
					children: error || "Something went wrong. Please try again."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: upload ? onRetry : onUpload,
				"data-testid": "analyze-retry",
				className: "mt-5 inline-flex items-center gap-2 px-4 h-9 text-[11.5px] font-bold uppercase tracking-[0.18em] transition",
				style: {
					background: "var(--gold)",
					color: "var(--ink)",
					borderRadius: "2px"
				},
				children: upload ? "Try again" : "Upload a score"
			})
		]
	});
	if (stage === "ready" && upload) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "analyze-ready",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
				children: "Ready to analyze"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 serif text-[20px] leading-[1.15] font-medium text-paper truncate",
				children: upload.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-[12.5px] text-muted-dark",
				children: [
					upload.kind === "pdf" ? `${upload.pdfPages.length} page${upload.pdfPages.length === 1 ? "" : "s"} ready` : "Image ready",
					" · analyzing for ",
					part
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-[12px] text-muted-dark",
				children: [
					"Hit ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-paper/85 font-semibold",
						children: "Run"
					}),
					" in the composer above to analyze."
				]
			})
		]
	});
	if (stage === "reading") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		"data-testid": "analyze-reading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			size: 18,
			className: "animate-spin text-[color:var(--gold)]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-[13px] text-paper/85",
			children: [
				"Reading ",
				upload?.name || "file",
				"…"
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "analyze-idle",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
				children: "Ready when you are"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-4 serif text-[22px] leading-[1.15] font-medium text-paper",
				children: "Upload a score to begin."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-[12.5px] leading-relaxed text-muted-dark",
				children: "Drop a PDF or photo of your sheet music and Solfai returns the key, tempo, difficulty, and starting notes for your part."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: onUpload,
				"data-testid": "analyze-idle-upload",
				className: "mt-5 inline-flex items-center gap-2 px-4 h-9 text-[11.5px] font-bold uppercase tracking-[0.18em] transition",
				style: {
					background: "var(--gold)",
					color: "var(--ink)",
					borderRadius: "2px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 13 }), " Upload a score"]
			})
		]
	});
}
//#endregion
export { Home as component };
