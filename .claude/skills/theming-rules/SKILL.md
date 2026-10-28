---
name: theming-rules
description: Règles des 7 thèmes visuels de BBFrance - variables de couleur, effet verre dépoli, ordre d'affichage (z-index), ajout d'un thème. À lire avant de toucher aux couleurs ou au CSS.
---

# Thèmes visuels BBFrance

Le coach choisit l'un des **7 thèmes** du site : default, light, blood, malpierre, nehekhara, saison3, naf. Fichiers : `apps/site/app/theme/theme.<nom>.css`, importés par `themes.css`. Le thème actif est indiqué par l'attribut `data-theme` sur la balise `<html>`.

## Règle d'or : aucune couleur écrite en dur

Interdit : `#fff`, `red`, `rgb(…)` dans le CSS ou le code. On utilise toujours une variable : `var(--primary)`, `var(--foreground)`. Chaque thème définit ses propres valeurs pour ces variables, donc une seule règle CSS s'adapte aux 7 thèmes.

## Variables principales

| Variable | Usage |
|---|---|
| `--background` | Fond de la page |
| `--bg-gradient` | Dégradé de fond |
| `--foreground` | Texte principal |
| `--primary` | Couleur d'accent (boutons principaux, titres) |
| `--accent` | Liserés et bordures de navigation |
| `--text-muted` | Texte secondaire ou désactivé |
| `--card-bg`, `--glass-bg`, `--glass-border`, `--glass-shadow` | Cartes et effet verre |
| `--danger`, `--success`, `--warning` | États (erreur, réussite, alerte) |

Noms de variables explicites : `--nav-bg`, jamais d'abréviation comme `--nv-b`.

Les composants de `packages/ui` utilisent les mêmes couleurs sous leurs noms Tailwind (`bg-primary`, `text-muted-foreground`…), reliés aux variables ci-dessus par `packages/ui/src/tokens.css`.

## L'effet « verre dépoli » (glassmorphism)

C'est le style visuel du site :
```css
background: var(--glass-bg);
backdrop-filter: blur(10px);   /* indispensable pour l'effet de flou */
border: 1px solid var(--glass-border);
box-shadow: var(--glass-shadow);
```

## Ordre de priorité du CSS

`globals.css` (base commune) est appliqué d'abord, puis `theme.<nom>.css` (les variables), puis le `page.css` de la page. Les thèmes ne définissent **que des variables** : la mise en page est commune à tous (`.page-header-container`, `.back-button`, `.premium-card`, `.classic-select-field` dans `globals.css`).

## Superposition des éléments (z-index)

Valeurs fixées dans `globals.css`, à respecter :

| Élément | Valeur |
|---|---|
| Barre de navigation | 5000 |
| Bouton flottant | 6000 |
| Menu latéral | 7100 |
| Fenêtres | 8000 |
| Notifications | 9000 |

## Téléphone

Les ajustements pour téléphone vont dans `globals-mobile.css`, dans le `page-mobile.css` de la page, ou dans un bloc `@media (max-width: 768px)`. Tout changement de thème est vérifié en taille téléphone, dans les 7 thèmes.

## Ajouter un thème

1. Créer `app/theme/theme.<nom>.css`.
2. Y définir toutes les variables dans `[data-theme='<nom>']` (copier un thème existant pour n'en oublier aucune).
3. L'importer dans `app/theme/themes.css`.
4. Le thème par défaut est celui de `:root` (`theme.default.css`).
