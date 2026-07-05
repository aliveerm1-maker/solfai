// Thin client for the existing Solfai Express backend (/api/*).
// The Lovable UI was a static mockup; this wires the flagship Analyze flow
// to the real backend so no functionality is lost.

export type AnalyzeStructured = {
  keySignature?: string;
  timeSignature?: string;
  tempo?: string;
  dynamics?: string;
  startingPitch?: string;
  firstNotes?: string[];
  firstNotesSolfege?: string[];
  firstLyrics?: string;
  composerName?: string;
  pieceTitle?: string;
  difficulty?: Record<string, number>;
  overview?: string;
  practiceTips?: string[];
  [k: string]: unknown;
};

export type AnalyzeResult = {
  structured?: AnalyzeStructured;
  text?: string;
  error?: string;
  errorCode?: string;
};

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export async function analyzeScore(opts: {
  file: File;
  part: string;
  mode?: string;
}): Promise<AnalyzeResult> {
  const imageBase64 = await fileToBase64(opts.file);
  const imageMime = opts.file.type || "image/jpeg";
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: opts.mode || "analyze",
      selectedPart: opts.part,
      imageBase64,
      imageMime,
    }),
  });
  const data: AnalyzeResult = await res
    .json()
    .catch(() => ({ error: "The server returned an unreadable response." }));
  if (!res.ok) {
    throw new Error(data.error || `Analysis failed (${res.status})`);
  }
  return data;
}
