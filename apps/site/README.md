# Le site France Blood Bowl (`apps/site`)

Le site de la communauté : forum, tournois, profils des coachs, messagerie, classement, ligues, articles, ressources et médias. C'est une application Next.js 16 avec sa base de données Postgres. En ligne, les coachs s'y connectent par le **hub** (le « passeport Blood Bowl », `apps/hub`).

Règles générales du projet : [README à la racine](../../README.md). Mots techniques : [glossaire](../../docs/GLOSSAIRE.md). Une fiche par fonctionnalité : [docs/features/](../../docs/features/).

---

## 1. Lancer le site sur son ordinateur

Prérequis : [Node.js](https://nodejs.org) 22 ou plus, et le dépôt installé (`corepack pnpm install` à la racine, voir le README racine).

1. **Réglages** : copier `.env.example` en `.env` (dans ce dossier). Pour démarrer, il suffit de remplir :
   - `AUTH_SECRET` : `openssl rand -base64 32` (dans Git Bash) ;
   - `ENCRYPTION_KEY` : `openssl rand -hex 32`.
   Laisser `AUTH_MODE` vide tant que le hub ne tourne pas : la connexion se fait alors directement sur le site.
2. **Démarrer** : `corepack pnpm dev` (ici ou à la racine). Cette seule commande démarre une base Postgres locale (sans Docker), crée ses tables, la remplit au premier lancement, puis lance le site.
3. Ouvrir [http://localhost:3000](http://localhost:3000).
4. **Se connecter** : en développement, la page de connexion et l'icône « comptes de test » de la barre du haut ouvrent une session sous n'importe quel membre d'exemple (administrateur, modérateur, coach…).

**Profils de base** (chacun dans sa propre base, on passe de l'un à l'autre sans rien perdre) :

| Commande | Contenu |
|---|---|
| `corepack pnpm dev` ou `corepack pnpm dev exemple` | Données de base et données fictives : membres de chaque rôle, forum, tournois, ligues, articles… |
| `corepack pnpm dev vide` | Données de base seulement, sans membre ni contenu |
| `corepack pnpm dev prod` | Dernière sauvegarde de la production rangée dans `docs/backup-db/` (hors git) |
| `corepack pnpm dev exemple --reset` | Efface la base du profil et la recrée |

**Avec le hub** (pour essayer la connexion par le passeport) : lancer le hub (voir [son README](../hub/README.md)), puis dans `.env` : `AUTH_MODE="hub"`, `HUB_ISSUER="http://localhost:4000/api/auth"`, `HUB_CLIENT_ID` et `HUB_CLIENT_SECRET` (donnés par l'enregistrement du site auprès du hub). En développement, la fenêtre « comptes de test » propose alors aussi « Se connecter avec un compte du hub ».

**Sur un vrai téléphone** (même Wi-Fi) : `corepack pnpm dev -H 0.0.0.0`, puis ouvrir `http://<adresse IP de l'ordinateur>:3000`.

---

## 2. Tester

Du plus rapide au plus complet :

| Étape | Commande | Ce qu'elle vérifie | Durée |
|---|---|---|---|
| 1. Après chaque modification | `corepack pnpm check` (à la racine) | Types TypeScript, ESLint (plafond d'erreurs), tests unitaires | ~1 min |
| 2. En fin de gros chantier | `corepack pnpm --filter @bbfrance/site test:parcours` | Toutes les pages principales, en visiteur puis par rôle, sur téléphone et ordinateur : sans erreur, rien qui dépasse, boutons de 44 pixels | ~2 min |
| 3. Sur demande | `corepack pnpm --filter @bbfrance/site test:e2e` | La suite complète, une base de test recréée vide | ~20 min |
| Mode production | `corepack pnpm prod-local prepare`, `build`, `start` (à la racine) | Le hub et le site construits et lancés comme en ligne (voir [DEPLOY.md, étape 2](../../DEPLOY.md)) | ~5 min |

- Avant les tests navigateur (une fois) : `corepack pnpm --filter @bbfrance/site exec playwright install chromium`.
- **Arrêter `pnpm dev` avant les étapes 2 et 3** : Next.js refuse deux serveurs dans le même dossier.
- Mesures facultatives : `lighthouse` (note de fluidité sur téléphone) et `temps-reponse` (délai de réponse du serveur), même préfixe `corepack pnpm --filter @bbfrance/site`.
- Essais à faire à la main (vrai téléphone, vrais comptes Discord ou Google) : [TESTS-MANUELS.md](../../TESTS-MANUELS.md).

**Changer la structure de la base** : modifier `prisma/schema.prisma`, puis `corepack pnpm db:migrate --name <description>`. La migration est appliquée automatiquement au déploiement. Procédure sûre : skill `database-ops`.

---

## 3. Déployer

Le site est hébergé sur **Vercel** (projet dont le *Root Directory* est `apps/site`), avec sa base **Neon**. Le guide complet, pour un débutant, est [DEPLOY.md](../../DEPLOY.md). Ce qui concerne le site :

1. **Le hub d'abord** : le site s'y connecte, il doit être en ligne et le site enregistré auprès de lui (DEPLOY, étapes 6 et 7).
2. **Base Neon `site`** (DEPLOY, étape 4).
3. **Projet Vercel du site** et ses variables : tableau complet à l'étape 8 de DEPLOY, expliqué aussi dans `.env.example`. À retenir :
   - `ENCRYPTION_KEY` chiffre les messages privés : **ne jamais la changer ni la perdre** ;
   - `AUTH_MODE=hub`, `HUB_ISSUER`, `HUB_CLIENT_ID`, `HUB_CLIENT_SECRET`, `HUB_EVENTS_SECRET` relient le site au hub.
4. **Déployer** : à chaque mise en ligne, Vercel lance `vercel-build`, qui applique les migrations puis construit le site. Aucune commande à taper sur la base.
5. **Données de base, une seule fois** (DEPLOY, étape 9) : `DATABASE_URL="<adresse Neon>" npx tsx prisma/firstSetup.ts` depuis ce dossier. Il crée rôles, catégories du forum, listes de référence et championnats ; il peut être relancé sans risque.
6. **Vérifier en ligne** (DEPLOY, étape 10), puis les essais à la main de TESTS-MANUELS.

---

## Où est quoi

| Dossier | Contenu |
|---|---|
| `app/` | Les pages (une par dossier : `forum/`, `tournois/`, `profile/`…) et leurs actions serveur |
| `common/components/` | Composants propres au site (barre du haut, éditeur BBCode…) ; les composants partagés sont dans `packages/ui` |
| `lib/` | Code serveur commun : accès à la base (`prisma.ts`), droits (`authGuard.ts`, `forumAccess.ts`), liens avec le hub (`hub/`) |
| `prisma/` | Structure de la base, migrations, données de base (`firstSetup.ts`), données d'exemple |
| `scripts/` | Outils : base de test, sauvegardes, mesures |
| `tests/` | Tests unitaires, e2e, parcours |

Consignes courtes pour l'IA : [CLAUDE.md](CLAUDE.md).
