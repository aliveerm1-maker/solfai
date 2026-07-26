import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Clock3, D as FileMusic, E as Hammer, F as ArrowRight, N as BookOpen, O as Ear, P as ArrowUp, S as Lightbulb, T as Languages, _ as Music2, b as LoaderCircle, d as RefreshCw, h as Paperclip, m as PenLine, r as TriangleAlert, s as Sparkles, t as X, v as Mic, w as LayoutList, x as ListMusic } from "../_libs/lucide-react.mjs";
import { n as ClefMark, r as StaffLines, t as AppLayout } from "./StaffLines-xn9fxfO3.mjs";
import { a as postAnalyze, i as pdfFileToPages, o as postParseMusicXML, r as imageFileToBase64, s as postSightReading, t as AnalyzeApiError } from "./analyzeClient-CANo0PQL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DLFzGm58.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Error boundary for optional decorative 3D.
*
* The hero clef's <Environment preset="apartment"> fetches an HDRI from an
* external CDN at runtime. If that fetch fails — offline, blocked CDN,
* corporate proxy, flaky network — the throw propagates to the route error
* boundary and replaces the ENTIRE page with "This page didn't load".
*
* A decorative graphic must never be able to take down the app, so this
* catches it and falls back to the still image instead.
*/
var SafeScene = class extends import_react.Component {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch(error) {
		if (typeof console !== "undefined") console.warn("[SafeScene] 3D scene failed, using static fallback:", error);
	}
	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
};
var clef_hero_glass_default = "/assets/clef_hero_glass-C4JJaAQo.png";
var TrebleClef3D = (0, import_react.lazy)(() => import("./TrebleClef3D-zbN2ifz0.mjs").then((m) => ({ default: m.TrebleClef3D })));
var PARTS = [
	"Soprano",
	"Alto",
	"Tenor",
	"Bass",
	"All Parts"
];
function HeroEmptyState({ part, onPart, children }) {
	const clefFallback = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: clef_hero_glass_default,
		alt: "Glass and bronze treble clef",
		className: "w-full max-w-[300px] lg:max-w-[400px] object-contain float-slow",
		style: {
			mixBlendMode: "lighten",
			maskImage: "radial-gradient(circle at 50% 45%, black 55%, transparent 78%)",
			WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 55%, transparent 78%)"
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto w-full max-w-[1080px] px-5 md:px-8 min-h-full flex flex-col justify-center py-10",
		"data-testid": "hero-empty-state",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-0 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0",
					style: { background: "radial-gradient(ellipse 45% 55% at 82% 24%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 62%), radial-gradient(ellipse 40% 50% at 6% 82%, color-mix(in oklab, var(--bronze) 14%, transparent), transparent 60%)" }
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffLines, {
					className: "absolute left-0 right-0 top-[30%] h-24 w-full",
					opacity: .1
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative grid grid-cols-12 gap-6 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow eyebrow-dot text-[color:var(--gold)] fade-up",
							"data-testid": "hero-eyebrow",
							children: "Solfai · sight-reading studio"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-5 serif-tight text-[46px] leading-[0.98] font-medium tracking-tight text-paper sm:text-[62px] lg:text-[68px] fade-up",
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
							className: "mt-6 max-w-xl text-[15px] leading-relaxed text-muted-dark fade-up",
							"data-testid": "hero-subheadline",
							children: "Drop a score — a photo, PDF or MusicXML. Solfai returns your part in movable-do solfège, the starting pitch, tempo, and the eight measures most likely to bite you."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8",
							"data-testid": "voice-part-picker",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "eyebrow text-muted-dark mb-3",
								children: "Voice part"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: PARTS.map((p) => {
									const active = p === part;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => onPart(p),
										"data-testid": `voice-part-${p.toLowerCase().replace(/\s/g, "-")}`,
										"aria-pressed": active,
										className: "px-4 py-2 text-[12px] font-semibold uppercase tracking-widest transition-colors " + (active ? "bg-[color:var(--gold)] text-[color:var(--ink)]" : "border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/50"),
										style: { borderRadius: "2px" },
										children: p
									}, p);
								})
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-12 lg:col-span-5 relative flex items-center justify-center min-h-[220px] lg:min-h-[420px]",
					"data-testid": "hero-clef",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 pointer-events-none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute inset-6 rounded-[50%] blur-3xl opacity-70",
								style: { background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 45%, transparent), transparent 65%)" }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SafeScene, {
							fallback: clefFallback,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: clefFallback,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "relative h-full w-full max-w-[380px] min-h-[300px] lg:min-h-[420px] flex items-center justify-center",
									"data-testid": "hero-clef-3d",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrebleClef3D, {
										quality: "hero",
										rotationSpeed: .35,
										floatIntensity: .28
									})
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute bottom-2 right-2 hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-dark",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-8 bg-[color:var(--gold)]/60" }), "Glass clef · study Nº1"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mt-9 max-w-[760px]",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative mt-4 text-[11px] text-muted-dark max-w-[760px]",
				"data-testid": "hero-disclaimer",
				children: "Solfai can misread messy scans — verify key and rhythm before performance."
			})
		]
	});
}
function ResultsCard({ result, part }) {
	const s = result.structured;
	const stats = [
		{
			k: "Key",
			v: s.keySignature.split(" (")[0]
		},
		{
			k: "Meter",
			v: s.timeSignature.split(" (")[0]
		},
		{
			k: "Tempo",
			v: s.tempo
		},
		{
			k: "Dynamics",
			v: s.dynamics
		}
	];
	const diff = [
		{
			k: "Overall",
			v: s.difficulty.overall
		},
		{
			k: "Rhythm",
			v: s.difficulty.rhythm
		},
		{
			k: "Range",
			v: s.difficulty.range
		},
		{
			k: "Intervals",
			v: s.difficulty.intervals
		},
		{
			k: "Text",
			v: s.difficulty.text
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 overflow-hidden border border-[color:var(--border-dark)]",
		style: {
			borderRadius: "4px",
			background: "linear-gradient(180deg, var(--bg-2) 0%, color-mix(in oklab,var(--bg-2) 70%, var(--bg)) 100%)"
		},
		"data-testid": "results-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-4 py-2.5 border-b border-[color:var(--border-dark)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "eyebrow eyebrow-dot text-[color:var(--gold)] !text-[9.5px]",
					children: ["Analysis · ", part]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "ml-auto serif italic text-[13px] text-paper/70 truncate max-w-[55%]",
					children: s.pieceTitle
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-px bg-[color:var(--border-dark)]",
				children: stats.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-[color:var(--bg-2)] px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[9px] uppercase tracking-[0.22em] text-muted-dark",
						children: st.k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 serif text-[16px] font-medium text-paper leading-tight break-words",
						children: st.v
					})]
				}, st.k))
			}),
			s.keyWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-1.5 px-4 py-2.5 text-[11px] text-[color:var(--gold)] border-t border-[color:var(--border-dark)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 12,
					className: "shrink-0 mt-0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.keyWarning })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-3.5 border-t border-[color:var(--border-dark)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-x-5 gap-y-2.5",
					children: diff.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 min-w-[104px] flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-16 shrink-0 text-[9.5px] uppercase tracking-[0.14em] text-muted-dark",
								children: d.k
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative h-[3px] flex-1 overflow-hidden bg-[color:var(--bg)]",
								style: { borderRadius: "2px" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-y-0 left-0 bg-gradient-to-r from-[color:var(--gold)] to-[color:var(--bronze)]",
									style: { width: `${Math.max(0, Math.min(100, d.v / 10 * 100))}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-4 text-right text-[10.5px] mono-cap text-paper/80",
								children: d.v
							})
						]
					}, d.k))
				})
			})
		]
	});
}
var ARTIFACT_META = {
	overview: {
		label: "Overview",
		icon: LayoutList,
		blurb: "Key, meter, tempo & difficulty"
	},
	solfege: {
		label: "Solfège breakdown",
		icon: Music2,
		blurb: "Your part in movable-do"
	},
	rhythm: {
		label: "Rhythm & meter",
		icon: Clock3,
		blurb: "Tempo, counting & changes"
	},
	measures: {
		label: "Measure by measure",
		icon: ListMusic,
		blurb: "One bar at a time"
	},
	tips: {
		label: "Practice tips",
		icon: Lightbulb,
		blurb: "Where to spend your time"
	},
	composer: {
		label: "Composer & context",
		icon: BookOpen,
		blurb: "History behind the piece"
	},
	pronunciation: {
		label: "Pronunciation",
		icon: Languages,
		blurb: "Diction, word by word"
	},
	eartraining: {
		label: "Ear training",
		icon: Ear,
		blurb: "Interval & chord drills"
	},
	vocalcoach: {
		label: "Vocal Coach",
		icon: Mic,
		blurb: "Feedback on your take"
	},
	sightread: {
		label: "Sight-reading drill",
		icon: PenLine,
		blurb: "A fresh exercise to read cold"
	}
};
function ArtifactTriggerCard({ artifact, label, active, onOpen }) {
	const meta = ARTIFACT_META[artifact];
	const Icon = meta.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onOpen(artifact),
		"data-testid": `artifact-trigger-${artifact}`,
		"aria-pressed": active,
		className: "group mt-3 w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors " + (active ? "border border-[color:var(--gold)]/55 bg-[color:var(--gold)]/12" : "border border-[color:var(--border-gold)] bg-[color:var(--gold)]/6 hover:bg-[color:var(--gold)]/12 hover:border-[color:var(--gold)]/45"),
		style: { borderRadius: "4px" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid place-items-center h-9 w-9 shrink-0 border border-[color:var(--border-gold)]",
				style: {
					borderRadius: "3px",
					background: "color-mix(in oklab, var(--gold) 10%, transparent)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					size: 16,
					className: "text-[color:var(--gold)]"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[13.5px] font-semibold text-paper leading-tight",
					children: label ?? `Open ${meta.label}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[11px] text-muted-dark leading-tight mt-0.5",
					children: meta.blurb
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
				size: 16,
				className: "shrink-0 text-[color:var(--gold)] group-hover:translate-x-1 transition-transform"
			})
		]
	});
}
function ChatMessage({ message, result, part, openArtifact, onOpenArtifact }) {
	if (message.role === "user") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-end",
		"data-testid": "chat-message-user",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-[85%] min-w-0",
			children: [message.upload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 ml-auto flex items-center gap-2 px-3 py-2 border border-[color:var(--border-gold)] w-fit",
				style: {
					borderRadius: "3px",
					background: "color-mix(in oklab, var(--gold) 7%, transparent)"
				},
				"data-testid": "chat-user-upload",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileMusic, {
						size: 13,
						className: "text-[color:var(--gold)] shrink-0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[12.5px] text-paper/90 truncate max-w-[220px]",
						children: message.upload.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9.5px] uppercase tracking-[0.16em] text-muted-dark",
						children: message.upload.kind
					})
				]
			}), message.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-4 py-2.5 border border-[color:var(--border-dark)] text-[14px] leading-relaxed text-paper",
				style: {
					borderRadius: "12px 12px 3px 12px",
					background: "var(--bg-2)"
				},
				children: message.text
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3.5",
		"data-testid": "chat-message-assistant",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid place-items-center h-8 w-8 shrink-0 mt-0.5 border border-[color:var(--gold)]/30",
			style: {
				borderRadius: "3px",
				background: "var(--bg-2)"
			},
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClefMark, { className: "h-[18px] w-[18px]" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-w-0 flex-1 pt-0.5",
			children: message.status === "analyzing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				"data-testid": "chat-analyzing",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					size: 15,
					className: "animate-spin text-[color:var(--gold)]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13.5px] text-muted-dark",
					children: message.text || "Reading your score…"
				})]
			}) : message.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2.5",
				"data-testid": "chat-error",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 15,
					className: "shrink-0 mt-0.5 text-[color:var(--gold)]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13.5px] leading-relaxed text-paper/85",
					children: message.errorText || "Something went wrong. Please try again."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				message.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[14.5px] leading-[1.7] text-paper/90 whitespace-pre-line",
					"data-testid": "chat-assistant-text",
					children: message.text
				}),
				message.showResultsCard && result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsCard, {
					result,
					part
				}),
				message.artifact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactTriggerCard, {
					artifact: message.artifact,
					active: openArtifact === message.artifact,
					onOpen: onOpenArtifact
				})
			] })
		})]
	});
}
var FOLLOW_UPS = [
	"Show me the solfège",
	"Hardest 8 measures for me",
	"Who's the composer?",
	"How do I pronounce the text?",
	"Rhythm & meter breakdown"
];
function ChatThread({ messages, result, part, openArtifact, onOpenArtifact, onSuggestion }) {
	const endRef = (0, import_react.useRef)(null);
	const lastMsg = messages[messages.length - 1];
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end"
		});
	}, [
		messages.length,
		lastMsg?.status,
		lastMsg?.showResultsCard
	]);
	const showSuggestions = !!result && lastMsg?.role === "assistant" && !lastMsg.status;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-3xl px-5 md:px-6 py-8 flex flex-col gap-7",
		"data-testid": "chat-thread",
		children: [
			messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMessage, {
				message: m,
				result,
				part,
				openArtifact,
				onOpenArtifact
			}, m.id)),
			showSuggestions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 pl-[46px]",
				"data-testid": "chat-suggestions",
				children: FOLLOW_UPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => onSuggestion(s),
					"data-testid": `chat-suggestion-${s.slice(0, 12).toLowerCase().replace(/[^a-z]/g, "-")}`,
					className: "px-3 py-1.5 text-[12px] text-muted-dark border border-[color:var(--border-dark)] hover:text-paper hover:border-[color:var(--gold)]/45 transition-colors",
					style: { borderRadius: "999px" },
					children: s
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
		]
	});
}
function Composer$1({ value, onChange, onSubmit, onFileSelected, attachment, onRemoveAttachment, reading = false, busy = false, placeholder, variant = "chat", autoFocus = false }) {
	const fileRef = (0, import_react.useRef)(null);
	const canSend = (!!value.trim() || !!attachment) && !busy && !reading;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			if (canSend) onSubmit();
		},
		"data-testid": "composer-form",
		className: "relative panel-sharp shadow-[0_30px_80px_-40px_rgba(0,0,0,0.75)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: "image/*,.pdf,application/pdf,.musicxml,.mxl,.xml",
				className: "hidden",
				"data-testid": "composer-file-input",
				onChange: (e) => {
					const f = e.target.files?.[0];
					e.target.value = "";
					if (f) onFileSelected(f);
				}
			}),
			attachment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-2.5 px-4 pt-3.5",
				"data-testid": "composer-attachment",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 px-3 py-1.5 border border-[color:var(--border-gold)] max-w-full",
					style: {
						borderRadius: "2px",
						background: "color-mix(in oklab, var(--gold) 6%, transparent)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileMusic, {
							size: 13,
							className: "text-[color:var(--gold)] shrink-0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[12.5px] text-paper/90 truncate",
							children: attachment.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-[0.16em] text-muted-dark shrink-0",
							children: attachment.kind
						}),
						reading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							size: 12,
							className: "animate-spin text-muted-dark shrink-0"
						}),
						onRemoveAttachment && !reading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onRemoveAttachment,
							"aria-label": "Remove file",
							"data-testid": "composer-remove-attachment",
							className: "grid h-5 w-5 place-items-center text-muted-dark hover:text-paper transition-colors shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 12 })
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value,
				onChange: (e) => onChange(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						if (canSend) onSubmit();
					}
				},
				autoFocus,
				rows: variant === "hero" ? 2 : 1,
				placeholder: placeholder ?? "Ask about your score — or drop a new one…",
				"data-testid": "composer-input",
				className: "block w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[15px] leading-relaxed placeholder:text-muted-dark focus:outline-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3 py-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						"data-testid": "composer-attach-button",
						title: "Upload a score (image, PDF or MusicXML)",
						"aria-label": "Attach a score",
						className: "grid h-9 w-9 place-items-center text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50 transition-colors",
						style: { borderRadius: "2px" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 16 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10.5px] uppercase tracking-[0.2em] text-muted-dark hidden sm:inline",
						children: "Image · PDF · MusicXML"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10.5px] uppercase tracking-[0.2em] text-muted-dark hidden sm:inline",
							children: busy ? "Working…" : "Enter to send"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: !canSend,
							"data-testid": "composer-send-button",
							"aria-label": "Send",
							className: "grid h-9 w-9 place-items-center transition-all disabled:opacity-30 hover:brightness-110 active:scale-95",
							style: {
								background: "var(--gold)",
								color: "var(--ink)",
								borderRadius: "2px"
							},
							children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								size: 16,
								className: "animate-spin"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {
								size: 17,
								strokeWidth: 2.5
							})
						})]
					})
				]
			})
		]
	});
}
function SectionHead({ eyebrow, title, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "eyebrow eyebrow-dot text-[color:var(--gold)]",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 serif-tight text-[30px] md:text-[38px] leading-[1.02] font-medium text-paper",
				children: title
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-[13px] leading-relaxed text-muted-dark",
				children: sub
			})
		]
	});
}
function Empty({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-dashed border-[color:var(--border-dark)] px-6 py-10 text-center",
		style: { borderRadius: "3px" },
		"data-testid": "section-empty",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "serif text-[19px] text-paper",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2.5 mx-auto max-w-md text-[12.5px] leading-relaxed text-muted-dark",
				children: body
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 flex flex-wrap items-center justify-center gap-2.5",
				children: action
			})
		]
	});
}
var btnGoldStyle = {
	background: "var(--gold)",
	color: "var(--ink)",
	borderRadius: "2px"
};
var btnGhost = "inline-flex items-center gap-2 px-4 h-9 text-[11px] font-semibold uppercase tracking-[0.18em] border border-[color:var(--border-dark)] text-paper hover:border-[color:var(--gold)]/50 transition-colors";
/**
* The one honest state for unfinished work. Says what it will do, says it
* isn't built, offers nothing false and goes nowhere. Used anywhere a
* "Classic Studio" link used to sit.
*/
function InProgress({ title, body, planned }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative overflow-hidden border border-[color:var(--border-dark)] px-6 py-8 md:px-8",
		style: {
			borderRadius: "3px",
			background: "linear-gradient(180deg, var(--bg-2) 0%, var(--bg-3) 100%)"
		},
		"data-testid": "section-in-progress",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid place-items-center h-10 w-10 shrink-0 border border-[color:var(--border-gold)]",
				style: {
					borderRadius: "2px",
					background: "color-mix(in oklab, var(--gold) 8%, transparent)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hammer, {
					size: 17,
					className: "text-[color:var(--gold)]"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "serif text-[21px] font-medium text-paper",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-1 border border-[color:var(--border-gold)] text-[color:var(--gold)]",
							style: { borderRadius: "2px" },
							children: "Still in progress"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-[13px] leading-relaxed text-muted-dark",
						children: body
					}),
					planned && planned.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-5 space-y-1.5",
						children: planned.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2.5 text-[12.5px] text-paper/75",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[color:var(--gold)]/70 mt-px",
								children: "—"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p })]
						}, p))
					})
				]
			})]
		})
	});
}
function Meter({ label, value }) {
	const pct = Math.max(0, Math.min(100, value / 10 * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 mb-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-20 shrink-0 text-[10px] uppercase tracking-wide text-muted-dark",
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
				className: "w-5 shrink-0 text-right text-[10.5px] mono-cap text-paper/80",
				children: value
			})
		]
	});
}
function StatCard({ k, v, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-[color:var(--bg-2)] p-4 " + (wide ? "col-span-2 sm:col-span-1" : ""),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[9px] uppercase tracking-[0.24em] text-muted-dark",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5 serif text-[19px] font-medium text-paper leading-tight break-words",
			children: v
		})]
	});
}
/** Solfège + note chips for one measure (or the opening notes). */
function NoteRow({ solfege, notes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1.5",
		children: solfege.map((sol, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "px-2.5 py-1 text-[11.5px] font-semibold border border-[color:var(--border-dark)] text-paper/90",
			style: { borderRadius: "2px" },
			children: [sol, notes?.[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-normal text-muted-dark",
				children: [" · ", notes[i]]
			})]
		}, i))
	});
}
function SessionSection({ id, result, part, onNewAnalysis }) {
	if (id === "sightread") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SightReading, { s: result?.structured ?? null });
	if (!result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "Nothing analyzed yet",
		body: "This view describes a specific score. Upload a photo, PDF or MusicXML file and it'll fill in — or ask for a sight-reading drill, which works without one."
	});
	const s = result.structured;
	const isXml = s.source === "musicxml";
	switch (id) {
		case "overview": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overview, {
			s,
			part
		});
		case "solfege": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Solfege, {
			s,
			part,
			isXml
		});
		case "rhythm": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rhythm, { s });
		case "measures": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Measures, {
			s,
			isXml
		});
		case "tips": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tips, {
			s,
			part
		});
		case "composer": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, { s });
		case "pronunciation": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pronunciation, { s });
		case "eartraining": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EarTraining, {});
		case "vocalcoach": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VocalCoachLink, {});
		case "ask": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AskPlaceholder, { onNewAnalysis });
		default: return null;
	}
}
function Overview({ s, part }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-overview",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				eyebrow: "Section I · Overview",
				title: s.pieceTitle || "Your score",
				sub: s.composerName ? `${s.composerName} · analyzed for ${part}` : `Analyzed for ${part}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-px bg-[color:var(--border-dark)] border border-[color:var(--border-dark)]",
				style: { borderRadius: "3px" },
				"data-testid": "overview-stats",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Key",
						v: s.keySignature
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Meter",
						v: s.timeSignature
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Tempo",
						v: s.tempo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Dynamics",
						v: s.dynamics
					})
				]
			}),
			s.keyWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start gap-2 text-[12px] text-[color:var(--gold)]",
				"data-testid": "overview-key-warning",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 13,
					className: "shrink-0 mt-0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.keyWarning })]
			}),
			s.source === "musicxml" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.18em] border border-[color:var(--border-gold)] text-[color:var(--gold)]",
				style: { borderRadius: "2px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileMusic, { size: 12 }), " MusicXML — exact notes, no guessing"]
			}),
			s.overview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 max-w-3xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow text-muted-dark mb-2.5",
					children: "What you're looking at"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[14px] leading-[1.75] text-paper/85 whitespace-pre-line",
					"data-testid": "overview-text",
					children: s.overview
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark mb-3",
						children: "Difficulty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Overall",
						value: s.difficulty.overall
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Rhythm",
						value: s.difficulty.rhythm
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Range",
						value: s.difficulty.range
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Intervals",
						value: s.difficulty.intervals
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Text",
						value: s.difficulty.text
					})
				]
			})
		]
	});
}
function Solfege({ s, part, isXml }) {
	const measures = s.measures ?? [];
	const hasFull = isXml && measures.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-solfege",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				eyebrow: "Section II · Solfège",
				title: "Movable-do, your part.",
				sub: hasFull ? `Every measure of the ${part} line, computed from the parsed notes — not generated by a language model.` : `Opening pitches for ${part}. Full measure-by-measure solfège needs exact note durations, which only a MusicXML upload provides.`
			}),
			s.firstNotesSolfege && s.firstNotesSolfege.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow text-muted-dark mb-2.5",
					children: "Starting notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteRow, {
					solfege: s.firstNotesSolfege,
					notes: s.firstNotes ?? void 0
				})]
			}),
			hasFull ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-[color:var(--border-dark)] divide-y divide-[color:var(--border-dark)]",
				style: { borderRadius: "3px" },
				"data-testid": "solfege-measures",
				children: measures.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 px-4 py-3.5 hover:bg-[color:var(--bg-2)]/50 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono-cap text-[11px] text-[color:var(--gold)] w-9 shrink-0 pt-1",
						children: String(m.num).padStart(2, "0")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteRow, {
								solfege: m.solfege || [],
								notes: m.notes
							}),
							m.lyrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-[12px] italic text-muted-dark",
								children: m.lyrics
							}),
							m.durationWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-start gap-1.5 text-[11px] text-[color:var(--gold)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									size: 11,
									className: "shrink-0 mt-0.5"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.durationWarning })]
							})
						]
					})]
				}, m.num))
			}) : !s.firstNotesSolfege?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "No solfège returned for this score",
				body: "The analyzer couldn't read clear pitches off this file. A cleaner scan — or a MusicXML export from MuseScore, which gives exact notes rather than inferred ones — will usually fix it."
			})
		]
	});
}
function Rhythm({ s }) {
	const tempoChanges = s.tempoChanges ?? [];
	const dynamicChanges = s.dynamicChanges ?? [];
	const marks = s.rehearsalMarks ?? [];
	const warnings = s.durationWarnings ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-rhythm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				eyebrow: "Section III · Rhythm & meter",
				title: "Counting, tempo, and shape.",
				sub: "Meter and tempo as printed, plus everything that changes along the way."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 gap-px bg-[color:var(--border-dark)] border border-[color:var(--border-dark)]",
				style: { borderRadius: "3px" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Time signature",
						v: s.timeSignature
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Tempo",
						v: s.tempo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						k: "Opening dynamic",
						v: s.dynamics
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark mb-3",
						children: "Rhythmic difficulty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Rhythm",
						value: s.difficulty.rhythm
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
						label: "Overall",
						value: s.difficulty.overall
					})
				]
			}),
			(tempoChanges.length > 0 || dynamicChanges.length > 0 || marks.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-9 grid gap-6 md:grid-cols-3",
				"data-testid": "rhythm-changes",
				children: [
					tempoChanges.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark mb-2.5",
						children: "Tempo changes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5",
						children: tempoChanges.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-[12.5px] text-paper/85",
							children: [t.measure != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mono-cap text-[10.5px] text-[color:var(--gold)] mr-2",
								children: ["m.", t.measure]
							}), t.display || "—"]
						}, i))
					})] }),
					dynamicChanges.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark mb-2.5",
						children: "Dynamics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5",
						children: dynamicChanges.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-[12.5px] text-paper/85",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mono-cap text-[10.5px] text-[color:var(--gold)] mr-2",
								children: ["m.", d.measure]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "italic serif",
								children: d.mark
							})]
						}, i))
					})] }),
					marks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-muted-dark mb-2.5",
						children: "Rehearsal marks"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1.5",
						children: marks.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-[12.5px] text-paper/85",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mono-cap text-[10.5px] text-[color:var(--gold)] mr-2",
								children: ["m.", r.measure]
							}), r.mark]
						}, i))
					})] })
				]
			}),
			warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-9",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow text-muted-dark mb-2.5",
					children: "Measures that don't add up"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5 max-w-2xl",
					children: warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2 text-[12px] text-[color:var(--gold)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
							size: 12,
							className: "shrink-0 mt-0.5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: w })]
					}, i))
				})]
			}),
			tempoChanges.length === 0 && dynamicChanges.length === 0 && marks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-[12.5px] text-muted-dark max-w-2xl",
				children: "No tempo or dynamic changes were found in this file. Detailed change tracking comes from MusicXML uploads — image and PDF analysis reports the opening tempo and dynamic only."
			})
		]
	});
}
function Measures({ s, isXml }) {
	const measures = s.measures ?? [];
	if (!isXml || measures.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-measures",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
			eyebrow: "Section IV · Measure by measure",
			title: "One bar at a time.",
			sub: "Practising a single measure in real rhythm needs exact note durations."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			title: "Not available for this upload",
			body: "Measure-by-measure work needs exact note durations, which only a MusicXML file (.musicxml / .mxl) carries — image and PDF analysis can't recover reliable rhythm. Export from MuseScore and upload that instead."
		})]
	});
	const totalNotes = measures.reduce((n, m) => n + (m.notes?.length || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-measures",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				eyebrow: "Section IV · Measure by measure",
				title: "One bar at a time.",
				sub: `${measures.length} measures · ${totalNotes} notes, read structurally from your MusicXML.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-7 flex flex-wrap items-center gap-3 border border-[color:var(--border-dark)] px-4 py-3",
				style: {
					borderRadius: "3px",
					background: "color-mix(in oklab, var(--gold) 4%, transparent)"
				},
				"data-testid": "measures-playback-note",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, {
					size: 15,
					className: "text-[color:var(--gold)] shrink-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[12.5px] text-muted-dark flex-1 min-w-[220px]",
					children: [
						"The notes below are exact. ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-paper/85",
							children: "Audio playback of these measures is still being built"
						}),
						" — it isn't available here yet."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3",
				"data-testid": "measures-grid",
				children: measures.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/50 p-3.5",
					style: { borderRadius: "3px" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mono-cap text-[10.5px] text-[color:var(--gold)]",
								children: ["Measure ", m.num]
							}), m.valid === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto text-[9px] uppercase tracking-[0.16em] text-[color:var(--gold)]",
								children: "check"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteRow, {
							solfege: m.solfege || [],
							notes: m.notes
						}),
						m.lyrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2.5 text-[11.5px] italic text-muted-dark",
							children: m.lyrics
						})
					]
				}, m.num))
			})
		]
	});
}
function Tips({ s, part }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-tips",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
			eyebrow: "Section V · Practice",
			title: "Where to spend your time.",
			sub: `Written for the ${part} line of this specific score.`
		}), s.practiceTips.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "max-w-3xl divide-y divide-[color:var(--border-dark)] border-y border-[color:var(--border-dark)]",
			"data-testid": "tips-list",
			children: s.practiceTips.map((tip, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono-cap text-[11px] text-[color:var(--gold)] w-7 shrink-0 pt-0.5",
					children: String(i + 1).padStart(2, "0")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13.5px] leading-relaxed text-paper/85",
					children: tip
				})]
			}, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			title: "No practice notes for this one",
			body: "The analyzer didn't return practice tips for this score. That usually means the page was too unclear to say anything specific — a cleaner scan tends to fix it."
		})]
	});
}
function Composer({ s }) {
	const hasProse = !!(s.composerBio || s.pieceInfo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-composer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				eyebrow: "Section VI · Context",
				title: s.composerName || "Composer & context",
				sub: s.pieceTitle ? `On ${s.pieceTitle}.` : void 0
			}),
			!hasProse && s.composerName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: `Credited to ${s.composerName}`,
				body: "That name came from the score file itself. No composer biography or historical write-up was returned for this piece, so there's nothing further to show here — we won't invent one."
			}),
			hasProse ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl space-y-7",
				children: [s.composerBio && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow text-muted-dark mb-2.5",
					children: "The composer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[14px] leading-[1.75] text-paper/85 whitespace-pre-line",
					"data-testid": "composer-bio",
					children: s.composerBio
				})] }), s.pieceInfo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow text-muted-dark mb-2.5",
					children: "The piece"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[14px] leading-[1.75] text-paper/85 whitespace-pre-line",
					"data-testid": "composer-piece-info",
					children: s.pieceInfo
				})] })]
			}) : !s.composerName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "No composer information",
				body: "Solfai couldn't identify the composer or the piece from this file. Scores with a printed title and composer line on the first page identify far more reliably."
			}) : null
		]
	});
}
function Pronunciation({ s }) {
	const p = s.pronunciation;
	const words = p?.words ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-pronunciation",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
			eyebrow: "Section VII · Diction",
			title: "Say it right.",
			sub: p?.language ? `Text language: ${p.language}.` : void 0
		}), words.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-3xl border border-[color:var(--border-dark)] divide-y divide-[color:var(--border-dark)]",
			style: { borderRadius: "3px" },
			"data-testid": "pronunciation-list",
			children: words.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "serif italic text-[17px] text-[color:var(--gold)] min-w-[120px]",
						children: w.word
					}),
					w.ipa && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mono-cap text-[11.5px] text-muted-dark",
						children: w.ipa
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[13px] text-paper/85",
						children: w.approx
					})
				]
			}, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			title: p?.needsGuide === false ? "No guide needed" : "No pronunciation guide",
			body: p?.needsGuide === false ? `Solfai read this text as ${p?.language || "English"} and decided a pronunciation guide wasn't necessary.` : "No lyrics were detected clearly enough to build a pronunciation guide for this score."
		})]
	});
}
/**
* Sight-reading drill — REAL. Calls POST /api/sight-reading, which generates
* the exercise in JavaScript (no model involved), so the notes and solfège are
* computed, not invented. Seeds itself from the analyzed score's key and meter
* when there is one, so the drill matches what you're actually rehearsing.
*/
function SightReading({ s }) {
	const [exercise, setExercise] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [difficulty, setDifficulty] = (0, import_react.useState)(2);
	const seedKey = s?.keySignature || "C major";
	const seedTime = s?.timeSignature || "4/4";
	const generate = (0, import_react.useCallback)(async (level) => {
		setLoading(true);
		setError(null);
		try {
			setExercise(await postSightReading({
				difficulty: level,
				key: seedKey,
				timeSignature: seedTime,
				measures: 4
			}));
		} catch (err) {
			setExercise(null);
			setError(err instanceof Error ? err.message : "Couldn't generate an exercise.");
		} finally {
			setLoading(false);
		}
	}, [seedKey, seedTime]);
	(0, import_react.useEffect)(() => {
		generate(difficulty);
	}, [generate, difficulty]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-sightread",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
				eyebrow: "Sight-reading",
				title: "Read something cold.",
				sub: s ? `Generated in ${seedKey}, ${seedTime} — the same key and meter as your score, so the drill transfers.` : `Generated in ${seedKey}, ${seedTime}. Analyze a score and drills will match its key and meter.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 mb-7",
				"data-testid": "sightread-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] uppercase tracking-[0.22em] text-muted-dark mr-1",
						children: "Difficulty"
					}),
					[
						1,
						2,
						3,
						4,
						5
					].map((lvl) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setDifficulty(lvl),
						disabled: loading,
						"data-testid": `sightread-level-${lvl}`,
						className: "h-8 w-8 text-[12px] font-semibold transition-colors disabled:opacity-50 " + (lvl === difficulty ? "bg-[color:var(--gold)] text-[color:var(--ink)]" : "border border-[color:var(--border-dark)] text-muted-dark hover:text-paper hover:border-[color:var(--gold)]/50"),
						style: { borderRadius: "2px" },
						children: lvl
					}, lvl)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => generate(difficulty),
						disabled: loading,
						"data-testid": "sightread-regenerate",
						className: "ml-auto inline-flex items-center gap-2 px-4 h-8 text-[11px] font-bold uppercase tracking-[0.18em] disabled:opacity-50",
						style: {
							background: "var(--gold)",
							color: "var(--ink)",
							borderRadius: "2px"
						},
						children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							size: 13,
							className: "animate-spin"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 13 }), loading ? "Generating" : "New drill"]
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2 text-[12.5px] text-[color:var(--gold)] mb-6",
				"data-testid": "sightread-error",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 13,
					className: "shrink-0 mt-0.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
			}),
			exercise && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-px bg-[color:var(--border-dark)] border border-[color:var(--border-dark)] mb-6",
					style: { borderRadius: "3px" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							k: "Key",
							v: exercise.key
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							k: "Meter",
							v: exercise.timeSignature
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							k: "Level",
							v: String(exercise.difficulty)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border border-[color:var(--border-dark)] divide-y divide-[color:var(--border-dark)]",
					style: { borderRadius: "3px" },
					"data-testid": "sightread-measures",
					children: exercise.measures.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-4 px-4 py-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mono-cap text-[11px] text-[color:var(--gold)] w-9 shrink-0 pt-1",
							children: String(m.num).padStart(2, "0")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteRow, {
								solfege: m.solfege || [],
								notes: m.notes
							})
						})]
					}, m.num))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-[12px] text-muted-dark max-w-2xl",
					children: "Sing it before you play it. Audio playback for drills isn't wired into this view yet — the notes and solfège above are computed by the backend, not generated by a model."
				})
			] }),
			loading && !exercise && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 text-[13px] text-muted-dark",
				"data-testid": "sightread-loading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					size: 16,
					className: "animate-spin text-[color:var(--gold)]"
				}), " Generating your drill…"]
			})
		]
	});
}
function EarTraining() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-eartraining",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
			eyebrow: "Section VIII · Ear training",
			title: "Train the interval, not the guess.",
			sub: "Interval and chord drills with adaptive difficulty."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InProgress, {
			title: "Ear training isn't built here yet",
			body: "Interval and chord drills need a playback engine and a scoring loop in this UI, and neither is written yet. There's no backend for it either, so rather than show you a drill that can't grade you, this section stays honest until it's real.",
			planned: [
				"Play an interval, name it, get scored — adaptive difficulty",
				"Drills seeded from the piece you're actually working on",
				"Weak intervals feed back into your practice tips"
			]
		})]
	});
}
function VocalCoachLink() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-vocalcoach",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
			eyebrow: "Section IX · Vocal coach",
			title: "Sing it, get real feedback.",
			sub: "Record or upload a take and get pitch, tone, breath, rhythm and diction scores from the real evaluator."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl border border-[color:var(--border-gold)] px-6 py-8",
			style: {
				borderRadius: "3px",
				background: "linear-gradient(180deg, var(--bg-2) 0%, var(--bg-3) 100%)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
					size: 26,
					className: "text-[color:var(--gold)]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 serif text-[22px] text-paper",
					children: "The Vocal Coach is fully working."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2.5 text-[13px] leading-relaxed text-muted-dark",
					children: "It opens as its own page so recording isn't interrupted by this session. Your analysis stays here — come straight back when you're done."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/vocal-coach",
					className: "inline-flex items-center gap-2 px-4 h-9 text-[11px] font-bold uppercase tracking-[0.18em] mt-6",
					style: btnGoldStyle,
					"data-testid": "goto-vocal-coach",
					children: ["Open Vocal Coach ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 13 })]
				})
			]
		})]
	});
}
function AskPlaceholder({ onNewAnalysis }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "section-ask",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
			eyebrow: "Section X · Ask",
			title: "Ask about this score.",
			sub: "A conversational panel for questions about the piece you've just analyzed."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			title: "Not built yet",
			body: "This is where you'll be able to ask follow-up questions about your score — 'why is measure 34 hard?', 'transpose my part down a third'. It isn't wired to anything yet, so it's disabled rather than pretending to answer.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: onNewAnalysis,
				className: btnGhost,
				style: { borderRadius: "2px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 13 }), " Back to analysis"]
			})
		})]
	});
}
function ArtifactPanel({ artifact, result, part, onClose, onNewAnalysis }) {
	const open = artifact !== null;
	const [shown, setShown] = (0, import_react.useState)(artifact);
	(0, import_react.useEffect)(() => {
		if (artifact) setShown(artifact);
	}, [artifact]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	const meta = shown ? ARTIFACT_META[shown] : null;
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-5 h-[53px] border-b border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/70 backdrop-blur-xl shrink-0",
		"data-testid": "artifact-panel-header",
		children: [
			meta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(meta.icon, {
				size: 16,
				className: "text-[color:var(--gold)] shrink-0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-w-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[13.5px] font-semibold text-paper leading-tight truncate",
					children: meta?.label ?? "Details"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onClose,
				"data-testid": "artifact-panel-close",
				"aria-label": "Close panel",
				className: "grid h-8 w-8 place-items-center text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50 transition-colors",
				style: { borderRadius: "2px" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex-1 min-h-0 overflow-y-auto px-5 md:px-6 py-7",
		"data-testid": "artifact-panel-body",
		children: shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionSection, {
			id: shown,
			result,
			part,
			onNewAnalysis
		}) : null
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		"data-testid": "artifact-panel",
		"data-open": open,
		className: "hidden md:flex shrink-0 flex-col border-l border-[color:var(--border-dark)] bg-[color:var(--bg)] overflow-hidden transition-[width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " + (open ? "w-[520px] opacity-100" : "w-0 opacity-0"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-[520px] h-full flex flex-col",
			children: body
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "md:hidden",
		"aria-hidden": !open,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-[90] bg-[color:var(--ink)]/60 backdrop-blur-sm transition-opacity duration-300 " + (open ? "opacity-100" : "opacity-0 pointer-events-none"),
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-y-0 right-0 z-[95] w-[92vw] max-w-[460px] flex flex-col bg-[color:var(--bg)] border-l border-[color:var(--border-dark)] shadow-[0_0_80px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " + (open ? "translate-x-0" : "translate-x-full"),
			"data-testid": "artifact-panel-mobile",
			children: body
		})]
	})] });
}
var has = (t, ...words) => words.some((w) => t.includes(w));
function routeMessage(raw, result, part) {
	const t = raw.toLowerCase().trim();
	if (has(t, "sight-read", "sight read", "sightread", "exercise", "practice reading", "read something", "new drill", "drill me")) {
		const s0 = result?.structured;
		return {
			reply: s0 ? `I'll generate a fresh sight-reading exercise in ${s0.keySignature}, ${s0.timeSignature} — same key and meter as this score, so it transfers to what you're rehearsing. Pick a difficulty in the panel, or hit New drill for another.` : "Here's a sight-reading drill. The notes and solfège are computed by the backend, not written by a model. Analyze a score and future drills will match its key and meter.",
			artifact: "sightread",
			artifactLabel: "Open sight-reading drill"
		};
	}
	if (!result) return { reply: "Upload a score first — a photo, PDF or MusicXML — and pick your voice part. Once I've read it, ask me anything about it and I'll break it down here. Or ask for a sight-reading drill — that works without a score." };
	const s = result.structured;
	if (has(t, "solfège", "solfege", "movable", "do re mi", "syllable", "sol-fa", "solfa")) {
		const open = s.firstNotesSolfege?.slice(0, 4).join(" · ");
		return {
			reply: `Your ${part} line opens on ${open ? `${open}` : "the tonic"}. I've laid out the full movable-do reading, measure by measure, from the parsed notes — open it alongside and read down the page.`,
			artifact: "solfege",
			artifactLabel: "Open Solfège breakdown"
		};
	}
	if (has(t, "rhythm", "meter", "tempo", "time signature", "counting", "beat", "pulse")) return {
		reply: `It's in ${s.timeSignature} at ${s.tempo}, marked ${s.dynamics}. The counting is gentle; the challenge is holding a steady pulse under long phrases. Full rhythm-and-meter view is ready.`,
		artifact: "rhythm",
		artifactLabel: "Open Rhythm & meter"
	};
	if (has(t, "measure by measure", "bar by bar", "each measure", "each bar", "every measure", "per measure", "measure-by-measure")) {
		const n = s.measures?.length ?? 0;
		return {
			reply: n > 0 ? `I read ${n} measures structurally from the MusicXML — exact notes, no guessing. Open the measure grid to step through them one bar at a time.` : "Measure-by-measure needs exact durations, which only a MusicXML upload carries. Open the panel for the details.",
			artifact: "measures",
			artifactLabel: "Open Measure-by-measure"
		};
	}
	if (has(t, "practice", "tip", "hardest", "trick", "difficult", "bite", "eight measure", "8 measure", "struggle", "focus")) {
		const first = s.practiceTips?.[0];
		return {
			reply: `The intervals are the hard part here (${s.difficulty.intervals}/10) — especially the rising figure in the imitative entries. ` + (first ? `Start with this: “${first}” ` : "") + `The full practice plan for the ${part} line is ready.`,
			artifact: "tips",
			artifactLabel: "Open Practice tips"
		};
	}
	if (has(t, "composer", "who wrote", "who composed", "history", "context", "about the piece", "about this piece", "background")) return {
		reply: s.composerName ? `This is ${s.pieceTitle ? `“${s.pieceTitle}” by ` : ""}${s.composerName}. There's a fuller write-up on the composer and the piece in the context panel.` : "I couldn't identify a composer from this file — but here's what context I do have.",
		artifact: "composer",
		artifactLabel: "Open Composer & context"
	};
	if (has(t, "pronounc", "pronunciation", "diction", "latin", "lyric", "text", "vowel", "say ", "how do i sing the word")) return {
		reply: s.pronunciation?.needsGuide ? `The text is ${s.pronunciation.language}. I've built a word-by-word guide with IPA and a plain-English approximation — open it and sing along.` : "No pronunciation guide was needed for this text, but here's what I found.",
		artifact: "pronunciation",
		artifactLabel: "Open Pronunciation guide"
	};
	if (has(t, "starting pitch", "start on", "first note", "where do i start", "starting note", "opening pitch", "give me my note")) {
		const note = s.firstNotes?.[0];
		const sol = s.firstNotesSolfege?.[0];
		return { reply: note ? `Your ${part} part starts on ${note}${sol ? ` — ${sol} in movable-do` : ""}. Hum it from the tonic (${s.tonic ?? "the key centre"}) to place it in your voice before the downbeat.` : `I don't have a clean starting pitch for the ${part} line from this file — a MusicXML upload gives an exact one.` };
	}
	if (has(t, "what key", "which key", "key signature", "key is", "the key")) return {
		reply: `It's in ${s.keySignature}${s.keyWarning ? ` — note: ${s.keyWarning}` : ""}. That sets your movable-do frame: ${s.tonic ?? "the tonic"} is Do.`,
		artifact: "overview",
		artifactLabel: "Open Overview"
	};
	if (has(t, "overview", "summary", "summarize", "tell me about", "difficulty", "how hard", "recap", "run down")) return {
		reply: `In short: ${s.keySignature}, ${s.timeSignature}, ${s.tempo}, overall difficulty ${s.difficulty.overall}/10 for a ${part}. The full overview — stats, difficulty meters and what you're looking at — is in the panel.`,
		artifact: "overview",
		artifactLabel: "Open Overview"
	};
	if (has(t, "ear training", "interval drill", "dictation", "quiz me", "test my ear")) return {
		reply: "Ear training isn't built into this view yet — there's no playback or scoring loop behind it, so I won't pretend to run a drill. I've opened the panel with exactly what's planned for it.",
		artifact: "eartraining",
		artifactLabel: "See Ear training status"
	};
	if (has(t, "vocal coach", "record", "sing", "grade my", "feedback on my", "am i flat", "am i sharp", "how did i sound")) return {
		reply: "The Vocal Coach can grade a real take — pitch, tone, breath, rhythm and diction. It opens as its own studio so recording isn't interrupted; here's the door to it.",
		artifact: "vocalcoach",
		artifactLabel: "Open Vocal Coach"
	};
	return { reply: "I can break this score down a few ways — the movable-do solfège for your part, rhythm & meter, a measure-by-measure grid, targeted practice tips, the composer & text, or a pronunciation guide. Ask for any of those, or say “give me the hardest measures.”" };
}
function newId(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}
function newConversation(part = "Soprano") {
	return {
		id: newId("conv"),
		title: "New analysis",
		createdAt: Date.now(),
		part,
		messages: [],
		result: null
	};
}
async function readUpload(file) {
	const lower = file.name.toLowerCase();
	const isXml = lower.endsWith(".musicxml") || lower.endsWith(".mxl") || lower.endsWith(".xml");
	const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
	if (isXml) return {
		name: file.name,
		kind: "musicxml",
		base64: null,
		mime: null,
		pdfPages: [],
		file
	};
	if (isPdf) {
		const pdfPages = await pdfFileToPages(file);
		return {
			name: file.name,
			kind: "pdf",
			base64: null,
			mime: null,
			pdfPages,
			file: null
		};
	}
	if (file.type.startsWith("image/")) {
		const { base64, mime } = await imageFileToBase64(file);
		return {
			name: file.name,
			kind: "image",
			base64,
			mime,
			pdfPages: [],
			file: null
		};
	}
	throw new Error("Please upload an image (JPG/PNG), a PDF, or a MusicXML file (.musicxml / .mxl / .xml).");
}
async function analyze(upload, part) {
	return upload.kind === "musicxml" && upload.file ? postParseMusicXML({
		file: upload.file,
		selectedPart: part
	}) : postAnalyze({
		imageBase64: upload.base64,
		imageMime: upload.mime,
		pdfPages: upload.pdfPages,
		selectedPart: part
	});
}
var STORE_KEY = "solfai.conversations.v1";
function SolfaiApp() {
	const [conversations, setConversations] = (0, import_react.useState)(() => [newConversation()]);
	const [activeId, setActiveId] = (0, import_react.useState)(() => conversations[0].id);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [reading, setReading] = (0, import_react.useState)(false);
	const [openArtifact, setOpenArtifact] = (0, import_react.useState)(null);
	const [view, setView] = (0, import_react.useState)("hero");
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const timers = (0, import_react.useRef)([]);
	const hydrated = (0, import_react.useRef)(false);
	const active = (0, import_react.useMemo)(() => conversations.find((c) => c.id === activeId) ?? conversations[0], [conversations, activeId]);
	(0, import_react.useEffect)(() => {
		try {
			const raw = window.localStorage.getItem(STORE_KEY);
			if (raw) {
				const saved = JSON.parse(raw);
				if (saved.conversations?.length) {
					setConversations(saved.conversations);
					const act = saved.conversations.find((c) => c.id === saved.activeId) ?? saved.conversations[0];
					setActiveId(act.id);
					setView(act.messages.length > 0 ? "chat" : "hero");
				}
			}
		} catch {}
		hydrated.current = true;
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated.current) return;
		try {
			window.localStorage.setItem(STORE_KEY, JSON.stringify({
				conversations,
				activeId
			}));
		} catch {}
	}, [conversations, activeId]);
	(0, import_react.useEffect)(() => () => {
		timers.current.forEach(window.clearTimeout);
	}, []);
	const patch = (0, import_react.useCallback)((convId, fn) => {
		setConversations((prev) => prev.map((c) => c.id === convId ? fn(c) : c));
	}, []);
	const addMessage = (0, import_react.useCallback)((convId, msg) => {
		patch(convId, (c) => ({
			...c,
			messages: [...c.messages, msg]
		}));
	}, [patch]);
	const updateMessage = (0, import_react.useCallback)((convId, msgId, upd) => {
		patch(convId, (c) => ({
			...c,
			messages: c.messages.map((m) => m.id === msgId ? {
				...m,
				...upd
			} : m)
		}));
	}, [patch]);
	const crossfadeTo = (0, import_react.useCallback)((next) => {
		timers.current.forEach(window.clearTimeout);
		timers.current = [];
		setPhase("leaving");
		timers.current.push(window.setTimeout(() => {
			setView(next);
			setPhase("entering");
			timers.current.push(window.setTimeout(() => setPhase("idle"), 300));
		}, 200));
	}, []);
	const setPart = (0, import_react.useCallback)((p) => {
		patch(activeId, (c) => ({
			...c,
			part: p
		}));
	}, [activeId, patch]);
	const handleNewAnalysis = (0, import_react.useCallback)(() => {
		setOpenArtifact(null);
		setDraft("");
		const existingEmpty = conversations.find((c) => c.messages.length === 0);
		if (existingEmpty) setActiveId(existingEmpty.id);
		else {
			const conv = newConversation(active?.part ?? "Soprano");
			setConversations((prev) => [conv, ...prev]);
			setActiveId(conv.id);
		}
		if (view !== "hero") crossfadeTo("hero");
		else setPhase("idle");
	}, [
		conversations,
		active,
		view,
		crossfadeTo
	]);
	const handleSelectRecent = (0, import_react.useCallback)((id) => {
		if (id === activeId) return;
		setOpenArtifact(null);
		setDraft("");
		setActiveId(id);
		const conv = conversations.find((c) => c.id === id);
		const target = conv && conv.messages.length > 0 ? "chat" : "hero";
		if (target !== view) crossfadeTo(target);
		else setPhase("idle");
	}, [
		activeId,
		conversations,
		view,
		crossfadeTo
	]);
	const runFlow = (0, import_react.useCallback)(async (opts) => {
		const conv = conversations.find((c) => c.id === activeId);
		if (!conv) return;
		const part = conv.part;
		const wasEmpty = conv.messages.length === 0;
		const file = opts.file ?? null;
		const text = opts.text.trim();
		if (!file && !text) return;
		if (wasEmpty && view !== "chat") crossfadeTo("chat");
		if (file) {
			setReading(true);
			const lower = file.name.toLowerCase();
			const kind = lower.endsWith(".pdf") || file.type === "application/pdf" ? "pdf" : lower.endsWith(".musicxml") || lower.endsWith(".mxl") || lower.endsWith(".xml") ? "musicxml" : "image";
			addMessage(conv.id, {
				id: newId("m"),
				role: "user",
				text,
				upload: {
					name: file.name,
					kind
				}
			});
		} else addMessage(conv.id, {
			id: newId("m"),
			role: "user",
			text
		});
		setDraft("");
		if (!file) {
			if (conv.result) {
				const r = routeMessage(text, conv.result, part);
				window.setTimeout(() => {
					addMessage(conv.id, {
						id: newId("m"),
						role: "assistant",
						text: r.reply,
						artifact: r.artifact
					});
				}, 450);
			} else {
				const r = routeMessage(text, null, part);
				window.setTimeout(() => {
					addMessage(conv.id, {
						id: newId("m"),
						role: "assistant",
						text: r.reply,
						artifact: r.artifact
					});
				}, 350);
			}
			return;
		}
		const aid = newId("m");
		addMessage(conv.id, {
			id: aid,
			role: "assistant",
			text: "Reading your score…",
			status: "analyzing"
		});
		setBusy(true);
		try {
			const upload = await readUpload(file);
			setReading(false);
			const result = await analyze(upload, part);
			const s = result.structured;
			patch(conv.id, (c) => ({
				...c,
				result,
				title: s.pieceTitle || upload.name
			}));
			updateMessage(conv.id, aid, {
				status: void 0,
				text: `${result.text} It's in ${s.keySignature.split(" (")[0]}, ${s.timeSignature.split(" (")[0]}, ${s.tempo}. Overall it reads about ${s.difficulty.overall}/10 for a ${part} — the intervals are the part to watch. Here's the snapshot; ask me for the solfège, the hardest measures, the composer, anything.`,
				showResultsCard: true,
				artifact: "overview"
			});
		} catch (err) {
			setReading(false);
			const msg = err instanceof AnalyzeApiError ? err.message : err instanceof Error ? err.message : "Analysis failed. Please try again.";
			updateMessage(conv.id, aid, {
				status: "error",
				errorText: msg
			});
		} finally {
			setBusy(false);
		}
	}, [
		conversations,
		activeId,
		view,
		crossfadeTo,
		addMessage,
		updateMessage,
		patch
	]);
	const handleSubmit = (0, import_react.useCallback)(() => {
		if (busy || reading) return;
		runFlow({ text: draft });
	}, [
		busy,
		reading,
		draft,
		runFlow
	]);
	const handleFile = (0, import_react.useCallback)((file) => {
		if (busy || reading) return;
		runFlow({
			text: draft,
			file
		});
	}, [
		busy,
		reading,
		draft,
		runFlow
	]);
	const handleSuggestion = (0, import_react.useCallback)((text) => {
		if (busy || reading) return;
		runFlow({ text });
	}, [
		busy,
		reading,
		runFlow
	]);
	(0, import_react.useEffect)(() => {
		let depth = 0;
		const setDrag = (v) => document.body.setAttribute("data-dragging", String(v));
		const hasFiles = (e) => !!(e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files"));
		const onEnter = (e) => {
			if (!hasFiles(e)) return;
			e.preventDefault();
			depth++;
			setDrag(true);
		};
		const onOver = (e) => {
			if (!hasFiles(e)) return;
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
		};
		const onLeave = (e) => {
			if (!hasFiles(e)) return;
			depth = Math.max(0, depth - 1);
			if (!depth) setDrag(false);
		};
		const onDrop = (e) => {
			e.preventDefault();
			depth = 0;
			setDrag(false);
			const file = e.dataTransfer?.files?.[0];
			if (file) handleFile(file);
		};
		window.addEventListener("dragenter", onEnter);
		window.addEventListener("dragover", onOver);
		window.addEventListener("dragleave", onLeave);
		window.addEventListener("drop", onDrop);
		return () => {
			window.removeEventListener("dragenter", onEnter);
			window.removeEventListener("dragover", onOver);
			window.removeEventListener("dragleave", onLeave);
			window.removeEventListener("drop", onDrop);
		};
	}, [handleFile]);
	const recents = (0, import_react.useMemo)(() => conversations.filter((c) => c.messages.length > 0).sort((a, b) => b.createdAt - a.createdAt).map((c) => ({
		id: c.id,
		title: c.title,
		subtitle: c.result?.structured.composerName ? `${c.result.structured.composerName} · ${c.part}` : c.part
	})), [conversations]);
	const s = active.result?.structured;
	const headerTitle = active.messages.length > 0 ? active.title : "New analysis";
	const headerSubtitle = s ? `${s.composerName ?? "Unknown composer"} · ${active.part}` : `Voice · ${active.part}`;
	const composer = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer$1, {
		value: draft,
		onChange: setDraft,
		onSubmit: handleSubmit,
		onFileSelected: handleFile,
		reading,
		busy,
		variant: view === "hero" ? "hero" : "chat",
		placeholder: view === "hero" ? "Drop a score, or describe what you need…" : "Ask about your score — or drop a new one…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		recents,
		activeConversationId: activeId,
		onSelectRecent: handleSelectRecent,
		onNewAnalysis: handleNewAnalysis,
		headerTitle,
		headerSubtitle,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full min-h-0",
			"data-testid": "chat-shell",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0 flex flex-col relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex-1 min-h-0 overflow-y-auto " + (phase === "leaving" ? "content-leaving" : phase === "entering" ? "content-entering" : ""),
					"data-testid": "content-swap",
					children: view === "hero" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroEmptyState, {
						part: active.part,
						onPart: setPart,
						children: composer
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatThread, {
						messages: active.messages,
						result: active.result,
						part: active.part,
						openArtifact,
						onOpenArtifact: (id) => setOpenArtifact((cur) => cur === id ? null : id),
						onSuggestion: handleSuggestion
					})
				}), view === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "shrink-0 border-t border-[color:var(--border-dark)] bg-gradient-to-t from-[color:var(--bg)] to-transparent",
					"data-testid": "chat-composer-dock",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto w-full max-w-3xl px-5 md:px-6 py-4",
						children: composer
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArtifactPanel, {
				artifact: openArtifact,
				result: active.result,
				part: active.part,
				onClose: () => setOpenArtifact(null),
				onNewAnalysis: handleNewAnalysis
			})]
		})
	});
}
//#endregion
export { SolfaiApp as component };
