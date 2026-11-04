---
name: ui-components
description: Composants d'interface de BBFrance (boutons, cartes, fenêtres, notifications, formulaires) et pièges connus. À lire avant toute modification d'interface.
---

# Composants d'interface BBFrance

Tous les chemins sont relatifs à `apps/site`. La liste complète de ce qui existe est dans le skill `reuse-first`. Les règles de couleurs sont dans `theming-rules`, l'affichage sur téléphone dans `mobile-ux`.

Un écran s'écrit avec les composants de `@bbfrance/ui` (`packages/ui`) et des classes Tailwind sur les variables v2 (`bg-bb-surface`, `text-bb-text-muted`…). Il n'y a pas de fichier CSS de page.

## Boutons : jamais de `<button>` brut

Chaque bouton est le `Button` de `@bbfrance/ui`. ESLint refuse un `<button>` ou un `<select>` natif dans un fichier `.tsx` (règle `react/forbid-elements`, voir `ARCHITECTURE.md`).

| Variante | Quand l'utiliser |
|---|---|
| `primary` | Action principale de la page : enregistrer, répondre |
| `secondary` | Action secondaire ou navigation |
| `quiet` | Action discrète (icône, croix de fermeture) |
| `danger` | Action destructrice : supprimer, bannir |

Taille `tap` (44 pixels de haut) ou `tap-icon` (carré de 44 pixels, avec un `aria-label`). `asChild` pour habiller un `Link` de Next.js. Les variantes `default`, `outline`, `ghost`, `destructive` et les tailles `sm`, `md`, `icon` viennent de shadcn : ne pas les choisir pour du nouveau code (trop petites sur téléphone).

## Formulaires

- `Field`, `Label`, `Input`, `Textarea`, `Select` de `@bbfrance/ui` : texte en 16 pixels (pas de zoom automatique sur iPhone), 44 pixels de haut.
- Formulaire envoyé à une action serveur qui renvoie `ActionResult` : `Form/ActionForm` (le refus s'affiche dans une notification, les champs restent remplis).
- Recherche d'un membre ou d'une ligue : `UserSearch`, `UserMapper`, `LigueSearch`, `MultiLigueSearch` (`common/components`). Saisie d'étiquettes : `TagSelector` (validation par la touche Entrée).
- **Piège des actions serveur dans un formulaire** : dans un composant serveur, ne jamais écrire `<form action={async (fd) => monAction(id, fd)}>`. Une fonction créée sur place ne peut pas être envoyée au navigateur, et cela provoque une erreur à l'exécution. Utiliser `.bind()` :
  ```tsx
  const actionAvecId = monAction.bind(null, id);
  return <form action={actionAvecId}>…</form>;
  ```

## Conteneurs et éléments courants

- `Card` (et `CardHeader`, `CardTitle`, `CardBody`, `ListRow`) : surface pleine du thème ; la prop `glass` active le verre dépoli seulement si le thème le permet.
- Onglets : `Tabs` (dans la page) ou `LinkTabs` (liés à l'adresse, `?tab=`) ; pagination : `PageNav` ; étiquette : `Badge` ; compteur : `CountBadge`.
- Liste vide ou chargement : `EmptyState`, `Skeleton`.
- Avatar : `UserAvatar` (avec le cadre du rang du membre), `MemberAvatarImage` (petite image, avatar par défaut si le membre n'en a pas), `Avatar` de `@bbfrance/ui` (initiale ou image simple).
- Messages : `BBCodeEditor` (écrire) et `BBCodeContent` (afficher). Le style des blocs BBCode est dans une seule feuille, `common/components/BBCodeContent/bbcode.css`.
- Preflight actif : un titre (`h1`…`h6`), une liste ou un paragraphe n'a ni taille ni marge par défaut ; les donner par des classes.
- Icônes : `lucide-react` uniquement, avec `aria-hidden="true"` quand un texte les accompagne.

## Panneaux, fenêtres et notifications

- **Panneau qui monte du bas, tiroir ou fenêtre centrée** : `Sheet` et `SheetContent` (`side` vaut `bottom`, `right` ou `center` ; `title` obligatoire, annoncé aux lecteurs d'écran).
- **Confirmer une action** : `ConfirmDialog` (panneau du bas sur téléphone, fenêtre centrée sur ordinateur ; `danger` pour une action destructrice). **Jamais `window.alert` ni `window.confirm`.** `Modal` et `ConfirmModal` (`common/components`) restent pour les quelques écrans qui les utilisent encore ; ne pas les choisir pour un nouvel écran.
- **Menu « ⋯ » d'actions secondaires** : `ActionMenu` (panneau sur téléphone, liste déroulante sur ordinateur). Petit panneau sous un bouton, sur ordinateur : `Popover`.
- **Fenêtre spécifique** : la base `Dialog`, `DialogOverlay`, `DialogContent` et `DialogTitle` de `@bbfrance/ui`. Ne pas recréer une fenêtre à la main avec `createPortal` : la base gère la touche Échap, le focus clavier et l'accessibilité.
- **Pas de portail React dans le code du projet** (carte 156) : `createPortal` est interdit dans `apps/` et dans le code écrit à la main de `packages/ui`. Un portail dessine un composant ailleurs que là où il est écrit, ce qui rend le code difficile à suivre. Seuls les composants Radix (`Dialog`, `Sheet`, `Popover`, `Tooltip`, `ActionMenu`) gardent le portail interne de la bibliothèque.
- **Notifications** : `import { toast } from "@bbfrance/ui"`, puis `toast.success("…")` ou `toast.error("…")`. Aucune autre bibliothèque.
- **Bulle d'aide** : `Tooltip` de `@bbfrance/ui` (affichée dans un portail : elle n'est pas coupée par un parent en `overflow: hidden`).
- Sur téléphone, les notifications et le bandeau des cookies se posent au-dessus de la barre basse et d'une éventuelle barre d'actions de la page ; la coquille réserve leur place sous le contenu. Une page n'a pas à ajouter de marge pour eux.

## Sur téléphone

Chaque composant ajouté ou modifié est vérifié en taille téléphone (skill `mobile-ux`) : boutons d'au moins 44 pixels de haut, champs en 16 pixels, pas de défilement horizontal.
