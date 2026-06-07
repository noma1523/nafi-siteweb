# NAFI — Site web

Site vitrine de **NAFI**, eau minérale naturelle née en Guinée 🇬🇳.
Site statique (HTML / CSS / JavaScript), sans dépendance ni build.

## Structure

```
.
├── index.html        # Page unique (hero, marque, produits, points de vente, contact, devis)
├── css/style.css     # Styles (mobile-first, palette bleu + accent vert)
├── js/main.js        # Interactions (menu, reveal, compteurs, filtre PDV, devis, WhatsApp)
└── images/           # Logo, hero et visuels des bouteilles
```

## Lancer en local

Ouvrir simplement `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## À configurer

- **Formspree** : remplacer `YOUR_FORM_ID` dans `index.html` (formulaires contact & devis).
- **WhatsApp** : numéro dans `js/main.js` (`WHATSAPP_NUMBER`).
- **Prix** : tarifs des cartons en GNF dans `js/main.js` (`PRIX_CARTON`).
- **Points de vente** : liste `POINTS_DE_VENTE` dans `js/main.js`.
- **Images** : déposer les visuels dans `images/` (logo-nafi.png, hero-nafi.png, bouteille-033/05/15.png).
- **Minéralité** : compléter le tableau dans la section Produits dès réception de l'analyse.
