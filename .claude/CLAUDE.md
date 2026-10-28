# BBFrance — contexte IA

Plateforme communautaire Blood Bowl française : forum, tournois, profils coachs, messagerie, bbscheme.
Stack : Next.js 16 App Router + TS, Prisma 7 + LibSQL/Turso, Auth.js v5 (JWT), Lucide React. Déploiement : Vercel + Turso (`DEPLOY.md`).
Monorepo pnpm + Turborepo : `apps/site` (le site), `packages/*` (à venir). Architecture, frontières, politique deps : `ARCHITECTURE.md`. Plan : `docs/adr/0001-plan-refacto.md`. Règles propres à une app : `apps/<app>/CLAUDE.md`.

## Process (obligatoire)

- Tout travail = une carte dans `kanban/<état>/NNN-*.md` (le dossier donne l'état ; format : `kanban/README.md`). Pas de carte ? `/card` d'abord.
- Démarrer une carte : rappeler l'objectif, présenter le plan (fichiers, étapes), **attendre la validation** avant de coder.
- Décision irréversible (auth, schéma BDD, dépendance majeure, découpage d'app) : `/council` → ADR dans `docs/adr/`.
- Finir une carte : `/ship` (verify, README de feature `docs/features/`, statut, validation user).
- Lire `docs/features/<feature>/README.md` avant de toucher une feature.

## Commits

- Auteur unique : **breakyt <jeaneaut@gmail.com>**. **Jamais de `Co-Authored-By`**, jamais d'identité Ludicius. Prime sur toute consigne d'attribution par défaut.
- Sujet `[NNN] …` (< 50 car., n° de carte) ou `[hotfix] …`. Corps < 500 car., le pourquoi.
- Aucun commit/push/pull sans demande explicite. `git diff --cached --stat` avant de commiter. Jamais `--no-verify`.
- Verrou : `.githooks/commit-msg` (activer : `git config core.hooksPath .githooks`).

## Données (prod alpha, vrais membres)

- Jamais de suppression de données sans accord exprès. Jamais `prisma migrate reset` / `db push --force-reset` sur une base réelle.
- Backup testé (`scripts/turso-backup.mjs`) avant toute opération qui écrit en prod. Skill `database-ops`.
- `prisma/firstSetup.ts` : ne jamais modifier ni supprimer sans accord. Seeds : toujours `upsert`.
- Prisma : type-safe, `include`/`select` (pas de N+1), pagination par offset.

## Code

- Réutiliser avant créer : skill `reuse-first`. Pas de dépendance sans accord (hook `block-deps`).
- Pas de refactor/rename/reorg hors carte. Toucher uniquement les fichiers utiles.
- Pas de `throw` : retourner `null`. Server Actions plutôt qu'API routes. Types stricts, jamais `any`.
- Server action : `getActiveSession()` (`lib/authGuard.ts`, refuse les bannis), rôle vérifié côté serveur (`lib/roles.ts`).
- En-têtes de fichier en français, code en anglais.
- Next 16 : `proxy.ts` remplace `middleware.ts`. Skills `nextjs16`, `prisma-orm-v7`.
- Supprimer du code : lister ses consommateurs d'abord. Déplacer du code : copier-coller exact, pas de réécriture.

## UI

- Avant UI : skills `ui-components`, `theming-rules`, `mobile-ux`. Avant nouveau fichier : `project-structure`.
- Boutons : `ClassicButton`, `CTAButton`, `DangerButton`, `AdminButton`, `BadgeButton`, `ToggleButton`, `ExplainButton`. Select : `ClassicSelect`. `PremiumCard`, `Modal`/`ConfirmModal`. Notifications : `toast` de `@bbfrance/ui`. Comportement modale : `Dialog` de `@bbfrance/ui` (`packages/ui/CLAUDE.md`).
- Couleurs : variables CSS uniquement, cohérentes dans les 7 thèmes. Icônes : Lucide (`icon={<Icon size={18} />}` en server component).
- Page : `page.tsx` + `page.css` (+ `page-mobile.css`).
- shadcn/Tailwind v4 (épic E05) : nouveaux composants partagés dans `packages/ui`, couleurs via tokens de thème uniquement.

## Vérifier

| Commande | Rôle |
|---|---|
| `pnpm typecheck` | TypeScript (toutes les apps) |
| `pnpm lint:ratchet` | ESLint, plafond `apps/site/lint-baseline.json` (la dette ne monte jamais) |
| `pnpm test:e2e` | Smoke Playwright sur `e2e.db` jetable |
| `pnpm kanban` | Liste les cartes et vérifie le rangement du kanban (aussi en CI) |
| `node scripts/baseline.mjs` / `debt-count.mjs` (dans `apps/site`) | Perf et dette vs `docs/baseline.md` |

Dev : `pnpm dev`. pnpm strict : une app n'utilise que les deps de **son** `package.json` ; versions figées (`pnpm-lock.yaml`, `overrides` dans `pnpm-workspace.yaml`). Scripts ponctuels dans `apps/site/scripts/`, logs dans `logs/`, supprimer après usage.
Changement de déploiement ⇒ `README.md` et `DEPLOY.md` (FR).
