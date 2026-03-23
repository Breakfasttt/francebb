# 🏈 France Blood Bowl — BBFrance

La plateforme de référence pour les **tournois de Blood Bowl en France**.

BBFrance permet aux joueurs et organisateurs de se retrouver autour des tournois, d'échanger sur le forum communautaire et de gérer leur profil de joueur.

---

## ✨ Fonctionnalités

- 🏆 **Tournois** — listing, détail, format, dates, prix d'entrée
- 💬 **Forum** — catégories, sous-forums, topics, BBCode, citations, recherche, modération
- 📬 **Messagerie privée** — conversations entre membres, compteur de non-lus
- 👤 **Profil utilisateur** — avatar, nom, historique
- 🛡️ **Rôles** — SUPERADMIN, ADMIN, CONSEIL_ORGA, MODERATOR, ORGA, COACH
- 🔨 **Modération** — ban, archivage, suppression de posts/topics

---

## 🛠️ Stack technique

| Technologie | Rôle |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework React fullstack (App Router) |
| [React 19](https://react.dev) | UI |
| [TypeScript](https://www.typescriptlang.org) | Typage statique |
| [Prisma 7](https://www.prisma.io) | ORM / gestion de la base de données |
| [LibSQL](https://github.com/tursodatabase/libsql) | Base de données SQLite compatible edge |
| [NextAuth v5](https://authjs.dev) | Authentification |
| [Tailwind CSS](https://tailwindcss.com) | (via classes inline) Styles |
| [Lucide React](https://lucide.dev) | Icônes |
| [date-fns](https://date-fns.org) | Manipulation de dates |
| [react-hot-toast](https://react-hot-toast.com) | Notifications |

---

## 🚀 Installation en local

### Prérequis

- Node.js 20+
- npm / yarn / pnpm

### 1. Cloner le repo

```bash
git clone https://github.com/Breakfasttt/francebb.git
cd francebb
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copier le fichier d'exemple et le remplir :

```bash
cp .env.example .env
```

Contenu minimal du `.env` :

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="une-chaine-aleatoire-longue-et-secrete"
```

### 4. Initialiser la base de données

```bash
npx prisma migrate dev
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Déploiement en production

### Option A — Vercel (recommandé)

Vercel est la plateforme officielle de Next.js, le déploiement y est natif.

1. Pousser le code sur GitHub
2. Importer le projet sur [vercel.com](https://vercel.com)
3. Renseigner les variables d'environnement dans **Settings → Environment Variables** :

```
DATABASE_URL=libsql://votre-base.turso.io?authToken=xxx
AUTH_SECRET=votre-secret
NEXTAUTH_URL=https://votre-domaine.vercel.app
```

> 💡 En production, remplacer la base SQLite locale par [Turso](https://turso.tech) (LibSQL hébergé, compatible Prisma).

4. Déployer — Vercel lance automatiquement `npm run build`

### Option B — VPS (Railway, Render, serveur dédié)

1. Builder l'application :

```bash
npm run build
```

2. Lancer en production :

```bash
npm start
```

3. Configurer un reverse proxy (nginx, Caddy) pour exposer le port 3000

4. Gérer les variables d'environnement via le dashboard de votre hébergeur ou un fichier `.env` sur le serveur (jamais commité)

### Build et vérification

```bash
# Vérifier les erreurs TypeScript et lint
npm run lint

# Builder pour la production
npm run build

# Lancer en mode production
npm start
```

---

## 📁 Structure du projet

```
├── app/                    # Pages et routes (App Router)
│   ├── api/                # API Routes Next.js
│   ├── forum/              # Pages du forum
│   ├── profile/            # Page profil
│   └── tournaments/        # Pages tournois
├── components/             # Composants React réutilisables
│   └── forum/              # Composants spécifiques au forum
├── lib/                    # Utilitaires (bbcode, prisma, roles...)
├── prisma/                 # Schéma et migrations Prisma
├── auth.ts                 # Configuration de l'authentification
└── public/                 # Assets statiques
```

---

## 🤝 Contribution

Les contributions sont les bienvenues. Pour toute modification importante, ouvrir une issue en premier pour discuter des changements envisagés.

---

## 📄 Licence

Projet privé — tous droits réservés.
