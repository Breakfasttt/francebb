---
name: ui-components
description: Composants d'interface de BBFrance (boutons, cartes, fenêtres, notifications, formulaires) et pièges connus. À lire avant toute modification d'interface.
---

# Composants d'interface BBFrance

Tous les chemins sont relatifs à `apps/site`. La liste complète de ce qui existe est dans le skill `reuse-first`. Les règles de couleurs sont dans `theming-rules`, l'affichage téléphone dans `mobile-ux`.

## Boutons : jamais de `<button>` brut

Chaque bouton passe par l'un de ces composants (`common/components/Button/`). Taille avec `size` (`xs`, `sm`, `md`, `lg`), icône Lucide avec `icon={<Icone size={18} />}`.

| Composant | Quand l'utiliser |
|---|---|
| `ClassicButton` | Action secondaire ou navigation (gris) |
| `CTAButton` | Action principale de la page : enregistrer, répondre (couleur vive) |
| `DangerButton` | Action destructrice : supprimer, bannir (rouge) |
| `AdminButton` | Action réservée aux modérateurs et admins (violet) |
| `BadgeButton` | Petit lien dans une colonne latérale |
| `ToggleButton` | Onglet ou bouton à deux états (prop `active`) |
| `ExplainButton` | Ouvre une aide ou une explication (doré) |

## Formulaires

- Listes déroulantes : `ClassicSelect`, jamais de `<select>` brut.
- Champs texte : `ClassicInput`.
- **Piège des actions serveur dans un formulaire** : dans un composant serveur, ne jamais écrire `<form action={async (fd) => monAction(id, fd)}>`. Une fonction créée sur place ne peut pas être envoyée au navigateur, et cela provoque une erreur à l'exécution. Utiliser `.bind()` :
  ```tsx
  const actionAvecId = monAction.bind(null, id);
  return <form action={actionAvecId}>…</form>;
  ```

## Conteneurs et éléments courants

- `PremiumCard` : carte à effet verre dépoli. Toujours lui donner une marge intérieure (1,25 à 1,5 rem), sinon le contenu touche les bords.
- `TabSystem` : onglets. `Pagination` : pagination avec saisie du numéro de page.
- `StatusBadge` : pastille d'état (`primary`, `danger`, `banned`).
- `TagSelector` : saisie d'étiquettes (validation par la touche Entrée).
- `UserAvatar` : avatar du membre avec le cadre de son rang.
- `BBCodeEditor` (écrire un message) et `BBCodeContent` (afficher un message).

## Fenêtres et notifications

- Pour confirmer une action : `ConfirmModal` ou `Modal`. **Jamais `window.alert` ni `window.confirm`.**
- Fenêtre spécifique : utiliser la base `Dialog`, `DialogOverlay`, `DialogContent` et `DialogTitle` de `@bbfrance/ui`. Le paramètre `asChild` permet de garder son propre CSS. Ne pas recréer une fenêtre à la main avec `createPortal`. La base gère la touche Échap, le focus clavier et l'accessibilité.
- Notifications : `import { toast } from "@bbfrance/ui"`, puis `toast.success("…")` ou `toast.error("…")`. Aucune autre bibliothèque.
- `Tooltip` (bulle d'aide au survol) : dans un conteneur en `overflow: hidden` (comme `PremiumCard`), la bulle est coupée. Mettre le parent en `overflow: visible`.

## Sur téléphone

Chaque composant ajouté ou modifié est vérifié en taille téléphone (skill `mobile-ux`) : boutons d'au moins 44 pixels de haut, pas de débordement horizontal.
