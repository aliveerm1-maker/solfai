globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as serve, i as defineLazyEventHandler, n as HTTPError, r as defineHandler, s as NodeResponse, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/analyzeClient-CUQUU08z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f14-cgWlBiPyhlaWxwLSt06ZTlbCc/A\"",
		"mtime": "2026-07-25T20:54:32.290Z",
		"size": 3860,
		"path": "../public/assets/analyzeClient-CUQUU08z.js"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-07-05T06:42:18.568Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/bronze_material-xwx8MvKt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19c-Jbr0HGaFjjd1aWmP+efOxLbELTU\"",
		"mtime": "2026-07-25T20:54:32.292Z",
		"size": 412,
		"path": "../public/assets/bronze_material-xwx8MvKt.js"
	},
	"/assets/index-Br7KBYFQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"546a1-Uz4CzY4MvVoYLF4xXSPypDFqyD0\"",
		"mtime": "2026-07-25T20:54:32.279Z",
		"size": 345761,
		"path": "../public/assets/index-Br7KBYFQ.js"
	},
	"/assets/library-Bi2SQFq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"124f-nTDrnQzFdGpe0F7ifLidnIUrm+g\"",
		"mtime": "2026-07-25T20:54:32.293Z",
		"size": 4687,
		"path": "../public/assets/library-Bi2SQFq7.js"
	},
	"/assets/practice-04GM6BXs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dad-kB/nxxkWsxk/McUOfyMyWdix6QU\"",
		"mtime": "2026-07-25T20:54:32.295Z",
		"size": 3501,
		"path": "../public/assets/practice-04GM6BXs.js"
	},
	"/assets/StaffLines-CtUaTGMT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c87-Yv1nlXOs2JkovzgTjyr4NK0Dkqw\"",
		"mtime": "2026-07-25T20:54:32.283Z",
		"size": 19591,
		"path": "../public/assets/StaffLines-CtUaTGMT.js"
	},
	"/assets/routes-D7Rl8h0c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d0b-oUA4+KeY2YHu/cCe6hlFgXT3NEA\"",
		"mtime": "2026-07-25T20:54:32.297Z",
		"size": 36107,
		"path": "../public/assets/routes-D7Rl8h0c.js"
	},
	"/assets/styles-CskFKaWP.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1671f-nG2gJjmOm+OJHnXQEvv9EFVZhYo\"",
		"mtime": "2026-07-25T20:54:32.307Z",
		"size": 91935,
		"path": "../public/assets/styles-CskFKaWP.css"
	},
	"/assets/vocal-coach-TRflhwmt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"31ca-bh6Z4378Q3SKaY/sT70a401Qz7k\"",
		"mtime": "2026-07-25T20:54:32.299Z",
		"size": 12746,
		"path": "../public/assets/vocal-coach-TRflhwmt.js"
	},
	"/assets/bronze_material-Ca4AnOB5.png": {
		"type": "image/png",
		"etag": "\"ac054-1ajIZhX7q0EjLaieOZeYql14J9c\"",
		"mtime": "2026-07-25T20:54:32.301Z",
		"size": 704596,
		"path": "../public/assets/bronze_material-Ca4AnOB5.png"
	},
	"/assets/choir_ambient-BpSitkoo.png": {
		"type": "image/png",
		"etag": "\"b33a8-1ia25Dg+mFgnP4YduccbHJkfrcQ\"",
		"mtime": "2026-07-25T20:54:32.303Z",
		"size": 734120,
		"path": "../public/assets/choir_ambient-BpSitkoo.png"
	},
	"/assets/glass_clef_study-CEbqousS.png": {
		"type": "image/png",
		"etag": "\"a4360-HLk+kX0FvDAiKiCZWs3o/rLCm9A\"",
		"mtime": "2026-07-25T20:54:32.304Z",
		"size": 672608,
		"path": "../public/assets/glass_clef_study-CEbqousS.png"
	},
	"/assets/parchment_texture-CReDGOXh.png": {
		"type": "image/png",
		"etag": "\"e9ca3-+76aKCll5lGGi274r4DEpO75vLY\"",
		"mtime": "2026-07-25T20:54:32.306Z",
		"size": 957603,
		"path": "../public/assets/parchment_texture-CReDGOXh.png"
	},
	"/assets/TrebleClef3D-CyppchBn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"eda15-tJhj3pxzNQ8nzk/mTG8x8bGSmW0\"",
		"mtime": "2026-07-25T20:54:32.288Z",
		"size": 973333,
		"path": "../public/assets/TrebleClef3D-CyppchBn.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_kbTMPt = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_kbTMPt
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
