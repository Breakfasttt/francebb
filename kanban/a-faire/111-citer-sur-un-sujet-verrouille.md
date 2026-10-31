---
id: 111
title: "« Citer » sur un sujet verrouillé"
epic: E01
app: site
depends_on: [102]
adr: 
verify: sur un sujet verrouillé, un modérateur qui appuie sur « Citer » arrive sur /forum/topic/<id>/reply?quotePostId=<message> ; test e2e qui le vérifie
---

# 111 — « Citer » sur un sujet verrouillé

## Pourquoi

Bug trouvé pendant la refonte (carte 086). Le bouton « Citer » cherche la zone de réponse rapide grâce à son ancre `quick-reply-area` : si elle existe, il y insère la citation, sinon il ouvre l'écran de réponse. Sur un sujet verrouillé, c'est l'encart « Sujet verrouillé » qui porte cette ancre. « Citer » se contente alors de faire défiler la page jusqu'à l'encart, sans rien citer.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Retirer l'ancre `quick-reply-area` de l'encart « Sujet verrouillé », ou faire vérifier par « Citer » que la zone de réponse est vraiment présente.
- Vérifier le comportement pour un membre (qui ne peut pas répondre : le bouton ne doit pas mener à une impasse) et pour un modérateur (qui peut répondre).
- Ajouter le test e2e correspondant.
