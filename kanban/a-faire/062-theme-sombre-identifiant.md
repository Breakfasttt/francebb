---
id: 062
title: Thème « Sombre » enregistré sous un identifiant inconnu
epic: E03
app: site
depends_on: []
adr:
verify: choisir « Sombre » à l'inscription ou dans le profil enregistre un identifiant de la liste des thèmes ; les membres déjà enregistrés avec l'ancien identifiant gardent le bon affichage
---

# 062 — Thème « Sombre » enregistré sous un identifiant inconnu

## Pourquoi

Repéré pendant la carte 058. À l'inscription et dans le profil, le thème « Sombre » enregistre l'identifiant `dark`, qui n'existe pas dans la liste des thèmes du site (le thème sombre s'appelle `default`). Le site retombe sur le thème par défaut, donc l'affichage est juste par chance, mais la donnée enregistrée est fausse.

## Action

- Faire enregistrer l'identifiant correct à l'inscription et dans le profil, en lisant la liste officielle des thèmes plutôt qu'une liste recopiée.
- Pour les membres déjà enregistrés avec `dark` : soit une migration de données qui remplace `dark` par `default` (avec le skill `database-ops`, sans rien supprimer), soit une correspondance à la lecture. Choisir et écrire la raison.
- Mettre à jour les fiches concernées.
