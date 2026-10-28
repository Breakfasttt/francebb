---
id: 024
title: Extraire bbscheme en app + packages/bbscheme-player
epic: E07
app: site
depends_on: [022]
adr: 
verify: `[bbscheme]` rendu dans un post depuis le package
---

# 024 — Extraire bbscheme en app + packages/bbscheme-player

## Action

`app/bbscheme/*`, modèle `BBSchemeState`, rosters `public/data/roster` ; casse le couplage `common/components/BBCodeContent/BBCodeContent.tsx:4`.
