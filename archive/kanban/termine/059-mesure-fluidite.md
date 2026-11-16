---
id: 059
title: Mesurer la fluidité mobile (Lighthouse)
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: note Lighthouse mobile mesurée pour les 5 pages principales et écrite dans docs/mobile-audit.md
---

# 059 — Mesurer la fluidité mobile (Lighthouse)

## Pourquoi

La règle « mobile impeccable » inclut la fluidité, mais elle n'est pas encore mesurée : il faut l'outil Lighthouse (note sur 100 de la vitesse et de la réactivité d'une page).

## Action

**Demande l'accord du user** pour ajouter la bibliothèque `lighthouse` (outil de Google, en dépendance de développement). Puis mesurer en mode mobile l'accueil, le forum, un sujet, les tournois et le profil ; objectif 90/100. Écrire les résultats dans `docs/mobile-audit.md` et créer une carte par page sous l'objectif.

## Résultat

- Accord du responsable du projet obtenu : `lighthouse` 13.5.0 ajouté en dépendance de développement de `apps/site` (version exacte).
- Nouvelle commande `pnpm lighthouse` (dans `apps/site`) : recrée la base de test jetable des e2e, prépare et lance le site en version de production (`next build` puis `next start`, port 3200), puis mesure chaque page 3 fois avec Lighthouse en mode mobile et garde la médiane. Fichiers : `playwright.lighthouse.config.ts` et `tests/lighthouse/lighthouse-mobile.spec.ts`. Le profil est mesuré connecté grâce à un cookie de session fabriqué par le script (la connexion de test n'existe pas en production).
- Notes du 30/10/2026 : accueil 97, forum 93, sujet 91, tournois 95, **profil 75**. Détail, indicateurs (LCP, TBT, CLS), causes et limites de la mesure locale dans `docs/mobile-audit.md`.
- Page sous l'objectif : le profil, corrigé par la carte 063 (contenu qui saute à cause de `useIsMobile`, fichiers CSS bloquants, logo trop lourd).
- LCP, TBT et CLS ajoutés au glossaire ; la commande est listée dans le `README.md`.
