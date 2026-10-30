# Audit mobile du site (carte 049)

**Règle absolue du projet : le site doit être impeccable sur téléphone.** Ce rapport liste ce qui ne l'est pas encore, page par page, et les cartes qui corrigent chaque point.

Date : 28/10/2026, mis à jour le 30/10/2026 après les cartes 053 (forum), 054 (listes et filtres) et 055 (seuil unique téléphone/ordinateur), 056 (carte et quiz), 057 (BBScheme) et 058 (connexion, inscription et page des bannis), puis 061 (derniers défauts) ; première mesure de fluidité le 30/10/2026 (carte 059), refaite après la carte 063 (profil). À refaire après chaque série de corrections.

## Comment l'audit est fait

1. **Mesure automatique** : `MOBILE_AUDIT=1 npx playwright test tests/e2e/mobile-audit.spec.ts` (dans `apps/site`). Le test ouvre 28 pages (25 avant la carte 064, qui a ajouté les trois formulaires de création), chacune avec le visiteur qui lui correspond (depuis la carte 058 : visiteur sans compte pour les pages publiques et la connexion, nouveau membre pour l'inscription, membre banni pour `/banned`, modérateur pour le reste ; avant, tout était mesuré en modérateur, si bien que `/auth/login` renvoyait vers l'accueil sans jamais être mesurée), sur deux tailles d'écran : un téléphone récent (390 × 844 pixels) et un petit téléphone (360 × 640). Il relève :
   - le **contenu coupé** : éléments qui dépassent du bord droit. Le site interdit le défilement horizontal (`overflow-x: hidden`), donc un élément trop large est coupé au lieu de défiler. Les éléments rangés dans un cadre qui défile lui-même ne sont pas comptés (carte 057) ;
   - les **cibles trop petites** : boutons et liens de moins de 44 pixels de haut ou de large, difficiles à toucher au pouce ;
   - les **textes de moins de 12 pixels** ;
   - les **champs de saisie de moins de 16 pixels** : l'iPhone zoome automatiquement quand on tape dedans.

   Le résultat détaillé est écrit dans `apps/site/logs/mobile-audit.json` (avec, depuis la carte 061, le détail des textes et des champs trop petits et leur taille de police). Un résumé d'une ligne par page et par taille d'écran est affiché à la fin et écrit dans `apps/site/logs/mobile-audit-summary.txt`.

   Pour ne mesurer que quelques pages (après une correction, par exemple) : `MOBILE_AUDIT_PAGES=profile,tournois` (chemins séparés par des virgules, sans la partie « ?… » ; un chemin terminé par « * » prend toutes les pages qui commencent ainsi). La barre « / » du début peut être omise, et doit l'être sous Git Bash, qui transforme un premier « /profile » en chemin de fichier Windows. Relancer `node scripts/e2e-db.mjs` avant chaque relevé : la petite base de test locale perd sa connexion quand le site de test précédent s'arrête.

   Depuis la carte 061, l'audit mesure aussi `/administration` avec un compte administrateur, `/tournois` une seconde fois avec le panneau de filtres ouvert, et un sujet du forum dont le message contient un schéma BBScheme (lecteur `BBSchemePlayer`). Une case à cocher placée dans une étiquette (`<label>`) est mesurée avec son étiquette, puisque toucher l'étiquette coche la case.
2. **Tests des parcours en taille téléphone** : les 15 tests essentiels du site (lire le forum, répondre, profil, accès réservés…) sont rejoués en taille téléphone (projet Playwright `telephone`, à chaque `pnpm test:e2e` et en CI). Ils passent tous.
3. **Lecture du code** : problèmes relevés en rédigeant les fiches `docs/features/` (carte 045).
4. **Fluidité** (depuis la carte 059) : note de vitesse Lighthouse sur 100, en mode mobile. Voir la section « Fluidité sur téléphone » plus bas.

## Fluidité sur téléphone (carte 059)

Mesure du 30/10/2026. **Objectif : 90/100 sur chaque page.**

### Comment la mesure est faite

Commande, à lancer dans `apps/site` (ou `pnpm --filter @bbfrance/site lighthouse` depuis la racine) :

```bash
pnpm lighthouse
```

Elle prend environ 5 minutes et fait, dans l'ordre :

