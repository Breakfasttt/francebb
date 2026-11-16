---
id: 172
title: "Nettoyer le client Prisma généré"
epic: E10
app: site
depends_on: []
verify: "apps/site/prisma/generated-client ne contient plus que les fichiers produits par le générateur actuel ; un script lancé avec tsx qui importe le client fonctionne ; pnpm check passe"
---

# 172 — Nettoyer le client Prisma généré

## Pourquoi

Le dossier `apps/site/prisma/generated-client` (le code que Prisma produit pour parler à la base) contient deux versions mélangées : les bons fichiers `.js`, produits par le générateur actuel pour Postgres, et d'anciens fichiers `.ts` produits le 28 octobre pour SQLite, avant le passage à Postgres. L'outil `tsx`, qui lance les scripts TypeScript, choisit les anciens fichiers : tout script qui importe le client échoue (constaté pendant les cartes 159 à 170). Le site lui-même n'est pas touché.

## Action

1. Identifier les fichiers que le générateur actuel (`prisma-client-js`) ne produit pas (anciens `.ts`, dossiers `internal/` et `models/`), et vérifier qu'aucun code ne les importe.
2. Les supprimer du dépôt, relancer `prisma generate`, vérifier les types (`pnpm check`) et qu'un script `tsx` qui importe le client fonctionne.
3. Noter le piège dans la skill `database-ops`.

## Résultat

Le générateur actuel a été lancé dans un dossier temporaire, et la liste de ses fichiers comparée à celle du dépôt : 43 fichiers (`browser.ts`, `client.ts`, `commonInputTypes.ts`, `enums.ts`, `index.ts`, `models.ts`, et les dossiers `internal/` et `models/`) n'étaient plus produits. Ils dataient du 28 octobre, avant le passage à Postgres, et il y manquait les tables récentes. Ils sont supprimés. `pnpm check` passe, et un script lancé avec `tsx` qui importe `../prisma/generated-client` lit maintenant la base sans erreur. Le piège est noté dans la skill `database-ops`, avec la procédure de migration locale et la règle sur les requêtes SQL écrites à la main.
