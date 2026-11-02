---
id: 154
title: "Chemins de la configuration Playwright du hub"
epic: E09
app: hub
depends_on: []
adr: 
verify: en ouvrant apps/hub/playwright.config.ts dans VS Code, l'extension Playwright n'affiche plus l'erreur ENOENT sur tests/.sso-client.json
---

# 154 — Chemins de la configuration Playwright du hub

## Pourquoi

À l'ouverture de `apps/hub/playwright.config.ts`, VS Code affichait l'erreur `ENOENT: no such file or directory, open 'tests\.sso-client.json'` (ENOENT veut dire « fichier introuvable »). La configuration lisait trois fichiers avec des chemins relatifs, résolus à partir du dossier où la commande est lancée. `pnpm test:sso` est lancé depuis `apps/hub` et trouvait donc les fichiers, mais l'extension Playwright de VS Code charge la configuration depuis la racine du dépôt, où ils n'existent pas.

## Action

Dans `apps/hub/playwright.config.ts`, construire les chemins de `tests/.sso-client.json`, `tests/.sso-hooks.json` et `../../.local-postgres.json` à partir du dossier du fichier de configuration (`path.join(__dirname, …)`), quel que soit le dossier de lancement.

## Résultat

Les trois chemins sont maintenant construits à partir du dossier `apps/hub`. Aucun test n'a été lancé, à la demande du responsable.

- Fichier modifié : `apps/hub/playwright.config.ts`.
- À vérifier à la main : rouvrir ce fichier dans VS Code et constater que l'erreur a disparu, puis lancer une fois `pnpm test:sso` depuis `apps/hub` pour confirmer que les tests démarrent toujours. Les fichiers `tests/.sso-*.json` n'existent qu'après un premier `pnpm test:sso` : sur une copie neuve du dépôt, l'erreur reste normale tant que ce lancement n'a pas eu lieu.
