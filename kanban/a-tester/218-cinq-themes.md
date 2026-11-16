---
id: 218
title: "Réduction à cinq thèmes"
epic: E11
app: site
depends_on: [211, 213]
adr: 0009
verify: "le site propose 5 thèmes : Sombre (identifiant vestiaire, thème par défaut), Saison 3, NAF, Néhékhara (couleurs d'avant l'ADR-0009) et Violet (identifiant elfes-noirs) ; un membre qui avait un thème retiré voit le thème par défaut sans erreur ; contraste AA des 5 thèmes ; captures sur 4 thèmes ; corepack pnpm check passe"
---

# 218 — Réduction à cinq thèmes

## Pourquoi

Après essai, le responsable du projet trouve les 35 thèmes de l'ADR-0009 trop nombreux (16 novembre 2026). Il garde Saison 3, NAF, Élus du Chaos (ancien Vestiaire) renommé « Sombre », Elfes noirs renommé « Violet », et Néhékhara tel qu'il était avant.

## Action

1. Ne garder que ces 5 thèmes dans `packages/ui/src/themes/themeData.mjs` ; le script `themes:build` supprime les fichiers de couleurs des thèmes retirés.
2. Le sélecteur redevient une liste simple, sans rubriques.
3. Tests : comptes de test et captures sur les thèmes gardés.
4. Documentation : ADR-0009 (révision), PRODUCT.md, DESIGN.md, skill `theming-rules`, fiche, mentions légales.

Les membres qui avaient choisi un thème retiré (Sombre d'avant, Clair, Blood, Malpierre ou un thème d'équipe) voient le thème par défaut : leur choix enregistré n'est pas effacé de la base, le site retombe simplement sur le thème par défaut quand l'identifiant est inconnu.

## Résultat

Fait : `themeData.mjs` ne garde que 5 thèmes (Sombre = `vestiaire`, Saison 3, NAF, Néhékhara avec ses couleurs d'origine, Violet = `elfes-noirs`) ; le script `themes:build` supprime désormais le fichier de couleurs d'un thème retiré (30 fichiers supprimés) et ne gère plus de rubriques. Le sélecteur est une liste simple. Tests : comptes de test et captures sur les thèmes gardés (captures de référence de NAF et Néhékhara récupérées du dernier commit, celles de l'ancien Sombre et de Clair retirées) ; `divers.spec.ts` et `smoke.spec.ts` adaptés. Contraste AA des 5 thèmes vérifié par script. Documentation mise à jour (ADR-0009 révisé, PRODUCT.md, DESIGN.md, skill, fiche, mentions légales). À essayer à la main : choisir chaque thème ; un compte qui avait l'ancien Clair ou Blood doit arriver sur Sombre.
