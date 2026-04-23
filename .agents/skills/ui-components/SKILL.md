---
name: ui-components
description: Guide UI BBFrance. Composants, thèmes, archi. Mode homme des cavernes.
---

# UI BBFrance

## GLOBAUX (`common/components/`)
- `PremiumCard`: Conteneur Glassmorphism. **TOUJOURS inclure un padding interne (ex: 1.25rem - 1.5rem)** pour éviter que le contenu ne touche les bords.
- `TabSystem`: Navigation onglets.
- `StatusBadge`: Couleurs (`primary`, `danger`, `banned`).
- `TagSelector`: Touche Entrée, pas de virgules.
- `UserAvatar`: Avatar + Cadre de rang.
- `BBCodeEditor`: Éditeur forum.
- `Pagination`: Input numéro inclus.

## BOUTONS (PAS DE `<button>` NATIF)
Utiliser `size` (`xs`, `sm`, `md`), icônes `lucide-react` (ex: `icon={<Icon size={18} />}`).
- `ClassicButton`: Navigation, gris, normal.
- `CTAButton`: Brillant, vif. Action principale (Sauver, Répondre).
- `DangerButton`: Rouge. Destructeur (Supprimer, Bannir).
- `AdminButton`: Violet. Modo/Admin seulement.
- `BadgeButton`: Minuscule. Liens dans sidebars.
- `ToggleButton`: États/Onglets. Change visuel si `active`.
- `ExplainButton`: Jaune/Or. Tooltips/Aide.

## MODALES & POPUPS
- `ConfirmModal` / `Modal`: TOUJOURS utiliser pour confirmer. **PAS DE `window.alert` ni `window.confirm`**.
- `Toast`: Notifications.
- `Tooltip`: Info au survol. **ATTENTION**: Si utilisé dans un conteneur avec `overflow: hidden` (ex: `PremiumCard`), s'assurer que le parent direct ou la carte a `overflow: visible` pour éviter que la bulle ne soit coupée.

## SYSTÈME DE THÈMES (`app/theme/`)
- **NE JAMAIS CODER HEX/RGB EN DUR.** TOUJOURS variables CSS.
- Vars princ: `--primary`, `--accent`, `--glass-border`, `--card-bg`, `--foreground`, `--text-muted`.
- Thèmes custom existent. Glassmorphism utilise `--glass-bg`.
- Préfixes explicites (`--nav-bg` pas `--nv-b`).
