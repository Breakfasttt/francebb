---
id: 137
title: "Ligue : lien Google Maps effacé, département"
epic: E01
app: site
depends_on: [102]
adr: 
verify: modifier une ligue qui a un lien Google Maps le garde ; le département d'une ligue est enregistré au même format que celui d'un tournoi ; tests e2e qui le vérifient
---

# 137 — Ligue : lien Google Maps effacé, département

## Pourquoi

Deux défauts trouvés pendant la refonte (carte 094) :

- L'action `updateLigue` efface le champ `gmapsUrl` (lien Google Maps) à chaque modification d'une ligue, car le formulaire n'a jamais eu ce champ : la valeur vide écrase l'ancienne.
- Le département d'une ligue est enregistré par son libellé (« 35 - Ille-et-Vilaine »), alors que les tournois enregistrent le numéro (« 35 »). Les deux ne peuvent donc pas être comparés ou filtrés ensemble.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Ne mettre à jour `gmapsUrl` que s'il est envoyé par le formulaire (ou ajouter le champ au formulaire si le responsable le souhaite).
- Choisir un seul format pour le département (le numéro), l'appliquer au formulaire de ligue, et prévoir la reprise des ligues existantes. Toute modification des données existantes demande l'accord du responsable (skill `database-ops`).
- Ajouter les tests e2e.

## Résultat

- Lien Google Maps : `updateLigue` ne change `gmapsUrl` que si le formulaire l'envoie ; le formulaire n'ayant pas ce champ, le lien enregistré est gardé. Le champ n'a pas été ajouté au formulaire (choix prudent, à décider avec le responsable).
- Département : le formulaire de ligue envoie maintenant le numéro (« 35 »), comme celui d'un tournoi, et les actions `createLigue` et `updateLigue` ramènent toute valeur au numéro (nouvelle fonction `departmentNumber` de `lib/france.ts`). Une ligue enregistrée avec l'ancien libellé (« 35 - Ille-et-Vilaine ») s'ouvre avec le bon département choisi et passe au numéro à sa prochaine modification.
- Reprise des ligues existantes : **non faite**, elle demande l'accord du responsable. Proposition : un script ponctuel qui remplace, dans la table des ligues, chaque département de la forme « 35 - … » par son numéro (`departmentNumber`), après sauvegarde de la base, selon la skill `database-ops`.
- Fichiers : `apps/site/app/ligues/actions.ts`, `apps/site/app/ligues/component/LigueForm.tsx`, `apps/site/lib/france.ts`, fiche `docs/features/ligues-carte/README.md`.
- Test écrit, non lancé : `apps/site/tests/e2e/bugs/tournois-ligues.spec.ts`, test « 137 ».
- **Tests existants à mettre à jour** : `apps/site/tests/e2e/inventaire/ligues.spec.ts` attend encore l'ancien format, ligne 320 (`departement: "35 - Ille-et-Vilaine"` après la création) et ligne 444 (valeur du choix « Département » égale au libellé). Les deux doivent attendre « 35 ».
- À essayer à la main : modifier une ligue qui a un lien Google Maps et vérifier que le lien est toujours là.
