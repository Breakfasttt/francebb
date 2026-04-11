---
name: Project Structure
description: Guide complet de la structure, de l'organisation et des conventions du projet BBFrance.
---

# Architecture du Projet BBFrance

Ce document sert de référence pour comprendre l'organisation du code, la répartition des responsabilités et les conventions de nommage du projet.

## 📂 Vue d'ensemble des dossiers racines

- **`.agents/`** : Contient les instructions et compétences (skills) pour l'IA.
- **`app/`** : Cœur de l'application (Next.js App Router). Contient les pages, layouts et la logique spécifique aux routes.
- **`common/`** : Ressources transversales partagées (Composants UI atomiques, types globaux).
- **`lib/`** : Logique métier, utilitaires et configurations (Prisma, BBCode, Rôles).
- **`prisma/`** : Schéma de base de données et migrations.
- **`bdd/`** : Scripts de configuration initiale et de setup pérenne (`firstSetup.ts`).
- **`public/`** : Assets statiques (Images, Smileys, Polices).
- **`scripts/`** : Scripts utilitaires temporaires ou de test.
- **`styles/`** : Styles CSS de base et globaux.

---

## 🟦 Répertoire `app/` (Next.js App Router)

### 🧩 Conventions de Page
Chaque page doit suivre cette structure stricte :
- **Chemin** : `app/[nom-page]/page.tsx`
- **Style** : `app/[nom-page]/page.css` (importé dans le `page.tsx`)
- **Style mobile** : `app/[nom-page]/page-mobile.css` (importé dans le `page.tsx`)
- **Composants Locaux** : `app/[nom-page]/component/`
  - Chaque composant possède son sous-dossier : `component/NomComposant/NomComposant.tsx` + `.css`.
- **Actions Serveur** : `app/[nom-page]/actions.ts` (pour la logique de mutation et accès DB)

### 🗺️ Carte des fonctionnalités (Features)
- `forum/` : Gestion complète du forum (Catégories, Topics, Posts).
- `profile/` : Profil utilisateur et Messagerie Privée (MP).
- `tournaments/` : Organisation et suivi des tournois.
- `bbpusher/` : Outil de simulation tactique interactif.
- `carte/` : Carte interactive des ligues et membres.
- `ligues/` : Annuaire des ligues françaises.
- `admin/` & `moderation/` : Outils de gestion du site.
- `theme/` : Définition des variables CSS par thèmes.
- `auth/` (ou `(auth)/`) : Flux d'authentification Next-Auth.

---

## 🏗️ Répertoire `common/`

### 🎨 `common/components/` (Design System)
Regroupe les composants UI réutilisables. Chaque composant possède son propre dossier avec :
- `NomComposant.tsx`
- `NomComposant.css`
- `NomComposant-mobile.css`

**Composants Clés :**
- `PremiumCard` : Base pour l'effet glassmorphism.
- `UserAvatar` : Affichage standardisé des utilisateurs.
- `BBCodeEditor` : Éditeur de texte riche pour le forum.
- `Navbar` / `PageHeader` / `Pagination` : Éléments de structure globale.

---

## ⚙️ Répertoire `lib/` (Core Logic)

Ce dossier regroupe la logique "headless" partagée entre les Server Actions et les composants :
- **`prisma.ts`** : Instance unique du client de base de données.
- **`bbcode.ts`** : Moteur de rendu des messages (transformation BBCode -> HTML).
- **`roles.ts`** : Système de permissions RBAC (Rôles & Autorisations).
- **`siteConfig.ts`** : Paramètres globaux de l'application.

---

- **`schema.prisma`** : Définition du modèle de données (User, Category, Topic, Post, Tournament, League).
- **`migrations/`** : Historique versionné des modifications SQL.
- **`seed.ts`** : Wrapper appelant `bdd/firstSetup.ts`. NE JAMAIS utiliser pour reset les données.

---

## 💾 Répertoire `bdd/` (Setup & Data Integrity)

- **`firstSetup.ts`** : LE script de référence pour initialiser les données immuables (Rôles, Catégories Forum, Données de référence).
- **Règles Strictes** :
    - Fichier protégé : ne jamais supprimer ni modifier les données de base sans accord.
    - Idempotence obligatoire : utiliser systématiquement `upsert`.
    - Aucune suppression massive autorisée.

---

## 🤖 Règles d'Organisation pour l'IA

1. **Localité** : Si un composant n'est utilisé que par une seule page, il DOIT rester dans `app/[page]/component/`. S'il est utilisé par deux pages ou plus, il DOIT être déplacé dans `common/components/`.
2. **Séparation des préoccupations** : La logique d'accès aux données réside toujours dans `actions.ts` (ou `lib/`), jamais directement dans le `page.tsx`.
3. **Styles** : Toujours utiliser les variables CSS définies dans les thèmes (`app/theme/`). Ne jamais écrire de couleurs hexadécimales en dur dans les fichiers `.css`.
4. **Fichiers** : Ne jamais créer de fichiers orphelins. Un composant = un dossier dédié avec son CSS et sa variante CSS mobile.
