---
name: theming-rules
description: Règles des 8 thèmes visuels de BBFrance - variables de couleur v2, verre dépoli, dégradé de fond, ordre d'affichage (z-index), ajout d'un thème. À lire avant de toucher aux couleurs ou au CSS.
---

# Thèmes visuels BBFrance

Le coach choisit l'un des **8 thèmes** du site : vestiaire (thème par défaut), saison3, naf, default (« Sombre »), light, blood, malpierre, nehekhara. Leur liste officielle (identifiant et nom affiché) est dans `apps/site/lib/themes.ts`. Le thème actif est indiqué par l'attribut `data-theme` sur la balise `<html>`.

Les couleurs de chaque thème sont dans `packages/ui/src/themes/<id>.css`, importés par `themes/index.css` puis par `packages/ui/src/tokens.css`. Vestiaire est aussi posé sur `:root` : c'est lui qui s'applique sans attribut `data-theme` (le hub, par exemple). Ces variables sont dites **v2** (préfixe `--bb-`) ; ce sont les seules. Les anciennes (`--primary`, `--card-bg`, `--glass-border`…) n'existent plus : ne pas les réécrire.

## Règle d'or : aucune couleur écrite en dur

Interdit : `#fff`, `red`, `rgb(…)` dans le CSS ou le code d'un écran. On utilise une classe Tailwind de variable v2 (`bg-bb-surface`, `text-bb-text-muted`, `border-bb-border`) ou, dans un fichier CSS, `var(--bb-…)`. ESLint refuse une couleur hexadécimale dans un `.tsx`.

Exceptions : les couleurs de jeu de BBScheme (terrain, pions, bulle d'infos d'un pion, dans `packages/bbscheme-player`), les cadres de rang de `UserAvatar.css` et les pastilles d'aperçu de `ThemePicker.css` (chacune montre un autre thème que le thème actif).

## Variables v2

| Variable | Classe Tailwind | Usage |
|---|---|---|
| `--bb-bg` | `bg-bb-bg` | Fond de la page |
| `--bb-bg-image` | — | Léger dégradé posé sur le fond (facultatif ; seuls les 7 thèmes historiques en ont un) |
| `--bb-surface` | `bg-bb-surface` | Cartes, panneaux, fenêtres |
| `--bb-surface-2` | `bg-bb-surface-2` | Zones en relief : champ de saisie, citation, bouton secondaire |
| `--bb-border` | `border-bb-border` | Bordures et séparateurs |
| `--bb-text` | `text-bb-text` | Texte principal |
| `--bb-text-muted` | `text-bb-text-muted` | Texte secondaire, toujours lisible (contraste AA) |
| `--bb-accent`, `--bb-accent-hover` | `bg-bb-accent` | Fond des boutons principaux |
| `--bb-on-accent` | `text-bb-on-accent` | Texte posé sur l'accent |
| `--bb-accent-text` | `text-bb-accent-text` | Texte ou icône d'accent posé sur un fond (liens) |
| `--bb-accent-soft` | `bg-bb-accent-soft` | Fond léger d'un élément actif |
| `--bb-danger`, `--bb-on-danger`, `--bb-danger-text` | `bg-bb-danger`… | Action destructrice, erreur |
| `--bb-success-text`, `--bb-warning-text` | `text-bb-success-text`… | Réussite, alerte |
| `--bb-unread`, `--bb-rank` | `text-bb-unread`… | Non-lu du forum, cadre de rang |
| `--bb-focus` | `outline-bb-focus` | Contour du focus clavier |
| `--bb-nav-bg`, `--bb-nav-border`, `--bb-nav-text`, `--bb-nav-active` | `bg-bb-nav-bg`… | Barres de navigation |
| `--bb-overlay` | `bg-bb-overlay` | Fond derrière une fenêtre |
| `--bb-shadow` | `shadow-bb` | Ombre des panneaux flottants |
| `--bb-glass-blur` | — | Verre dépoli : `0px` = désactivé (voir plus bas) |
| `--bb-scheme` | — | `light` ou `dark` : couleurs des contrôles natifs du navigateur |

