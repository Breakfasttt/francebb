# Le hub de connexion (`apps/hub`) — le « passeport Blood Bowl »

Le hub gère les comptes des coachs. Un coach s'y connecte une fois (Discord, Google ou lien reçu par email) et il est reconnu par toutes les applications FranceBB : le site aujourd'hui, BBScheme et BBQuizz demain. Sur son **passeport**, il modifie son pseudo, son avatar, son numéro NAF et sa région, voit ses appareils connectés, télécharge ses données et peut supprimer son compte.

Techniquement : Next.js, la bibliothèque de connexion **Better Auth** et le standard **OIDC** (expliqué dans le [glossaire](../../docs/GLOSSAIRE.md)), avec sa propre base Postgres. Le hub **ne connaît aucune application en particulier** (ADR-0007) : il n'a que des « clients enregistrés ». Fiche détaillée : [docs/features/hub/](../../docs/features/hub/README.md).

---

## 1. Lancer le hub sur son ordinateur

Prérequis : Node.js 22 ou plus, et le dépôt installé (`corepack pnpm install` à la racine).

Depuis ce dossier (`apps/hub`) :

1. **Réglages** : copier `.env.example` en `.env`, puis remplir `BETTER_AUTH_SECRET` (`openssl rand -base64 32` dans Git Bash). Les lignes `HUB_DEV_PASSWORD_LOGIN=1` activent les comptes de test : à garder en local.
2. **Base locale** : `corepack pnpm db:start` (Postgres lancé par `prisma dev`, sans Docker ; son adresse est écrite dans `.env.local`).
3. **Client de base et tables** : `corepack pnpm db:generate`, puis `corepack pnpm exec prisma migrate deploy`.
4. **Démarrer** : `corepack pnpm dev`, puis ouvrir [http://localhost:4000](http://localhost:4000).
5. **Se connecter** : en développement, la page de connexion propose des comptes de test (« Créer un compte de test », puis un clic sur le compte). Un lien de connexion par email s'affiche dans le terminal tant qu'aucun service d'email n'est réglé.

**Brancher le site dessus** (une fois) :

1. Enregistrer le site comme application cliente :
   ```bash
   node scripts/register-client.mjs "FranceBB site local" http://localhost:3000/api/auth/callback/hub
   ```
   La commande affiche `HUB_CLIENT_ID` et `HUB_CLIENT_SECRET` (**le secret n'est affiché qu'une fois**). Relancée avec le même nom, elle ne recrée rien et complète seulement les droits qui manqueraient.
2. Facultatif, pour les événements (bannissement, suppression) et l'export : `node scripts/client-hooks.mjs "FranceBB site local" http://localhost:3000/api/hub/events http://localhost:3000/api/hub/export` donne `HUB_EVENTS_SECRET`.
3. Dans `apps/site/.env` : `AUTH_MODE="hub"`, `HUB_ISSUER="http://localhost:4000/api/auth"`, puis les identifiants ci-dessus.

Dans VS Code, la tâche « Hub + site » lance les deux serveurs.

**Discord et Google en local** : créer une application chez chacun avec les adresses de retour `http://localhost:4000/api/auth/callback/discord` et `…/google`, puis remplir `DISCORD_*` et `GOOGLE_*` dans `.env` (DEPLOY, étape 5).

---

## 2. Tester

| Commande | Ce qu'elle vérifie | Durée |
|---|---|---|
| `corepack pnpm check` (à la racine) | Types TypeScript de toutes les applications | ~1 min |
| `corepack pnpm --filter @bbfrance/hub test:api` | Le hub seul : profil, passeport (téléphone, 44 pixels), export, suppression de compte, événements signés, sécurité, applications tierces, documentation de l'API | ~1 min |
| `corepack pnpm --filter @bbfrance/hub test:sso` | Le site connecté au hub, de bout en bout : connexion et reconnexion, lien par email, déconnexion globale, pseudo synchronisé, export, bannissement immédiat, suppression | ~1 min |
| `corepack pnpm prod-local prepare`, `build`, `start` (à la racine) | Le hub et le site construits et lancés comme en ligne (DEPLOY, étape 2) | ~5 min |

- Les deux suites lancent leurs propres serveurs (hub sur 4100 ou 4200, site sur 3200) sur des bases de test jetables. **Arrêter `pnpm dev` du hub (et du site pour `test:sso`) avant**, et ne pas lancer les deux suites en même temps : elles partagent la base `hub-e2e`.
- Une nouvelle route dans `app/api` doit être décrite dans `lib/apiDoc/hubRoutes.ts` (visible sur `GET /api/doc`), sinon `test:api` échoue.
- Toute modification de `lib/auth.ts` ou `lib/authPlugins.mjs` passe par une carte du kanban et doit garder `test:sso` vert.
- Essais à la main (vrais comptes Discord et Google, vrai email, boutons du passeport) : [TESTS-MANUELS.md](../../TESTS-MANUELS.md), section 28.

---

## 3. Déployer

Le hub est hébergé sur **Vercel** (projet dont le *Root Directory* est `apps/hub`), sur l'adresse `https://auth.<domaine>`, avec sa propre base **Neon**. Guide complet : [DEPLOY.md](../../DEPLOY.md). Ce qui concerne le hub :

1. **Domaine** : le hub et le site doivent partager le même domaine parent (`auth.<domaine>` et `www.<domaine>`), sinon Safari bloque la reconnexion automatique (DEPLOY, étape 3).
2. **Base Neon `hub`**, séparée de celle du site (étape 4).
3. **Email, Discord, Google** avec des adresses de retour **sur le hub** (étape 5).
4. **Projet Vercel du hub** et ses variables (étape 6, expliquées aussi dans `.env.example`). À retenir :
   - `BETTER_AUTH_SECRET` : **ne jamais le changer** (il chiffre les jetons et les secrets d'événements des applications) ;
   - `CRON_SECRET` : sans lui, la purge de nuit (`vercel.json`, 3 h) refuse de tourner ;
   - **ne pas** mettre `HUB_DEV_PASSWORD_LOGIN` ni `NEXT_PUBLIC_HUB_DEV_PASSWORD_LOGIN` ;
   - `IMGBB_API_KEY` (facultative) active « Envoyer une image » pour l'avatar.
5. **Déployer** : `vercel-build` applique les migrations puis construit le hub.
6. **Enregistrer le site** auprès du hub en ligne avec `register-client.mjs`, puis `client-hooks.mjs` (étape 7) : ils donnent les identifiants à recopier dans le projet du site.

**Gérer en ligne** : bannir un compte de toutes les applications avec `HUB_DATABASE_URL="<adresse Neon>" corepack pnpm ban coach@exemple.fr "Raison"` (ou `--unban`).

---

## Où est quoi

| Dossier | Contenu |
|---|---|
| `app/` | Pages : passeport (`page.tsx`), connexion (`sign-in/`), consentement des applications tierces (`consent/`) ; routes `api/` (OIDC, `api/v1/…`, tâche de nuit) |
| `lib/` | Better Auth et ses réglages (`auth.ts`, `authPlugins.mjs`), profil, événements signés, suppression de compte, export, purge |
| `prisma/` | Structure de la base (générée depuis Better Auth : ne pas l'éditer à la main) et migrations |
| `scripts/` | Enregistrer une application, déclarer ses adresses, bannir, valider une application tierce |
| `tests/` | `sso.spec.ts` (site ↔ hub) et `api/` (hub seul) |

Consignes courtes pour l'IA : [CLAUDE.md](CLAUDE.md).
