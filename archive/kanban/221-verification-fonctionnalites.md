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

Fait du 21 au 22/11/2026.

**Données de test** : comptes `exemple-admin-2`, `exemple-modo-2`, `exemple-coach-role-perso` (rôle personnalisé « Arbitre »), `exemple-banni-inscrit` ; forums réservés aux modérateurs et aux admins, forum verrouillé, sous-forum ; sujets dans tous les états (épinglé, verrouillé, archivé, supprimé, à fusionner, long de 26 messages), sujet « Vitrine BBCode » ; articles, ressources, ligues et tournois dans tous leurs cas (par équipes, complet, fermé, annulé, NAF, à valider, tous les paiements) ; messagerie de groupe, blocage, signalements de chaque type, journal, notifications. La liste de connexion de développement montre tous les comptes `exemple-*` (`lib/devAccounts.ts`). Le remplissage passe deux fois sans doublon.

**Failles corrigées, chacune testée** (`tests/e2e/permissions.spec.ts`, tests unitaires `roles`, `reportRules`, `messageRules`, `forumRights`, `tournamentRegistrationRules`) :
- changement de rôle : règle unique `roleChangeRefusal` (`lib/roles.ts`, `lib/memberRole.ts`), rôle vérifié en base, inscrit au journal ;
- suppression d'un compte : admin et plus (`canDeleteMember`) ; bannissement : jamais soi-même ni un compte technique (`canBanMember`) ;
- purge du journal : admin seulement, 3 mois minimum fixés par le serveur, elle-même inscrite au journal ;
- journal complété : rôles, données de référence, réglages, courriel à tous, catégories et ordre, message modifié par un modérateur, sujet renommé, ligue modifiée ;
- réglages : seules les clés prévues sont acceptées ;
- forum : message supprimé ou masqué non modifiable (`canSavePostEdit`), pas de réaction sur un message masqué, citations et sous-forums filtrés par les droits ;
- ressources : un outil système n'est pas modifiable par la voie de la modération ;
- signalements : type, motif, droit de voir la cible et doublon vérifiés ; signalements fermés quand le contenu est masqué ou supprimé ;
- messagerie : message vide ou trop long refusé, comptes bannis, inexistants ou techniques refusés, groupes limités à 20, renommage refusé après départ ; page réservée aux membres connectés ;
- tournois : badge « Banni » dans la gestion des inscriptions, inscription refusée si le sujet est supprimé ;
- articles : une lecture comptée par visite (route `app/api/articles/[id]/view`).

**Revue page par page** (visiteur, coach, modérateur, admin, banni ; captures dans `logs/ux-221/`) : forum (archives repliables, repère « Nouveaux messages », recherche regroupée, choix du forum à la création, sujet verrouillé expliqué), modération (onglet par défaut, fiches de signalement, journal filtrable, outils du sujet nommés clairement), tournois (paiements, capitaines, places, résultats), compte (messagerie, `/banned` et inscription sans navigation, profil sur téléphone, notifications).

**Décisions prises en autonomie** :
- vocabulaire « Masquer / Démasquer » partout au lieu de « Modérer / Annuler la modération » ;
- « Championnat de France » écrit en entier ;
- comptes techniques (« Système », « Coach Inconnu ») : ni bannis, ni supprimés, ni joignables par message privé ;
- `/banned` et `/auth/onboarding` sans la navigation du site.

**Documentation** : section « Interactions » dans le modèle et toutes les fiches, nouvelles fiches `permissions`, `editeur-bbcode`, `recherche-non-lus`, `docs/features/INTERACTIONS.md`, section « Rôles » de `TESTS-MANUELS.md`.

**Hors chantier** : cartes 222 (bannissement temporaire et avertissements), 223 (signaler un message privé, prévenir celui qui signale), 224 (limite d'actions par minute), 225 (modérateurs propres à un forum).

**Reste à essayer à la main** : `TESTS-MANUELS.md` §24 « Rôles ».
