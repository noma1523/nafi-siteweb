#!/usr/bin/env python3
"""Génère le site multi-pages à partir des blocs de l'ancien index une-page.
Chaque page partage : head, sprite d'icônes, navbar, footer, scripts."""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / "scripts" / "_source_onepage.html").read_text(encoding="utf-8")

# ---------- Extraction des blocs ----------
def section(id_):
    m = re.search(r'(<section\b[^>]*\bid="%s".*?</section>)' % re.escape(id_), SRC, re.S)
    if not m: raise SystemExit("section introuvable: " + id_)
    return m.group(1)

def between(start, end):
    a = SRC.index(start); b = SRC.index(end, a)
    return SRC[a:b]

SPRITE = between('<!-- ===================== SPRITE',
                 '<!-- ===================== NAVBAR')
SPRITE = SPRITE[SPRITE.index('<svg'):]            # garde juste le <svg>...</svg>
SPRITE = "  " + SPRITE[:SPRITE.index('</svg>')+6]

HERO   = section('accueil')
HIST   = section('histoire')
RECIT  = section('notre-histoire')
MARQUE = section('marque')
BIEN   = section('bienfaits')
PROD   = section('produits')
QUAL   = section('qualite')
FAQ    = section('faq')
CONTACT= section('contact')
CTA    = re.search(r'(<section class="cta-banner".*?</section>)', SRC, re.S).group(1)
MODALS = between('<!-- ===================== MODALES',
                 '<!-- ===================== FOOTER')
MODALS = MODALS[:MODALS.rindex('</div>')+6]
FOOTER = re.search(r'(<footer class="footer".*?</footer>)', SRC, re.S).group(1)
TOTOP  = between('<!-- ===================== RETOUR EN HAUT', '<script').rsplit('-->',1)[1]

# ---------- Réécriture des liens internes -> pages ----------
LINKMAP = [
    ('#notre-histoire', 'histoire.html#notre-histoire'),
    ('#accueil',  'index.html'),
    ('#histoire', 'histoire.html'),
    ('#marque',   'index.html#marque'),
    ('#bienfaits','bienfaits.html'),
    ('#produits', 'produits.html'),
    ('#qualite',  'qualite.html'),
    ('#faq',      'contact.html#faq'),
    ('#contact',  'contact.html'),
    ('#distributeur', 'contact.html#distributeur'),
]
def fixlinks(html):
    # ne touche pas aux href="#i-..." (sprite) ni href="#wavepath"
    for a, b in LINKMAP:
        html = html.replace('href="%s"' % a, 'href="%s"' % b)
    return html

# ---------- Gabarits ----------
def head(title, desc, inner):
    body_cls = ' class="page-inner"' if inner else ''
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#06316b" />
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <link rel="icon" type="image/png" href="images/logo-nafi.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<body{body_cls}>

  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>

{SPRITE}
'''

NAVITEMS = [('index.html','Accueil','accueil'), ('histoire.html','Histoire','histoire'),
            ('bienfaits.html','Bienfaits','bienfaits'), ('produits.html','Produits','produits'),
            ('qualite.html','Qualité','qualite'), ('contact.html','Contact','contact')]
def navbar(active):
    links = ""
    for href, label, key in NAVITEMS:
        cls = ' class="active"' if key == active else ''
        links += f'        <a href="{href}"{cls}>{label}</a>\n'
    return f'''
  <!-- ===================== NAVBAR ===================== -->
  <header class="navbar" id="navbar">
    <div class="container nav-inner">
      <a href="index.html" class="brand" aria-label="NAFI - Accueil">
        <img src="images/logo-nafi.png" alt="Logo NAFI" class="brand-logo" data-fallback="logo" />
      </a>

      <nav class="nav-links" id="navLinks" aria-label="Navigation principale">
{links}        <a href="contact.html#distributeur" class="nav-cta">Distributeur</a>
      </nav>

      <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
