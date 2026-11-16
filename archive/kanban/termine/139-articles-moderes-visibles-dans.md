---
id: 139
title: "Articles modérés visibles dans la liste"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un article modéré n'apparaît plus dans /articles pour un visiteur ni pour un membre ; un modérateur le voit avec un badge « Modéré » ; test e2e qui le vérifie
---

# 139 — Articles modérés visibles dans la liste

## Pourquoi

Bug trouvé pendant la refonte (carte 095). La liste `/articles` affiche les articles modérés à tout le monde, avec leur titre et le début de leur texte. La modération, qui doit cacher un contenu, est donc contournée depuis la liste.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Exclure les articles modérés de la requête de `/articles` pour les visiteurs et les membres ; les montrer aux modérateurs avec un badge.
- Vérifier aussi les autres endroits qui listent des articles (profil d'un membre, accueil, recherche).
- Ajouter le test e2e (dans `apps/site/tests/e2e/security.spec.ts` ou `inventaire/articles.spec.ts`).

## Résultat

Fait, sans lancer les tests.

- `apps/site/app/articles/page.tsx` : la requête (liste et nombre d'articles) exclut les articles modérés, sauf pour un modérateur, qui les voit avec la mention « Modéré » déjà affichée par `ArticleCard`.
- Autres endroits vérifiés : l'onglet « Articles » d'un profil passe par `/api/articles`, qui cachait déjà les articles modérés sauf à leur auteur et aux modérateurs (carte 050). L'article tiré au hasard de l'accueil (`apps/site/app/page.tsx`) pouvait être un article modéré : il est désormais tiré parmi les articles non modérés, pour tout le monde. Il n'existe pas de recherche générale qui liste des articles.
- Choix : l'auteur d'un article modéré ne le voit plus dans `/articles` (la carte vise les visiteurs et les membres) ; il le retrouve dans l'onglet « Articles » de son profil.
- Test écrit : `apps/site/tests/e2e/bugs/articles-membres.spec.ts`, groupe « carte 139 » (visiteur, membre, modérateur).
- Fiches mises à jour : `docs/features/articles/README.md`, `docs/features/pages-diverses/README.md`.
- À essayer à la main : modérer un article, puis ouvrir `/articles` en visiteur, en membre et en modérateur.
