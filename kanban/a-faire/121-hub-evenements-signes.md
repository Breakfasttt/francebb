---
id: 121
title: Clients enregistrés et événements signés
epic: E09
app: hub
depends_on: [119]
adr: 0007
verify: tests - un message correctement signé est accepté, un message de plus de 5 minutes est refusé, un message rejoué est refusé, et l'envoi aboutit après une panne du client
---

# 121 — Clients enregistrés et événements signés

## Pourquoi

Les applications doivent apprendre qu'un profil a changé (depuis le passeport ou depuis une autre application), qu'un coach a été banni ou qu'un compte va être supprimé. Le hub ne connaît aucune application en particulier : il envoie ces messages (webhooks) à tous les clients enregistrés, de la même façon pour chacun.

## Action

- `scripts/register-client.mjs` enregistre, pour chaque client, une adresse d'événements, une adresse d'export et un secret de signature.
- Créer la table des événements à envoyer : identifiant unique, type, version, contenu, état, nombre d'essais.
- Ajouter dans les en-têtes la signature HMAC (empreinte calculée avec le secret du client) et l'horodatage.
- Envoyer les événements `user.updated` et `user.banned`. Une modification faite par une application est aussi renvoyée à cette application, pour confirmation.
- Renvoyer un événement tant que le client n'a pas accusé réception. Le renvoi se fait à chaque nouvel événement, et par une tâche planifiée Vercel (une fois par jour sur l'offre gratuite).
- Écrire une petite fonction de vérification de signature, à recopier dans chaque application (plus tard dans `packages/auth-client`, carte 039).
- Documenter le format des événements dans `/api/doc`.