'''

# ---------- Section "hub" d'accueil : boutons vers les pages ----------
HUB = '''
  <!-- ===================== ACCÈS AUX PAGES ===================== -->
  <section class="section nav-hub">
    <div class="container">
      <div class="section-head reveal">
        <span class="eyebrow">Explorer</span>
        <h2>Découvrez l'univers NAFI</h2>
        <p class="lead">Choisissez une rubrique pour en savoir plus.</p>
      </div>
      <div class="hub-grid">
        <a class="hub-card reveal" href="histoire.html">
          <span class="hub-ico"><svg class="ico" aria-hidden="true"><use href="#i-mountain"/></svg></span>
          <h3>Notre histoire</h3>
          <p>Une source de vie née au cœur de la Guinée.</p>
          <span class="hub-link">Découvrir <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="hub-card reveal" href="bienfaits.html">
          <span class="hub-ico"><svg class="ico" aria-hidden="true"><use href="#i-feather"/></svg></span>
          <h3>Les bienfaits</h3>
          <p>Une eau pure, légère et équilibrée.</p>
          <span class="hub-link">Découvrir <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="hub-card reveal" href="produits.html">
          <span class="hub-ico"><svg class="ico" aria-hidden="true"><use href="#i-drop"/></svg></span>
          <h3>Nos produits</h3>
          <p>Les formats 0,33 L, 0,5 L et 1,5 L.</p>
          <span class="hub-link">Découvrir <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="hub-card reveal" href="qualite.html">
          <span class="hub-ico"><svg class="ico" aria-hidden="true"><use href="#i-flask"/></svg></span>
          <h3>Qualité &amp; process</h3>
          <p>De la source à la bouteille, contrôlée.</p>
          <span class="hub-link">Découvrir <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="hub-card reveal" href="contact.html">
          <span class="hub-ico"><svg class="ico" aria-hidden="true"><use href="#i-chat"/></svg></span>
          <h3>Contact</h3>
          <p>Une question ? Écrivez-nous.</p>
          <span class="hub-link">Découvrir <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="hub-card hub-card--cta reveal" href="contact.html#distributeur">
          <span class="hub-ico"><svg class="ico" aria-hidden="true"><use href="#i-handshake"/></svg></span>
          <h3>Devenir distributeur</h3>
          <p>Rejoignez le réseau de distribution NAFI.</p>
          <span class="hub-link">Faire une demande <span aria-hidden="true">&rarr;</span></span>
        </a>
      </div>
    </div>
  </section>
'''

FOOT = fixlinks(FOOTER)
TAIL = f'''
{fixlinks(TOTOP).strip()}

  <script src="js/main.js"></script>
</body>
</html>
'''

def build(active, title, desc, blocks, inner):
    parts = [head(title, desc, inner), navbar(active)]
    for b in blocks:
        parts.append("\n" + fixlinks(b) + "\n")
    parts.append("\n" + FOOT + "\n")
    parts.append(TAIL)
    return "".join(parts)

PAGES = {
 "index.html": ("accueil",
    "NAFI — L'eau pure de Guinée, la confiance en chaque goutte",
    "NAFI, eau minérale naturelle née en Guinée. De la source à votre verre : captée, purifiée et contrôlée. Disponible à Conakry en 0,33 L, 0,5 L et 1,5 L.",
    [HERO, HUB]),
 "histoire.html": ("histoire",
    "Notre histoire — NAFI, l'eau pure de Guinée",
    "L'histoire de NAFI : une eau minérale née au cœur de la Guinée, symbole de confiance et de fierté nationale.",
    [HIST, RECIT, CTA]),
 "bienfaits.html": ("bienfaits",
    "Les bienfaits — NAFI eau minérale naturelle",
    "Pourquoi choisir NAFI : une eau pure, légère et idéale pour toute la famille au quotidien.",
    [BIEN, CTA]),
 "produits.html": ("produits",
    "Nos produits & formats — NAFI",
    "Découvrez les formats NAFI : 0,33 L, 0,5 L et 1,5 L, adaptés à chaque besoin.",
    [PROD, CTA]),
 "qualite.html": ("qualite",
    "Qualité & process — NAFI",
    "De la source à votre verre : six étapes maîtrisées, analyses en laboratoire et contrôles permanents garantissent la pureté de NAFI.",
    [QUAL]),
 "contact.html": ("contact",
    "Contact & distribution — NAFI",
    "Posez une question ou devenez distributeur NAFI.",
    [CONTACT, FAQ, MODALS]),
}

for fname, (active, title, desc, blocks) in PAGES.items():
    inner = fname != "index.html"
    (ROOT / fname).write_text(build(active, title, desc, blocks, inner), encoding="utf-8")
    print("écrit:", fname)
