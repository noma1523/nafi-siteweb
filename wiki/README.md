# LLM Wiki — Nafi siteweb

Base de connaissances Markdown destinée à être interrogée **avant** la lecture de fichiers bruts
(cf. Charte `../CLAUDE.md`, principe 1 — Context Navigation).

## Structure
- `wiki/`        — pages de connaissance stables (architecture, décisions, conventions).
- `wiki/inbox/`  — notes brutes à trier/raffiner avant promotion dans `wiki/`.
- `../raw/`      — sources brutes ingérées (via `graphify add <url>`), non éditées.
- `../_templates/` — gabarits de pages.

## Flux
1. Capturer dans `inbox/` → 2. Raffiner → 3. Promouvoir vers une page `wiki/` → 4. Re-cartographier (`graphify update .`).

## Interroger
```bash
graphify query "<question>" --budget 2000
graphify explain "<symbole>"
```
