---
id: 125
title: Export des données personnelles
epic: E09
app: site, hub
depends_on: [120, 121]
adr: 0007
verify: test e2e - le fichier exporté contient les données du hub et du site, et l'adresse d'export du site refuse une demande non signée
---

# 125 — Export des données personnelles

## Pourquoi

Le RGPD donne à chaque coach le droit de recevoir toutes ses données dans un format lisible.

## Action

- Hub : ajouter un bouton « Télécharger mes données » sur le passeport.
- Le hub appelle l'adresse d'export signée de chaque client. Il assemble ses propres données et les réponses des clients dans un seul fichier JSON.
- Site : créer une adresse d'export qui vérifie la signature et renvoie les données du membre (profil, messages, équipes, résultats…).
- Documenter le format dans `/api/doc`.
