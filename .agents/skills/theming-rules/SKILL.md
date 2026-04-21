---
name: theming-rules
description: Règles de thèmes BBFrance. Variables CSS, Glassmorphism, Overrides, Mobile. Mode homme des cavernes.
---

# Thèmes BBFrance

## RÈGLES D'OR
- **ZÉRO COULEUR DUR.** Interdit : `#fff`, `red`. Utiliser : `var(--primary)`, `var(--foreground)`.
- **DATA-THEME.** Sélecteur : `[data-theme='name']`.
- **CSS LAYERS.** Priorité : `globals.css` (base) < `theme.xxx.css` (vars) < `page.css` (spécifique).

## VARIABLES SOCIALES (VARS CORE)
| Variable | Usage |
|----------|-------|
| `--background` | Fond de page. |
| `--bg-gradient` | Dégradé fond (`radial` ou `linear`). |
| `--foreground` | Texte principal. |
| `--primary` | Couleur d'accentuation (Red/Navy/etc). |
| `--accent` | Bordures nav/liserets. |
| `--text-muted` | Texte gris/désactivé. |

## GLASSMORPHISM
Propriété phare du site.
- `background: var(--glass-bg)` : Transparence floue.
- `backdrop-filter: blur(10px)` : Obligatoire pour l’effet verre.
- `border: 1px solid var(--glass-border)` : Contour subtil.
- `box-shadow: var(--glass-shadow)` : Profondeur.

## STRUCTURES GLOBALES (STANDARD)
Tous les thèmes partagent la même architecture visuelle via `globals.css`. Les thèmes ne définissent que les **variables**.
- **PageHeader :** `.page-header-container` (Layout Stripe avec `clip-path`).
- **BackButton :** `.back-button` (Bouton rond flottant type "token").
- **Cartes :** `.premium-card` (Standard Glassmorphism).
- **Inputs :** `.classic-select-field` (Standard Select).

## MOBILE (RESPONSIVE)
- Overrides mobiles dans `globals-mobile.css` ou blocs `@media (max-width: 768px)` dans le thème.
- Utiliser variables pour dimensions : `--back-btn-size`.

## Z-INDEX SCALE
Respecter l'échelle absolue de `globals.css` :
- `nav`: 5000
- `fab`: 6000
- `sidebar`: 7100
- `modal`: 8000
- `toast`: 9000

## AJOUTER THÈME
1. Créer `app/theme/theme.Nouveau.css`.
2. Définir variables dans `[data-theme='nouveau']`.
3. Pour changer le thème par défaut, utiliser `:root`.
4. Importer dans `app/theme/themes.css`.
