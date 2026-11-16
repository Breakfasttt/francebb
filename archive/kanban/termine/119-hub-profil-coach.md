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

## Résultat

- **Champs du profil** ajoutés à la table `user` : `nameKey` (pseudo en minuscules, unique), `naf`, `region`, `locale`, `timezone`. Migration `20261031130000_profil_coach`, qui remplit `nameKey`, la langue et le fuseau des comptes existants. Table `reservedName` pour les pseudos supprimés.
- **Pseudo unique** sans tenir compte des majuscules. Un nouveau compte Discord ou Google dont le pseudo est pris reçoit « Pseudo 2 ». L'identifiant (`User.id`, le `sub` des jetons) ne change jamais.
- **Lecture** : portée `bbfrance:profile`, dans l'id_token et par userinfo (`naf`, `region`, `locale`, `zoneinfo`, `member_since`), et `GET /api/v1/profile`.
- **Écriture** : `PATCH /api/v1/profile` (`lib/passportPlugin.ts`), avec le jeton d'accès et la portée `bbfrance:profile:write`, ou la session du coach sur le hub. Les données sont vérifiées (`lib/profile.ts`). Un pseudo pris renvoie 409, une donnée invalide 400 avec le détail par champ. `/update-user` de Better Auth est fermé.
- `register-client.mjs` donne les deux nouvelles portées aux applications. La route est documentée dans `/api/doc`.
- **Tests** : `pnpm --filter @bbfrance/hub test:api`, 16 tests verts, dont le parcours OIDC complet (autorisation, échange du code, id_token, userinfo, écriture refusée sans la portée, jeton inventé refusé).
- **Reste pour la carte 122** : la lecture de ces champs par le site.
