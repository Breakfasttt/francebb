# Hub de connexion (apps/hub)

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Le hub donne aux coachs un seul compte BBFrance pour toutes les applications (le site, bbscheme, et les futures). Le coach se connecte une fois au hub (Discord, Google ou lien magique), puis chaque application lui demande « qui est connecté ? » grâce au standard OIDC, sans lui redemander de se connecter. La décision est consignée dans l'ADR-0003. Le hub n'est pas encore en production : le site continue d'utiliser sa propre connexion tant que `AUTH_MODE=hub` n'est pas activé.

## Ce que voit le coach

- **Le hub est invisible** (carte 073). Sur le site, en mode hub, `/auth/login` garde ses boutons habituels : Discord, Google et lien par email. Chacun passe par le hub, qui enchaîne directement sur Discord, Google ou l'envoi du lien : le coach ne voit du hub qu'un court « Redirection… », ou, pour l'email, « Vérifie ta boîte mail ». Le lien reçu ramène le coach connecté sur le site, à condition de l'ouvrir dans le même navigateur. Un coach déjà connecté au hub revient sur le site sans aucun écran.
- `/sign-in` (sur le hub), formulaire complet : boutons « Continuer avec Discord » et « Continuer avec Google », puis un champ email et « Recevoir un lien de connexion ». En dev/test seulement, un formulaire de mot de passe et la section « Comptes de test » (carte 153) : un bouton par compte de test, qui connecte d'un clic, et « Créer un compte de test ». Le site, le passeport et la déconnexion se comportent alors comme en production, ce que la connexion de test du site (`dev-login`) ne permet pas en mode hub. Depuis le site, on y arrive par le bouton « Comptes de test du hub » de la page de connexion (développement et mode hub seulement). Il ne s'affiche que si l'application n'indique pas de moyen de connexion, ou si le moyen indiqué échoue (avec le message d'erreur), ou si le lien par email a expiré.
- `/consent` : écran « Autoriser <application> ? », affiché seulement pour une application tierce (carte 127). Il liste les droits demandés en phrases simples (`lib/scopes.ts`), et « Refuser » a la même taille qu'« Autoriser ». Les applications BBFrance sont enregistrées sans écran de consentement.
- `/` (accueil du hub) = **le passeport Blood Bowl** (carte 120). Sans session : le formulaire de connexion, qui ramène ici. Avec session, en une colonne :
  - **Profil** : pseudo, NAF, région, avatar, langue, fuseau, enregistrés par `PATCH /api/v1/profile` ;
  - **Moyens de connexion** : Discord, Google, email ;
  - **Applications liées**, avec « Retirer l'accès » (jetons révoqués, consentement effacé) ;
  - **Appareils connectés au passeport**, avec « Déconnecter » ;
  - **Supprimer mon compte** (carte 123) : explication en langage simple, puis effacement prévu dans 30 jours. Pendant ce délai, un bandeau rappelle la date, aucune application ne peut obtenir de connexion (le hub renvoie au passeport) et le bouton devient « Annuler la suppression ». Un email confirme la demande, un autre la rappelle une semaine avant ;
  - « Se déconnecter du passeport ».

  Un bouton « Retour vers <application> » n'apparaît que si l'adresse contient `client_id` et `return_to`, et que `return_to` a la même origine qu'une adresse enregistrée de ce client. Le hub n'a aucun lien codé en dur vers une application.
- Sur le site, en mode hub, le bouton « Déconnexion » ferme aussi la session du hub : à la connexion suivante, le hub redemande les identifiants. Le coach revient ensuite sur l'accueil du site.
- Un compte banni au hub voit « Ce compte BBFrance a été suspendu. » sur `/sign-in` et ne peut plus se connecter à aucune application.
- Accès : tout visiteur. Le hub ne connaît aucun rôle métier (modérateur, admin) : ces rôles restent sur le site.
- **Sur téléphone** : le hub n'a pas de fichier mobile, mais sa mise en page est simple et pensée pour : une seule colonne avec 16 px de marge de chaque côté, les boutons et les champs de `packages/ui` à la taille tactile (44 px de haut au moins), des champs en police de 16 px (pas de zoom automatique sur iPhone). Points à vérifier : Discord et Google s'affichent même s'ils ne sont pas configurés au hub (le site les propose toujours en mode hub ; sans réglages au hub, le coach tombe sur le formulaire du hub avec une erreur) ; un seul thème (les couleurs de « Vestiaire », le thème par défaut du site), pas les 8 thèmes ; la reconnexion silencieuse sur Safari iOS n'est possible qu'avec un domaine parent commun (carte 035, non testable en local).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/hub/lib/auth.ts` | Instance Better Auth : base, fournisseurs Discord/Google (seulement si leurs clés existent), liaison de comptes, mot de passe dev, envoi du lien magique (`sendMagicLink`, qui appelle `lib/mail.ts`). |
| `apps/hub/lib/mail.ts` | Envoi SMTP du lien magique (mêmes réglages `SMTP_*` que le site). Sans `SMTP_HOST`, le lien s'affiche dans la console, en développement seulement (en production, l'envoi est refusé et le lien n'est pas écrit dans les journaux). `HUB_DEV_MAIL_FILE` (tests) : fichier où écrire le dernier lien. |
| `apps/hub/lib/oauthResume.ts` | `readRequestedLogin()` : lit le moyen demandé par l'application (`login_method` = `discord`, `google` ou `email`, avec `login_hint` pour l'email), seulement dans une demande signée par le hub. `magicLinkCallbacks()` : adresse de reprise du flux OIDC mise dans le lien magique. |
| `apps/hub/lib/authPlugins.mjs` | `authPlugins()` : plugins `jwt`, `magicLink`, `oauthProvider` (pages, scopes, `customIdTokenClaims`) et `admin` (bannissement). Partagé avec le générateur de schéma. |
| `apps/hub/lib/authClient.ts` | Client Better Auth du navigateur, utilisé par les pages `/sign-in` et `/consent`. |
| `apps/hub/lib/clientSecret.mjs` | `hashClientSecret()` : hachage SHA-256 des secrets des applications clientes. |
| `apps/hub/lib/prisma.mjs` | Client Prisma de la base du hub (`HUB_DATABASE_URL`), séparée de celle du site. |
| `apps/hub/app/api/auth/[...all]/route.ts` | Toutes les adresses Better Auth : connexion, sessions, `authorize`, `token`, `userinfo`, clés. |
| `apps/hub/app/api/auth/.well-known/openid-configuration/route.ts` | Document de découverte OIDC lu par le site. |
| `apps/hub/app/api/doc/route.ts`, `apps/hub/lib/apiDoc/` | `GET /api/doc` : documentation de l'API au format OpenAPI (carte 117). `buildApiDoc()` part de la description du plugin `openAPI()` de Better Auth, retire les routes d'administration et de développement, et ajoute les routes propres au hub décrites dans `hubRoutes.ts`. `?route=<chemin>` ne renvoie qu'une route. |
| `apps/hub/lib/profile.ts`, `lib/passportPlugin.ts`, `app/api/v1/profile/route.ts` | Profil du coach (carte 119). `GET`/`PATCH /api/v1/profile`, avec le jeton d'accès d'une application (portées `bbfrance:profile` pour lire, `bbfrance:profile:write` pour modifier) ou la session du coach sur le hub. `validateProfileUpdate()` vérifie les champs, `isNameAvailable()` l'unicité du pseudo et les pseudos réservés, `uniqueNameFor()` rend unique le pseudo d'un nouveau compte Discord ou Google (« Pseudo 2 »). |
| `apps/hub/lib/events.mjs`, `lib/eventSignature.mjs`, `scripts/client-hooks.mjs` | Événements signés vers les applications (carte 121) : `user.updated` (profil modifié, bannissement levé) et `user.banned`. `emitUserEvent()` prépare un envoi par application qui connaît le coach (jeton ou consentement) et qui a une adresse d'événements (table `clientHook`, remplie par `client-hooks.mjs`), puis `deliverDueEvents()` envoie, et renvoie plus tard en cas d'échec (table `outboundEvent`, 10 essais). Format décrit dans la partie `webhooks` de `/api/doc`. |
| `apps/hub/lib/verifyEvent.mjs` | Code de référence, sans dépendance, à recopier dans chaque application pour vérifier un événement : signature, envoi de moins de 5 minutes, identifiant pas encore reçu. |
| `apps/hub/app/page.tsx`, `app/passport/`, `lib/applications.ts`, `app/api/v1/applications/` | Pages du passeport (carte 120) : `ProfileForm`, `Applications` (droits expliqués en français), `Sessions` (routes de sessions de Better Auth), `SignOutButton`. `listUserApplications()` et `revokeUserApplication()` : applications qui ont accès au compte (jeton valable ou consentement) ; `validReturnLink()` : bouton de retour. Composants `PassportSection` (une carte par section) et `ItemList` (liste avec un bouton facultatif). |
| `apps/hub/lib/accountDeletion.ts`, `app/passport/DeleteAccount.tsx`, `app/api/v1/account/delete/` | Suppression du compte (carte 123). `requestDeletion()` : date d'effacement à 30 jours, autres appareils déconnectés, accès des applications retiré, `user.deletion_scheduled`, email. `cancelDeletion()` : `user.deletion_cancelled`. `processDeletions()` (tâche quotidienne) : rappel 7 jours avant, `user.deleted` à l'échéance, puis effacement au hub quand toutes les applications ont accusé réception. Restent seulement l'empreinte du pseudo (table `reservedName`), celle de l'email d'un compte banni (`bannedEmail`, refusé à l'inscription) et le journal d'audit sous forme d'empreinte. |
| `apps/hub/lib/thirdParty.ts`, `scripts/validate-client.mjs`, `app/consent/` | Applications tierces (carte 127) : refusées tant que `HUB_THIRD_PARTY_APPS` n'est pas `1` ; créées désactivées par `register-client.mjs --tiers` (jamais l'email) ; activées après validation par `validate-client.mjs` ; quota de `HUB_THIRD_PARTY_QUOTA` demandes par heure sur `/api/v1/profile` (1000 par défaut, réponse 429 au-delà). |
| `apps/hub/lib/audit.mjs` | `writeAudit()` : journal d'audit (table `auditLog`) des inscriptions, connexions, modifications, bannissements et suppressions. Identifiant et adresse IP remplacés par une empreinte HMAC (`auditHash`). Appelé par les `databaseHooks` de `lib/auth.ts` et par `scripts/ban-user.mjs`. |
| `apps/hub/lib/purge.ts`, `app/api/cron/daily/route.ts`, `vercel.json` | Tâche nocturne (3 h, tâche planifiée Vercel, secret `CRON_SECRET`) : purge du journal de plus d'un an, des sessions et vérifications expirées et des compteurs de limite inactifs ; nouvel essai des événements non reçus. |
| `apps/hub/next.config.ts` | En-têtes de sécurité de toutes les réponses : CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy. |
| `apps/hub/lib/devAccounts.ts`, `app/sign-in/DevAccounts.tsx`, `app/sign-in/devActions.ts` | Comptes de test pour se connecter en local (carte 153). Email en `@test.com`, mot de passe commun (`lib/devAccountPassword.ts`), email marqué vérifié pour que le site les accepte. |
| `apps/hub/app/sign-in/page.tsx` | Page de connexion : connexion automatique (`AutoSignIn.tsx`) si l'application a indiqué un moyen, sinon formulaire complet (`SignInForm.tsx`). |
| `app/consent/page.tsx`, `app/page.tsx` | Pages de consentement et d'accueil. |
| `app/globals.css`, `postcss.config.mjs`, `app/components/` | Apparence (carte 128) : Tailwind v4 et les composants de `packages/ui`, comme le site. Sans attribut `data-theme`, le thème par défaut du site s'applique ; le hub ne propose aucun choix de thème. `CenteredCard` (carte seule au centre : connexion, consentement) et `Messages` (texte secondaire, erreur, succès). |
| `apps/hub/scripts/generate-schema.mjs` | Génère `prisma/schema.prisma` à partir des tables Better Auth (vérifié en CI). |
| `apps/hub/scripts/register-client.mjs` | Enregistre une application cliente (avec son adresse de retour après déconnexion) et affiche une seule fois son id et son secret. |
| `apps/hub/scripts/ban-user.mjs` | `pnpm ban <email> "<raison>"` ou `--unban` : bannit un compte, ferme ses sessions et révoque ses jetons d'accès aux applications. |
| `apps/hub/scripts/e2e-setup.mjs`, `tests/sso.spec.ts` | Préparation sur base jetable et test de bout en bout hub ↔ site (`pnpm test:sso`, lancé en CI). |
| `apps/hub/scripts/api-test-setup.mjs`, `playwright.api.config.ts`, `tests/api/` | Tests de l'API du hub seul, sans le site (`pnpm test:api`). Ils partagent la base de test `hub-e2e` avec `test:sso` : ne pas lancer les deux en même temps. |
| `apps/site/app/auth/login/page.tsx` | En mode hub, les boutons Discord, Google et email appellent `signIn("hub", …, { login_method, login_hint })` : le moyen choisi part au hub dans la demande d'autorisation. Hors mode hub, rien ne change. |
| `apps/site/auth.ts` | Côté site : fournisseur `hub` actif si `AUTH_MODE=hub` et `HUB_ISSUER` définis ; en mode hub, les fournisseurs directs Discord, Google et email du site sont retirés (une seule porte d'entrée : le hub) ; refus si `email_verified` n'est pas vrai. Garde l'id_token du hub dans le cookie de session chiffré (`hubIdToken`), jamais dans la session lisible par le navigateur, qui reçoit seulement `hubLogout: true`. |
| `apps/site/app/auth/logout/route.ts` | Déconnexion du site (POST seulement) : lit l'id_token côté serveur (`getToken`), puis redirection vers la page de déconnexion du hub (`/oauth2/end-session`). Appelée par `signOutUser` (`common/utils/signOutUser.ts`, boutons de déconnexion de la coquille) quand `hubLogout` est vrai. |

Adresses publiques : documentation de l'API `<BETTER_AUTH_URL>/api/doc`, aussi indiquée par le champ `service_documentation` de la découverte `<BETTER_AUTH_URL>/api/auth/.well-known/openid-configuration` (issuer `<BETTER_AUTH_URL>/api/auth`). Scopes `openid profile email offline_access bbfrance:profile bbfrance:profile:write`. L'id_token contient `name`, `picture`, `email`, `email_verified` et, avec `bbfrance:profile`, `naf`, `region`, `locale`, `zoneinfo`, `member_since` (aussi renvoyés par userinfo).

## Valider une application tierce

1. La personne qui la propose envoie : nom de l'application, adresse de retour (https), droits voulus et pourquoi, contact, politique de confidentialité.
2. Vérifier que les droits demandés servent vraiment l'application (jamais l'email), que l'adresse appartient bien au demandeur et que la politique de confidentialité existe.
3. Enregistrer l'application : `node scripts/register-client.mjs "<nom>" <adresse de retour> --tiers`. Transmettre l'identifiant et le secret par un canal privé.
4. L'activer : `node scripts/validate-client.mjs "<nom>"` (`--disable` pour la couper). Le réglage `HUB_THIRD_PARTY_APPS=1` doit être actif sur le hub.

