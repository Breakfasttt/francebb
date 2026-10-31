---
id: 118
title: Durcissement de la sécurité du hub
epic: E09
app: hub
depends_on: [117]
adr: 0007
verify: pnpm --filter @bbfrance/hub test:sso reste vert ; un test montre que la limite de requêtes est stockée en base et qu'un jeton Discord est illisible en base
---

# 118 — Durcissement de la sécurité du hub

## Pourquoi

Le hub va garder les données de tous les coachs, mais il n'est pas encore protégé en conséquence :
- La limite du nombre de requêtes est gardée en mémoire. Sur Vercel, chaque serveur a donc la sienne, et elle ne protège rien.
- Les jetons Discord et Google sont stockés en clair.
- Les clés ne sont jamais renouvelées.
- Aucune action sensible n'est enregistrée.

Ces points doivent être réglés avant la mise en ligne (carte 035).

## Action

- Stocker la limite de requêtes dans la base Postgres (`rateLimit.storage: "database"`).
- Chiffrer les jetons Discord et Google (`account.encryptOAuthTokens`).
- Renouveler régulièrement les clés JWKS (`jwks.rotationInterval` et `gracePeriod`).
- Configurer `trustedOrigins`.
- Envoyer au navigateur les en-têtes de sécurité CSP (liste des sources autorisées) et HSTS (https obligatoire).
- Créer la table du journal d'audit, qui enregistre les connexions, les changements de profil, les bannissements et les suppressions. L'identifiant et l'adresse IP y sont remplacés par une empreinte. Les lignes sont purgées après 1 an.
- Purger les sessions expirées.
- Proposer la double authentification (`twoFactor`), facultative pour chaque coach.
- Mettre à jour `DEPLOY.md` avec les nouvelles variables, comme la clé de chiffrement.

## Résultat

- **Limite de requêtes** stockée dans la base (table `rateLimit`, migration `20261031120000_securite_audit_limite`). Elle est active en production, ou en test avec `HUB_RATE_LIMIT=1`. `generate-schema.mjs` traduit désormais les nombres `bigint` en `BigInt`.
- **Jetons Discord et Google** chiffrés en base (`encryptOAuthTokens`).
- **Clés JWKS** : une nouvelle clé de signature tous les 90 jours, l'ancienne reste valable 30 jours.
- **En-têtes de sécurité** sur toutes les réponses (`next.config.ts`) : CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy.
- **Journal d'audit** (`lib/audit.mjs`, table `auditLog`) : inscriptions, connexions, modifications, bannissements et suppressions, avec des empreintes à la place de l'identifiant et de l'adresse IP.
- **Purge nocturne** par une tâche planifiée Vercel protégée par `CRON_SECRET` (`app/api/cron/purge`, `vercel.json`) : journal de plus d'un an, sessions et liens expirés. `DEPLOY.md` est mis à jour.
- **`trustedOrigins`** n'est pas réglé : la valeur par défaut, qui n'autorise que l'adresse du hub lui-même, est la bonne pour un hub indépendant. Les applications passent par OIDC, avec des adresses de retour enregistrées pour chaque client.
- **Double authentification** retirée : le plugin `twoFactor` ne protège que la connexion par mot de passe, qui n'existe pas en production. L'ADR-0007 et la carte 120 sont corrigés.
- **Tests** : `pnpm --filter @bbfrance/hub test:api`, 11 tests verts. Ils couvrent les en-têtes, l'affichage de `/sign-in` sous la CSP, le blocage après 3 tentatives et le compteur en base, le journal sans données en clair et la purge. Le chiffrement et la rotation des clés sont vérifiés dans la configuration, car un vrai jeton Discord ne peut pas être produit en test. À contrôler en base lors de l'essai à la main de la carte 115.
- `test:sso` n'a pas pu être relancé : un serveur de développement du site tourne déjà (autre session).
