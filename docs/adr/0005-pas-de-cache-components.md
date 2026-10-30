# ADR-0005 — Ne pas activer `cacheComponents`

- **Statut** : accepté
- **Date** : 2026-10-30
- **Conseil** : oui (`/council`), décision finale prise par le user

> Rédigé pour quelqu'un qui découvre le projet : chaque terme technique est expliqué sur place ou dans `docs/GLOSSAIRE.md`.

## Le problème

La carte 018 proposait d'activer `cacheComponents`, un réglage de Next.js 16 (version 16.2.0 dans `apps/site/package.json`). Ce réglage envoie d'abord au navigateur une partie de la page identique pour tous les visiteurs (la « coque » : barre de navigation, pied de page), puis le contenu propre au membre au fur et à mesure (on parle d'envoi « en flux », ou *streaming*). Il permet aussi de garder en mémoire des résultats de calcul avec la directive `use cache`.

Deux essais de build ont échoué : la mise en page générale (`apps/site/app/layout.tsx`) lit le cookie de session en dehors d'un `<Suspense>`, la zone d'attente prévue pour le contenu envoyé plus tard. Pour activer le réglage, il faudrait modifier 15 pages qui forcent aujourd'hui le calcul à chaque visite (`export const dynamic`), ainsi que 8 pages et 6 composants qui lisent la session dans le navigateur (`useSession`).

Enfin, la carte 069 impose de relire le profil du membre en base à chaque page, pour qu'un bannissement s'applique tout de suite.

## La décision

On n'active pas `cacheComponents`. La carte 018 est rangée dans `kanban/annule/`. Les trois usages de `unstable_cache` (le cache de données actuel, dans `app/page.tsx` et `app/forum/page.tsx`) restent en place. On ajoute plutôt une mesure automatique du temps de réponse des pages principales (carte 070), pour savoir si un vrai problème de vitesse apparaît.

## Pourquoi

- **Option B (coque commune, contenu du membre envoyé ensuite), écartée pour un risque de sécurité.** Si une fonction mise en cache lit la session, les données d'un membre peuvent s'afficher chez un autre. De plus, une fois la coque envoyée, le code de réponse « 200 » (« tout va bien ») est figé : une page introuvable ou interdite ne répond plus « 404 » et ne redirige plus, ce qui affaiblit le contrôle d'accès (documentation de Next.js, page `loading.js`, section *Status codes*).
- **Le cache de `use cache` n'est pas conservé sur Vercel**, l'hébergeur prévu : la documentation de Next.js indique qu'en hébergement « serverless » (le serveur est relancé à la demande), ce cache en mémoire ne survit pas d'une requête à l'autre, sauf avec `use cache: remote`, qui demande un service payant (Redis). Elle recommande justement `unstable_cache` pour des données qui doivent durer.
- **Le gain serait presque nul** : presque toutes les pages dépendent du membre connecté, et la relecture du profil à chaque page (carte 069) est nécessaire de toute façon.
- **Option A (`<Suspense>` autour de toute la page), écartée** : elle permet au build de passer, mais n'apporte aucun gain. Le thème ne serait plus posé par le serveur, avec un risque de voir un éclair de mauvaises couleurs sur téléphone.
- La note Lighthouse (outil de Google qui note la vitesse d'une page sur 100) est déjà d'environ 90 sur téléphone ; les cartes 017 et 019 ont apporté l'essentiel du gain.

## Ce qu'on ne fait pas

- Pas de `use cache` ni de `use cache: remote`.
- Pas de retrait des `export const dynamic`.
- Pas de session chargée par le navigateur à la place du serveur.

## Risques

- Les pages restent calculées à chaque visite. La mesure de la carte 070 signalera une baisse de vitesse.
- Next.js évolue vite. On rouvre la question si au moins une de ces conditions est remplie :
  - Next.js garantit des codes de réponse corrects pendant l'envoi en flux ;
  - `use cache` est conservé sur Vercel sans service payant ;
  - le hub de connexion (ADR 0003) a simplifié la mise en page générale ;
  - la mesure montre plus d'une seconde de réponse sur une page principale.
- Si la mesure le justifie, une piste plus simple existe : recalculer les pages publiques très visitées (classement, tournois, forum en lecture) à intervalle fixe, au lieu de le faire à chaque visite. Une carte sera créée à ce moment-là.

## Cartes

018 (annulée), 069 (relecture du profil à chaque page), 070 (mesure du temps de réponse).
