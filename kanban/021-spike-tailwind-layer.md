---
id: 021
title: Spike A : CSS legacy en @layer sous Tailwind v4
status: refine
epic: E05
app: site
depends_on: [023]
adr: 
verify: 2 pages où les utilities Tailwind gagnent sur le CSS legacy
---

# 021 — Spike A : CSS legacy en @layer sous Tailwind v4

## Problème

`app/globals.css:42` `* {padding:0;margin:0}` hors `@layer` écrase les utilities v4.

## Action

`@import "globals.css" layer(legacy)` + ordre `@layer theme, base, legacy, components, utilities`. Timeboxé.
