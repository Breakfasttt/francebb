---
id: 078
title: "Vestiaire devient le thème de tous"
epic: E08
app: site
depends_on: [077]
adr: 0006
verify: sauvegarde vérifiée avant la migration ; après la migration, tous les membres sont en vestiaire et leur ancien thème est copié ; un visiteur voit Vestiaire sans éclair d'une autre couleur
---

# 078 — Vestiaire devient le thème de tous

## Pourquoi

Le responsable du projet a décidé d'imposer le nouveau thème « Vestiaire » à tous les membres, en leur laissant la possibilité de revenir à l'ancien (ADR 0006, point 3). Cela écrit dans la base de données : il faut une sauvegarde et une copie de l'ancien thème.

## Action

- Lire le skill `database-ops` avant toute opération.
- Ajouter une colonne facultative `previousTheme` au modèle `User`, et changer la valeur par défaut de `theme` en « vestiaire » (`apps/site/prisma/schema.prisma:49`).
- Écrire une migration qui copie `theme` dans `previousTheme`, puis met `theme` à « vestiaire » pour tous les membres. L'essayer d'abord sur une base locale.
- Mettre à jour `DEFAULT_SITE_THEME` dans `lib/themes.ts` et la valeur de repli de `app/layout.tsx`. Le thème reste posé par le serveur (ADR 0005).
- Faire et vérifier une sauvegarde de la production avant d'y appliquer la migration. Noter la procédure dans `DEPLOY.md`.

## Résultat

- Migration `apps/site/prisma/migrations/20261030180000_theme_vestiaire/migration.sql` :
  - elle ajoute la colonne facultative `previousTheme` ;
  - elle y copie le thème de chaque membre, puis donne « vestiaire » à tous ;
  - « vestiaire » devient la valeur par défaut des nouveaux comptes ;
  - aucune ligne n'est supprimée, et la requête d'annulation est écrite en tête du fichier.
- **Essai sur la base locale** (`prisma migrate deploy`) : le seul membre est passé de saison3 à vestiaire, et `previousTheme` vaut bien saison3.
- **Thème par défaut dans le code** : `DEFAULT_SITE_THEME` vaut « vestiaire ». Les replis codés en dur sur « saison3 » utilisent maintenant cette constante : `layout.tsx`, `auth.config.ts`, `auth.ts` et `ThemeProvider`. Le thème reste posé par le serveur (ADR 0005).
- **Non modifié : `prisma/firstSetup.ts`.** Il ne se modifie pas sans accord. Le compte administrateur qu'il crée garde « saison3 », que la migration remplace par « vestiaire » sur une base existante.
- **Tests.**
  - « vestiaire » est ajouté aux thèmes testés, avec quatre nouvelles captures : accueil, forum, signalement et page « banni ».
  - Avec un membre banni de plus par thème, la liste des bannis passe à deux pages. Le test de débannissement de `security.spec.ts` parcourt maintenant les pages.
  - Suite complète : 97 tests réussis avant cette correction du test, puis `security.spec.ts` vert.
- **Reste à faire par le user** : créer la branche de sauvegarde sur Neon avant de déployer en production. La procédure est dans `DEPLOY.md`.
