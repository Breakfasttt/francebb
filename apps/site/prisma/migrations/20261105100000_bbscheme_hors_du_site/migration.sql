-- Carte 179 (ADR-0008) : les schémas BBScheme quittent la base du site pour celle de l'application BBScheme
-- (apps/bbscheme). En production, cette migration ne doit être appliquée qu'après le transfert des schémas dans la
-- base de l'application et la comparaison du nombre de lignes (voir DEPLOY.md).

-- DropForeignKey
ALTER TABLE "BBSchemeState" DROP CONSTRAINT "BBSchemeState_creatorId_fkey";

-- DropTable
DROP TABLE "BBSchemeState";

