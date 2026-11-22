---
id: 225
title: Modérateurs propres à un forum
---

# 225 — Modérateurs propres à un forum

## Pourquoi
Relevé pendant la carte 221 : un modérateur modère tout le site ou rien. Un chef de ligue ou un organisateur ne peut pas recevoir le droit de modérer seulement le forum de sa ligue ou de son tournoi.

## À faire
- Table de liaison forum ↔ membre (migration), gérée dans l'administration (onglet Forums).
- `lib/forumRights.ts` : les droits de modération d'un sujet ou d'un message tiennent compte de cette liste ; les actions serveur du forum (`app/forum/actions.ts`) l'appliquent.
- Journal de modération inchangé ; fiche `permissions` et `INTERACTIONS.md` à jour.
- Tests unitaires de la règle, e2e sur un forum avec et sans droit.

## Résultat
