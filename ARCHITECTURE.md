# Architecture BBFrance

Référence courte pour humains et IA. Décisions détaillées : `docs/adr/`. Plan en cours : `docs/adr/0001-plan-refacto.md`.

## Aujourd'hui (P3 : monorepo)

Monorepo pnpm + Turborepo. Une seule app pour l'instant, `apps/site` (Next.js 16 App Router) ; les chemins ci-dessous sont relatifs à `apps/site`, sauf `kanban/`, `docs/`, `.claude/` (racine).

| Dossier | Contenu | Règle |
|---|---|---|
| `app/<route>/` | `page.tsx` + `page.css`, composants locaux dans `component/`, `actions.ts` (server actions) | Code BDD seulement dans `actions.ts` / `page.tsx` serveur |
| `common/components/` | UI partagée (utilisée par ≥ 2 routes) | Inventaire : skill `reuse-first` |
| `common/hooks`, `common/utils` | Hooks et utilitaires client | |
| `lib/` | Serveur : Prisma, auth guard, rôles, BBCode, mail, crypto | Pas d'import client |
| `prisma/` | Schéma, migrations, `firstSetup.ts` (intouchable), seeds | Toujours `upsert` |
| `tests/e2e/` | Smoke Playwright sur base jetable | |
| `kanban/`, `docs/` | Cartes, ADR, README de features, baseline | |
| `.claude/` | CLAUDE.md, skills, agents du conseil, commandes, hooks | |

## Cible (P3 → P6)

```
apps/site       site + forum + tournois (client OIDC du hub en P5)
apps/hub        identité SSO Better Auth + OIDC, API, widget (P5)
apps/bbscheme   éditeur BBScheme (P6)
packages/ui     shadcn/ui + tokens des 7 thèmes (P4)
packages/config tsconfig, eslint
packages/auth-client, packages/bbscheme-player
```

Frontières : une app n'importe jamais une autre app ; le partage passe par `packages/*`. Hub et services sur un domaine parent commun.

## Réutiliser avant créer

1. Chercher dans le skill `reuse-first`, puis `grep`.
2. Étendre l'existant plutôt que dupliquer (un 2e toast, une 5e recherche d'utilisateurs = refus).
3. Nouveau partagé ⇒ ligne ajoutée à `reuse-first` dans le même commit.

## Politique de dépendances

- Aucune dépendance sans accord explicite du user ; le hook `block-deps` demande confirmation.
- Une lib déjà présente qui fait le job gagne (dates : `date-fns`, drag & drop : `@dnd-kit`, carte : `leaflet`, icônes : `lucide-react`).
- Dépendance majeure (framework, auth, UI, BDD) ⇒ `/council` + ADR.
- Pré-approuvées par l'ADR-0001 : turbo + pnpm (P3), tailwindcss v4 + deps shadcn + sonner + ladle + ts-morph (P4), better-auth (P5).
- À retirer : `next-auth` (P5 + 30 j). Retirées : `next-themes` (morte), `react-hot-toast` (remplacée par sonner via `@bbfrance/ui`, P4).

## Données

Prod Turso avec de vrais membres. Aucune suppression sans accord exprès. Backup testé (`scripts/turso-backup.mjs`) avant toute opération qui écrit en prod. Migrations : voir carte 012 / ADR-0002.
