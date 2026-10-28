---
description: Termine une carte - vérifications, fiche de fonctionnalité, rangement, proposition de commit
argument-hint: <numéro de carte>
---

Clôture de la carte **$ARGUMENTS** (`kanban/en-cours/$ARGUMENTS-*.md`).

1. Lancer la vérification (`verify`) de la carte, puis `pnpm typecheck`, `pnpm lint:ratchet` et `pnpm test:e2e`. Montrer les résultats. Un échec arrête tout.
2. **Mobile** : si la carte touche l'interface, vérifier les écrans concernés en taille téléphone (tests mobiles verts, pas de défilement horizontal, boutons utilisables au pouce). Sinon, la carte n'est pas terminée.
3. Mettre à jour la fiche de la fonctionnalité concernée (`docs/features/<nom>/README.md`, modèle `docs/features/TEMPLATE.md`), ou la créer si elle n'existe pas.
4. Nouveau composant ou outil partagé : l'ajouter au skill `reuse-first`. Changement de mise en ligne : mettre à jour `DEPLOY.md`. Nouveau terme technique : l'ajouter à `docs/GLOSSAIRE.md`.
5. Si le nombre d'erreurs ESLint a baissé : `node scripts/lint-ratchet.mjs --update` (dans `apps/site`).
6. Demander au user de valider le résultat. Après son accord : ajouter une section « Résultat » à la carte, la déplacer avec `git mv` dans `kanban/termine/`, puis lancer `pnpm kanban`.
7. Proposer le commit après avoir montré `git diff --cached --stat`. Format : titre `[NNN] …` de moins de 50 caractères, corps qui explique pourquoi, auteur breakyt, **jamais de ligne `Co-Authored-By`**. Ne commiter que si le user le demande.
