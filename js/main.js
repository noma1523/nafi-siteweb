/* ============================================================
   NAFI — main.js
   Menu mobile, navbar scroll, reveal, scroll-spy,
   retour en haut, FAQ, formulaires (Formspree)
   ============================================================ */

// Adresse e-mail de secours (utilisée si Formspree n'est pas encore configuré)
const CONTACT_EMAIL = "contact@nafi.gn";

/* ============================================================
   Helpers
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   Année footer
   ============================================================ */
$("#year").textContent = new Date().getFullYear();

/* ============================================================
   Fallback images manquantes -> placeholder propre
   ============================================================ */
function applyImgFallback(img) {
  const kind = img.dataset.fallback;
  img.classList.add("img-missing");
  img.removeAttribute("src");
  img.removeAttribute("alt");
  img.setAttribute("data-label", kind === "logo" ? "Logo NAFI" : "Photo bouteille");
}
$$("img[data-fallback]").forEach(img => {
  img.addEventListener("error", () => applyImgFallback(img));
  // l'image a pu échouer AVANT que le JS s'attache (404 immédiat)
  if (img.complete && img.naturalWidth === 0) applyImgFallback(img);
});

/* ============================================================
   Vidéo de fond du hero : forcer la lecture (autoplay muet)
   ============================================================ */
const heroVideo = $(".hero-video");
if (heroVideo) {
  heroVideo.muted = true;
  const playHero = () => heroVideo.play().catch(() => {});
  if (heroVideo.readyState >= 2) playHero();
  heroVideo.addEventListener("canplay", playHero, { once: true });
}

/* ============================================================
   Navbar : fond au scroll
   ============================================================ */
const navbar = $("#navbar");

/* Un SEUL écouteur de scroll, throttlé par rAF, qui exécute toutes les
   mises à jour liées au défilement (navbar, parallaxe, bouton haut, barre).
   Évite le thrashing de 4 écouteurs séparés. */
const scrollFns = [];
let scrollTicking = false;
const runScrollFns = () => {
  const y = window.scrollY;
  for (let i = 0; i < scrollFns.length; i++) scrollFns[i](y);
  scrollTicking = false;
};
window.addEventListener("scroll", () => {
  if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(runScrollFns); }
}, { passive: true });

const onNav = (y) => navbar.classList.toggle("scrolled", y > 40);
scrollFns.push(onNav);
onNav(window.scrollY);

/* ============================================================
   Menu mobile (burger)
   ============================================================ */
