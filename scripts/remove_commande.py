#!/usr/bin/env python3
"""Retire l'option 'Commander' : carte contact + modale + tous les CTA d'achat,
réorientés vers 'Devenir distributeur'. Garde 'Poser une question' et 'Devenir distributeur'."""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
p = ROOT / "scripts" / "_source_onepage.html"
s = p.read_text(encoding="utf-8")

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        raise SystemExit(f"ATTENDU {n}, TROUVÉ {c} pour : {old[:70]!r}")
    s = s.replace(old, new)

# --- Bannière CTA : retitrée, bouton -> Devenir distributeur ---
rep('<section class="cta-banner" aria-label="Commander NAFI">',
    '<section class="cta-banner" aria-label="Rejoindre NAFI">')
rep('<span class="eyebrow eyebrow--light">Commandez dès maintenant</span>',
    '<span class="eyebrow eyebrow--light">Rejoignez NAFI</span>')
rep('<h2>L\'eau pure de Guinée, livrée partout à Conakry</h2>',
    '<h2>L\'eau pure de Guinée, présente partout à Conakry</h2>')
rep('<p>Pour la maison, le bureau, votre commerce ou vos événements — choisissez le format NAFI qu\'il vous faut, en packs pratiques.</p>',
    '<p>Pour la maison, le bureau ou votre commerce — découvrez nos formats et rejoignez le réseau de distribution NAFI.</p>')
rep('<a href="#devis" class="btn btn-light">Demander un devis</a>',
    '<a href="#distributeur" class="btn btn-light">Devenir distributeur</a>')

# --- Carte produit "pros" ---
rep('<p class="product-sale">Packs &amp; palettes sur commande</p>',
    '<p class="product-sale">Packs &amp; palettes pour les pros</p>')
rep('<a href="#devis" class="btn btn-primary btn-sm">Demander un devis</a>',
    '<a href="#distributeur" class="btn btn-primary btn-sm">Devenir distributeur</a>')

# --- FAQ ---
rep('<p>NAFI est distribuée dans tout Conakry — boutiques, supermarchés, dépôts et marchés. Pour commander en gros ou vous faire livrer, utilisez le formulaire <a href="#devis">Devis de commande</a> ou contactez-nous directement.</p>',
    '<p>NAFI est distribuée dans tout Conakry — boutiques, supermarchés, dépôts et marchés. Pour les commerces et grossistes, contactez-nous ou remplissez le formulaire <a href="#distributeur">Devenir distributeur</a>.</p>')
rep('disponible en gros volumes (palettes sur commande)',
    'disponible en gros volumes pour les professionnels')
rep('<summary>Puis-je commander en gros pour un événement ?</summary>',
    '<summary>Proposez-vous NAFI en gros volumes ?</summary>')
rep('<p>Oui. Utilisez le formulaire <a href="#devis">Devis de commande</a> : indiquez les formats, le nombre de packs, le lieu et la date de livraison. Nous revenons vers vous rapidement avec une proposition adaptée.</p>',
    '<p>Oui. Pour les commerces, grossistes et gros volumes, remplissez le formulaire <a href="#distributeur">Devenir distributeur</a> ou contactez-nous — nous revenons vers vous rapidement avec une proposition adaptée.</p>')

# --- Pied de page ---
rep('<a href="#devis">Devis de commande</a>',
    '<a href="#distributeur">Devenir distributeur</a>')

# --- Section contact : retirer l'ancre #devis et la carte "Commander" ---
rep('<div class="contact-options" id="devis">',
    '<div class="contact-options">')
s2, n = re.subn(
    r'\n\n        <button class="contact-card reveal" type="button" data-modal="modal-commande">.*?</button>',
    '', s, flags=re.S)
if n != 1: raise SystemExit(f"carte Commander : {n} retirée(s)")
s = s2

# --- Retirer la modale de commande ---
s2, n = re.subn(
    r'\n\n  <!-- Modale : Commander maintenant -->\n  <div class="modal" id="modal-commande".*?\n  </div>',
    '', s, flags=re.S)
if n != 1: raise SystemExit(f"modale commande : {n} retirée(s)")
s = s2

p.write_text(s, encoding="utf-8")
print("OK — option Commander retirée.",
      "Reste #devis ?", s.count('href="#devis"'),
      "| modal-commande ?", s.count('modal-commande'),
      "| Commander maintenant ?", s.count('Commander maintenant'))
