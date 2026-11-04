---
id: 161
title: "Tout faire passer par le hub : retirer la connexion directe du site"
epic: E10
app: site
depends_on: [035]
adr: 0003
verify: "le site ne propose plus que la connexion par le hub ; les fournisseurs Discord, Google et e-mail ont disparu de apps/site/auth.ts ; AUTH_MODE n'existe plus"
---

# 161 — Tout faire passer par le hub

## Pourquoi

Décision du responsable (4 novembre 2026) : la connexion par Discord, Google ou e-mail est l'affaire du hub, pas du site. Le site garde aujourd'hui une connexion directe parce que le hub n'est pas encore en ligne (carte 035). Une fois le hub en ligne, ce double système n'a plus de raison d'être, et il est la source de la faille de la carte 160.

## Action

Une fois la carte 035 terminée et le hub vérifié en production : retirer de `apps/site/auth.ts` les fournisseurs Discord, Google, e-mail et la connexion de développement directe, supprimer le réglage `AUTH_MODE`, simplifier la page de connexion (un seul bouton « Se connecter »), mettre à jour `DEPLOY.md`, `.env.example` et la fiche `docs/features/auth/README.md`.
