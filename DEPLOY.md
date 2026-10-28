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
   - Discord et Google, avec les adresses de retour `https://auth.bbfrance.fr/api/auth/callback/discord` et `…/google` ;
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` (même service d'envoi de mails que le site), pour les liens de connexion par email.
4. **Enregistrer le site comme application cliente**, depuis `apps/hub` :
   ```bash
   HUB_DATABASE_URL="postgresql://…(base du hub)…" node scripts/register-client.mjs "BBFrance site" https://www.bbfrance.fr/api/auth/callback/hub
   ```
   Le secret n'est affiché **qu'une seule fois** : le copier immédiatement.
5. **Sur le projet Vercel du site**, ajouter :
   - `AUTH_MODE=hub` ;
   - `HUB_ISSUER=https://auth.bbfrance.fr/api/auth` ;
   - `HUB_CLIENT_ID` et `HUB_CLIENT_SECRET`.

   Pour revenir en arrière immédiatement : vider `AUTH_MODE` et redéployer.

---

## En cas de problème

- **Le site affiche une erreur 500 ou une page blanche** : sur Vercel, onglet **Logs**, lire le message en rouge.
- **La construction échoue à l'étape `prisma migrate deploy`** : vérifier `DATABASE_URL` (adresse Neon complète, connexion directe et non « pooled »).
- **« Invalid AUTH_SECRET »** : la variable manque ou fait moins de 32 caractères.
- **Erreur de redirection à la connexion** : `AUTH_URL` doit être exactement l'adresse affichée dans le navigateur, et l'adresse de retour doit être déclarée chez Discord ou Google.

> **Données des membres** : une fois le site ouvert, aucune donnée de membre ne doit être supprimée sans accord exprès. Avant une opération risquée sur la base, créer une branche de sauvegarde sur Neon (**Branches** > **Create branch**).
