---
id: E12
title: Regrouper les règles du forum et des tournois
phase:
---

# E12 — Regrouper les règles du forum et des tournois

Le 13 novembre 2026, une revue d'architecture du site (skill `improve-codebase-architecture`) a cherché les endroits où une même règle est recopiée dans plusieurs fichiers. Elle a porté sur les parties du code les plus souvent modifiées : le forum, les tournois et l'administration.

Le constat principal : les règles de droits (« qui peut modifier ce tournoi », « qui peut répondre à ce sujet ») et les règles de structure (« on ne supprime pas le forum Les tournois ») sont réécrites dans chaque action serveur, chaque page et chaque composant qui en a besoin. Une action serveur est une fonction exécutée sur le serveur quand le coach valide un formulaire ou clique sur un bouton. Les copies ont divergé, ce qui produit des boutons qui s'affichent puis échouent, une faille d'accès pour les modérateurs, et des valeurs par défaut différentes entre la création et la modification d'un tournoi.

Le principe des cartes de cette épopée : rassembler chaque règle dans **un seul fichier de `lib/`**, qui offre quelques fonctions simples et cache le reste (lecture de la base, contrôle des droits, verrou, notifications). Les actions serveur et les pages se contentent ensuite d'appeler ces fonctions. Une règle corrigée l'est alors partout à la fois, et on peut la tester directement.

Le rapport complet, avec les schémas avant et après, est dans `docs/audits/2026-11-13-architecture.html` (à ouvrir dans un navigateur). Ses six candidats correspondent aux cartes 198 à 203.

## Terminé quand

Les cartes 198 à 203 sont terminées : les tests unitaires peuvent importer un fichier de `lib/` qui utilise l'alias `@/` ; la création et la suppression d'un forum n'ont plus qu'une seule implémentation ; les droits sur un sujet ou un message sont calculés à un seul endroit, utilisé par le serveur et par l'écran ; les droits, la saisie et les inscriptions d'un tournoi sont regroupés dans un seul fichier ; le rafraîchissement des pages après un changement passe par une fonction par sujet (sujet, tournoi, structure du forum) ; et `lib/referenceData.ts` est soit supprimé, soit le seul accès aux données de référence.
