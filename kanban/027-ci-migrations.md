---
id: 027
title: CI : migrations à jour du schéma
status: done
epic: E02
app: site
depends_on: []
adr: 0002
verify: une PR qui modifie schema.prisma sans migration fait échouer la CI
---

# 027 — CI : migrations à jour du schéma

## Action

Étape CI : `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --exit-code` (base shadow SQLite fichier si requise). Échec = migration oubliée.

## Résultat

Étape CI ajoutée. Vérifié en local : code 0 sans écart, code 2 avec un champ ajouté au schéma sans migration. Indépendant de la baseline prod (carte 012) : compare le dossier `prisma/migrations` au schéma, sans base réelle.
