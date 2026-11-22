# France Blood Bowl (FranceBB)

France Blood Bowl, abrégé FranceBB, est le site de la communauté française de **Blood Bowl** (jeu de plateau de football fantastique). On y trouve un forum, les tournois (annonce, inscriptions, résultats), les profils des coachs (les joueurs), une messagerie privée, un classement, des articles et des outils de jeu. L'éditeur de schémas de jeu BBScheme et le quiz BBQuizz sont des applications à part du dépôt, en attente de relance.

**Ce fichier est la porte d'entrée du projet.** Commence par lui : il explique les règles, le plan du dépôt et où trouver le reste. Un mot technique inconnu ? Il est expliqué dans le [glossaire](docs/GLOSSAIRE.md).

---

## Les règles du projet

### Deux règles absolues

1. **La documentation doit être compréhensible par quelqu'un qui découvre le projet.** README, ARCHITECTURE, fiches de fonctionnalité, décisions (ADR) : français clair, phrases complètes. Un terme propre au projet ou à Blood Bowl est expliqué dans le [glossaire](docs/GLOSSAIRE.md). Le code est en anglais ; commits, commentaires et cartes restent concis.
2. **Le site doit être impeccable sur téléphone et sur ordinateur.** La plupart des coachs le consultent sur mobile. Chaque page doit être :
   - lisible sans zoomer ;
   - utilisable au pouce (boutons d'au moins 44 pixels) ;
   - fluide, sans défilement horizontal ;
   - intacte sur ordinateur.

   On écrit d'abord pour le téléphone. La preuve automatique (le parcours, voir plus bas) se lance sur demande, en fin de gros chantier et avant un envoi qui touche l'interface.

### Les autres règles, et où elles sont écrites

Chaque règle n'est écrite qu'à un seul endroit :

| Sujet | Où |
|---|---|
| Organisation du code, réutilisation, dépendances, données | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Gros chantiers : les cartes du kanban | [kanban/README.md](kanban/README.md) |
| Essais à faire à la main (vrai téléphone, vrais comptes) | [TESTS-MANUELS.md](TESTS-MANUELS.md) |
| Mise en ligne | [DEPLOY.md](DEPLOY.md) |
| Consignes propres à l'IA (Claude Code) | [.claude/CLAUDE.md](.claude/CLAUDE.md) |

**Commits** (enregistrements dans l'historique git) :
- moins de 50 caractères pour le titre, et le corps explique **pourquoi** : sans carte, le commit est le seul journal de la modification ;
- le titre commence par le numéro de la carte quand il y en a une, ex. `[043] Kanban rangé en dossiers` ;
- un contrôle automatique (`.githooks/commit-msg`) vérifie l'auteur. Pour l'activer, une fois par copie du projet : `git config core.hooksPath .githooks`.

---

## Plan du dépôt

| Dossier ou fichier | Ce qu'il contient |
|---|---|
| `apps/site/` | **Le site FranceBB** (forum, tournois, profils…), avec sa base de données et ses tests. [Lancer, tester, déployer](apps/site/README.md) |
| `apps/hub/` | **Le hub de connexion** : un compte unique (le « passeport Blood Bowl ») pour le site et les futures applications. Prêt pour la mise en ligne. [Lancer, tester, déployer](apps/hub/README.md) |
| `apps/bbscheme/` | **BBScheme**, l'application des schémas tactiques, avec sa propre base. En attente : elle ne fait que donner au site les schémas déjà publiés ; l'éditeur sera relancé plus tard. [README](apps/bbscheme/README.md) |
| `packages/ui/` | Composants d'interface et thèmes partagés entre les applications. [README](packages/ui/README.md) |
| `packages/bbscheme-player/` | Le lecteur des schémas BBScheme, partagé entre le site et l'application BBScheme. [README](packages/bbscheme-player/README.md) |
| `docs/features/` | **Une fiche par fonctionnalité** : à quoi elle sert, ce que voit le coach, où est le code |
| `docs/adr/` | Les décisions importantes et leurs raisons (voir « ADR » dans le glossaire) |
| `docs/GLOSSAIRE.md` | Les mots techniques expliqués |
| `kanban/` | Les cartes des gros chantiers, rangées par état (à faire, en cours) |
| `archive/` | Ce qui ne sert plus au travail courant : cartes terminées, épics, bilans de séance, audits, comptes rendus du conseil |
| `scripts/` | Petits outils du dépôt : lancement en local (`dev.mjs`, bases Postgres locales), vérifications (`check.mjs`), test local en mode production (`prod-local.mjs`), kanban |
| `.claude/` | Consignes et outils de l'IA qui aide au développement |
| `.github/` | Vérifications automatiques par GitHub (la « CI »), désactivées pour l'instant : les vérifications se lancent en local |
| `.githooks/` | Contrôle automatique des messages de commit |
| `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json` | Réglages communs : liste des applications, versions exactes des bibliothèques, commandes partagées |

Le dépôt est un **monorepo** : plusieurs applications dans un seul dépôt, qui partagent des composants via `packages/`.

**Chaque application et chaque paquet a son README**, avec la même structure : à quoi il sert, le lancer en local étape par étape, le tester, le déployer. Ce fichier-ci donne la vue d'ensemble ; la mise en ligne complète est dans [DEPLOY.md](DEPLOY.md).

---

## Lancer le site sur son ordinateur

Prérequis : [Node.js](https://nodejs.org) 22 ou plus.

```bash
git clone https://github.com/Breakfasttt/francebb.git bbfrance
cd bbfrance
corepack enable          # une seule fois : active pnpm, l'outil qui installe les bibliothèques
pnpm install             # installe les bibliothèques de toutes les applications
```

Si `pnpm` n'est pas reconnu (cas de certains postes Windows), préfixer chaque commande par `corepack` : `corepack pnpm install`, `corepack pnpm dev`…

1. Copier `apps/site/.env.example` en `apps/site/.env` et le remplir. Chaque variable y est expliquée, et le fichier dit lesquelles sont obligatoires. En local, `AUTH_SECRET` et `ENCRYPTION_KEY` suffisent pour démarrer ; laisser `AUTH_MODE` vide tant que le hub ne tourne pas.
2. Lancer le site, depuis la racine (ou depuis `apps/site`) : `pnpm dev`, puis ouvrir [http://localhost:3000](http://localhost:3000). Cette seule commande démarre une base Postgres locale (sans Docker), crée ses tables, la remplit au premier lancement, puis lance le site. Elle marche aussi après un redémarrage de l'ordinateur.

   Trois **profils de base** au choix, chacun dans sa propre base (on passe de l'un à l'autre sans rien perdre) :

   | Commande | Contenu de la base |
   |---|---|
   | `pnpm dev` ou `pnpm dev exemple` | Données de base et données fictives : membres de chaque rôle, forum, articles, ligues, tournois, messages privés |
   | `pnpm dev vide` | Données de base seulement (rôles, forums, réglages), sans membre ni contenu |
   | `pnpm dev prod` | Dernière sauvegarde de la production rangée dans `docs/backup-db/`, en entier (membres, forum, messages privés, tournois…) |

   `pnpm dev exemple --reset` efface la base du profil et la recrée. Le profil prod prend toujours la sauvegarde la plus récente de `docs/backup-db/` (fichiers `bbfrance-site-backup-AAAAMMJJ.json`) et se recrée tout seul quand une plus récente y est déposée. Ce dossier n'est jamais enregistré dans git : il contient des données personnelles. S'il n'y a qu'une ancienne sauvegarde de la bêta (`bbfrance-db-backup-AAAAMMJJ.db`), elle est d'abord convertie au nouveau format, et gardée. Outil des sauvegardes (conversion, export, restauration) : `apps/site/scripts/site-backup.ts`. Pour se connecter, la page de connexion propose en local un bouton de développement qui ouvre une session sous n'importe quel membre.

Pour modifier la structure de la base : changer `apps/site/prisma/schema.prisma`, puis `pnpm db:migrate` (crée une migration, c'est-à-dire le fichier qui décrit le changement). Elle sera appliquée automatiquement en production au prochain déploiement.

### Lancer le hub en local (facultatif)

Le hub n'est utile en local que pour essayer la connexion par le passeport Blood Bowl. Dans `apps/hub` :

1. Copier `.env.example` en `.env` et remplir `BETTER_AUTH_SECRET` (`openssl rand -base64 32`).
2. `pnpm db:start` (base Postgres locale du hub), `pnpm db:generate`, puis `pnpm exec prisma migrate deploy`.
3. `pnpm dev`, puis ouvrir [http://localhost:4000](http://localhost:4000). En développement, le lien de connexion par email s'affiche dans le terminal du hub, et des comptes de test avec mot de passe sont proposés.
4. Brancher le site dessus : enregistrer le site une fois (`node scripts/register-client.mjs "FranceBB site local" http://localhost:3000/api/auth/callback/hub`), puis dans `apps/site/.env` : `AUTH_MODE="hub"`, `HUB_ISSUER="http://localhost:4000/api/auth"` et les deux identifiants affichés.

Dans VS Code, la tâche « Hub + site » lance les deux serveurs.

### Tester en mode production

Avant une mise en ligne : `pnpm prod-local prepare`, `build`, puis `start` construit et démarre le hub et le site comme en ligne, sur des bases neuves. Le détail est à l'étape 2 de [DEPLOY.md](DEPLOY.md).

**Tester sur un vrai téléphone** (même réseau Wi-Fi) : lancer `pnpm dev -H 0.0.0.0` (le profil peut s'ajouter : `pnpm dev prod -H 0.0.0.0`), puis ouvrir `http://<adresse IP de l'ordinateur>:3000` sur le téléphone.


---

## Vérifier son travail

Les tests ont trois niveaux, du plus rapide au plus complet :

1. **Après chaque modification de code** : `pnpm check`, environ une minute, sans serveur ni navigateur.
2. **Sur demande, en fin de gros chantier ou avant un envoi qui touche l'interface** : `pnpm --filter @bbfrance/site test:parcours`, environ une minute et demie. Le serveur de développement du site doit être arrêté : Next.js refuse d'en démarrer un second dans le même dossier.
3. **La suite complète** `pnpm test:e2e` (environ 20 minutes) : seulement à la demande du responsable.

| Commande | Ce qu'elle vérifie |
|---|---|
| `pnpm check` | Niveau 1 : types TypeScript de chaque application et paquet, puis le cliquet ESLint. Ni serveur ni navigateur |
| `pnpm --filter @bbfrance/site test:parcours` | Niveau 2 : le parcours. Une seule session de navigateur visite les pages principales (en visiteur, en modérateur puis en administrateur), en taille téléphone puis ordinateur : page sans erreur, rien qui dépasse à droite, boutons d'au moins 44 pixels. Résumé dans `apps/site/logs/parcours.txt` |
| `pnpm typecheck` | Pas d'incohérence de types dans le code TypeScript |
| `pnpm lint:ratchet` | Qualité du code (ESLint) du site et des deux paquets (`packages/ui`, `packages/bbscheme-player`). Le nombre d'erreurs ne doit jamais augmenter, plafond par cible |
| `pnpm test:e2e` | Niveau 3, à la demande : la suite complète. Chaque cas est un test indépendant (lire le forum, répondre, se connecter…), joué dans un vrai navigateur, en taille ordinateur et téléphone, sur une base de test locale recréée vide à chaque fois |
| `pnpm --filter @bbfrance/site lighthouse` | Fluidité sur téléphone : note Lighthouse sur 100 des pages principales, mesurée sur la version de production du site (environ 5 minutes, résultats dans `apps/site/logs/lighthouse/`) |
| `pnpm --filter @bbfrance/site temps-reponse` | Temps de réponse du serveur (délai avant le premier octet) de 5 pages sur la version de production, médiane de 5 mesures ; avertit au-dessus de 1000 ms, sans échouer (environ 2 minutes, rapport `apps/site/logs/temps-reponse-AAAA-MM-JJ.txt`) |
| `pnpm --filter @bbfrance/hub test:sso` | Connexion au site via le hub, de bout en bout |
| `pnpm kanban` | Liste les cartes en cours et à faire |

Première fois pour les tests navigateur : `pnpm --filter @bbfrance/site exec playwright install chromium`.

Les vérifications automatiques de GitHub (`.github/workflows/ci.yml`) sont désactivées pour l'instant : un envoi de code ne lance rien, `pnpm check` se lance à la main.

---

## Technologies utilisées

| Rôle | Outil |
|---|---|
| Site web | [Next.js 16](https://nextjs.org) et [React 19](https://react.dev), en TypeScript |
| Base de données | [Postgres](https://www.postgresql.org), hébergé chez [Neon](https://neon.tech) en production ; en local, `prisma dev` (sans Docker) |
| Accès à la base de données | [Prisma 7](https://www.prisma.io) |
| Connexion des membres | [Better Auth](https://www.better-auth.com) dans le hub (le passeport) ; [Auth.js v5](https://authjs.dev) dans le site, qui se connecte au hub |
| Apparence | [Tailwind CSS](https://tailwindcss.com) et 5 thèmes de couleurs, composants [shadcn/ui](https://ui.shadcn.com) dans `packages/ui`, icônes [Lucide](https://lucide.dev) |
| Hébergement | [Vercel](https://vercel.com) |

---

## Licence

Projet sous licence [MIT](LICENSE). Les contributions sont bienvenues via des Pull Requests ; pour un changement important, ouvrir d'abord une issue.
