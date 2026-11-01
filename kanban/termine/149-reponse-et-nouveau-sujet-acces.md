---
id: 149
title: "Écrans de réponse et de nouveau sujet : accès"
epic: E01
app: site
depends_on: [102]
adr: 
verify: /forum/topic/<id>/reply sur un sujet verrouillé renvoie vers le sujet pour un membre ordinaire ; un visiteur qui ouvre /forum/new-topic est envoyé vers /auth/login avec callbackUrl ; tests e2e
---

# 149 — Écrans de réponse et de nouveau sujet : accès

## Pourquoi

Défauts relevés pendant la correction des cartes 111 et 133 :

- La page `/forum/topic/<id>/reply` ne vérifie pas le verrouillage du sujet : un membre ordinaire peut ouvrir l'écran de réponse d'un sujet verrouillé et n'est refusé qu'au moment d'envoyer, après avoir écrit son message.
- `apps/site/app/forum/new-topic/page.tsx` renvoie un visiteur non connecté vers `/forum` au lieu de la page de connexion (`/auth/login?callbackUrl=…`) : après sa connexion, il ne revient pas à l'écran qu'il voulait ouvrir.

## Action

- Sur `/reply`, renvoyer vers le sujet un membre qui ne peut pas répondre (sujet verrouillé et pas de droit de modération).
- Sur `/forum/new-topic`, rediriger un visiteur vers `/auth/login?callbackUrl=<adresse demandée>`.
- Ajouter les tests dans `apps/site/tests/e2e/bugs/`.

## Résultat

- `apps/site/app/forum/topic/[id]/reply/page.tsx` : si le sujet ou son forum est verrouillé et que le membre n'est pas modérateur, la page le renvoie vers le sujet avant d'afficher l'éditeur. C'est la même règle que celle de l'action d'envoi (`createPost`, dans `app/forum/actions.ts`), qui refuse toujours l'envoi en dernier recours.
- `apps/site/app/forum/new-topic/page.tsx` : un visiteur non connecté est envoyé vers `/auth/login?callbackUrl=/forum/new-topic?forumId=…` (adresse encodée), au lieu de `/forum`. La vérification d'accès au forum reste faite avant : un forum réservé à un rôle donne toujours une page « introuvable », pour ne pas révéler son existence.
- Fiche mise à jour : `docs/features/forum/README.md`.
- Tests écrits (pas encore lancés) dans `apps/site/tests/e2e/bugs/vague2.spec.ts` : membre ordinaire renvoyé vers le sujet verrouillé, modérateur qui garde l'accès à l'écran de réponse, visiteur envoyé vers la connexion avec la bonne adresse de retour.
- Non changé : `/forum/new-topic` n'empêche pas d'ouvrir l'écran dans un forum verrouillé (l'envoi est refusé par `createTopic`). Ce n'était pas demandé par la carte ; à traiter dans une autre carte si besoin.
- À essayer à la main : avec un compte ordinaire, ouvrir `/forum/topic/<id d'un sujet verrouillé>/reply` ; déconnecté, ouvrir `/forum/new-topic?forumId=<id>`, se connecter, et vérifier le retour sur l'écran de nouveau sujet.
