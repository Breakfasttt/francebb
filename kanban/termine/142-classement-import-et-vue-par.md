---
id: 142
title: "Classement : import en double, vue par roster"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un import n'appelle teamfrancebb.fr qu'une fois ; getRanking n'écrit plus dans la console ; la vue « Par roster » suit l'année choisie ; test e2e pour la vue
---

# 142 — Classement : import en double, vue par roster

## Pourquoi

Trois défauts trouvés pendant la refonte du classement du Championnat de France (carte 097) :

- Pendant un import d'archive, `fetchLegacyRanking` est appelé deux fois : le site interroge deux fois teamfrancebb.fr pour rien.
- `getRanking` écrit des messages `console.log` à chaque appel, ce qui encombre les journaux du serveur.
- La vue « Par roster » porte toujours sur l'année civile en cours, quelle que soit l'année choisie dans l'onglet « Année ».

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Ne garder qu'un appel à `fetchLegacyRanking` par import (`apps/site/app/classement/actions.ts`).
- Retirer les `console.log` de `getRanking`.
- Faire suivre l'année choisie à la vue « Par roster », ou indiquer clairement l'année affichée.
- Compléter `apps/site/tests/e2e/inventaire/classement.spec.ts`.

## Résultat

Fait (tests écrits, pas encore lancés : la campagne de tests est lancée à la fin par le coordinateur).

- **Import en double** : la page `/classement` n'appelle plus `fetchLegacyRanking`. « Lancer l'import » ouvre directement l'éditeur `/classement/edit-archive?importYear=…` (après la confirmation habituelle si l'année existe déjà) ; l'éditeur interroge l'ancien site une seule fois et, si l'import échoue, affiche le message d'erreur au-dessus d'une archive vide (`role="alert"`). La fenêtre d'import reste ouverte (« Importation… ») pendant le chargement de l'éditeur.
- **Messages de console** : les trois `console.log` de `getRanking` sont retirés.
- **Vue « Par roster »** : elle porte maintenant sur une année (filtre `ROSTER_2025` ; l'ancien `ROSTER` reste compris comme l'année en cours). En ouvrant l'onglet, elle reprend l'année choisie dans la liste de l'onglet « Année » (sinon la plus récente) ; une liste déroulante « Année » propre à la vue permet d'en choisir une autre, et la phrase au-dessus du classement nomme l'année affichée.
- Fichiers : `apps/site/app/classement/actions.ts`, `apps/site/app/classement/page.tsx`, `apps/site/app/classement/edit-archive/page.tsx`, fiche `docs/features/classement-statistiques/README.md`.
- Test : `apps/site/tests/e2e/inventaire/classement.spec.ts`, premier test complété (la vue par roster reprend l'année précédente choisie dans l'onglet « Année », puis passe à l'année en cours par sa propre liste).
- À essayer à la main : choisir l'année précédente dans l'onglet « Année », ouvrir « Par roster » (même année), changer l'année dans la liste ; en modérateur, lancer l'import d'une année absente de l'ancien site (message d'erreur dans l'éditeur).
