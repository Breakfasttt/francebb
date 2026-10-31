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

## Résultat

- **Demande** depuis la section « Supprimer mon compte » du passeport (`POST /api/v1/account/delete`, réservé à la session du coach) :
  - le texte explique en langage simple ce qui est effacé, ce qui peut rester sous forme anonyme, le délai de 30 jours et comment annuler ;
  - les autres appareils sont déconnectés et l'accès de toutes les applications est retiré ;
  - les applications reçoivent `user.deletion_scheduled` et un email de confirmation part ;
  - pendant le délai, une demande de connexion d'une application est renvoyée vers le passeport (`/?suppression=en-cours`).
- **Annulation** possible tant que l'effacement n'a pas commencé (`POST /api/v1/account/delete/cancel`, événement `user.deletion_cancelled`).
- **Tâche quotidienne** (`processDeletions`) :
  - rappel par email 7 jours avant ;
  - `user.deleted` à l'échéance ;
  - effacement au hub quand toutes les applications ont accusé réception (jetons, consentements, sessions, comptes de connexion, liens en attente, événements déjà envoyés, puis le compte) ;
  - une application qui ne répond pas bloque l'effacement, avec une alerte.
- **Ce qui reste** : l'empreinte du pseudo (il reste réservé), celle de l'email si le compte était banni (une nouvelle inscription avec cet email est refusée), et le journal d'audit sous forme d'empreinte, effacé après un an.
- **Écart avec la carte** : la route native `user.deleteUser` de Better Auth n'est pas utilisée, car elle efface tout de suite, sans délai de grâce ni accusés de réception. L'effacement passe par `lib/accountDeletion.ts`.
- **Tests** (`pnpm --filter @bbfrance/hub test:api`, 30 tests verts) :
  - demande, blocage des applications et annulation ;
  - effacement complet après accusé de réception (plus aucune ligne liée au compte, pseudo réservé) ;
  - effacement retardé tant qu'une application ne répond pas ;
  - refus de l'email d'un compte banni puis supprimé.
- **Reste** : le traitement côté site, carte 124.
