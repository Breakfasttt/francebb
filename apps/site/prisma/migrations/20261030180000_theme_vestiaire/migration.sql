-- Carte 078 (ADR 0006) : le thème « Vestiaire » devient le thème de tous les membres.
-- 1. Nouvelle colonne facultative « previousTheme » : elle garde le thème que chaque membre avait avant la refonte,
--    pour que le bandeau du nouveau look (carte 083) lui propose d'y revenir en un clic.
-- 2. Copie du thème actuel de chaque membre dans « previousTheme », puis passage de tous les membres à « vestiaire ».
-- 3. « vestiaire » devient la valeur par défaut des nouveaux comptes.
-- Aucune ligne n'est supprimée. Pour revenir en arrière : UPDATE "User" SET "theme" = "previousTheme" WHERE "previousTheme" IS NOT NULL;
ALTER TABLE "User" ADD COLUMN "previousTheme" TEXT;

UPDATE "User" SET "previousTheme" = "theme" WHERE "theme" <> 'vestiaire';
UPDATE "User" SET "theme" = 'vestiaire';

ALTER TABLE "User" ALTER COLUMN "theme" SET DEFAULT 'vestiaire';
