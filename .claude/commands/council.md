---
description: Réunit le conseil des 5 agents sur une décision irréversible et produit un ADR proposé
argument-hint: <sujet de la décision>
---

Conseil BBFrance sur : **$ARGUMENTS**

Réservé aux décisions irréversibles ou structurantes : épic, ADR, auth, schéma BDD, nouvelle dépendance majeure, découpage d'app. Pour le reste, refuser poliment et proposer `/card`.

1. Rassembler le contexte minimal (fichiers concernés, `docs/adr/` existants, carte liée) en un brief de ≤150 mots.
2. Lancer **en parallèle** (un seul message, 4 appels Agent) avec ce brief : `fact-checker`, `guardian`, `visionary`, `player-advocate`. Chacun répond en ≤200 mots.
3. Passer le brief + les 4 avis à l'agent `moderator`.
4. Montrer au user : les 4 avis résumés en une ligne chacun + la décision proposée du moderator.
5. **Attendre la validation du user.** Ensuite seulement :
   - écrire `docs/adr/NNNN-<slug>.md` (numéro suivant, format `docs/adr/TEMPLATE.md`, statut `accepté`) ;
   - créer les cartes listées (voir `/card`) avec `adr: NNNN` ;
   - `pnpm kanban` pour vérifier.
