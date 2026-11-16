---
id: 052
title: Dette : throw et auth() direct dans les actions
epic: E02
app: site
depends_on: []
adr:
verify: nombre de throw et d'auth() directs en baisse, mesuré par scripts/debt-count.mjs ; tests verts
---

# 052 — Dette : throw et auth() direct dans les actions

## Pourquoi

Les règles du projet (`ARCHITECTURE.md`) demandent de renvoyer `null` plutôt que `throw`, et de passer par `getActiveSession()`. Le code ancien ne les respecte pas partout.

## Action

Compter puis réduire, fichier par fichier : environ 44 `throw` dans `app/forum/actions.ts`, 15 dans la messagerie, 12 dans le profil, 13 dans les membres, plus les ligues et l'administration. Remplacer les `auth()` directs (résultats de tournoi, `/membres`, `/classement/edit-archive`) par `getActiveSession()`. Unifier les paramètres de retour après connexion (`callback` contre `callbackUrl`).

## Résultat

Mesure par `node scripts/debt-count.mjs` (dans `apps/site`), qui compte maintenant aussi les `throw` et les appels `auth()` directs :

| Compteur | Avant | Après |
|---|---|---|
| `throw` (lever une erreur) | 102 | 15 |
| `auth()` direct | 27 | 2 |
| `any` explicites (effet de bord) | 366 | 349 |
| Erreurs ESLint (plafond du contrôle) | 547 | 530 |

Ce qui a changé :

- Nouveau type commun `ActionResult` (`lib/actionResult.ts`) : une action qui modifie des données renvoie `{ success, error }` au lieu de lever une erreur. En production, Next.js remplace le message d'une erreur levée par un texte générique ; le membre voit maintenant la vraie raison du refus.
- Actions converties : membres (`updateUserRole`, `toggleBanUser`, `deleteUser`), profil (`updateProfile`, `toggleBlockUser`, `reportUser`, `deleteAccount`, `updateTheme`, `updateNotificationSettings`, `unlinkAccount`, `sendTestNewsletter`), inscription (`finishOnboarding`), ligue (`updateLigue`), administration (`resetDatabase`, `sendGlobalInfoMail`), messagerie (toutes ; les lectures renvoient `null` ou une liste vide), forum (15 actions : messages, sujets, réactions, verrouillage, modération, `deleteForum`, `updateTournament`).
- Tous les appelants affichent l'erreur dans une notification (`toast.error`). Les fenêtres `alert()` du navigateur ont disparu de ces parcours.
- Aucun contrôle de droits n'a été retiré : chaque refus qui levait une erreur renvoie maintenant `{ success: false }` au même endroit, avant toute écriture. Un contrôle a même été ajouté : `updateTournament` vérifie que le sujet et le premier message envoyés par le navigateur appartiennent bien au tournoi (avant, un organisateur pouvait réécrire le titre ou le message d'un autre sujet).
- Pages serveur : `auth()` remplacé par `getActiveSession()` partout ; `/auth/login` et `/banned` utilisent `getSession()` (session brute) car elles concernent les bannis. Les 2 `auth()` restants sont dans le helper `lib/authGuard.ts` lui-même.
- Retour après connexion : tous les liens utilisent `?callbackUrl=` (le seul nom lu par `/auth/login`). Avant, neuf liens utilisaient `?callback=`, ignoré : le membre revenait à l'accueil au lieu de la page demandée.
- `ARCHITECTURE.md` (règle des erreurs), le skill `reuse-first` et les fiches forum, auth, ligues, profil, messagerie, administration, BBQuizz et pages diverses sont à jour.

Vérifications : `npx tsc --noEmit` sans erreur ; `node scripts/lint-ratchet.mjs` sous le plafond (abaissé à 530) ; tests `smoke.spec.ts` et `security.spec.ts` : 36 réussis sur 36.

Ce qui reste (15 `throw`) :

- `createForum`, `createTopic` (forum, 7) et `createLigue` (2) servent directement d'action de formulaire (`<form action={...}>`), qui ne peut pas recevoir de réponse : il faut d'abord un petit composant navigateur qui appelle l'action et affiche l'erreur.
- `app/debugActions.ts` (2) : actions réservées au développement, laissées telles quelles.
- `app/bbquizz/actions.ts` (2) : erreur interne utilisée pour relancer une transaction, attrapée dans le même fichier ; légitime.
- `ThemeProvider.tsx` (1) et `ArticleReactions.tsx` (1) : code du navigateur, pas des actions serveur.
