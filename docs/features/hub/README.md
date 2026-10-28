# Hub de connexion (apps/hub)

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Le hub donne aux coachs un seul compte BBFrance pour toutes les applications (le site, bbscheme, et les futures). Le coach se connecte une fois au hub (Discord, Google ou lien magique), puis chaque application lui demande « qui est connecté ? » grâce au standard OIDC, sans lui redemander de se connecter. La décision est consignée dans l'ADR-0003. Le hub n'est pas encore en production : le site continue d'utiliser sa propre connexion tant que `AUTH_MODE=hub` n'est pas activé.

## Ce que voit le coach

- Sur le site, en mode hub : un bouton « Se connecter avec le compte BBFrance » sur `/auth/login`, qui l'envoie vers le hub.
- `/sign-in` (sur le hub) : boutons « Continuer avec Discord » et « Continuer avec Google », puis un champ email et « Recevoir un lien de connexion ». En dev/test seulement, un formulaire de mot de passe. Une fois connecté, le coach revient automatiquement sur l'application qui l'a envoyé.
- `/consent` : écran « Autoriser l'accès » (Autoriser / Refuser), affiché seulement pour une application tierce. Les applications BBFrance sont enregistrées sans écran de consentement.
- `/` (accueil du hub) : indique « Connecté : <pseudo> » ou « Non connecté ».
- Accès : tout visiteur. Le hub ne connaît aucun rôle métier (modérateur, admin) : ces rôles restent sur le site.
- **Sur téléphone** : le hub n'a pas de fichier mobile, mais sa mise en page est simple et pensée pour : une seule carte centrée de largeur `min(420px, 100vw - 32px)` (16 px de marge de chaque côté), des boutons pleine largeur d'environ 44 px de haut, des champs à la taille de police du navigateur (pas de zoom iPhone). Points à vérifier : Discord et Google s'affichent même s'ils ne sont pas configurés ; un seul thème (les couleurs du thème par défaut du site), pas les 7 thèmes ; la reconnexion silencieuse sur Safari iOS n'est possible qu'avec un domaine parent commun (carte 035, non testable en local).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/hub/lib/auth.ts` | Instance Better Auth : base, fournisseurs Discord/Google (seulement si leurs clés existent), liaison de comptes, mot de passe dev, envoi du lien magique (`sendMagicLink`, qui appelle `lib/mail.ts`). |
| `apps/hub/lib/mail.ts` | Envoi SMTP du lien magique (mêmes réglages `SMTP_*` que le site). Sans `SMTP_HOST`, le lien s'affiche dans la console, en développement seulement. |
| `apps/hub/lib/authPlugins.mjs` | `authPlugins()` : plugins `jwt`, `magicLink`, `oauthProvider` (pages, scopes, `customIdTokenClaims`). Partagé avec le générateur de schéma. |
| `apps/hub/lib/authClient.ts` | Client Better Auth du navigateur, utilisé par les pages `/sign-in` et `/consent`. |
| `apps/hub/lib/clientSecret.mjs` | `hashClientSecret()` : hachage SHA-256 des secrets des applications clientes. |
| `apps/hub/lib/prisma.mjs` | Client Prisma de la base du hub (`HUB_DATABASE_URL`), séparée de celle du site. |
| `apps/hub/app/api/auth/[...all]/route.ts` | Toutes les adresses Better Auth : connexion, sessions, `authorize`, `token`, `userinfo`, clés. |
| `apps/hub/app/api/auth/.well-known/openid-configuration/route.ts` | Document de découverte OIDC lu par le site. |
| `apps/hub/app/sign-in/page.tsx`, `app/consent/page.tsx`, `app/page.tsx` | Pages de connexion, de consentement et d'accueil. `app/globals.css` : styles. |
| `apps/hub/scripts/generate-schema.mjs` | Génère `prisma/schema.prisma` à partir des tables Better Auth (vérifié en CI). |
| `apps/hub/scripts/register-client.mjs` | Enregistre une application cliente et affiche une seule fois son id et son secret. |
| `apps/hub/scripts/e2e-setup.mjs`, `tests/sso.spec.ts` | Préparation sur base jetable et test de bout en bout hub ↔ site (`pnpm test:sso`, lancé en CI). |
| `apps/site/auth.ts` | Côté site : fournisseur `hub` actif si `AUTH_MODE=hub` et `HUB_ISSUER` définis ; refus si `email_verified` n'est pas vrai. |

Adresses publiques : découverte `<BETTER_AUTH_URL>/api/auth/.well-known/openid-configuration` (issuer `<BETTER_AUTH_URL>/api/auth`). Scopes `openid profile email offline_access`. L'id_token contient `name`, `picture`, `email`, `email_verified`.

## Les pièges

- La base du hub est séparée de celle du site. Le hub ne stocke aucun rôle métier.
- Une application cliente ne rattache un compte hub à un membre existant que si `email_verified` est vrai.
- Liaison Discord/Google ↔ compte hub : seulement si le fournisseur certifie l'email (pas de `trustedProviders`).
- Connexion par mot de passe : dev/test uniquement (`HUB_DEV_PASSWORD_LOGIN=1`, refusée en production par `lib/auth.ts`).
- `prisma/schema.prisma` est généré : ne pas l'éditer. Après un ajout de plugin : `node scripts/generate-schema.mjs` puis `pnpm exec prisma migrate dev`.
- better-auth et ses compagnons (`@better-auth/core`, `better-call`…) se montent ensemble, sinon deux copies coexistent et les types des plugins cassent.
- Le chemin `/token` du plugin `jwt` est désactivé : il entre en conflit avec celui d'OAuth.
- Le lien magique part par SMTP (carte 038). Si l'envoi échoue, le formulaire affiche une erreur au lieu de « Lien de connexion envoyé ». En production sans SMTP configuré, l'envoi est refusé.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Application cliente | Application (le site, bbscheme…) enregistrée auprès du hub, avec un id et un secret, qui lui délègue la connexion. |
| Issuer / découverte | L'adresse qui identifie le hub, et le document qui liste ses autres adresses (connexion, jetons, clés). |
| Scope | Ce que l'application demande à connaître : identité (`openid`), profil, email, connexion durable (`offline_access`). |
| Consentement | Écran où le coach accepte qu'une application lise son profil. Sauté pour les applications BBFrance (`skipConsent`). |
| `email_verified` | Information de l'id_token : le hub certifie que le coach possède bien cet email. |
| Reconnexion silencieuse | Une application obtient la connexion du hub sans rien demander, parce que le coach y est déjà connecté. |

## État

- Fait : spike (carte 022), test SSO hub ↔ site en CI.
- À faire : domaine et déploiement (035), ban global et déconnexion propagés (037), widget `<BBAccount/>` (039). La migration des comptes (036) est annulée par l'ADR-0004 : les membres se réinscriront via le hub. La base du hub est en Postgres (carte 046) ; `generate-schema.mjs` produit de vraies colonnes de listes (`String[]`, `Json`).
