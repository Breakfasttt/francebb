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
