# CLAUDE.md — Charte d'Économie de Tokens & de Développement Sécurisé

> Charte globale appliquée à TOUS les dépôts. Source canonique : `~/.claude/templates/CLAUDE.charter.md`.
> Objectif : minimiser le contexte chargé (contourner le coût d'attention quadratique O(n²))
> et imposer une discipline de développement sûre (RGPD / EU AI Act / OWASP).

## 1. Context Navigation — interroger le graphe AVANT de lire des fichiers bruts
- **Toujours** privilégier une requête ciblée sur le graphe de connaissances Graphify
  plutôt que la lecture exhaustive de fichiers :
  - `graphify query "<question>" --budget 2000` (traversée BFS bornée en tokens)
  - `graphify explain "<symbole>"` / `graphify path "A" "B"` / `graphify affected "<symbole>"`
- À défaut de graphe, consulter le **wiki Markdown** (`wiki/`) avant les sources brutes.
- Ne lire un fichier brut intégral qu'en dernier recours, et seulement la portion utile.
- Si le graphe est absent ou périmé : `graphify update .` (AST, sans LLM) avant d'interroger.

## 2. Context Lifecycle — surveiller la mémoire de travail
- Surveiller activement l'occupation du contexte.
- **Dès ~60 % d'occupation, déclencher `/compact`** pour éviter le « context rot ».
  (Mécanisme comportemental : Claude doit proposer/exécuter `/compact` ; il n'existe pas
  de déclencheur automatique par pourcentage dans le harness — la discipline est manuelle.)
- Résumer et purger les digressions ; ne garder que l'état strictement nécessaire.

## 3. Workflow en 3 phases — pas d'implémentation sans plan validé
1. **Recherche sémantique** — cartographier le besoin via le graphe / le wiki.
2. **Plan d'architecture** — rédiger un plan écrit (fichiers touchés, risques, alternatives).
3. **Implémentation chirurgicale** — uniquement APRÈS validation humaine explicite ;
   éditions minimales et ciblées, jamais de réécriture massive non demandée.

## 4. Security & Privacy by Design (RGPD / EU AI Act / OWASP)
- **Interdiction absolue** d'écrire ou modifier du code d'**authentification** ou de
  **cryptographie critique** sans contrôle humain explicite. Signaler, proposer, attendre.
- **Données personnelles (RGPD)** : anonymiser ou pseudonymiser par défaut ; jamais de
  données réelles en logs, fixtures ou tests. Minimisation des données.
- **Injections (OWASP)** : requêtes SQL **paramétrées** uniquement (jamais de concaténation) ;
  valider/échapper toute entrée externe ; encoder les sorties (anti-XSS).
- **Secrets** : jamais en clair dans le code ni le graphe ; variables d'environnement / coffre.
- **EU AI Act** : garder une trace des décisions d'architecture sensibles (traçabilité).

---
*Ce fichier a été (ou peut être) généré automatiquement au démarrage de session.
Il ne sera jamais écrasé s'il existe déjà : éditez-le librement pour ce projet.*