Valeurs communes à tous les thèmes : `--bb-radius-sm|md|lg|full` (`rounded-bb-md`…), `--bb-tap` (44 px), `--bb-font-sans` (`font-bb-sans`, la police du site servie par `next/font/local`). Les noms shadcn (`bg-primary`, `text-muted-foreground`, `border-border`…) restent disponibles pour les variantes historiques de `Button` (`default`, `outline`, `ghost`, `destructive`, encore utilisées par le lecteur BBScheme) : `tokens.css` les relie aux variables v2. Le nouveau code utilise les classes `bb-`.

Un test (`apps/site/tests/e2e/contraste.spec.ts`) vérifie dans chaque thème que chaque paire texte et fond atteint le contraste AA.

## Le verre dépoli

Désactivé par défaut, parce qu'il ralentit les téléphones modestes. Un thème l'active en donnant une valeur à `--bb-glass-blur` (aujourd'hui seul « Sombre », `10px`). Un composant l'utilise avec `backdrop-blur-[var(--bb-glass-blur)]` (prop `glass` de `Card`), jamais avec un flou écrit en dur.

## Où écrire le style

- Les écrans s'écrivent en classes Tailwind. Pas de `page.css` ni de feuille réservée au téléphone ; seules exceptions, `page.css` et `page-mobile.css` des mentions légales, en attendant la réécriture de cette page par le chantier RGPD (voir la fiche `pages-diverses`).
- `apps/site/app/tailwind.css` : point d'entrée (preflight de Tailwind actif, variables, utilitaires).
- `apps/site/app/globals.css` : fond de page, échelle des superpositions, animation commune.
- `apps/site/common/components/BBCodeContent/bbcode.css` : la seule feuille du rendu BBCode (spoiler, accordéon, galerie).
- Un composant garde un fichier CSS seulement pour ce que Tailwind exprime mal (sélecteurs `:has()`, animations, cadres de rang) : `AppShell.css`, `MorePanel.css`, `ThemePicker.css`, `UserAvatar.css`, `app/bbscheme/component/Dugout.css`, et les feuilles du lecteur `packages/bbscheme-player`. Ces fichiers n'utilisent que des `var(--bb-…)`.
- Le preflight de Tailwind (remise à zéro des styles du navigateur) est actif : un titre, une liste ou un paragraphe n'a ni taille ni marge tant qu'on ne lui en donne pas par des classes.

**Piège du cache de Turbopack.** Après un changement des `@import` ou des couches de `tailwind.css` (ou de `tokens.css`), le serveur de développement peut continuer à servir l'ancienne feuille compilée. Arrêter le serveur, supprimer le dossier `apps/site/.next/dev`, puis relancer. Turbopack est l'outil qui compile le site pendant le développement ; `.next/dev` est son cache.

## Superposition des éléments (z-index)

L'ordre de superposition est fixé dans `globals.css` (variables `--z-index-*`). Un nouvel élément prend l'une de ces valeurs, jamais un nombre au hasard :

| Élément | Valeur |
|---|---|
| Barre d'actions collée en bas par une page (sujet du forum) | 4000 |
| Barre du haut, barre basse, pied de page de l'ordinateur | 5000 |
| Bandeau des cookies | 6000 |
| Panneau « Plus » (fond, panneau) | 7000, 7100 |
| Fenêtres et panneaux de `@bbfrance/ui` (`Sheet`, `Dialog`, `Popover`, `ActionMenu`) | 8000, 8001 |
| Bulle d'aide (`Tooltip`), avis de suppression du forum | 9000 |
| Notifications (`toast`) | au-dessus de tout (valeur propre à la bibliothèque sonner) |

## Téléphone

Seuil unique : `max-lg:` (jusqu'à 1024 px) et `lg:` (à partir de 1025 px), voir le skill `mobile-ux`. Tout changement de thème est vérifié en taille téléphone, dans les 8 thèmes.

## Ajouter un thème

1. Créer `packages/ui/src/themes/<id>.css` en copiant un thème existant (pour n'oublier aucune variable), sous `[data-theme="<id>"]`.
2. L'importer dans `packages/ui/src/themes/index.css`.
3. Ajouter son identifiant et son nom à `apps/site/lib/themes.ts` (inscription, profil, contrôle de l'action `updateTheme`).
4. Ajouter sa pastille dans `apps/site/common/components/AppShell/ThemePicker.css`.
5. Lancer `contraste.spec.ts` et `visual-themes.spec.ts`.
