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
| `NEXT_PUBLIC_IMGBB_API_KEY` | Clé gratuite sur [imgbb.com](https://imgbb.com) (envoi d'images) |

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
- **« Invalid AUTH_SECRET »** : la variable manque ou fait moins de 32 caractères.
- **Erreur de redirection à la connexion** : `AUTH_URL` doit être exactement l'adresse affichée dans le navigateur, et l'adresse de retour doit être déclarée chez Discord ou Google.

> **Données des membres** : une fois le site ouvert, aucune donnée de membre ne doit être supprimée sans accord exprès. Avant une opération risquée sur la base, créer une branche de sauvegarde sur Neon (**Branches** > **Create branch**).
