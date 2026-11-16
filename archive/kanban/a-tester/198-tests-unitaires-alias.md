---
id: 198
title: "Tests unitaires : accepter l'alias @/ et recevoir le membre en paramètre"
epic: E12
app: site
depends_on: []
verify: "un test unitaire importe un fichier de lib/ qui contient un import en @/ et passe avec corepack pnpm --filter @bbfrance/site test:unit ; logModerationAction reçoit le membre en paramètre au lieu de relire la session ; aucune nouvelle bibliothèque ajoutée ; corepack pnpm check passe"
---

# 198 — Tests unitaires : accepter l'alias @/ et recevoir le membre en paramètre

## Pourquoi

Les tests unitaires du site tournent avec Node seul (`node --experimental-strip-types --test tests/unit/*.test.mjs`, `apps/site/package.json:12`). Node ne comprend pas l'alias `@/`, le raccourci qui désigne le dossier `apps/site/` dans les imports. Résultat : un fichier n'est testable que s'il n'importe rien. C'est écrit en clair dans `lib/forumWriteRules.ts:2-3` (« Ce fichier n'importe rien, pour pouvoir être testé directement par Node »).

Conséquences :

- on extrait de toutes petites fonctions sans import pour pouvoir les tester (`isTopicClosedFor`, `registrationRefusal`…), mais les défauts se trouvent dans les fichiers qui les appellent, eux non testés ;
- les droits des actions serveur sont « vérifiés » en cherchant du texte dans le code source (`tests/e2e/security.spec.ts:26-47`, par exemple `expect(body(name)).toMatch(/findAccessiblePost\(/)`). La carte 103 reconnaît qu'aucun vrai test « appeler l'action sans le droit » n'a été écrit ;
- `logModerationAction` (`lib/moderationLog.ts:34-41`) relit lui-même la session du membre, au lieu de la recevoir de l'action qui l'appelle. Il est donc impossible de l'appeler dans un test avec un membre fictif.

Cette carte est la condition pour tester les fichiers que créeront les cartes 199, 200 et 201.

## Action

- Faire résoudre `@/` par les tests unitaires **sans nouvelle bibliothèque**, par exemple avec le champ `imports` de `package.json` (alias reconnus par Node lui-même) ou un petit chargeur Node. Comparer les deux pistes et choisir la plus simple ; expliquer le choix dans `ARCHITECTURE.md`.
- Écrire un premier test qui importe un fichier de `lib/` utilisant `@/`, pour prouver que ça marche.
- Faire recevoir le membre en paramètre à `logModerationAction` et adapter ses appelants (lister d'abord tous les appelants).
- Décrire dans `ARCHITECTURE.md` la règle à suivre ensuite : la règle métier vit dans `lib/` et reçoit le membre en paramètre ; l'action serveur lit la session puis l'appelle.
- Ajouter les termes nouveaux au glossaire (`docs/GLOSSAIRE.md`).

## Résultat

Les tests unitaires comprennent maintenant l'alias `@/` et les imports sans extension du code Next.js, sans bibliothèque ajoutée. Deux pistes ont été comparées. Le champ `imports` de `package.json` n'accepte que des alias qui commencent par `#` : il aurait fallu réécrire tous les imports du site. Le choix retenu est donc un petit chargeur Node, `tests/unit/alias-loader.mjs`, passé par `--import` dans le script `test:unit` et dans `scripts/check.mjs`. Il enregistre les règles de `tests/unit/alias-hooks.mjs`, qui essaient le chemin tel quel, puis avec `.ts`, `.tsx` ou `/index.ts`. Les fichiers `.tsx` (JSX) restent impossibles à charger ainsi.

Premier test d'un fichier de `lib/` qui importe par `@/` : `tests/unit/tournamentRegistrations.test.mjs` vérifie le choix pré-inscription ou liste d'attente et la montée depuis la liste d'attente (le plus ancien d'abord, rien pour un tournoi annulé), avec une fausse transaction en mémoire. Les 117 tests unitaires passent.

`logModerationAction` (`lib/moderationLog.ts`) reçoit le membre en premier paramètre et ne lit plus la session. Ses 40 appels, dans 10 fichiers d'actions serveur, lui passent `session.user.id`, ou `user.id` là où l'action avait déjà vérifié cette variable. Dans six actions (changement de rôle, modération d'un article, verrouillage d'un forum ou d'un sujet, modération d'une ressource), le contrôle d'accès vérifie maintenant explicitement que la session existe avant le rôle. Le comportement ne change pas, mais TypeScript le sait.

`ARCHITECTURE.md` décrit la règle à suivre (« règle métier dans `lib/`, membre en paramètre ; l'action serveur lit la session puis l'appelle ») et le fonctionnement des tests unitaires. Le glossaire explique « Alias `@/` » et « Chargeur Node ». `corepack pnpm check` passe.

Rien à essayer à la main : le journal de modération doit continuer à se remplir normalement, ce que le test de parcours et les tests de modération vérifieront à la fin de la série.
