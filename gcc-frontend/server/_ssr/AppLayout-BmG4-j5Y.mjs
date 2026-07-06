import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { _ as useNavigate, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ChevronDown, D as Command, P as ArrowRight, S as Flame, T as Ear, _ as PanelLeft, b as Mic, c as Settings, f as Radio, h as PenLine, k as CirclePlay, l as Search, p as Plus, s as Sparkles, u as ScanLine, v as Music, x as Library, y as Music2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppLayout-BmG4-j5Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CommandPalette() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((v) => !v);
			}
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const commands = (0, import_react.useMemo)(() => [
		{
			id: "m-analyze",
			group: "Modes",
			label: "Analyze a score",
			hint: "PDF · MusicXML · Image",
			icon: ScanLine,
			run: () => navigate({
				to: "/",
				hash: "analyze"
			})
		},
		{
			id: "m-sight",
			group: "Modes",
			label: "Sight-read coach",
			hint: "Real-time solfege",
			icon: PenLine,
			run: () => navigate({ to: "/" })
		},
		{
			id: "m-ear",
			group: "Modes",
			label: "Ear training",
			hint: "Intervals · dictation",
			icon: Ear,
			run: () => navigate({ to: "/" })
		},
		{
			id: "m-vocal",
			group: "Modes",
			label: "Vocal coach feedback",
			hint: "Grade a recording",
			icon: Radio,
			run: () => navigate({ to: "/vocal-coach" })
		},
		{
			id: "g-library",
			group: "Go to",
			label: "Library",
			hint: "All your pieces",
			icon: Library,
			run: () => navigate({ to: "/library" }),
			kbd: "G L"
		},
		{
			id: "g-practice",
			group: "Go to",
			label: "Practice",
			hint: "Your queued drills",
			icon: CirclePlay,
			run: () => navigate({ to: "/practice" }),
			kbd: "G P"
		},
		{
			id: "g-vocal",
			group: "Go to",
			label: "Vocal Coach",
			hint: "Record & review",
			icon: Mic,
			run: () => navigate({ to: "/vocal-coach" }),
			kbd: "G V"
		},
		{
			id: "a-tune",
			group: "Actions",
			label: "Find starting pitch",
			hint: "From any measure",
			icon: Music2,
			run: () => navigate({ to: "/" })
		},
		{
			id: "a-warm",
			group: "Actions",
			label: "Daily warm-up",
			hint: "In today's piece's key",
			icon: Sparkles,
			run: () => navigate({ to: "/" })
		}
	], [navigate]);
	const filtered = q.trim() ? commands.filter((c) => (c.label + " " + c.hint + " " + c.group).toLowerCase().includes(q.toLowerCase())) : commands;
	const grouped = filtered.reduce((acc, c) => {
		(acc[c.group] ??= []).push(c);
		return acc;
	}, {});
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] px-4 animate-fade-in",
		onClick: () => setOpen(false),
		style: {
			background: "color-mix(in oklab, var(--bg) 55%, transparent)",
			backdropFilter: "blur(6px)"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-xl rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)] overflow-hidden animate-scale-in",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 px-4 py-3 border-b border-[color:var(--border-dark)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							size: 15,
							className: "text-muted-dark"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: q,
							onChange: (e) => setQ(e.target.value),
							placeholder: "Search modes, actions, pages…",
							className: "flex-1 bg-transparent text-[14px] placeholder:text-muted-dark focus:outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "text-[10px] font-semibold text-muted-dark px-1.5 py-0.5 rounded border border-[color:var(--border-dark)]",
							children: "ESC"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[52vh] overflow-y-auto p-2",
					children: [Object.entries(grouped).map(([group, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-2.5 py-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-dark",
							children: group
						}), items.map((c) => {
							const Icon = c.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									c.run();
									setOpen(false);
									setQ("");
								},
								className: "group w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-[color:var(--bg)]/70 transition",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid place-items-center h-7 w-7 rounded-md bg-[color:var(--bg)] ring-1 ring-[color:var(--border-dark)] group-hover:ring-[color:var(--teal)]/40",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											size: 13,
											className: "text-[color:var(--teal)]"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[13px] font-semibold text-paper truncate",
											children: c.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-dark truncate",
											children: c.hint
										})]
									}),
									c.kbd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "text-[9.5px] font-semibold text-muted-dark px-1.5 py-0.5 rounded border border-[color:var(--border-dark)]",
										children: c.kbd
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										size: 13,
										className: "text-muted-dark opacity-0 group-hover:opacity-100 transition"
									})
								]
							}, c.id);
						})]
					}, group)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 py-10 text-center text-[13px] text-muted-dark",
						children: "No matches. Try \"warm-up\", \"record\", or \"library\"."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-4 py-2 border-t border-[color:var(--border-dark)] text-[10.5px] text-muted-dark",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↑↓ navigate · ↵ open" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: ["Powered by ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[color:var(--teal)] font-semibold",
							children: "Solfai"
						})]
					})]
				})
			]
		})
	});
}
function Equalizer({ bars = 4, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-end gap-[2px] h-3 " + className,
		"aria-hidden": true,
		children: [Array.from({ length: bars }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-[2px] rounded-full bg-[color:var(--teal)]",
			style: {
				animation: `eqBar 1.2s ease-in-out ${i * .15}s infinite`,
				transformOrigin: "bottom",
				boxShadow: "0 0 6px color-mix(in oklab, var(--teal) 70%, transparent)"
			}
		}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes eqBar {
          0%,100% { height: 3px; opacity: .55 }
          50%     { height: 12px; opacity: 1 }
        }
      ` })]
	});
}
var NAV = [
	{
		to: "/",
		label: "New analysis",
		icon: Plus,
		primary: true
	},
	{
		to: "/library",
		label: "Search library",
		icon: Search
	},
	{
		to: "/library",
		label: "Library",
		icon: Library
	},
	{
		to: "/practice",
		label: "Practice",
		icon: CirclePlay
	},
	{
		to: "/vocal-coach",
		label: "Vocal Coach",
		icon: Mic
	}
];
var RECENTS = [
	"Speak the Truth — Tenor",
	"Didn't My Lord Deliver Daniel?",
	"Ave Verum Corpus — Alto",
	"Sicut Cervus warm-up",
	"Interval drill · P5s"
];
function ClefMark({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 200 500",
		className,
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
			id: "clefMarkGold",
			x1: "0",
			y1: "0",
			x2: "1",
			y2: "1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0",
					stopColor: "oklch(0.93 0.11 82)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: ".55",
					stopColor: "oklch(0.78 0.15 68)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "1",
					stopColor: "oklch(0.52 0.12 55)"
				})
			]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "url(#clefMarkGold)",
			fillRule: "evenodd",
			d: "M 108 8 C 88 8 72 27 72 51 C 72 71 82 92 93 111 C 68 132 40 158 40 197 C 40 236 68 264 106 269 L 116 341 C 118 351 118 361 116 370 C 112 388 96 400 78 400 C 60 400 46 386 46 368 C 46 356 54 346 66 342 C 60 332 56 322 60 310 C 40 316 26 336 26 360 C 26 390 52 414 84 414 C 116 414 142 390 142 358 C 142 352 141 346 140 340 L 128 264 C 156 258 178 234 178 204 C 178 178 160 158 138 152 L 133 122 C 152 100 168 76 168 50 C 168 27 152 8 132 8 Z M 120 44 C 129 44 136 52 136 62 C 136 78 126 96 112 112 L 108 84 C 106 68 110 44 120 44 Z M 116 176 L 126 240 C 143 236 155 222 155 204 C 155 188 138 176 116 176 Z M 104 176 C 86 178 72 190 72 208 C 72 226 86 240 104 240 C 106 240 108 240 110 240 L 100 176 Z"
		})]
	});
}
function ProgressRing({ value, size = 34 }) {
	const r = (size - 4) / 2;
	const c = 2 * Math.PI * r;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: size,
		height: size,
		viewBox: `0 0 ${size} ${size}`,
		className: "shrink-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				fill: "none",
				stroke: "color-mix(in oklab, white 8%, transparent)",
				strokeWidth: 3
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				fill: "none",
				stroke: "var(--teal)",
				strokeWidth: 3,
				strokeLinecap: "round",
				strokeDasharray: c,
				strokeDashoffset: c * (1 - value / 100),
				transform: `rotate(-90 ${size / 2} ${size / 2})`,
				style: { filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--teal) 70%, transparent))" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "50%",
				y: "52%",
				textAnchor: "middle",
				dominantBaseline: "middle",
				fontSize: "10",
				fontWeight: "700",
				fill: "var(--paper)",
				children: value
			})
		]
	});
}
function AppLayout({ children, contentClassName = "", title, subtitle }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-paper flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grain",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden md:flex shrink-0 flex-col border-r border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/35 backdrop-blur-xl transition-[width] duration-300 " + (open ? "w-[260px]" : "w-[68px]"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 px-3.5 pt-4 pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2.5 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "relative grid place-items-center h-9 w-9 rounded-xl bg-[color:var(--bg)] ring-1 ring-[color:var(--teal)]/25 overflow-hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClefMark, { className: "h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute inset-0 rounded-xl",
									style: { background: "radial-gradient(ellipse at 30% 20%, color-mix(in oklab, var(--teal) 30%, transparent), transparent 60%)" }
								})]
							}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leading-tight min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif text-[15px] font-semibold tracking-tight",
									children: "Solfai"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[9.5px] uppercase tracking-[0.22em] text-muted-dark truncate",
									children: "Sight-read studio"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setOpen((v) => !v),
							className: "ml-auto grid place-items-center h-8 w-8 rounded-lg text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/60",
							"aria-label": "Toggle sidebar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { size: 15 })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-3 px-2 flex flex-col gap-0.5",
						children: NAV.map(({ to, label, icon: Icon, primary }, i) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to,
								title: label,
								className: "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors " + (primary ? "bg-[color:var(--bg)]/60 ring-1 ring-[color:var(--teal)]/30 text-paper hover:bg-[color:var(--bg)]" : (to === "/" ? pathname === "/" : pathname === to) ? "bg-[color:var(--bg)]/70 text-paper" : "text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									size: 16,
									className: primary ? "text-[color:var(--teal)]" : ""
								}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: label
								})]
							}, i);
						})
					}),
					open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-[0.24em] text-muted-dark mb-2",
								children: "Recents"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-0.5",
								children: RECENTS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "w-full text-left rounded-md px-2 py-1.5 text-[12.5px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50 truncate",
									children: r
								}) }, r))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 rounded-xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/50 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-dark",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
											size: 11,
											className: "text-[color:var(--teal)]"
										}), " Today"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRing, { value: 68 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "leading-tight",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "serif text-[15px] font-semibold text-paper",
												children: "17 min"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10.5px] text-muted-dark",
												children: "of 25 goal"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2.5 text-[10.5px] text-muted-dark",
										children: "3 drills · 1 recording"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-auto p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => window.dispatchEvent(new KeyboardEvent("keydown", {
								key: "k",
								metaKey: true
							})),
							className: "w-full mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/50 transition " + (open ? "" : "justify-center"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { size: 13 }), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quick actions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
								className: "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[color:var(--border-dark)]",
								children: "⌘K"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "w-full flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-[color:var(--bg)]/60 transition " + (open ? "" : "justify-center"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid place-items-center h-8 w-8 rounded-full text-[11px] font-semibold text-[color:var(--ink)]",
									style: { background: "linear-gradient(135deg, oklch(0.82 0.14 78), oklch(0.65 0.15 55))" },
									children: "AV"
								}),
								open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 text-left leading-tight flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[13px] font-semibold truncate",
										children: "Ali Veer"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10.5px] text-muted-dark",
										children: "Pro · 23/50 analyses"
									})]
								}),
								open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
									size: 14,
									className: "text-muted-dark"
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 min-w-0 flex flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-4 z-30 mx-auto mt-4 flex items-center gap-2 px-2 py-1.5 pl-4 rounded-full border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/75 backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7),0_0_0_1px_color-mix(in_oklab,var(--teal)_10%,transparent)]",
						style: { width: "min(760px, calc(100% - 2.5rem))" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -inset-px rounded-full pointer-events-none opacity-60",
								style: { background: "radial-gradient(ellipse at 20% 0%, color-mix(in oklab, var(--teal) 18%, transparent), transparent 55%)" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "relative flex items-center gap-2 rounded-full px-2 py-1 text-sm hover:bg-[color:var(--bg)]/40 transition",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, {
										size: 14,
										className: "text-[color:var(--teal)]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "serif font-semibold tracking-tight",
										children: "Solfai"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
										size: 13,
										className: "text-muted-dark"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative h-4 w-px bg-[color:var(--border-dark)] mx-1" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-dark",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Equalizer, { bars: 4 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Live session" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => window.dispatchEvent(new KeyboardEvent("keydown", {
									key: "k",
									metaKey: true
								})),
								className: "relative ml-2 hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/40 transition",
								"aria-label": "Open command palette",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 12 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "normal-case tracking-normal",
										children: "Search"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "text-[9.5px] font-semibold px-1 py-0.5 rounded border border-[color:var(--border-dark)]",
										children: "⌘K"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative ml-auto flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/40 transition",
									children: "Share"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest shadow-[0_8px_24px_-8px_var(--teal)]",
									style: {
										background: "linear-gradient(135deg, var(--teal), var(--teal-deep))",
										color: "var(--ink)"
									},
									children: "Upgrade"
								})]
							})
						]
					}),
					(title || subtitle) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-5 lg:px-10 pt-8 pb-2 border-b border-[color:var(--border-dark)]/60",
						children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "serif text-3xl md:text-4xl font-semibold tracking-tight",
							children: title
						}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-dark",
							children: subtitle
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 min-w-0 " + (title || subtitle ? "px-5 lg:px-10 py-8 " : "") + contentClassName,
						children
					})
				]
			})
		]
	});
}
//#endregion
export { AppLayout as t };
