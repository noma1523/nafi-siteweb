/* =====================================================================
   NAFI — Gouttes d'eau : pluie d'ambiance + éclaboussure au clic
   - Quelques gouttes tombent en continu (discret, derrière la navbar)
   - Un clic n'importe où crée une éclaboussure (anneau + gouttelettes)
   - Couche en pointer-events:none : ne bloque jamais les clics du site
   - Désactivé si l'utilisateur préfère réduire les animations
   ===================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var layer = document.createElement("div");
  layer.className = "rain-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  var W = window.innerWidth;
  window.addEventListener("resize", function () { W = window.innerWidth; }, { passive: true });

  /* ---------- Pluie d'ambiance ---------- */
  var MAX = window.innerWidth < 760 ? 5 : 10;

  function spawnDrop() {
    var d = document.createElement("span");
    d.className = "drop";
    var dur = 4.5 + Math.random() * 4;          // 4.5 - 8.5 s
    var drift = (Math.random() * 2 - 1) * 45;   // dérive horizontale
    d.style.left = (Math.random() * W) + "px";
    d.style.setProperty("--dur", dur + "s");
    d.style.setProperty("--drift", drift + "px");
    layer.appendChild(d);
    window.setTimeout(function () { d.remove(); }, dur * 1000 + 120);
  }

  window.setInterval(function () {
    if (document.hidden) return;
    if (layer.querySelectorAll(".drop").length < MAX) spawnDrop();
  }, 600);

  /* ---------- Éclaboussure au clic ---------- */
  function splash(x, y) {
    var ring = document.createElement("span");
    ring.className = "splash-ring";
    ring.style.left = x + "px";
    ring.style.top = y + "px";
    layer.appendChild(ring);
    window.setTimeout(function () { ring.remove(); }, 650);

    var n = 8;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = "splash-bit";
      var ang = (Math.PI * 2 * i) / n + (Math.random() * 0.5 - 0.25);
      var dist = 26 + Math.random() * 32;
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      p.style.setProperty("--dy", (Math.sin(ang) * dist - 12).toFixed(1) + "px");
      layer.appendChild(p);
      (function (el) { window.setTimeout(function () { el.remove(); }, 760); })(p);
    }
  }

  document.addEventListener("click", function (e) {
    splash(e.clientX, e.clientY);
  }, { passive: true });
})();
