---
id: 034
title: Boutons sans @ts-ignore
status: done
epic: E05
app: site
depends_on: []
adr: 0001
verify: grep ts-ignore dans common/components/Button = 0 ; typecheck vert ; captures 7 thèmes identiques
---

# 034 — Boutons sans @ts-ignore

## Action

Typer correctement les wrappers `ClassicButton`, `CTAButton`… (props sans `variant`) et le rendu d'icône de `Button`, sans changer le rendu.

## Résultat

4 `@ts-ignore` retirés des wrappers (inutiles : le typage passait déjà), rendu d'icône de `Button` typé (plus de `any` ni de `@ts-ignore`). Rendu inchangé (captures 7 thèmes vertes). Les `rest as any` du composant restent : à traiter avec la migration vers `@bbfrance/ui` Button.
