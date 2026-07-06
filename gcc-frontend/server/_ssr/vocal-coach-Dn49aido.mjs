import { s as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { b as Mic, n as Video, t as Waves } from "../_libs/lucide-react.mjs";
import { t as AppLayout } from "./AppLayout-BmG4-j5Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vocal-coach-Dn49aido.js
var import_jsx_runtime = require_jsx_runtime();
function VocalCoach() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppLayout, {
		title: "Vocal Coach",
		subtitle: "Record yourself and get professional-level feedback.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-3xl border border-[color:var(--border-dark)] bg-[color:var(--bg-2)]/60 p-6 lg:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "serif text-2xl font-semibold",
					children: "Vocal Coach"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-dark",
					children: "Record yourself and get professional-level feedback."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 rounded-2xl border-l-4 border-[color:oklch(0.68_0.20_25)] bg-[color:var(--bg)]/50 p-5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[color:oklch(0.78_0.18_28)] font-semibold",
						children: "Record yourself singing,"
					}), " then get detailed feedback from Solfai acting as a professional choir director. Works best with 5–30 seconds of clear singing."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "pill",
						style: {
							background: "linear-gradient(135deg, oklch(0.68 0.20 25), oklch(0.55 0.22 20))",
							color: "var(--paper)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { size: 14 }), " Record"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "pill",
						style: {
							background: "var(--bg)",
							color: "var(--paper)",
							border: "1px solid var(--border-dark)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 14 }), " Video Record"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow eyebrow-dot text-[color:var(--teal)] mb-3",
						children: "Past Recordings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-[color:var(--border-dark)] bg-[color:var(--bg)]/40 p-5 flex items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid place-items-center h-10 w-10 rounded-full bg-[color:var(--bg-2)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waves, {
									size: 16,
									className: "text-[color:var(--teal)]"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: "Unknown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-dark",
								children: "7/4/2026"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto h-1 w-40 rounded-full bg-[color:var(--bg-2)] overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-2/3 bg-[color:var(--teal)]/60" })
							})
						]
					})]
				})
			]
		})
	});
}
//#endregion
export { VocalCoach as component };