1. elle recrée vide la base de test locale des tests e2e (serveur `site-e2e`, jamais la base de développement ni la production) et y ajoute le petit jeu de données des tests (un forum, un sujet, quelques membres) ;
2. elle prépare le site dans sa **version de production** (`next build`), puis le lance (`next start`, adresse `http://localhost:3200`). Le mode développement (`next dev`) est bien plus lent et fausserait les notes ;
3. elle passe chaque page dans **Lighthouse** en mode mobile, qui simule un téléphone de milieu de gamme sur un réseau 4G lent. Chaque page est mesurée 3 fois et la mesure du milieu (la médiane) est gardée, car la note varie d'un passage à l'autre.

Le profil est mesuré connecté, avec le membre de test « Coach E2E » ; les autres pages sont mesurées en visiteur sans compte. Comme la connexion de test (`dev-login`) n'existe pas en production, le script fabrique lui-même le cookie de session du membre, avec une clé de chiffrement créée pour la mesure et jetée ensuite.

Fichiers : `apps/site/playwright.lighthouse.config.ts` (préparation et lancement du site) et `apps/site/tests/lighthouse/lighthouse-mobile.spec.ts` (liste des pages et mesure). Les résultats sont écrits dans `apps/site/logs/lighthouse/` : un rapport par page (`accueil.html`, `profil.html`…, à ouvrir dans un navigateur, avec le détail de chaque cause) et `summary.json` (notes et causes principales). Variables facultatives : `LIGHTHOUSE_RUNS` (nombre de passages par page, 3 par défaut) et `LIGHTHOUSE_OUT` (dossier des résultats).

### Ce que veulent dire les indicateurs

- **Note** : note de vitesse de Lighthouse, sur 100. 90 et plus est « bon » pour Google.
- **LCP** (*Largest Contentful Paint*) : temps avant que le plus gros élément visible (grand titre, grande image) soit affiché, c'est-à-dire le moment où la page « est là ». Bon sous 2,5 secondes.
- **TBT** (*Total Blocking Time*) : temps pendant lequel le téléphone, occupé par le JavaScript, ne peut pas réagir à un toucher. Bon sous 200 millisecondes.
- **CLS** (*Cumulative Layout Shift*) : à quel point le contenu saute pendant le chargement. 0 = rien ne bouge ; bon sous 0,1.

### Résultats

| Page | Visiteur | Note | Passages | LCP | TBT | CLS | Verdict |
|---|---|---|---|---|---|---|---|
| `/` accueil | visiteur | **97** | 97, 97, 98 | 2,6 s | 20 ms | 0 | Objectif atteint |
| `/forum` | visiteur | **93** | 93, 93, 93 | 2,9 s | 20 ms | 0,082 | Objectif atteint |
| `/forum/topic/[id]` (un sujet) | visiteur | **91** | 91, 91, 94 | 3,4 s | 20 ms | 0,065 | Objectif atteint de justesse |
| `/tournois` | visiteur | **95** | 95, 95, 95 | 3,0 s | 20 ms | 0,005 | Objectif atteint |
| `/profile` | membre connecté | **75** | 75, 75, 88 | 3,9 s | 30 ms | **0,25** | **Sous l'objectif** : carte 063 (92 depuis, voir plus bas) |

**Nouvelle mesure après la carte 019** (logo allégé, 30/10/2026, même machine) : accueil **97** (97, 97, 99 ; LCP 2,7 s), `/forum` **94** (LCP 2,9 s), sujet **91** (91, 91, 91 ; LCP 3,3 s), `/tournois` **98** (95, 98, 98 ; LCP 2,3 s), `/profile` **88** (88, 88, 88 ; LCP 3,9 s, CLS 0). Le gain du logo est faible sur la note, car c'est surtout le CSS bloquant qui retarde l'affichage. Sur le profil, le CLS est tombé à 0 sur les trois passages. La cause relevée plus bas (`useIsMobile`) n'a pas été modifiée ; le logo, qui avait auparavant une largeur nulle tant que l'image n'était pas arrivée, pouvait aussi faire bouger le menu. Ce point reste à confirmer par la carte 063.

**Nouvelle mesure après la carte 063** (30/10/2026, même machine) :

| Page | Note | Passages | LCP | TBT | CLS |
|---|---|---|---|---|---|
| `/` accueil | **98** | 97, 98, 99 | 2,4 s | 30 ms | 0 |
| `/forum` | **95** | 95, 95, 95 | 2,9 s | 20 ms | 0 (0,082 avant) |
| `/forum/topic/[id]` | **92** | 92, 92, 100 | 3,3 s | 30 ms | 0 (0,065 avant) |
| `/tournois` | **95** | 95, 95, 98 | 2,9 s | 30 ms | 0 |
| `/profile` | **92** | 92, 92, 92 | 3,4 s | 40 ms | 0 |

