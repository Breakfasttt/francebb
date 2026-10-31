---
id: 122
title: Le site reçoit les événements du hub et modifie le profil par l'API
epic: E09
app: site
depends_on: [121]
adr: 0007
verify: test e2e - un coach banni au hub perd l'accès au site à la requête suivante ; un pseudo changé depuis le profil du site est enregistré au hub puis affiché sur le site
---

# 122 — Le site reçoit les événements du hub et modifie le profil par l'API

## Pourquoi

Le site garde une copie locale du profil et sa session dans un jeton. Il doit suivre les changements du hub et appliquer un bannissement sans attendre l'expiration de la session. Il garde aussi sa propre interface de profil. Pour les champs du passeport, cette interface envoie les modifications au hub au lieu d'écrire directement dans sa base.

## Action

- Rattacher le membre du site au coach du hub par l'identifiant du hub (`sub`, déjà rangé dans `Account.providerAccountId`), jamais par le pseudo. Les événements désignent le coach par cet identifiant.
- Créer la route qui reçoit les événements. Elle vérifie la signature, l'horodatage et l'identifiant unique.
- Sur `user.updated` : mettre à jour la copie locale (nom de coach, avatar, NAF, région).
- Sur `user.banned` : bannir le compte sur le site.
- `getActiveSession` (`apps/site/lib/authGuard.ts`) relit l'état du compte à chaque requête.
- Formulaire de profil (`apps/site/app/profile/actions.ts`) :
  - les champs du passeport (pseudo, avatar, NAF, région) sont envoyés au hub par `PATCH /api/v1/profile` avec le jeton d'accès du coach ;
  - une erreur du hub (nom déjà pris…) s'affiche dans le formulaire ;
  - les réglages propres au site (ligues, thème, signature, notifications, équipe) restent enregistrés sur le site.
- Le site demande les portées `bbfrance:profile` et `bbfrance:profile:write`, et garde le jeton d'accès et le jeton de rafraîchissement du hub.
- Ajouter un lien « Mon passeport » dans le profil du site, pour l'export et la suppression.
