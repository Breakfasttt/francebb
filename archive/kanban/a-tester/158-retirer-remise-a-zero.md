---
id: 158
title: "Retirer le bouton de remise à zéro du site"
epic: E10
app: site
depends_on: []
verify: "l'onglet de remise à zéro a disparu de l'administration et l'action serveur resetDatabase n'existe plus (recherche dans le code vide)"
---

# 158 — Retirer le bouton de remise à zéro du site

## Pourquoi

L'administration contient un bouton qui efface tout le site (messages, sujets, forums, tournois, membres), protégé seulement par une phrase affichée à côté. Combiné à la faille du BBCode (carte 159), un message piégé lu par un super administrateur pourrait le déclencher (audit, section 2.5).

## Action

Supprimer l'action `resetDatabase` de `app/administration/actions.ts`, l'onglet `ResetTab.tsx` et son entrée dans l'administration, ainsi que les tests qui s'en servent. Pour repartir d'une base vide en local, la procédure de la skill `database-ops` suffit.

## Résultat

Action `resetDatabase`, onglet « Zone de danger » (`ResetTab.tsx`) et test associé supprimés. Le test des onglets de l'administration vérifie maintenant que l'onglet n'existe plus, même pour le super administrateur. Fiche `docs/features/administration/README.md` mise à jour.
