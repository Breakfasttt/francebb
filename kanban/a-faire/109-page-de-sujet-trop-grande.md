---
id: 109
title: "Page de sujet trop grande : aucun message"
epic: E01
app: site
depends_on: [102]
adr: 
verify: l'adresse /forum/topic/<id>?page=99 d'un sujet de 2 pages affiche les messages de la page 2 ; test e2e qui le vérifie
---

# 109 — Page de sujet trop grande : aucun message

## Pourquoi

Bug trouvé pendant la refonte (carte 086). Quand on ouvre un sujet avec un numéro de page plus grand que le nombre de pages (par exemple `?page=99`), la pagination affiche bien la dernière page, mais la liste des messages est vide. La requête qui lit les messages en base utilise le numéro demandé, pas le numéro ramené à la dernière page. Un lien ancien ou mal recopié mène donc à une page vide.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Dans `apps/site/app/forum/topic/[id]/page.tsx`, calculer le numéro de page ramené entre 1 et la dernière page **avant** la requête des messages, et l'utiliser partout (requête, pagination, ancres).
- Ajouter un test e2e qui ouvre `?page=99` et vérifie que les messages de la dernière page s'affichent.
- Cocher la ligne « page trop grande ramenée à la dernière » dans la section 3.3 de `docs/refonte/inventaire.md`.
