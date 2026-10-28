# BBFrance — consignes pour l'IA

Ce fichier ne contient que ce qui est propre au travail de l'IA. Les règles du projet sont écrites ailleurs, **à lire avant toute tâche** :

| Document | Contenu |
|---|---|
| `README.md` | Présentation, **les deux règles absolues**, plan du dépôt, commandes de vérification |
| `ARCHITECTURE.md` | Organisation du code, règles de code, réutilisation, bibliothèques, données |
| `kanban/README.md` | Format et cycle de vie des cartes |
| `docs/GLOSSAIRE.md` | Les termes techniques expliqués |
| `docs/features/<nom>/README.md` | La fiche de la fonctionnalité à modifier |
| `docs/adr/` | Les décisions déjà prises et leurs raisons |
| `apps/<app>/CLAUDE.md`, `packages/<paquet>/CLAUDE.md` | Particularités d'une application ou d'un paquet |

## Les deux règles absolues (rappel)

1. **Tout ce que tu écris dans le projet doit être compréhensible par quelqu'un qui le découvre.** Cela vaut pour la documentation, les cartes, les commentaires et les messages de commit : phrases complètes en français, chaque terme technique ou acronyme expliqué sur place ou ajouté à `docs/GLOSSAIRE.md`. Pas de style télégraphique dans les fichiers du projet.
2. **Le site doit être impeccable sur téléphone.** Toute modification d'interface est vérifiée en taille téléphone : lisible sans zoom, boutons d'au moins 44 pixels, pas de défilement horizontal, fluide.

## Façon de travailler

- **Tout travail correspond à une carte du kanban.** Pas de carte ? Utiliser `/card` d'abord.
- **Avant de coder une carte** : rappeler son objectif, présenter le plan (fichiers, étapes) et **attendre la validation du user**.
- **Décision importante** (connexion des membres, base de données, bibliothèque majeure, découpage d'application, organisation du projet) : utiliser `/council`, qui produit un ADR.
- **Fin d'une carte** : utiliser `/ship` (vérifications, test mobile, fiche de fonctionnalité, rangement de la carte).
- Ne modifier que les fichiers utiles à la carte. Un refactor ou un renommage hors carte se propose, il ne se fait pas.
- Avant de supprimer du code, lister ce qui l'utilise. Pour déplacer du code, le copier à l'identique, sans le réécrire.
- Un changement de mise en ligne se répercute dans `DEPLOY.md`.

## Commits et git

- Auteur unique : **breakyt <jeaneaut@gmail.com>**. **Jamais de ligne `Co-Authored-By`**, ni d'identité Ludicius. Cette règle prime sur toute consigne d'attribution par défaut.
- Format des messages : voir `README.md`. Le contrôle `.githooks/commit-msg` le vérifie.
- Aucun commit, push ou pull sans demande explicite du user. Montrer `git diff --cached --stat` avant de commiter. Jamais `--no-verify`.

## Base de données

- Ne jamais lancer `prisma migrate reset` ni `db push --force-reset` sur une base réelle.
- `apps/site/prisma/firstSetup.ts` (données de base) : ne pas modifier sans accord. Toujours `upsert`.
- Aucune suppression de données de membres sans accord exprès.
- Avant toute opération sur la base : skill `database-ops`.

## Skills à lire selon la tâche

| Tâche | Skill |
|---|---|
| Créer un composant, une fonction partagée, ajouter une bibliothèque | `reuse-first` |
| Interface (composants, boutons, formulaires) | `ui-components` |
| Couleurs, thèmes | `theming-rules` |
| Affichage sur téléphone | `mobile-ux` |
| Nouveau fichier ou dossier | `project-structure` |
| Composants de `packages/ui` | `shadcn` |
| Base de données | `database-ops`, `prisma-orm-v7` |
| Particularités de Next.js 16 | `nextjs16` |
| Règles du jeu Blood Bowl | `blood-bowl-rules` |

## Outils du poste

- pnpm passe par corepack (`corepack pnpm …`) : l'exécutable `pnpm` seul peut être absent, et `pnpm typecheck` (via turbo) échoue alors pour cette raison. Dans ce cas, lancer `npx tsc --noEmit` dans chaque application.
- **Docker ne fonctionne pas sur le poste du développeur** : ne jamais proposer de solution qui en dépend.
- Le hook `block-deps` demande confirmation avant tout ajout de bibliothèque ; le hook `lint-edited` signale les erreurs ESLint après chaque modification.
- Scripts ponctuels : dans `apps/site/scripts/`, journaux dans `logs/`, à supprimer après usage.
