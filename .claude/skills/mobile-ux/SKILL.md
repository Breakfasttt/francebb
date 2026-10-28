---
name: mobile-ux
description: Guide UX/UI Mobile BBFrance. Portails, Sidebar Globale, FABs. Mode homme des cavernes.
---

# UI Mobile BBFrance

## RÈGLES OR
- **ZÉRO CASSE DESKTOP.** Logique Desktop intacte.
- CSS séparé (`page-mobile.css`, max-width 768px).
- Surtout empilement vertical (`flex-direction: column`).

## SIDEBAR GLOBALE (MOBILE SEUL)
- Navbar Desktop devient bouton Hamburger sur mobile.
- Hamburger ouvre Drawer/Sidebar Globale.
- **Contenu Sidebar Globale**:
  1. Logo / Titre.
  2. Profil Utilisateur (Avatar, bouton déco/co).
  3. Liens globaux (Messagerie, Forum, Modération, Admin).
  4. Séparateur `<hr />`.
  5. **Slot dynamique**: `<div id="mobile-page-sidebar-slot"></div>` (pour les sidebars locales).
  6. **Footer**: Mentions légales, lien GitHub (tout en bas).

## FUSION DES SIDEBARS (REACT PORTAL)
Si une page a une *Sidebar Locale* (ex: TabSystem de Profil ou Admin) :
- Desktop : S'affiche normalement.
- Mobile : Le contenu migre dans le slot de la Sidebar Globale.
- **Action**: Utiliser hook `useMediaQuery` + composant `<MobilePortal target="mobile-page-sidebar-slot">`.
- Masquer la sidebar locale de base en CSS mobile.

## FILTRES & FORMULAIRES LONGS (FAB)
- Sur mobile, colonnes de filtres disparaissent.
- Ajouter bouton flottant (FAB = Floating Action Button), icône entonnoir, en haut à droite.
- Clic ouvre modale Overlay / Bottom-Sheet avec tous les filtres + bouton "Appliquer".

## PAGE HEADER & BACK BUTTON
- **Action**: Utiliser `<PageHeader />` pour le titre et le bouton retour.
- Sur mobile, le bouton retour (`BackButton`) doit être "téléporté" via `React Portal` dans le slot `#mobile-back-button-slot` de la `Navbar`.
- Cela permet de garder le bouton retour accessible en haut à droite, même si le header de la page est scrollé ou masqué.

## DESKTOP ONLY (FALLBACK)
Si composant impossible sur mobile (ex: `BBScheme` trop d'interactions, canvas géant) :
- Afficher composant `<DesktopOnlyFallback>`.
- Message: "Optimisé pour PC/Tablette". Masquer le reste.

## ASTUCES VIE SAUVAGE
- Tableaux HTML sur mobile ? Flex column ou scroll `overflow-x: auto`.
- Flex prend toujours largeur 100%. Garder de l'air (padding).
- Si composant trop dur à fondre, simplifier visuel mobile.
