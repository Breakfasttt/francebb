---
id: 221
title: Vérification complète des fonctionnalités
app: site
---

# 221 — Vérification complète des fonctionnalités

## Pourquoi

Il faut pouvoir tester chaque fonctionnalité du site avec chaque rôle, et savoir comment les fonctionnalités agissent les unes sur les autres. La revue des droits a trouvé une quinzaine de failles côté serveur, surtout dans l'administration et la modération :

- un rôle inventé est accepté ;
- le journal de modération peut être purgé entièrement ;
- un modérateur peut supprimer un compte ;
- un message supprimé reste modifiable ;
- un outil système peut être modifié par la voie de la modération ;
- la messagerie accepte les comptes bannis ;
- plusieurs actions d'administration ne sont pas inscrites au journal.

Décisions du user (21/11/2026) :

- **Invité** = visiteur non connecté, plus le compte `exemple-nouveau`. Pas de nouveau rôle.
- **Suppression d'un compte** : admin et plus, avec la même règle à l'écran et sur le serveur.
- **Corriger toutes les failles**, chacune avec un test.
- **Documentation** : section « Interactions » dans chaque fiche, plus `docs/features/INTERACTIONS.md`.

## À faire

1. **Données de test** (`apps/site/prisma/seedScript/exampleData.ts`, toujours en `upsert`)
   - Nouveaux comptes : `exemple-admin-2`, `exemple-modo-2`, un coach à rôle personnalisé, un banni encore inscrit à un tournoi.
   - Forum et sujets dans tous leurs états, plus un sujet « Vitrine BBCode » qui utilise toutes les balises.
   - Articles, ressources, ligues et tournois dans tous leurs cas : par équipes, complet, annulé, NAF, tous les statuts de paiement.
   - Messagerie de groupe, blocage, signalements de chaque type, journal de modération, notifications.
   - La liste de connexion de développement montre tous les comptes `exemple-*`.

2. **Corrections des droits**
   - Fichiers : `membres`, `administration`, `moderation`, `forum`, `messagerie`, `ressources` et `profile` (`actions.ts`), plus `lib/roles.ts` et `lib/moderationLog.ts`.
   - Liste détaillée dans le plan.
   - Hors chantier, en cartes séparées : signaler un message privé, bannissement temporaire, limite d'actions par minute, modérateurs par forum, avertissements.

3. **Tests**
   - Tests unitaires des nouvelles règles.
   - `tests/e2e/permissions.spec.ts` : chaque faille refusée, avec chaque rôle.
   - Profils ajoutés aux tests de parcours.
   - Section « Rôles » dans `TESTS-MANUELS.md`.

4. **Documentation**
   - Section « Interactions » dans le modèle et dans les 16 fiches.
   - 3 nouvelles fiches : permissions, éditeur BBCode, recherche et non-lus.
   - `docs/features/INTERACTIONS.md` : tableau rôle × action et liste des comptes de test.

## Résultat
