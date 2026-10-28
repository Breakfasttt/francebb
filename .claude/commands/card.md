---
description: Transforme une demande en carte kanban (frontmatter) à valider
argument-hint: <demande>
---

Demande : **$ARGUMENTS**

1. Lire `kanban/README.md` (format) et le skill `reuse-first` (existe-t-il déjà quelque chose ?).
2. Repérer les fichiers concernés (`fichier:ligne`) et l'épic de rattachement (`kanban/epics/`).
3. Proposer au user la carte : titre, epic, app, `depends_on`, problème, action, critère `verify` (commande ou vérification observable).
   Décision irréversible (auth, schéma, dépendance, découpage) ? Proposer `/council` d'abord.
4. Sur validation : écrire `kanban/NNN-<slug>.md` (numéro = max existant + 1, `status: ready` ou `refine`), puis `npm run board`.

Ne pas coder pendant `/card`.
