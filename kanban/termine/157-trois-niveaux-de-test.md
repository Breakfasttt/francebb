---
id: 157
title: "Trois niveaux de test"
epic: E08
app: tout le dépôt
depends_on: []
verify: "`pnpm check` passe en moins de 2 minutes ; `pnpm test:parcours` (dans apps/site) passe en moins de 5 minutes et échoue si l'on introduit volontairement un bouton trop petit ou une page cassée ; la procédure /ship ne lance plus la suite complète sans demande"
---

# 157 — Trois niveaux de test

## Pourquoi

La suite de tests de bout en bout (des tests où un navigateur piloté par un robot utilise vraiment le site) compte environ 130 tests et met 15 à 25 minutes. Elle était lancée à chaque carte, ce qui ralentit trop le développement. Le responsable a décidé, le 4 novembre 2026, de passer à trois niveaux de test.

## Action

1. **Niveau 1, vérification du code, pendant le développement.** Une commande `pnpm check` à la racine du dépôt : vérification des types (`tsc`) et des règles de code (ESLint, avec son plafond d'erreurs), dans chaque application. Ni serveur, ni navigateur. Environ une minute.
2. **Niveau 2, parcours de fin de carte.** Une commande `pnpm test:parcours` dans `apps/site`, avec une configuration Playwright à part et un seul fichier de test :
   - le serveur est démarré une seule fois, la connexion est faite une seule fois (un coach de test), et toutes les pages principales sont visitées l'une après l'autre dans la même fenêtre : accueil, forum, un sujet, tournois, ligues, une ligue, articles, un article, carte, classement, messagerie, profil, ressources, BBScheme ;
   - sur chaque page : elle s'affiche sans erreur, avec son titre ; en taille téléphone, pas de défilement horizontal et des boutons d'au moins 44 pixels ; puis la même page en taille ordinateur ;
   - une seconde connexion, en administrateur, pour les pages d'administration et de modération ;
   - objectif : 2 à 4 minutes. Les vérifications de page reprennent celles de `tests/e2e/mobile-audit.spec.ts` (ne pas les réécrire).
3. **Niveau 3, suite complète.** `pnpm test:e2e`, sans changement, lancée seulement à la demande du responsable.
4. **Documents.** Procédure `/ship` (`.claude/commands/ship.md`) : niveau 1, puis niveau 2, la suite complète seulement sur demande. Mettre à jour `.claude/CLAUDE.md`, les commandes du `README.md` et `docs/GLOSSAIRE.md` (terme « parcours de test »).

## Limite connue

Le parcours vérifie l'affichage des pages, pas les actions (poster un message, s'inscrire à un tournoi). Celles-ci restent couvertes par la suite complète, lancée à la demande.

## Résultat

- **Niveau 1** : `pnpm check` (`scripts/check.mjs`). Il vérifie les types des quatre applications et paquets en même temps, puis lance le cliquet ESLint. Mesuré : 47 secondes.
- **Niveau 2** : `pnpm --filter @bbfrance/site test:parcours` (`apps/site/playwright.parcours.config.ts`, `apps/site/tests/parcours/parcours.spec.ts`).
  - Le parcours visite 27 pages, en visiteur, en modérateur puis en administrateur, avec une seule connexion par type de membre, en taille téléphone puis ordinateur.
  - Il relève tous les problèmes avant d'échouer, et écrit un résumé dans `apps/site/logs/parcours.txt`.
  - Mesuré : 84 secondes en tout, dont une minute de test.
  - Au premier essai, il a bien repéré une page introuvable (un article absent des données de test, désormais créé par le parcours) et, sur `/carte`, des images coupées et deux liens de moins de 44 pixels. Ces deux derniers points sont acceptés comme écarts connus (`KNOWN_ISSUES`) : ce sont les tuiles de la carte Leaflet, coupées par leur cadre, et la mention des sources exigée par la licence d'OpenStreetMap.
- La fonction de mesure de l'audit mobile a été déplacée telle quelle dans `tests/e2e/mobileMeasure.ts`, partagée par l'audit et le parcours.
- **Niveau 3** : `pnpm test:e2e`, sans changement, lancé seulement à la demande.
- Documents mis à jour : `/ship`, `.claude/CLAUDE.md`, `README.md` (section « Vérifier son travail ») et le glossaire (« Parcours de fin de carte »).
- **Limite** : le serveur de développement du site doit être arrêté pendant le niveau 2, car Next.js 16 refuse un second serveur dans le même dossier.
