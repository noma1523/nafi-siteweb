/* =====================================================================
   NAFI — Bannière de consentement cookies (RGPD)
   GA4 est chargé en "consent mode" (analytics_storage = denied par défaut,
   défini dans le <head>). Ici on affiche la bannière si aucun choix n'a
   encore été fait, et on met à jour le consentement selon le clic.
   Le choix est mémorisé (localStorage) pour ne pas réafficher la bannière.
   ===================================================================== */
(function () {
  "use strict";
  var KEY = "nafi-consent";

  function apply(state) {
    try { localStorage.setItem(KEY, state); } catch (e) {}
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: state === "granted" ? "granted" : "denied"
      });
    }
  }

  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  if (stored === "granted" || stored === "denied") return; // choix déjà fait

  function close(bar) {
    bar.classList.remove("show");
    window.setTimeout(function () { bar.remove(); }, 350);
  }

  function build() {
    if (document.querySelector(".cookie-bar")) return;
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Consentement aux cookies");
    bar.innerHTML =
      '<p class="cookie-txt">Nous utilisons des cookies de mesure d’audience (Google Analytics) ' +
      'pour comprendre la fréquentation du site. ' +
      '<a href="confidentialite.html">En savoir plus</a>.</p>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="cookie-refuse">Refuser</button>' +
        '<button type="button" class="cookie-accept">Accepter</button>' +
      "</div>";
    document.body.appendChild(bar);
    window.setTimeout(function () { bar.classList.add("show"); }, 40);
    bar.querySelector(".cookie-accept").addEventListener("click", function () { apply("granted"); close(bar); });
    bar.querySelector(".cookie-refuse").addEventListener("click", function () { apply("denied"); close(bar); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
