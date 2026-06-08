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
const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

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
   Formulaires (Formspree) + lien e-mail de secours
   ============================================================ */
function buildMailtoSummary(form, context) {
  const d = Object.fromEntries(new FormData(form).entries());
  let subject, body;
  if (context === "devis") {
    subject = "Demande de devis NAFI";
    body = `Bonjour NAFI, je souhaite un devis :\n` +
      `- 0,33 L : ${d.packs_033 || 0} pack(s) de 12\n` +
      `- 0,5 L : ${d.packs_05 || 0} pack(s) de 12\n` +
      `- 1,5 L : ${d.packs_15 || 0} pack(s) de 6\n` +
      `Livraison : ${d.lieu_livraison || "-"} le ${d.date_livraison || "-"}\n` +
      `Événement : ${d.type_evenement || "-"}\n` +
      `Nom : ${d.nom || "-"} | Tél : ${d.telephone || "-"}`;
  } else {
    subject = "Message via le site NAFI";
    body = `Bonjour NAFI,\n` +
      `Nom : ${d.nom || "-"}${d.societe ? " (" + d.societe + ")" : ""}\n` +
      `Sujet : ${d.sujet || "-"}\n` +
      `Tél : ${d.telephone || "-"}\n` +
      `Message : ${d.message || "-"}`;
  }
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function refNumber() {
  return "NAFI-" + Date.now().toString().slice(-6);
}

function handleForm(formId, statusId) {
  const form = $("#" + formId);
  const status = $("#" + statusId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const context = form.dataset.context;
    const ref = refNumber();
    const mailLink = buildMailtoSummary(form, context);

    // Si Formspree non configuré -> bascule vers le client e-mail
    if (form.action.includes("YOUR_FORM_ID")) {
      status.className = "form-status ok";
      status.innerHTML = `Suivi <strong>${ref}</strong> — ouverture de votre messagerie…`;
      window.location.href = mailLink;
      return;
    }

    status.className = "form-status loading";
    status.textContent = "Envoi en cours…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        status.className = "form-status ok";
        status.innerHTML = `Demande envoyée — suivi <strong>${ref}</strong>. Nous vous recontactons rapidement.`;
        form.reset();
      } else {
        throw new Error("Formspree error");
      }
    } catch (err) {
      status.className = "form-status err";
      status.innerHTML = `Échec de l'envoi. ` +
        `<a href="${mailLink}">Envoyer plutôt par e-mail</a>`;
    }
  });
}

handleForm("contactForm", "contactStatus");
handleForm("devisForm", "devisStatus");

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
  const toggleToTop = () => toTop.classList.toggle("show", window.scrollY > 500);
  toggleToTop();
  window.addEventListener("scroll", toggleToTop, { passive: true });
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
    progressBar.style.width = pct + "%";
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
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