const burger = $("#burger");
const navLinks = $("#navLinks");
const toggleMenu = (open) => {
  const isOpen = open ?? !navLinks.classList.contains("open");
  navLinks.classList.toggle("open", isOpen);
  burger.classList.toggle("open", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
};
burger.addEventListener("click", () => toggleMenu());
$$(".nav-links a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));

/* ============================================================
   Reveal au scroll (IntersectionObserver)
   ============================================================ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
$$(".reveal").forEach(el => io.observe(el));

/* ============================================================
   Parallaxe douce de la bouteille du hero au défilement
   ============================================================ */
const bottleStage = $(".hero-bottle-stage");
if (bottleStage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const vh = () => window.innerHeight;
  scrollFns.push((y) => {
    if (y < vh()) {
      bottleStage.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(${1 - y * 0.00012})`;
    }
  });
}

/* ============================================================
   Formulaires (Formspree) + lien e-mail de secours
   ============================================================ */
function fieldLabel(form, el) {
  if (el.id) {
    const l = form.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id) + '"]');
    if (l) return l.textContent.replace(/\*/g, "").trim();
  }
  const wrap = el.closest("label");
  if (wrap) return wrap.textContent.replace(/\*/g, "").trim();
  return el.name;
}
/* Construit un résumé e-mail à partir de TOUS les champs remplis (générique). */
function buildMailtoSummary(form, context) {
  const lines = [];
  form.querySelectorAll("input, select, textarea").forEach(el => {
    if (!el.name || el.type === "hidden") return;
    if (el.type === "file") {
      if (el.files && el.files.length)
        lines.push(fieldLabel(form, el) + " : " + [...el.files].map(f => f.name).join(", ") + " (à joindre)");
      return;
    }
    if (el.type === "checkbox") { if (el.checked) lines.push(fieldLabel(form, el) + " : Oui"); return; }
    if (el.type === "radio") { if (el.checked) lines.push(fieldLabel(form, el) + " : " + el.value); return; }
    const v = (el.value || "").trim();
    if (!v) return;
    lines.push(fieldLabel(form, el) + " : " + v);
  });
  const subject = form.dataset.subject || "NAFI — Demande via le site";
  const body = "Bonjour NAFI,\n\n" + lines.join("\n") +
    "\n\nSi des documents sont demandés, merci de les joindre à cet e-mail.";
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function refNumber() {
  return "NAFI-" + Date.now().toString().slice(-6);
}

function showSuccess(form, ref) {
  const card = form.closest(".modal-card") || form.parentElement;
  const done = document.createElement("div");
  done.className = "form-done";
  done.innerHTML =
    `<span class="form-done-ico"><svg viewBox="0 0 24 24" aria-hidden="true">` +
    `<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" ` +
    `stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span>` +
    `<h4>Merci, c'est noté&nbsp;!</h4>` +
    `<p>Votre demande est prête — référence <strong>${ref}</strong>.<br>` +
    `Nous vous recontactons rapidement.</p>`;
  form.style.display = "none";
  card.appendChild(done);
}

function handleForm(form) {
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const context = form.dataset.context;
    const ref = refNumber();
    const mailLink = buildMailtoSummary(form, context);

    // Formspree non configuré -> confirmation puis ouverture du client e-mail
    if (form.action.includes("YOUR_FORM_ID")) {
      showSuccess(form, ref);
      setTimeout(() => { window.open(mailLink, "_blank"); }, 400);
      return;
    }

    if (status) { status.className = "form-status loading"; status.textContent = "Envoi en cours…"; }
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error("Formspree error");
      showSuccess(form, ref);
    } catch (err) {
      if (status) {
        status.className = "form-status err";
        status.innerHTML = `Échec de l'envoi. <a href="${mailLink}">Envoyer plutôt par e-mail</a>`;
      }
    }
  });
}

$$(".nafi-form").forEach(handleForm);

/* ============================================================
   Modales de contact (ouverture / fermeture, accessibilité)
   ============================================================ */
let lastFocused = null;
function openModal(modal) {
  if (!modal) return;
  lastFocused = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-lock");
  const first = modal.querySelector("input, select, textarea, button");
  if (first) setTimeout(() => first.focus(), 60);
}
function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-lock");
  if (lastFocused) lastFocused.focus();
}
$$("[data-modal]").forEach(btn => {
  btn.addEventListener("click", () => openModal($("#" + btn.dataset.modal)));
});
$$(".modal [data-close]").forEach(el => {
  el.addEventListener("click", () => closeModal(el.closest(".modal")));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { const m = $(".modal.open"); if (m) closeModal(m); }
});
/* Ouvre automatiquement la modale "Devenir distributeur" via #distributeur */
function openHashModal() {
  if (location.hash === "#distributeur") openModal($("#modal-distrib"));
}
window.addEventListener("hashchange", openHashModal);
openHashModal();

/* ============================================================
   Navigation active au défilement (scroll-spy)
   ============================================================ */
const navAnchors = $$(".nav-links a[href^='#']");
const spySections = navAnchors
  .map(a => document.getElementById(a.getAttribute("href").slice(1)))
  .filter(Boolean);

if (spySections.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navAnchors.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  spySections.forEach(s => spy.observe(s));
}

/* ============================================================
   Bouton retour en haut
   ============================================================ */
const toTop = $("#toTop");
if (toTop) {
  scrollFns.push((y) => toTop.classList.toggle("show", y > 500));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ============================================================
   FAQ : un seul item ouvert à la fois
   ============================================================ */
const faqItems = $$("#faqList .faq-item");
faqItems.forEach(item => {
  item.addEventListener("toggle", () => {
    if (item.open) faqItems.forEach(other => { if (other !== item) other.open = false; });
  });
});

/* ============================================================
   Barre de progression de lecture (scroll)
   ============================================================ */
const progressBar = $("#scrollProgress");
if (progressBar) {
  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    progressBar.style.transform = `scaleX(${pct / 100})`;
  };
  scrollFns.push(updateProgress);
  updateProgress();
  window.addEventListener("resize", updateProgress, { passive: true });
}

/* ============================================================
   Compteurs animés (stats-strip)
   ============================================================ */
function animateCount(el) {
  const target   = parseFloat(el.dataset.count || "0");
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const suffix   = el.dataset.suffix || "";
  const duration = 1600;
  const start    = performance.now();
  const easeOut  = t => 1 - Math.pow(1 - t, 3);

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const val = target * easeOut(p);
    el.textContent = val.toFixed(decimals).replace(".", ",") + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals).replace(".", ",") + suffix;
  };
  requestAnimationFrame(tick);
}

const counters = $$(".stat-num");
if (counters.length) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        countObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => countObserver.observe(c));
}

/* ============================================================
   Stagger automatique des reveals (cascade douce par groupe)
   Pose --i = position de l'élément parmi ses frères .reveal.
   Le CSS l'utilise via transition-delay: calc(var(--i) * .06s).
   Les délais explicites (benefits/products/process…) restent
   prioritaires grâce à leur spécificité plus forte.
   ============================================================ */
