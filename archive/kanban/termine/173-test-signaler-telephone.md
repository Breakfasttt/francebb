---
id: 173
title: "Test « Signaler » sur téléphone à mettre à jour"
epic: E10
app: site
depends_on: []
verify: "le test « la fenêtre de signalement s'ouvre » de forum-recherche.spec.ts passe en taille téléphone et en taille ordinateur"
---

# 173 — Test « Signaler » sur téléphone à mettre à jour

## Pourquoi

Le test de bout en bout « la fenêtre de signalement s'ouvre depuis le panneau Plus » (`apps/site/tests/e2e/inventaire/forum-recherche.spec.ts`) échoue en taille téléphone. Il cherche « Signaler » dans le panneau « Plus », alors que depuis la carte 156 les actions d'un sujet sont dans le panneau « Outils du sujet », et celles d'un message dans son menu « ⋯ ». Le site fonctionne, c'est le test qui est périmé (relevé pendant la carte 169).

## Action

Faire chercher au test le bouton « Signaler » là où il est aujourd'hui, en taille téléphone comme en taille ordinateur, puis lancer ce seul fichier de test dans les deux tailles.

## Résultat

Le test qui cherchait « Signaler » dans le panneau « Plus » a été corrigé : il utilise maintenant l'aide `findTool` du même fichier, qui cherche le bouton « Signaler le sujet » directement dans la page sur ordinateur et dans le panneau « Outils du sujet » sur téléphone. Il a été renommé « [membre] la fenêtre de signalement du sujet s'ouvre depuis les outils du sujet et reçoit les appuis » et ne saute plus l'exécution sur ordinateur, il vérifie donc les deux tailles. L'aide `openMore`, devenue inutile, a été supprimée. Le site n'a pas été modifié. Le fichier `forum-recherche.spec.ts` passe en entier : 26 tests réussis, en ordinateur et en téléphone.
