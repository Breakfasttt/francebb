---
id: 028
title: Accès forum par rôle (allowedRoles) pour les membres connectés
epic: E03
app: site
depends_on: [014]
adr:
verify: smoke — un COACH ne voit ni n'ouvre une catégorie/forum/topic réservé MODERATOR (accueil, forum, topic, recherche, non-lus) ; un modo les voit
---

# 028 — Accès forum par rôle pour les membres connectés

## Problème

`allowedRoles` (catégorie, forum) = un nom de rôle, sens « ce rôle et supérieurs » (`StructureTab.tsx:604`). Seul l'anonyme est filtré (`allowedRoles: "ALL"`) : tout membre connecté voit et ouvre les catégories, forums et topics réservés (accueil, `forum/[id]`, `topic/[id]`, recherche, non-lus, sujet au hasard…).

## Action

1. `lib/forumAccess.ts` : `getForumAccess()` mémoïsé par requête → noms de rôles accessibles = `ALL` + rôles `RoleConfig` dont `power` ≤ puissance du user (repli `ROLE_POWER`), + fragments `where` Prisma pour forum (forum + catégorie + forum parent) et topic.
2. Appliquer : accueil (clé de cache = niveau d'accès), `forum/[id]`, `topic/[id]` (+ reply, edit, new-topic : refus), recherche (page + `api/forum/topics/search`), non-lus (`unreadState`, `getUnreadTopics`), `getRandomPostUrl`, derniers topics de `app/page.tsx`, activité profil, statistiques.
3. Accès direct refusé → même réponse qu'aujourd'hui pour l'anonyme.
4. Smoke : forum réservé MODERATOR dans `globalSetup`, tests COACH refusé / modo autorisé.
