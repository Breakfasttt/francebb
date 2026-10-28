---
id: 019
title: next/image + import dynamique html2canvas/gifshot
status: ready
epic: E03
app: site
depends_on: []
adr: 
verify: JS `/bbscheme` < 235 kB (baseline) ; 0 `<img>` hors exceptions
---

# 019 — next/image + import dynamique html2canvas/gifshot

## Action

`next/image` + config `images` ; `dynamic()` pour html2canvas et gifshot (`app/bbscheme/page.tsx`).

## Avancement

Fait : html2canvas + gifshot chargés à la demande (export GIF) → JS `/bbscheme` 235 → 183 kB.
Reste : 34 `<img>` → `next/image` (config des domaines d'avatars Discord/Google, vérification visuelle dans les 7 thèmes).
