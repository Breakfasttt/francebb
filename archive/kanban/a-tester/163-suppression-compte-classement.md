---
id: 163
title: "Suppression de compte et classement : coachs anonymes distincts"
epic: E10
app: site
depends_on: []
verify: "supprimer deux comptes de coachs ayant joué le même tournoi réussit ; au classement, les coachs anonymisés n'apparaissent plus fusionnés ; un coach est reconnu par son compte, puis son numéro NAF, puis son nom"
---

# 163 — Suppression de compte et classement : coachs anonymes distincts

## Pourquoi

La suppression d'un compte renomme le coach « Coach anonyme » dans les résultats. La base interdit deux résultats au même nom dans un tournoi : la seconde suppression échoue, et le droit à l'effacement ne peut plus être appliqué (audit, section 4.1). Au classement, tous les « Coach anonyme » sont additionnés en un faux coach.

Cette carte touche `lib/accountDeletion.ts`, qui appartient aussi à la carte 124 (session RGPD) : la modification se limite au nom anonyme.

## Action

1. Nom anonyme unique par résultat : « Coach anonyme » suivi de 4 caractères de l'identifiant du résultat.
2. Classement (`app/classement/actions.ts`) : reconnaître un coach par son compte lié s'il n'est pas le compte fantôme, sinon par son numéro NAF, sinon par son nom ; exclure les résultats anonymisés.

## Résultat

Chaque résultat d'un coach supprimé reçoit son propre nom anonyme, « Coach anonyme » suivi des 4 derniers caractères de l'identifiant du résultat (`anonymousCoachName`). Les matchs du coach reprennent le nom anonyme de son résultat dans le même tournoi. La modification de `lib/accountDeletion.ts` se limite à ce point (les constantes du compte fantôme et du nom anonyme sont désormais importées de `lib/rankingCoach.ts`) : la carte 124 de la session RGPD, qui travaille sur ce fichier, doit en tenir compte.

Le classement (`app/classement/actions.ts`) reconnaît un coach par son compte lié s'il n'est pas le compte fantôme, sinon par son numéro NAF, sinon par son nom (`rankingCoachKey`). Les résultats anonymisés, rattachés au compte fantôme ou nommés « Coach anonyme… » (y compris ceux anonymisés avant cette carte), ne comptent plus. Les règles sont dans `lib/rankingCoach.ts`, un fichier sans dépendance testé par `tests/unit/rankingCoach.test.mjs`.

Vérification : un script ponctuel sur la base locale a créé un tournoi avec deux coachs, dont un présent deux fois (une ligne liée à son compte, une par son seul numéro NAF), puis supprimé les deux comptes avec la vraie fonction `anonymizeAndDeleteUser` : les deux suppressions réussissent, les trois résultats portent trois noms différents, et les données de test ont été effacées. Limite connue : un coach lié à son compte dans un tournoi et saisi par son seul numéro NAF dans un autre apparaît encore sur deux lignes du classement.
