---
description: Transforme une demande en carte du kanban, à valider par le user
argument-hint: <demande>
---

Demande : **$ARGUMENTS**

1. Lire `kanban/README.md` (format d'une carte) et le skill `reuse-first` : quelque chose d'existant répond-il déjà au besoin ?
2. Repérer les fichiers concernés (`fichier:ligne`), la fiche de fonctionnalité liée (`docs/features/`) et l'épic de rattachement (`kanban/epics/`).
3. Proposer la carte au user : titre, épic, application, dépendances (`depends_on`), pourquoi, action, vérification (`verify` : commande ou constat visible qui prouve que c'est fini).
   - Si la carte touche l'interface, l'action et la vérification incluent le test en taille téléphone.
   - Si c'est une décision importante (connexion, base de données, bibliothèque, découpage d'application), proposer d'abord `/council`.
4. Après validation : écrire `kanban/a-faire/NNN-<titre-court>.md`. Le numéro est le plus grand numéro existant, tous dossiers confondus, + 1. Pas de champ `status`. Lancer ensuite `pnpm kanban` pour vérifier.

Ne pas coder pendant `/card`. Rédiger la carte en français clair, termes techniques expliqués.
