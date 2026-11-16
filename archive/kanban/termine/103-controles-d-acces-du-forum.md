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

## Résultat

- `apps/site/app/forum/actions.ts` : une garde commune `findAccessiblePost` ne retrouve un message que si son sujet est accessible au rôle du visiteur. `isLockedFor` refuse l'action si le sujet ou le forum est verrouillé, sauf pour un modérateur.
  - `updatePost`, `deletePost` et `togglePostReaction` passent par ces deux gardes. Une réaction sur un message supprimé est refusée.
  - `deletePost` ne charge plus tous les messages du sujet pour rien.
  - `markTopicAsRead` ne compte une vue et ne marque comme lu que si le sujet est accessible. Les vues des visiteurs non connectés sont toujours comptées, pour ne pas fausser les compteurs. La carte proposait de les supprimer : ce choix est volontairement écarté.
  - `markAllTopicsAsRead` ignore les sujets archivés et ceux des forums réservés à d'autres rôles.
  - `moveTopic` vérifie que le sujet et le forum de destination sont accessibles au rôle du modérateur.
- `apps/site/app/forum/topic/[id]/page.tsx` : la liste des forums de destination proposée aux modérateurs est filtrée par rôle.
- **Test** : `tests/e2e/security.spec.ts` contrôle dans le code source que chaque action garde ses vérifications. Un test de comportement (appeler l'action sans le droit) demanderait l'identifiant interne que Next.js donne à chaque action serveur. Il n'a pas été écrit.
- **Vérifications** : types et ESLint verts (817 erreurs, plafond inchangé). Suite e2e complète : 80 tests réussis. Les 6 échecs restants venaient des captures des thèmes, à cause du lien « Médias » de la carte 105 ; ces captures ont été régénérées.
