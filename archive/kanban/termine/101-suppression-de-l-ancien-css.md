---
id: 101
title: "Suppression de l'ancien CSS"
epic: E08
app: site
depends_on: [085, 086, 087, 088, 089, 090, 091, 092, 093, 094, 095, 096, 097, 098, 099, 100]
adr: 0006
verify: plus aucun page.css ni variable v1 ; variable REFONTE retirée ; preflight actif ; suite e2e complète verte ; Lighthouse téléphone d'au moins 90 ; toutes les cases de l'inventaire cochées
---

# 101 — Suppression de l'ancien CSS

## Pourquoi

Quand tous les écrans sont refaits, l'ancien CSS, les alias v1 et la variable `REFONTE` ne servent plus. Les garder ferait coexister deux systèmes pour rien.

## Action

- Avant de supprimer, lister ce qui utilise encore chaque fichier ou variable.
- Supprimer les fichiers CSS historiques, la couche `legacy`, les alias v1, `MobileSidebar`, l'ancienne coquille et la variable `REFONTE` (mettre à jour `DEPLOY.md`).
- Activer le preflight de Tailwind et vérifier toutes les pages en taille téléphone et ordinateur.
- Lancer la suite e2e complète et Lighthouse en mode mobile.
- Corriger les défauts du socle relevés pendant la refonte des écrans :
  - `Textarea` de `packages/ui` affiché en police à chasse fixe ;
  - trait vertical de l'ancien style sur le titre des panneaux et règle `[data-theme='saison3'] h2` qui garde les titres en bleu marine en Saison 3 ;
  - chiffre de `CountBadge` en 11 pixels, trop petit ;
  - styles BBCode recopiés dans plusieurs `page.css` (garder une seule feuille partagée) ;
  - bandeau des cookies et notifications empilées qui couvrent le bas des pages sur téléphone (la modération et l'administration le contournent par une marge, à retirer ensuite) ;
  - mise en forme des mentions légales ;
  - logo de la coquille et libellés de la barre basse ;
  - `UserMapper`, `UserSearch` et `LigueSearch` encore à l'ancien style ;
  - `.loader-container` de `/bbscheme`, qui ne reçoit son style qu'après un passage par `/classement`.

## Résultat

**Ce qui a été fait.** L'ancien CSS, les variables v1, l'ancienne coquille et la variable `REFONTE` ont disparu ; le preflight de Tailwind est actif.
- **Thèmes** : le dossier `apps/site/app/theme/` (8 fichiers, 98 variables v1 et leurs alias) est supprimé. Les 8 thèmes ne vivent plus que dans `packages/ui/src/themes/` (variables v2). Pour garder l'esprit des 7 thèmes historiques, une variable v2 facultative, `--bb-bg-image`, rend à chacun son léger dégradé de fond ; le verre dépoli reste réglé par `--bb-glass-blur` (seul « Sombre » l'active). Le pont des noms shadcn de `tokens.css` (`bg-primary`…) pointe maintenant sur les variables v2. La règle `[data-theme='saison3'] h2` et le trait vertical des titres ont disparu avec la couche `legacy`.
- **CSS global** : `globals.css` est réécrit (fond de page, échelle des superpositions, animation d'un nouveau message) ; `globals-mobile.css` et `common/styles/widgets.css` sont supprimés. `tailwind.css` importe le preflight. Une règle garde les icônes Lucide dans le texte (`display: inline-block`), comme avant le preflight.
- **BBCode** : une seule feuille, `common/components/BBCodeContent/bbcode.css`, chargée pour tout le site ; `app/forum/page.css` et `page-mobile.css` sont supprimés, ainsi que leurs 14 importations. Les styles écrits dans les balises par `lib/bbcode.ts` utilisent les variables v2. Le bouton « œil » d'un spoiler et l'en-tête d'un accordéon font 44 pixels.
- **Coquille** : `Navbar`, `MobileSidebar` et `SignInButton` sont supprimés ; `navCounts.ts` et `useNavCounts.ts` sont copiés à l'identique dans `AppShell/`. `layout.tsx` ne lit plus `REFONTE`. Les règles de `AppShell.css` visent `body` au lieu de la classe `refonte-shell`, et l'emplacement « Cette page » du panneau « Plus » garde ses règles (copiées dans `MorePanel.css`).
- **Composants** : supprimés car plus utilisés, ou remplacés par `packages/ui` : `Button/` (7 boutons), `Form/ClassicInput`, `Form/ClassicSelect`, `Pagination`, `TabSystem`, `StatItem`, `StatusBadge`, `DesktopOnlyFallback`, `EmptyState`, `SmileyPicker`, `Tooltip`. Restylés en Tailwind et variables v2, sans fichier CSS : `UserSearch`, `UserMapper`, `LigueSearch` (sur le modèle de `MultiLigueSearch`), `BackButton`, `PageHeader`, `PremiumCard`, `CookieBanner`, `SiteLogo`, `MemberAvatarImage`, `Modal`, `ConfirmModal`. `LockButton` perd son ancienne apparence. `UserAvatar.css` (cadres de rang) et `Dugout.css` (fosses désactivées de BBScheme) gardent leur fichier, passé en variables v2. Le lecteur `packages/bbscheme-player` aussi ; sa bulle d'infos garde ses couleurs de jeu fixes (fond sombre, or).
- **BBScheme** : `app/bbscheme/page.css` est remplacé par des classes Tailwind sur le cadre du terrain (mêmes gestes, mêmes noms de classes repères). `.loader-container` n'existait déjà plus (carte 100).
- **Défauts du socle corrigés** : `Textarea` et les autres champs de `packages/ui` imposent la police du site ; `CountBadge` passe à 12 pixels (pastille de 20) ; le logo est un lien d'au moins 44 × 44 pixels ; les libellés de la barre basse passent de 11,5 à 12 pixels ; le bandeau des cookies est compact, posé au-dessus de la barre basse et d'une barre d'actions, et publie sa hauteur (`--app-cookie-space`) pour que la fin de la page puisse défiler au-dessus de lui ; les notifications montent aussi au-dessus de lui, et la coquille réserve leur place sous le contenu tant qu'il y en a une (`--app-toast-space`) : la marge de 14 rem de `StaffPageLayout` est retirée.
- **Mentions légales** : `page.tsx` (chantier RGPD) n'est pas touché. Sa mise en forme passe par `PageHeader`, `PremiumCard` et ses deux fichiers CSS, réécrits en variables v2 : une colonne sur téléphone, deux sur ordinateur, liens soulignés, texte en 16 pixels. Ces deux fichiers sont les derniers `page.css` du site : ils ne peuvent disparaître que lorsque `page.tsx` sera réécrit.
- **Documentation** : skills `theming-rules` (variables v2 seulement), `ui-components`, `reuse-first`, `mobile-ux`, `project-structure` ; `ARCHITECTURE.md`, `DEPLOY.md` (fin de `REFONTE`), `docs/GLOSSAIRE.md`, fiches `forum`, `articles`, `bbscheme`, `ligues-carte`, `messagerie`, `pages-diverses`, `packages/bbscheme-player/CLAUDE.md`. ESLint n'a plus d'exception pour les anciens boutons.
- **Test ajouté** : `tests/e2e/inventaire/coquille-fin.spec.ts` (lignes de la section 1 de l'inventaire encore non vérifiées, et mentions légales).

**Vérifications.** `npx tsc --noEmit` sans erreur (site et `packages/ui`). Cliquet ESLint du site : 233 erreurs pour un plafond de 261, plafonds abaissés (`react/forbid-elements` 19 → 8, `react-hooks/set-state-in-effect` 5 → 3). Tests e2e lancés par groupes, sur ordinateur et téléphone : tous les tests d'inventaire, `coquille-fin`, `coquille`, `smoke`, `mobile-audit`, `contraste`, `bbscheme-pinch` et `visual-themes` (captures régénérées, puis relues dans les 8 thèmes) passent ; les quelques échecs du premier passage (délais dépassés pendant que Turbopack reconstruisait son cache, et une capture d'accueil faussée par les tournois créés juste avant par `tournois.spec.ts`) sont passés au second. Lighthouse en mode mobile (`pnpm lighthouse`, version de production) : accueil 93, forum 94, sujet 91, tournois 94, profil 88 (88 aussi avant la refonte) ; accessibilité 100 sur l'accueil, le forum, un sujet et les mentions légales. Au premier passage, l'accueil, le sujet et le profil tombaient à 87 : le texte du bandeau des cookies, affiché 1,5 seconde après l'arrivée, était devenu le « plus grand élément affiché » (LCP). Il apparaît maintenant en fondu depuis une opacité nulle, ce qui l'exclut de cette mesure.

**Inventaire.** Cochées par cette carte : huit lignes de la section 1 (logo, icône Administration, bouton retour du téléphone, bandeau des cookies, notifications, bannis, onboarding, widgets de développement) et `/mentions-legales`. Restent non cochées (14) : l'éclair du thème par défaut pour un visiteur (défaut réel, voir plus bas), l'ouverture de l'assistant d'IA dans un nouvel onglet, le rendu de toutes les balises BBCode (relu à l'œil, sans test qui couvre images, vidéos, galerie et mentions), neuf lignes du forum (accueil du forum, page d'un forum, pagination et cadre de rang d'un sujet, « Citer ») et la liste des sujets de tournoi d'un membre, que les cartes 085, 086 et 089 n'ont pas cochées, et l'envoi des annonces par courriel (carte 145).

**Défaut trouvé, hors carte.** Pour un visiteur, le thème gardé par le navigateur n'est posé qu'après le chargement de la page par `ThemeProvider` : la page s'affiche un instant dans le thème par défaut. Le test `coquille-fin.spec.ts` vérifie seulement que le thème est bien repris.

**Piège découvert.** Après un changement des `@import` de `tailwind.css`, le cache de Turbopack (`apps/site/.next/dev`) a servi l'ancienne feuille compilée, sans le preflight, jusqu'à sa suppression. Noté dans le skill `theming-rules`.

**À essayer à la main sur un téléphone.**
- Première visite (navigation privée) : le bandeau des cookies apparaît au-dessus de la barre basse, la page défile jusqu'à son dernier bouton au-dessus du bandeau, « Accepter » et la croix fonctionnent.
- Dans la modération ou l'administration, enregistrer un réglage : la notification apparaît au-dessus de la barre basse et on peut encore faire défiler jusqu'au dernier bouton.
- Le logo de la barre du haut (hors accueil) s'atteint facilement au pouce ; les libellés de la barre basse sont lisibles.
- Dans les thèmes Saison 3 et Sombre : fond en léger dégradé, titres sans trait vertical ni bleu marine imposé.
- Un message avec spoiler, accordéon, citation, tableau et galerie s'affiche bien (forum, article, messagerie).
- Les champs de recherche d'un membre (commissaires d'un tournoi, transfert d'une ligue, résultats d'un tournoi) et d'une ligue (formulaire de tournoi, profil).
