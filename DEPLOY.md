# Mettre FranceBB en ligne

Ce guide explique pas à pas comment publier **le hub de connexion** et **le site** de France Blood Bowl, même sans expérience de l'hébergement web. Il part de zéro : aucune base ni aucun projet en ligne. Les mots techniques sont expliqués dans le [glossaire](docs/GLOSSAIRE.md).

**Ce qu'on met en ligne :**

| Application | Dossier | Adresse | Rôle |
|---|---|---|---|
| Le hub (le « passeport Blood Bowl ») | `apps/hub` | `https://auth.<domaine>` | Gère les comptes : connexion Discord, Google ou lien par email |
| Le site | `apps/site` | `https://www.<domaine>` | Forum, tournois, profils, messagerie… Il envoie les coachs se connecter au hub |

**Les services utilisés** (offres gratuites suffisantes pour commencer) :
- **Vercel** héberge les deux applications et les remet à jour automatiquement à chaque envoi de code sur GitHub.
- **Neon** héberge les deux bases de données Postgres, une par application.
- **Un service d'envoi de mails** (SMTP) : Resend, Brevo…
- **Un nom de domaine** (OVH, Gandi…).

À chaque mise en ligne, la structure de chaque base est mise à jour automatiquement : le script `vercel-build` de chaque application lance `prisma migrate deploy` avant de construire. Aucune commande à taper pour ça.

BBScheme et BBQuizz ne sont pas mis en ligne pour l'instant (voir l'annexe B) : le site fonctionne sans eux.

**Ordre des étapes** : 1. outils → 2. test local → 3. domaine → 4. bases Neon → 5. mails, Discord, Google → 6. hub sur Vercel → 7. site enregistré auprès du hub → 8. site sur Vercel → 9. données de base → 10. vérifications.

---

## Étape 1 : les outils et les comptes

