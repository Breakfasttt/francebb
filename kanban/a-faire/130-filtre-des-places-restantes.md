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
