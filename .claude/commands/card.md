---
description: Crée la carte d'un gros chantier dans le kanban, à valider par le user
argument-hint: <demande>
---

Demande : **$ARGUMENTS**

1. Vérifier que c'est un gros chantier (plusieurs séances, connexion, sécurité, base de données, nouvelle application). Sinon, le dire : une petite ou moyenne modification n'a pas de carte.
2. Repérer les fichiers concernés et ce qui existe déjà (skill `reuse-first`).
3. Proposer au user : titre, pourquoi, à faire (étapes, fichiers). Si la décision est difficile à défaire, proposer 2-3 options.
4. Après validation : écrire `kanban/a-faire/NNN-<titre-court>.md` au format de `kanban/README.md` (`pnpm kanban` donne le prochain numéro libre).

Ne pas coder pendant `/card`.
