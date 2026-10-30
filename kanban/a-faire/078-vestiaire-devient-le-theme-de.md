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
