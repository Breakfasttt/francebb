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
