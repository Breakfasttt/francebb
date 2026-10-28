# ADR-0002 — Stratégie de migrations Prisma pour la prod Turso

- **Statut** : accepté
- **Date** : 2026-10-28
- **Conseil** : oui (`/council`)

## Contexte

Prisma 7.5 + adapter libsql. 26 migrations dans `prisma/migrations`, cohérentes avec `schema.prisma` en local. La prod Turso (vrais membres) a été créée et mise à jour en `db push` (`DEPLOY.md:167-170`) + SQL manuel : pas de table `_prisma_migrations`, écart prod/schéma inconnu.
`prisma.config.ts` lit `DATABASE_URL` sans adapter ; l'app lit `TURSO_DATABASE_URL`. Aucune doc ne confirme `migrate deploy/resolve` contre `libsql://` distant en Prisma 7.5 ; la doc Prisma Turso recommande `migrate diff` + application du SQL. Build = `next build` (`package.json`), aucune migration au build. Backup testé (carte 011) pas encore fait.

## Décision

1. **Spike 2 h sur une copie de la prod** (restaurée depuis le dump) : `migrate diff` copie ↔ schéma, test de `migrate resolve` / `status` / `deploy` contre libsql.
2. **Squash** des 26 migrations en une baseline `0_init` (procédure officielle Prisma : `migrate diff --from-empty --to-schema`), marquée `migrate resolve --applied 0_init` sur la copie puis la prod — **seulement si l'écart prod/schéma est vide**.
3. **Application manuelle** par un seul script `npm run db:deploy` : backup → affichage de l'hôte cible → confirmation → déploiement → `migrate status`. Outil : `prisma migrate deploy` si le spike réussit, sinon script Node avec `@libsql/client` (déjà présent) appliquant le SQL de `migrate diff`.
4. **CI** : `migrate diff --exit-code` migrations ↔ schéma pour attraper une migration oubliée.

## Pourquoi

- Squash = procédure officielle, une seule ligne à marquer. Garder les 26 et les marquer toutes appliquées n'est valide que si la prod correspond exactement à chacune : invérifiable.
- L'outil d'application dépend d'un fait inconnu (support libsql distant) : le spike tranche.
- Manuel : dev solo, aucun token d'écriture prod dans les secrets GitHub.

Écarté : garder les 26 migrations (proposé par le Visionnaire), workflow GitHub `deploy-db` immédiat, migration au build Vercel.

## Ce qu'on ne fait pas

Aucune migration au build Vercel. Pas de workflow de déploiement BDD avant P3. Pas de branche Turso par PR. Aucune nouvelle dépendance. Pas d'annonce aux coachs (la baseline n'écrit que `_prisma_migrations`). Si l'écart contient un `DROP` ou une recréation de table : stop, ADR dédié.

## Risques

- Bloquant : aucune écriture en prod avant la carte 011 (« Restauration OK ») et un dump frais avant chaque opération.
- Pas d'annulation DDL sur Turso : répétition sur copie + procédure de bascule d'URL vers la copie < 5 min.
- Dev local après squash : marquer `0_init` appliquée sur `dev.db` (sauvegarder avant tout reset).
- Fuites : token Turso éphémère, hors historique shell et logs ; dumps hors repo (RGPD) ; base de test supprimée après usage.

## Cartes

011 (prérequis), 025 (spike), 012 (baseline, révisée), 026 (`db:deploy`), 027 (CI migrations).
