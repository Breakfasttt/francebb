---
name: ui
description: Tout ce qu'il faut pour toucher à l'interface de FranceBB - où ranger un fichier, composants (boutons, formulaires, fenêtres, notifications), affichage téléphone et ordinateur (seuil de 1024 pixels, coquille, filtres, plein écran), 5 thèmes et variables de couleur v2, z-index. À lire avant toute modification d'interface, de CSS ou de couleur, et avant de créer un fichier.
---

# Interface de FranceBB

Les chemins sont relatifs à `apps/site`, sauf mention contraire. Ce skill dit **comment** faire (fichiers, variables, coquille, technique). **Le goût et la grammaire des écrans sont dans `DESIGN.md`** (racine du dépôt) : le lire avant toute modification d'interface. L'inventaire de ce qui existe déjà est dans le skill `reuse-first` : le lire avant de créer un composant.

**Règle absolue du projet** : le site doit être impeccable sur téléphone **et** sur ordinateur. La plupart des coachs utilisent un téléphone. On écrit d'abord pour le téléphone, sans rien casser sur ordinateur.

## 1. Où ranger un fichier

| Besoin | Emplacement |
|---|---|
| Nouvelle page | `app/<adresse>/page.tsx` (`app/classement/` = `/classement`), avec `actions.ts` si elle lit ou modifie des données |
| Composant d'une seule rubrique | `app/<rubrique>/component/<Nom>.tsx` |
| Composant utilisé par au moins deux rubriques | `common/components/<Nom>/<Nom>.tsx`, puis une ligne dans `reuse-first` |
| Composant partagé entre applications | `packages/ui/src/<nom>.tsx` (minuscules et tirets, comme shadcn), exporté par `src/index.ts` |
| Lecteur, terrain, pions BBScheme | `packages/bbscheme-player/src/` |
| Fonction serveur (base, droits, mail) | `lib/` |
| Petite fonction ou hook navigateur | `common/utils/`, `common/hooks/` |
| Script ponctuel | `scripts/`, supprimé après usage |

Noms : composants du site en `PascalCase` (`UserAvatar.tsx`), autres fichiers en `camelCase` (`forumAccess.ts`). Code en anglais, commentaire d'en-tête du fichier en français (une ou deux phrases sur son rôle).

## 2. Où écrire le style

