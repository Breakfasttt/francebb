---
id: 117
title: Documentation de l'API du hub en JSON
epic: E09
app: hub
depends_on: []
adr: 0007
verify: un test vérifie que GET /api/doc renvoie un document OpenAPI valide, sans route d'administration ni secret, et que GET /api/doc?route=<chemin> ne renvoie que cette route
---

# 117 — Documentation de l'API du hub en JSON

## Pourquoi

Une application, un outil ou une IA doit pouvoir découvrir l'API du hub en l'interrogeant, sans lire le code. OpenAPI est un format standard que ces outils savent lire. Cette carte vient en premier pour que chaque carte suivante ajoute ses routes à la documentation.

## Action

- Activer le plugin `openAPI()` de Better Auth et servir son résultat sur `GET /api/doc`. Retirer les routes d'administration (`/admin/*`) de la description.
- Ajouter le paramètre `?route=<chemin>`, qui ne renvoie que la partie décrivant cette route. Si la route est inconnue, il renvoie une erreur 404 claire.
- Réserver le préfixe `/api/v1` aux routes propres au hub et les ajouter à la description.
- Couper en production, si c'est possible, les adresses du plugin qui montrent toutes les routes : `/reference` et `/open-api/generate-schema`.
- Ajouter un lien vers `/api/doc` dans le document de découverte OIDC (`.well-known/openid-configuration`), si le format le permet.
- Écrire la règle « toute nouvelle route met la documentation à jour » dans `apps/hub/CLAUDE.md`. Un test échoue si une route publique manque à la documentation.
- Ajouter au glossaire les termes OpenAPI, webhook, portée, JWKS et HMAC.

## Résultat

- `GET /api/doc` renvoie la documentation OpenAPI 3.1 du hub (`apps/hub/app/api/doc/route.ts`, `apps/hub/lib/apiDoc/`). Elle est construite à partir du plugin `openAPI()` de Better Auth, sans les routes d'administration, de mot de passe ni de gestion des clients, et sans les tables internes. Les routes propres au hub sont décrites dans `lib/apiDoc/hubRoutes.ts`.
- `GET /api/doc?route=<chemin>` ne renvoie que la route demandée (le préfixe `/api/auth` peut être omis). Une route inconnue renvoie une erreur 404 avec la liste des routes.
- Les adresses `/api/auth/open-api/generate-schema` et `/api/auth/reference` du plugin sont désactivées.
- La découverte OIDC indique la documentation dans son champ standard `service_documentation`.
- Nouveaux tests de l'API seule : `pnpm --filter @bbfrance/hub test:api` (5 tests verts), ajoutés à la CI.
- Règle ajoutée dans `apps/hub/CLAUDE.md`. Glossaire : HMAC, JWKS, OpenAPI, passeport Blood Bowl, portée, webhook.
- `test:sso` n'a pas pu être relancé : un serveur de développement du site tournait déjà (autre session). À relancer avant le prochain envoi sur GitHub.
