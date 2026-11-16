---
id: 130
title: "Filtre « Places restantes » des tournois"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un tournoi de 20 places dont 18 sont prises n'apparaît pas avec « Places restantes min. 5 » ; test e2e qui le vérifie
---

# 130 — Filtre « Places restantes » des tournois

## Pourquoi

Bug trouvé pendant la refonte (carte 089). Le filtre « Places restantes min. » de `/tournois` compare le nombre maximal de places du tournoi, et non le nombre de places encore libres (places maximales moins inscriptions). Un tournoi presque complet est donc affiché comme s'il avait encore de la place.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Calculer les places restantes (maximum moins inscriptions comptées) dans la requête de `/tournois`, ou filtrer après coup si la requête ne le permet pas simplement, sans casser la pagination.
- Ajouter un test e2e.

## Résultat

- Le filtre « Places restantes min. » compare maintenant les places restantes : places maximales moins places prises. Les places prises sont les inscriptions (ou les équipes, pour un tournoi par équipes) hors liste d'attente ; si le nombre importé de l'ancien site (`currentParticipants`) est plus grand, c'est lui qui compte.
- La base ne sait pas faire ce calcul dans un filtre : quand ce filtre est actif, la page lit d'abord les tournois qui passent les autres filtres (peu nombreux), garde ceux qui ont assez de places, puis la requête paginée cherche parmi eux. La pagination et le total restent justes.
- Choix fait : un tournoi sans nombre maximal de places est considéré comme illimité et reste affiché (avant, il était écarté). Question pour le responsable : ce choix convient-il ?
- Fichiers : `apps/site/app/tournois/page.tsx`, fiche `docs/features/tournois/README.md`.
- Test écrit, non lancé : `apps/site/tests/e2e/bugs/tournois-ligues.spec.ts`, test « 130 ».
- Reste : la liste affiche toujours « x / y places » avec `currentParticipants`, que les inscriptions du nouveau site ne mettent pas à jour (défaut signalé, hors de cette carte).
- À essayer à la main : `/tournois?minPlaces=5` avec un tournoi presque complet.
