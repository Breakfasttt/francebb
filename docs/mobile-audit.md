# Audit mobile du site (carte 049)

**Règle absolue du projet : le site doit être impeccable sur téléphone.** Ce rapport liste ce qui ne l'est pas encore, page par page, et les cartes qui corrigent chaque point.

Date : 28/10/2026, mis à jour le 30/10/2026 après les cartes 053 (forum), 054 (listes et filtres) et 055 (seuil unique téléphone/ordinateur), 056 (carte et quiz), 057 (BBScheme) et 058 (connexion, inscription et page des bannis). À refaire après chaque série de corrections.

## Comment l'audit est fait

1. **Mesure automatique** : `MOBILE_AUDIT=1 npx playwright test tests/e2e/mobile-audit.spec.ts` (dans `apps/site`). Le test ouvre 25 pages, chacune avec le visiteur qui lui correspond (depuis la carte 058 : visiteur sans compte pour les pages publiques et la connexion, nouveau membre pour l'inscription, membre banni pour `/banned`, modérateur pour le reste ; avant, tout était mesuré en modérateur, si bien que `/auth/login` renvoyait vers l'accueil sans jamais être mesurée), sur deux tailles d'écran : un téléphone récent (390 × 844 pixels) et un petit téléphone (360 × 640). Il relève :
   - le **contenu coupé** : éléments qui dépassent du bord droit. Le site interdit le défilement horizontal (`overflow-x: hidden`), donc un élément trop large est coupé au lieu de défiler. Les éléments rangés dans un cadre qui défile lui-même ne sont pas comptés (carte 057) ;
   - les **cibles trop petites** : boutons et liens de moins de 44 pixels de haut ou de large, difficiles à toucher au pouce ;
   - les **textes de moins de 12 pixels** ;
   - les **champs de saisie de moins de 16 pixels** : l'iPhone zoome automatiquement quand on tape dedans.

   Le résultat détaillé est écrit dans `apps/site/logs/mobile-audit.json`.
2. **Tests des parcours en taille téléphone** : les 15 tests essentiels du site (lire le forum, répondre, profil, accès réservés…) sont rejoués en taille téléphone (projet Playwright `telephone`, à chaque `pnpm test:e2e` et en CI). Ils passent tous.
3. **Lecture du code** : problèmes relevés en rédigeant les fiches `docs/features/` (carte 045).

