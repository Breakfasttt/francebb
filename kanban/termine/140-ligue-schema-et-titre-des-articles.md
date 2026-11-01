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

## Résultat

Fait, sans lancer les tests.

- Ligue : `apps/site/app/articles/edit/[id]/page.tsx` lit la ligue rattachée et la transmet au formulaire (`ligueId`, `ligueCustom` et la ligue elle-même) ; `apps/site/app/articles/component/ArticleForm.tsx` la donne à `LigueSearch` (`initialLigue`), qui l'affiche déjà choisie. Enregistrer sans y toucher garde donc la ligue. La page d'un article (`apps/site/app/articles/[id]/page.tsx`) affiche sous l'auteur « Ligue : » avec un lien vers la fiche de la ligue (cible de 44 pixels), ou le nom saisi librement.
- Schéma : la page d'un article affiche le texte avec `BBCodeContent` (`common/components/BBCodeContent`), qui lance le lecteur des schémas BBScheme, comme le forum. La largeur de lecture (70 caractères) est portée par un bloc autour, car `BBCodeContent` impose sa propre largeur maximale.
- Fenêtre de modération : `apps/site/app/forum/component/ModerationModal.tsx` (fichier du forum, changement minimal) reçoit une propriété facultative `contentType` (« message », « article » ou « ligue ») qui choisit les mots du titre et de l'explication ; sans elle, la fenêtre parle d'un message, comme avant. Appelants vérifiés : `app/articles/[id]/component/ArticleActions.tsx` passe `contentType="article"` ; `app/forum/component/PostMoreMenu.tsx` n'est pas modifié et garde « message ». Aucune page de ligue n'utilise cette fenêtre aujourd'hui.
- Test écrit : `apps/site/tests/e2e/bugs/articles-membres.spec.ts`, groupe « carte 140 » (ligue affichée et gardée après modification, lecteur BBScheme lancé, titre « Modérer l'article de … ») et contrôle en taille téléphone (lien de la ligue, pas de défilement horizontal).
- Fiche mise à jour : `docs/features/articles/README.md`.
- À essayer à la main : modifier un article rattaché à une ligue, insérer un schéma BBScheme dans un article, ouvrir « Modérer l'article » en modérateur.
