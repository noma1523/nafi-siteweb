/* ============================================================
   NAFI — hero-ripple.js
   Effet d'eau interactif sur l'image de fond du hero :
   de petites vagues se forment et se propagent sous le curseur.
   Vanilla JS, sans dépendance. Désactivé si prefers-reduced-motion
   ou sur les écrans sans survol (mobile/tactile) — l'image reste
   alors affichée normalement (le canvas n'est pas créé).
   ============================================================ */
(() => {
  const hero = document.querySelector(".hero");
  const img = hero && hero.querySelector(".hero-bg-img");
  if (!hero || !img) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Souris uniquement : on évite la simulation lourde sur tactile.
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  // Desktop uniquement : sur mobile l'image est affichée en bannière (pas de canvas).
  if (window.innerWidth <= 760) return;

  const canvas = document.createElement("canvas");
  canvas.className = "hero-ripple-canvas";
  canvas.setAttribute("aria-hidden", "true");
  img.insertAdjacentElement("afterend", canvas);
  canvas.style.cssText += "animation:none;opacity:0;transition:opacity .35s ease";
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  let W, H, cur, prev, src, out, running = false;
  const DAMP = 0.96;  // amortissement des vagues
  const POWER = 230;  // intensité d'une goutte au passage du curseur
  const MAXD = 15;    // déplacement maximal (px internes) pour éviter les déchirures

  function coverRect(iw, ih, w, h) {
    const cr = w / h, ir = iw / ih;
    if (ir > cr) { const dw = h * ir; return [(w - dw) / 2, 0, dw, h]; }
    const dh = w / ir; return [0, (h - dh) / 2, w, dh];
  }

  function setup() {
    const r = hero.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    const scale = Math.min(1, Math.min(iw, 1280) / r.width); // rés. interne = native (max 1280) pour la netteté
    W = Math.max(2, Math.round(r.width * scale));
    H = Math.max(2, Math.round(r.height * scale));
    canvas.width = W; canvas.height = H;
    canvas.style.width = r.width + "px";
    canvas.style.height = r.height + "px";
    const [dx, dy, dw, dh] = coverRect(iw, ih, W, H);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, dx, dy, dw, dh);
    try { src = ctx.getImageData(0, 0, W, H); } catch (e) { canvas.remove(); return; }
    out = ctx.createImageData(W, H);
    cur = new Float32Array(W * H);
    prev = new Float32Array(W * H);
    if (!running) { running = true; requestAnimationFrame(step); }
  }

  function drop(px, py, power) {
    const x = px | 0, y = py | 0;
    for (let j = -1; j <= 1; j++)
      for (let i = -1; i <= 1; i++) {
        const xx = x + i, yy = y + j;
        if (xx > 0 && yy > 0 && xx < W - 1 && yy < H - 1) prev[yy * W + xx] += power;
      }
  }

  function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

  function step() {
    if (src) {
      const s = src.data, o = out.data;
      let energy = 0;
      for (let y = 1; y < H - 1; y++) {
        const row = y * W;
        for (let x = 1; x < W - 1; x++) {
          const i = row + x;
          let v = (prev[i - 1] + prev[i + 1] + prev[i - W] + prev[i + W]) * 0.5 - cur[i];
          v *= DAMP;
          cur[i] = v;
          energy += v < 0 ? -v : v;
          let dx = (prev[i - 1] - prev[i + 1]) * 0.13;
          let dy = (prev[i - W] - prev[i + W]) * 0.13;
          if (dx > MAXD) dx = MAXD; else if (dx < -MAXD) dx = -MAXD;
          if (dy > MAXD) dy = MAXD; else if (dy < -MAXD) dy = -MAXD;
          let sx = x + (dx | 0), sy = y + (dy | 0);
          if (sx < 0) sx = 0; else if (sx >= W) sx = W - 1;
          if (sy < 0) sy = 0; else if (sy >= H) sy = H - 1;
          const si = (sy * W + sx) << 2, oi = i << 2;
          const sh = dx * 1.2; // léger reflet sur la crête de la vague
          o[oi] = clamp(s[si] + sh);
          o[oi + 1] = clamp(s[si + 1] + sh);
          o[oi + 2] = clamp(s[si + 2] + sh);
          o[oi + 3] = 255;
        }
      }
      const t = prev; prev = cur; cur = t;
      ctx.putImageData(out, 0, 0);
      if (energy < 5) { running = false; canvas.style.opacity = "0"; return; }
    }
    requestAnimationFrame(step);
  }

  function onMove(e) {
    canvas.style.opacity = "1";
    const r = hero.getBoundingClientRect();
    drop((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H, POWER);
    if (!running) { running = true; requestAnimationFrame(step); }
  }

  function init() {
    setup();
    hero.addEventListener("pointermove", onMove);
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(setup, 200); }, { passive: true });
  }

  if (img.complete && img.naturalWidth) init();
  else img.addEventListener("load", init, { once: true });
})();
