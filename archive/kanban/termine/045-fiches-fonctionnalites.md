---
id: 045
title: Une fiche par fonctionnalité dans docs/features
epic: E02
app: site
depends_on: [044]
adr: 0004
verify: chaque fonctionnalité a sa fiche ; chaque fichier cité existe
---

# 045 — Une fiche par fonctionnalité dans docs/features

## Pourquoi

Seules 3 fonctionnalités (auth, forum, hub) ont une fiche.

## Action

Une fiche `docs/features/<nom>/README.md` pour chaque fonctionnalité (forum, tournois, messagerie, profil, classement, carte, articles, ressources, ligues, BBScheme, quiz, administration, modération, auth, hub…), sur le modèle : À quoi ça sert / Ce que voit le coach (y compris sur téléphone) / Les fichiers / Les pièges / Les mots expliqués. Mettre à jour `docs/features/TEMPLATE.md` et réécrire les 3 fiches existantes.

## Résultat

15 fiches dans `docs/features/` : administration, articles, auth, bbquizz, bbscheme, classement-statistiques, forum, hub, ligues-carte, messagerie, moderation, pages-diverses (accueil, jouer, spy, mentions légales, bannis, thèmes), profil-membres, ressources-media, tournois. Toutes suivent le nouveau modèle (`docs/features/TEMPLATE.md`), décrivent l'usage sur téléphone, et chaque chemin cité a été vérifié. La rédaction a fait ressortir des failles, des bugs et des problèmes mobiles, reportés dans les cartes 049 (mobile), 050 (sécurité), 051 (bugs) et 052 (dette).
