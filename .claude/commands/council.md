---
description: Réunit le conseil des 5 agents sur une décision importante et propose un ADR
argument-hint: <sujet de la décision>
---

Conseil BBFrance sur : **$ARGUMENTS**

Le conseil est réservé aux décisions importantes ou difficiles à défaire : nouveau grand chantier (épic), connexion des membres, structure de la base de données, nouvelle bibliothèque majeure, découpage d'une application, organisation du projet. Pour le reste, le dire poliment et proposer `/card`.

1. Rassembler le contexte utile (fichiers concernés, ADR existants dans `docs/adr/`, carte liée) dans un résumé de 150 mots au plus.
2. Lancer **en même temps** (un seul message, 4 appels Agent) avec ce résumé :
   - `verificateur-faits` : ce qui est vrai aujourd'hui, preuves à l'appui ;
   - `avocat-du-diable` : ce qui peut casser ;
   - `visionnaire` : la décision dans 2 ans, l'automatisation possible ;
   - `voix-des-utilisateurs` : impact sur les coachs (dont le mobile) et sur les développeurs.

   Chacun répond en 200 mots au plus.
3. Transmettre le résumé et les 4 avis à l'agent `arbitre`, qui tranche.
4. Montrer au user, en français clair : chaque avis résumé en une ligne, puis la décision proposée par l'arbitre.
5. **Attendre la décision du user.** Ensuite seulement :
   - écrire `docs/adr/NNNN-<titre>.md` (numéro suivant, modèle `docs/adr/TEMPLATE.md`, statut `accepté`) ;
   - créer les cartes listées dans `kanban/a-faire/` (voir `/card`), avec `adr: NNNN` ;
   - lancer `pnpm kanban` pour vérifier.
