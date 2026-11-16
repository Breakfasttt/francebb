---
id: 187
title: "Tournois : dates, tournoi en cours et annulation"
epic: E10
app: site
depends_on: []
verify: "un tournoi reste à venir ou en cours jusqu'à la fin de son dernier jour (heure de Paris) sur l'accueil, la carte, la liste et la fiche d'une ligue ; un tournoi passé sans résultats n'est plus affiché comme à venir ; une date de fin avant la date de début est refusée ; un tournoi annulé peut être rétabli, et ses résultats ne comptent pas au classement"
---

# 187 — Tournois : dates, tournoi en cours et annulation

## Pourquoi

Audit, section 4.1 : sur l'accueil et la carte, un tournoi disparaît dès son premier jour ; sur la liste, dès son deuxième jour ; la fiche d'une ligue affiche pour toujours comme « à venir » un tournoi passé sans résultats ; la carte prend 100 tournois sans tri ; une date de fin avant le début est acceptée à la création ; une annulation ne se défait pas.

## Action

Une seule règle partagée (fonction pure, testée) : un tournoi est à venir ou en cours tant que sa date de fin (ou sa date, s'il n'en a pas) n'est pas passée, en jour de Paris. L'appliquer à l'accueil, à `/carte` (avec tri par date), à `/tournois` et à la fiche d'une ligue. Refuser une date de fin avant la date de début à la création. Bouton « Rétablir le tournoi » pour un tournoi annulé (organisateur, commissaires, modération).

## Résultat

Une seule règle des dates est écrite dans `apps/site/lib/tournamentDates.ts`, testée par `tests/unit/tournamentDates.test.mjs` : un tournoi est à venir ou en cours tant que son dernier jour (sa date de fin, ou sa date de début s'il n'en a pas) n'est pas fini, à minuit heure de Paris, heure d'été comprise. Elle s'applique à l'accueil, à la carte `/carte` (qui prend maintenant les 100 tournois les plus proches, triés par date), à la liste `/tournois`, à la fiche d'une ligue, aux badges « Passé » de la liste des tournois et du forum, et au module d'inscription.

Une date de fin avant la date de début est refusée à la création comme à la modification, avec le même message. Un tournoi annulé peut être rétabli par l'organisateur, les commissaires ou la modération (bouton « Rétablir le tournoi » des outils du sujet, action `restoreTournament`) ; il redevient terminé seulement s'il a déjà des résultats. Le classement écartait déjà les tournois annulés (`getRanking`), ce qui a été vérifié. Le message de confirmation de l'annulation ne la dit plus définitive.

Le test d'inventaire `tests/e2e/inventaire/tournois.spec.ts` rétablit maintenant le tournoi annulé dans le test des outils du sujet. Il reste à le lancer.
