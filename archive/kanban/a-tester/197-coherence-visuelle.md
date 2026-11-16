---
id: 197
title: "Cohérence visuelle : empilement, seuils d'écran et interlignes"
epic: E11
app: site
depends_on: [192]
verify: "les listes déroulantes de recherche (ligue, membre, étiquette) passent au-dessus des cartes et de la barre basse ; le plein écran de la carte et la messagerie utilisent les niveaux de l'échelle du skill theming-rules ; le bouton « danger » reste lisible dans les 8 thèmes ; une image dans un message ne fait plus sauter le texte en arrivant ; aucune classe md: ni xl: ne reste dans les pages citées ; corepack pnpm check passe"
---

# 197 — Cohérence visuelle : empilement, seuils d'écran et interlignes

## Pourquoi

La revue de l'interface du 13 novembre 2026 a relevé des écarts aux règles des skills `theming-rules` et `mobile-ux`, sans gravité immédiate mais sources de bugs futurs :

- niveaux d'empilement (z-index : ordre de superposition des éléments) hors de l'échelle du projet. Les listes déroulantes de recherche utilisent `z-20` ou `z-50` au lieu de `--z-index-dropdown` (`TagSelector.tsx:138`, `LigueSearch.tsx:123`, `UserSearch.tsx:115`, `MultiLigueSearch.tsx:163`, `UserMapper.tsx:111`, `BBCodeEditor.tsx:927`) ; la carte utilise `z-[6500]` (`CarteClient.tsx:83`) et la messagerie `z-[5001]` (`ConversationView.tsx:159`) ; l'échelle de `globals.css:16-25` ne correspond pas à celle du skill (la valeur 4000 n'a pas de variable) ;
- la variante `destructive` du bouton (`packages/ui/src/button.tsx:19`) écrit son texte en blanc fixe (`text-white`) au lieu de `text-bb-on-danger` ;
- les images des messages (`lib/bbcode.ts:279` et `:348`) n'ont pas de place réservée : le texte saute quand elles arrivent ;
- seuils d'écran (breakpoints) hors de la règle des 1024 pixels : `max-sm:sr-only` qui masque une partie d'un libellé (`app/articles/page.tsx:109`, `app/ligues/page.tsx:79`, `app/ressources/page.tsx:100`), `md:` (`ProfileArticles.tsx:49`, `:57`, `app/tournois/page.tsx:206`) et `xl:` (`app/articles/page.tsx:140`, `app/ressources/page.tsx:137`, `:151`) ;
- interligne serré (`leading-snug`) sur des paragraphes (`app/page.tsx:207`, `PostItem.tsx:170`, `CookieBanner.tsx:73`), moins lisible sur petit écran.

Non traités ici, notés pour un futur chantier : 13 tailles de texte arbitraires (`text-[…]`) et 9 largeurs maximales de page différentes, qui mériteraient une échelle commune.

## Action

- Remettre chaque niveau d'empilement cité sur une variable de l'échelle, et aligner `globals.css` avec le skill `theming-rules` (corriger le skill si c'est lui qui est faux).
- Remplacer `text-white` par `text-bb-on-danger` dans le bouton.
- Réserver la place des images des messages (proportions ou dimensions par défaut).
- Aligner les seuils d'écran cités sur `lg:` (1024 pixels).
- Passer les interlignes de paragraphe cités à `leading-relaxed`.
- Vérifier en 360 et 1280 pixels de large, dans les 8 thèmes, et ne régénérer les captures de référence que pour les changements voulus.

## Résultat

Niveaux d'empilement : les listes déroulantes de recherche (`TagSelector`, `LigueSearch`, `UserSearch`, `MultiLigueSearch`, `UserMapper`) et la barre d'outils collée de l'éditeur BBCode utilisent `--z-index-dropdown` (1500) au lieu de `z-20` ou `z-50`. Dans une fenêtre (`Sheet`, `Dialog`), l'ordre se règle à l'intérieur de la fenêtre, donc elles restent au-dessus de son contenu. Trois variables, commentées, sont ajoutées à l'échelle de `globals.css` : `--z-index-page-bar` (4000, barres collées en bas d'une page : barre d'envoi des écrans de rédaction, barres d'un sujet), `--z-index-screen` (5001, conversation plein écran de la messagerie, au-dessus de la barre basse) et `--z-index-fullscreen` (6500, carte en plein écran, au-dessus du bandeau des cookies et sous le panneau « Plus »). Les valeurs réelles ne changent pas, l'ordre de superposition non plus. Le tableau du skill `theming-rules` est aligné.

La variante `destructive` du bouton utilise `bg-bb-danger text-bb-on-danger`, comme `danger`. Les images des messages et des galeries ont `decoding="async"`. Leur place n'est pas réservée : la balise `[img]` ne donne pas leurs dimensions, et une hauteur minimale, essayée, étirait les petites images ; il faudrait enregistrer les dimensions à l'envoi de la photo pour supprimer le saut.

Seuils d'écran : `md:grid-cols-2` devient `lg:grid-cols-2` (articles du profil, page des tournois), et `xl:grid-cols-3` est retiré des listes d'articles et de ressources, qui gardent `sm:grid-cols-2` à côté de leur panneau de filtres. Les libellés courts sur téléphone (« Créer », « Soumettre », avec `max-sm:sr-only` sur la suite) sont gardés : ils permettent au bouton de tenir à côté du titre à 360 pixels, et le lecteur d'écran lit le libellé complet ; un commentaire l'explique maintenant.

Interlignes : `leading-relaxed` sur la phrase d'accroche de l'accueil, `leading-normal` sur le bandeau des cookies (pour qu'il tienne encore sur deux lignes à 360 pixels, carte 190). La ligne « rôle · date » d'un message garde `leading-snug` : c'est une ligne d'information, pas un paragraphe.

Vérifications : `corepack pnpm check` passe. Pas de test de bout en bout lancé (tests longs regroupés en fin de série, à la demande du user).

À essayer à la main : en 360 pixels, ouvrir une recherche de ligue ou de membre dans un formulaire et dans une fenêtre (la liste passe au-dessus de tout le reste) ; ouvrir la carte en plein écran ; ouvrir une conversation ; regarder un bouton « danger » dans le thème clair ; vérifier l'en-tête des articles, ligues et ressources.
