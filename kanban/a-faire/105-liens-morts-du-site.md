---
id: 105
title: "Liens morts du site"
epic: E01
app: site
depends_on: []
adr: 
verify: aucun des liens listés ne mène à une erreur 404 ni au mauvais profil ; /media est accessible depuis le site
---

# 105 — Liens morts du site

## Pourquoi

Plusieurs liens mènent à une page qui n'existe pas ou à la mauvaise page.

## Action

- Messagerie : `/profile/${id}` devient `/spy/${id}` (`ConversationView.tsx:117`).
- Page d'un article : le lien de l'auteur mène à `/spy/[id]` (`articles/[id]/page.tsx:84`).
- `/tournois` lit le paramètre `?ligueId=` envoyé par la fiche d'une ligue.
- Ajouter un lien d'entrée vers `/media`, à décider avec le user (pied de page ou panneau « Plus »).
