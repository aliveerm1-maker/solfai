//#region node_modules/.nitro/vite/services/ssr/assets/analyzeClient-CANo0PQL.js
var AnalyzeApiError = class extends Error {
	retryable;
	constructor(message, retryable = false) {
		super(message);
		this.retryable = retryable;
	}
};
var PDFJS_VERSION = "3.11.174";
var pdfjsLoadPromise = null;
function loadPdfJs() {
	if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("PDF reading is only available in the browser"));
	const w = window;
	if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
	if (pdfjsLoadPromise) return pdfjsLoadPromise;
	pdfjsLoadPromise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
		script.onload = () => {
			const lib = window.pdfjsLib;
			if (!lib) {
				reject(/* @__PURE__ */ new Error("PDF reader failed to load"));
				return;
			}
			lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
			resolve(lib);
		};
		script.onerror = () => {
			pdfjsLoadPromise = null;
			reject(/* @__PURE__ */ new Error("Could not load the PDF reader — check your connection and try again"));
		};
		document.head.appendChild(script);
	});
	return pdfjsLoadPromise;
}
async function pdfFileToPages(file, maxPages = 5) {
	const pdfjsLib = await loadPdfJs();
	const buf = await file.arrayBuffer();
	let pdf;
	try {
		pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
	} catch {
		throw new Error("That PDF couldn't be read — it may be corrupted or password-protected.");
	}
	const total = Math.min(pdf.numPages, maxPages);
	const pages = [];
	for (let p = 1; p <= total; p++) {
		const page = await pdf.getPage(p);
		const viewport = page.getViewport({ scale: 3 });
		const canvas = document.createElement("canvas");
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("This browser can't render PDFs to images (canvas unsupported)");
		await page.render({
			canvasContext: ctx,
			viewport
		}).promise;
		pages.push(canvas.toDataURL("image/jpeg", .92).split(",")[1]);
	}
	if (!pages.length) throw new Error("This PDF has no pages Solfai could read");
	return pages;
}
function imageFileToBase64(file, maxDim = 2400) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read the selected file"));
		reader.onload = (e) => {
			const img = new Image();
			img.onerror = () => reject(/* @__PURE__ */ new Error("That file isn't a readable image"));
			img.onload = () => {
				let w = img.width;
				let h = img.height;
				if (w > maxDim || h > maxDim) if (w > h) {
					h = Math.round(h * maxDim / w);
					w = maxDim;
				} else {
					w = Math.round(w * maxDim / h);
					h = maxDim;
				}
				const canvas = document.createElement("canvas");
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(/* @__PURE__ */ new Error("This browser can't process images (canvas unsupported)"));
					return;
				}
				ctx.drawImage(img, 0, 0, w, h);
				resolve({
					base64: canvas.toDataURL("image/jpeg", .92).split(",")[1],
					mime: "image/jpeg"
				});
			};
			img.src = e.target?.result;
		};
		reader.readAsDataURL(file);
	});
}
async function evaluateSinging(params) {
	const fd = new FormData();
	fd.append("audio", params.audio, params.filename || "take.webm");
	if (params.selectedPart) fd.append("selectedPart", params.selectedPart);
	const res = await fetch("/api/evaluate-singing", {
		method: "POST",
		body: fd
	});
	if (!res.ok) {
		let message = `Evaluation failed (${res.status})`;
		try {
			const data = await res.json();
			if (data?.error) message = data.error;
		} catch {}
		throw new AnalyzeApiError(message, false);
	}
	return res.json();
}
async function postParseMusicXML(params) {
	const fd = new FormData();
	fd.append("file", params.file);
	fd.append("selectedPart", params.selectedPart);
	const res = await fetch("/api/parse-musicxml", {
		method: "POST",
		body: fd
	});
	if (!res.ok) {
		let message = `MusicXML parsing failed (${res.status})`;
		let retryable = false;
		try {
			const data = await res.json();
			if (data?.error) message = data.error;
			if (data?.retryable) retryable = true;
		} catch {}
		throw new AnalyzeApiError(message, retryable);
	}
	return res.json();
}
async function postSightReading(params) {
	const res = await fetch("/api/sight-reading", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(params)
	});
	if (!res.ok) {
		let message = `Couldn't generate an exercise (${res.status})`;
		try {
			const data = await res.json();
			if (data?.error) message = data.error;
		} catch {}
		throw new AnalyzeApiError(message, false);
	}
	return res.json();
}
async function postAnalyze(params) {
	const hasPdfPages = params.pdfPages.length > 0;
	const res = await fetch("/api/analyze", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			mode: "analyze",
			imageBase64: hasPdfPages ? null : params.imageBase64,
			imageMime: hasPdfPages ? "image/jpeg" : params.imageMime,
			pdfPages: params.pdfPages,
			selectedPart: params.selectedPart
		})
	});
	if (!res.ok) {
		let message = `Analysis failed (${res.status})`;
		let retryable = false;
		try {
			const data = await res.json();
			if (data?.error) message = data.error;
			if (data?.retryable) retryable = true;
		} catch {}
		throw new AnalyzeApiError(message, retryable);
	}
	return res.json();
}
//#endregion
export { postAnalyze as a, pdfFileToPages as i, evaluateSinging as n, postParseMusicXML as o, imageFileToBase64 as r, postSightReading as s, AnalyzeApiError as t };
