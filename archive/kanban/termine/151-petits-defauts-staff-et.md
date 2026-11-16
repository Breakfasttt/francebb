---
id: 151
title: "Journal, isAdmin du classement, commentaires périmés"
epic: E01
app: site
depends_on: [102]
adr: 
verify: le journal de modération garde un ordre stable ; app/classement/actions.ts utilise lib/roles ; l'éditeur d'archives ne charge que les membres utiles ; plus aucun commentaire ne cite un composant supprimé
---

# 151 — Journal, isAdmin du classement, commentaires périmés

## Pourquoi

Petits défauts relevés pendant les cartes 102 et 144 :

- `getModerationLogs` trie seulement par date de création : deux lignes de même date peuvent changer d'ordre d'une page à l'autre.
- `apps/site/app/classement/actions.ts` redéfinit sa propre fonction `isAdmin` au lieu d'utiliser celle de `lib/roles`, ce qui risque de faire diverger les règles d'accès.
- L'éditeur d'archives du classement (`edit-archive/page.tsx`) charge tous les membres non bannis à chaque ouverture.
- Des commentaires citent des composants supprimés par la carte 101 : en-tête de `packages/ui/src/button.tsx` (`ClassicButton`, `CTAButton`, et une phrase qui dit le preflight absent alors qu'il est actif) et `apps/site/common/utils/signOutUser.ts` (`SignInButton`).

## Action

- Ajouter l'identifiant comme second critère de tri du journal.
- Remplacer l'`isAdmin` local par celui de `lib/roles`, après avoir comparé les deux règles.
- Ne charger dans l'éditeur d'archives que les membres nécessaires (recherche à la demande, comme `UserSearch`).
- Mettre à jour les commentaires périmés.

## Résultat

- Journal de modération : `getModerationLogs` (`app/moderation/actions.ts`) trie maintenant par date de création puis par identifiant, ce qui donne le même ordre d'une page à l'autre.
- `app/classement/actions.ts` utilise `isAdmin` de `lib/roles` et n'a plus sa propre copie. Les deux règles ont été comparées : pour les rôles de base elles sont identiques (Administrateur et Super administrateur). Seule différence : un rôle personnalisé compte comme coach dans `lib/roles`, donc il n'est pas administrateur, comme avec l'ancienne règle. Aucune règle plus stricte à choisir.
- Éditeur d'archives (`app/classement/edit-archive/page.tsx`) : la requête ne lisait déjà que les champs utiles (`select` sur identifiant, nom, image, cadre, numéro NAF), mais elle charge toujours tous les membres non bannis. Une recherche à la demande demanderait de remanier `ArchiveEditor` (le numéro NAF vient de cette liste, la recherche ne le renvoie pas) : laissé en l'état, à traiter dans une carte séparée si la liste devient trop grosse.
- Commentaires mis à jour dans `packages/ui/src/button.tsx` (plus de `ClassicButton` ni `CTAButton`, preflight actif) et `apps/site/common/utils/signOutUser.ts` (plus de `SignInButton`).
- Aucun test écrit : changements sans effet visible. À essayer à la main : ouvrir le journal de modération et changer de page.
