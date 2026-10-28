---
id: 034
title: Boutons sans @ts-ignore
status: refine
epic: E05
app: site
depends_on: []
adr: 0001
verify: grep ts-ignore dans common/components/Button = 0 ; typecheck vert ; captures 7 thèmes identiques
---

# 034 — Boutons sans @ts-ignore

## Action

Typer correctement les wrappers `ClassicButton`, `CTAButton`… (props sans `variant`) et le rendu d'icône de `Button`, sans changer le rendu.
