---
id: 019
title: next/image + import dynamique html2canvas/gifshot
epic: E03
app: site
depends_on: []
adr: 
verify: JS `/bbscheme` < 235 kB (baseline) ; 0 `<img>` hors exceptions
---

# 019 — next/image + import dynamique html2canvas/gifshot

## Action

`next/image` + config `images` ; `dynamic()` pour html2canvas et gifshot (`app/bbscheme/page.tsx`).

## Avancement

Fait : html2canvas + gifshot chargés à la demande (export GIF) → JS `/bbscheme` 235 → 183 kB.
Reste : 34 `<img>` → `next/image` (config des domaines d'avatars Discord/Google, vérification visuelle dans les 7 thèmes).

## Résultat

**JavaScript de `/bbscheme`** : 211 kB compressés avant comme après cette dernière étape, sous l'objectif de 235 kB. Next.js 16 n'affiche plus le poids des pages à la fin de `next build` ; le chiffre est calculé à partir des fichiers du build (socle de Next.js, mise en page générale et page, compressés en gzip comme les envoie le serveur). Il n'est donc pas comparable aux 183 kB de l'étape précédente, mesurés autrement (explication dans `docs/baseline.md`). Les images ne changent pas ce poids : `next/image` est déjà chargé pour le logo.

**Balises `<img>`** : 35 avant (34 dans l'ancien comptage), 34 après. Les 6 images du guide `/jouer` passent par `next/image` (une seule balise dans le code, répétée pour les 6 sections).

**Logo** (relevé par Lighthouse, carte 059) : `SiteLogo` demandait à `next/image` une image de la largeur de l'écran (`sizes="100vw"`, largeur et hauteur à 0) pour un logo affiché en 96 × 42 pixels. Il reçoit maintenant sa vraie taille d'affichage, calculée à partir de la hauteur voulue et des dimensions du fichier (1347 × 589). Poids reçu par le téléphone simulé : environ 106 Ko avant, 15,6 Ko après. Lighthouse ne relève plus que 11 Ko de trop au lieu de 85 (détail dans `docs/mobile-audit.md`). L'option `priority`, dépréciée par Next.js 16, est remplacée par `preload`, qui fait la même chose.

**Images du guide `/jouer`** : six fichiers d'environ 1 Mo chacun (des JPEG de 1024 × 1024 pixels malgré l'extension `.png`), envoyés tels quels. Le téléphone reçoit maintenant une version WebP de 100 à 150 Ko à la largeur de l'écran, 214 Ko au plus sur ordinateur.

**Pas de section `images` dans `next.config.ts`** : les réglages par défaut de Next.js 16 suffisent pour les images du dossier `public/`. Un commentaire dans `next.config.ts` explique pourquoi aucun site extérieur n'est autorisé.

### Exceptions : les 34 `<img>` restantes

Toutes affichent une image qui ne vient pas du dossier `public/` du site. `next/image` ne peut les optimiser que si l'on déclare à l'avance les sites d'où elles viennent (`remotePatterns`). Or l'avatar d'un membre peut être une adresse libre, saisie dans son profil (champ « URL de l'avatar ») : la liste des sites n'est pas connue. Autoriser tous les sites ferait de l'optimiseur du site un relais ouvert à tout Internet (n'importe qui pourrait lui faire télécharger et convertir n'importe quelle image, aux frais du site). Elles restent donc des `<img>` :

- **24 avatars de membres** (Discord, Google, DiceBear, imgbb ou adresse libre) : `UserAvatar`, `SignInButton`, `DebugAuthWidget`, `BBCodeEditor` (mentions), `DevLoginSection`, messagerie (`ChatBubble`, `ConversationList` ×2, `ConversationView`, `InviteParticipantModal`, `NewConversationModal`), forum (`RegistrationModule` ×2, `TournamentResultWidget`, page de modification d'un message, page de réponse, résultats d'un tournoi), membres (`MembersTable` ×2), modération (`BannedUsersTab` ×2, `LogsTab` ×2, `ReportsTab`).
- **3 aperçus d'avatars DiceBear** (`OnboardingForm`, `ProfileEdit` ×2) : images SVG d'un site extérieur, que `next/image` refuse d'optimiser par défaut pour des raisons de sécurité.
- **4 blasons de ligue** hébergés sur imgbb (`ligue/[id]/page.tsx`, `LigueBlasonUpload`, `LigueCard` ×2).
- **2 images de ressources** (`ResourceCard`, `ResourceModerationTab`) : imgbb ou adresse libre saisie à la soumission.
- **1 GIF exporté par BBScheme** : image fabriquée dans le navigateur (adresse `data:`), que `next/image` ne sait pas traiter.

### Vérifications

- `npx tsc --noEmit` : 0 erreur. `node scripts/lint-ratchet.mjs` : 840 erreurs, plafond 840 (aucune nouvelle).
- Tests e2e `smoke`, `visual-themes` et `mobile-audit` (ce dernier ouvre `/jouer` et `/bbscheme` sur téléphone) : 52 réussis au premier passage ; un test de `visual-themes` (page des bannis) a échoué par dépassement de délai à la fermeture du navigateur, sans écart d'image, puis `visual-themes` entier est passé (23 sur 23) après avoir recréé la base de test. Captures de référence des 7 thèmes inchangées : le logo garde exactement la même taille à l'écran (largeur calculée par le navigateur à partir de la hauteur, comme avant).
- Lighthouse mobile (`pnpm lighthouse`) : accueil 97, forum 94, sujet 91, tournois 98, profil 88.

### Remarque hors carte

Les avatars par défaut `/default-avatar.png` et `/images/default-avatar.png`, utilisés quand un membre n'a pas d'image, n'existent pas dans `public/` : le serveur répond « introuvable » (erreur 404, vue pendant les tests de la messagerie) et le navigateur affiche une image cassée. À traiter dans une carte à part.
