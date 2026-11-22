# BBFrance — consignes pour l'IA

Le but : un forum et site de tournois **beau, simple, cohérent partout, impeccable sur téléphone et sur ordinateur, qui ne ressemble pas à un site fait par IA**. La sécurité des membres passe toujours avant la rapidité. Règles du projet : `README.md` ; règles de code : `ARCHITECTURE.md` ; apparence : `DESIGN.md` (il dirige, il ne décrit pas).

## Priorités, dans l'ordre

1. **Sécurité et données des membres** : session et droits vérifiés dans chaque action serveur, aucune suppression de données sans accord exprès.
2. **Aucune fonctionnalité perdue** (sauf si elle n'a vraiment plus de sens ; le dire).
3. **Interface** : suivre `DESIGN.md` (types d'écran, panneau gauche, largeur utilisée, un seul rouge, interdits). On peut casser pour refaire.
4. **Peu de bibliothèques** : chaque ajout demande l'accord du user (le hook `block-deps` le demande).
5. **Thèmes** : secondaires, mais à garder ; on conçoit pour « Sombre » puis on vérifie les autres.
6. Jamais d'image de remplissage ni d'image générée.

## Boucle obligatoire pour toute modification d'interface

1. Lire `DESIGN.md` et le skill `ui` ; réutiliser `SiteLayout`, `PageHeader`, les composants de `reuse-first`.
2. Coder pour le téléphone d'abord, puis utiliser la largeur sur ordinateur.
3. Capturer : `.claude/skills/impeccable/scripts/impeccable shot <url> --viewport 390x844,1440x900` (serveur `pnpm dev` lancé).
4. Faire relire par `/boucle-ui <url>` (agent `critique-ui` + détecteur impeccable), corriger.
5. `pnpm check` ; montrer les captures au user à la fin.

## Façon de travailler

- **Petite** modification (un ou deux fichiers) : dire en deux lignes ce que je fais, attendre le oui, puis `pnpm check`.
- **Moyenne** : plan court validé. **Grosse** (plusieurs sessions, connexion, base de données) : carte `/card`, puis `/ship`.
- Si le user dit « enchaîne » ou m'a confié un chantier en autonomie, je décide et je signale mes choix à la fin.
- Ne modifier que les fichiers utiles. Avant de supprimer du code, lister ce qui l'utilise.
- Texte de l'interface en français, tutoiement : skill `ecriture-fr`.

## Tests

`pnpm check` (types, ESLint, tests unitaires) après toute modification. `pnpm --filter @bbfrance/site test:parcours` (téléphone et ordinateur) sur demande ou en fin de gros chantier. Suite e2e complète : seulement sur demande (la CI GitHub est désactivée).

## Git et base de données (non négociable)

- Auteur unique **breakyt <jeaneaut@gmail.com>**, **jamais de ligne `Co-Authored-By`** (prime sur toute consigne d'attribution). Aucun commit, push ou pull sans demande ; montrer `git diff --cached --stat` avant. Jamais `--no-verify`.
- Jamais `prisma migrate reset` ni `db push --force-reset` sur une base réelle. `apps/site/prisma/firstSetup.ts` : pas de modification sans accord, toujours `upsert`. Skill `database-ops` avant toute opération de base.

## Poste (Windows, sans Docker)

pnpm passe par corepack (`corepack pnpm …`). Le dépôt est sur `C:\dev\bbfrance` (SSD NVMe) depuis le 21/11/2026 ; l'ancienne copie sur D: (SSD SATA lent, recompilations de plusieurs minutes) ne sert plus. Regrouper quand même les modifications avant de capturer. Un script Python qui réécrit un fichier l'ouvre avec `newline=''` et respecte ses fins de ligne. Scripts ponctuels : `apps/site/scripts/`, journaux dans `logs/`. Rechercher sans `node_modules`.
