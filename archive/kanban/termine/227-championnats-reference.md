---
id: 227
title: Championnats des tournois en données de référence
app: site
---

# 227 — Championnats des tournois en données de référence

## Pourquoi

Les championnats d'un tournoi (NAF, CDF, CGO, TGE, TSC) étaient 5 colonnes fixes de la table des tournois (`isNAF`… `isTSC`). En ajouter, en renommer ou en expliquer un demandait de modifier le code. Le responsable veut les gérer dans l'administration, comme les autres listes, avec une description pour chacun (demande du 22/11/2026, pendant le test local avant déploiement).

Décision (option A, validée) : une liste de clés sur le tournoi (`championships: ["CDF", "NAF"]`), comme les autres données de référence rangées en clés texte, plutôt qu'une table de liaison.

## À faire

1. Base : colonne `description` (facultative) sur `ReferenceData` ; liste `championships` sur `Tournament` ; la migration recopie les 5 booléens puis supprime les colonnes (SQL montré au responsable avant commit).
2. `firstSetup.ts` (accord du responsable, `upsert`) : groupe `CHAMPIONSHIP` — NAF (tournoi homologué par la NAF), CDF (Championnat de France), CGO (Challenge du Grand Ouest), TGE (Tournoi du Grand Est), TSC (Tournoi de la Sainte Chatte).
3. CDF protégé : nom et description modifiables ; ni suppression, ni désactivation, ni changement de clé (classement, points et validation des résultats en dépendent).
4. Administration, « Données de référence » : groupe « Championnats » et champ description pour toutes les listes.
5. Code : `lib/referenceData.ts`, `lib/tournamentForm.ts`, formulaire de tournoi (cases issues de la liste, description en aide), `forum/actions.ts`, fiche du tournoi, éditeur et vue des résultats, filtre et liste `/tournois`, `tournois/actions.ts`, classement, données d'exemple, reprise de la bêta.
6. Tests unitaires du formulaire ; tests e2e des tournois et du classement.

## Résultat

Fait le 22/11/2026, option A (liste de clés sur le tournoi).

- **Base** : migration `20261122220000_championnats_reference` : `ReferenceData.description` (facultative), `Tournament.championships` (liste de clés) ; les 5 colonnes `isNAF`… `isTSC` sont recopiées dans la liste puis supprimées (DROP accordé par le responsable). Vérifié sur la base d'exemple : chaque tournoi garde ses championnats.
- **Données de base** : `firstSetup.ts` crée le groupe `CHAMPIONSHIP` (NAF, CDF, CGO, TGE, TSC, avec description) ; relancé, il ne réécrit pas les modifications faites dans l'administration (`keepAdminEdits`).
- **CDF protégé** (`lib/championships.ts`, `PROTECTED_REFERENCE_KEYS`) : ni suppression, ni désactivation, ni changement de clé, refusés par le serveur et masqués dans l'onglet ; nom, description et ordre modifiables.
- **Code** : `isCdf()` et `withCdf()` remplacent les booléens (actions de création et de modification, classement, résultats, validation CDF, page du sujet) ; le formulaire lit ses cases dans les données de référence (description en aide, championnat désactivé depuis gardé sur le tournoi) ; l'action ne garde que les clés connues (`knownChampionshipKeys`). Filtre `/tournois` : une case par championnat, paramètre `ch_<clé>`, tous exigés.
- **Administration** : groupe « Championnats », champ description pour toutes les listes, badge « Protégé ».
- **Tests** : tests unitaires du formulaire (nettoyage des clés, CDF à part) ; tests e2e des tournois, du classement et de l'audit mobile adaptés (non lancés, suite complète sur demande) ; `pnpm check` et `test:parcours` verts ; plafond ESLint du site abaissé de 165 à 159.
- Docs : fiches `tournois` et `classement-statistiques`.
- À essayer à la main : recopié dans `TESTS-MANUELS.md` (section 27).
