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
