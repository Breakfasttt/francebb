---
id: 128
title: Le hub utilise packages/ui et Tailwind
epic: E09
app: hub
depends_on: [120, 127]
adr: 0006
verify: pnpm --filter @bbfrance/hub test:api reste vert (35 tests) ; à 375 pixels de large, les pages du passeport, du consentement et de connexion n'ont aucun défilement horizontal et leurs boutons font au moins 44 pixels ; apps/hub/app/globals.css ne contient plus de styles écrits à la main pour ces pages
---

# 128 — Le hub utilise packages/ui et Tailwind

## Pourquoi

Le projet a choisi Tailwind 4 et les composants shadcn/ui, rangés dans `packages/ui`, pour toutes ses interfaces (ADR-0001, étape P4, et ADR-0006). Tailwind est une bibliothèque qui décrit l'apparence avec de petites classes CSS prêtes à l'emploi. shadcn/ui est un ensemble de composants (boutons, champs, fenêtres) construits avec Tailwind.

Les pages du hub, faites aux cartes 120 et 127, n'utilisent pas encore ces outils. Elles ont un CSS écrit à la main (`apps/hub/app/globals.css`), qui recopie les couleurs du thème par défaut. Cela fait deux styles à maintenir. Le hub n'a pas non plus les composants communs, par exemple la fenêtre de confirmation avant la suppression du compte.

## Action

- Ajouter au hub `tailwindcss` et `@tailwindcss/postcss`, dans la même version que le site (4.1.11). Ajouter aussi `@bbfrance/ui` comme dépendance du paquet. Créer `apps/hub/postcss.config.mjs` sur le modèle de `apps/site/postcss.config.mjs`.
- Créer le point d'entrée CSS du hub : la partie « thème » de Tailwind, `@bbfrance/ui/tokens.css`, puis le thème par défaut seul (`packages/ui/src/themes/default.css`). Le coach ne peut pas choisir de thème sur le hub (ADR-0007).
  - Le hub n'a pas d'ancien CSS. Le *preflight*, la remise à zéro des styles du navigateur par Tailwind, peut donc être activé dès maintenant.
- Refaire les pages avec les composants de `packages/ui` (`Button`, `Card`, `Field`, `ConfirmDialog`, `Avatar`…) :
  - `app/page.tsx` et les composants de `app/passport/` (le passeport) ;
  - `app/consent/` (l'écran de consentement) ;
  - `app/sign-in/` (la connexion).
- Supprimer les styles écrits à la main de `apps/hub/app/globals.css`.
- **Ne rien modifier dans `packages/ui`.** Une autre session y travaille (refonte du site). S'il manque un composant, le signaler et proposer une carte à part.
- Le hub reste indépendant : `packages/ui` est un paquet commun du projet, pas une application. Aucun lien ni texte ne doit renvoyer vers le site.
- Mettre à jour `apps/hub/CLAUDE.md` et `docs/features/hub/README.md` (apparence du hub).
- Vérifier en taille téléphone (375 pixels de large) : lisible sans zoom, boutons d'au moins 44 pixels, pas de défilement horizontal. Garder les tests existants des pages du passeport, en adaptant leurs sélecteurs si besoin.

## Résultat

- **Installation** : `@bbfrance/ui`, `tailwindcss` et `@tailwindcss/postcss` (4.1.11, comme le site) ajoutés au hub ; `postcss.config.mjs` ; `transpilePackages` dans `next.config.ts`.
- **CSS** : `app/globals.css` ne contient plus que l'import de Tailwind (avec la remise à zéro des styles du navigateur), les variables de `packages/ui` et la couleur de fond de la page. Aucun attribut `data-theme` : le thème par défaut du site (Vestiaire) s'applique seul.
- **Pages** refaites avec `Card`, `Button`, `Field`, `Input`, `Select`, `Avatar` : passeport, connexion (y compris la connexion automatique) et consentement. Nouveaux petits composants du hub : `app/components/CenteredCard.tsx`, `app/components/Messages.tsx`, `app/passport/PassportSection.tsx`, `app/passport/ItemList.tsx`.
- **Rien n'a changé dans `packages/ui`.** `ConfirmDialog` n'est pas utilisé, parce qu'il n'est pas encore commité par la refonte du site : la confirmation reste celle du navigateur.
- **Tests** : `pnpm --filter @bbfrance/hub test:api` donne 36 tests verts, dont un nouveau qui vérifie la page de connexion à 375 pixels de large. Les captures en taille téléphone montrent une seule colonne, des boutons de 44 pixels et aucun défilement horizontal. Le test `test:sso` repère maintenant n'importe quel bouton du hub (et plus la classe `hub-button`) ; il n'a pas été relancé, pour ne pas gêner les tests de l'autre session.
