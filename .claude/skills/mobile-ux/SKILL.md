---
name: mobile-ux
description: Règles d'affichage et d'ergonomie sur téléphone pour BBFrance (règle absolue - mobile impeccable) - coquille (barre basse, panneau « Plus », pas de portail), seuil unique de 1024 pixels, bouton Filtres, bouton retour, écrans plein écran. À lire avant toute modification d'interface.
---

# BBFrance sur téléphone

**Règle absolue du projet : le site doit être impeccable sur téléphone** (voir `README.md`). La plupart des coachs l'utilisent depuis leur mobile. Les chemins de ce skill sont relatifs à `apps/site`.

## Ce que chaque écran doit respecter

- Pas de défilement horizontal de la page.
- Textes lisibles sans zoomer : aucun texte sous 12 pixels.
- Boutons et liens d'au moins 44 pixels de haut (`size="tap"` ou `"tap-icon"` de `Button`), assez espacés pour le pouce.
- Champs de saisie en police de 16 pixels au moins : en dessous, l'iPhone zoome tout seul sur le champ. Les champs de `@bbfrance/ui` (`Input`, `Textarea`, `Select`) le font déjà.
- Fenêtres, menus et listes déroulantes qui s'ouvrent et se ferment sans bug.
- Lisible dans les 8 thèmes.
- Fluide : pas de saut de mise en page au chargement, réponse immédiate au toucher.

Mesure rapide après une correction, sans écrire de test temporaire : dans `apps/site`, `node scripts/e2e-db.mjs` puis `MOBILE_AUDIT=1 MOBILE_AUDIT_PAGES=profile,tournois npx playwright test tests/e2e/mobile-audit.spec.ts --project=chromium` (chemins sans « / » au début sous Git Bash). Le résumé affiché à la fin donne, par page et par taille d'écran, les cibles trop petites, les textes sous 12 pixels, les champs sous 16 pixels et les éléments coupés ; le détail est dans `logs/mobile-audit.json` (voir `docs/mobile-audit.md`).

