---
id: 123
title: Suppression de compte orchestrée par le hub
epic: E09
app: hub
depends_on: [120, 121]
adr: 0007
verify: test e2e - après le délai de grâce et l'accusé de réception de tous les clients, aucune ligne liée au compte ne reste dans la base du hub ; une annulation pendant le délai rend l'accès
---

# 123 — Suppression de compte orchestrée par le hub

## Pourquoi

Le RGPD donne à chaque coach le droit de faire effacer ses données dans toutes les applications. Aujourd'hui, une suppression faite sur le site ne prévient pas le hub.

## Action

- Créer la page de suppression, en langage simple. Elle explique :
  - ce qui est effacé, et ce que chaque application peut garder sous forme anonyme ;
  - la durée du délai de grâce (30 jours) ;
  - comment annuler.
- Pendant le délai : l'accès est bloqué et l'annulation reste possible. Le coach reçoit un email de confirmation, puis un email de rappel avant l'effacement.
- Un coach banni ne doit pas pouvoir effacer sa sanction : le hub garde une empreinte de son email.
- À la fin du délai :
  1. envoyer `user.deleted` à chaque client ;
  2. suivre les accusés de réception, client par client ;
  3. lever une alerte si un client ne répond pas ;
  4. effacer les données du hub une fois tous les accusés reçus.
- Garder le nom de coach réservé, sous forme d'empreinte.
- Activer `user.deleteUser` de Better Auth avec `beforeDelete`.
