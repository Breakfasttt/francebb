# apps/site — le site BBFrance

Next.js 16 (App Router) : forum, tournois, profils, messagerie, classement, bbquizz, bbscheme (P6 : extrait en `apps/bbscheme`).
Règles générales : `.claude/CLAUDE.md` (racine). Fiches features : `docs/features/`.

- Commandes depuis ce dossier : `pnpm dev`, `pnpm build`, `pnpm exec prisma ...`, `node scripts/lint-ratchet.mjs`, `node scripts/baseline.mjs`.
- Prisma : `prisma/schema.prisma`, client généré dans `prisma/generated-client` (`pnpm exec prisma generate`). Base locale `dev.db`, tests `e2e.db`.
- Auth : `auth.ts`, `auth.config.ts`, `proxy.ts`, `lib/authGuard.ts` (`getActiveSession`, `getSession`).
- Accès forum par rôle : `lib/forumAccess.ts` pour toute requête catégorie/forum/topic/post.
- `prisma` (client par défaut) n'expose jamais `User.email` ; `prismaWithEmail` réservé auth/mail.
- Nouvelle dépendance : déclarée dans **ce** `package.json`, version exacte, accord user (hook `block-deps`).