(() => {
  const counts = new Map();
  $$(".reveal").forEach(el => {
    const parent = el.parentElement;
    const i = counts.get(parent) || 0;
    el.style.setProperty("--i", i);
    counts.set(parent, i + 1);
  });
})();

/* ============================================================
   Effets 3D interactifs : tilt des cartes + boutons magnétiques.
   Actifs au pointeur ET au tactile (reset sur pointercancel pour ne pas
   gener le defilement). Desactives uniquement si prefers-reduced-motion.
   ============================================================ */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // --- Tilt 3D des cartes (reflet seulement sur celles à overflow caché) ---
  const TILT = 8; // amplitude en degrés
  const GLARE = ".feature-card, .benefit-card, .hub-card, .qg-item, .ls-item";
  $$(".feature-card, .benefit-card, .hub-card, .product-card, .contact-card, .pillar, .qg-item, .ls-item").forEach(card => {
    card.classList.add("tilt");
    let glare = null;
    if (card.matches(GLARE)) {
      glare = document.createElement("span");
      glare.className = "tilt-glare";
      card.appendChild(glare);
    }
    let rect = null, raf = 0, lx = 0, ly = 0;
    card.addEventListener("pointerenter", () => { rect = card.getBoundingClientRect(); card.classList.add("is-tilting"); });
    card.addEventListener("pointermove", (e) => {
      lx = e.clientX; ly = e.clientY;
      if (!rect) rect = card.getBoundingClientRect();
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const px = (lx - rect.left) / rect.width;
        const py = (ly - rect.top) / rect.height;
        const rx = (0.5 - py) * 2 * TILT;
        const ry = (px - 0.5) * 2 * TILT;
        card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
        if (glare) { glare.style.setProperty("--gx", (px * 100).toFixed(1) + "%"); glare.style.setProperty("--gy", (py * 100).toFixed(1) + "%"); }
      });
    });
    const resetCard = () => { card.classList.remove("is-tilting"); card.style.transform = ""; rect = null; };
    card.addEventListener("pointerleave", resetCard);
    card.addEventListener("pointercancel", resetCard);
  });

  // --- Boutons magnétiques (suivi léger du curseur), hors boutons pleine largeur ---
  const MAG = 6; // px
  $$(".btn:not(.btn-block)").forEach(btn => {
    btn.classList.add("is-magnetic");
    let rect = null, raf = 0, lx = 0, ly = 0;
    btn.addEventListener("pointermove", (e) => {
      lx = e.clientX; ly = e.clientY;
      if (!rect) rect = btn.getBoundingClientRect();
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const dx = ((lx - rect.left) / rect.width - 0.5) * 2 * MAG;
        const dy = ((ly - rect.top) / rect.height - 0.5) * 2 * MAG - 3;
        btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
    });
    const resetBtn = () => { btn.style.transform = ""; rect = null; };
    btn.addEventListener("pointerleave", resetBtn);
    btn.addEventListener("pointercancel", resetBtn);
  });
})();

/* ============================================================
   Fond en parallaxe multi-couches (blobs doux qui dérivent au scroll).
   Injecté en JS, désactivé si prefers-reduced-motion (et masqué en CSS sur mobile).
   ============================================================ */
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "bg-parallax";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<span class="b1"></span><span class="b2"></span><span class="b3"></span>';
  document.body.prepend(layer);
  const blobs = $$("span", layer);
  const speeds = [0.07, -0.05, 0.09];
  scrollFns.push((y) => {
    for (let i = 0; i < blobs.length; i++) {
      blobs[i].style.transform = `translate3d(0, ${(y * speeds[i]).toFixed(1)}px, 0)`;
    }
  });
})();

/* ============================================================
   Titres animés mot par mot (cascade à l'apparition).
   Découpe le texte en .word en préservant <br> et les éléments (accent).
   ============================================================ */
(() => {
  const heads = $$(".hero-title, .section-head h2, .story-text h2");
  if (!heads.length) return;

  const split = (el) => {
    let wi = 0;
    const frag = [];
    [...el.childNodes].forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(p => {
          if (p === "") return;
          if (/^\s+$/.test(p)) { frag.push(document.createTextNode(p)); return; }
          const w = document.createElement("span");
          w.className = "word"; w.textContent = p;
          w.style.setProperty("--wi", wi++);
          frag.push(w);
        });
      } else if (node.nodeName === "BR") {
        frag.push(document.createElement("br"));
      } else {
        node.classList.add("word");
        node.style.setProperty("--wi", wi++);
        frag.push(node);
      }
    });
    el.textContent = "";
    frag.forEach(n => el.appendChild(n));
    el.classList.add("anim-words");
  };
  heads.forEach(split);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heads.forEach(h => h.classList.add("is-revealed"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-revealed"); obs.unobserve(e.target); } });
  }, { threshold: 0.25 });
  heads.forEach(h => obs.observe(h));
})();