Sur l'ordinateur :
1. [Node.js](https://nodejs.org), version 22 ou plus (version « LTS ») : le moteur qui fait tourner les applications.
2. [Git](https://git-scm.com) : l'outil qui envoie le code sur GitHub.
3. Le projet installé et lancé une fois en local : voir « Lancer le site sur son ordinateur » dans le [README](README.md).

Les comptes à créer : [GitHub](https://github.com) (le code y est déjà : `github.com/Breakfasttt/francebb`), [Vercel](https://vercel.com) et [Neon](https://neon.tech) (connexion possible avec GitHub), un service SMTP, un fournisseur de domaine.

**Les secrets** : plusieurs étapes génèrent des secrets (mots de passe techniques). Les ranger au fur et à mesure dans un gestionnaire de mots de passe. Pour en générer un, dans Git Bash : `openssl rand -base64 32` (ou `openssl rand -hex 32` quand c'est demandé).

---

## Étape 2 : le test local en mode production

Avant de payer quoi que ce soit, on vérifie sur l'ordinateur que les deux applications se construisent et démarrent **comme en ligne** (`next build` puis `next start`), sur des bases neuves remplies par les mêmes scripts qu'en ligne. La connexion elle-même n'est pas testée ici : en mode production, les comptes de test et les liens affichés dans le terminal sont désactivés.

1. Arrêter les serveurs de développement en cours (`pnpm dev` du site et du hub).
2. À la racine du dépôt :
   ```bash
   corepack pnpm prod-local prepare   # deux bases locales neuves, migrations, données de base et fictives, site enregistré auprès du hub
   corepack pnpm prod-local build     # construit le hub puis le site en mode production (quelques minutes)
   corepack pnpm prod-local start     # hub sur http://localhost:4000, site sur http://localhost:3000
   ```
   `prepare` remplit la base du site avec les données fictives de `pnpm dev exemple` (tournois, forum, ligues…) ; `prepare vide` ne met que les données de base, exactement comme une première mise en ligne. Il écrit aussi deux fichiers `.env.production.local` (dans `apps/site` et `apps/hub`, jamais enregistrés dans git), avec des adresses en `localhost`, le mode hub et des secrets propres au test. Les bases de développement ne sont pas touchées.
3. Vérifier :
   - [ ] le site s'ouvre sur [http://localhost:3000](http://localhost:3000) : accueil, forum, tournois, classement, mentions légales ;
   - [ ] [http://localhost:4000/api/auth/.well-known/openid-configuration](http://localhost:4000/api/auth/.well-known/openid-configuration) affiche un texte JSON (le hub répond) ;
   - [ ] sur le site, « Se connecter » puis un des boutons mène à la page de connexion du hub (on s'arrête là) ;
   - [ ] aucune erreur rouge dans le terminal.
4. Ctrl+C arrête les deux applications. Pour tout ranger : `corepack pnpm prod-local clean` (supprime les deux `.env.production.local` et arrête les bases de test).

Si une étape échoue, la corriger avant d'aller plus loin : elle échouerait aussi sur Vercel.

---

## Étape 3 : le nom de domaine

Le hub et le site doivent partager le même domaine parent, par exemple `auth.<domaine>` et `www.<domaine>`. Sans cela, Safari (iPhone, Mac) bloque la reconnexion automatique entre les deux. On choisit donc le domaine **avant** de régler les applications : toutes les adresses de retour en dépendent.

1. Acheter le domaine chez un fournisseur (OVH, Gandi…).
2. Le brancher sur Vercel se fait aux étapes 6 et 8, une fois les projets créés.

Dans la suite, remplacer `<domaine>` par le vrai nom (par exemple `francebb.fr`).

---

## Étape 4 : les deux bases de données sur Neon

1. Sur [neon.tech](https://neon.tech), **Create project** : nom `francebb`, région **Europe (Frankfurt)**, la plus proche des coachs.
2. Le projet contient une base par défaut : la renommer ou en créer une nommée `site`. Puis en créer une seconde, `hub` (menu **Databases** > **New database**). **Une base par application, jamais partagée.**
3. Pour chacune, bouton **Connect** : choisir la base, puis copier la **chaîne de connexion** (*connection string*) qui commence par `postgresql://`. Prendre la version **sans** « pooled » (connexion directe), qui convient aussi aux migrations.
4. Garder ces deux adresses secrètes : ce sont les clés des bases.

**Sauvegardes** : Neon garde un historique et permet de revenir à un instant passé (menu **Branches** > **Restore**). Avant toute opération risquée, créer une branche de sauvegarde (**Branches** > **Create branch**).

---

## Étape 5 : mails, Discord et Google

En mode hub, c'est le hub qui connecte les coachs : Discord, Google et les liens par email sont réglés **sur le hub**, pas sur le site.

**Service d'envoi de mails (SMTP)**, utilisé par le hub (liens de connexion) et par le site (notifications, gazette, annonces). Par exemple **Resend** ([resend.com](https://resend.com)) :
1. Ajouter le domaine dans Resend et recopier chez le fournisseur du domaine les enregistrements DNS demandés (ils prouvent que les mails viennent bien de vous).
2. Créer une clé d'API. Réglages : `SMTP_HOST="smtp.resend.com"`, `SMTP_PORT="465"`, `SMTP_USER="resend"`, `SMTP_PASSWORD=` la clé d'API.
3. Expéditeur : `EMAIL_FROM='"FranceBB" <noreply@<domaine>>'`.

**Discord**
1. [Portail développeur Discord](https://discord.com/developers/applications) > **New Application** (nom : `FranceBB`).
2. **OAuth2** > **Redirects** > **Add Redirect** : `https://auth.<domaine>/api/auth/callback/discord`
3. Noter le **Client ID** et le **Client Secret**.

**Google**
1. [Console Google Cloud](https://console.cloud.google.com/) : créer un projet, puis **APIs & Services** > **OAuth consent screen** (nom `FranceBB`, type « External »).
2. **Credentials** > **Create Credentials** > **OAuth client ID** > **Web application**.
3. **Authorized redirect URIs** : `https://auth.<domaine>/api/auth/callback/google`
4. Noter le **Client ID** et le **Client Secret**.

Pour essayer Discord et Google en local, créer une seconde application chez chacun avec les adresses `http://localhost:4000/api/auth/callback/discord` et `…/google`, et mettre ses identifiants dans `apps/hub/.env`.

---

## Étape 6 : le hub sur Vercel

1. Sur [vercel.com](https://vercel.com) : **Add New** > **Project**, puis **Import** sur le dépôt GitHub.
2. **Project Name** : `francebb-hub`. **Root Directory** : **`apps/hub`**. Vercel détecte Next.js et pnpm tout seul.
3. **Environment Variables** : ajouter les variables ci-dessous (elles sont aussi expliquées dans `apps/hub/.env.example`).

| Variable | Valeur |
|---|---|
| `BETTER_AUTH_URL` | `https://auth.<domaine>` (sans `/` final) |
| `BETTER_AUTH_SECRET` | Un nouveau secret : `openssl rand -base64 32`. **Ne jamais le changer ensuite** : il chiffre les jetons Discord et Google et le secret d'événements du site |
| `HUB_DATABASE_URL` | L'adresse Neon de la base `hub` |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Application Discord de l'étape 5 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Application Google de l'étape 5 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | Service d'envoi de mails de l'étape 5 |
| `CRON_SECRET` | Un nouveau secret : `openssl rand -base64 32`. Vercel appelle chaque nuit à 3 h l'adresse `/api/cron/daily` (déclarée dans `apps/hub/vercel.json`) avec ce secret : elle efface les sessions et liens expirés, le journal d'audit de plus d'un an, et renvoie au site les événements qu'il n'a pas reçus |

   **Ne pas ajouter** `HUB_DEV_PASSWORD_LOGIN` ni `NEXT_PUBLIC_HUB_DEV_PASSWORD_LOGIN` : elles servent seulement en local. `HUB_THIRD_PARTY_APPS` reste vide tant qu'aucune application tierce n'est acceptée.
4. **Deploy**. Pendant la construction, `vercel-build` crée les tables dans la base `hub`.
5. **Domaine** : dans le projet, **Settings** > **Domains** > **Add** : `auth.<domaine>`. Recopier chez le fournisseur du domaine l'enregistrement DNS indiqué par Vercel, puis attendre la validation (de quelques minutes à quelques heures).
6. Vérifier : `https://auth.<domaine>/api/auth/.well-known/openid-configuration` affiche un texte JSON.

---

## Étape 7 : enregistrer le site auprès du hub

Le hub ne connaît que les applications enregistrées dans sa base. Depuis l'ordinateur, dans le dossier `apps/hub`, on enregistre le site. Les commandes écrivent directement dans la base Neon du hub : bien recopier l'adresse.

1. Une fois : `corepack pnpm db:generate` (prépare l'accès à la base).
2. Enregistrer le site (Git Bash) :
   ```bash
   HUB_DATABASE_URL="postgresql://…(base hub)…" node scripts/register-client.mjs "FranceBB site" https://www.<domaine>/api/auth/callback/hub
   ```
   Sous PowerShell : `$env:HUB_DATABASE_URL="postgresql://…"; node scripts/register-client.mjs "FranceBB site" https://www.<domaine>/api/auth/callback/hub`

   La commande affiche `HUB_CLIENT_ID` et `HUB_CLIENT_SECRET`. **Le secret n'est affiché qu'une seule fois** : le copier tout de suite. Relancée avec le même nom, elle ne recrée rien et ne change pas le secret : elle complète seulement les droits et adresses qui manqueraient. Le hub renverra le coach vers `https://www.<domaine>/` après une déconnexion.
3. Déclarer où le hub prévient le site (bannissement, profil modifié, suppression de compte) et où il lui demande les données d'un coach (export RGPD). Il faut le **même** `BETTER_AUTH_SECRET` que sur Vercel (étape 6) :
   ```bash
   HUB_DATABASE_URL="postgresql://…(base hub)…" BETTER_AUTH_SECRET="…(celui du hub sur Vercel)…" node scripts/client-hooks.mjs "FranceBB site" https://www.<domaine>/api/hub/events https://www.<domaine>/api/hub/export
   ```
   La commande affiche `HUB_EVENTS_SECRET`, **une seule fois**. La relancer crée un nouveau secret, à recopier alors dans le site.

---

## Étape 8 : le site sur Vercel

1. **Add New** > **Project**, **Import** sur le même dépôt.
2. **Project Name** : `francebb-site`. **Root Directory** : **`apps/site`**.
3. **Environment Variables** (aussi expliquées dans `apps/site/.env.example`) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | L'adresse Neon de la base `site` |
| `AUTH_SECRET` | Un nouveau secret : `openssl rand -base64 32` (pas le même que le hub) |
| `AUTH_URL` et `NEXT_PUBLIC_SITE_URL` | `https://www.<domaine>` (sans `/` final), la même valeur pour les deux |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` (64 caractères). Elle chiffre les messages privés : **ne jamais la changer ni la perdre**, sinon ils deviennent illisibles |
| `AUTH_MODE` | `hub` |
| `HUB_ISSUER` | `https://auth.<domaine>/api/auth` |
| `HUB_CLIENT_ID`, `HUB_CLIENT_SECRET` | Donnés par `register-client.mjs` (étape 7) |
| `HUB_EVENTS_SECRET` | Donné par `client-hooks.mjs` (étape 7) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | Service d'envoi de mails de l'étape 5 |
| `CONTACT_EMAIL` | Adresse de contact des mentions légales (demandes RGPD, signalements) |
| `SUPERADMIN_EMAILS` | Emails des super-administrateurs, séparés par des virgules (promus à leur première connexion) |
| `IMGBB_API_KEY` | Facultative. Clé gratuite sur [imgbb.com](https://imgbb.com) pour l'envoi d'images (avatars, blasons, images des messages). Secrète : jamais de préfixe `NEXT_PUBLIC_`. Sans elle, l'envoi d'images est désactivé |
| `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | Facultatives. Application « Website Integration » sur [dev.twitch.tv/console](https://dev.twitch.tv/console), pour l'onglet Twitch de la page Médias |

   Les variables Discord et Google du site restent vides en mode hub (elles ne servent qu'à une connexion directe, sans hub). `BBSCHEME_URL` reste vide tant que BBScheme n'est pas en ligne.
4. **Deploy**. `vercel-build` crée les tables dans la base `site`.
5. **Domaine** : **Settings** > **Domains** > **Add** : `www.<domaine>` (Vercel propose aussi de rediriger `<domaine>` tout court vers `www`). Recopier l'enregistrement DNS chez le fournisseur.

---

## Étape 9 : les données de base du site (une seule fois)

La base du site est vide : il faut y créer les rôles, les catégories du forum et les listes de référence. Depuis le dossier `apps/site` :

```bash
DATABASE_URL="postgresql://…(base site)…" npx tsx prisma/firstSetup.ts
```

Sous PowerShell : `$env:DATABASE_URL="postgresql://…"; npx tsx prisma/firstSetup.ts`

Le script peut être relancé sans risque : il complète ce qui manque, sans dupliquer ni effacer.

---

## Étape 10 : vérifications en ligne

- [ ] `https://www.<domaine>` s'affiche : accueil, forum, tournois.
- [ ] « Se connecter » avec Discord : passage par `auth.<domaine>`, retour sur le site connecté, choix du pseudo.
- [ ] Même chose avec Google, puis avec un lien reçu par email.
- [ ] Le compte d'un email de `SUPERADMIN_EMAILS` voit l'administration.
- [ ] Un message privé s'envoie et se relit.
- [ ] « Se déconnecter » déconnecte du site et du hub.
- [ ] Sur un vrai iPhone (Safari) : connexion, fermeture de l'onglet, retour sur le site, toujours connecté.
- [ ] Le lendemain, sur Vercel (projet hub, onglet **Logs**) : l'appel de nuit à `/api/cron/daily` a répondu sans erreur.

Les essais plus poussés à la main sont dans [TESTS-MANUELS.md](TESTS-MANUELS.md).

---

## Gérer le site en ligne

**Bannir un compte de toutes les applications**, depuis `apps/hub` :
```bash
HUB_DATABASE_URL="postgresql://…(base hub)…" corepack pnpm ban coach@exemple.fr "Raison du bannissement"
HUB_DATABASE_URL="postgresql://…(base hub)…" corepack pnpm ban coach@exemple.fr --unban
```
Le compte ne peut plus se connecter et ses accès aux applications sont retirés. Pour un effet immédiat sur une session déjà ouverte sur le site, le bannir aussi depuis la modération du site.

**Revenir à une connexion sans hub** (en cas de panne du hub) : sur le projet Vercel du site, vider `AUTH_MODE`, remplir les variables Discord, Google et SMTP du site avec des applications dont l'adresse de retour est `https://www.<domaine>/api/auth/callback/discord` (et `…/google`), puis redéployer.

> **Données des membres** : une fois le site ouvert, aucune donnée de membre ne doit être supprimée sans accord exprès. Avant une opération risquée sur une base, créer une branche de sauvegarde sur Neon.

---

## En cas de problème

- **Erreur 500 ou page blanche** : sur Vercel, onglet **Logs** du projet concerné, lire le message en rouge.
- **La construction échoue à `prisma migrate deploy`** : vérifier `DATABASE_URL` (site) ou `HUB_DATABASE_URL` (hub) : adresse Neon complète, connexion directe et non « pooled », la bonne base.
- **La migration `20261105150000_recherche_plein_texte` échoue sur `CREATE EXTENSION unaccent`** (recherche du forum) : lancer `CREATE EXTENSION IF NOT EXISTS unaccent;` dans l'éditeur SQL de Neon (base `site`), puis redéployer.
- **« Invalid AUTH_SECRET »** : la variable manque ou fait moins de 32 caractères.
- **« ENCRYPTION_KEY manquante ou trop courte »** : la variable manque sur le projet du site.
- **Erreur de redirection à la connexion** : `HUB_ISSUER` doit valoir exactement `BETTER_AUTH_URL` du hub suivi de `/api/auth` ; l'adresse de retour enregistrée à l'étape 7 doit être exactement `AUTH_URL` suivi de `/api/auth/callback/hub` ; chez Discord et Google, l'adresse de retour doit être celle du hub.
- **Bannissements ou suppressions de compte non reçus par le site** : `HUB_EVENTS_SECRET` du site doit être celui affiché par le dernier `client-hooks.mjs`.

---

## Annexe A (facultative) : reprendre les données de la bêta

L'ancienne bêta (base SQLite chez Turso) a été arrêtée le 4 novembre 2026. Sa copie, `docs/backup-db/bbfrance-db-backup-20261104.db`, reste sur le poste du responsable : elle contient des données personnelles et ne doit jamais être enregistrée dans git. Le script `apps/site/scripts/import-beta-backup.ts` en recopie les membres et les données utiles dans la base du site. Il ne se lance qu'une fois, par le responsable ou avec son accord exprès.

**Ce qui est repris** : les membres, avec leur rôle, leur bannissement éventuel et leurs liaisons Discord ou Google ; les rôles, réglages et données de référence qui manqueraient ; les ligues, leurs membres et commissaires ; les ressources, les articles, leurs étiquettes et réactions ; les archives du classement. Tous les membres passent au thème « vestiaire ».

**Ce qui n'est pas repris** : les messages privés ; les sujets et messages du forum et ce qui en dépend (tournois, inscriptions, réactions, mentions, lectures) ; le journal de modération et les signalements ; les sessions de connexion ; les schémas BBScheme et le quiz (ils iront dans leurs propres applications).

1. Après les étapes 8 et 9, sur Neon, créer une branche de sauvegarde (`avant-reprise-beta`).
2. Depuis `apps/site` :
   ```bash
   DATABASE_URL="postgresql://…(base site)…" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db
   ```
3. Lire le résumé de fin : pour chaque table, les lignes lues, créées, mises à jour, inchangées et ignorées. Relancer le script ne crée rien de plus et ne supprime jamais rien.

Les membres repris retrouvent leur compte en se connectant au hub avec le même email (Discord, Google ou lien par email).

## Annexe B : BBScheme et BBQuizz, plus tard

Les deux applications sont en attente (leur code complet est rangé dans `editeur-en-attente/` et `quiz-en-attente/`). Pour les mettre en ligne le moment venu : une base Neon de plus et un projet Vercel de plus chacune (*Root Directory* `apps/bbscheme` ou `apps/bbquizz`, seule variable `BBSCHEME_DATABASE_URL` ou `BBQUIZZ_DATABASE_URL`), puis, pour BBScheme, `BBSCHEME_URL` sur le projet du site. Sans BBScheme, les schémas cités dans les messages affichent « Schéma indisponible », sans gêner le reste du site.

Les notes de l'ancienne production (reprise des schémas et du quiz, clé ImgBB, thème Vestiaire…) sont archivées dans [archive/docs/deploy-notes-2026.md](archive/docs/deploy-notes-2026.md).
