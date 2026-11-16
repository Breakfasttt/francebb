---
id: 215
title: "Nouveaux noms des thèmes existants"
epic: E11
app: site
depends_on: [211, 213]
adr: 0009
verify: "le sélecteur affiche « Élus du Chaos (ancien Vestiaire) », « Saison 3 (officiel) », « Khorne », « Skavens » et « Rois des tombes » ; aucun identifiant ni aucune donnée de membre n'a changé ; le cookie et le profil fonctionnent encore"
---

# 215 — Nouveaux noms des thèmes existants

## Pourquoi

Quatre thèmes existants deviennent des thèmes d'équipe et Saison 3 devient le thème officiel (ADR-0009), sans changer leur identifiant.

## Action

Changer les noms affichés et les groupes dans le fichier de données, sans toucher aux identifiants ni à la base.

## Résultat

Fait : noms changés dans le seul fichier de données (« Élus du Chaos (ancien Vestiaire) », « Saison 3 (officiel) », « Khorne », « Skavens », « Rois des tombes ») ; aucun identifiant, aucune donnée de membre ni migration modifiés.

## Remplacée en partie

Le 16 novembre 2026, la carte 218 renomme encore : `vestiaire` s'appelle « Sombre », `nehekhara` retrouve « Néhékhara », Khorne et Skavens sont retirés.