Vérification : tests automatiques en taille téléphone (les tests d'inventaire de `tests/e2e/inventaire/` tournent en taille ordinateur et téléphone), plus un contrôle à l'œil sur un vrai téléphone (voir « Tester sur un vrai téléphone » dans le `README.md`).

## Un seul seuil : 1024 pixels

Le site passe de l'affichage ordinateur à l'affichage téléphone à **1024 pixels de large**. Les tablettes reçoivent donc l'affichage téléphone. Ce seuil est le même partout :

- en Tailwind : `max-lg:` (téléphone) et `lg:` (ordinateur, à partir de 1025 pixels), réglés dans `packages/ui/src/tokens.css` ;
- en JavaScript : `useMediaQuery(DESKTOP_QUERY)` de `@bbfrance/ui`, ou `useIsMobile()` de `common/hooks/useIsMobile.ts` (constante `MOBILE_BREAKPOINT`). Ne jamais passer d'autre valeur à `useIsMobile` ni écrire `window.innerWidth <= …` ;
- dans un fichier CSS de composant : `@media (max-width: 1024px)` et `@media (min-width: 1025px)`. Le CSS ne sait pas lire une variable dans un `@media`, d'où la valeur écrite en clair.

D'autres largeurs restent permises **seulement pour ajuster une grille à la place disponible** (passer de 3 colonnes de cartes à 2, réduire une marge). Elles ne doivent jamais masquer, déplacer ou remplacer une colonne, un onglet, un menu ou des filtres : c'est le rôle du seuil unique. Autrement, entre deux seuils, une partie de l'interface devient inaccessible.

## La coquille du site sur téléphone

La coquille est ce qui entoure chaque page : `common/components/AppShell/` (`AppShell.tsx`, `MorePanel.tsx`, `navItems.ts`, `AppShell.css`).

- **Barre du haut** : le logo (sauf sur l'accueil) et, pour un visiteur, « Connexion » ; pour un membre connecté, la cloche des notifications avec sa pastille (carte 167, vers `/notifications`). Le bouton retour n'y est plus : il est dans l'en-tête de la page (carte 156).
- **Barre basse** : cinq onglets, Accueil, Forum, Tournois, Messages et Plus. Elle se cache pendant la saisie (la coquille pose l'attribut `data-typing` sur `<html>` quand un champ a le focus) pour laisser la place au clavier. Quand le champ perd le focus, l'attribut n'est retiré qu'après 350 millisecondes (carte 113) : un appui sur un bouton juste après la saisie se termine ainsi avant que la barre ne revienne et ne décale la page sous le doigt.
- **Panneau « Plus »** : il monte du bas et contient le profil ou la connexion, le choix du thème, les autres rubriques (liste `MORE_NAV` de `navItems.ts` : ajouter une rubrique, c'est une ligne dans ce fichier), la modération et l'administration pour l'équipe, les mentions légales et la déconnexion.
- **Pas de portail React** (`createPortal`, carte 156) : une page n'envoie jamais de contenu dans la coquille. Ses outils secondaires restent dans la page : un bloc sur place (« Outils du forum » sous la liste) ou un panneau `Sheet` ouvert par un bouton de l'en-tête (« Outils du sujet »). Seuls les composants Radix de `packages/ui` (fenêtres, panneaux, menus) gardent leur portail interne.

Place réservée en bas de la page : la coquille calcule elle-même la place de la barre basse (`--app-bottom-nav-space`), du bandeau des cookies (`--app-cookie-space`) et des notifications (`--app-toast-space`). Une page n'ajoute pas de marge pour eux.

## Barre d'actions collée en bas par une page

Une page qui colle sa propre barre en bas (« Répondre » et la pagination d'un sujet, barre d'envoi d'un écran de rédaction, saisie d'une conversation) pose l'attribut `data-page-bottom-bar` sur cette barre. La coquille réserve alors sa hauteur (`--app-page-bar-space`, 60 pixels), et les notifications et le bandeau des cookies montent au-dessus. Sans valeur, la barre s'efface pendant la saisie ; avec `data-page-bottom-bar="always"`, elle reste affichée pour que « Publier » reste à portée de pouce. La barre se place à `bottom-[var(--app-bottom-nav-space)]` pour ne pas passer sous la barre basse.

## Écrans plein écran

- **Écrans de rédaction** (répondre, modifier un message, nouveau sujet, tournois, ligues, articles, ressources, archives du classement) : la barre basse est retirée grâce à leur adresse, reconnue par `isComposePath` dans `navItems.ts`. Une nouvelle adresse de rédaction doit y être ajoutée, sinon la barre basse recouvre la barre d'envoi. Leur mise en page passe par `ComposeScreen` et `ComposeActionBar` (`app/forum/component/ComposeScreen.tsx`).
- **Écran plein écran sans adresse propre** (conversation de la messagerie ouverte par `?id=`, carte en plein écran) : il pose l'attribut `data-fullscreen` sur son cadre. `AppShell.css` retire alors la barre basse et bloque le défilement de la page restée derrière. Pour garder une zone de saisie au-dessus du clavier, ce cadre suit la partie visible de l'écran (`window.visualViewport`, voir `app/messagerie/component/ConversationView.tsx`).

## Onglets d'une page

Les onglets se placent en haut de la page avec `LinkTabs` de `@bbfrance/ui` : une rangée qui défile de côté (exemple : `/profile`). Quand ils sont nombreux, `StaffPageLayout` (`/moderation`, `/administration`) en fait une colonne sur ordinateur et une rangée sur téléphone, qui se place sur l'onglet ouvert. Les onglets ne vont pas dans le panneau « Plus ».

## Filtres d'une liste : bouton « Filtres », panneau et pastilles

Sur ordinateur, les filtres d'une liste sont dans une colonne « Filtres » à gauche des résultats. Sur téléphone, cette colonne disparaît :
- un bouton « Filtres », dans la barre au-dessus des résultats, affiche le nombre de filtres actifs (`CountBadge`) ;
- il ouvre un panneau qui monte du bas (`Sheet` de `@bbfrance/ui`) avec les mêmes filtres, « Réinitialiser » et « Voir N résultats » ;
- chaque filtre actif est rappelé en pastille au-dessus des résultats, avec une croix pour le retirer.

Exemples : `/forum/search`, `/tournois`, `/membres`, `/ligues`, `/articles`, `/ressources`. Les modèles les plus simples à copier : `app/articles/component/ArticleFilters.tsx` (filtres écrits dans l'adresse) ou `app/ressources/component/ResourceFilters.tsx` (filtres gardés dans la page). Les filtres ne vont jamais dans le panneau « Plus ».

## Mise en page

- **Ne rien casser sur ordinateur** : les règles propres au téléphone passent par `max-lg:` (ou `lg:` pour ce qui est réservé à l'ordinateur).
- Sur téléphone, on empile les éléments en une colonne et on garde de l'air.
- Un tableau trop large passe en liste de cartes (exemple : `app/membres/component/MembersTable.tsx`) ou défile dans son propre cadre (`overflow-x-auto`), jamais la page entière.
- Si un composant est trop complexe à adapter, on simplifie son affichage sur téléphone.

## Titre de page et bouton retour

Le bouton retour (`BackButton`, 44 pixels sur téléphone) est affiché sur place, à gauche du titre de la page, à toutes les tailles d'écran (carte 156). `ForumListHeader` (forum), `ComposeScreen` et `PageHeader` (mentions légales) le font ; les fiches d'un article et d'une ligue ont un lien « Tous les articles » ou « Toutes les ligues » au-dessus du contenu.

## Pages impossibles sur téléphone

Si une fonctionnalité ne peut vraiment pas fonctionner sur téléphone, afficher un message clair avec `EmptyState` de `@bbfrance/ui` (« Optimisé pour ordinateur ou tablette »). Aucune page n'est dans ce cas aujourd'hui.
