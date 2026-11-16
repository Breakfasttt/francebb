---
id: 133
title: "Fin d'inscription : revenir à la page demandée"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un nouveau membre qui ouvre /forum/new-topic sans être connecté, se connecte puis termine son inscription arrive sur /forum/new-topic ; test e2e qui le vérifie
---

# 133 — Fin d'inscription : revenir à la page demandée

## Pourquoi

Bug trouvé pendant la refonte (carte 091). Quand un nouveau membre se connecte pour la première fois, il est envoyé vers l'inscription (onboarding). Cette redirection, faite dans `apps/site/auth.config.ts`, ne garde pas la page qu'il voulait ouvrir au départ : à la fin de l'inscription, il revient toujours à l'accueil.

La correction touche la logique de connexion : elle doit être relue avec soin (et avec la session qui travaille sur le hub de connexion).

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Transmettre la page demandée (`callbackUrl`) à la redirection vers l'onboarding, en vérifiant qu'il s'agit d'une adresse du site (jamais d'une adresse extérieure).
- Utiliser cette adresse à la fin de l'onboarding.
- Ajouter un test e2e.

## Résultat

Fait, sans lancer les tests. À relire avec soin, comme le demande la carte, car la correction touche la connexion.

- `apps/site/auth.config.ts` (rappel `authorized`) : la redirection vers l'inscription porte la page demandée dans `?callbackUrl=` (chemin et paramètres de l'adresse demandée sur le site lui-même), sauf pour l'accueil.
- `apps/site/app/auth/onboarding/page.tsx` : la page lit `callbackUrl` et le fait passer par `safeCallbackUrl` (`lib/safeRedirect.ts`), qui refuse toute adresse extérieure au site et renvoie alors l'accueil. L'adresse vérifiée est transmise à `OnboardingForm.tsx` et à `OnboardingSuccess.tsx`, qui y envoient le membre à la fin au lieu de l'accueil.
- Test écrit : `apps/site/tests/e2e/bugs/articles-membres.spec.ts`, groupe « carte 133 » : un nouveau membre qui ouvre `/forum/new-topic?forumId=e2e_forum` arrive sur l'inscription puis, une fois son pseudo validé, sur `/forum/new-topic?forumId=e2e_forum` ; une adresse de retour extérieure (`https://exemple-pirate.test/piege`) est ignorée.
- **Test existant à adapter** (ce lot n'avait pas le droit de le modifier) : `apps/site/tests/e2e/inventaire/connexion.spec.ts` attend l'adresse exacte `/auth/onboarding` après avoir ouvert `/forum` (expression `/\/auth\/onboarding$/`, vers la ligne 161), puis l'accueil à la fin de l'inscription (`/localhost:\d+\/$/`, vers la ligne 206). Avec la correction, l'adresse devient `/auth/onboarding?callbackUrl=%2Fforum` et le membre arrive sur `/forum` à la fin. Il suffit d'écrire `/\/auth\/onboarding(\?|$)/` et `/\/forum$/`.
- Remarque : un visiteur non connecté qui ouvre `/forum/new-topic` est renvoyé vers `/forum`, pas vers la connexion (`app/forum/new-topic/page.tsx`). Le parcours complet « visiteur, connexion, inscription, page demandée » ne marche donc que pour les pages qui renvoient vers `/auth/login?callbackUrl=…`. Ce renvoi appartient au forum, hors de ce lot.
- Fiche mise à jour : `docs/features/auth/README.md`.
- À essayer à la main : se connecter avec un compte neuf en ouvrant une page précise (par exemple `/membres`), terminer l'inscription et vérifier l'arrivée sur cette page.