**Objectif atteint sur les 5 pages.** Ce qui a changé :

- **Profil, contenu qui saute** : la vraie cause, trouvée en relevant les décalages dans le navigateur, était la liste des onglets destinée au menu latéral. Le composant `MobilePortal` l'affiche d'abord à sa place d'origine, au-dessus de la carte de résumé (environ 400 pixels de haut), puis la déplace dans le menu une image plus tard : la carte descendait puis remontait. Cette copie est maintenant cachée en CSS (`app/profile/page-mobile.css`). De même, les onglets collés à la carte (ordinateur) et la taille de l'avatar sont réglés en CSS, qui connaît la largeur de l'écran dès le premier affichage, au lieu de dépendre de `useIsMobile`.
- **Profil, plus gros élément affiché tard** : le titre de la page s'affiche sans attendre les données du membre, et le reste de la page dès que la fiche du membre est arrivée ; le nombre de messages et l'activité complètent la page ensuite (LCP de 3,9 à 3,4 secondes). Sans ce second changement, la note reste à 88.
- **Toutes les pages, contenu qui saute** : sur téléphone, le bouton retour s'affichait un instant dans l'en-tête de la page avant d'être déplacé dans la barre de navigation ; l'en-tête rétrécissait d'environ 60 pixels et toute la page remontait. Il est maintenant caché dès le départ dans l'en-tête (`PageHeader-mobile.css`). Le CLS du forum et du sujet tombe à 0.
- **Outil de mesure** : la base de test est maintenant recréée après `next build` (`playwright.lighthouse.config.ts`). La préparation du site la laissait dans un état où la page d'un sujet renvoyait une erreur 500 (« Connection terminated unexpectedly »), et `pnpm lighthouse` s'arrêtait sur cette page.

Restent communs à toutes les pages, sans correction dans la carte 063 : les fichiers CSS qui bloquent l'affichage (300 à 620 ms de gain estimé), environ 22 Ko de JavaScript inutilisé et 14 Ko de code pour anciens navigateurs. Les regrouper touche la façon dont Next.js découpe le CSS de tout le site : à traiter dans une carte à part si une note repasse sous 90.

Le site réagit vite partout (TBT de 20 à 30 ms, très loin de la limite de 200 ms). Le point faible commun est l'affichage du plus gros élément (LCP de 2,6 à 3,9 secondes, au-dessus des 2,5 secondes conseillées), et, sur le profil, le contenu qui saute (corrigé par la carte 063).

### Causes relevées par Lighthouse

Communes aux 5 pages :

- **Fichiers CSS qui bloquent l'affichage** : le navigateur attend une dizaine de petits fichiers de style avant de dessiner la page (gain estimé de 300 ms sur l'accueil et le forum, 460 ms sur les tournois, 610 ms sur le sujet et le profil). C'est la principale cause du LCP trop long.
- **Logo trop lourd** : le logo du menu latéral (`img.logo-image`) pèse 85 Ko de plus que nécessaire pour sa taille d'affichage (96 × 42 pixels). **Corrigé par la carte 019** : le logo est maintenant envoyé à sa taille d'affichage (15,6 Ko au lieu d'environ 106 Ko). Lighthouse relève encore 11 Ko de trop, car le téléphone simulé reçoit la version de 256 pixels de large alors qu'il en affiche 168 (96 pixels multipliés par la densité de son écran) ; c'est le palier le plus proche que propose `next/image`.
- **JavaScript inutilisé** : environ 22 Ko chargés mais non utilisés sur la page, et 14 Ko de code de compatibilité pour d'anciens navigateurs (fonctions que tous les navigateurs récents connaissent déjà).
- **Chaîne de chargement** : certains fichiers ne sont demandés qu'après d'autres, ce qui allonge l'attente.

Propre au profil :

- **Contenu qui saute** (CLS de 0,25, plus du double de la limite ; **corrigé par la carte 063**, voir plus haut : la cause principale était en fait la copie des onglets en attente du menu latéral) : la carte de résumé du profil (`ProfileSidebar`, boîte `profile-summary-box`) est d'abord affichée dans sa version ordinateur, puis remplacée par sa version téléphone une fois le JavaScript chargé (`useIsMobile` ne connaît la largeur de l'écran que dans le navigateur). Tout ce qui est en dessous est décalé.
- **Plus gros élément affiché tard** : le sous-titre de la page (« Gérez vos informations et votre activité ») n'apparaît qu'après 3,9 secondes, à cause des fichiers CSS bloquants et parce que la page attendait les données du membre avant d'afficher son titre (3,4 secondes depuis la carte 063).