- **Classes Tailwind dans le `.tsx`**. Pas de `page.css`, pas de fichier `-mobile.css`. Seule exception : `page.css` et `page-mobile.css` des mentions légales, en attendant leur réécriture.
- Un fichier `<Nom>.css` à côté d'un composant seulement pour ce que Tailwind exprime mal (sélecteurs `:has()`, animations, cadres de rang) : `AppShell.css`, `MorePanel.css`, `ThemePicker.css`, `UserAvatar.css`, les feuilles de `packages/bbscheme-player`. Ces fichiers n'utilisent que des `var(--bb-…)`.
- `app/tailwind.css` : point d'entrée (variables, utilitaires). `app/globals.css` : fond de page, z-index, animation commune. `common/components/BBCodeContent/bbcode.css` : la seule feuille du rendu BBCode.
- **Preflight actif** (remise à zéro des styles du navigateur) : un titre, une liste ou un paragraphe n'a ni taille ni marge tant qu'on ne lui en donne pas par des classes.
- **Piège du cache de Turbopack** (l'outil qui compile le site en développement) : après un changement des `@import` ou des couches de `tailwind.css` ou de `tokens.css`, le serveur peut servir l'ancienne feuille. Arrêter le serveur, supprimer `apps/site/.next/dev`, relancer.

## 3. Couleurs et thèmes

### Les 5 thèmes

Saison 3 (`saison3`, par défaut depuis le 22/11/2026), Sombre (`vestiaire`), NAF, Néhékhara et Violet (`elfes-noirs`).

- **Source unique : `packages/ui/src/themes/themeData.mjs`.** `corepack pnpm themes:build` (racine) génère les fichiers `themes/<id>.css`, `themes/index.css`, `themes/themeList.ts` et la liste lue par le site (`lib/themes.ts`). Ne jamais modifier ces fichiers générés à la main.
- Ne jamais changer l'identifiant d'un thème existant : il est enregistré dans le profil des membres. Un identifiant inconnu retombe sur le thème par défaut.
- `saison3` est aussi posé sur `:root` : il s'applique sans attribut `data-theme` (le hub, par exemple).

**Ajouter un thème** : une entrée dans `themeData.mjs` (`id` définitif en minuscules et tirets, `label`, `base` avec `scheme` `dark` ou `light`, `bg`, `surface`, `accent`, et au besoin `text`, `unread`, `rank`, `navBg`, `danger`, `bgImage`). Le script calcule le reste et corrige le contraste. Puis `themes:build`, le test `tests/e2e/contraste.spec.ts`, et une relecture à l'œil sur téléphone (le calcul garantit la lisibilité, pas la beauté). Le sélecteur `ThemePicker` lit la liste générée : rien d'autre à modifier.

### Aucune couleur écrite en dur

Interdit : `#fff`, `red`, `rgb(…)` dans le code d'un écran ou son CSS. On utilise une classe de variable v2 (`bg-bb-surface`, `text-bb-text-muted`) ou `var(--bb-…)`. ESLint refuse une couleur hexadécimale dans un `.tsx`.

Exceptions : couleurs de jeu de BBScheme (terrain, pions, bulle d'infos d'un pion), cadres de rang de `UserAvatar.css`, pastilles d'aperçu de `ThemePicker.css`.

### Variables v2 (préfixe `--bb-`, les seules qui existent)

Les anciennes (`--primary`, `--card-bg`, `--glass-border`…) n'existent plus : ne pas les réécrire.

| Variable | Classe Tailwind | Usage |
|---|---|---|
| `--bb-bg` | `bg-bb-bg` | Fond de la page |
| `--bb-bg-image` | — | Léger dégradé sur le fond (facultatif) |
| `--bb-surface` | `bg-bb-surface` | Cartes, panneaux, fenêtres |
| `--bb-surface-2` | `bg-bb-surface-2` | Zones en relief : champ, citation, bouton secondaire |
| `--bb-border` | `border-bb-border` | Bordures, séparateurs |
| `--bb-text` | `text-bb-text` | Texte principal |
| `--bb-text-muted` | `text-bb-text-muted` | Texte secondaire, toujours lisible (contraste AA) |
| `--bb-accent`, `--bb-accent-hover` | `bg-bb-accent` | Fond des boutons principaux |
| `--bb-on-accent` | `text-bb-on-accent` | Texte posé sur l'accent |
| `--bb-accent-text` | `text-bb-accent-text` | Texte ou icône d'accent sur un fond (liens) |
| `--bb-accent-soft` | `bg-bb-accent-soft` | Fond léger d'un élément actif |
| `--bb-danger`, `--bb-on-danger`, `--bb-danger-text` | `bg-bb-danger`… | Action destructrice, erreur |
| `--bb-success-text`, `--bb-warning-text` | `text-bb-success-text`… | Réussite, alerte |
| `--bb-unread`, `--bb-rank` | `text-bb-unread`… | Non-lu du forum, cadre de rang |
| `--bb-focus` | `outline-bb-focus` | Contour du focus clavier |
| `--bb-nav-bg`, `--bb-nav-border`, `--bb-nav-text`, `--bb-nav-active` | `bg-bb-nav-bg`… | Barres de navigation |
| `--bb-overlay` | `bg-bb-overlay` | Fond derrière une fenêtre |
| `--bb-shadow` | `shadow-bb` | Ombre des panneaux flottants |
| `--bb-glass-blur` | — | Verre dépoli (`0px` = désactivé) |
| `--bb-scheme` | — | `light` ou `dark` : couleurs des contrôles natifs |

Communes à tous les thèmes : `--bb-radius-sm|md|lg|full` (`rounded-bb-md`…), `--bb-tap` (44 px), `--bb-font-sans` (`font-bb-sans`). Les noms shadcn (`bg-primary`, `text-muted-foreground`…) restent reliés aux variables v2 pour les anciennes variantes de `Button`, encore utilisées par le lecteur BBScheme ; le nouveau code utilise les classes `bb-`.

Le test `tests/e2e/contraste.spec.ts` vérifie le contraste AA de chaque paire texte et fond dans chaque thème.

**Verre dépoli** : désactivé par défaut, parce qu'il ralentit les téléphones modestes. Seul « Sombre » l'active (`--bb-glass-blur: 10px`). Un composant l'utilise avec `backdrop-blur-[var(--bb-glass-blur)]` (prop `glass` de `Card`), jamais avec un flou écrit en dur.

### Superposition (z-index)

Fixée dans `globals.css` (variables `--z-index-*`). Un nouvel élément prend l'une de ces valeurs, jamais un nombre au hasard.

| Élément | Valeur |
|---|---|
| Contenu de page au-dessus des autres (`--z-index-base`, `--z-index-page-content`) | 1, 1100 |
| Listes déroulantes de recherche (`--z-index-dropdown`) | 1500 |
| Barre d'actions collée en bas par une page (`--z-index-page-bar`) | 4000 |
| Barre du haut, barre basse, pied de page ordinateur | 5000 |
| Écran plein écran du téléphone qui recouvre la barre basse (`--z-index-screen`) | 5001 |
| Bandeau des cookies | 6000 |
| Carte en plein écran (`--z-index-fullscreen`) | 6500 |
| Panneau « Plus » (fond, panneau) | 7000, 7100 |
| Fenêtres et panneaux de `@bbfrance/ui` (`Sheet`, `Dialog`, `Popover`, `ActionMenu`) | 8000, 8001 |
| `Tooltip`, avis de suppression du forum, barre de progression de la navigation | 9000 |
| Notifications (`toast`) | au-dessus de tout (valeur de sonner) |

## 4. Composants

Un écran s'écrit avec les composants de `@bbfrance/ui` (`packages/ui`). Inventaire complet : `reuse-first`.

### Boutons : jamais de `<button>` ni de `<select>` natif

ESLint les refuse dans un `.tsx` (règle `react/forbid-elements`). On utilise `Button` et `Select` de `@bbfrance/ui`.

| Variante | Usage |
|---|---|
| `primary` | Action principale : enregistrer, répondre |
| `secondary` | Action secondaire ou navigation |
| `quiet` | Action discrète (icône, croix de fermeture) |
| `danger` | Action destructrice : supprimer, bannir |

Taille `tap` (44 px de haut) ou `tap-icon` (carré de 44 px, avec `aria-label`). `asChild` pour habiller un `Link`. Les variantes shadcn `default`, `outline`, `ghost`, `destructive` et les tailles `sm`, `md`, `icon` ne servent pas au nouveau code (trop petites sur téléphone).

### Formulaires

- `Field`, `Label`, `Input`, `Textarea`, `Select` de `@bbfrance/ui` : texte en 16 px (sinon l'iPhone zoome sur le champ), 44 px de haut.
- Formulaire envoyé à une action serveur qui renvoie `ActionResult` : `Form/ActionForm` (refus en notification, champs gardés).
- Bouton d'envoi : `Form/SubmitButton` (se désactive et montre un indicateur pendant l'envoi ; évite le double envoi).
- **Erreur de saisie : sous le champ, jamais en notification.** `Field error="…"` affiche le texte sous le champ et pose `aria-invalid` et `aria-describedby`. Le curseur va au premier champ en erreur ; l'erreur s'efface dès la correction. Un contrôle qui n'est pas un champ (liste de boutons, recherche d'un membre) affiche un `<p role="alert">` dessous. Un formulaire qui affiche ses propres erreurs porte `noValidate`. La notification `toast.error` reste pour les refus du serveur qui ne visent pas un champ.
- Une zone de message sans libellé visible reçoit `ariaLabel` (`BBCodeEditor`).
- **Piège** : dans un composant serveur, jamais `<form action={async (fd) => monAction(id, fd)}>` (une fonction créée sur place ne peut pas être envoyée au navigateur). Utiliser `.bind()` :
  ```tsx
  const actionAvecId = monAction.bind(null, id);
  return <form action={actionAvecId}>…</form>;
  ```

