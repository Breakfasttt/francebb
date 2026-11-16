---
id: 129
title: "Filtre de région des tournois sans accents"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un tournoi en « Île-de-France » apparaît quand on filtre /tournois sur cette région ; test e2e qui le vérifie
---

# 129 — Filtre de région des tournois sans accents

## Pourquoi

Bug trouvé pendant la refonte (carte 089). Le filtre de région de `/tournois` utilise des noms de région sans accents (« Ile-de-France »), alors que le formulaire de tournoi enregistre les noms accentués de la liste de référence (« Île-de-France »). Les tournois de ces régions ne sont donc jamais trouvés par le filtre.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Faire lire au filtre de `/tournois` la même liste de régions que le formulaire de tournoi (une seule source), en gardant compatibles les anciennes adresses qui contiennent un nom sans accents.
- Vérifier en base si des tournois ont été enregistrés avec l'une ou l'autre forme ; ne rien modifier en base sans accord.
- Ajouter un test e2e.

## Résultat

- Le filtre de `/tournois` lit maintenant les régions et les départements dans les données de référence (`REGION_FRANCE`, `DEPARTEMENT_FRANCE`), la même source que le formulaire de tournoi. La page serveur les charge et les passe aux filtres ; les deux listes écrites à la main (régions sans accents, noms de départements) ont été retirées de `TournamentFilters.tsx`. Si les données de référence sont vides, la liste de `lib/france.ts` sert de secours.
- Anciennes adresses : `?region=Ile-de-France` est renvoyée vers `?region=Île-de-France` (nouvelle fonction `canonicalRegion` de `lib/france.ts`), et la recherche accepte en base les deux écritures (avec et sans accents).
- Vérification en base non faite : je n'ai pas accès à la base réelle, et la recherche accepte de toute façon les deux écritures. Rien n'a été modifié en base.
- Fichiers : `apps/site/app/tournois/page.tsx`, `apps/site/app/tournois/component/TournamentFilters.tsx`, `apps/site/lib/france.ts` (fonctions `withoutAccents` et `canonicalRegion` ajoutées), fiche `docs/features/tournois/README.md`.
- Test écrit, non lancé : `apps/site/tests/e2e/bugs/tournois-ligues.spec.ts`, test « 129 ».
- À essayer à la main : sur `/tournois`, choisir la région « Île-de-France » dans les filtres ; ouvrir `/tournois?region=Ile-de-France` et vérifier que l'adresse devient « Île-de-France ».