Lighthouse signale aussi que le retour arrière instantané du navigateur (*back/forward cache*) est impossible ; ses raisons viennent du navigateur de test et des pages qui demandent à ne pas être gardées en mémoire (connexion), elles ne sont pas à traiter.

### Limites de la mesure locale

- **Ordinateur et réseau** : Lighthouse simule le téléphone et la 4G lente par calcul, à partir de ce qui se passe sur l'ordinateur du développeur. Une machine plus lente ou occupée par autre chose donne des notes plus basses. Comparer les notes d'une même machine, pas d'une machine à l'autre.
- **Pas d'hébergement réel** : le site et la base tournent sur l'ordinateur. En ligne, le temps de réponse de Vercel (l'hébergeur) et de Neon (la base) s'ajoute, mais le réseau de diffusion de Vercel accélère les fichiers statiques. La note en ligne peut donc être un peu différente.
- **Très peu de données** : la base de test ne contient qu'un forum, un sujet d'un message et quelques membres. Une page avec beaucoup de messages ou de tournois sera plus lourde. Les pages préparées à l'avance pendant `next build` le sont en plus avec une base vide.
- **Variation** : la note varie de quelques points d'un passage à l'autre (le profil est passé de 75 à 88), d'où les 3 passages et la médiane. Le sujet, à 91, est à la limite : à surveiller.
- **Ce que Lighthouse ne voit pas** : la fluidité pendant l'utilisation (défilement, ouverture d'un menu) n'est pas mesurée, seulement le chargement de la page.

## Résultats de la mesure automatique (petit téléphone, 360 × 640)

