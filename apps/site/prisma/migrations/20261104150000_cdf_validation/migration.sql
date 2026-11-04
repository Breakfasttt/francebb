-- Carte 162 : validation des résultats CDF par la modération.
-- Les tournois CDF déjà terminés reçoivent une date de validation vide : ils sont « en attente de validation » et ne
-- comptent plus au classement national tant qu'un modérateur ou un administrateur ne les a pas validés.

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "cdfValidatedAt" TIMESTAMP(3),
ADD COLUMN     "cdfValidatedById" TEXT;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_cdfValidatedById_fkey" FOREIGN KEY ("cdfValidatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
