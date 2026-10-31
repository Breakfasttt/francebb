---
id: 133
title: "Fin d'inscription : revenir à la page demandée"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un nouveau membre qui ouvre /forum/new-topic sans être connecté, se connecte puis termine son inscription arrive sur /forum/new-topic ; test e2e qui le vérifie
---

# 133 — Fin d'inscription : revenir à la page demandée

## Pourquoi

Bug trouvé pendant la refonte (carte 091). Quand un nouveau membre se connecte pour la première fois, il est envoyé vers l'inscription (onboarding). Cette redirection, faite dans `apps/site/auth.config.ts`, ne garde pas la page qu'il voulait ouvrir au départ : à la fin de l'inscription, il revient toujours à l'accueil.

La correction touche la logique de connexion : elle doit être relue avec soin (et avec la session qui travaille sur le hub de connexion).

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Transmettre la page demandée (`callbackUrl`) à la redirection vers l'onboarding, en vérifiant qu'il s'agit d'une adresse du site (jamais d'une adresse extérieure).
- Utiliser cette adresse à la fin de l'onboarding.
- Ajouter un test e2e.
