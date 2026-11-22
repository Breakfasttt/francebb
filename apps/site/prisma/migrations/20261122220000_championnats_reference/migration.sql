-- Carte 227 : championnats des tournois en données de référence.
-- 1. Explication facultative pour chaque élément des données de référence.
ALTER TABLE "ReferenceData" ADD COLUMN "description" TEXT;

-- 2. Liste des championnats d'un tournoi (clés du groupe CHAMPIONSHIP), qui remplace les cinq colonnes isNAF… isTSC.
ALTER TABLE "Tournament" ADD COLUMN "championships" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Recopie des cinq colonnes dans la liste AVANT leur suppression : aucun tournoi ne perd ses championnats.
UPDATE "Tournament"
SET "championships" = array_remove(ARRAY[
  CASE WHEN "isNAF" THEN 'NAF' END,
  CASE WHEN "isCDF" THEN 'CDF' END,
  CASE WHEN "isCGO" THEN 'CGO' END,
  CASE WHEN "isTGE" THEN 'TGE' END,
  CASE WHEN "isTSC" THEN 'TSC' END
], NULL);

-- 4. Suppression des cinq anciennes colonnes, désormais recopiées.
ALTER TABLE "Tournament" DROP COLUMN "isNAF",
DROP COLUMN "isCDF",
DROP COLUMN "isCGO",
DROP COLUMN "isTGE",
DROP COLUMN "isTSC";
