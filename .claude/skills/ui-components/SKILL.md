---
name: ui-components
description: Composants d'interface de BBFrance (boutons, cartes, fenêtres, notifications, formulaires) et pièges connus. À lire avant toute modification d'interface.
---

# Composants d'interface BBFrance

Tous les chemins sont relatifs à `apps/site`. La liste complète de ce qui existe est dans le skill `reuse-first`. Les règles de couleurs sont dans `theming-rules`, l'affichage téléphone dans `mobile-ux`.

## Boutons : jamais de `<button>` brut

Chaque bouton est le `Button` de `@bbfrance/ui`. ESLint refuse un `<button>` ou un `<select>` natif dans un fichier `.tsx` (règle `react/forbid-elements`, voir `ARCHITECTURE.md`). Les anciens boutons du site (`ClassicButton`, `CTAButton`, `DangerButton`, `AdminButton`…) ont été supprimés par la carte 101.

| Variante | Quand l'utiliser |
|---|---|
| `primary` | Action principale de la page : enregistrer, répondre |
| `secondary` | Action secondaire ou navigation |
| `quiet` | Action discrète (icône, croix de fermeture) |
| `danger` | Action destructrice : supprimer, bannir |

Taille `tap` (44 pixels de haut) ou `tap-icon` (carré de 44 pixels, avec un `aria-label`). `asChild` pour habiller un `Link`.

## Formulaires

- `Field`, `Label`, `Input`, `Textarea`, `Select` de `@bbfrance/ui` (texte en 16 pixels, 44 pixels de haut).
- Recherche d'un membre ou d'une ligue : `UserSearch`, `UserMapper`, `LigueSearch`, `MultiLigueSearch` (`common/components`).
- **Piège des actions serveur dans un formulaire** : dans un composant serveur, ne jamais écrire `<form action={async (fd) => monAction(id, fd)}>`. Une fonction créée sur place ne peut pas être envoyée au navigateur, et cela provoque une erreur à l'exécution. Utiliser `.bind()` :
  ```tsx
  const actionAvecId = monAction.bind(null, id);
  return <form action={actionAvecId}>…</form>;
  ```

## Conteneurs et éléments courants

- `Card` (et `CardHeader`, `CardTitle`, `CardBody`, `ListRow`) de `@bbfrance/ui` : surface pleine du thème ; `glass` active le verre dépoli si le thème le permet.
- Onglets : `Tabs` ou `LinkTabs` ; pagination : `PageNav` ; étiquette : `Badge`, compteur : `CountBadge` (chiffre en 12 pixels).
- `TagSelector` : saisie d'étiquettes (validation par la touche Entrée).
- `UserAvatar` : avatar du membre avec le cadre de son rang ; `Avatar` de `@bbfrance/ui` pour un avatar simple.
- `BBCodeEditor` (écrire un message) et `BBCodeContent` (afficher un message). Le style des blocs BBCode est dans une seule feuille, `common/components/BBCodeContent/bbcode.css`.
- Preflight actif : un titre (`h1`…`h6`), une liste ou un paragraphe n'a ni taille ni marge par défaut ; les donner par des classes.

## Fenêtres et notifications

- Pour confirmer une action : `ConfirmDialog` de `@bbfrance/ui` (ou, sur les écrans qui l'utilisent déjà, `ConfirmModal` et `Modal`, restylés en variables v2). **Jamais `window.alert` ni `window.confirm`.**
- Fenêtre spécifique : utiliser la base `Dialog`, `DialogOverlay`, `DialogContent` et `DialogTitle` de `@bbfrance/ui`. Le paramètre `asChild` permet de garder son propre CSS. Ne pas recréer une fenêtre à la main avec `createPortal`. La base gère la touche Échap, le focus clavier et l'accessibilité.
- Notifications : `import { toast } from "@bbfrance/ui"`, puis `toast.success("…")` ou `toast.error("…")`. Aucune autre bibliothèque.
- `Tooltip` de `@bbfrance/ui` (bulle d'aide au survol, affichée dans un portail : elle n'est pas coupée par un parent en `overflow: hidden`).
- Sur téléphone, les notifications et le bandeau des cookies se posent au-dessus de la barre basse ; la coquille réserve leur place sous le contenu (`--app-toast-space`, `--app-cookie-space` dans `AppShell.css`). Une page n'a pas à ajouter de marge pour eux.

## Sur téléphone

Chaque composant ajouté ou modifié est vérifié en taille téléphone (skill `mobile-ux`) : boutons d'au moins 44 pixels de haut, pas de débordement horizontal.
