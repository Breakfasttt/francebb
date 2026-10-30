---
id: 081
title: "Nouvelle coquille et barre basse"
epic: E08
app: site
depends_on: [076, 077, 079, 080]
adr: 0006
verify: section 1 de l'inventaire cochée ; à 375 px : barre basse visible, cachée pendant la saisie, zone protégée respectée, boutons d'au moins 44 px ; REFONTE=0 rend l'ancienne coquille
---

# 081 — Nouvelle coquille et barre basse

## Pourquoi

La navigation actuelle est cachée sur téléphone dans un menu hamburger. L'ADR 0006 la remplace par une barre basse toujours visible et un panneau « Plus ». C'est la première chose que les coachs verront changer.

## Action

- Ajouter la variable d'environnement `REFONTE` : elle choisit l'ancienne ou la nouvelle coquille dans `app/layout.tsx`. La noter dans `DEPLOY.md`.
- Téléphone : barre basse à cinq onglets (Accueil, Forum, Tournois, Messages avec pastille, Plus). Le panneau « Plus » contient le profil, le thème, Ligues, Carte, Articles, Ressources, BBScheme, Quizz, Classement, Jouer, Statistiques, Médias, Modération et Administration avec leurs pastilles, les liens du pied de page, Déconnexion, et une rubrique « Cette page » qui reçoit le contenu de `#mobile-page-sidebar-slot`.
- Ordinateur : barre haute avec les mêmes destinations et un menu de compte.
- Nouveau `PageHeader` avec le bouton retour. Repositionner le bandeau cookies et les notifications au-dessus de la barre basse.
- Appliquer les conclusions de la carte 076 : barre cachée pendant la saisie, zone protégée de l'iPhone, ordre de superposition.