### Panneaux, fenêtres, notifications

- Panneau qui monte du bas, tiroir, fenêtre centrée : `Sheet` + `SheetContent` (`side` = `bottom`, `left`, `right` ou `center` ; `title` obligatoire ; `left` est réservé au tiroir des rubriques, `SectionDrawer`).
- Confirmer une action : `ConfirmDialog` (`danger` si destructrice). **Jamais `window.alert` ni `window.confirm`.** `Modal` et `ConfirmModal` (`common/components`) restent pour les écrans existants, pas pour un nouvel écran.
- Menu « ⋯ » : `ActionMenu`. Petit panneau sous un bouton, sur ordinateur : `Popover` (sur téléphone : `Sheet`).
- Fenêtre sur mesure : la base `Dialog`, `DialogOverlay`, `DialogContent`, `DialogTitle` (gère Échap, focus clavier, accessibilité).
- **Pas de portail React** (`createPortal`) dans `apps/` ni dans le code écrit à la main de `packages/ui` : un portail dessine un composant ailleurs que là où il est écrit. Seuls les composants Radix (`Dialog`, `Sheet`, `Popover`, `Tooltip`, `ActionMenu`) gardent leur portail interne.
- Notifications : `import { toast } from "@bbfrance/ui"`, puis `toast.success("…")` ou `toast.error("…")`. Aucune autre bibliothèque.

