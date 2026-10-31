---
id: 113
title: "Appui raté juste après une saisie"
epic: E01
app: site
depends_on: [102]
adr: 
verify: sur téléphone, sur le profil et dans la messagerie, saisir un texte puis appuyer directement sur le bouton d'envoi déclenche bien l'envoi du premier coup ; test e2e en projet telephone et essai sur un vrai téléphone
---

# 113 — Appui raté juste après une saisie

## Pourquoi

Bug trouvé pendant la refonte (carte 087). Sur téléphone, la barre de navigation du bas se cache pendant la saisie (attribut `data-typing` posé sur la page). Quand on appuie sur un bouton juste après avoir écrit, le champ perd le focus, la barre réapparaît et la page bouge entre le moment où le doigt se pose et celui où il se lève. L'appui tombe alors à côté du bouton visé. Les écrans de rédaction du forum ne sont plus touchés (la barre y est masquée en permanence), mais les autres pages qui ont des champs de saisie le sont toujours : profil, messagerie, ligues, etc.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Dans la coquille (`apps/site/common/components/AppShell/`), retarder le retour de la barre basse après la perte du focus (par exemple jusqu'à la fin de l'appui en cours, ou un court délai), ou faire réapparaître la barre sans décaler le contenu de la page.
- Vérifier sur les écrans qui gardent la barre basse et ont un bouton d'envoi : profil, messagerie, ligues, tournois.
- Ajouter un test e2e en projet telephone qui saisit un texte puis appuie aussitôt sur le bouton.
