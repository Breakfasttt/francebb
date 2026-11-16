---
id: 013
title: Règles ESLint d'architecture
epic: E05
app: site
depends_on: []
adr: 
verify: le cliquet compte les nouvelles règles
---

# 013 — Règles ESLint d'architecture

## Action

`no-restricted-syntax` (ESLint natif, pas de plugin) : hex en TSX, `<button>`/`<select>` natifs, imports cross-app (P3). Plafond du cliquet par règle pour ne pas noyer les erreurs existantes. À faire au début de P4.

## Résultat

Trois règles d'architecture sont désormais vérifiées par ESLint dans `apps/site/eslint.config.mjs`, sans aucune nouvelle bibliothèque :

- **Couleurs en dur** : `no-restricted-syntax` refuse un code couleur hexadécimal (`#fff`, `#2E7D32`) dans une chaîne ou un gabarit de texte d'un fichier `.tsx`. Elle ajoute **105 erreurs**.
- **Boutons et listes déroulantes natifs** : `react/forbid-elements` (fournie par le plugin React déjà présent dans `eslint-config-next`) refuse `<button>` et `<select>` dans un fichier `.tsx`, sauf dans les composants de base `common/components/Button/` et `ClassicSelect`. Elle ajoute **205 erreurs** : 204 boutons et 1 liste déroulante. Cette règle remplace `no-restricted-syntax` prévu au départ, parce qu'elle donne un message distinct et un compte séparé dans le cliquet.
- **Imports entre applications** : `no-restricted-imports` refuse d'importer le code d'une autre application, par son nom de paquet (`@bbfrance/hub`, `@bbfrance/bbscheme`), par un chemin qui passe par `apps/`, ou par un chemin relatif qui remonte jusqu'au dossier du hub. Elle ajoute **0 erreur** : la frontière est déjà respectée. La règle `import/no-relative-packages` a été essayée puis écartée, car elle signalait à tort les imports du client Prisma généré et des scripts communs du dépôt.

Le cliquet (`apps/site/scripts/lint-ratchet.mjs`) garde maintenant un plafond **par règle** en plus du total, dans `apps/site/lint-baseline.json`. Une règle absente du fichier a un plafond de zéro. Le total passe de 530 à 840 erreurs (530 + 105 + 205). Le code existant n'a pas été corrigé.

Documentation mise à jour : nouvelle section « Règles vérifiées automatiquement » dans `ARCHITECTURE.md`, entrée « ESLint » du glossaire, `apps/site/CLAUDE.md` et le skill `ui-components`.

Vérifications : `npx tsc --noEmit` sans erreur ; `node scripts/lint-ratchet.mjs` à 840 erreurs pour un plafond de 840 après `--update` ; un fichier d'essai passé à ESLint déclenche bien les trois règles (import de `../hub/…`, de `@bbfrance/hub` et de `../../apps/hub/…`, couleur `#fff` dans un gabarit, `<button>` et `<select>`), tandis qu'un import de `../bbscheme/…` (dossier du site) reste accepté. Aucune interface n'a été modifiée, donc pas de test sur téléphone ni de test de parcours.