| Page | Contenu coupé | Cibles trop petites | Remarques |
|---|---|---|---|
| Toutes les pages | — | Bouton « Retour » (40 px) | **Corrigé** dans cette carte : 44 px sur mobile |
| `/` accueil | 0 | 0 | Correct |
| `/administration` | 0 | 0 (et 1 champ sous 16 px avant) | **Mesurée en administrateur depuis la carte 061** (avant, un modérateur était renvoyé vers l'accueil). Le champ « Communauté Discord » était en 15,2 px : tous les champs de l'administration passent en 16 px sur téléphone |
| `/auth/login`, `/auth/onboarding` | 0 | 0 (4 avant sur l'inscription) | **Corrigé** par la carte 058 : connexion avec des marges réduites et des boutons de 48 px ; inscription avec tous les champs en 16 px (5 sous 16 px avant), boutons d'avatar de 36 à 44 px, intitulés à 12 px au moins. Mesuré à 360, 390 et 430 px (`logs/058-mobile/`) |
| `/banned` | 0 | 0 (1 avant) | **Corrigé** par la carte 058 : couleurs par variables de thème (lisible dans les 7 thèmes, captures de référence dans `visual-themes.spec.ts`), bouton de retour de 26 à 44 px et plus |
| `/forum`, `/forum/search`, `/tournois`, `/statistiques`, `/articles`, `/ressources`, `/media`, `/ligues`, `/messagerie`, `/moderation`, `/profile` | 0 | 1 (bouton « Retour ») | Correct une fois le bouton corrigé. Sur `/profile`, les intitulés « NAF » et « Messages » (11,2 px) passent à 12 px (carte 061, composant `StatItem`) |
| Sujet du forum avec un schéma BBScheme (lecteur `BBSchemePlayer`) | 0 (1 avant) | 0 (3 avant, et 1 champ sous 16 px) | **Corrigé** par la carte 061 : les commandes du lecteur dépassaient de 172 à 202 px ; elles passent sur deux lignes, boutons de 44 px, champ de vitesse en 16 px (`BBSchemePlayer-mobile.css`) |
| `/forum/topic/[id]` (un sujet) | 0 | 0 (35 avant) | **Corrigé** par la carte 053 : fil d'Ariane (liens de 22 px de haut), boutons « Profil » et « MP » de l'auteur (31 px) et icônes d'action sur les messages (24 px) passent à 44 px sur téléphone |
| `/forum/topic/[id]/reply` (répondre) | 0 | 0 (27 avant) | **Corrigé** par la carte 053 : barre d'outils de l'éditeur de messages (boutons de 28 px) et fil d'Ariane à 44 px sur téléphone |
| `/membres` | 0 (1 avant) | 0 (3 avant) | **Corrigé** par la carte 054 : le tableau de 915 px est remplacé sur téléphone par des cartes empilées, une par membre ; le nom de chaque membre est un lien de 44 px |
| `/articles`, `/ressources`, `/ligues`, `/tournois`, `/membres` : panneau de filtres ouvert | 0 | 0 (sauf `/tournois`) | **Corrigé** par la carte 054 : filtres derrière le bouton flottant. Sur `/tournois`, les 9 cases à cocher mesurent 22 px, mais toute leur ligne (44 px de haut) réagit au toucher. Mesuré à 360, 390 et 430 px (`logs/054-mobile/`). Depuis la carte 061, l'audit ouvre lui-même le panneau de `/tournois` et mesure chaque case avec son étiquette : 0 défaut |
| `/forum/new-forum`, `/forum/new-topic`, `/ligues/create` (formulaires de création) | 0 (1 avant sur la création de forum) | 0 (sauf les 2 cases des modérateurs) | **Corrigé** par la carte 064 : mesurés depuis cette carte. Création de forum : les deux boutons côte à côte élargissaient la carte de 52 px, ils sont maintenant l'un sous l'autre, et les champs passent en 16 px (2 sous 16 px avant). Création de sujet : le bouton « Créer le sujet » était parti dans le menu latéral, hors du formulaire, et ne l'envoyait plus ; la colonne « Publication » reste maintenant sous le message. Les cases « Épingler » et « Verrouiller » mesurent 18 px, mais toute leur ligne (44 px de haut) réagit au toucher (comptées comme correctes depuis la carte 061, qui mesure la case avec son étiquette). Création de ligue : champ de recherche des commissaires en 16 px et petits textes du blason à 12 px |
| `/classement` | 0 | 0 (5 avant) | **Corrigé** par la carte 061 : les onglets mesuraient 43,8 px, ils passent à 48 px |
| `/carte` | (faux positif) | 2 (6 avant) | **Corrigé** par la carte 056 : boutons « Tournois » / « Ligues » (38 px) et zoom (30 px) à 44 px, zoom placé sous ces boutons ; dans la bulle d'un repère, croix et lien « Détails » à 44 px ; zone de toucher des repères agrandie. Restent les deux liens de texte du crédit « Leaflet | © OpenStreetMap », obligatoire. Les tuiles de la carte qui dépassent sont coupées par son cadre (faux positif) |
| `/bbquizz` | 0 | 0 (3 avant) | **Corrigé** par la carte 056 : onglets « Du jour », « Semaine », « Panthéon » de 30 à 44 px. Pendant une partie : jokers de 38 à 44 px, lettres des réponses et pastilles des jokers à 12 px au moins. Mesuré à 360, 390 et 430 px (`logs/056-mobile/`) |
| `/bbscheme` | 0 (1 avant) | 0 (6 avant) | **Corrigé** par la carte 057 : boutons d'outils de 40 à 44 px, flèches de défilement de 35 à 44 px, croix des panneaux de réserve de 32 à 44 px ; la barre d'outils défile dans son propre cadre, avec aimantation de l'outil le plus proche et fondu sur les bords ; champ de vitesse en 16 px. Mesuré à 360, 390 et 430 px (`logs/057-mobile/`) |
| `/jouer` | 0 | 0 (1 avant) | **Corrigé** par la carte 061 : le lien « Prochaine étape » en bas de chaque section passe de 24 à 44 px de haut |
| `/mentions-legales` | 0 | 2 | Liens dans le texte (« GitHub », « vercel.com ») : tolérés, ce ne sont pas des boutons |

Depuis la carte 055, l'affichage téléphone s'applique jusqu'à 1024 pixels de large, donc aussi aux tablettes. La mesure ci-dessus (360 et 390 pixels) est restée identique après ce changement : 47 cibles trop petites au total avant comme après, aucun contenu coupé en plus. Les 9 cases à cocher de `/tournois` (22 pixels, dans une ligne touchable de 44 pixels) restent à traiter dans une carte d'interface : elles ne dépendent pas du seuil.

Après la carte 056, l'audit complet compte 33 cibles trop petites au total (47 avant). Après la carte 057, il en compte 20 (les 13 de `/bbscheme` sur les deux tailles d'écran ont disparu), et plus aucun champ de saisie de moins de 16 pixels.

Depuis la carte 057, l'audit ne compte plus comme « coupé » un élément placé dans un cadre qui défile lui-même de gauche à droite (`overflow-x: auto`, comme la barre d'outils de BBScheme ou un tableau large) : on l'atteint en faisant défiler ce cadre, ce que le skill `mobile-ux` autorise. Ce changement n'a modifié le résultat d'aucune autre page.

