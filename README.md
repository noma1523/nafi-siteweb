# NAFI — Site web

Site vitrine de **NAFI**, eau minérale naturelle née en Guinée.
Site statique (HTML / CSS / JavaScript), sans dépendance ni build.

## Structure

```
.
├── index.html        # Page unique (hero, histoire, bienfaits, produits, qualité, FAQ, contact, devis)
├── css/style.css     # Styles (mobile-first, palette bleu + accent vert)
├── js/main.js        # Interactions (menu, reveal, compteurs, FAQ, formulaires)
├── images/           # Logo, illustrations bouteilles et visuels
└── videos/           # Clip de fond du hero (hero-water.mp4)
```

## Lancer en local

Ouvrir simplement `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## À configurer

- **Formspree** : remplacer `YOUR_FORM_ID` dans `index.html` (formulaires contact & devis).
- **E-mail** : adresse de secours dans `js/main.js` (`CONTACT_EMAIL`).
- **Vidéo hero** : déposer le clip dans `videos/hero-water.mp4` (sinon l'animation de fond s'affiche).
- **Réseaux sociaux** : liens Facebook / Instagram dans le pied de page d'`index.html`.
- **Images** : déposer les visuels dans `images/`.
