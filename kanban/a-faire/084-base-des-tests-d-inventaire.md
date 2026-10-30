---
id: 084
title: "Base des tests d'inventaire"
epic: E08
app: site
depends_on: [081]
adr: 0006
verify: dossier tests/e2e/inventaire/ créé ; le projet telephone rejoue les tests d'inventaire ; captures stables sur trois lancements de suite
---

# 084 — Base des tests d'inventaire

## Pourquoi

Chaque carte d'écran commence par écrire son test d'inventaire. Il faut une base commune : connexion par rôle, captures stables, projet téléphone.

## Action

- Créer `apps/site/tests/e2e/inventaire/` avec des fonctions d'aide pour se connecter comme visiteur, membre, modo, admin ou super admin.
- Configurer le projet Playwright `telephone` pour qu'il rejoue aussi les tests d'inventaire.
- Stabiliser les captures : police chargée, animations coupées, données de test fixes.
- Écrire le test d'inventaire de la section 1 (éléments présents sur toutes les pages).
