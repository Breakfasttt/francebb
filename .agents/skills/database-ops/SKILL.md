# Skill : Opérations Base de Données (Turso + Prisma 7)

Ce skill définit la procédure **validée et sécurisée** pour maintenir la base de données de production sur Turso en utilisant Prisma, tout en contournant les limitations natives du CLI.

## ⚙️ ARCHITECTURE DE CONNEXION (Dual-URL)

Depuis le 24 Avril 2026, la configuration suit le guide officiel [Prisma + Turso](https://www.prisma.io/docs/v6/orm/overview/databases/turso).

Dans le fichier `.env` :
1. **`DATABASE_URL="file:./dev.db"`** : 
   - **Usage** : Uniquement pour le **Prisma CLI** (`db push`, `migrate`, `generate`).
   - **Raison** : Le moteur Rust de Prisma ne supporte pas `libsql://`. Il a besoin d'un accès fichier local.
2. **`TURSO_DATABASE_URL="libsql://..."`** : 
   - **Usage** : Pour le **Client Prisma** (via `lib/prisma.ts`) et les **scripts de maintenance**.
   - **Raison** : Permet la connexion distante via l'adapter `@prisma/adapter-libsql`.

## 🛡️ RÈGLES D'OR
1. **ERREUR PROTOCOLE** : Si tu vois `The database provider 'sqlite' does not support the protocol 'libsql'`, c'est que tu as mis l'URL Turso dans `DATABASE_URL`. Utilise `file:./dev.db` pour les commandes CLI.
2. **PAS DE `migrate reset` EN PROD** : Ne jamais réinitialiser Turso. Les changements de schéma se font via `db push` local puis application SQL manuelle si nécessaire.
3. **VÉRIFICATION AVANT ACTION** : Avant de tenter de modifier Turso, vérifie l'état actuel (ex: `PRAGMA table_info(Table)`) car il peut être déjà à jour via un `db push` précédent.

## 🚀 PROCÉDURES DE MISE À JOUR

### 1. Structure (Schéma)
Pour modifier les tables ou colonnes :
1. Modifier `prisma/schema.prisma`.
2. Lancer `npx prisma db push`. Cela met à jour `dev.db` localement.
3. Pour Turso, l'idéal est de générer le SQL :
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
   ```
   Puis d'appliquer les changements via le Turso CLI ou un script `@libsql/client`.

### 2. Données & Maintenance (Seeding)
Toujours utiliser les scripts dédiés qui ciblent `TURSO_DATABASE_URL` :
- **Données de référence** : `npx tsx scripts/seed-turso-final.ts`
- **Synchronisation Quizz** : `npx tsx scripts/sync-quiz-final.ts`
- **Setup Initial (Rôles, Forums, Settings)** : `npx tsx prisma/firstSetup.ts`

### 3. Debugging
- **Prisma Studio Local** : `npx prisma studio` (ouvre `dev.db`).
- **Inspection Turso** : Utiliser `npx tsx -e` avec `@libsql/client` pour exécuter du SQL direct (ex: `SELECT * FROM ...`).

## 🔗 DOCUMENTATION DE RÉFÉRENCE
- [Prisma + Turso Guide](https://www.prisma.io/docs/v6/orm/overview/databases/turso)
- [Prisma v7 Upgrade & Breaking Changes](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)

---
*Dernière mise à jour : 24 Avril 2026 suite à la stabilisation de l'architecture LibSQL.*
