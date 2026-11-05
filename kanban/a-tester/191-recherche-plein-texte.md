---
id: 191
title: "Forum : recherche en français rapide"
epic: E10
app: site
depends_on: []
verify: "chercher « nains chaos » trouve « Nains du Chaos » ; les mots sont trouvés malgré les accents et les pluriels ; la recherche s'appuie sur un index de la base au lieu de relire tous les messages"
---

# 191 — Forum : recherche en français rapide

## Pourquoi

Audit, sections 3.4 et 3.5 : la recherche ne trouve que la phrase exacte, et elle relit tous les messages deux fois à chaque recherche, ce qui deviendra lent quand le forum grandira.

## Action

Recherche plein texte de Postgres en configuration française (avec insensibilité aux accents si l'extension `unaccent` est disponible sur Neon et en local), colonne générée et index GIN créés par une migration écrite à la main ; requête de recherche réécrite ; résultats triés par pertinence puis par date ; même filtrage d'accès qu'aujourd'hui (`lib/forumAccess.ts`).

## Résultat

La recherche du forum est maintenant une recherche plein texte de Postgres, en français et sans tenir compte des accents. L'extension `unaccent` est disponible sur la base locale (`prisma dev`) et sur Neon (liste des extensions de Neon, pour Postgres 14 à 18) : la migration `20261105150000_recherche_plein_texte`, écrite à la main, crée l'extension, une configuration de recherche `french_unaccent` (dictionnaire français précédé du retrait des accents), une colonne générée `searchVector` sur `Post` (texte du message sans BBCode) et sur `Topic` (titre sans BBCode), et un index GIN sur chacune. Elle ne supprime rien. Dans `schema.prisma`, les deux colonnes sont déclarées `Unsupported("tsvector")?` avec la formule recopiée dans `dbgenerated(...)` : `prisma migrate diff` ne voit plus aucune différence, ni depuis la base locale ni depuis les migrations (vérification de la CI). `CLIENT_VERSION` est passé à `v28`.

La requête (`lib/forumSearch.ts`) utilise `websearch_to_tsquery` : tous les mots sont exigés, une expression entre guillemets est cherchée telle quelle et « -mot » écarte un mot. Un message est trouvé par son texte, ou parce qu'il est le premier message d'un sujet dont le titre contient les mots (règle de la carte 169). La recherche plein texte donne au plus 1 000 messages candidats, triés par pertinence (`ts_rank`) puis du plus récent au plus ancien ; Prisma applique ensuite les mêmes filtres qu'avant (droits d'accès par `topicAccessWhere`, modération, auteur, forum, période). Ce choix évite de recopier les droits d'accès en SQL. Le tri « Pertinence » est le nouveau tri par défaut ; « Plus récents d'abord » et « Plus anciens d'abord » restent possibles et apparaissent en pastille. L'extrait est préparé par Postgres (`ts_headline`), qui surligne aussi les mots trouvés malgré les accents et les pluriels, et reste affiché comme du texte.

La recherche de sujets par titre de l'éditeur (`/api/forum/topics/search`) n'a pas changé : elle est appelée pendant la frappe, et la recherche plein texte ne trouve pas un mot à moitié tapé.

Vérifications : test unitaire `forumSearchSnippet` ; script temporaire sur la base locale (supprimé, ainsi que ses données) : « nains chaos » trouve le sujet « Nains du Chaos » (premier message seulement) et un message « nains chaos », « équipe » trouve « equipes », la phrase « "nains du chaos" » ne trouve que la suite exacte, un sujet supprimé et un forum réservé n'apparaissent pas pour un visiteur, l'ordre par date est respecté à pertinence égale, une recherche de mots ignorés ne renvoie rien sans erreur, et Postgres utilise bien l'index GIN. Le test e2e `forum-recherche.spec.ts` n'a pas eu besoin d'être modifié (à pertinence égale, l'ordre reste du plus récent au plus ancien) ; il n'a pas été lancé.

Reste à vérifier sur Neon, au premier déploiement : que la migration crée bien l'extension `unaccent` avec le rôle de la chaîne de connexion (sinon, la créer dans l'éditeur SQL de Neon, voir `DEPLOY.md`), et que la création des colonnes générées reste rapide sur la vraie table des messages (elle recalcule chaque message une fois).
