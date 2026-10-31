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
