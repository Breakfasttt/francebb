---
id: 002
title: Bloquer les bannis côté serveur
epic: E01
app: site
depends_on: []
adr: 
verify: smoke « banni redirigé » + `grep -c getActiveSession`
---

# 002 — Bloquer les bannis côté serveur

## Problème

Ban vérifié seulement côté client (`BannedRedirect`) : server actions ouvertes aux bannis.

## Action

`lib/authGuard.ts` → `getActiveSession()` (null si non connecté ou banni) remplace `auth()` dans les 128 appels des server actions. `isBanned` rafraîchi par le callback jwt.

## Reste

Le smoke ne teste que la redirection client, pas le refus d'une action.
