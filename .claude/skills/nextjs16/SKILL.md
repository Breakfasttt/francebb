---
name: nextjs16
description: Faits utiles de Next.js 16.2 pour BBFrance (APIs asynchrones, cache, proxy, Turbopack) et où lire la doc officielle livrée avec Next. À lire avant d'écrire une page, une action serveur, du cache ou de toucher à proxy.ts.
---

# Next.js 16 dans BBFrance

**La source de vérité est la documentation livrée avec Next**, à la bonne version : `node_modules/next/dist/docs/` (`01-app/` pour l'App Router). La lire avant d'écrire du code Next qu'on ne connaît pas bien ; ne pas se fier à sa mémoire.

## Ce qui piège en 16

- **APIs de requête asynchrones** : `await params`, `await searchParams`, `await cookies()`, `await headers()`. L'accès direct n'existe plus.
- **Cache** :
  - `revalidateTag(tag, profile)` exige un profil (`"max"`, ou `{ expire }`), la forme à un argument est dépréciée ;
  - `updateTag(tag)` (actions serveur seulement) relit tout de suite ce qu'on vient d'écrire ;
  - `refresh()` (actions serveur seulement) recharge les données non mises en cache ;
  - `cacheLife` et `cacheTag` n'ont plus le préfixe `unstable_`.
- **`proxy.ts`** remplace `middleware.ts` et ne tourne qu'en Node. Dans BBFrance (carte 017), le proxy utilise la configuration complète d'Auth.js (`auth.ts`). Seuls le proxy et `/api/auth/*` peuvent réécrire le cookie de session : `auth()` dans un composant serveur ou une action lit le cookie mais n'enregistre jamais un jeton rafraîchi. Le proxy pose aussi la CSP avec un nonce.
- **Turbopack** est le compilateur par défaut ; `next dev` écrit dans `.next/dev` et un verrou empêche deux serveurs en même temps.
- **Routes parallèles** : chaque emplacement exige un `default.js`.
- **`next/image`** : `images.remotePatterns` (et non `images.domains`) ; une image locale avec paramètres d'URL exige `images.localPatterns`.
- **Défilement** : Next ne neutralise plus `scroll-behavior: smooth` pendant la navigation.
- **ESLint** se lance directement (plus de `next lint`).

## Outils

- Serveur MCP `next-devtools` (déclaré dans `.mcp.json`) : erreurs de compilation, routes, journaux et actions serveur du serveur de développement lancé. S'en servir pendant la boucle d'interface plutôt que de deviner.
