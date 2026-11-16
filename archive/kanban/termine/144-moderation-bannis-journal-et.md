---
id: 144
title: "Modération : liste des bannis, journal, « Ignorer »"
epic: E01
app: site
depends_on: [102]
adr: 
verify: la liste des bannis garde le même ordre d'une page à l'autre et se charge en une requête ; ouvrir le journal ne crée plus de ligne « Nettoyage automatique » vide ; un modérateur peut ignorer un signalement depuis l'écran ; tests e2e
---

# 144 — Modération : liste des bannis, journal, « Ignorer »

## Pourquoi

Défauts trouvés pendant la refonte de la modération (carte 099) :

- `getBannedUsers` découpe la liste en pages (`take` et `skip`) sans ordre fixe (`orderBy`) : un même banni peut apparaître sur deux pages ou sur aucune. La fonction fait en plus une requête à la base par banni, ce qui rend la liste lente.
- La purge automatique du journal écrit une ligne « Nettoyage automatique… (0 entrées supprimées) » chaque fois qu'un administrateur ouvre la première page du journal, même quand rien n'a été supprimé.
- L'action serveur sait classer un signalement comme « ignoré » (`REPORT_IGNORED`), mais aucun bouton de l'écran ne la propose.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Trier `getBannedUsers` par un ordre stable (date du bannissement puis identifiant) et regrouper ses requêtes.
- N'écrire la ligne de purge que si des entrées ont été supprimées.
- Ajouter « Ignorer » au menu « ⋯ » d'un signalement, ou retirer l'action serveur si elle n'a plus d'usage.
- Compléter `apps/site/tests/e2e/inventaire/moderation.spec.ts`.

## Résultat

Fait (tests écrits, pas encore lancés).

- **Bannis** : `getBannedUsers` charge les bannis et leurs lignes « USER_BANNED » du journal en deux requêtes fixes (au lieu d'une requête par banni), trie par date du bannissement (la plus récente d'abord) puis par identifiant, et découpe la page ensuite. La date du bannissement n'étant pas une colonne du membre (pas de changement de schéma), la pagination se fait en mémoire.
- **Journal** : la purge automatique n'écrit sa ligne « Nettoyage automatique… » que si elle a supprimé au moins une entrée. Cela vaut aussi pour le bouton « Purger > 3 mois » (la notification donne toujours le nombre d'entrées supprimées).
- **Ignorer** : chaque fiche de signalement a un menu « ⋯ » (« Plus d'actions sur ce signalement », `ActionMenu` de `packages/ui`) avec « Ignorer le signalement ». La fenêtre de confirmation est celle de « Marquer comme traité », avec son propre titre, son message, son bouton « Ignorer » et le commentaire facultatif.
- Fichiers : `apps/site/app/moderation/actions.ts`, `apps/site/app/moderation/component/ReportsTab.tsx`, fiche `docs/features/moderation/README.md`.
- Tests : trois tests ajoutés à `apps/site/tests/e2e/inventaire/moderation.spec.ts` (« Ignorer » depuis le menu, journal sans ligne de purge vide, ordre stable des bannis sur deux pages avec 11 bannis à la même date).
- À essayer à la main : sur téléphone, ouvrir le menu « ⋯ » d'un signalement et l'ignorer ; ouvrir le journal en administrateur deux fois de suite et vérifier qu'aucune ligne « 0 entrées supprimées » n'apparaît.
