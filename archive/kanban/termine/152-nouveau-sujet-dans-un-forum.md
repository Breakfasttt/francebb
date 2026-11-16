---
id: 152
title: "Nouveau sujet dans un forum verrouillé"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un membre ordinaire qui ouvre /forum/new-topic?forumId=<forum verrouillé> est renvoyé vers le forum ; un modérateur garde l'accès ; test e2e
---

# 152 — Nouveau sujet dans un forum verrouillé

## Pourquoi

Relevé pendant la carte 149 : `/forum/new-topic` laisse un membre ordinaire ouvrir l'écran de rédaction dans un forum verrouillé. Il n'est refusé qu'à l'envoi, par `createTopic`, après avoir écrit tout son sujet. La carte 149 a corrigé le même défaut pour l'écran de réponse.

## Action

- Dans `apps/site/app/forum/new-topic/page.tsx`, renvoyer vers le forum un membre qui n'est pas modérateur quand le forum est verrouillé (même règle que `createTopic`).
- Ajouter un test dans `apps/site/tests/e2e/bugs/`.

## Résultat

L'écran `/forum/new-topic` applique maintenant la règle de `createTopic` : quand le forum est verrouillé et que le membre n'est pas modérateur, il est renvoyé vers `/forum/<id du forum>` avant de pouvoir écrire. Un modérateur garde l'accès.

- Fichier modifié : `apps/site/app/forum/new-topic/page.tsx`.
- Test écrit (non lancé) : bloc `carte 152` à la fin de `apps/site/tests/e2e/bugs/vague2.spec.ts`, qui crée un forum verrouillé de test (nettoyé avec le reste) et vérifie la redirection d'un membre ordinaire puis l'accès du modérateur.
- À essayer à la main : se connecter en membre ordinaire et ouvrir l'adresse de nouveau sujet d'un forum verrouillé, puis la même chose en modérateur.
