# ADR-0003 — Hub d'identité : Better Auth + plugin OAuth Provider (OIDC)

- **Statut** : accepté (délégation du user, séance du 28/10 ; à relire)
- **Date** : 2026-10-28
- **Conseil** : non (choix de fond tranché par ADR-0001 ; cet ADR acte le résultat du spike B, carte 022)

## Contexte

ADR-0001 (P5) : un hub de connexion unique (`apps/hub`) pour le site, bbscheme et les futures apps, avec Better Auth + OIDC.
Le spike devait vérifier : quel plugin OIDC, compatibilité Prisma 7 + libsql/Turso, connexion silencieuse entre apps, rattachement des 9 comptes existants sans re-onboarding.

## Décision

- Plugin **`@better-auth/oauth-provider`** (OAuth 2.1 + OIDC), pas l'ancien `oidcProvider` intégré.
- Base **séparée** pour le hub (`HUB_DATABASE_URL`, une 2e base Turso en prod), via l'adapter Prisma de Better Auth sur Prisma 7 + `@prisma/adapter-libsql`.
- Le site reste client Auth.js : provider OIDC générique `hub`, activé par **`AUTH_MODE=hub`** (défaut : `legacy`, rien ne change).
- La table `User` du site reste la référence (projection locale). Lien hub ↔ site = ligne `Account` (provider `hub`, `providerAccountId` = id hub) créée par l'adapter Auth.js. **Aucune migration du schéma du site.**
- Rattachement à un membre existant par email, **seulement si le hub certifie l'email** (`email_verified` dans l'id_token, contrôlé dans le callback `signIn` du site).

## Pourquoi

- Prouvé par un test Playwright de bout en bout (`apps/hub/tests/sso.spec.ts`, CI) : le membre « Coach E2E » existant se connecte via le hub et retrouve son compte sans onboarding ; après déconnexion du site, la reconnexion passe sans rien redemander (session hub) ; un compte hub à l'email non vérifié est refusé.
- Prisma 7 + libsql : OK. Le schéma Prisma est généré depuis les tables déclarées par Better Auth (`scripts/generate-schema.mjs`, vérifié en CI) plutôt que via `@better-auth/cli` (une dépendance de moins).
- Base séparée : le hub ne connaît que l'identité ; une faille côté forum n'expose pas les sessions du hub, et inversement.
- Pas de colonne `hubUserId` : la table `Account` d'Auth.js fait déjà ce lien, sans toucher la base de prod du site.

Écarté : `oidcProvider` intégré à better-auth (remplacé par le paquet dédié), Keycloak/Authentik (un serveur de plus à opérer pour 9 membres), garder Auth.js partout (pas de fournisseur OIDC).

## Constats du spike (pièges)

- Le plugin ne met les claims profil/email que dans `/userinfo` ; Auth.js lit l'id_token. Corrigé par `customIdTokenClaims` (`lib/authPlugins.mjs`).
- L'API admin de création de client exige une session admin : `scripts/register-client.mjs` écrit le client en base, avec un hachage de secret explicite (`lib/clientSecret.mjs`).
- `@better-auth/oauth-provider` déclare ses dépendances en peers : sans les déclarer dans `apps/hub/package.json`, pnpm installe deux `@better-auth/core` et les types des plugins deviennent incompatibles.

## Ce qu'on ne fait pas (encore)

- Pas de bascule de la prod : `AUTH_MODE=legacy` reste le défaut tant que les cartes 035 à 040 ne sont pas faites.
- Pas de rôles métier dans le hub (modo forum reste au site). Superadmin et ban global : carte 037.

## Risques

- **Domaine parent commun obligatoire** avant la prod (`auth.` + `www.` sur le même domaine) : sinon Safari (ITP) bloque le cookie du hub et la reconnexion silencieuse échoue. Non testable en local (tout est sur `localhost`). Carte 035.
- Plugin jeune (1.7.x) : versions figées, test SSO en CI.
- Rollback : `AUTH_MODE=legacy` (variable d'env Vercel), aucune donnée du site modifiée.

## Cartes

022 (spike, fait), 035 (déploiement + domaine), 036 (migration des 9 comptes), 037 (ban et déconnexion propagés), 038 (envoi des liens magiques), 039 (widget `<BBAccount/>` / `packages/auth-client`).
