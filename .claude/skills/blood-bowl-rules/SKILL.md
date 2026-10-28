---
name: blood-bowl-rules
description: Où trouver les règles du jeu Blood Bowl et les sources de la communauté française. À lire avant d'écrire une logique de jeu (rosters, calculs de points, probabilités) ou un texte sur les règles.
---

# Règles du jeu Blood Bowl

## Source locale, à consulter en premier

Le livre de règles (LRB, saison 3) est dans le dépôt : `apps/site/public/data/docs/lrb_s3.txt`. Le chercher avec Grep ou le lire avec Read pour toute question technique : compétences, rosters (listes d'équipes et de joueurs), déroulement d'un tour.

## Sources en ligne

1. **NAF** (`thenaf.net`) : association internationale, classement mondial, règles officielles et variantes de tournoi.
2. **Team France BB** (`teamfrancebb.fr`, forum `teamfrancebb.1fr1.net`) : histoire et forum de la communauté française.
3. **Mordorbihan** (`mordorbihan.fr`) : guides et stratégies en français.
4. **Championnat de France** (règlement sur le forum Team France BB) : calcul des points du classement, implémenté dans `apps/site/common/utils/cdf.ts`.

## Consignes

1. Toujours chercher d'abord dans `lrb_s3.txt`, puis sur le web (NAF ou Mordorbihan) si besoin.
2. Employer les termes officiels du jeu (Turnover, Esquive, Blocage…).
3. Vérifier les calculs de dés et de probabilités avec ces sources.
