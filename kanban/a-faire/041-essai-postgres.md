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
