---
id: 134
title: "Lien mort vers un coach dans les résultats"
epic: E01
app: site
depends_on: [102]
adr: 
verify: dans le bloc des résultats d'un tournoi, le nom d'un coach mène à sa fiche (/spy/<id>) ; test e2e qui le vérifie
---

# 134 — Lien mort vers un coach dans les résultats

## Pourquoi

Bug trouvé pendant la refonte (carte 092). Dans le bloc des résultats d'un tournoi, le nom d'un coach mène à `/profile/<id>` (`apps/site/app/forum/component/TournamentResultWidget.tsx`, vers la ligne 79). Cette page n'existe pas : la fiche d'un autre membre est à `/spy/<id>`. Le lien mène donc à une page introuvable.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Remplacer le lien par `/spy/<id>` (comme la carte 105 l'a fait pour la messagerie et les articles).
- Chercher dans tout le site s'il reste d'autres liens `/profile/` suivis d'un identifiant.
- Ajouter le test e2e et mettre à jour la section 18 de `docs/refonte/inventaire.md`.

## Résultat

Dans `apps/site/app/forum/component/TournamentResultWidget.tsx`, le nom d'un coach mène maintenant à `/spy/<id>`. Ce composant sert aussi au classement de `/forum/tournament/<id>/results/view`, corrigé du même coup. Une recherche dans tout `apps/site` ne trouve plus aucun autre lien `/profile/` suivi d'un identifiant. La section 18 de `docs/refonte/inventaire.md` est mise à jour.

Test écrit (non lancé) : `apps/site/tests/e2e/bugs/forum.spec.ts`, groupe « Carte 134 ». Il ouvre le sujet d'un tournoi terminé, déplie « Résultats du tournoi » et vérifie l'adresse du lien du coach.
