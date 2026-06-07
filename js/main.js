/* ============================================================
   NAFI — main.js
   Menu mobile • navbar scroll • reveal • compteurs •
   points de vente + filtre • estimation prix GNF •
   formulaires (Formspree) • WhatsApp flottant
   ============================================================ */

/* ⚙️⚙️⚙️ ZONE À MODIFIER FACILEMENT ⚙️⚙️⚙️ */

// Numéro WhatsApp pro (format international SANS +, ni espaces)
const WHATSAPP_NUMBER = "224611260303";

// Prix INDICATIFS par carton, en GNF (à ajuster avec tes vrais tarifs)
const PRIX_CARTON = {
  "033": 30000,  // 0,33 L — carton
  "05":  35000,  // 0,5 L  — carton
  "15":  45000   // 1,5 L  — carton
};

// Liste des points de vente (ajoute/modifie librement)
// commune ∈ Kaloum, Dixinn, Matam, Ratoma, Matoto
const POINTS_DE_VENTE = [
  { nom: "Marché Madina",          commune: "Matam",   type: "Grossiste",   zone: "Madina" },
  { nom: "Supermarché Kaloum",     commune: "Kaloum",  type: "Détaillant",  zone: "Centre-ville" },
  { nom: "Boutique Dixinn Port",   commune: "Dixinn",  type: "Détaillant",  zone: "Dixinn Port" },
  { nom: "Dépôt Ratoma Kipé",      commune: "Ratoma",  type: "Grossiste",   zone: "Kipé" },
  { nom: "Alimentation Matoto",    commune: "Matoto",  type: "Détaillant",  zone: "Gbessia" },
  { nom: "Station Coléah",         commune: "Matam",   type: "Détaillant",  zone: "Coléah" },
  { nom: "Marché Taouyah",         commune: "Ratoma",  type: "Détaillant",  zone: "Taouyah" },
  { nom: "Dépôt Aéroport",         commune: "Matoto",  type: "Grossiste",   zone: "Aéroport" }
];

/* ============================================================
   Helpers
   ============================================================ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const formatGNF = (n) => n.toLocaleString("fr-FR") + " GNF";

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
      // compteurs
      if (e.target.classList.contains("stat")) animateCount(e.target);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
$$(".reveal").forEach(el => io.observe(el));

/* ============================================================
   Compteurs animés
   ============================================================ */
function animateCount(statEl) {
  const numEl = $(".stat-num", statEl);
  if (!numEl) return;
  const target = parseInt(numEl.dataset.count, 10) || 0;
  const duration = 1600;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    numEl.textContent = Math.floor(eased * target).toLocaleString("fr-FR");
    if (p < 1) requestAnimationFrame(step);
    else numEl.textContent = target.toLocaleString("fr-FR");
  };
  requestAnimationFrame(step);
}

/* ============================================================
   Points de vente : rendu + filtre par commune
   ============================================================ */
const pdvList = $("#pdvList");

function renderPDV(commune = "all") {
  const items = commune === "all"
    ? POINTS_DE_VENTE
    : POINTS_DE_VENTE.filter(p => p.commune === commune);

  if (!items.length) {
    pdvList.innerHTML = `<p class="pdv-empty">Aucun point de vente pour cette commune (bientôt disponible).</p>`;
    return;
  }

  pdvList.innerHTML = items.map(p => {
    const query = encodeURIComponent(`${p.nom}, ${p.zone}, ${p.commune}, Conakry, Guinée`);
    const maps = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    return `
      <div class="pdv-item">
        <div>
          <h4>${p.nom}</h4>
          <p class="pdv-meta">${p.zone} — ${p.commune}</p>
          <span class="pdv-tag">${p.type}</span>
        </div>
        <a class="pdv-route" href="${maps}" target="_blank" rel="noopener">Itinéraire ➜</a>
      </div>`;
  }).join("");
}

$("#communeFilter").addEventListener("click", (e) => {
  const btn = e.target.closest(".commune-btn");
  if (!btn) return;
  $$(".commune-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderPDV(btn.dataset.commune);
});
renderPDV();

/* ============================================================
   Estimation de prix (devis) en GNF
   ============================================================ */
const estimateTotalEl  = $("#estimateTotal");
const estimateHiddenEl = $("#estimateHidden");

function updateEstimate() {
  let total = 0;
  $$(".qty-input").forEach(input => {
    const key = input.dataset.priceKey;
    const qty = parseInt(input.value, 10) || 0;
    total += qty * (PRIX_CARTON[key] || 0);
  });
  estimateTotalEl.textContent = formatGNF(total);
  estimateHiddenEl.value = formatGNF(total);
}
$$(".qty-input").forEach(input => {
  input.addEventListener("input", updateEstimate);
});
updateEstimate();

/* ============================================================
   WhatsApp flottant
   ============================================================ */
const waToggle = $("#waToggle");
const waMenu   = $("#waMenu");
waToggle.addEventListener("click", () => {
  const show = waMenu.hasAttribute("hidden");
  waMenu.toggleAttribute("hidden", !show);
});
document.addEventListener("click", (e) => {
  if (!$("#waFloat").contains(e.target)) waMenu.setAttribute("hidden", "");
});

/* ============================================================
   Formulaires (Formspree) + lien WhatsApp de secours
   ============================================================ */
function buildWhatsAppSummary(form, context) {
  const d = Object.fromEntries(new FormData(form).entries());
  let msg;
  if (context === "devis") {
    msg = `Bonjour NAFI, je souhaite un devis :\n` +
      `• 0,33 L : ${d.cartons_033 || 0} carton(s)\n` +
      `• 0,5 L : ${d.cartons_05 || 0} carton(s)\n` +
      `• 1,5 L : ${d.cartons_15 || 0} carton(s)\n` +
      `Estimation : ${d.estimation_gnf || "-"}\n` +
      `Livraison : ${d.lieu_livraison || "-"} le ${d.date_livraison || "-"}\n` +
      `Événement : ${d.type_evenement || "-"}\n` +
      `Nom : ${d.nom || "-"} | Tél : ${d.telephone || "-"}`;
  } else {
    msg = `Bonjour NAFI,\n` +
      `Nom : ${d.nom || "-"}${d.societe ? " (" + d.societe + ")" : ""}\n` +
      `Sujet : ${d.sujet || "-"}\n` +
      `Tél : ${d.telephone || "-"}\n` +
      `Message : ${d.message || "-"}`;
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
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
    const context = form.dataset.waContext;
    const ref = refNumber();
    const waLink = buildWhatsAppSummary(form, context);

    // Si Formspree non configuré -> bascule directe vers WhatsApp
    if (form.action.includes("YOUR_FORM_ID")) {
      status.className = "form-status ok";
      status.innerHTML = `Suivi <strong>${ref}</strong> — ouverture de WhatsApp…`;
      window.open(waLink, "_blank");
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
        status.innerHTML = `Demande envoyée ✅ — suivi <strong>${ref}</strong>. ` +
          `<a href="${waLink}" target="_blank" rel="noopener">Confirmer sur WhatsApp</a>`;
        form.reset();
        updateEstimate();
        window.open(waLink, "_blank");
      } else {
        throw new Error("Formspree error");
      }
    } catch (err) {
      status.className = "form-status err";
      status.innerHTML = `Échec de l'envoi. ` +
        `<a href="${waLink}" target="_blank" rel="noopener">Envoyer plutôt par WhatsApp</a>`;
    }
  });
}

handleForm("contactForm", "contactStatus");
handleForm("devisForm", "devisStatus");
