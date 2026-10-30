---
id: 018
title: Activer cacheComponents
epic: E03
app: site
depends_on: [017]
adr: 0005
verify: build OK, plus aucun `export const dynamic`
---

# 018 — Activer cacheComponents

## Action

`cacheComponents`, `'use cache'` avec userId en argument, `auth()` hors cache, remplacer `unstable_cache`.

## Report (2026-10-30) : pourquoi la carte n'est pas faite après la 017

La carte 017 est terminée. La 018 a été évaluée par deux essais de build (`cacheComponents: true`, journaux `logs/018-essai-1.log` et `logs/018-essai-2.log`), puis tout a été remis en l'état. Elle est **trop grosse et trop risquée pour être faite d'un bloc** ; elle demande d'abord une décision (`/council`), car elle change la façon dont la session arrive dans les pages.

### Ce que les essais montrent

1. Premier essai : 15 erreurs, une par `export const dynamic` (incompatible avec `cacheComponents`). Facile à retirer.
2. Second essai, sans ces lignes : le build s'arrête sur `/bbquizz/proposer` avec « Uncached data was accessed outside of `<Suspense>` », et signale aussi `/jouer` (« used `new Date()` before accessing … uncached data »). Le build s'arrête à la première page en échec : la liste complète n'est donc pas connue.
3. La cause de la première erreur touche **toutes les pages** : la mise en page générale (`app/layout.tsx`) lit le cookie de session hors de tout `<Suspense>`. Avec `cacheComponents`, c'est interdit.

### Les choix à trancher avant de coder

- **Option A, minimale** : mettre tout le `<body>` dans un `<Suspense>` vide, comme le propose la documentation de Next.js pour « sortir du pré-rendu ». Le build passe, mais aucune page ne gagne rien (chaque page reste calculée à la demande, comme aujourd'hui). Le thème ne peut plus être écrit sur la balise `<html>` par le serveur : il faudrait un petit script qui le pose avant l'affichage, à vérifier avec les captures des 7 thèmes.
- **Option B, le vrai gain** (une « coquille » statique envoyée tout de suite, barre de navigation et pied de page compris) : tout ce qui dépend du membre doit passer dans des `<Suspense>` ou être chargé par le navigateur. Cela concerne le thème, `BannedRedirect`, la barre de navigation et surtout `SessionProvider`, qui fournit `useSession()` à une dizaine de pages navigateur (messagerie, classement, ressources, administration, modération, fiche `/spy`…). Sans session fournie par le serveur, ces pages passeraient d'abord par l'état « chargement » et feraient une requête de plus (`/api/auth/session`). Chaque page devrait aussi avoir son `<Suspense>` ou un `loading.tsx`.
- **Codes de réponse** : une page qui appelle `notFound()` ou `redirect()` à l'intérieur d'un `<Suspense>`, une fois la coquille envoyée, répond « 200 » au lieu de « 404 » ou d'une redirection. À vérifier page par page (sécurité, référencement).
- **`use cache` sur Vercel** : la documentation de Next.js indique qu'en hébergement « serverless », le cache de `use cache` n'est en général pas conservé d'une requête à l'autre, alors que `unstable_cache` utilise le cache de données de Vercel. Remplacer `unstable_cache` (`app/page.tsx`, `app/forum/page.tsx`) pourrait donc rendre le forum plus lent en production. À confirmer dans la documentation de Vercel avant de le faire.
- **Coût des vérifications** : la suite e2e complète prend environ 12 minutes ; une migration page par page demande de nombreux passages.

### Proposition de découpage

1. `/council` sur l'option A ou B (et sur la façon de fournir la session aux pages navigateur), avec la question du cache sur Vercel.
2. Puis une carte par étape : retrait des `export const dynamic` et correction des `new Date()` ; mise en page générale ; pages par groupe (forum, profil, modération…) ; remplacement de `unstable_cache` une fois la question de Vercel réglée.

## Annulation (2026-10-30)

Après passage devant le conseil, le user a décidé d'abandonner la carte : voir `docs/adr/0005-pas-de-cache-components.md`. En résumé, le gain de vitesse serait presque nul (presque toutes les pages dépendent du membre connecté), le chantier présente un risque de sécurité (données d'un membre servies à un autre, pages interdites qui répondent « 200 »), et le cache de `use cache` n'est pas conservé sur Vercel sans service payant. La carte 070 mesure désormais le temps de réponse des pages principales pour savoir si la question doit être rouverte.
