---
id: 147
title: "Thème d'un visiteur posé trop tard"
epic: E01
app: site
depends_on: [102]
adr: 0005
verify: un visiteur non connecté qui a choisi un thème voit la page directement dans ce thème, sans passage par le thème par défaut ; test e2e
---

# 147 — Thème d'un visiteur posé trop tard

## Pourquoi

Relevé pendant la carte 101 : pour un visiteur non connecté, le thème gardé par le navigateur n'est appliqué qu'après le chargement de la page, par `ThemeProvider`. La page s'affiche donc un instant dans le thème par défaut, puis change de couleurs (effet de clignotement).

L'ADR 0005 veut que le thème soit posé par le serveur. Pour un membre connecté, c'est le cas ; pour un visiteur, le serveur ne connaît pas encore son choix.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Enregistrer le choix d'un visiteur dans un cookie lu par le serveur au rendu (`app/layout.tsx`), ou poser le thème par un court script exécuté avant l'affichage.
- Ajouter un test e2e qui vérifie l'attribut `data-theme` dès la réponse du serveur.
