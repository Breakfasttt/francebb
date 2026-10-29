# Audit mobile du site (carte 049)

**Règle absolue du projet : le site doit être impeccable sur téléphone.** Ce rapport liste ce qui ne l'est pas encore, page par page, et les cartes qui corrigent chaque point.

Date : 28/10/2026, mis à jour le 30/10/2026 après la carte 053 (forum). À refaire après chaque série de corrections.

## Comment l'audit est fait

1. **Mesure automatique** : `MOBILE_AUDIT=1 npx playwright test tests/e2e/mobile-audit.spec.ts` (dans `apps/site`). Le test ouvre 23 pages, connecté en modérateur, sur deux tailles d'écran : un téléphone récent (390 × 844 pixels) et un petit téléphone (360 × 640). Il relève :
   - le **contenu coupé** : éléments qui dépassent du bord droit. Le site interdit le défilement horizontal (`overflow-x: hidden`), donc un élément trop large est coupé au lieu de défiler ;
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
| `/` accueil, `/auth/login`, `/administration` | 0 | 0 | Correct |
| `/forum`, `/forum/search`, `/tournois`, `/statistiques`, `/articles`, `/ressources`, `/media`, `/ligues`, `/messagerie`, `/moderation`, `/profile` | 0 | 1 (bouton « Retour ») | Correct une fois le bouton corrigé |
| `/forum/topic/[id]` (un sujet) | 0 | 0 (35 avant) | **Corrigé** par la carte 053 : fil d'Ariane (liens de 22 px de haut), boutons « Profil » et « MP » de l'auteur (31 px) et icônes d'action sur les messages (24 px) passent à 44 px sur téléphone |
| `/forum/topic/[id]/reply` (répondre) | 0 | 0 (27 avant) | **Corrigé** par la carte 053 : barre d'outils de l'éditeur de messages (boutons de 28 px) et fil d'Ariane à 44 px sur téléphone |
| `/membres` | 1 | 3 | Tableau de 915 px dans un écran de 360 px (défile dans son cadre) ; noms des membres en liens de 24 px → carte 054 |
| `/classement` | 0 | 6 | Onglets à 44 px tout juste : à la limite, acceptable |
| `/carte` | (faux positif) | 7 | Boutons « Tournois » / « Ligues » (38 px) et zoom de la carte (30 px) → carte 056 |
| `/bbquizz` | 0 | 4 | Onglets « Du jour », « Semaine », « Panthéon » de 30 px → carte 056 |
| `/bbscheme` | 1 | 7 | Un bouton d'outil coupé de 18 px à droite ; boutons de 35 à 40 px → carte 057 |
| `/jouer`, `/mentions-legales` | 0 | 2 à 3 | Liens dans le texte : tolérable |

Aucun texte de moins de 12 pixels n'apparaît dans les zones visibles, hormis 2 éléments sur `/profile` (à vérifier).

## Problèmes relevés à la lecture du code

| Problème | Pages | Carte |
|---|---|---|
| **Seuils incohérents** : certaines règles basculent en mode mobile à 1024 pixels, d'autres à 768. Entre les deux (tablettes), les onglets de la modération sont masqués sans être déplacés dans le menu, donc inaccessibles. | Modération, et partout où `.mobile-only` est utilisé | 055 |
| Connexion et inscription : aucune règle mobile sur la page de connexion ; à l'inscription, champs en 0,9 rem (l'iPhone zoome) et boutons d'avatar et de thème trop petits. | `/auth/login`, `/auth/onboarding` | 058 |
| Fenêtre de signalement sans hauteur maximale ni défilement interne, et dont le titre passait sous la barre de navigation. **Corrigé** : hauteur limitée à l'écran avec défilement interne, fenêtre placée au-dessus de la barre. | Forum, articles | 053 |
| Filtres déplacés dans le menu latéral au lieu du bouton flottant (`MobileFilterWrapper`) prévu par le skill `mobile-ux`. | Articles, ressources, ligues, tournois, membres | 054 |
| CSS mobile jamais chargé : `ressources/page-mobile.css` n'est importé nulle part ; `/ligue/edit/[id]` n'importe pas le CSS mobile du formulaire. | Ressources, édition de ligue | 054 |
| Couleurs écrites en dur, presque illisible dans le thème clair. | `/banned` | 058 |

## Prochaines étapes

1. Corriger dans l'ordre des cartes 053 à 058, en commençant par le forum (le plus utilisé).
2. Après chaque correction : relancer l'audit, mettre à jour ce rapport et la fiche de la fonctionnalité.
3. Quand l'audit est propre sur une page, ajouter un contrôle bloquant (aucun contenu coupé, aucune cible sous 44 px) pour qu'elle ne régresse plus.
