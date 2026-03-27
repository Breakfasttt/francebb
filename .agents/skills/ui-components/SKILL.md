---
name: ui-components
description: Guide des composants UI et de la hiérarchie du projet BBFrance
---

# 🎨 Système de Design BBFrance

Ce document sert de référence pour maintenir la cohérence visuelle à travers le projet. Avant de créer un nouvel élément UI, vérifiez toujours si un composant existant peut répondre au besoin.

## 📁 Hiérarchie du Projet

```text
bbfrance/
├── .agents/                      # Instructions et skills pour l'IA
├── app/                          # Next.js App Router (Pages & API)
│   ├── (auth)/                   # Routes d'authentification
│   ├── [feature]/                # Pages par fonctionnalité (forum, profile, etc.)
│   │   ├── component/            # Composants EXCLUSIFS à cette page
│   │   ├── actions.ts            # Server Actions de la fonctionnalité
│   │   ├── page.tsx / page.css   # Structure et style de la page
│   ├── api/                      # API routes
│   └── theme/                    # Définition des thèmes CSS
├── common/                       # Ressources partagées
│   ├── components/               # Composants UI RÉUTILISABLES (Atomiques)
│   ├── types/                    # Types TypeScript globaux
├── lib/                          # Utilitaires et configuration
│   ├── prisma.ts                 # Instance client Prisma
│   ├── bbcode.ts                 # Parser de messages
│   └── roles.ts                  # Logique d'accès RBAC
├── prisma/                       # Schéma et migrations DB
├── public/                       # Assets statiques (Smileys, Images)
├── scripts/                      # Scripts de maintenance/seed
└── styles/                       # CSS global (variables de base)
```

## 🧩 Composants Globaux (`common/components/`)

### 📦 PremiumCard
Le composant de conteneur de base.
- **Usage** : Pour tout bloc de contenu, widget de sidebar ou formulaire.
- **Style** : Applique le Glassmorphism (bordures dorées/blanches, fond translucide).
- **Props** : `hoverEffect`, `noOverflow`, `className`.

### 🗂️ TabSystem
Système de navigation par onglets.
- **Usage** : Navigation interne aux pages (Profil, Admin).
- **Variantes** : `standard` (horizontal), `sidebar` (liste), `docked-sidebar` (icônes seules).

### 🏷️ StatusBadge
Badges de statut colorés.
- **Usage** : Rôles (Coach, Admin), Statuts (Banni, Actif).
- **Variantes** : `primary`, `accent`, `danger`, `success`, `banned`.

### 📊 StatItem
Affichage de données numériques ou textuelles.
- **Usage** : Stats de profil (Messages, NAF), Stats de forum.
- **Variantes** : `horizontal` (icône à gauche), `vertical` (valeur en gros).

### 🖼️ UserAvatar
Widget avatar complet.
- **Usage** : Partout où l'identité utilisateur est requise.
- **Features** : Gestion automatique des cadres (`RankSelect`), indicateur de bannissement.

### 📄 Pagination
Système de navigation multipage.
- **Usage** : Liste de topics, messages de topic, membres.
- **Features** : Saisie directe du numéro, mode compact pour sidebar.

### 📝 BBCodeEditor
Éditeur riche pour les messages.
- **Usage** : Création de topics, réponses, messages privés.
- **Features** : Barre d'outils, preview instantanée, sélecteur de smileys.

### 🔘 BackButton / PageHeader
Standardisation du haut des pages.
- **Usage** : Pour conserver une navigation cohérente (fil d'ariane, bouton retour).

## 📄 Composants Spécifiques notables

### Forum (`app/forum/component/`)
- **RegistrationModule** : Gestion complexe des inscriptions aux tournois (Solo/Team).
- **TournamentForm** : Formulaire de création/édition de tournois.
- **TopicSidebar** : Widget de gestion de sujet (Actions modérateur, saut de page).

### Profile (`app/profile/component/`)
- **ConversationView/List** : Système complet de messagerie privée.
- **ProfileEdit/Settings** : Formulaires de gestion de compte.

## 🎨 Système de Thèmes

Toutes les couleurs et effets doivent utiliser les variables CSS définies dans `app/theme/`.
- **Thèmes disponibles** : `default`, `light`, `blood`, `malpierre`, `naf`, `nehekhara`, `saison3`.
- **Variables clés** :
  - `--primary` / `--primary-rgb` : Rouge dominant.
  - `--accent` : Or / Accentuation.
  - `--glass-border` : Bordure translucide adaptative.
  - `--card-bg` : Fond des cartes.
  - `--foreground` / `--text-muted` : Couleurs de texte.

  ##  Confirmation utilisateur

  Quand il y a besoin d'avoir une confirmation de l'utilisateur, il faut utiliser le composant `ConfirmModal`. ou 'Modal' . N'utilise jamais les alertes natives de javascript.
