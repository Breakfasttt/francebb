---
id: 027
title: CI : migrations à jour du schéma
status: ready
epic: E02
app: site
depends_on: [012]
adr: 0002
verify: une PR qui modifie schema.prisma sans migration fait échouer la CI
---

# 027 — CI : migrations à jour du schéma

## Action

Étape CI : `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code` (base shadow SQLite fichier si requise). Échec = migration oubliée.
