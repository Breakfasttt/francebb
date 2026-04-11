---
name: ui-components
description: Guide des composants UI et de la hiérarchie du projet BBFrance
---

# 🎨 Système de Design BBFrance

Ce document sert de référence pour maintenir la cohérence visuelle à travers le projet. Avant de créer un nouvel élément UI, vérifiez toujours si un composant existant peut répondre au besoin.

## 📁 Structure du Projet
Pour comprendre l'organisation des dossiers et la localité des composants, consultez le skill : [Project Structure](../project-structure/SKILL.md).


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
Affichage de données numériques ou textuelles (Messages, NAF, etc.).

### 🏷️ TagSelector
Gestionnaire de tags (mots-clés).
- **Usage** : Filtrage de listes (Articles, Ressources), formulaires de création.
- **Fonctionnement** : Ajout par touche "Entrée" (pas de virgules), badges amovibles avec icône de croix, suggestions dynamiques basées sur l'existant via dropdown Glassmorphism.
- **Règle** : Privilégier la recherche libre plutôt que des listes déroulantes de tags si le nombre est élevé.

### 🖼️ UserAvatar
Widget avatar complet. Gère les cadres (`RankSelect`) et les statuts.

### 📄 Pagination
Navigation multipage avec saisie directe du numéro de page.

### 📏 BBCodeEditor
Éditeur riche pour les messages du forum et les MPs.

### 🔘 Boutons (`common/components/Button/`)
Le projet utilise un système de boutons typés pour garantir la cohérence des actions utilisateur. **Ne jamais utiliser d'autres styles de boutons.**
- `ClassicButton` : Le bouton par défaut (Glassmorphism). Utilisé pour la navigation secondaire, les annulations ou les actions neutres.
- `CTAButton` : "Call To Action". Bouton brillant ("shiny") de couleur vive (Ambre/Vert/Bleu selon le thème). **Réservé aux actions positives principales** (Répondre, Enregistrer, Valider).
- `DangerButton` : Bouton rouge. **Réservé exclusivement aux actions destructives** (Supprimer, Bannir, Réinitialiser).
- `AdminButton` : Bouton violet. **Réservé aux actions de modération et d'administration** (Verrouiller, Déplacer, Épingler).
- `BadgeButton` : Bouton miniature compact. Utilisé pour les liens discrets dans les interfaces denses (Profil, MP dans les sidebars).

**Règles d'utilisation** :
- **Tailles** : Utiliser la prop `size` (`xs`, `sm`, `md`, `lg`). `md` est le défaut.
- **Icônes** : Toujours utiliser une icône de `lucide-react`. 
- **Server Components** : Pour éviter les erreurs de sérialisation, passez l'élément JSX : `icon={<Icon size={18} />}`.

### 🔘 BackButton / PageHeader
Standardisation du haut des pages (retour, fil d'ariane).

### 🔔 Toast
Notifications flottantes via `react-hot-toast`.

### 🪟 Modal / ConfirmModal
Fenêtres superposées. **Obligatoire** pour les actions critiques.

### 💡 Tooltip
Bulles d'informations au survol (Stats, icônes).

### 🔍 Search (LigueSearch / UserSearch)
Champs de recherche avec Autocomplete.

### 🏜️ EmptyState
Visuel par défaut si aucune donnée n'est trouvée.


## 📄 Composants Spécifiques notables (Features)

### Forum (`app/forum/component/`)
- **PostItem** : Rendu d'un message complet avec avatar du coach, signature et contenu BBCode.
- **RegistrationModule** : Logique d'inscription aux tournois.
- **TournamentForm** : Gestionnaire d'édition de tournoi complexe.
- **ForumCategory** : Affichage d'une catégorie et ses sous-forums.

### Profile (`app/profile/component/`)
- **ConversationView / List** : Interface complète de la messagerie privée.
- **ProfileEdit** : Formulaire multi-étapes de modification de profil.
- **ProfileBlockedUsers** : Interface de gestion du blocage utilisateur.

## 🎨 Système de Thèmes

Toutes les couleurs et effets doivent utiliser les variables CSS définies dans `app/theme/`.
- **Thèmes disponibles** : `default`, `light`, `blood`, `malpierre`, `naf`, `nehekhara`, `saison3`.
- **Valeurs de référence** :
  - **Primaire** : `#c21d1d` (rouge)
  - **Accent** : `#ffd700` (or)
  - **Radius** : `16px` (cartes/glass), `8px` (boutons/inputs)
- **Variables Clés** :
  - `--primary` / `--primary-rgb` : Rouge dominant.
  - `--accent` : Or / Accentuation.
  - `--glass-border` : Bordure translucide adaptative.
  - `--card-bg` : Fond des cartes.
  - `--foreground` / `--text-muted` : Couleurs de texte.

  ##  Confirmation utilisateur

  Quand il y a besoin d'avoir une confirmation de l'utilisateur, il faut utiliser le composant `ConfirmModal`. ou 'Modal' . N'utilise jamais les alertes natives de javascript.

## 🎨 Glossaire des Thèmes et Nomenclature

Pour assurer la cohérence visuelle, les variables de thème (CSS variables) doivent suivre une nomenclature claire et descriptive. 

### Règles de nommage :
- **Variables de base** : `--background`, `--foreground`, `--primary`, `--accent`.
- **Variables de composants** : `--nav-bg`, `--card-bg`, `--footer-bg`.
- **Variables de texte spécifiques** : `--header-foreground` (texte sur couleur primaire/fond de header), `--text-muted` (texte secondaire), `--text-secondary`.
- **Variables d'états/ overlays** : `--theme-overlay` (fond translucide adaptatif), `--nav-btn-bg` (fond bouton navbar), `--category-hover-bg`.

**Règle de clarté** : Si vous devez ajouter une nouvelle variable de thème, assurez-vous qu'elle soit nommée de manière explicite pour indiquer clairement son impact visuel dans l'UI (ex: préférer `--nav-btn-hover-bg` à `--nav-h-bg`).

**Règle ABSOLUE** : Ne jamais utiliser de couleurs codées en dur (`#fff`, `black`, `rgba(0,0,0,0.1)`) dans les styles. Utiliser systématiquement une variable de thème pour que l'interface s'adapte instantanément au changement de thème utilisateur.
