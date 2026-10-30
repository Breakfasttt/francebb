---
id: 065
title: Avatar par défaut introuvable
epic: E03
app: site
depends_on: []
adr:
verify: plus aucune réponse 404 pour un avatar par défaut dans les journaux des tests e2e ; un membre sans avatar affiche une image propre dans la messagerie et les tournois
---

# 065 — Avatar par défaut introuvable

## Pourquoi

Repéré pendant la carte 019. Huit composants (messagerie, inscription et résultats de tournoi) affichent `/default-avatar.png` ou `/images/default-avatar.png` quand un membre n'a pas d'avatar. Aucun de ces deux fichiers n'existe dans `public/` : le serveur répond « introuvable » (erreur 404) et le navigateur affiche une image cassée.

## Action

- Choisir un seul avatar par défaut : réutiliser celui que le reste du site affiche déjà pour un membre sans avatar s'il en existe un (chercher un composant d'avatar commun avant tout), sinon ajouter un fichier dans `public/images/`.
- Faire passer les huit composants par ce même avatar, idéalement par un composant ou une fonction commune plutôt que huit chemins recopiés.
- Vérifier l'affichage dans les 7 thèmes et sur téléphone.