**Pas encore mesuré : la fluidité.** Les mesures de vitesse et de réactivité (Lighthouse, l'outil de Google qui note une page sur 100) demandent d'ajouter la bibliothèque `lighthouse` : en attente de ton accord (voir carte 059).

## Résultats de la mesure automatique (petit téléphone, 360 × 640)

| Page | Contenu coupé | Cibles trop petites | Remarques |
|---|---|---|---|
| Toutes les pages | — | Bouton « Retour » (40 px) | **Corrigé** dans cette carte : 44 px sur mobile |
| `/` accueil, `/administration` | 0 | 0 | Correct (un modérateur est renvoyé de `/administration` vers l'accueil : la page n'est pas mesurée en administrateur) |
| `/auth/login`, `/auth/onboarding` | 0 | 0 (4 avant sur l'inscription) | **Corrigé** par la carte 058 : connexion avec des marges réduites et des boutons de 48 px ; inscription avec tous les champs en 16 px (5 sous 16 px avant), boutons d'avatar de 36 à 44 px, intitulés à 12 px au moins. Mesuré à 360, 390 et 430 px (`logs/058-mobile/`) |
| `/banned` | 0 | 0 (1 avant) | **Corrigé** par la carte 058 : couleurs par variables de thème (lisible dans les 7 thèmes, captures de référence dans `visual-themes.spec.ts`), bouton de retour de 26 à 44 px et plus |
| `/forum`, `/forum/search`, `/tournois`, `/statistiques`, `/articles`, `/ressources`, `/media`, `/ligues`, `/messagerie`, `/moderation`, `/profile` | 0 | 1 (bouton « Retour ») | Correct une fois le bouton corrigé |
| `/forum/topic/[id]` (un sujet) | 0 | 0 (35 avant) | **Corrigé** par la carte 053 : fil d'Ariane (liens de 22 px de haut), boutons « Profil » et « MP » de l'auteur (31 px) et icônes d'action sur les messages (24 px) passent à 44 px sur téléphone |
| `/forum/topic/[id]/reply` (répondre) | 0 | 0 (27 avant) | **Corrigé** par la carte 053 : barre d'outils de l'éditeur de messages (boutons de 28 px) et fil d'Ariane à 44 px sur téléphone |
| `/membres` | 0 (1 avant) | 0 (3 avant) | **Corrigé** par la carte 054 : le tableau de 915 px est remplacé sur téléphone par des cartes empilées, une par membre ; le nom de chaque membre est un lien de 44 px |
| `/articles`, `/ressources`, `/ligues`, `/tournois`, `/membres` : panneau de filtres ouvert | 0 | 0 (sauf `/tournois`) | **Corrigé** par la carte 054 : filtres derrière le bouton flottant. Sur `/tournois`, les 9 cases à cocher mesurent 22 px, mais toute leur ligne (44 px de haut) réagit au toucher. Mesuré à 360, 390 et 430 px (`logs/054-mobile/`) |
| `/classement` | 0 | 6 | Onglets à 44 px tout juste : à la limite, acceptable |
| `/carte` | (faux positif) | 2 (6 avant) | **Corrigé** par la carte 056 : boutons « Tournois » / « Ligues » (38 px) et zoom (30 px) à 44 px, zoom placé sous ces boutons ; dans la bulle d'un repère, croix et lien « Détails » à 44 px ; zone de toucher des repères agrandie. Restent les deux liens de texte du crédit « Leaflet | © OpenStreetMap », obligatoire. Les tuiles de la carte qui dépassent sont coupées par son cadre (faux positif) |
| `/bbquizz` | 0 | 0 (3 avant) | **Corrigé** par la carte 056 : onglets « Du jour », « Semaine », « Panthéon » de 30 à 44 px. Pendant une partie : jokers de 38 à 44 px, lettres des réponses et pastilles des jokers à 12 px au moins. Mesuré à 360, 390 et 430 px (`logs/056-mobile/`) |
| `/bbscheme` | 0 (1 avant) | 0 (6 avant) | **Corrigé** par la carte 057 : boutons d'outils de 40 à 44 px, flèches de défilement de 35 à 44 px, croix des panneaux de réserve de 32 à 44 px ; la barre d'outils défile dans son propre cadre, avec aimantation de l'outil le plus proche et fondu sur les bords ; champ de vitesse en 16 px. Mesuré à 360, 390 et 430 px (`logs/057-mobile/`) |
| `/jouer`, `/mentions-legales` | 0 | 2 à 3 | Liens dans le texte : tolérable |

Depuis la carte 055, l'affichage téléphone s'applique jusqu'à 1024 pixels de large, donc aussi aux tablettes. La mesure ci-dessus (360 et 390 pixels) est restée identique après ce changement : 47 cibles trop petites au total avant comme après, aucun contenu coupé en plus. Les 9 cases à cocher de `/tournois` (22 pixels, dans une ligne touchable de 44 pixels) restent à traiter dans une carte d'interface : elles ne dépendent pas du seuil.

Après la carte 056, l'audit complet compte 33 cibles trop petites au total (47 avant). Après la carte 057, il en compte 20 (les 13 de `/bbscheme` sur les deux tailles d'écran ont disparu), et plus aucun champ de saisie de moins de 16 pixels.

Depuis la carte 057, l'audit ne compte plus comme « coupé » un élément placé dans un cadre qui défile lui-même de gauche à droite (`overflow-x: auto`, comme la barre d'outils de BBScheme ou un tableau large) : on l'atteint en faisant défiler ce cadre, ce que le skill `mobile-ux` autorise. Ce changement n'a modifié le résultat d'aucune autre page.

Après la carte 058, l'audit (maintenant 25 pages, avec les vrais visiteurs) compte 20 cibles trop petites (30 avant la carte avec la même mesure), aucun champ sous 16 pixels (10 avant) et 4 textes de moins de 12 pixels (8 avant). Les 20 restantes : onglets de `/classement` (44 px tout juste, arrondis en dessous), crédit de `/carte`, liens dans le texte de `/jouer` et `/mentions-legales`.

Aucun texte de moins de 12 pixels n'apparaît dans les zones visibles, hormis 2 éléments sur `/profile` (à vérifier).

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
