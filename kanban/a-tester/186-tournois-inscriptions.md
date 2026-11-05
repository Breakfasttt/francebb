---
id: 186
title: "Tournois : inscriptions, équipes et liste d'attente fiables"
epic: E10
app: site
depends_on: []
verify: "le serveur refuse une équipe trop grande, un coach dans deux équipes du même tournoi, une inscription à un tournoi passé, annulé ou terminé ; une place libérée fait monter le premier de la liste d'attente, qui est prévenu ; le nombre de places est compté pareil partout ; changer le format individuel/équipes demande confirmation en annonçant le nombre d'inscrits perdus"
---

# 186 — Tournois : inscriptions, équipes et liste d'attente fiables

## Pourquoi

Audit, section 4.1 : les équipes ne sont contrôlées sur rien (taille, coach dans deux équipes, capitaine qui en crée plusieurs, membres ajoutés sans leur accord) ; personne ne sort de la liste d'attente quand une place se libère ; le nombre de places n'est pas compté pareil à l'inscription et à l'affichage ; le serveur accepte une inscription à un tournoi passé ou annulé ; changer le format efface toutes les inscriptions sans prévenir.

## Action

1. Équipes (`createTeam`, `updateTeam`) : tournoi par équipes seulement, taille `coachsPerTeam`, un coach dans une seule équipe par tournoi, une seule équipe par capitaine, capitaine compris dans l'équipe ; un capitaine ne peut ajouter que des membres volontaires (inscrits comme mercenaires).
2. Inscriptions (`joinTournament`, `toggleMercenary`, `createTeam`) : refus côté serveur si le tournoi est passé, annulé ou terminé.
3. Places : une seule fonction (`lib/tournamentPlaces.ts`) pour l'inscription et l'affichage, dans une transaction.
4. Liste d'attente : quand une place se libère, le plus ancien de la liste d'attente passe pré-inscrit et reçoit une notification dans le site (carte 167).
5. Changement de format : confirmation qui annonce le nombre d'inscrits et d'équipes supprimés ; les inscrits sont prévenus par une notification.

## Résultat

Le serveur vérifie désormais toutes les règles des inscriptions et des équipes. Une inscription (coach, équipe ou mercenaire) est refusée pour un tournoi annulé, terminé, passé ou fermé, et une inscription individuelle est refusée dans un tournoi par équipes, comme une équipe dans un tournoi individuel. Une équipe compte au plus « coachs par équipe » coachs, capitaine compris, et peut s'inscrire incomplète pour se compléter ensuite. Un coach ne peut être que dans une seule équipe par tournoi, ce qui limite aussi chaque capitaine à une équipe. Le capitaine ne peut ajouter que des coachs qui se sont proposés comme mercenaires : dans la fenêtre de l'équipe, la recherche parmi tous les membres est remplacée par des cases à cocher listant les mercenaires, et un coéquipier retiré redevient mercenaire. Ces règles sont écrites dans `apps/site/lib/tournamentRegistrationRules.ts`, testé par `tests/unit/tournamentRegistrationRules.test.mjs`.

Les places sont comptées par la même fonction pour l'affichage et pour l'inscription (`freePlaces` de `lib/tournamentPlaces.ts`), dans une transaction protégée par un verrou propre au tournoi (`lib/tournamentRegistrations.ts`). Quand une place se libère (désinscription, équipe supprimée, nombre de places augmenté), le plus ancien de la liste d'attente passe pré-inscrit et reçoit une notification dans le site (`TOURNAMENT_PROMOTED`). Un changement de statut décidé par l'organisateur ne fait monter personne.

Changer le format d'un tournoi qui a des inscrits ouvre une confirmation qui annonce le nombre d'inscriptions individuelles, d'équipes et de mercenaires supprimés ; sans cette confirmation, le serveur refuse le changement. Les mercenaires sont maintenant supprimés avec le reste, et tous les coachs concernés reçoivent une notification (`TOURNAMENT_FORMAT_CHANGED`). Aucun changement de la base n'a été nécessaire, la colonne `type` des notifications étant un simple texte.

Le test d'inventaire `tests/e2e/inventaire/tournois.spec.ts` a été adapté (choix d'un coéquipier parmi les mercenaires) et complété (liste d'attente avec notification, tournoi passé sans bouton d'inscription, confirmation du changement de format). Il reste à le lancer.
