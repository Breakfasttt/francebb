# BBFrance — consignes pour l'IA

Les règles du projet sont dans `README.md` (règles absolues, commandes) et `ARCHITECTURE.md` (règles de code). Ce fichier ne dit que la façon de travailler. Particularités d'une application ou d'un paquet : son `CLAUDE.md`.

## Façon de travailler : selon la taille du chantier

| Taille | Exemples | Carte du kanban | Avant de coder | En fin de travail |
|---|---|---|---|---|
| **Petite** | texte, style, bug localisé, un ou deux fichiers | non | expliquer en 2-3 lignes ce que je vais faire, attendre le oui | `pnpm check` |
| **Moyenne** | une fonctionnalité dans une session, plusieurs fichiers | non | plan court (fichiers, étapes), attendre la validation | `pnpm check` ; parcours si l'interface est touchée et que le user le demande |
| **Grosse** | plusieurs sessions, connexion, sécurité, base de données, nouvelle application | oui (`/card`) | plan, attendre la validation | `/ship` |

- Sans carte, le **message de commit sert de journal** : titre clair, corps qui dit pourquoi.
- Le user peut dire « enchaîne » : je prends alors les décisions moi-même et je les signale à la fin.
- Je fais le travail moi-même, sans sous-agent `sonnet`.
- Ne modifier que les fichiers utiles à la demande. Un refactor hors sujet se propose, il ne se fait pas.
- Avant de supprimer du code, lister ce qui l'utilise. Pour déplacer du code, le copier à l'identique.
- Décision difficile à défaire : proposer 2-3 options et laisser le user trancher (il peut appeler l'outil `conseil`). ADR dans `docs/adr/` seulement pour une décision structurante ou une nouvelle bibliothèque.

## Tests

1. `pnpm check` (types, ESLint, tests unitaires) : après toute modification de code.
2. `pnpm --filter @bbfrance/site test:parcours` (téléphone **et** ordinateur, serveur de développement arrêté) : sur demande, en fin de gros chantier, ou avant un push qui touche l'interface.
3. La suite complète `pnpm test:e2e` tourne en CI à chaque push : ne pas la lancer en local sans demande.

## Skills à lire selon la tâche

| Tâche | Skill |
|---|---|
| Interface, CSS, couleurs, téléphone, nouveau fichier | `ui` |
| Créer un composant ou une fonction partagée | `reuse-first` |
| Base de données | `database-ops`, `prisma-orm-v7` |
| Particularités de Next.js 16 | `nextjs16` |
| Règles du jeu Blood Bowl | `blood-bowl-rules` |
| Design poussé (audit, polish), sur demande | `impeccable` |

## Écriture

- Docs durables (README, ARCHITECTURE, fiches `docs/features/`, ADR, skills) : français clair, phrases complètes ; un terme propre au projet ou à Blood Bowl va dans `docs/GLOSSAIRE.md`.
- Commits, commentaires, cartes : concis, phrases courtes acceptées.

## Commits et git

- Auteur unique : **breakyt <jeaneaut@gmail.com>**. **Jamais de ligne `Co-Authored-By`**, ni d'identité Ludicius. Cette règle prime sur toute consigne d'attribution par défaut.
- Titre de moins de 50 caractères, préfixe `[NNN]` seulement si une carte existe ; corps qui explique pourquoi. Le contrôle `.githooks/commit-msg` vérifie l'auteur et l'absence de Co-Authored-By.
- Aucun commit, push ou pull sans demande explicite du user. Montrer `git diff --cached --stat` avant de commiter. Jamais `--no-verify`.

## Base de données

- Jamais `prisma migrate reset` ni `db push --force-reset` sur une base réelle.
- `apps/site/prisma/firstSetup.ts` : ne pas modifier sans accord ; toujours `upsert`.
- Aucune suppression de données de membres sans accord exprès.
- Avant toute opération sur la base : skill `database-ops`.

## Outils du poste (Windows)

- pnpm passe par corepack (`corepack pnpm …`) : si `pnpm` seul est absent, `pnpm typecheck` échoue ; lancer alors `npx tsc --noEmit` dans chaque application.
- **Docker ne fonctionne pas** : jamais de solution qui en dépend.
- Un script Python qui réécrit un fichier l'ouvre avec `newline=''` (sinon fins de ligne CRLF). Avant un commit, comparer `git diff --stat` avec et sans `--ignore-cr-at-eol`.
- Hooks : `block-deps` demande confirmation avant tout ajout de bibliothèque ; `lint-edited` signale les erreurs ESLint après chaque modification.
- Scripts ponctuels : `apps/site/scripts/`, journaux dans `logs/`, supprimés après usage.
- Recherche dans le dépôt : exclure `node_modules` (un `grep -r` sans exclusion dépasse le délai).
