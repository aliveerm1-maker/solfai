// Animated favicon: a mini spinning black-and-gold treble clef with a sweeping
// specular highlight (fakes a reflective metal spin, no WebGL). Updates the
// tab icon ~15fps; requestAnimationFrame auto-pauses when the tab is hidden.

const CLEF_PATH =
  "M 108 8 C 88 8 72 27 72 51 C 72 71 82 92 93 111 C 68 132 40 158 40 197 C 40 236 68 264 106 269 L 116 341 C 118 351 118 361 116 370 C 112 388 96 400 78 400 C 60 400 46 386 46 368 C 46 356 54 346 66 342 C 60 332 56 322 60 310 C 40 316 26 336 26 360 C 26 390 52 414 84 414 C 116 414 142 390 142 358 C 142 352 141 346 140 340 L 128 264 C 156 258 178 234 178 204 C 178 178 160 158 138 152 L 133 122 C 152 100 168 76 168 50 C 168 27 152 8 132 8 Z M 120 44 C 129 44 136 52 136 62 C 136 78 126 96 112 112 L 108 84 C 106 68 110 44 120 44 Z M 116 176 L 126 240 C 143 236 155 222 155 204 C 155 188 138 176 116 176 Z M 104 176 C 86 178 72 190 72 208 C 72 226 86 240 104 240 C 106 240 108 240 110 240 L 100 176 Z";

const clamp = (n: number) => Math.max(0.001, Math.min(0.999, n));

export function startAnimatedFavicon() {
  if (typeof document === "undefined") return;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let path: Path2D;
  try {
    path = new Path2D(CLEF_PATH);
  } catch {
    return;
  }

  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  let angle = 0;
  let last = 0;
  const interval = 1000 / 15;

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    if (typeof (ctx as any).roundRect === "function") {
      ctx!.beginPath();
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx!.beginPath();
      ctx!.moveTo(x + r, y);
      ctx!.arcTo(x + w, y, x + w, y + h, r);
      ctx!.arcTo(x + w, y + h, x, y + h, r);
      ctx!.arcTo(x, y + h, x, y, r);
      ctx!.arcTo(x, y, x + w, y, r);
      ctx!.closePath();
    }
  }

  function draw() {
    const c2 = ctx!;
    c2.clearRect(0, 0, size, size);

    // Dark rounded background (the "black" half of black-and-gold).
    const bg = c2.createLinearGradient(0, 0, size, size);
    bg.addColorStop(0, "#1b1628");
    bg.addColorStop(1, "#0a0910");
    c2.fillStyle = bg;
    roundRect(1, 1, size - 2, size - 2, 14);
    c2.fill();

    // Spinning clef — fake Y-axis rotation by squashing X with cos(angle).
    c2.save();
    c2.translate(size / 2, size / 2);
    const c = Math.cos(angle);
    const sx = Math.max(0.14, Math.abs(c));
    c2.scale(sx, 1);
    const s = (size * 0.72) / 500; // clef viewBox is 200x500
    c2.scale(s, s);
    c2.translate(-100, -250);

    // Sweeping gold specular highlight → reflective metal look.
    const hl = Math.sin(angle) * 0.5 + 0.5;
    const g = c2.createLinearGradient(0, 0, 0, 500);
    g.addColorStop(0, "#241a06");
    g.addColorStop(clamp(hl - 0.22), "#5c400f");
    g.addColorStop(clamp(hl), "#ffe9ab");
    g.addColorStop(clamp(hl + 0.22), "#9e6c1d");
    g.addColorStop(1, "#170f05");
    c2.fillStyle = g;
    c2.fill(path, "evenodd");
    c2.restore();

    try {
      link!.type = "image/png";
      link!.href = canvas.toDataURL("image/png");
    } catch {
      /* ignore */
    }
  }

  function loop(t: number) {
    if (t - last >= interval) {
      last = t;
      angle += 0.14;
      draw();
    }
    requestAnimationFrame(loop);
  }

  draw();
  requestAnimationFrame(loop);
}
