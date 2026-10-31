---
id: 125
title: Export des données personnelles
epic: E09
app: site, hub
depends_on: [120, 121]
adr: 0007
verify: test e2e - le fichier exporté contient les données du hub et du site, et l'adresse d'export du site refuse une demande non signée
---

# 125 — Export des données personnelles

## Pourquoi

Le RGPD donne à chaque coach le droit de recevoir toutes ses données dans un format lisible.

## Action

- Hub : ajouter un bouton « Télécharger mes données » sur le passeport.
- Le hub appelle l'adresse d'export signée de chaque client. Il assemble ses propres données et les réponses des clients dans un seul fichier JSON.
- Site : créer une adresse d'export qui vérifie la signature et renvoie les données du membre (profil, messages, équipes, résultats…).
- Documenter le format dans `/api/doc`.

## Avancement (31/10)

- **Fait côté hub** :
  - section « Mes données » du passeport, avec « Télécharger mes données » (`GET /api/v1/account/export`, réservé à la session du coach) ;
  - `lib/dataExport.ts` assemble les données du hub (profil, email, moyens de connexion, sessions, applications, journal de sécurité, sans jeton ni secret) ;
  - il demande aussi par un POST signé (`signedPost`, mêmes en-têtes que les événements) les données de chaque application qui connaît le coach et qui a une adresse d'export (`client-hooks.mjs`). Une application injoignable n'empêche pas l'export : sa partie indique l'erreur.
- **Tests du hub** : `export.spec.ts`, intégré aux 35 tests verts de `test:api`. L'application de test vérifie la signature avant de répondre.
- **Reste côté site** : l'adresse d'export du site (`/api/hub/export`). Elle vérifie la demande avec le code de `apps/hub/lib/verifyEvent.mjs` et renvoie les données du membre. À faire avec les cartes 122 et 124.
- **Côté site, écrit** : `app/api/hub/export/route.ts` et `lib/hub/memberExport.ts` (profil, sujets, messages, articles, messages privés envoyés, tournois, quiz ; pas les données des autres membres). Le test de bout en bout est dans `sso.spec.ts`, pas encore lancé (voir la carte 122).
