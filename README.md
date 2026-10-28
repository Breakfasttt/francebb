# BBFrance — la communauté Blood Bowl française

BBFrance est le site de la communauté française de **Blood Bowl** (jeu de plateau de football fantastique). On y trouve un forum, les tournois (annonce, inscriptions, résultats), les profils des coachs (les joueurs), une messagerie privée, un classement, des articles et des outils de jeu comme BBScheme (éditeur de schémas de jeu).

**Ce fichier est la porte d'entrée du projet.** Commence par lui : il explique les règles, le plan du dépôt et où trouver le reste. Un mot technique inconnu ? Il est expliqué dans le [glossaire](docs/GLOSSAIRE.md).

---

## Les règles du projet

### Deux règles absolues

1. **Tout doit être compréhensible par quelqu'un qui découvre le projet.** Code, documentation, cartes du kanban, messages de commit : on écrit en français clair (le code lui-même est en anglais). Chaque terme technique ou acronyme est expliqué, soit sur place, soit dans le [glossaire](docs/GLOSSAIRE.md).
2. **Le site doit être impeccable sur téléphone.** La plupart des coachs le consultent sur mobile. Chaque page doit y être :
   - lisible sans zoomer ;
   - utilisable au pouce (boutons d'au moins 44 pixels) ;
   - fluide, sans défilement horizontal.

   Une modification n'est terminée que si elle a été vérifiée en taille téléphone.

### Les autres règles, et où elles sont écrites

Chaque règle n'est écrite qu'à un seul endroit :

| Sujet | Où |
|---|---|
| Organisation du code, réutilisation, dépendances, données | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Tâches : comment créer, suivre et terminer une carte | [kanban/README.md](kanban/README.md) |
| Mise en ligne | [DEPLOY.md](DEPLOY.md) |
| Consignes propres à l'IA (Claude Code) | [.claude/CLAUDE.md](.claude/CLAUDE.md) |

**Commits** (enregistrements dans l'historique git) :
- le titre commence par le numéro de la carte concernée, ex. `[043] Kanban rangé en dossiers`, ou `[hotfix]` pour une correction urgente ;
- moins de 50 caractères pour le titre, et le corps explique **pourquoi** ;
- un contrôle automatique (`.githooks/commit-msg`) le vérifie. Pour l'activer, une fois par copie du projet : `git config core.hooksPath .githooks`.

---

## Plan du dépôt

| Dossier ou fichier | Ce qu'il contient |
|---|---|
| `apps/site/` | **Le site BBFrance** (forum, tournois, profils…), avec sa base de données et ses tests |
| `apps/hub/` | **Le hub de connexion** : un compte unique pour le site et les futures applications. Prêt, mais pas encore en ligne |
| `packages/ui/` | Composants d'interface partagés entre les applications (fenêtres, notifications…) |
| `docs/features/` | **Une fiche par fonctionnalité** : à quoi elle sert, ce que voit le coach, où est le code |
| `docs/adr/` | Les décisions importantes et leurs raisons (voir « ADR » dans le glossaire) |
| `docs/GLOSSAIRE.md` | Les mots techniques expliqués |
| `docs/bilans/` | Comptes rendus des séances de travail |
| `kanban/` | Les tâches, rangées par état (à faire, en cours, terminé…) |
| `scripts/` | Petits outils du dépôt (vérification du kanban, envoi vers `master`) |
| `.claude/` | Consignes et outils de l'IA qui aide au développement |
| `.github/` | Vérifications automatiques lancées par GitHub à chaque envoi de code (la « CI ») |
| `.githooks/` | Contrôle automatique des messages de commit |
| `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json` | Réglages communs : liste des applications, versions exactes des bibliothèques, commandes partagées |

Le dépôt est un **monorepo** : plusieurs applications dans un seul dépôt, qui partagent des composants via `packages/`.

---

## Lancer le site sur son ordinateur

Prérequis : [Node.js](https://nodejs.org) 22 ou plus.

```bash
git clone https://github.com/Breakfasttt/francebb.git
cd francebb
corepack enable          # une seule fois : active pnpm, l'outil qui installe les bibliothèques
pnpm install             # installe les bibliothèques de toutes les applications
```

1. Copier `apps/site/.env.example` en `apps/site/.env` et le remplir. Chaque variable y est expliquée. La connexion Discord/Google et l'envoi de mails en local sont détaillés dans [DEPLOY.md](DEPLOY.md).
2. Préparer la base de données locale, depuis `apps/site` :
   ```bash
   cd apps/site
   pnpm db:start                    # démarre une base Postgres locale (sans Docker) et note son adresse dans .env.local
   pnpm exec prisma migrate deploy  # crée les tables
   pnpm db:setup                    # ajoute les données de base (rôles, catégories du forum…)
   ```
   Après un redémarrage de l'ordinateur, relancer seulement `pnpm db:start`.
3. Lancer le site, depuis la racine : `pnpm dev`, puis ouvrir [http://localhost:3000](http://localhost:3000).

Pour modifier la structure de la base : changer `apps/site/prisma/schema.prisma`, puis `pnpm db:migrate` (crée une migration, c'est-à-dire le fichier qui décrit le changement). Elle sera appliquée automatiquement en production au prochain déploiement.

**Tester sur un vrai téléphone** (même réseau Wi-Fi) : lancer `pnpm --filter @bbfrance/site exec next dev -H 0.0.0.0`, puis ouvrir `http://<adresse IP de l'ordinateur>:3000` sur le téléphone.


---

## Vérifier son travail

| Commande | Ce qu'elle vérifie |
|---|---|
| `pnpm typecheck` | Pas d'incohérence de types dans le code TypeScript |
| `pnpm lint:ratchet` | Qualité du code (ESLint). Le nombre d'erreurs ne doit jamais augmenter |
| `pnpm test:e2e` | Parcours essentiels du site (lire le forum, répondre, se connecter…), joués dans un vrai navigateur sur une base de test locale recréée vide à chaque fois |
| `pnpm --filter @bbfrance/hub test:sso` | Connexion au site via le hub, de bout en bout |
| `pnpm kanban` | Liste les tâches et vérifie que le kanban est bien rangé |

Première fois pour les tests navigateur : `pnpm --filter @bbfrance/site exec playwright install chromium`.

GitHub relance automatiquement ces vérifications à chaque envoi de code (`.github/workflows/ci.yml`).

---

## Technologies utilisées

| Rôle | Outil |
|---|---|
| Site web | [Next.js 16](https://nextjs.org) et [React 19](https://react.dev), en TypeScript |
| Base de données | [Postgres](https://www.postgresql.org), hébergé chez [Neon](https://neon.tech) en production ; en local, `prisma dev` (sans Docker) |
| Accès à la base de données | [Prisma 7](https://www.prisma.io) |
| Connexion des membres | [Auth.js v5](https://authjs.dev) aujourd'hui ; [Better Auth](https://www.better-auth.com) dans le hub |
| Apparence | CSS avec 7 thèmes, composants [shadcn/ui](https://ui.shadcn.com) dans `packages/ui`, icônes [Lucide](https://lucide.dev) |
| Hébergement | [Vercel](https://vercel.com) |

---

## Licence

Projet sous licence [MIT](LICENSE). Les contributions sont bienvenues via des Pull Requests ; pour un changement important, ouvrir d'abord une issue.
