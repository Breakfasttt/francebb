---
id: 001
title: Supprimer les routes API user sans auth
epic: E01
app: site
depends_on: []
adr: 
verify: `app/api/user` n'existe plus
---

# 001 — Supprimer les routes API user sans auth

## Problème

`app/api/user/delete` et `app/api/user/update` : POST sans auth, `deleteMany`/`upsert` en dur sur `user_test_breakyt`.

## Action

Supprimées avec `app/profile/component/ProfileForm.tsx` (seul consommateur, importé nulle part).
