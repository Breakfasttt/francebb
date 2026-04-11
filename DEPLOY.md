# 🚀 Guide de Déploiement : BBFrance pour Débutants

Ce guide est conçu pour vous accompagner pas-à pas dans le déploiement de **BBFrance**, même si vous n'avez jamais hébergé d'application web auparavant. 

L'architecture choisie (**Vercel** pour le site + **Turso** pour les données) est la plus simple et la plus fiable pour commencer gratuitement.

---

## 🛠️ Phase 0 : Préparer vos Outils

Avant de commencer, vous devez installer trois outils gratuits sur votre ordinateur :

1.  **[Node.js](https://nodejs.org)** (Prendre la version "LTS") : C'est le moteur qui fait tourner l'application.
2.  **[Git](https://git-scm.com)** : L'outil qui permet d'envoyer votre code sur Internet.
3.  **[Turso CLI](https://docs.turso.tech/cli/introduction)** : Un petit programme en ligne de commande pour gérer votre base de données.
    *   *Sur Windows (PowerShell)* : `powershell -Command "irm https://get.turso.tech | iex"`

---

## 💻 Phase 0.5 : Ouvrir un Terminal dans votre projet

Beaucoup d'étapes demandent d'écrire des "commandes". Pour cela, vous devez ouvrir un terminal **à l'intérieur** du dossier `bbfrance` :

*   **Sur Windows** : Allez dans le dossier du projet via l'explorateur de fichiers. Cliquez sur un espace vide avec le bouton droit, puis sélectionnez **"Ouvrir dans le terminal"** (ou "Ouvrir une fenêtre PowerShell ici"). 
    *   *Astuce* : Vous pouvez aussi taper `cmd` ou `powershell` directement dans la barre d'adresse en haut de la fenêtre et appuyer sur Entrée.
*   **Via VS Code** (Recommandé) : Si vous utilisez VS Code, faites le raccourci `Ctrl` + `Maj` + `ù` (ou allez dans le menu **Terminal > Nouveau Terminal**).

---

Pour que Vercel puisse afficher votre site, votre code doit être sur **GitHub**.

1.  Créez un compte sur [GitHub.com](https://github.com).
2.  Cliquez sur le **"+"** en haut à droite > **New repository**.
3.  Nommez-le `bbfrance`, laissez-le en **Private** (ou Public selon votre choix), et cliquez sur **Create repository**.
4.  Sur votre ordinateur, ouvrez un terminal dans le dossier du projet et tapez ces commandes :
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/bbfrance.git
    git push -u origin main
    ```
    *(Remplacez VOTRE_NOM_UTILISATEUR par votre pseudo GitHub)*.

---

## 🗄️ Phase 2 : Créer votre Base de Données sur Turso

La "Base de Données" est l'endroit où seront stockés les messages du forum et les profils.

1.  Ouvrez votre terminal et connectez-vous :
    ```bash
    turso auth login
    ```
    *Une fenêtre de navigateur s'ouvrira pour valider votre identité.*

2.  Créez la base :
    ```bash
    turso db create bbfrance-db
    ```

3.  Récupérez l'URL (Adresse) de votre base :
    ```bash
    turso db show bbfrance-db --url
    ```
    *C'est une adresse qui commence par `libsql://`. Copiez-la précieusement.*

4.  Générez une clé d'accès (Token) :
    ```bash
    turso db tokens create bbfrance-db
    ```
    *C'est une longue suite de caractères. Copiez-la aussi.*

---

## 🌐 Phase 3 : Déployer sur Vercel

Vercel est l'endroit où votre site sera "hébergé" et accessible via une adresse `.vercel.app`.

1.  Allez sur [Vercel.com](https://vercel.com) et connectez-vous avec votre compte **GitHub**.
2.  Cliquez sur **"Add New" > "Project"**. 
3.  Vous verrez votre repo `bbfrance`. Cliquez sur **"Import"**.
4.  Dans la section **"Environment Variables"**, vous devez ajouter les informations suivantes UNE PAR UNE :

| Nom de la Variable (Key) | Valeur (Value) | Comment l'obtenir ? |
| :--- | :--- | :--- |
| `DATABASE_URL` | `libsql://...` | L'URL obtenue à l'étape 2 (Ajoutez `?authToken=VOTRE_TOKEN` à la fin !) |
| `AUTH_SECRET` | *(Texte au hasard)* | Tapez une phrase longue et compliquée (Min 32 chars). |
| `SUPERADMIN_EMAILS` | `email1@..` | Liste d'emails séparés par des virgules pour les droits admin. |
| `DISCORD_CLIENT_ID` | `...` | Créer une app sur `discord.com/developers`. |
| `DISCORD_CLIENT_SECRET` | `...` | Obtenu sur le portail développeur Discord. |
| `GOOGLE_CLIENT_ID` | `...` | Créer un projet sur `console.cloud.google.com`. |
| `GOOGLE_CLIENT_SECRET` | `...` | Obtenu sur le portail Google Cloud. |
| `SMTP_HOST` | `smtp.resend.com` | Hôte SMTP de votre fournisseur mail. |
| `SMTP_PORT` | `465` | Port SMTP (généralement 465 ou 587). |
| `SMTP_USER` | `resend` ou `apiKey` | Nom d'utilisateur SMTP. |
| `SMTP_PASSWORD` | `votre_mdp` | Mot de passe SMTP (ou clé API). |
| `EMAIL_FROM` | `noreply@..` | L'adresse expéditrice autorisée. |
| `ENCRYPTION_KEY` | *(Texte au hasard)* | Une autre phrase longue. |
| `NEXT_PUBLIC_SITE_URL` | `https://mon-site.vercel.app` | Mettez l'URL que Vercel vous donnera. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | *(Votre clé)* | Clé gratuite sur `imgbb.com`. |

5.  Cliquez sur le bouton bleu **"Deploy"**.

---

## ⚡ Phase 4 : La "Première Migration" (CRITIQUE)

À ce stade, votre site est en ligne mais il risque d'afficher une erreur car la base de données est vide. Il faut lui "apprendre" la structure du projet.

1.  Ouvrez le fichier `.env` sur votre ordinateur.
2.  Mettez temporairement l'URL Turso complète (avec le token) dans `DATABASE_URL`.
3.  Dans votre terminal, tapez :
    ```bash
    npx prisma db push
    ```
    *Si vous voyez "The database is now in sync", c'est gagné !*

4.  *(Optionnel) Remplir les données de test* :
    Si vous voulez que le forum ait déjà des catégories par défaut :
    ```bash
    npx ts-node prisma/seed.ts
    ```

---

## 🌍 Phase 5 : Lier votre Nom de Domaine (Optionnel)

Si vous ne voulez pas de l'adresse par défaut `...vercel.app`, vous pouvez utiliser votre propre nom de domaine (ex: `bbfrance.fr`).

1.  **Acheter un domaine** : Si vous n'en avez pas, achetez-le chez un fournisseur (ex: **OVH**, **Gandi**, **Namecheap**).
2.  **Sur Vercel** : Allez dans votre projet > **Settings** > **Domains**.
3.  Tapez votre nom de domaine et cliquez sur **Add**.
4.  Vercel vous donnera des **records DNS** (généralement un `A record` ou un `CNAME`).
5.  **Sur votre fournisseur (ex: OVH)** : Copiez les valeurs données par Vercel dans la zone DNS de votre domaine. 
    *   *Attendez quelques minutes (parfois quelques heures) que le "SSL" se valide sur Vercel.*
6.  **MISE À JOUR CRITIQUE** : Une fois le domaine actif, n'oubliez pas de retourner dans l'onglet **Environment Variables** de Vercel pour changer :
    *   `NEXTAUTH_URL` : Mettez votre nouveau domaine (`https://votredomaine.fr`).
    *   `NEXT_PUBLIC_SITE_URL` : Mettez votre nouveau domaine.
    *   *Redéployez ensuite l'application pour que le changement soit pris en compte.*

---

## 🆘 Aide : Les erreurs courantes

*   **"Prisma Client could not be initialized"** : Vérifiez que votre `DATABASE_URL` sur Vercel contient bien le `?authToken=...` à la fin.
*   **"Invalid AUTH_SECRET"** : Assurez-vous que cette variable est bien présente dans Vercel, avec au moins 32 caractères.
*   **"Invalid redirection URL"** (NextAuth) : C'est souvent parce que `NEXTAUTH_URL` n'est pas exactement la même que l'adresse dans votre navigateur.
*   **Le site est blanc / Erreur 500** : Allez dans l'onglet **"Logs"** sur Vercel pour lire l'erreur en rouge.

---
*Guide mis à jour le : 11 Avril 2026. Bon courage Coach ! 🏈*
