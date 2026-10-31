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

## Résultat

- `scripts/client-hooks.mjs` déclare, pour une application cliente, son adresse d'événements et son adresse d'export, et lui crée un secret de signature. Ce secret est affiché une fois, puis stocké chiffré (table `clientHook`).
- `lib/events.mjs` :
  - `emitUserEvent()` écrit un envoi par application qui connaît déjà le coach (jeton ou consentement) dans la table `outboundEvent`, puis tente l'envoi ;
  - `deliverDueEvents()` envoie en POST avec la signature HMAC, l'horodatage et l'identifiant. Une réponse 2xx vaut accusé de réception ; sinon nouvel essai (1 min, 5 min, 30 min, 2 h, puis 12 h), puis abandon après 10 essais, avec une alerte dans la console et le journal d'audit.
- **Événements** :
  - `user.updated`, envoyé à chaque modification du compte, avec le profil complet ;
  - `user.banned`, envoyé lors d'un bannissement par le plugin admin ou par `pnpm ban` (la raison reste au hub) ;
  - `user.updated` avec `banned: false`, envoyé quand le bannissement est levé.
- **Tâche planifiée** : `/api/cron/purge` est renommée `/api/cron/daily`. Elle purge les données expirées et renvoie les événements en attente. Les événements livrés depuis 30 jours ou abandonnés depuis 90 jours sont effacés.
- `lib/verifyEvent.mjs` : code de référence à recopier dans les applications. Il refuse une signature fausse, un envoi de plus de 5 minutes et un identifiant déjà reçu.
- **Documentation** : le format des événements est dans la partie `webhooks` de `/api/doc`. `DEPLOY.md` et la fiche du hub sont mis à jour.
- **Tests** : `pnpm --filter @bbfrance/hub test:api`, 21 tests verts. Une petite application de test reçoit les événements. Ils vérifient la signature valide, qu'une application qui ne connaît pas le coach ne reçoit rien, les refus de la vérification, le renvoi après une panne par la tâche quotidienne et le bannissement par le script.
