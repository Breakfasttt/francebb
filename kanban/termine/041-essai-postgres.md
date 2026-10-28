---
id: 041
title: Essai Postgres sur Neon (4 h maximum)
epic: E02
app: site
depends_on: [040]
adr: 0004
verify: les 3 points validés et notés dans la carte
---

# 041 — Essai Postgres sur Neon (4 h maximum)

## Pourquoi

Turso empêche Prisma de mettre à jour la structure de la base automatiquement. Avant de tout basculer sur Postgres, on vérifie que ça marche vraiment.

## Action

Pendant 4 heures maximum, sur une copie du projet :
1. créer une base Postgres chez Neon et vérifier que `prisma migrate deploy` (la commande qui crée et met à jour les tables) fonctionne lors d'un déploiement de test sur Vercel ;
2. trouver une base locale **sans Docker** : d'abord `npx prisma dev`, sinon une base Neon de développement, sinon l'installation classique de Postgres ;
3. vérifier que le hub de connexion (Better Auth) fonctionne sur Postgres.
Résultat écrit dans cette carte. Échec : on reste sur Turso (nouvel ADR).

## Résultat

**Concluant pour tout ce qui se vérifie en local.**

1. **Base locale sans Docker : OK.** `npx prisma dev --name <nom> --detach` démarre un vrai serveur Postgres local (moteur PGlite, fourni par Prisma, rien à installer). Plusieurs serveurs nommés peuvent tourner en même temps, un pour le développement et un pour les tests. Limite constatée : un serveur ne contient qu'une seule base, donc les tests utilisent leur propre serveur.
2. **Schéma du site : OK sans aucune modification.** Seul le type de base change (`provider = "postgresql"`). La migration de départ unique (1 084 lignes de SQL) est générée par `prisma migrate diff`, et `prisma migrate deploy` l'applique sans erreur (`migrate status` : « Database schema is up to date »).
3. **Hub (Better Auth) : à adapter à la carte 046.** Sur Postgres, Better Auth stocke les listes dans de vraies colonnes de type tableau. Le générateur `apps/hub/scripts/generate-schema.mjs` doit donc produire `String[]` et `Json` au lieu de texte.
4. **Neon et Vercel : non testable sans le compte du user.** `migrate deploy` contre une base Postgres distante est le fonctionnement standard de Prisma (aucun contournement, contrairement à Turso). À confirmer lors de la mise en production (carte 047).

Bibliothèques nécessaires pour la carte 046 (Prisma 7 parle à Postgres via un « adapter ») : `@prisma/adapter-pg` 7.5.0 (même version que Prisma) et `pg`. Elles remplacent `@prisma/adapter-libsql` et `@libsql/client`.
