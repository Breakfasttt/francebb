# apps/site — le site BBFrance

Le site Next.js 16 : forum, tournois, profils, messagerie, classement, quiz, BBScheme… Les règles générales sont dans `.claude/CLAUDE.md`, `README.md` et `ARCHITECTURE.md` (à la racine du dépôt). Chaque fonctionnalité a sa fiche dans `docs/features/`.

## Commandes, à lancer depuis ce dossier

| Commande | Rôle |
|---|---|
| `pnpm dev` | Lance le site en local (port 3000) |
| `pnpm build` | Prépare la version de production |
| `pnpm exec prisma …` | Outils de base de données (migrations, génération du client) |
| `node scripts/lint-ratchet.mjs` | Contrôle qualité avec plafond d'erreurs (`--update` pour abaisser le plafond) |
| `node scripts/baseline.mjs` | Mesures de performance par page (voir `docs/baseline.md`) |

## Points à connaître

- **Base de données** : structure dans `prisma/schema.prisma`. Le client Prisma est généré dans `prisma/generated-client` (`pnpm exec prisma generate`). Base locale `dev.db`, base des tests `e2e.db` (recréée à chaque test).
- **Connexion des membres** : `auth.ts`, `auth.config.ts`, `proxy.ts` (code exécuté avant chaque page) et `lib/authGuard.ts` (`getActiveSession` refuse les visiteurs non connectés et les bannis).
- **Forum** : toute requête sur les catégories, forums, sujets ou messages passe par `lib/forumAccess.ts`, qui cache aux membres ce qui est réservé à certains rôles.
- **Emails des membres** : le client `prisma` par défaut ne les renvoie jamais ; `prismaWithEmail` est réservé à la connexion et aux mails.
- **Nouvelle bibliothèque** : déclarée dans le `package.json` de ce dossier, en version exacte, avec l'accord du responsable du projet.
