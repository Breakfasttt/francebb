# Connexion, rôles et bannissement

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Cette fonctionnalité permet aux coachs de se connecter au site (avec Discord, Google ou un lien magique reçu par email), de remplir leur profil à la première visite (l'onboarding), puis d'obtenir des droits selon leur rôle (coach, modérateur, admin…). Elle empêche aussi un membre banni d'agir sur le site. Aujourd'hui, la connexion est gérée par Auth.js directement dans le site (mode `legacy`) ; le futur hub de connexion (`apps/hub`, voir `docs/features/hub/README.md`) est prêt mais ne s'active qu'avec `AUTH_MODE=hub`.

## Ce que voit le coach

- `/auth/login` : une carte « Connexion » avec un bouton par méthode configurée sur le serveur (« Se connecter avec Discord », « … avec Google », champ « Adresse email » + « Recevoir un lien magique »). En mode hub (`AUTH_MODE=hub`), les trois mêmes boutons sont proposés et passent par le hub sans le montrer (carte 073). Un coach déjà connecté est renvoyé vers l'adresse demandée (`callbackUrl`). En développement seulement, une section « Mode Développement » liste des comptes de test.
- `/auth/verify-request` : « Vérifiez votre boîte mail », affichée après la demande d'un lien magique.
- `/auth/error` : message d'erreur lisible (configuration, accès refusé, lien expiré). Un compte hub dont l'email n'est pas vérifié aboutit ici avec « L'accès vous a été refusé ».
- `/auth/onboarding` : à la première connexion, le coach choisit son pseudo (3 caractères minimum), son avatar, son numéro NAF, sa région, son équipe, ses ligues, sa signature et son thème. Tant qu'il n'a pas fini, toutes les pages le renvoient ici, avec la page demandée dans `?callbackUrl=` : à la fin de l'inscription, il arrive sur cette page (carte 133). Seule une adresse du site est acceptée (`safeCallbackUrl`) ; sinon, il arrive sur l'accueil.
- `/banned` : un membre banni est redirigé vers cette page, qui affiche la raison du bannissement.
- Accès : visiteur pour la connexion ; membre connecté pour l'onboarding ; les droits ensuite dépendent du rôle.
- **Refonte (carte 091, ADR 0006)** : les quatre pages utilisent les composants et les couleurs v2 de `packages/ui` (`Card`, `Button`, `Field`, `Input`, `Select`, `Sheet`) ; leurs fichiers CSS ont été supprimés. Seule la mise en page a changé : actions des formulaires, noms des champs, redirections et `callbackUrl` sont identiques.
  - connexion, vérification et erreur : une carte centrée sur une colonne, boutons de 44 pixels sur toute la largeur, champ email avec un vrai libellé, lien vers les mentions légales ;
  - inscription : une seule page découpée en blocs empilés (avatar, profil de coach, ligues, signature, thème), deux colonnes de champs sur ordinateur seulement. Les boutons d'avatar ont un texte (« Aléatoire », « Générer », « Envoyer une image »). Le générateur d'avatar s'ouvre dans un panneau qui monte du bas sur téléphone et une fenêtre centrée sur ordinateur. Le thème se choisit avec le même sélecteur que le menu du compte (`AppShell/ThemePicker`), qui l'applique et l'enregistre tout de suite ;
  - le choix des ligues (`common/components/MultiLigueSearch`, partagé avec l'édition du profil) a été refait de la même façon : champs de 44 pixels en 16 pixels de texte, pastilles avec une croix de 44 pixels nommée « Retirer … ».
  - vérifié par `tests/e2e/inventaire/connexion.spec.ts` en taille ordinateur et téléphone, et par l'audit mobile (`/auth/login`, `/auth/onboarding`, `/auth/verify-request`, `/auth/error`) à 360 et 390 pixels.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/auth.ts` | Configuration Auth.js côté serveur : fournisseurs (Discord, Google, lien magique Nodemailer, `dev-login`, `hub`), callback `signIn` (promotion des emails `SUPERADMIN_EMAILS`, refus d'un compte hub non vérifié), callback `jwt` (relit le membre en base à chaque lecture de la session, carte 069), événement `createUser` (rattache un ancien membre `LegacyMember`), pages personnalisées. Exporte `isHubAuthMode`. |
| `apps/site/auth.config.ts` | Callbacks de base `jwt` / `session` et `authorized` (redirection vers l'onboarding), sans accès à la base ; complétés dans `auth.ts`. |
| `apps/site/proxy.ts` | Remplace `middleware.ts` (Next 16) : lit la session sur toutes les routes avec la configuration complète d'`auth.ts`, applique `authorized`, et réécrit le cookie de session avec le profil relu en base (cartes 017 et 069). |
| `apps/site/lib/authGuard.ts` | `getActiveSession()` : la session, ou `null` si non connecté **ou banni**. `getSession()` : session brute, réservée au layout. |
| `apps/site/lib/roles.ts` | `ROLE_POWER`, `ROLE_LABELS`, `getRolePower`, `getRoleLabel`, `isModerator`, `isAdmin`, `canManageRoles`, `canEditTargetRole`, `getAllowedRolesToAssign`. |
| `apps/site/lib/prisma.ts` | Client `prisma` qui ne renvoie jamais `User.email` (omit global) ; `prismaWithEmail` réservé à l'adapter Auth.js et aux mails. |
| `apps/site/app/auth/login/` | `page.tsx` (connexion), `DevLoginSection.tsx` et `actions.ts` (`createDevUser`, développement seulement). |
| `apps/site/app/auth/onboarding/` | `page.tsx`, `OnboardingForm.tsx`, `OnboardingSuccess.tsx`, `actions.ts` (`finishOnboarding`). |
| `apps/site/app/auth/error/page.tsx`, `app/auth/verify-request/page.tsx` | Pages d'erreur et « vérifiez vos mails ». |
| `apps/site/app/banned/page.tsx` + `common/components/BannedRedirect/BannedRedirect.tsx` | Page des bannis et redirection côté navigateur (montée dans `app/layout.tsx`). |

Utilisation dans une action serveur : `const session = await getActiveSession(); if (!session) return null;` puis contrôle du rôle avec `lib/roles.ts`. La session expose `session.user.id`, `role`, `isBanned`, `hasFinishedOnboarding`, `theme`.

## Les pièges

- **Adresse e-mail vérifiée obligatoire (carte 160).** La connexion directe rattache un compte Discord ou Google à un membre existant qui a la même adresse (`allowDangerousEmailAccountLinking`). Ce n'est sûr que si Discord (`profile.verified`) ou Google (`profile.email_verified`) certifie l'adresse : le rappel `signIn` refuse sinon, avec la page d'erreur `EmailNotVerified`. Sans ce contrôle, n'importe qui pouvait prendre le compte d'un membre en créant un compte Discord à son adresse. La connexion directe disparaîtra quand le hub sera en ligne (carte 161).
- **Membre supprimé ou base injoignable (carte 160).** Le rappel `jwt` renvoie `null` si le membre n'existe plus : Auth.js efface alors le cookie et la session est fermée. Si la base ne répond pas, le rôle est ramené à « coach » pour cette lecture. Avant, le jeton gardait son ancien rôle jusqu'à 30 jours.
- Toute action serveur qui lit ou écrit pour un membre passe par `getActiveSession()`, jamais `auth()` directement (exceptions : `app/debugActions.ts` et `app/auth/login/actions.ts`). Depuis la carte 052, les pages serveur font de même ; seules `/auth/login` et `/banned` utilisent `getSession()` (session brute, bannis compris), car elles concernent justement les bannis.
- Le lien vers la page de connexion porte l'adresse de retour dans `?callbackUrl=` : c'est le seul nom que lit `/auth/login`. Plusieurs pages utilisaient `?callback=`, ignoré, et le membre revenait à l'accueil au lieu de la page demandée (corrigé par la carte 052).
- Le rôle admin ou modérateur se vérifie **côté serveur**, jamais seulement dans la page.
- Le fournisseur `dev-login` est toujours déclaré, mais son `authorize` refuse tout hors `NODE_ENV === "development"`. Les tests smoke s'en servent.
- La session est un JWT ; `role`, `isBanned`, `theme`, `name` et `hasFinishedOnboarding` sont relus en base par le callback `jwt` **à chaque lecture de la session** (carte 069, qui a supprimé le délai de 5 minutes de la carte 017). Conséquence : un bannissement ou un changement de rôle fait par un modérateur prend effet dès la page suivante du membre concerné (testé par `tests/e2e/session-refresh.spec.ts`). La lecture se fait par l'identifiant du membre, donc très vite ; ne pas réintroduire de délai sans l'accord du responsable du projet, qui exige un bannissement immédiat. Le nouveau jeton n'est enregistré dans le cookie que par le proxy et par les routes `/api/auth/*` : un composant serveur ne peut pas réécrire un cookie.
- Un appel à `update()` côté navigateur force la relecture en base, qui écrase toutes les valeurs envoyées : c'est ce qui neutralise le `role` que `auth.config.ts` accepte depuis `update()` (vérifié : `update({ role: "SUPERADMIN" })` renvoie le rôle de la base). Ne jamais retirer cette relecture forcée sans retirer cette ligne. Après une modification de son propre profil (pseudo, thème, onboarding), le composant appelle `update()` pour que la session suive tout de suite (`ProfileEdit`, `OnboardingForm`, `OnboardingSuccess`).
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
- Fait aussi (carte 062) : l'inscription et le profil lisent les thèmes dans la liste officielle `lib/themes.ts` (8 thèmes depuis la refonte, ADR 0006) ; le thème « Sombre » est enregistré sous son vrai identifiant, `default` (avant, `dark`, inconnu du site). L'action `updateTheme` refuse un identifiant absent de cette liste. Les membres déjà enregistrés avec `dark` sont passés à `default` par la migration de données `20261030120000_theme_dark_to_default`.
- Fait aussi (carte 069) : le bannissement et le changement de rôle sont immédiats ; un test e2e vérifie qu'un membre banni pendant sa session est envoyé vers `/banned` à la page suivante, et qu'un administrateur rétrogradé perd `/administration`.
- Manque : test smoke du refus d'une action par un banni (reste de la carte 002).
- Hub : bascule prévue par les cartes 035, 037, 038, 039 ; la liaison dangereuse Discord/Google disparaîtra avec elle. La carte 036 (migration des comptes) est annulée par l'ADR-0004 : les membres se réinscriront via le hub.
