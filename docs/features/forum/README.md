# Feature — Forum

## Rôle

Forum communautaire : catégories → forums → sous-forums → topics → posts, BBCode, réactions, mentions, suivi des non-lus, modération. Route `/forum`.

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `app/forum/page.tsx` | Accueil : structure en cache (`unstable_cache`, clé `anonymous`/`member`, 60 s), dernier topic par forum |
| `app/forum/unreadState.ts` | `getUnreadState(userId)` : topics non lus + forums concernés, une requête, mémoïsé par rendu |
| `app/forum/component/ForumCategory.tsx` | Rendu client d'une catégorie (type `ForumIndexCategory`) |
| `app/forum/component/ForumSidebar.tsx` | Sidebar partagée (accueil, liste, topic) : non-lus, actions modo |
| `app/forum/[id]/page.tsx` | Liste des topics d'un forum (carte 015) |
| `app/forum/topic/[id]/page.tsx` | Page topic (carte 016) |
| `app/forum/actions.ts` | Server actions (topics, posts, lectures, modération, tournois) |

## API publique

`getUnreadState(userId)` (serveur) ; server actions de `app/forum/actions.ts` (toutes via `getActiveSession()`).

## Invariants

- Aucune donnée propre à un user dans un cache partagé : le cache de l'accueil ne contient que la structure, le non-lu est calculé à part.
- Ne charger que ce qui est affiché (`select`), jamais un `User` complet vers un composant client.
- Accès par rôle : toute lecture/écriture de catégorie, forum, topic ou post passe par `lib/forumAccess.ts` (`getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum`). `allowedRoles` = « ce rôle et supérieurs » ; une restriction de catégorie ou de forum parent s'applique aux forums en dessous. Accès direct refusé : login pour l'anonyme, 404 pour un membre. Les server actions sont des endpoints publics : filtrer aussi les lectures.

## État

- Carte 014 (faite) : `/forum` connecté 16 → 6 requêtes, anonyme 5 → 0 (cache chaud).
- Carte 028 (faite) : accès par rôle appliqué (accueil, forum, topic, réponse, édition, nouveau sujet/tournoi, recherche + API, non-lus, sujet au hasard, suivis, activité profil). Coût : +1 requête connecté (lecture `RoleConfig`).
- `getRecentPosts` supprimée (aucun appelant). `getForums`, `getSiblings` sans appelant, filtrées par rôle.
- Cartes ouvertes : 015, 016, 020.
