import { i as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { _ as useNavigate, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Library, F as ArrowRight, O as Ear, _ as Music2, c as Settings, f as Radio, g as PanelLeft, j as CirclePlay, k as Command, l as Search, m as PenLine, p as Plus, s as Sparkles, t as X, u as ScanLine, v as Mic, y as MessageSquare } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StaffLines-xn9fxfO3.js
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
var NAV_MAIN = [
	{
		to: "/library",
		label: "Library",
		icon: Library,
		kbd: "L"
	},
	{
		to: "/practice",
		label: "Practice",
		icon: CirclePlay,
		kbd: "P"
	},
	{
		to: "/vocal-coach",
		label: "Vocal Coach",
		icon: Mic,
		kbd: "V"
	}
];
/** Editorial glass/bronze clef brand mark. Gradient id is per-instance so
*  copies inside a hidden subtree still resolve their fill. */
function ClefMark({ className = "" }) {
	const gradientId = `clefMarkGold-${(0, import_react.useId)()}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className,
		"aria-hidden": true,
		fill: "none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
			id: gradientId,
			x1: "0",
			y1: "0",
			x2: "1",
			y2: "1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0",
					stopColor: "oklch(0.92 0.11 82)"
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
			d: "M12.4 2.4c-1.4 0-2.6 1.4-2.6 3.2 0 1.4.7 2.9 1.5 4.3-2.4 1.7-4.7 3.7-4.7 6.7 0 2.8 2 4.7 4.7 5l1 5.6c.15 1-.55 2-1.6 2.1-1.05.1-2-.7-2.15-1.75-.1-.75.3-1.4.9-1.85.1-.05.15-.2.05-.35-.1-.15-.25-.2-.4-.15-1 .55-1.6 1.85-1.35 3.1.3 1.7 1.95 2.85 3.65 2.55 1.7-.3 2.85-1.95 2.55-3.65l-.75-5.35c2.75-.35 4.85-2.85 4.85-5.7 0-2.7-1.9-4.9-4.4-5.35l-.65-3.05c1.2-1.15 2.35-2.55 2.35-4.15 0-1.7-1.3-3.1-2.95-3.1z",
			fill: `url(#${gradientId})`,
			transform: "scale(0.72) translate(0,0)"
		})]
	});
}
/**
* THE one persistent shell. The sidebar and header mount once and stay mounted
* for the life of the view. Only `children` (the chat area) changes — so the
* hero⇄chat transition is an in-place content swap, never a page load.
*
* "New analysis" and "Recents" behave like a chat app: New analysis resets the
* content to the empty hero in place; clicking a recent reopens that thread.
*/
function AppLayout({ children, contentClassName = "", recents, activeConversationId, onSelectRecent, onNewAnalysis, headerTitle, headerSubtitle }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(true);
	const [drawerOpen, setDrawerOpen] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const flash = (msg) => {
		setNotice(msg);
		window.setTimeout(() => setNotice(null), 2800);
	};
	(0, import_react.useEffect)(() => {
		if (!drawerOpen) return;
		const onKey = (e) => {
			if (e.key === "Escape") setDrawerOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [drawerOpen]);
	const onShare = async () => {
		const url = typeof window !== "undefined" ? window.location.origin : "";
		try {
			if (typeof navigator !== "undefined" && navigator.share) {
				await navigator.share({
					title: "Solfai",
					text: "AI sheet-music coach for choir",
					url
				});
				return;
			}
			await navigator.clipboard.writeText(url);
			flash("Link copied to clipboard");
		} catch {
			flash("Couldn't share — copy the URL from the address bar.");
		}
	};
	const doNewAnalysis = () => {
		setDrawerOpen(false);
		onNewAnalysis?.();
	};
	const railBody = (compact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 pt-4 shrink-0",
			children: onNewAnalysis ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: doNewAnalysis,
				"data-testid": "new-analysis-button",
				className: "w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold transition-colors border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 text-paper hover:bg-[color:var(--gold)]/18",
				style: { borderRadius: "2px" },
				title: "New analysis",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					size: 15,
					className: "text-[color:var(--gold)] shrink-0"
				}), compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: "New analysis"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				"data-testid": "new-analysis-button",
				className: "w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold transition-colors border border-[color:var(--gold)]/30 bg-[color:var(--gold)]/10 text-paper hover:bg-[color:var(--gold)]/18",
				style: { borderRadius: "2px" },
				onClick: () => setDrawerOpen(false),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					size: 15,
					className: "text-[color:var(--gold)] shrink-0"
				}), compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: "New analysis"
				})]
			})
		}),
		compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 px-3 min-h-0 flex flex-col",
			"data-testid": "recents-section",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[9.5px] uppercase tracking-[0.26em] text-muted-dark px-2 mb-2 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 h-px bg-[color:var(--border-dark)]" })]
			}), recents && recents.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-0.5 overflow-y-auto no-scrollbar pr-1",
				"data-testid": "recents-list",
				children: recents.map((r) => {
					const active = r.id === activeConversationId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							onSelectRecent?.(r.id);
							setDrawerOpen(false);
						},
						"data-testid": `recent-item-${r.id}`,
						"aria-current": active ? "true" : void 0,
						className: "group relative flex items-start gap-2.5 px-2.5 py-2 text-left transition-colors " + (active ? "bg-[color:var(--bg)]/70 text-paper" : "text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/40"),
						style: { borderRadius: "2px" },
						children: [
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[color:var(--gold)]" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
								size: 13,
								className: "mt-0.5 shrink-0 " + (active ? "text-[color:var(--gold)]" : "opacity-60")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1 leading-tight",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-[12.5px]",
									children: r.title
								}), r.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-[10.5px] text-muted-dark/80 mt-0.5",
									children: r.subtitle
								})]
							})
						]
					}, r.id);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-dashed border-[color:var(--border-dark)] px-3 py-3 text-[11px] leading-snug text-muted-dark",
				style: { borderRadius: "2px" },
				"data-testid": "recents-empty",
				children: "No pieces yet. Analyzed scores show up here — click one to reopen the conversation."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "mt-6 px-3 flex flex-col gap-0.5 shrink-0",
			"data-testid": "nav-main",
			children: [compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[9.5px] uppercase tracking-[0.26em] text-muted-dark px-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Studio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 h-px bg-[color:var(--border-dark)]" })]
			}), NAV_MAIN.map(({ to, label, icon: Icon, kbd }) => {
				const active = pathname === to;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to,
					title: label,
					onClick: () => setDrawerOpen(false),
					"data-testid": `nav-${label.toLowerCase().replace(/\s/g, "-")}`,
					className: "group relative flex items-center gap-3 px-3 py-2 text-[13px] transition-colors " + (active ? "text-paper bg-[color:var(--bg)]/70" : "text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/40"),
					style: { borderRadius: "2px" },
					children: [
						active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-0 top-2 bottom-2 w-[2px] bg-[color:var(--gold)]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 14 }),
						compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: label
						}), kbd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "ml-auto text-[9.5px] font-semibold px-1.5 py-0.5 mono-cap border border-[color:var(--border-dark)] text-muted-dark",
							children: kbd
						})] })
					]
				}, label);
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-auto p-3 border-t border-[color:var(--border-dark)] shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => window.dispatchEvent(new KeyboardEvent("keydown", {
					key: "k",
					metaKey: true
				})),
				"data-testid": "quick-actions-button",
				className: "w-full mb-2 flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg)]/40 transition-colors " + (compact ? "" : "justify-center"),
				style: { borderRadius: "2px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Command, { size: 12 }), compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quick actions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
					className: "ml-auto text-[9.5px] font-semibold px-1.5 py-0.5 mono-cap border border-[color:var(--border-dark)]",
					children: "⌘K"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "w-full flex items-center gap-3 px-2 py-2 hover:bg-[color:var(--bg)]/40 transition-colors " + (compact ? "" : "justify-center"),
				style: { borderRadius: "2px" },
				"data-testid": "user-profile-button",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid place-items-center h-8 w-8 text-[11px] font-semibold text-[color:var(--ink)]",
						style: {
							background: "linear-gradient(135deg, oklch(0.82 0.14 78), oklch(0.62 0.15 55))",
							borderRadius: "2px"
						},
						children: "S"
					}),
					compact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 text-left leading-tight flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[12.5px] font-semibold truncate",
							children: "Singer"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-[0.22em] text-muted-dark",
							children: "Preview · free"
						})]
					}),
					compact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
						size: 13,
						className: "text-muted-dark"
					})
				]
			})]
		})
	] });
	const railHeader = (inDrawer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 px-4 pt-5 pb-4 border-b border-[color:var(--border-dark)] shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "flex items-center gap-3 min-w-0",
			"data-testid": "brand-mark",
			onClick: () => setDrawerOpen(false),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative grid place-items-center h-9 w-9 border border-[color:var(--gold)]/30 bg-[color:var(--bg)]",
				style: { borderRadius: "2px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClefMark, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute inset-0",
					style: { background: "radial-gradient(ellipse at 30% 20%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 60%)" }
				})]
			}), (open || inDrawer) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leading-tight min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "serif text-[16px] font-medium tracking-tight",
					children: "Solfai"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[9.5px] uppercase tracking-[0.28em] text-muted-dark truncate",
					children: "Sight-read studio"
				})]
			})]
		}), inDrawer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setDrawerOpen(false),
			className: "ml-auto grid place-items-center h-7 w-7 text-muted-dark hover:text-paper transition-colors",
			"aria-label": "Close navigation",
			"data-testid": "drawer-close",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 15 })
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setOpen((v) => !v),
			"data-testid": "sidebar-toggle",
			className: "ml-auto grid place-items-center h-7 w-7 text-muted-dark hover:text-paper transition-colors",
			"aria-label": "Toggle sidebar",
			style: { borderRadius: "2px" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { size: 14 })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-screen bg-bg text-paper flex overflow-hidden",
		"data-testid": "app-layout",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grain",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				"data-testid": "sidebar",
				className: "hidden md:flex shrink-0 flex-col border-r border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 backdrop-blur-xl transition-[width] duration-300 " + (open ? "w-[272px]" : "w-[68px]"),
				children: [railHeader(false), railBody(open)]
			}),
			drawerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:hidden fixed inset-0 z-[100] flex",
				"data-testid": "mobile-drawer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 bg-[color:var(--ink)]/70 backdrop-blur-sm",
					onClick: () => setDrawerOpen(false),
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "relative flex w-[276px] max-w-[82vw] flex-col overflow-y-auto border-r border-[color:var(--border-dark)] bg-[color:var(--bg-2)] shadow-[0_0_60px_rgba(0,0,0,0.6)]",
					children: [railHeader(true), railBody(true)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 min-w-0 flex flex-col relative",
				"data-testid": "main-content",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center gap-3 px-4 md:px-5 h-[53px] border-b border-[color:var(--border-dark)] bg-[color:var(--bg)]/85 backdrop-blur-xl shrink-0 z-30",
						"data-testid": "top-bar",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setDrawerOpen(true),
								className: "md:hidden grid place-items-center h-8 w-8 text-muted-dark hover:text-paper transition-colors shrink-0",
								"aria-label": "Open navigation",
								"data-testid": "mobile-nav-open",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, { size: 16 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1",
								children: headerTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "serif text-[15px] font-medium leading-tight text-paper truncate",
									"data-testid": "header-title",
									children: headerTitle
								}), headerSubtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10.5px] text-muted-dark truncate leading-tight",
									children: headerSubtitle
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-dark",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Equalizer, { bars: 4 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Live session" })]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => window.dispatchEvent(new KeyboardEvent("keydown", {
									key: "k",
									metaKey: true
								})),
								"data-testid": "search-button",
								className: "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-muted-dark hover:text-paper hover:bg-[color:var(--bg-2)]/60 transition-colors",
								style: { borderRadius: "2px" },
								"aria-label": "Open command palette",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 12 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "normal-case tracking-normal",
										children: "Search"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
										className: "text-[9.5px] font-semibold mono-cap px-1 py-0.5 border border-[color:var(--border-dark)]",
										children: "⌘K"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: onShare,
								className: "hidden sm:inline-flex items-center px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-dark hover:text-paper transition-colors",
								"data-testid": "share-button",
								style: { borderRadius: "2px" },
								children: "Share"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => flash("Solfai is free during preview — paid plans aren't available yet."),
								title: "Paid plans coming soon",
								"data-testid": "upgrade-button",
								className: "inline-flex items-center px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:brightness-110 transition-all",
								style: {
									background: "var(--gold)",
									color: "var(--ink)",
									borderRadius: "2px"
								},
								children: "Upgrade"
							})
						]
					}),
					notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/95 px-4 py-2 text-[12.5px] text-paper shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl",
						style: { borderRadius: "3px" },
						"data-testid": "app-notice",
						children: notice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 min-h-0 " + contentClassName,
						"data-testid": "content-region",
						children
					})
				]
			})
		]
	});
}
/**
* Decorative five-line musical staff — pure SVG so it's crisp at any size.
* Used as an editorial divider / motif throughout Solfai.
*/
function StaffLines({ className = "", opacity = .35, strokeWidth = 1, animated = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 1000 80",
		preserveAspectRatio: "none",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "staffFade",
				x1: "0",
				y1: "0",
				x2: "1",
				y2: "0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0",
						stopColor: "var(--gold)",
						stopOpacity: "0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0.15",
						stopColor: "var(--gold)",
						stopOpacity: "1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0.85",
						stopColor: "var(--gold)",
						stopOpacity: "1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: "var(--gold)",
						stopOpacity: "0"
					})
				]
			}) }),
			[
				10,
				25,
				40,
				55,
				70
			].map((y, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: "0",
				x2: "1000",
				y1: y,
				y2: y,
				stroke: "url(#staffFade)",
				strokeWidth,
				opacity,
				style: animated ? {
					strokeDasharray: 1200,
					strokeDashoffset: 1200,
					animation: `staffDraw 2.6s ${i * .12}s cubic-bezier(.4,.05,.2,1) both`
				} : void 0
			}, y)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @keyframes staffDraw { to { stroke-dashoffset: 0; } }
      ` })
		]
	});
}
//#endregion
export { ClefMark as n, StaffLines as r, AppLayout as t };
