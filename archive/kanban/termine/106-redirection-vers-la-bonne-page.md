---
id: 106
title: "Redirection vers la bonne page de connexion"
epic: E01
app: site
depends_on: []
adr: 
verify: un visiteur qui ouvre /administration, /moderation, /profile ou /spy/[id] arrive sur /auth/login avec callbackUrl
---

# 106 — Redirection vers la bonne page de connexion

## Pourquoi

Quatre pages envoient les visiteurs vers `/api/auth/signin`, la page brute d'Auth.js, au lieu de la page de connexion du site.

## Action

- Remplacer la redirection par `/auth/login?callbackUrl=` dans les quatre pages, et ajouter un test.

## Résultat

- `/administration`, `/moderation`, `/profile` et le bouton de contact de `/spy/[id]` redirigent vers `/auth/login?callbackUrl=<page>`. Plus aucune occurrence de `/api/auth/signin` dans le site.
- Test ajouté dans `smoke.spec.ts`, vert en taille ordinateur et en taille téléphone.