Après la carte 058, l'audit (maintenant 25 pages, avec les vrais visiteurs) compte 20 cibles trop petites (30 avant la carte avec la même mesure), aucun champ sous 16 pixels (10 avant) et 4 textes de moins de 12 pixels (8 avant). Les 20 restantes : onglets de `/classement` (44 px tout juste, arrondis en dessous), crédit de `/carte`, liens dans le texte de `/jouer` et `/mentions-legales`.

Après la carte 061, l'audit complet (30 mesures par taille d'écran : les 28 pages, plus le panneau de filtres de `/tournois` et un sujet avec un schéma BBScheme) compte 8 cibles trop petites (24 avant la carte, sur les 28 pages), 0 texte de moins de 12 pixels (4 avant), 0 champ sous 16 pixels (2 avant, sur `/administration`, mesurée pour la première fois) et 6 éléments coupés. Les restes sont tous des faux positifs ou des liens de texte, sur chacune des deux tailles d'écran : les deux liens du crédit de `/carte` (« Leaflet », « OpenStreetMap », obligatoires) et ses trois tuiles coupées par le cadre de la carte, et les deux liens dans le texte de `/mentions-legales`. Relevés dans `logs/061-audit-avant.json` et `logs/061-audit-apres.json` (à la racine du dépôt).

## Problèmes relevés à la lecture du code

| Problème | Pages | Carte |
|---|---|---|
| **Seuils incohérents** : certaines règles basculaient en mode mobile à 1024 pixels, d'autres à 768 ou 900. Entre les deux (tablettes), les onglets de la modération étaient masqués sans être déplacés dans le menu, donc inaccessibles. **Corrigé** : un seul seuil, 1024 pixels (`MOBILE_BREAKPOINT` en JavaScript, `@media (max-width: 1024px)` en CSS). Vérifié à 360, 800, 1000, 1024 et 1025 pixels sur 14 pages à colonne latérale ou à filtres : aucune colonne ni aucun onglet sans équivalent dans le menu ou le panneau de filtres, aucun défilement horizontal. | Modération, administration, profil, membres, et partout où `.mobile-only` est utilisé | 055 |
| Connexion et inscription : aucune règle mobile sur la page de connexion ; à l'inscription, champs en 0,9 rem (l'iPhone zoome) et boutons d'avatar et de thème trop petits. **Corrigé**. Dans le menu latéral, le pseudo du membre connecté était aussi coupé (« Mo… ») : la pastille de profil et le bouton « Déconnexion » sont maintenant l'un sous l'autre, à 44 px ; croix de fermeture, logo, icônes et liens du pied de menu passent aussi à 44 px. | `/auth/login`, `/auth/onboarding`, menu latéral | 058 |
| Fenêtre de signalement sans hauteur maximale ni défilement interne, et dont le titre passait sous la barre de navigation. **Corrigé** : hauteur limitée à l'écran avec défilement interne, fenêtre placée au-dessus de la barre. | Forum, articles | 053 |
| Filtres déplacés dans le menu latéral au lieu du bouton flottant (`MobileFilterWrapper`) prévu par le skill `mobile-ux`. **Corrigé** : les filtres s'ouvrent avec le bouton flottant. | Articles, ressources, ligues, tournois, membres | 054 |
| CSS mobile jamais chargé : `ressources/page-mobile.css` n'est importé nulle part ; `/ligue/edit/[id]` n'importe pas le CSS mobile du formulaire. **Corrigé** : les deux fichiers sont importés. | Ressources, édition de ligue | 054 |
| Listes déroulantes avec une icône à gauche (`ClassicSelect`) : sur téléphone, le texte passait sous l'icône. **Corrigé** dans `ClassicSelect-mobile.css`. | Ligues, articles, partout où l'icône est dans la liste | 054 |
| Couleurs écrites en dur, presque illisible dans le thème clair. **Corrigé** : variables de thème uniquement. | `/banned` | 058 |

## Prochaines étapes

1. Corriger dans l'ordre des cartes 053 à 058, en commençant par le forum (le plus utilisé).
2. Après chaque correction : relancer l'audit, mettre à jour ce rapport et la fiche de la fonctionnalité.
3. Quand l'audit est propre sur une page, ajouter un contrôle bloquant (aucun contenu coupé, aucune cible sous 44 px) pour qu'elle ne régresse plus.
