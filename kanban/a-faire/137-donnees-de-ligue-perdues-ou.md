---
id: 137
title: "Ligue : lien Google Maps effacé, département"
epic: E01
app: site
depends_on: [102]
adr: 
verify: modifier une ligue qui a un lien Google Maps le garde ; le département d'une ligue est enregistré au même format que celui d'un tournoi ; tests e2e qui le vérifient
---

# 137 — Ligue : lien Google Maps effacé, département

## Pourquoi

Deux défauts trouvés pendant la refonte (carte 094) :

- L'action `updateLigue` efface le champ `gmapsUrl` (lien Google Maps) à chaque modification d'une ligue, car le formulaire n'a jamais eu ce champ : la valeur vide écrase l'ancienne.
- Le département d'une ligue est enregistré par son libellé (« 35 - Ille-et-Vilaine »), alors que les tournois enregistrent le numéro (« 35 »). Les deux ne peuvent donc pas être comparés ou filtrés ensemble.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Ne mettre à jour `gmapsUrl` que s'il est envoyé par le formulaire (ou ajouter le champ au formulaire si le responsable le souhaite).
- Choisir un seul format pour le département (le numéro), l'appliquer au formulaire de ligue, et prévoir la reprise des ligues existantes. Toute modification des données existantes demande l'accord du responsable (skill `database-ops`).
- Ajouter les tests e2e.
