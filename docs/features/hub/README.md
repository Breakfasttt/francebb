# Feature — Hub d'identité (apps/hub)

## Rôle

Un seul compte BBFrance pour toutes les apps (site, bbscheme, futures). Le hub gère la connexion (Discord, Google, lien magique) et la fournit aux apps en OIDC. Décision : ADR-0003. Pas encore en prod (cartes 035-039).

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `apps/hub/lib/auth.ts` | Instance Better Auth : base, providers, liaison de comptes, envoi du lien magique |
| `apps/hub/lib/authPlugins.mjs` | Plugins (jwt, magicLink, oauthProvider) ; partagé avec le générateur de schéma |
| `apps/hub/lib/clientSecret.mjs` | Hachage des secrets des apps clientes |
| `apps/hub/scripts/generate-schema.mjs` | `prisma/schema.prisma` généré depuis les tables Better Auth (vérifié en CI) |
| `apps/hub/scripts/register-client.mjs` | Enregistre une app cliente (affiche son id/secret une fois) |
| `apps/hub/app/sign-in`, `app/consent` | Pages de connexion et de consentement |
| `apps/site/auth.ts` | Provider `hub` (OIDC) actif si `AUTH_MODE=hub` ; refus si `email_verified` ≠ true |
| `apps/hub/tests/sso.spec.ts` | Test de bout en bout hub ↔ site |

## API publique

- Découverte OIDC : `<BETTER_AUTH_URL>/api/auth/.well-known/openid-configuration` (issuer `<BETTER_AUTH_URL>/api/auth`).
- Scopes : `openid profile email offline_access`. L'id_token contient `name`, `picture`, `email`, `email_verified`.

## Invariants

- Base du hub séparée de celle du site. Le hub ne stocke pas de rôle métier (modo forum = site).
- Une app cliente ne rattache un compte hub à un membre existant que si `email_verified` est vrai.
- Liaison Discord/Google ↔ compte hub : seulement si le fournisseur certifie l'email (pas de `trustedProviders`).
- Connexion par mot de passe : dev/test uniquement (`HUB_DEV_PASSWORD_LOGIN=1`, jamais en production).
- Après un ajout de plugin : `node scripts/generate-schema.mjs` puis `pnpm exec prisma migrate dev`.

## État

- Fait : spike B (carte 022), test SSO en CI.
- À faire : domaine + déploiement (035), migration des 9 comptes (036), ban/déconnexion propagés (037), envoi SMTP des liens magiques (038), widget `<BBAccount/>` (039).
