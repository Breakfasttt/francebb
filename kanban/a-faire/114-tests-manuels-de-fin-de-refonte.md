---
id: 114
title: "Liste des tests manuels de fin de refonte"
epic: E08
app: site
depends_on: [101, 102]
adr: 0006
verify: le fichier docs/refonte/tests-manuels.md existe, couvre chaque écran refait, et le responsable l'a déroulé sur son téléphone (Android et, si possible, iPhone) et sur ordinateur
---

# 114 — Liste des tests manuels de fin de refonte

## Pourquoi

Les tests automatiques vérifient que chaque fonctionnalité de l'inventaire existe toujours, mais certaines choses ne se vérifient qu'à la main, sur un vrai appareil : le comportement du clavier du téléphone, la zone protégée de l'iPhone, la fluidité, l'aspect des thèmes, le confort de lecture. Pendant la refonte, chaque carte a noté ce qui restait à essayer à la main. Il faut rassembler ces points dans une seule liste, pour que le responsable puisse tout vérifier en une fois, une fois la refonte terminée.

## Action

- Relire la section « Résultat » de chaque carte de l'épic E08 (`kanban/termine/` et `kanban/a-tester/`), ainsi que `docs/refonte/inventaire.md` (lignes non cochées ou marquées « à vérifier sur capture »).
- Écrire `docs/refonte/tests-manuels.md` : une liste cochable, rangée par écran, avec pour chaque ligne l'appareil (téléphone Android, iPhone, ordinateur), le compte à utiliser (visiteur, membre, modérateur, administrateur) et le résultat attendu. Inclure au minimum :
  - la barre basse, le panneau « Plus » et le changement de thème ;
  - le bandeau « Nouveau look » et le retour à l'ancien thème ;
  - la page d'un sujet : menu « ⋯ », fiche coach, outils du sujet, barre « Répondre » ;
  - l'éditeur : barre d'outils et barre d'envoi quand le clavier est ouvert, panneau « + », aperçu, assistant IA ;
  - chacun des 8 thèmes sur quelques écrans clés ;
  - chaque écran refait par les cartes 088 à 100.
- Ranger dans `kanban/a-tester/` les cartes de l'épic qui attendent cet essai, et les passer dans `termine/` une fois l'essai réussi.
- Les problèmes trouvés pendant l'essai deviennent des cartes séparées.
