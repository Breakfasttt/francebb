# Connexion, rôles et bannissement

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Cette fonctionnalité permet aux coachs de se connecter au site (avec Discord, Google ou un lien magique reçu par email), de remplir leur profil à la première visite (l'onboarding), puis d'obtenir des droits selon leur rôle (coach, modérateur, admin…). Elle empêche aussi un membre banni d'agir sur le site. Aujourd'hui, la connexion est gérée par Auth.js directement dans le site (mode `legacy`) ; le futur hub de connexion (`apps/hub`, voir `docs/features/hub/README.md`) est prêt mais ne s'active qu'avec `AUTH_MODE=hub`.

## Ce que voit le coach

- `/auth/login` : une carte « Connexion » avec un bouton par méthode configurée sur le serveur (« Se connecter avec Discord », « … avec Google », champ email + « Recevoir un lien magique »). En mode hub, un bouton « Se connecter avec le compte BBFrance » apparaît en premier. Un coach déjà connecté est renvoyé vers l'adresse demandée (`callbackUrl`). En développement seulement, une section « Mode Développement » liste des comptes de test.
- `/auth/verify-request` : « Vérifiez votre boîte mail », affichée après la demande d'un lien magique.
- `/auth/error` : message d'erreur lisible (configuration, accès refusé, lien expiré). Un compte hub dont l'email n'est pas vérifié aboutit ici avec « L'accès vous a été refusé ».
- `/auth/onboarding` : à la première connexion, le coach choisit son pseudo (3 caractères minimum), son avatar, son numéro NAF, sa région, son équipe, ses ligues, sa signature et son thème. Tant qu'il n'a pas fini, toutes les pages le renvoient ici.
- `/banned` : un membre banni est redirigé vers cette page, qui affiche la raison du bannissement.
- Accès : visiteur pour la connexion ; membre connecté pour l'onboarding ; les droits ensuite dépendent du rôle.
- **Sur téléphone** (carte 058, règles dans des fichiers `*-mobile.css`, ordinateur inchangé) :
  - connexion (`app/auth/login/page-mobile.css`) : marges de la carte réduites (avant, il ne restait que 212 pixels de large pour les boutons sur un téléphone de 360 pixels, et leur texte passait sur deux lignes), boutons de 48 pixels de haut, champ email en 16 pixels (en dessous, l'iPhone zoome la page quand on tape dedans) ;
  - inscription (`app/auth/onboarding/onboarding-mobile.css`, qui reprend aussi les anciens blocs mobiles de `onboarding.css`) : tous les champs en 16 pixels et 44 pixels de haut, y compris ceux de la recherche de ligues ; boutons d'avatar de 36 à 44 pixels (le bouton d'envoi d'image a maintenant un nom, « Envoyer une image ») ; intitulés à 12 pixels au moins ; marges réduites. Les pastilles de thème proposent les 7 thèmes et font 44 pixels (carte 051) ; leurs couleurs sont écrites en dur, car chacune montre un autre thème que le thème actif. Le sous-titre et les styles du générateur d'avatar utilisent désormais des variables de thème (avant, gris et blanc écrits en dur, peu lisibles dans les thèmes clairs) ;
  - menu latéral : la pastille de profil du membre connecté et le bouton « Déconnexion » sont l'un sous l'autre, sur toute la largeur et à 44 pixels de haut (`common/components/MobileSidebar/MobileSidebar-mobile.css`). Avant, ils partageaient une ligne et le pseudo était coupé (« Mo… »). Dans la barre de navigation de l'ordinateur, les deux boutons gardent 40 pixels (classe `signin-action` de `SignInButton.css`, qui remplace un style écrit dans le composant) ;
  - audit mobile propre sur `/auth/login`, `/auth/onboarding` et `/banned` à 360 et 390 pixels ; vérifié aussi à 430 pixels (`logs/058-mobile/`).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/auth.ts` | Configuration Auth.js côté serveur : fournisseurs (Discord, Google, lien magique Nodemailer, `dev-login`, `hub`), callback `signIn` (promotion des emails `SUPERADMIN_EMAILS`, refus d'un compte hub non vérifié), callback `jwt` (relit le membre en base à chaque appel), événement `createUser` (rattache un ancien membre `LegacyMember`), pages personnalisées. Exporte `isHubAuthMode`. |
| `apps/site/auth.config.ts` | Callbacks partagés `jwt` / `session` et `authorized` (redirection vers l'onboarding), aussi utilisés par `proxy.ts`. |
| `apps/site/proxy.ts` | Remplace `middleware.ts` (Next 16) : lit la session sur toutes les routes et applique `authorized`. |
| `apps/site/lib/authGuard.ts` | `getActiveSession()` : la session, ou `null` si non connecté **ou banni**. `getSession()` : session brute, réservée au layout. |
| `apps/site/lib/roles.ts` | `ROLE_POWER`, `ROLE_LABELS`, `getRolePower`, `getRoleLabel`, `isModerator`, `isAdmin`, `canManageRoles`, `canEditTargetRole`, `getAllowedRolesToAssign`. |
| `apps/site/lib/prisma.ts` | Client `prisma` qui ne renvoie jamais `User.email` (omit global) ; `prismaWithEmail` réservé à l'adapter Auth.js et aux mails. |
| `apps/site/app/auth/login/` | `page.tsx` (connexion), `DevLoginSection.tsx` et `actions.ts` (`createDevUser`, développement seulement). |
| `apps/site/app/auth/onboarding/` | `page.tsx`, `OnboardingForm.tsx`, `OnboardingSuccess.tsx`, `actions.ts` (`finishOnboarding`). |
| `apps/site/app/auth/error/page.tsx`, `app/auth/verify-request/page.tsx` | Pages d'erreur et « vérifiez vos mails ». |
| `apps/site/app/banned/page.tsx` + `common/components/BannedRedirect/BannedRedirect.tsx` | Page des bannis et redirection côté navigateur (montée dans `app/layout.tsx`). |

Utilisation dans une action serveur : `const session = await getActiveSession(); if (!session) return null;` puis contrôle du rôle avec `lib/roles.ts`. La session expose `session.user.id`, `role`, `isBanned`, `hasFinishedOnboarding`, `theme`.

## Les pièges

- Toute action serveur qui lit ou écrit pour un membre passe par `getActiveSession()`, jamais `auth()` directement (exceptions : `app/debugActions.ts` et `app/auth/login/actions.ts`). Depuis la carte 052, les pages serveur font de même ; seules `/auth/login` et `/banned` utilisent `getSession()` (session brute, bannis compris), car elles concernent justement les bannis.
- Le lien vers la page de connexion porte l'adresse de retour dans `?callbackUrl=` : c'est le seul nom que lit `/auth/login`. Plusieurs pages utilisaient `?callback=`, ignoré, et le membre revenait à l'accueil au lieu de la page demandée (corrigé par la carte 052).
- Le rôle admin ou modérateur se vérifie **côté serveur**, jamais seulement dans la page.
- Le fournisseur `dev-login` est toujours déclaré, mais son `authorize` refuse tout hors `NODE_ENV === "development"`. Les tests smoke s'en servent.
- La session est un JWT ; `role` et `isBanned` sont rafraîchis depuis la base par le callback `jwt`. Ce rafraîchissement neutralise aussi le `role` que `auth.config.ts` accepte depuis `update()` côté navigateur : ne jamais retirer la relecture sans retirer cette ligne.
- `User.email` n'est jamais renvoyé par `prisma` (omit global) : un `include: { author: true }` ne peut pas fuiter d'adresse. Besoin de l'email : `select: { email: true }` explicite ou `prismaWithEmail`. Test smoke « aucun email d'auteur ».
- `allowDangerousEmailAccountLinking: true` sur Discord et Google : un compte Discord et un compte Google de même email deviennent le même membre. Le fournisseur `hub` l'utilise aussi, mais seulement pour un email certifié (`email_verified`, contrôlé dans `signIn`).
- Le cookie `onboarding_sync` (60 s) évite une boucle de redirection juste après l'onboarding, le temps que le JWT soit régénéré.
- `finishOnboarding` renvoie `{ success, error }` (carte 052) et le formulaire affiche l'erreur dans une notification. L'adresse de retour après connexion (`callbackUrl`) passe par `safeCallbackUrl` (`lib/safeRedirect.ts`) : seule une adresse interne au site est acceptée, ce qui empêche la redirection vers un site extérieur (carte 050, testé).

## Les mots expliqués

| Mot | Sens |
|---|---|
| Fournisseur (*provider*) | Une méthode de connexion déclarée dans Auth.js : Discord, Google, lien magique, `dev-login`, `hub`. |
| Lien magique | Lien à usage unique envoyé par email : cliquer dessus connecte, sans mot de passe. |
| Callback `jwt` / `session` | Fonctions d'Auth.js appelées à chaque lecture de session : elles remplissent le jeton puis la session (`role`, `isBanned`…). |
| Liaison de comptes par email | Rattacher automatiquement une nouvelle méthode de connexion au membre qui a déjà le même email. Risqué si l'email n'est pas vérifié. |
| `SUPERADMIN_EMAILS` | Variable d'environnement : liste d'emails promus Super Admin à la connexion. |
| `LegacyMember` | Membre de l'ancien forum ; son pseudo et son numéro NAF sont repris à la création du compte. |
| Omit global | Réglage du client Prisma qui retire un champ (ici l'email) de tous les résultats, sauf demande explicite. |

## État

- Fait : ban appliqué côté serveur dans toutes les actions (carte 002) ; email masqué par défaut ; test smoke de la redirection des bannis.
- Manque : test smoke du refus d'une action par un banni (reste de la carte 002) ; la relecture en base dans `jwt` coûte une requête par `auth()` (carte 017) . Les thèmes « Sombre » de l'inscription et du profil enregistrent l'identifiant `dark`, absent de la liste des thèmes de `ThemeProvider` (`default`) : le site affiche alors le thème par défaut, mais l'identifiant enregistré diffère (à vérifier dans une carte dédiée).
- Hub : bascule prévue par les cartes 035, 037, 038, 039 ; la liaison dangereuse Discord/Google disparaîtra avec elle. La carte 036 (migration des comptes) est annulée par l'ADR-0004 : les membres se réinscriront via le hub.
