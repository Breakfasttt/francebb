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

## Résultat

- L'encart « Sujet verrouillé » ne porte plus l'ancre `quick-reply-area` (`apps/site/app/forum/topic/[id]/page.tsx`) : seule la vraie zone de réponse la porte.
- Un membre qui ne peut pas répondre (sujet ou forum verrouillé) ne voit plus le bouton « Citer » : la page passe `canReply` à `PostItem`, qui le passe à `PostActions` (nouvelle propriété `canQuote`, vraie par défaut). Avant, le bouton ne faisait que défiler jusqu'à l'encart ; sans l'ancre, il aurait mené à l'écran de réponse, puis à un refus à l'envoi.
- Un modérateur peut toujours répondre à un sujet verrouillé : la page lui affiche la réponse rapide, et « Citer » y insère la citation. Il n'est donc pas envoyé sur `/forum/topic/<id>/reply?quotePostId=…` comme le disait la ligne « verify » de la carte : le résultat attendu (la citation est faite) est le même, par le chemin normal.

Test écrit (non lancé) : `apps/site/tests/e2e/bugs/forum.spec.ts`, groupe « Carte 111 ». Il vérifie que le membre ne voit ni « Citer » ni zone de réponse, et que « Citer » remplit la réponse rapide du modérateur.

À essayer à la main : sur un sujet verrouillé, avec un compte de membre puis de modérateur.
