-- Carte 062 : correction de données, sans changement de structure.
-- L'inscription et le profil enregistraient l'identifiant « dark » pour le thème « Sombre »,
-- alors que ce thème s'appelle « default » dans la liste officielle (lib/themes.ts).
-- On remplace donc « dark » par « default » ; aucune ligne n'est supprimée.
UPDATE "User" SET "theme" = 'default' WHERE "theme" = 'dark';
