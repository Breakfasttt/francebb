---
description: Termine un gros chantier - vérifications, fiche de fonctionnalité, rangement de la carte, proposition de commit
argument-hint: <numéro de carte>
---

Clôture de la carte **$ARGUMENTS** (`kanban/en-cours/$ARGUMENTS-*.md`).

1. `pnpm check`. Si l'interface est touchée : `pnpm --filter @bbfrance/site test:parcours` (téléphone et ordinateur ; serveur de développement arrêté). Si un écran nouveau n'est pas dans `apps/site/tests/parcours/parcours.spec.ts`, l'y ajouter. Un échec arrête tout. La suite e2e complète tourne en CI : pas en local sans demande.
2. Mettre à jour la fiche `docs/features/<nom>/README.md` si le comportement visible a changé (modèle `docs/features/TEMPLATE.md`). Nouveau composant partagé : une ligne dans `reuse-first`. Changement de mise en ligne : `DEPLOY.md`.
3. Si le nombre d'erreurs ESLint a baissé : `node scripts/lint-ratchet.mjs --update` (dans `apps/site`).
4. Remplir la section « Résultat » de la carte. Ce qui reste à essayer à la main va dans `TESTS-MANUELS.md`. Après accord du user : `git mv` de la carte vers `archive/kanban/`.
5. Proposer le commit après avoir montré `git diff --cached --stat` : titre `[NNN] …` de moins de 50 caractères, corps qui dit pourquoi, **jamais de ligne `Co-Authored-By`**. Ne commiter que si le user le demande.
