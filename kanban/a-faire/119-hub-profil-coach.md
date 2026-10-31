---
id: 119
title: Profil de coach dans le hub, en lecture et en écriture par l'API
epic: E09
app: hub
depends_on: [118]
adr: 0007
verify: tests - deux noms de coach identiques à la casse près sont refusés ; la portée bbfrance:profile fait apparaître le profil dans le jeton et dans userinfo ; PATCH /api/v1/profile modifie le profil avec la portée bbfrance:profile:write et le refuse sans elle
---

# 119 — Profil de coach dans le hub, en lecture et en écriture par l'API

## Pourquoi

Le hub devient la référence de la fiche du coach (ADR-0007). Chaque application peut la lire. Elle peut aussi la modifier par l'API depuis sa propre interface, sans passer par les pages du passeport.

## Action

- Distinguer deux données :
  - l'**identifiant** (`User.id`, transmis comme `sub` dans le jeton) : unique, jamais modifiable, jamais affiché. Les applications s'en servent pour rattacher leurs données ;
  - le **pseudo** (nom de coach) : affiché et modifiable. Le documenter clairement dans `/api/doc`.
- Ajouter les champs avec `user.additionalFields` de Better Auth :
  - pseudo, unique sans tenir compte des majuscules (le champ `name` de Better Auth peut servir, à vérifier) ;
  - numéro NAF, facultatif et toujours « déclaré », car le hub ne le vérifie pas ;
  - région ;
  - avatar ;
  - langue ;
  - fuseau horaire.
- Ne pas ajouter de date d'inscription : elle existe déjà (`createdAt`). Ne pas ajouter la ligue : elle reste sur le site.
- Lecture : créer la portée `bbfrance:profile` et l'envoyer dans le jeton et dans userinfo (`customIdTokenClaims` et `customUserInfoClaims`).
- Écriture : créer la route `PATCH /api/v1/profile`. Elle demande le jeton d'accès du coach avec la portée `bbfrance:profile:write`, vérifie les données, enregistre la modification, écrit une ligne dans le journal d'audit et prépare l'événement `user.updated` (carte 121).
- Réserver les noms supprimés : avant d'accepter un nom, vérifier qu'il n'est pas dans la table des empreintes de noms supprimés.
- Documenter les champs et la route dans `/api/doc`.
