---
id: 138
title: "Icônes de /carte et recherche de membre"
epic: E01
app: site
depends_on: [102]
adr: 
verify: les icônes des repères de /carte sont servies par le site lui-même ; les résultats de UserSearch se choisissent au clavier et sont annoncés comme des boutons ; test e2e
---

# 138 — Icônes de /carte et recherche de membre

## Pourquoi

Deux défauts trouvés pendant la refonte (carte 094) :

- Les icônes des repères de la carte interactive `/carte` sont chargées depuis `raw.githubusercontent.com` et cdnjs, deux sites extérieurs. Si l'un d'eux ne répond plus, les repères disparaissent de la carte.
- Le composant partagé `UserSearch` (recherche d'un membre, utilisé pour transférer une ligue et ailleurs) affiche ses résultats dans des `div` cliquables : on ne peut pas les choisir au clavier, les lecteurs d'écran ne les annoncent pas comme des boutons, et le composant garde l'ancien style.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Copier les icônes des repères dans `apps/site/public/` (en vérifiant leur licence) et les charger depuis le site.
- Refaire les résultats de `UserSearch` avec des boutons de `packages/ui` (ou réutiliser `MemberPicker` de la messagerie s'il convient), en gardant son interface publique.
- Ajouter les tests e2e.

## Résultat

- Repères de `/carte` : trois dessins SVG faits pour le site (repère rouge, repère doré, ombre), dans `apps/site/public/images/carte/`, chargés par `LeafletMapContainer.tsx`. Les images du dépôt `leaflet-color-markers` n'ont pas été copiées, faute de licence vérifiée ; l'ombre de Leaflet (licence BSD) aurait pu l'être, mais un dessin local évite toute question de licence.
- `UserSearch` : ses résultats étaient déjà des boutons de `packages/ui` depuis la carte 101 (on les choisit au clavier par Tab puis Entrée). Ajouts : un nom lu par les lecteurs d'écran sur le champ (le texte d'exemple disparaît dès la première lettre), un groupe nommé « Membres trouvés » autour des résultats, et la touche Échap qui ferme la liste. L'interface publique du composant n'a pas changé.
- Fichiers : `apps/site/app/carte/component/LeafletMapContainer.tsx`, `apps/site/public/images/carte/marker-red.svg`, `marker-gold.svg` et `marker-shadow.svg` (créés), `apps/site/common/components/UserSearch/UserSearch.tsx` (composant partagé, changement minimal), fiche `docs/features/ligues-carte/README.md`, `docs/GLOSSAIRE.md` (mot « SVG »).
- Tests écrits, non lancés : `apps/site/tests/e2e/bugs/tournois-ligues.spec.ts`, les deux tests « 138 ».
- Reste : le choix du lieu (`MapPicker`, formulaires de tournoi et de ligue) charge encore ses repères depuis unpkg.com, un autre site extérieur.
- À essayer à la main : ouvrir `/carte` et vérifier que les repères rouges (tournois) et dorés (ligues) s'affichent bien, sur téléphone et sur ordinateur.