### Éléments courants

- `Card` (`CardHeader`, `CardTitle`, `CardBody`, `ListRow`) ; prop `glass` pour le verre dépoli si le thème le permet.
- Onglets : `Tabs` (dans la page) ou `LinkTabs` (liés à l'adresse, `?tab=`) ; rubriques d'un écran sur téléphone : `SectionDrawer` (voir « Onglets ») ; pagination `PageNav` ; étiquette `Badge` ; compteur `CountBadge` ; liste vide ou chargement `EmptyState`, `Skeleton`.
- Avatar : `UserAvatar` (cadre du rang), `MemberAvatarImage` (petite image, avatar par défaut), `Avatar` de `@bbfrance/ui` (initiale).
- Messages : `BBCodeEditor` (écrire), `BBCodeContent` (afficher).
- Icônes : `lucide-react` uniquement, avec `aria-hidden="true"` quand un texte les accompagne.

## 5. Téléphone et ordinateur

### Ce que chaque écran respecte

- Pas de défilement horizontal de la page.
- Texte lisible sans zoom : rien sous 12 px.
- Boutons et liens d'au moins 44 px, assez espacés pour le pouce.
- Champs en 16 px au moins.
- Fenêtres, menus et listes qui s'ouvrent et se ferment sans bug.
- Lisible dans les 5 thèmes.
- Fluide : pas de saut de mise en page au chargement.
- **Ne rien casser sur ordinateur** : les règles du téléphone passent par `max-lg:`, celles réservées à l'ordinateur par `lg:`.

### Un seul seuil : 1024 pixels

Téléphone jusqu'à 1024 px (les tablettes ont donc l'affichage téléphone), ordinateur à partir de 1025 px.

- Tailwind : `max-lg:` et `lg:` (réglés dans `packages/ui/src/tokens.css`).
- JavaScript : `useMediaQuery(DESKTOP_QUERY)` de `@bbfrance/ui`, ou `useIsMobile()` de `common/hooks/useIsMobile.ts` (constante `MOBILE_BREAKPOINT`). Jamais d'autre valeur passée à `useIsMobile`, jamais `window.innerWidth <= …`.
- CSS de composant : `@media (max-width: 1024px)` et `@media (min-width: 1025px)` (le CSS ne lit pas de variable dans un `@media`).

Une autre largeur ne sert qu'à ajuster une grille (3 colonnes de cartes à 2, une marge). Jamais à masquer, déplacer ou remplacer une colonne, un onglet, un menu ou des filtres : entre deux seuils, une partie de l'interface deviendrait inaccessible.

### Mise en page

