---
id: 140
title: "Articles : ligue effacée, schéma, fenêtre de modération"
epic: E01
app: site
depends_on: [102]
adr: 
verify: modifier un article garde sa ligue et la page de l'article l'affiche ; un schéma BBScheme dans un article est animé ; la fenêtre de modération d'un article parle d'« article » ; tests e2e
---

# 140 — Articles : ligue effacée, schéma, fenêtre de modération

## Pourquoi

Trois défauts trouvés pendant la refonte (carte 095) :

- Modifier un article efface la ligue qui lui est rattachée, et la page d'un article n'affiche jamais cette ligue.
- Un schéma BBScheme inséré dans un article n'est pas animé : la page utilise `parseBBCode` au lieu du composant `BBCodeContent`, qui lance le lecteur de schémas.
- La fenêtre de modération (`ModerationModal`) affiche « Modérer le message de … » même pour un article.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Transmettre la ligue rattachée au formulaire de modification (comme pour les tournois, carte 131) et l'afficher sur la page de l'article.
- Utiliser `BBCodeContent` sur la page d'un article.
- Ajouter à `ModerationModal` un libellé du type de contenu (message, article, ligue).
- Ajouter les tests e2e.
