---
id: 017
title: Layout sans force-dynamic + jwt throttlé
epic: E03
app: site
depends_on: []
adr: 
verify: routes non `ƒ` au build ; requêtes connecté en baisse sur toutes les routes
---

# 017 — Layout sans force-dynamic + jwt throttlé

## Action

Retirer `force-dynamic` (`app/layout.tsx`), compteurs MP/modération en `<Suspense>`, thème lu du cookie ; callback jwt : relecture BDD seulement si `token.refreshedAt` > 5 min (attention : délai de prise d'effet d'un ban — `getActiveSession` doit rester sûr).

## Notes (2026-10-28)

Déjà fait en 014 : layout sans relecture du User, session mémoïsée par requête.
Throttle du jwt : inefficace tel quel — dans un server component Auth.js ne peut pas réécrire le cookie, le token rafraîchi n'est pas persisté ; il faudrait déplacer le rafraîchissement dans `proxy.ts` (runtime Node). Retirer `force-dynamic` n'a d'effet qu'avec des compteurs en `<Suspense>` (le layout lit les cookies).

## Résultat (2026-10-30)

### Ce qui a été fait

- **Relecture du profil limitée dans le temps** (`apps/site/auth.ts`). Le callback `jwt` ne relit plus le membre en base à chaque lecture de session, mais seulement si la dernière lecture date de plus de **5 minutes** (champ `refreshedAt` du jeton, constante `SESSION_REFRESH_INTERVAL_MS`). À la connexion, l'heure est notée sans requête.
- **Le proxy enregistre la session relue** (`apps/site/proxy.ts`). Comme le prévoyaient les notes, une limitation dans le seul callback ne servait à rien : un composant serveur ne peut pas réécrire le cookie, le jeton rafraîchi était perdu et la base aurait été relue à chaque page. Le proxy utilise désormais la configuration complète d'`auth.ts` (Next.js 16 l'exécute dans Node.js, il peut donc lire la base) : quand le jeton a plus de 5 minutes, il relit le profil et renvoie au navigateur un cookie à jour. `auth.config.ts` ne garde que la partie sans base de données.
- **`update()` force la relecture.** Un appel à `update()` depuis le navigateur relit toujours la base, qui écrase les valeurs envoyées. Sans cela, la limitation aurait ouvert une faille : `auth.config.ts` accepte un `role` envoyé par le navigateur, qu'un membre aurait pu se donner pendant 5 minutes. Le formulaire de profil (`ProfileEdit.tsx`) appelle maintenant `update()` après un changement de pseudo, d'avatar ou de thème, pour que la session suive tout de suite (l'inscription le faisait déjà).
- **`force-dynamic` retiré de `app/layout.tsx`.** La mise en page ne fait plus aucune requête elle-même : rôle, bannissement et thème viennent du cookie de session. Les compteurs de la barre de navigation (messages non lus, file de modération) sont calculés par `common/components/Navbar/navCounts.ts` ; la mise en page transmet la promesse sans l'attendre, et la barre affiche les pastilles dès qu'elles arrivent. Une première version remplaçait toute la barre une fois les compteurs prêts (`<Suspense>`) : elle cassait le bouton retour du téléphone, que les pages injectent dans la barre (erreur d'hydratation vue dans les tests), d'où le choix de la promesse.
- **Thème lu du cookie** : c'était déjà le cas depuis la carte 014 (le thème est dans le cookie de session) ; il n'y a plus aucune requête pour le thème.

### Décision de sécurité : 5 minutes

Un bannissement, une rétrogradation ou un changement de pseudo fait par un modérateur sur un autre membre prend effet **en 5 minutes au plus**, au lieu d'immédiatement. Cinq minutes, c'est le délai indiqué par la carte : assez court pour qu'un banni ne puisse presque rien faire, assez long pour supprimer la relecture sur presque toutes les pages vues (un membre change de page bien plus souvent). `getActiveSession()` reste la seule porte d'entrée des actions serveur ; elle se fie au bannissement du cookie, donc au même délai. Le jeton du hub (`hubIdToken`) n'est pas touché : il reste dans le cookie chiffré, jamais exposé au navigateur.

Vérifié sur un serveur de production local (`next start`, base de test) avec un script ponctuel, supprimé depuis :
- jeton relu il y a 1 minute pour un membre banni entre-temps : session encore non bannie (attendu) ;
- jeton relu il y a 6 minutes : relecture, session bannie ;
- page ouverte avec ce jeton ancien : le proxy renvoie un cookie à jour (banni, heure de relecture actuelle) ;
- `update({ role: "SUPERADMIN" })` envoyé par le navigateur : la session renvoie le rôle de la base (`COACH`).

### Chiffres

Requêtes en base par page, membre connecté (méthode et tableau complet dans `docs/baseline.md`) : une de moins sur chaque route mesurée, par exemple `/` 4 → 3, `/forum` 5 → 4, `/forum/topic/[id]` 37 → 35, `/bbscheme` 2 → 1. Mesures : `logs/017-mesure-avant.md`, `logs/017-mesure-apres.md`.

Le critère « routes non `ƒ` au build » **n'est pas atteint** : les 57 routes restent dynamiques (`logs/017-build.log`). La mise en page générale lit le cookie de session ; sans `cacheComponents`, cela suffit à rendre chaque page dynamique, avec ou sans `force-dynamic`. Seule la carte 018 (pré-rendu partiel) peut changer cela.

### Vérifications

- `npx tsc --noEmit` : 0 erreur. `node scripts/lint-ratchet.mjs` : 840 erreurs, plafond 840.
- `npx next build` : réussi (`logs/017-build.log`).
- Tests e2e (`logs/017-e2e.log`) : 57 réussis, 1 ignoré (audit), 2 échecs par dépassement de délai à la fermeture du navigateur (« Tearing down context »), sans écart d'image ni assertion fausse, déjà vus à la carte 019. Relancés seuls après `node scripts/e2e-db.mjs` : 3 sur 3 réussis (`logs/017-e2e-relance.log`). Le test « un banni est redirigé vers /banned » passe.
- Tests SSO du hub (`apps/hub`, `pnpm test:sso`, `logs/017-sso.log`) : 5 sur 5, dont la déconnexion globale et le banni du hub.
- Le script `scripts/baseline.mjs` crée désormais un cookie de test avec `refreshedAt`, comme pour un membre qui navigue déjà.

### Remarque hors carte

`scripts/local-postgres.mjs` croit qu'une base est démarrée alors qu'elle est arrêtée : il cherche le mot `running`, qui figure aussi dans `not_running`. Contourné ici avec `npx prisma dev start bbfrance-site`. À corriger dans une carte à part.