- **Toute page de liste ou de détail utilise `SiteLayout`** (`common/components/SiteLayout/SiteLayout.tsx`) : `header` (en-tête de page), `aside` (panneau gauche : action principale puis navigation de la rubrique, avec `PanelTitle` et `PanelLink`), contenu, `context` (colonne de droite à partir de 1440 px, ou 1025 px avec `contextFrom="lg"` pour un tableau de bord). Largeur bornée à 1760 px : la page utilise l'écran, jamais une colonne étroite centrée.
- Titres : voix Display (`font-bb-display`) pour le titre de page, voix Heading (`font-bb-heading`) pour les en-têtes de section, de tableau et de panneau (`CardTitle` l'applique déjà). Le texte des membres (titre de sujet, message) reste en casse normale.
- Sur téléphone, on empile en une colonne et on garde de l'air.
- Un tableau trop large passe en liste de cartes (exemple : `app/membres/component/MembersTable.tsx`) ou défile dans son propre cadre (`overflow-x-auto`), jamais la page entière.
- Un composant trop complexe à adapter : on simplifie son affichage sur téléphone.
- Une fonctionnalité vraiment impossible sur téléphone : message clair avec `EmptyState` (« Optimisé pour ordinateur ou tablette »). Aucune page dans ce cas aujourd'hui.

### La coquille (ce qui entoure chaque page)

`common/components/AppShell/` (`AppShell.tsx`, `MorePanel.tsx`, `navItems.ts`, `AppShell.css`).

- **Barre du haut** : le nom BBFRANCE composé en typographie (`SiteLogo`, sans image ni écusson), navigation en voix Heading sur ordinateur ; « Connexion » en bouton secondaire pour un visiteur (le rouge reste à l'action principale de la page) ; cloche des notifications avec pastille pour un membre.
- **Barre basse** : Accueil, Forum, Tournois, Messages, Plus. Un seul onglet allumé (`activeBottomTab` de `navItems.ts`) ; « Plus » l'est quand son panneau est ouvert ou que la page y est rangée. Elle se cache pendant la saisie (attribut `data-typing` sur `<html>`), et ne revient que 350 ms après la perte du focus, pour qu'un appui juste après la saisie ne soit pas décalé.
- **Panneau « Plus »** : profil ou connexion ; rubriques de `MORE_NAV` (ajouter une rubrique = une ligne dans `navItems.ts`, avec son `group`), rangées en trois groupes (`NAV_GROUPS`) ; modération et administration pour l'équipe ; choix du thème ; déconnexion ; pied de page. `membersOnly` réserve une rubrique aux membres connectés. Ni onglets ni filtres dans ce panneau.
- **Lien « Aller au contenu »** : premier élément, visible au focus clavier, vers `<main id="contenu">`.
- Une page n'envoie jamais de contenu dans la coquille. Ses outils secondaires restent dans la page : un bloc sur place ou un `Sheet` ouvert par un bouton de l'en-tête.
- La coquille réserve elle-même la place de la barre basse, du bandeau des cookies et des notifications (`--app-bottom-nav-space`, `--app-cookie-space`, `--app-toast-space`) : une page n'ajoute pas de marge pour eux.

### Barre d'actions collée en bas par une page

« Répondre » et pagination d'un sujet, barre d'envoi, saisie d'une conversation : la barre porte `data-page-bottom-bar`. La coquille réserve sa hauteur (`--app-page-bar-space`, 60 px) et fait monter notifications et cookies au-dessus. Sans valeur, la barre s'efface pendant la saisie ; avec `="always"`, elle reste (« Publier » à portée de pouce). Position : `bottom-[var(--app-bottom-nav-space)]`.

### Écrans plein écran

- **Écrans de rédaction** (répondre, modifier, nouveau sujet, tournois, ligues, articles, ressources, archives du classement) : la barre basse est retirée grâce à `isComposePath` de `navItems.ts`. **Une nouvelle adresse de rédaction doit y être ajoutée**, sinon la barre basse recouvre la barre d'envoi. Mise en page : `ComposeScreen` et `ComposeActionBar` (`app/forum/component/ComposeScreen.tsx`).
- **Plein écran sans adresse propre** (conversation ouverte par `?id=`, carte plein écran) : attribut `data-fullscreen` sur le cadre ; `AppShell.css` retire la barre basse et bloque le défilement derrière. Pour garder la saisie au-dessus du clavier, le cadre suit `window.visualViewport` (voir `app/messagerie/component/ConversationView.tsx`). Un plein écran ouvert par un bouton se ferme avec Échap et avec le bouton retour du téléphone : l'ouvrir fait un `window.history.pushState` que le retour retire (modèle : `app/carte/component/CarteClient.tsx`).

### Titre de page et bouton retour

`BackButton` (44 px) à gauche du titre **sur téléphone seulement** (`className="lg:hidden"`) : sur ordinateur, la navigation et le fil d'Ariane suffisent. `ForumListHeader` et `PageHeader` le font. Fiches d'un article ou d'une ligue : lien « Tous les articles » / « Toutes les ligues » au-dessus du contenu.

### Onglets

- **Sur téléphone, jamais de rangée d'onglets qui défile de côté** (`DESIGN.md`). Les rubriques d'un écran passent par `SectionDrawer` (`common/components/SectionDrawer/`) : une barre `lg:hidden` collée sous la barre du haut (`sticky top-14`) affiche la rubrique ouverte et le nombre de rubriques ; un appui ouvre un tiroir à gauche (`Sheet side="left"`, entre la barre du haut et la barre basse) avec toutes les rubriques, la rubrique ouverte marquée et un compteur facultatif (`count`). Une rubrique est un lien (`href`, avec `linkComponent` pour un `Link` sans retour en haut) ou une vue tenue par l'état (`onSelect`).
- Intégration : placer `SectionDrawer` en tête de la `<section>` du contenu, qui porte un `id` et `scroll-mt-14`, et passer cet `id` en `scrollTargetId` (après un choix, le début de la rubrique revient sous la barre si la page était défilée). Modèles : `app/profile/page.tsx` (liens), `app/classement/page.tsx` (vues), `StaffPageLayout` (modération, administration, avec compteurs).
- Sur ordinateur, les rubriques restent dans le panneau gauche (`PanelLink`) ou en `LinkTabs` au-dessus du contenu (fiche d'un membre).
- Deux ou trois onglets courts qui tiennent à 360 px sans défiler (résultats d'un tournoi : « Classement », « Matchs ») restent des `Tabs`.
- Test e2e sur téléphone : ouvrir la barre par son nom accessible (`/^Mon compte :/`, « <Titre> : <rubrique> »), puis choisir dans le dialogue du même titre.

### Filtres d'une liste

- Ordinateur : colonne « Filtres » à gauche des résultats, sous l'action principale de la rubrique. Recherche, tri et filtres sont **masqués quand la liste est vide** et qu'aucun filtre n'est posé.
- Téléphone : bouton « Filtres » au-dessus des résultats avec le nombre de filtres actifs (`CountBadge`), qui ouvre un `Sheet` (mêmes filtres, « Réinitialiser », « Voir N résultats ») ; chaque filtre actif rappelé en pastille avec une croix.
- Modèles à copier : `app/articles/component/ArticleFilters.tsx` (page serveur), `app/ressources/component/ResourceFilters.tsx` (liste chargée dans le navigateur).
- **Les filtres sont toujours écrits dans l'adresse** : un lien partagé ou un retour arrière retrouve la même liste. Page serveur : `searchParams`. Liste navigateur : `useSearchParams` au départ, puis `useSyncUrlFilters` (`common/hooks/useUrlFilters.ts`), sans recharger ni remplir l'historique.

### Vérifier

- Pendant le travail : coder pour les deux tailles, relire les classes `max-lg:` et `lg:`.
- Preuve automatique, sur demande ou en fin de gros chantier : `pnpm --filter @bbfrance/site test:parcours` (pages principales en taille téléphone puis ordinateur : débordement, boutons de 44 px ; le serveur de développement doit être arrêté).
- Mesure ciblée d'une page : dans `apps/site`, `node scripts/e2e-db.mjs` puis `MOBILE_AUDIT=1 MOBILE_AUDIT_PAGES=profile,tournois npx playwright test tests/e2e/mobile-audit.spec.ts --project=chromium` (résumé à l'écran, détail dans `logs/mobile-audit.json`, voir `docs/mobile-audit.md`).
- Essai sur un vrai téléphone : voir « Tester sur un vrai téléphone » dans le `README.md`. Ce qui reste à essayer à la main est listé dans `TESTS-MANUELS.md`.
