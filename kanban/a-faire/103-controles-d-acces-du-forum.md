---
id: 103
title: "Contrôles d'accès du forum"
epic: E01
app: site
depends_on: []
adr: 
verify: un test e2e montre que chaque action est refusée sans le droit (forum réservé, sujet verrouillé, forum de destination interdit)
---

# 103 — Contrôles d'accès du forum

## Pourquoi

L'inventaire de la carte 075 a montré que plusieurs actions serveur du forum ne vérifient pas les droits. Une action serveur est une porte d'entrée publique : n'importe qui peut l'appeler directement. Carte à faire en premier.

## Action

- `moveTopic` : vérifier que le modérateur a accès au forum de destination ; filtrer par rôle la liste des forums proposée sur la page du sujet.
- `updatePost`, `deletePost`, `togglePostReaction` et `markTopicAsRead` : passer par `forumAccess` et respecter le verrouillage. `markTopicAsRead` ne doit pas compter de vue pour un appel anonyme.
- `markAllTopicsAsRead` : ignorer les sujets archivés et ceux auxquels le rôle n'a pas accès.
- Ajouter les tests correspondants.
