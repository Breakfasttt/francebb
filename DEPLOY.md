# Mettre BBFrance en ligne

Ce guide explique pas à pas comment publier le site, même sans expérience de l'hébergement web. Les mots techniques sont expliqués dans le [glossaire](docs/GLOSSAIRE.md).

**L'architecture, en deux briques gratuites pour commencer :**
- **Vercel** héberge le site. Il le remet à jour automatiquement à chaque envoi de code sur GitHub.
- **Neon** héberge la base de données Postgres (comptes, forum, tournois…).

À chaque mise en ligne, la structure de la base est mise à jour automatiquement : le script `vercel-build` lance `prisma migrate deploy` avant de construire le site. **Aucune commande à taper sur la base de production.**

---

## Étape 0 : les outils

Installer sur son ordinateur :
1. [Node.js](https://nodejs.org), version 22 ou plus (version « LTS ») : le moteur qui fait tourner le site.
2. [Git](https://git-scm.com) : l'outil qui envoie le code sur GitHub.

Pour travailler en local, suivre la section « Lancer le site sur son ordinateur » du [README](README.md).

---

## Étape 1 : tester la connexion et les emails en local

### Connexion avec Discord et Google

Discord et Google n'acceptent une connexion que vers des adresses déclarées à l'avance. On crée donc une application « de test » chez chacun.

**Discord**
1. Aller sur le [portail développeur Discord](https://discord.com/developers/applications), puis **New Application** (nom : `BBFrance - Local`).
2. Menu **OAuth2** > **Redirects** > **Add Redirect** : `http://localhost:3000/api/auth/callback/discord`
3. Copier le **Client ID** et le **Client Secret** dans `apps/site/.env` (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`).

**Google**
1. Aller sur la [console Google Cloud](https://console.cloud.google.com/), créer un projet, puis **APIs & Services** > **Credentials**.
2. **Create Credentials** > **OAuth client ID** > **Web application**.
3. **Authorized redirect URIs** : `http://localhost:3000/api/auth/callback/google`
4. Copier le **Client ID** et le **Client Secret** dans `apps/site/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

Dans `apps/site/.env`, `AUTH_URL` doit valoir `http://localhost:3000`.

### Envoi d'emails (lien de connexion par email)

N'importe quel service SMTP (service d'envoi de mails) convient :
- **Mailtrap** ([mailtrap.io](https://mailtrap.io)) capture les mails sans les envoyer : idéal pour tester. Menu **Email Testing** > **Inboxes**, choisir « Nodemailer » pour obtenir les réglages `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`.
- **Resend** ([resend.com](https://resend.com)) envoie de vrais mails : `SMTP_HOST="smtp.resend.com"`, `SMTP_PORT="465"`, `SMTP_USER="resend"`, `SMTP_PASSWORD=` la clé d'API Resend.

---

## Étape 2 : mettre le code sur GitHub

Vercel récupère le code sur GitHub. Le dépôt du projet est `github.com/Breakfasttt/francebb`. Pour un nouveau dépôt :
1. Créer un compte sur [GitHub](https://github.com), puis **+** > **New repository**.
2. Dans un terminal ouvert dans le dossier du projet :
   ```bash
   git remote add origin https://github.com/VOTRE_PSEUDO/bbfrance.git
   git push -u origin development
   ```

---

## Étape 3 : créer la base de données sur Neon

1. Créer un compte sur [neon.tech](https://neon.tech) (connexion possible avec GitHub).
2. **Create project** : nom `bbfrance`, région **Europe (Frankfurt)**, la plus proche des coachs.
3. Sur la page du projet, bouton **Connect** : copier la **chaîne de connexion** (*connection string*) qui commence par `postgresql://`. Choisir la version **sans** « pooled » (connexion directe), qui convient aussi aux migrations.
4. Garder cette adresse secrète : c'est la clé de la base.

**Sauvegardes** : Neon garde un historique de la base et permet de la restaurer à un instant passé (menu **Branches** > **Restore**). La durée conservée dépend de l'offre choisie.

---

## Étape 4 : publier le site sur Vercel

1. Se connecter sur [vercel.com](https://vercel.com) avec son compte GitHub.
2. **Add New** > **Project**, puis **Import** sur le dépôt.
3. **Root Directory** : choisir **`apps/site`**. Le dépôt contient plusieurs applications, et c'est le dossier du site. Vercel détecte pnpm tout seul.
4. **Environment Variables** : ajouter une par une les variables suivantes. Chaque variable est aussi expliquée dans `apps/site/.env.example`.

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | La chaîne de connexion Neon de l'étape 3 |
| `AUTH_SECRET` | Un secret aléatoire : `openssl rand -base64 32` |
| `AUTH_URL` et `NEXT_PUBLIC_SITE_URL` | L'adresse du site, ex. `https://bbfrance.vercel.app` |
| `SUPERADMIN_EMAILS` | Emails des super-administrateurs, séparés par des virgules |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | Application Discord **de production**, avec l'adresse de retour `https://<adresse du site>/api/auth/callback/discord` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Idem chez Google, avec `…/api/auth/callback/google` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` | Service d'envoi de mails |
| `CONTACT_EMAIL` | Adresse de contact affichée dans les mentions légales : demandes sur les données personnelles (RGPD) et signalements. Une modification demande un nouveau déploiement. |
| `ENCRYPTION_KEY` | 64 caractères hexadécimaux : `openssl rand -hex 32` |
| `IMGBB_API_KEY` | Clé gratuite sur [imgbb.com](https://imgbb.com), pour l'envoi d'images (avatars, blasons, images des messages, des articles et des ressources). Elle est secrète : seul le serveur la lit (`app/imageUploadActions.ts`, carte 141). Ne jamais l'écrire avec le préfixe `NEXT_PUBLIC_`, qui la recopierait dans le code envoyé au navigateur, lisible par tous. L'ancienne variable `NEXT_PUBLIC_IMGBB_API_KEY` est à supprimer. |

5. **Deploy**. Pendant la construction, Vercel lance `vercel-build`, qui crée les tables dans la base Neon.

---

## Étape 5 : créer les données de base (une seule fois)

La base est vide : il faut y créer les rôles, les catégories du forum et les listes de référence. Depuis le dossier `apps/site`, en donnant l'adresse de la base Neon :

```bash
DATABASE_URL="postgresql://…(adresse Neon)…" npx tsx prisma/firstSetup.ts
```

Sous Windows PowerShell : `$env:DATABASE_URL="postgresql://…"; npx tsx prisma/firstSetup.ts`

Le script peut être relancé sans risque : il complète ce qui manque sans dupliquer ni effacer.

---

## Étape 5 bis (une seule fois) : reprise des données de la bêta

L'ancienne production (la bêta, base SQLite chez Turso) a été arrêtée le 4 novembre 2026. Sa copie, `docs/backup-db/bbfrance-db-backup-20261104.db`, reste sur le poste du responsable : elle contient des données personnelles et ne doit jamais être enregistrée dans git. Le script `apps/site/scripts/import-beta-backup.ts` (carte 178) en recopie les membres et les données utiles dans la nouvelle base. Il ne se lance qu'une fois, par le responsable ou avec son accord exprès.

**Ce qui est repris** : les membres, avec leur rôle, leur bannissement éventuel et leurs liaisons Discord ou Google (ils retrouvent leur compte en se reconnectant) ; les rôles, les réglages du site et les données de référence qui manqueraient ; les ligues avec leurs membres et commissaires ; les ressources, les articles, leurs étiquettes et réactions ; les archives du classement. Les schémas BBScheme ne vont plus dans la base du site depuis la carte 179 : ils sont repris dans la base de l'application BBScheme (étape 5 ter). Les données du quiz (questions, parties, scores des membres) non plus depuis la carte 180 : elles sont reprises dans la base de l'application BBQuizz (étape 5 quater). Tous les membres passent au thème « vestiaire », et leur ancien thème est gardé pour que le bandeau du nouveau look leur propose d'y revenir.

**Ce qui n'est pas repris** : les messages privés et les conversations ; les sujets et messages du forum, et ce qui en dépend (le tournoi, ses inscriptions, les réactions, mentions et lectures) ; le journal de modération et les signalements ; les sessions et jetons de connexion.

Dans l'ordre :

1. Avoir une base Neon neuve (étape 3), à jour de ses migrations (le premier déploiement de l'étape 4 les applique), et ses données de base (étape 5).
2. Sur Neon, créer une branche de sauvegarde (**Branches** > **Create branch**, nom `avant-reprise-beta`).
3. Depuis le dossier `apps/site`, lancer le script avec l'adresse de la base Neon et le chemin de la copie :
   ```bash
   DATABASE_URL="postgresql://…(adresse Neon)…" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db
   ```
   Sous Windows PowerShell : `$env:DATABASE_URL="postgresql://…"; npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db`
4. Lire le résumé affiché à la fin : pour chaque table, le nombre de lignes lues, créées, mises à jour, inchangées et ignorées, avec la raison. Une donnée déjà créée par firstSetup (même rôle, même donnée de référence) n'est pas dupliquée : la version de firstSetup est gardée. Relancer le script ne crée rien de plus ; il ne supprime jamais rien.
5. Une fois la reprise vérifiée sur le site, supprimer le script `apps/site/scripts/import-beta-backup.ts` du dépôt (carte 178).

---

## Étape 5 ter : l'application BBScheme (carte 179)

Les schémas tactiques BBScheme, affichés dans les messages par la balise `[bbscheme]`, ne sont plus dans la base du site : ils sont rangés dans la base de l'application `apps/bbscheme`, qui les donne au site par l'adresse `GET /api/boards/<identifiant>`. Décision : [ADR-0008](docs/adr/0008-quiz-et-bbscheme-hors-du-site.md). L'éditeur est en attente : l'application ne sert qu'une page « BBScheme revient bientôt » et cette adresse de lecture.

**Ordre obligatoire** : l'application BBScheme et sa base doivent être en ligne, avec les schémas, **avant** que le site reçoive la migration `20261105100000_bbscheme_hors_du_site`, qui supprime la table `BBSchemeState` de la base du site. Cette migration est appliquée automatiquement par le déploiement du site (`vercel-build`) : ne pas déployer cette version du site avant la fin des points 1 à 5.

1. **Une base Neon de plus**, pour l'application BBScheme (jamais celle du site ni celle du hub).
2. **Un projet Vercel de plus**, *Root Directory* = `apps/bbscheme`, avec la seule variable `BBSCHEME_DATABASE_URL` (adresse de cette base). Le premier déploiement crée la table (`vercel-build` lance `prisma migrate deploy`). Noter l'adresse publique de l'application, par exemple `https://bbscheme.bbfrance.fr`.
3. **Reprendre les schémas de la bêta**, depuis le dossier `apps/bbscheme` (une seule fois, par le responsable) :
   ```bash
   BBSCHEME_DATABASE_URL="postgresql://…(base BBScheme)…" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db
   ```
   Le résumé doit annoncer 13 schémas lus et 13 créés (ou inchangés si le script a déjà tourné) ; le relancer ne crée rien de plus. Une fois la reprise vérifiée, supprimer le script du dépôt.
4. **Schémas déjà dans la base du site** : si la base Neon du site existait déjà avec des schémas, créer une branche de sauvegarde Neon du site (`avant-bbscheme-hors-du-site`), compter ses lignes (`SELECT COUNT(*) FROM "BBSchemeState";` dans l'éditeur SQL de Neon), les copier dans la base BBScheme (même identifiant, même empreinte) et vérifier que la base BBScheme en compte au moins autant. Une base du site neuve n'en contient aucun.
5. **Vérifier** : `https://<adresse de l'application>/api/boards/<identifiant d'un schéma>` répond par `{"data": …}`.
6. **Site** : ajouter sur le projet Vercel du site la variable `BBSCHEME_URL` = l'adresse de l'application, sans `/` final, puis déployer la nouvelle version du site. Un message qui contient `[bbscheme]` doit afficher le schéma. Si l'application est arrêtée ou si `BBSCHEME_URL` manque, il affiche « Schéma indisponible », sans gêner le reste du site.

Les bibliothèques `html2canvas` et `gifshot` (export GIF de l'éditeur) ont quitté le site pour l'application BBScheme.

---

## Étape 5 quater : l'application BBQuizz (carte 180)

Le quiz BBQuizz n'est plus dans le site : ses questions, ses parties et les scores des joueurs sont rangés dans la base de l'application `apps/bbquizz`. Décision : [ADR-0008](docs/adr/0008-quiz-et-bbscheme-hors-du-site.md). Le quiz est en attente : l'application ne sert qu'une page « Le quiz revient bientôt », et le site n'a plus aucun lien vers elle. Les questions de départ ne sont plus chargées par `firstSetup.ts` du site.

**Ordre obligatoire** : la base de l'application BBQuizz doit exister et avoir reçu les données du quiz **avant** que le site reçoive la migration `20261105120000_quiz_hors_du_site`, qui supprime de la base du site les cinq tables du quiz et les quatre colonnes de scores de la fiche des membres (`quizTotalScore`, `quizBestScore`, `quizStreak`, `quizAttemptsCount`). Cette migration est appliquée automatiquement par le déploiement du site (`vercel-build`) : ne pas déployer cette version du site avant la fin des points 1 à 4.

1. **Une base Neon de plus**, pour l'application BBQuizz (jamais celle du site, du hub ni de BBScheme).
2. **Un projet Vercel de plus**, *Root Directory* = `apps/bbquizz`, avec la seule variable `BBQUIZZ_DATABASE_URL` (adresse de cette base). Le premier déploiement crée les tables (`vercel-build` lance `prisma migrate deploy`). L'application peut aussi attendre la relance du quiz pour être mise en ligne : seule sa base est indispensable avant la migration du site (créer alors les tables depuis `apps/bbquizz` avec `BBQUIZZ_DATABASE_URL="…" npx prisma migrate deploy`).
3. **Reprendre les données du quiz de la bêta**, depuis le dossier `apps/bbquizz` (une seule fois, par le responsable) :
   ```bash
   BBQUIZZ_DATABASE_URL="postgresql://…(base BBQuizz)…" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db
   ```
   Le résumé doit annoncer 340 questions lues, dont 339 créées et 1 ignorée (un texte en double dans la sauvegarde), 7 parties terminées et les scores de 4 joueurs (ou « inchangées » si le script a déjà tourné) ; le relancer ne crée rien de plus. Une fois la reprise vérifiée, supprimer le script du dépôt.
4. **Données du quiz déjà dans la base du site** : si la base Neon du site existait déjà, créer une branche de sauvegarde Neon du site (`avant-quiz-hors-du-site`) et compter ses lignes dans l'éditeur SQL de Neon (`SELECT COUNT(*) FROM "QuizQuestion";`, de même pour `QuizAttempt`, `QuizGame`, `QuizDailyWinner`, `QuizQuestionSuggestion`, et `SELECT COUNT(*) FROM "User" WHERE "quizAttemptsCount" > 0;`). Les questions créées par l'ancien `firstSetup.ts` sont déjà dans la base BBQuizz (même texte) ; toute autre ligne doit y être copiée (même identifiant ; les scores des membres dans `QuizPlayerStats`) avant de continuer. Une base du site neuve, préparée par le nouveau `firstSetup.ts`, n'en contient aucune.
5. **Site** : déployer la nouvelle version du site. Le menu et l'accueil n'ont plus d'entrée « Quizz », et `/bbquizz` donne la page introuvable.

---

## Étape 6 (facultative) : un nom de domaine

1. Acheter un domaine (OVH, Gandi…), puis sur Vercel : **Settings** > **Domains** > **Add**.
2. Recopier chez le fournisseur du domaine les enregistrements DNS indiqués par Vercel, puis attendre la validation du certificat (de quelques minutes à quelques heures).
3. Mettre à jour `AUTH_URL` et `NEXT_PUBLIC_SITE_URL` sur Vercel, ainsi que les adresses de retour chez Discord et Google, puis redéployer.

---

## Étape 7 (plus tard) : le hub de connexion unique

Le hub (`apps/hub`) donne un seul compte BBFrance pour le site et les futures applications. **Tant que `AUTH_MODE` n'est pas réglé sur `hub` sur le projet du site, le site fonctionne sans lui.** Décision : [ADR-0003](docs/adr/0003-hub-better-auth-oidc.md). Carte : 035.

1. **Un domaine commun est obligatoire** : le hub et le site doivent partager un domaine parent, ex. `auth.bbfrance.fr` et `www.bbfrance.fr`. Sans cela, Safari bloque la reconnexion automatique.
2. **Une deuxième base Neon** pour le hub (il ne stocke que les comptes et les connexions).
3. **Un deuxième projet Vercel**, *Root Directory* = `apps/hub`, avec les variables :
   - `BETTER_AUTH_URL` (ex. `https://auth.bbfrance.fr`) ;
   - `BETTER_AUTH_SECRET` (`openssl rand -base64 32`) ;
   - `HUB_DATABASE_URL` (base Neon du hub) ;
   - Discord et Google (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), avec les adresses de retour `https://auth.bbfrance.fr/api/auth/callback/discord` et `…/google`. Ils sont obligatoires : en mode hub, le site affiche toujours les boutons Discord et Google, qui passent par le hub ;
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` (même service d'envoi de mails que le site), pour les liens de connexion par email ;
   - `CRON_SECRET` (`openssl rand -base64 32`) : secret de la purge nocturne (carte 118). Vercel lance chaque nuit à 3 h l'adresse `/api/cron/daily`, déclarée dans `apps/hub/vercel.json`, avec ce secret. Elle efface le journal d'audit de plus d'un an, les sessions et les liens de connexion expirés, et renvoie les événements que les applications n'ont pas encore reçus (carte 121). Sans `CRON_SECRET`, elle refuse de tourner.

   - `HUB_THIRD_PARTY_APPS` : laisser vide tant qu'aucune application tierce n'est validée ; `1` pour ouvrir le hub aux applications tierces (carte 127). `HUB_THIRD_PARTY_QUOTA` : demandes par heure et par application tierce (1000 si vide).

   `BETTER_AUTH_SECRET` sert aussi à chiffrer les jetons Discord et Google en base et à calculer les empreintes du journal d'audit : **ne jamais le changer** une fois le hub en ligne, sinon ces jetons deviennent illisibles (les coachs devront se reconnecter avec Discord ou Google).
4. **Enregistrer le site comme application cliente**, depuis `apps/hub` :
   ```bash
   HUB_DATABASE_URL="postgresql://…(base du hub)…" node scripts/register-client.mjs "BBFrance site" https://www.bbfrance.fr/api/auth/callback/hub
   ```
   Le secret n'est affiché **qu'une seule fois** : le copier immédiatement. Le script déclare aussi l'adresse où le hub renvoie le coach après une déconnexion (la page d'accueil du site, ici `https://www.bbfrance.fr/`). Un client enregistré avant la carte 037 n'a pas cette adresse : le supprimer et l'enregistrer de nouveau.
   Déclarer ensuite l'adresse où le hub prévient le site (bannissement, profil modifié, suppression) et celle où il lui demande les données d'un coach (export) :
   ```bash
   HUB_DATABASE_URL="postgresql://…(base du hub)…" BETTER_AUTH_SECRET="…(celui du hub)…" node scripts/client-hooks.mjs "BBFrance site" https://www.bbfrance.fr/api/hub/events https://www.bbfrance.fr/api/hub/export
   ```
   Le secret d'événements (`HUB_EVENTS_SECRET`) n'est affiché **qu'une seule fois**. Relancer la commande crée un nouveau secret : il faut alors le recopier dans le site.
5. **Sur le projet Vercel du site**, ajouter :
   - `AUTH_MODE=hub` ;
   - `HUB_ISSUER=https://auth.bbfrance.fr/api/auth` ;
   - `HUB_CLIENT_ID` et `HUB_CLIENT_SECRET` ;
   - `HUB_EVENTS_SECRET` (affiché par `client-hooks.mjs`), pour vérifier les événements du hub (carte 122).

   En mode hub, les boutons Discord, Google et email du site passent tous par le hub (carte 073) : les variables Discord, Google et SMTP du projet du site ne servent plus, mais il faut les garder pour pouvoir revenir en arrière.

   Pour revenir en arrière immédiatement : vider `AUTH_MODE` et redéployer.
6. **Bannir un compte de toutes les applications**, depuis `apps/hub` :
   ```bash
   HUB_DATABASE_URL="postgresql://…(base du hub)…" pnpm ban coach@exemple.fr "Raison du bannissement"
   HUB_DATABASE_URL="postgresql://…(base du hub)…" pnpm ban coach@exemple.fr --unban
   ```
   Le compte ne peut plus se connecter, ses connexions au hub sont fermées et les accès donnés aux applications sont retirés. Une application où le coach est déjà connecté le garde connecté jusqu'à la fin de sa session : pour un effet immédiat sur le site, le bannir aussi depuis la modération du site.

---

## Clé ImgBB gardée par le serveur (carte 141)

Jusqu'à la carte 141, la clé du service d'hébergement d'images ImgBB s'appelait `NEXT_PUBLIC_IMGBB_API_KEY`. Le préfixe `NEXT_PUBLIC_` la recopiait dans le code envoyé au navigateur : n'importe qui pouvait la lire et envoyer des images sur le compte du site. Désormais, les images passent par une action serveur (`apps/site/app/imageUploadActions.ts`), qui est seule à connaître la clé. L'ancienne clé a été publique : il faut la remplacer.

1. **Sur imgbb.com**, avec le compte du site : créer une nouvelle clé (page « API »), puis supprimer l'ancienne.
2. **Sur Vercel** (**Settings** > **Environment Variables**) : ajouter `IMGBB_API_KEY` avec la nouvelle clé, puis supprimer `NEXT_PUBLIC_IMGBB_API_KEY`.
3. Redéployer. Vérifier ensuite un envoi d'image, par exemple « Envoyer une image » dans son profil.
4. **En local**, dans `apps/site/.env` : renommer `NEXT_PUBLIC_IMGBB_API_KEY` en `IMGBB_API_KEY` (avec la nouvelle clé).

Sans cette variable, le site fonctionne, mais tout envoi d'image affiche « L'envoi d'images n'est pas configuré sur le site ».

Une image envoyée est limitée à 4 Mo et doit être un vrai fichier PNG, JPEG, GIF ou WebP. La limite des actions serveur est relevée à 4,5 Mo dans `apps/site/next.config.ts` (`serverActions.bodySizeLimit`), la taille maximale d'une requête acceptée par Vercel.

---

## Refonte visuelle : fin de la variable `REFONTE` (carte 101)

La variable d'environnement `REFONTE`, qui permettait de revenir à l'ancienne navigation pendant la refonte, n'existe plus : l'ancienne navigation et l'ancien CSS ont été supprimés. Si elle est encore déclarée sur Vercel (**Settings** > **Environment Variables**), la supprimer ; elle n'a plus aucun effet. Pour revenir en arrière en cas de problème, annuler le commit de la carte 101 (`git revert`), puis redéployer.

---

## Refonte visuelle : passage de tous les membres au thème Vestiaire (carte 078)

La migration `20261030180000_theme_vestiaire` écrit dans la table des membres : elle copie le thème de chacun dans la nouvelle colonne `previousTheme`, puis donne à tous le thème « vestiaire » (ADR 0006). Elle s'applique d'elle-même au déploiement, comme les autres migrations.

1. **Avant de déployer** : sur Neon, créer une branche de sauvegarde de la base de production (**Branches** > **Create branch**, nom `avant-vestiaire`).
2. Déployer comme d'habitude.
3. **Pour annuler** la bascule, lancer sur la base, dans l'éditeur SQL de Neon :
   ```sql
   UPDATE "User" SET "theme" = "previousTheme" WHERE "previousTheme" IS NOT NULL;
   ```
   Chaque membre présent au moment de la bascule retrouve son ancien thème, même s'il en a choisi un autre depuis. Les membres inscrits après gardent le leur.

---

## En cas de problème

- **Le site affiche une erreur 500 ou une page blanche** : sur Vercel, onglet **Logs**, lire le message en rouge.
- **La construction échoue à l'étape `prisma migrate deploy`** : vérifier `DATABASE_URL` (adresse Neon complète, connexion directe et non « pooled »).
- **La migration `20261105150000_recherche_plein_texte` échoue sur `CREATE EXTENSION unaccent`** (recherche du forum, carte 191) : l'extension `unaccent`, qui retire les accents, fait partie des extensions proposées par Neon ; elle doit être créée par le rôle propriétaire de la base (celui de la chaîne de connexion donnée par Neon). Si le rôle utilisé n'en a pas le droit, lancer `CREATE EXTENSION IF NOT EXISTS unaccent;` dans l'éditeur SQL de Neon, puis redéployer.
- **« Invalid AUTH_SECRET »** : la variable manque ou fait moins de 32 caractères.
- **Erreur de redirection à la connexion** : `AUTH_URL` doit être exactement l'adresse affichée dans le navigateur, et l'adresse de retour doit être déclarée chez Discord ou Google.

> **Données des membres** : une fois le site ouvert, aucune donnée de membre ne doit être supprimée sans accord exprès. Avant une opération risquée sur la base, créer une branche de sauvegarde sur Neon (**Branches** > **Create branch**).
