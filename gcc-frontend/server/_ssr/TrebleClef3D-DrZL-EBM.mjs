import { i as __toESM } from "../_runtime.mjs";
import { a as useFrame, c as require_react, i as Canvas, n as Float, r as MeshTransmissionMaterial, s as require_jsx_runtime, t as Environment } from "../_libs/@react-three/drei+[...].mjs";
import { _ as ExtrudeGeometry, d as Color } from "../_libs/monogrid__gainmap-js+three.mjs";
import { t as SVGLoader } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TrebleClef3D-DrZL-EBM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Clean, single-shape treble-clef silhouette (filled path).
* viewBox 0 0 200 500 — traced from a public-domain musical symbol.
* Chosen because it renders as ONE closed shape (with an interior hole),
* so ExtrudeGeometry produces a single elegant clef, not stacked slabs.
*/
var TREBLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 500">
<path fill="currentColor" fill-rule="evenodd" d="
M 108 8
C 88 8 72 27 72 51
C 72 71 82 92 93 111
C 68 132 40 158 40 197
C 40 236 68 264 106 269
L 116 341
C 118 356 108 371 92 374
C 76 377 61 366 59 351
C 57 340 62 329 71 323
C 74 321 75 317 73 314
C 71 311 67 310 64 312
C 49 322 41 341 45 359
C 50 384 74 401 99 396
C 124 391 141 367 137 342
L 127 269
C 165 265 195 233 195 195
C 195 158 168 128 133 122
L 124 79
C 141 63 155 43 155 21
C 155 12 148 8 108 8
Z
M 116 30
C 128 30 138 40 138 52
C 138 68 128 82 116 92
L 108 40
C 108 34 112 30 116 30
Z
M 102 138
C 108 152 114 166 118 180
L 128 253
C 108 250 92 233 92 213
C 92 195 106 179 124 176
C 128 175 131 172 130 168
C 129 164 126 162 122 162
C 96 168 78 190 78 216
C 78 246 100 271 128 275
L 138 348
C 92 355 52 320 52 273
C 52 217 78 178 102 138
Z
M 134 138
C 158 148 174 172 174 199
C 174 233 148 261 116 264
L 106 191
C 122 190 138 178 138 162
C 138 154 133 148 126 145
C 121 143 116 146 114 151
C 112 156 115 161 120 163
Z
"/></svg>`;
function TrebleClefMesh() {
	const groupRef = (0, import_react.useRef)(null);
	const geometry = (0, import_react.useMemo)(() => {
		const data = new SVGLoader().parse(TREBLE_SVG);
		const shapes = [];
		for (const path of data.paths) {
			const s = SVGLoader.createShapes(path);
			shapes.push(...s);
		}
		const geo = new ExtrudeGeometry(shapes, {
			depth: 22,
			bevelEnabled: true,
			bevelThickness: 3,
			bevelSize: 2,
			bevelSegments: 4,
			curveSegments: 48
		});
		geo.center();
		geo.scale(1, -1, 1);
		geo.computeBoundingBox();
		const bb = geo.boundingBox;
		const scale = 4.2 / (bb.max.y - bb.min.y);
		geo.scale(scale, scale, scale);
		geo.computeVertexNormals();
		return geo;
	}, []);
	useFrame((_, delta) => {
		if (groupRef.current) groupRef.current.rotation.y += delta * .5;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("group", {
		ref: groupRef,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
			speed: 1.1,
			rotationIntensity: .05,
			floatIntensity: .35,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
				geometry,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeshTransmissionMaterial, {
					samples: 6,
					resolution: 512,
					transmission: 1,
					roughness: .02,
					thickness: .4,
					ior: 1.45,
					chromaticAberration: .06,
					anisotropy: .15,
					distortion: .05,
					distortionScale: .3,
					temporalDistortion: 0,
					clearcoat: 1,
					clearcoatRoughness: .02,
					attenuationColor: new Color("#f2d59a"),
					attenuationDistance: 3,
					color: new Color("#ffffff"),
					backside: true
				})
			})
		})
	});
}
function TrebleClef3D() {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-[3/4.2] w-full max-w-[460px]" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative aspect-[3/4.2] w-full max-w-[460px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
			camera: {
				position: [
					0,
					0,
					8
				],
				fov: 36
			},
			dpr: [1, 2],
			gl: {
				antialias: true,
				alpha: true,
				powerPreference: "high-performance"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .3 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
					position: [
						5,
						6,
						5
					],
					intensity: 1.1,
					color: "#fff2d0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
					position: [
						-4,
						-3,
						4
					],
					intensity: .5,
					color: "#c9b98a"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
					fallback: null,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrebleClefMesh, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Environment, { preset: "warehouse" })]
				})
			]
		})
	});
}
//#endregion
export { TrebleClef3D };