## Les pièges

- La base du hub est séparée de celle du site. Le hub ne stocke aucun rôle métier.
- Une application cliente ne rattache un compte hub à un membre existant que si `email_verified` est vrai.
- Liaison Discord/Google ↔ compte hub : seulement si le fournisseur certifie l'email (pas de `trustedProviders`).
- Connexion par mot de passe : dev/test uniquement (`HUB_DEV_PASSWORD_LOGIN=1`, refusée en production par `lib/auth.ts`). Les comptes de test (carte 153) en dépendent : sans ce réglage, ou en production, le serveur refuse de les lister et de les créer, et la section reste cachée.
- `prisma/schema.prisma` est généré : ne pas l'éditer. Après un ajout de plugin : `node scripts/generate-schema.mjs` puis `pnpm exec prisma migrate dev`.
- better-auth et ses compagnons (`@better-auth/core`, `better-call`…) se montent ensemble, sinon deux copies coexistent et les types des plugins cassent.
- Le chemin `/token` du plugin `jwt` est désactivé : il entre en conflit avec celui d'OAuth. Les adresses `/open-api/generate-schema` et `/reference` du plugin `openAPI` le sont aussi, parce qu'elles montrent les routes d'administration : la documentation passe uniquement par `/api/doc`.
- Sécurité (carte 118) : limite de requêtes stockée en base (table `rateLimit`, active en production ou avec `HUB_RATE_LIMIT=1`), jetons Discord et Google chiffrés avec `BETTER_AUTH_SECRET` (à ne jamais changer en production), nouvelle clé de signature tous les 90 jours, l'ancienne restant valable 30 jours. Le schéma généré traduit les nombres `bigint` de Better Auth en `BigInt`.
- La CSP autorise les scripts en ligne, dont Next.js a besoin. Si une page du hub ne s'affiche plus, regarder d'abord la console du navigateur (message « Content Security Policy »).
- **Identifiant et pseudo sont distincts** (ADR-0007) : `User.id` (le `sub` des jetons) ne change jamais et sert aux applications à rattacher leurs données ; le pseudo (`name`) change. Son unicité passe par `nameKey` (minuscules, unique en base).
- Le profil ne se modifie que par `/api/v1/profile` : `/update-user` de Better Auth est désactivé, et les champs ajoutés ont `input: false`. Le numéro NAF est déclaré par le coach, jamais vérifié.
- Un client enregistré avant la carte 119 n'a pas les portées `bbfrance:profile` : le supprimer et l'enregistrer de nouveau.
- Toute demande accompagnée d'un cookie du hub doit porter l'en-tête `Origin` (protection de Better Auth contre les requêtes forgées) : un navigateur l'envoie tout seul, un test doit l'ajouter. Les applications appellent `/oauth2/token` sans cookie.
- Une application qui n'accuse jamais réception de `user.deleted` bloque l'effacement au hub : la tâche quotidienne l'écrit dans la console et le journal (« suppression bloquée »). Il faut alors réparer l'application ; l'événement reste renvoyable tant qu'il n'est pas abandonné.
- Better Auth refuse un POST sans corps JSON (erreur 415) : les pages envoient `{}`.
- Le hub ne prévient une application que pour les coachs qu'elle connaît déjà. La raison d'un bannissement reste au hub. Le secret d'événements est stocké chiffré avec `BETTER_AUTH_SECRET`. Un événement n'est envoyé qu'une fois une ligne écrite en base, donc un envoi raté n'est jamais perdu.
- La base locale (`prisma dev`) ne sert qu'une requête à la fois : dans le hub, les lectures sont faites l'une après l'autre (pas de `Promise.all`). Un message « bind message supplies … parameters » dans la console des tests vient de cette limite et n'existe pas avec Neon.
- La confirmation avant de retirer un accès ou de supprimer le compte reste celle du navigateur (`window.confirm`). Elle pourra passer à `ConfirmDialog` de `packages/ui` quand ce composant sera commité par la refonte du site.
- Une nouvelle route dans `app/api` doit être décrite dans `lib/apiDoc/hubRoutes.ts`, sinon `pnpm test:api` échoue.
- Un bannissement au hub n'agit pas sur une session déjà ouverte sur le site : elle dure jusqu'à son expiration. Pour un effet immédiat, bannir aussi le membre sur le site (son bannissement local reste en place).
- La route de découverte OIDC force un type (`as unknown as`) : avec 4 plugins, TypeScript ne déduit plus tous les endpoints. Le test SSO vérifie que la route fonctionne.
- Le moyen de connexion indiqué par le site n'est lu que dans une demande signée par le hub (paramètre `sig`), et seules les valeurs `discord`, `google` et `email` (avec une adresse valide) sont acceptées ; sinon, formulaire normal. Un rechargement de « Vérifie ta boîte mail » ne renvoie pas d'email (mémoire de l'onglet).
- Le lien magique contient l'adresse `/api/auth/oauth2/authorize?…` de la demande d'origine, dont la partie après « ? » est encodée deux fois : Better Auth la décode deux fois. Si `pnpm test:sso` casse après une mise à jour de Better Auth, regarder d'abord `lib/oauthResume.ts`.
- Le lien magique doit être ouvert dans le navigateur qui l'a demandé : le site y a rangé les cookies de vérification de la connexion (PKCE et state). Ailleurs, la connexion au hub réussit mais le site la refuse.
- Le lien magique part par SMTP (carte 038). Si l'envoi échoue, le formulaire affiche une erreur au lieu de « Lien de connexion envoyé ». En production sans SMTP configuré, l'envoi est refusé.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Application cliente | Application (le site, bbscheme…) enregistrée auprès du hub, avec un id et un secret, qui lui délègue la connexion. |
| Issuer / découverte | L'adresse qui identifie le hub, et le document qui liste ses autres adresses (connexion, jetons, clés). |
| Scope | Ce que l'application demande à connaître : identité (`openid`), profil, email, connexion durable (`offline_access`). |
| Consentement | Écran où le coach accepte qu'une application lise son profil. Sauté pour les applications BBFrance (`skipConsent`). |
| `email_verified` | Information de l'id_token : le hub certifie que le coach possède bien cet email. |
| Déconnexion globale (`end_session`) | Adresse du hub qui ferme sa session ; l'application y envoie le coach avec son id_token au moment de la déconnexion. |
| `login_method` | Paramètre propre à BBFrance, ajouté par le site à la demande d'autorisation : le moyen de connexion choisi sur son écran. Le hub le reçoit recopié et signé par le plugin, qui transmet les paramètres qu'il ne connaît pas. |
| `login_hint` | Paramètre standard d'OIDC : l'adresse email saisie sur le site, pour que le hub envoie le lien sans la redemander. |
| Reconnexion silencieuse | Une application obtient la connexion du hub sans rien demander, parce que le coach y est déjà connecté. |

## État

- Fait : spike (carte 022), test SSO hub ↔ site en CI, lien magique (038), bannissement global et déconnexion propagée (037, testés dans `tests/sso.spec.ts`), hub invisible derrière les boutons du site (073 : parcours email testé sans aucun écran du hub, départ vers Discord et Google vérifié sans le suivre).
- Fait aussi : documentation de l'API en JSON (117), durcissement de la sécurité (118), profil du coach lu et modifié par l'API (119), événements signés vers les applications (121), pages du passeport (120), suppression de compte orchestrée (123), applications tierces (127), comptes de test en local (153).
- À faire : passeport Blood Bowl (épic E09, ADR-0007, cartes 118 à 127), domaine et déploiement (035), widget `<BBAccount/>` (039). La migration des comptes (036) est annulée par l'ADR-0004 : les membres se réinscriront via le hub. La base du hub est en Postgres (carte 046) ; `generate-schema.mjs` produit de vraies colonnes de listes (`String[]`, `Json`).
