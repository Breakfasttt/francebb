---
description: Clôt une carte — vérifications, README de feature, statut, proposition de commit
argument-hint: <numéro de carte>
---

Clôture de la carte **$ARGUMENTS** (`kanban/en-cours/$ARGUMENTS-*.md`).

1. Lancer le `verify` de la carte, puis `npm run typecheck`, `npm run lint:ratchet`, `npm run test:e2e`. Montrer les sorties ; un échec = stop.
2. Mettre à jour le `docs/features/<feature>/README.md` concerné (≤60 lignes, format `docs/features/TEMPLATE.md`) ; le créer s'il n'existe pas.
3. Nouveau composant/helper partagé ? L'ajouter au skill `reuse-first`. Changement de déploiement ? `README.md` + `DEPLOY.md`.
4. Si les compteurs de dette ou les erreurs ESLint baissent : `npm run lint:ratchet -- --update`.
5. Demander au user de valider le résultat. Sur accord : ajouter une section « Résultat » à la carte, la déplacer avec `git mv` dans `kanban/termine/`, puis `pnpm kanban`.
6. Proposer le commit (`git diff --cached --stat` d'abord) : sujet `[NNN] …` < 50 caractères, auteur breakyt, **aucun `Co-Authored-By`**. Ne commiter que sur demande explicite.
