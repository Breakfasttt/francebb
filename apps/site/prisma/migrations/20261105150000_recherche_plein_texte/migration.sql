-- Carte 191 : recherche plein texte du forum, en français et sans tenir compte des accents.
-- Migration écrite à la main : Prisma ne sait pas écrire une colonne générée ni une configuration de recherche.

-- Extension « unaccent » : un dictionnaire qui retire les accents (« équipe » devient « equipe »).
-- Elle est fournie par Postgres, disponible sur Neon et sur la base locale de `prisma dev`.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Configuration de recherche « french_unaccent » : celle du français (mots vides comme « du » ou « les » ignorés,
-- pluriels et conjugaisons ramenés à leur racine), précédée du retrait des accents.
CREATE TEXT SEARCH CONFIGURATION french_unaccent (COPY = french);
ALTER TEXT SEARCH CONFIGURATION french_unaccent
  ALTER MAPPING FOR hword, hword_part, word WITH unaccent, french_stem;

-- Colonnes générées : Postgres calcule lui-même la liste des mots (tsvector) à chaque écriture du titre ou du message.
-- Les balises BBCode (« [b] », « [url=…] »…) sont remplacées par une espace pour ne pas être prises pour des mots.
ALTER TABLE "Topic" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('french_unaccent'::regconfig, regexp_replace("title", '\[[^\]]*\]', ' ', 'g'))) STORED;

ALTER TABLE "Post" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('french_unaccent'::regconfig, regexp_replace("content", '\[[^\]]*\]', ' ', 'g'))) STORED;

-- Index GIN : un index qui, pour chaque mot, donne la liste des lignes qui le contiennent.
CREATE INDEX "Topic_searchVector_idx" ON "Topic" USING GIN ("searchVector");
CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");
