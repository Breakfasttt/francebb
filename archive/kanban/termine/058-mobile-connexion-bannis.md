---
id: 058
title: Mobile : connexion, inscription et page des bannis
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile propre sur /auth/login et /auth/onboarding ; /banned lisible dans les 7 thèmes (captures)
---

# 058 — Mobile : connexion, inscription et page des bannis

## Pourquoi

La page de connexion n'a aucune règle mobile ; à l'inscription, les champs trop petits font zoomer l'iPhone et les boutons d'avatar et de thème sont minuscules ; `/banned` a des couleurs en dur, illisibles dans le thème clair.

## Action

Règles mobiles pour `/auth/login` et `/auth/onboarding` (champs en 16 px, boutons de 44 px, proposer les 7 thèmes). `/banned` : couleurs par variables de thème.

## Résultat

- **Connexion** (`app/auth/login/page-mobile.css`, nouveau, ordinateur inchangé) : marges de la carte réduites. Avant, il ne restait que 212 pixels de large pour les boutons sur un téléphone de 360 pixels, et leur texte passait sur deux lignes ; maintenant chaque bouton tient sur une ligne et fait 48 pixels de haut. Le champ email est en 16 pixels (en dessous, l'iPhone zoome la page quand on tape dedans). Ce fichier est aussi chargé par l'inscription, qui reprend le conteneur et le titre de la connexion.
- **Inscription** (`app/auth/onboarding/onboarding-mobile.css`, nouveau) : les deux blocs mobiles de `onboarding.css` y sont déplacés tels quels, puis complétés. Tous les champs passent en 16 pixels et 44 pixels de haut, y compris ceux de la recherche de ligues (`MultiLigueSearch` écrit sa taille dans l'attribut `style`, d'où un `!important` commenté) ; les trois boutons d'avatar passent de 36 à 44 pixels, et celui d'envoi d'image reçoit un nom (« Envoyer une image ») ; les intitulés de la recherche de ligues passent de 11 à 12 pixels ; marges réduites pour élargir les champs. Les 7 thèmes étaient déjà proposés avec des pastilles de 44 pixels (carte 051). Dans `onboarding.css`, le sous-titre (gris `#aaa`) et les styles du générateur d'avatar (texte blanc) utilisent maintenant des variables de thème : ils étaient peu lisibles dans les thèmes clairs, sur ordinateur aussi.
- **Page des bannis** : `app/banned/page.tsx` n'a plus de style écrit dans le composant ; `page.css` et `page-mobile.css` (nouveaux) n'utilisent que des variables de thème. L'icône est une pastille pleine de la couleur « danger » du thème (avec la couleur de texte prévue pour les pastilles), le titre et la raison sont dans la couleur du texte, l'encadré de la raison a un liseré « danger ». Le lien de retour devient un `CTAButton` (26 pixels de haut avant, 44 et plus maintenant, pleine largeur sur téléphone). Repris du patch de l'agent précédent : le passage aux classes et le `CTAButton` ; le fichier `page.css` qu'il importait sans l'avoir créé est écrit ici. Captures de référence ajoutées dans `tests/e2e/visual-themes.spec.ts` (« page des bannis sur téléphone », 7 thèmes, 390 pixels).
- **Menu latéral du téléphone** (`common/components/MobileSidebar/MobileSidebar-mobile.css`, nouveau) : la pastille de profil et le bouton « Déconnexion » sont l'un sous l'autre, chacun sur toute la largeur et à 44 pixels ; le pseudo n'est plus coupé (« Mo… » avant, « Modo E2E » maintenant). La croix de fermeture, le logo, les icônes (messagerie, modération, administration) et les liens du pied de menu passent aussi à 44 pixels. Dans `SignInButton`, la hauteur de 40 pixels écrite dans le composant devient la classe `signin-action` (`SignInButton.css`) : la barre de navigation de l'ordinateur ne change pas, et le menu du téléphone peut l'agrandir. La déconnexion par le hub (`hubLogout`, `/auth/logout`) n'est pas touchée.
- **Audit mobile** (`tests/e2e/mobile-audit.spec.ts`) : chaque page est maintenant ouverte par le visiteur qui lui correspond (visiteur sans compte, nouveau membre, membre banni ou modérateur, chacun dans son propre navigateur). Avant, tout était mesuré en modérateur : `/auth/login` renvoyait vers l'accueil et n'avait jamais été mesurée. Ajout de `/auth/onboarding` (avec un nouveau membre créé par l'audit) et de `/banned`. Le relevé note aussi l'adresse finale, pour repérer une redirection.
- **Mesures** (360 et 390 pixels par l'audit ; 360, 390 et 430 pixels par des captures) : sur `/auth/login`, `/auth/onboarding` et `/banned`, avant 5 cibles trop petites, 5 champs sous 16 pixels et 2 textes sous 12 pixels par taille d'écran ; après, 0 partout, sans défilement horizontal. Audit complet : 30 cibles trop petites avant, 20 après ; 10 champs sous 16 pixels avant, 0 après ; 8 textes sous 12 pixels avant, 4 après (ceux de `/profile`) ; 6 éléments coupés avant comme après (les tuiles de `/carte`, faux positif connu). Captures dans `logs/058-mobile/avant/` et `logs/058-mobile/apres/` (dont `/banned` dans les 7 thèmes à 390 et 1280 pixels, menu latéral connecté et visiteur), relevés dans `audit-avant.json` et `audit-apres.json`.
- **Vérifications** : types, 0 erreur ; ESLint, 547 erreurs (plafond abaissé de 551 à 547) ; tests de bout en bout, 59 réussis et 1 ignoré volontairement (l'audit), dont les captures ordinateur des 7 thèmes inchangées et les 7 nouvelles captures de `/banned` ; tests de connexion par le hub (`apps/hub`, `test:sso`), 5 réussis.
- **Non traité** : le thème « Sombre » de l'inscription et du profil enregistre l'identifiant `dark`, absent de la liste des thèmes (`default`) ; le site affiche bien le thème par défaut, mais à vérifier dans une carte dédiée. Les boutons Discord et Google gardent leurs couleurs de marque écrites en dur.
