---
id: 019
title: next/image + import dynamique html2canvas/gifshot
status: refine
epic: E03
app: site
depends_on: []
adr: 
verify: JS `/bbscheme` < 235 kB (baseline) ; 0 `<img>` hors exceptions
---

# 019 — next/image + import dynamique html2canvas/gifshot

## Action

`next/image` + config `images` ; `dynamic()` pour html2canvas et gifshot (`app/bbscheme/page.tsx`).
