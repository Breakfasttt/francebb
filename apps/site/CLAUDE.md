# apps/site — le site BBFrance

Le site Next.js 16 : forum, tournois, profils, messagerie, classement, quiz, BBScheme… Les règles générales sont dans `.claude/CLAUDE.md`, `README.md` et `ARCHITECTURE.md` (à la racine du dépôt). Chaque fonctionnalité a sa fiche dans `docs/features/`.

## Commandes, à lancer depuis ce dossier

| Commande | Rôle |
|---|---|
| `pnpm db:start` | Démarre la base Postgres locale (à relancer après un redémarrage de l'ordinateur) |
| `pnpm db:migrate` | Crée une migration après une modification de `prisma/schema.prisma` |
| `pnpm db:setup` | Ajoute les données de base (rôles, catégories du forum…) |
| `pnpm dev` | Lance le site en local (port 3000) |
| `pnpm build` | Prépare la version de production |
| `pnpm exec prisma …` | Outils de base de données (migrations, génération du client) |
| `node scripts/lint-ratchet.mjs` | Contrôle qualité avec plafond d'erreurs (`--update` pour abaisser le plafond) |
| `node scripts/baseline.mjs` | Mesures de performance par page (voir `docs/baseline.md`) |

## Points à connaître

- **Base de données** : structure dans `prisma/schema.prisma`. Le client Prisma est généré dans `prisma/generated-client` (`pnpm exec prisma generate`). Bases Postgres locales sans Docker (`scripts/local-postgres.mjs`) : `pnpm db:start` pour la base de développement ; la base des tests est recréée vide à chaque `pnpm test:e2e`.
- **Connexion des membres** : `auth.ts`, `auth.config.ts`, `proxy.ts` (code exécuté avant chaque page) et `lib/authGuard.ts` (`getActiveSession` refuse les visiteurs non connectés et les bannis).
- **Forum** : toute requête sur les catégories, forums, sujets ou messages passe par `lib/forumAccess.ts`, qui cache aux membres ce qui est réservé à certains rôles.
- **Emails des membres** : le client `prisma` par défaut ne les renvoie jamais ; `prismaWithEmail` est réservé à la connexion et aux mails.
- **Nouvelle bibliothèque** : déclarée dans le `package.json` de ce dossier, en version exacte, avec l'accord du responsable du projet.
