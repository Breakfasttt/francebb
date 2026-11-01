---
id: 102
title: "Skills et captures après la refonte"
epic: E08
app: site
depends_on: [101]
adr: 0006
verify: skills theming-rules, ui-components, mobile-ux, reuse-first et project-structure relus et à jour ; captures des 8 thèmes régénérées ; épic E08 fermé
---

# 102 — Skills et captures après la refonte

## Pourquoi

Les skills décrivent encore les 7 thèmes, le verre dépoli partout et le menu latéral. Une IA ou un développeur qui les lirait referait l'ancien site.

## Action

- Réécrire les skills `theming-rules`, `ui-components`, `mobile-ux`, `reuse-first` et `project-structure` selon l'ADR 0006.
- Régénérer volontairement les captures de `visual-themes.spec.ts` dans les 8 thèmes.
- Mettre à jour les fiches de `docs/features/` touchées, et fermer l'épic E08.

## Résultat

**Skills.** Les cinq skills ont été relus en entier, et chaque nom de fichier, de composant ou de variable a été vérifié dans le code.
- `mobile-ux` est réécrit : la partie sur l'ancien menu latéral (bouton à trois traits) est remplacée par la coquille actuelle (barre du haut avec l'emplacement du bouton retour, barre basse à cinq onglets, panneau « Plus » et sa rubrique « Cette page »), la barre d'actions d'une page (`data-page-bottom-bar`, `--app-page-bar-space`), les écrans plein écran (`isComposePath`, `ComposeScreen`, `data-fullscreen`), le modèle « bouton Filtres, panneau et pastilles », et les règles de base (44 pixels, champs en 16 pixels, aucun texte sous 12 pixels, pas de défilement horizontal, 8 thèmes).
- `ui-components` est réécrit : variantes et tailles de `Button` (les variantes shadcn sont à éviter), formulaires, conteneurs, panneaux (`Sheet`, `ConfirmDialog`, `ActionMenu`, `Popover`), notifications.
- `theming-rules` : l'échelle des superpositions correspond aux valeurs réelles (barre d'actions d'un sujet 4000, panneaux de `packages/ui` 8000 et 8001, notifications au-dessus de tout), les fichiers CSS de composant encore permis sont tous cités, et le piège du cache de Turbopack (`apps/site/.next/dev`) est expliqué.
- `reuse-first` : les composants propres au site ne sont plus rangés avec ceux de `packages/ui` ; le rôle de `GlobalPortal` était faux (il ne sert pas aux filtres mais à la rubrique « Cette page ») ; `navItems.ts` et le modèle des filtres sont ajoutés ; les lignes en style télégraphique sont réécrites.
- `project-structure` : un composant n'a plus de fichier `-mobile.css` ; l'emplacement réel des composants d'une rubrique (`app/<rubrique>/component/<Nom>.tsx`) et le nommage de `packages/ui` sont décrits.

**Autres documents corrigés** (mentions des 7 thèmes, du dossier `apps/site/app/theme/` ou de l'ancienne navigation) : skill `shadcn`, agent `voix-des-utilisateurs`, `packages/ui/CLAUDE.md`, `README.md`, `ARCHITECTURE.md`, `docs/GLOSSAIRE.md` (coquille, couche CSS, seuil, shadcn/ui, Tailwind, thème) et `docs/features/TEMPLATE.md`.

**Fiches de fonctionnalité.** Corrigées : `forum` (téléphone décrit avec le panneau « Plus » et la barre de réponse ; piège de l'ancien `CreateTopicSidebar` remplacé par `TournamentForm` et `ComposeActionBar`), `pages-diverses` (onglets du profil, 8 thèmes, faux défaut de `updateTheme` retiré : l'action vérifie le thème depuis la carte 062), `hub` (`SignInButton` supprimé, 8 thèmes), `bbscheme` et `auth`. Chaque chemin de fichier cité par une fiche existe.

**Captures.** `visual-themes.spec.ts` passe tel quel (26 tests, 1,5 minute) : aucune capture n'a été régénérée, celles de la carte 101 sont à jour.

**Épic E08.** Un bilan est ajouté à la fiche de l'épic. L'épic n'est pas fermé : il reste la carte 114 (essai à la main sur un vrai téléphone), quatorze lignes de l'inventaire et la note Lighthouse du profil (88).

**Défauts repérés dans le code, hors carte** (des commentaires seulement, sans effet sur le site) :
- `packages/ui/src/button.tsx` : le commentaire d'en-tête renvoie encore aux anciens boutons (`ClassicButton`, `CTAButton`), et celui des classes de base parle d'un preflight « absent », alors qu'il est actif.
- `apps/site/common/utils/signOutUser.ts` : le commentaire cite `SignInButton`, supprimé par la carte 101.
