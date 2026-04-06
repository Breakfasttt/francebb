# 🏈 France Blood Bowl — BBFrance

La plateforme de référence pour la communauté **Blood Bowl en France**. Centrée sur les tournois, l'échange et la gestion de profil pour tous les coachs français.

---

## 🎯 But du Projet

BBFrance est conçu comme le hub central du Blood Bowl hexagonal. Il vise à simplifier la vie des joueurs (recherche de tournois, inscriptions, échanges) et des organisateurs (gestion des participants, communication). La plateforme combine un forum communautaire riche avec un système de gestion de tournois moderne et performant.

---

## ✨ Fonctionnalités

### 🏆 Gestion des Tournois
- **Inscriptions Multi-modes** — Inscription individuelle ou par équipe (Team Mode).
- **Zones de Validation** — Gestion dynamique des pré-inscriptions, des validés et de la liste d'attente.
- **Mercenaires & Commissaires** — Inscription en tant que mercenaire pour compléter des équipes ou gestion par des commissaires dédiés.
- **Détails Complets** — Format (Resurrection/Évolutif), dates, lieux (intégration Google Maps), tarifs, éditions (BB20, BB3, BB7) et plateformes.
- **Lien Forum** — Chaque tournoi peut être lié à un topic dédié pour centraliser les discussions.

### 💬 Communauté & Forum
- **Structure Hiérarchisée** — Catégories, forums et sous-forums pour une organisation claire.
- **Richesse d'Édition** — Support complet du BBCode, citations, et sticky topics/posts.
- **Interactions** — Réactions aux messages via emojis et système de mentions (@user).
- **Suivi Intelligent** — Marqueurs de messages non-lus et recherche globale performante.

### 👤 Profils & Social
- **Identité du Coach** — Profils avec numéro NAF, région, ligue et signature personnalisée.
- **Cosmétique** — Cadres d'avatars dynamiques selon le prestige ou le rôle.
- **Messagerie Privée** — Système de conversations privées avec notifications en temps réel et compteur de messages non-lus.

### 🛡️ Administration & Sécurité
- **Rôles (RBAC)** — Système granulaire de permissions (SUPERADMIN, ADMIN, MODERATOR, RTC, CHEF_LIGUE, COACH).
- **Modération** — Outils complets pour bannir, archiver, déplacer ou supprimer des contenus.
- **Configuration** — Panneau d'administration pour gérer les données de référence et les paramètres du site.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 16](https://nextjs.org) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org)
- **Base de Données** : [LibSQL](https://github.com/tursodatabase/libsql) (compatible SQLite) via [Prisma 7](https://www.prisma.io)
- **Authentification** : [NextAuth v5](https://authjs.dev)
- **Style** : Vanilla CSS & Tailwind (variables CSS prioritaires)
- **Composants** : [React 19](https://react.dev), [Lucide React](https://lucide.dev)
- **Notifications** : [react-hot-toast](https://react-hot-toast.com)

---

## 🚀 Développement & Compilation

### Configuration de l'environnement

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/Breakfasttt/francebb.git
   cd francebb
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Variables d'environnement** (`.env`) :
   ```env
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="votre-secret-tres-long"
   ```

### Initialisation & Lancement

1. **Préparer la base de données** :
   ```bash
   npx prisma migrate dev
   ```

2. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Accès** : [http://localhost:3000](http://localhost:3000)

---

## 🌐 Déploiement & Setup (Détaillé)

### ☁️ Option 1 : Architecture Moderne (Vercel + Turso) — Recommandé

C'est la méthode idéale pour une application "edge-ready" avec une latence minimale. 

> [!TIP]
> **[👉 Suivez le Guide de Déploiement Détaillé (DEPLOY.md)](./DEPLOY.md)** pour une installation pas à pas (configuration de la base Turso, variables d'environnement Vercel et migration du schéma).

---

### 🏠 Option 2 : Self-Hosted (VPS / Serveur dédié) — Indépendant

Si vous souhaitez héberger vous-même votre base de données et votre application sur votre propre serveur.

#### 1. Pré-requis sur le serveur
Assurez-vous d'avoir installé :
- **Node.js 20+**
- **PM2** (`npm install -g pm2`) pour la gestion du processus.
- **Nginx** pour le reverse proxy.

#### 2. Déploiement étape par étape
1. **Cloner et Installer** :
   ```bash
   git clone https://github.com/Breakfasttt/francebb.git /var/www/bbfrance
   cd /var/www/bbfrance
   npm install --production=false
   ```

2. **Configuration** : Créez un fichier `.env` à la racine :
   ```env
   # Pour SQLite local, on utilise une URL de fichier simple
   DATABASE_URL="file:./prisma/prod.db"
   AUTH_SECRET="un-secret-tres-long-et-aleatoire"
   NEXTAUTH_URL="https://votre-domaine.com"
   PORT=3000
   ```

3. **Génération & Migration** :
   ```bash
   npx prisma migrate deploy
   ```

4. **Build & Start** :
   ```bash
   npm run build
   # Tester le lancement
   npm start
   ```

#### 3. Automatisation avec PM2
Pour que l'application tourne en tâche de fond et redémarre en cas de crash :
```bash
pm2 start "npm start" --name bbfrance
pm2 save
pm2 startup
```

#### 4. Configuration Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 🐳 Option 3 : Déploiement via Docker (Auto-Hébergé complet)

Pour une isolation totale et une base SQLite persistante.

1. **Création du Dockerfile** (si absent) : Utilisez une image Node Alpine.
2. **Volume** : Montez un volume pour persister le fichier `./prisma/prod.db`.
3. **Environment** : Passez les variables via un fichier `.env` ou via votre orchestration (Docker Compose).

Exemple rapide de `docker-compose.yml` :
```yaml
services:
  bbfrance:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/prisma/data
    environment:
      - DATABASE_URL=file:/app/prisma/data/prod.db
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
```

---

## 📄 Licence & Contribution

Ce projet est sous licence [MIT](./LICENSE).
Les contributions sont les bienvenues via les Pull Requests. Pour tout changement majeur, merci de créer une issue au préalable.
