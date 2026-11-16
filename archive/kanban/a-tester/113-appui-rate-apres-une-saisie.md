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

## Résultat

Correction faite dans la coquille (`apps/site/common/components/AppShell/AppShell.tsx`, fonction `useTypingFlag`) : quand un champ perd le focus, l'attribut `data-typing` n'est plus retiré tout de suite mais après 350 millisecondes, et seulement si le focus n'est pas passé dans un autre champ entre-temps (la barre ne clignote plus en passant d'un champ à l'autre).

Raisonnement : un appui sur un bouton se déroule en plusieurs étapes (« doigt posé », « doigt levé », puis clic), et le navigateur cherche l'élément sous le doigt à chaque étape. Le champ perd le focus dès « doigt posé » ; la barre basse revenait alors aussitôt, ce qui change la variable `--app-bottom-nav-space`, donc la place de tout ce qui est collé en bas de l'écran et la place réservée en bas de la page. Le clic pouvait alors tomber sur un autre élément. Avec le délai, l'appui entier se termine avant le retour de la barre. Les tests d'inventaire contournaient ce défaut en quittant le champ avant d'appuyer (fonctions `leaveField` et `stopTyping`) ; ils restent valables, puisqu'ils attendent le retrait de l'attribut. Le skill `mobile-ux` décrit ce délai.

Ce qui n'est pas démontrable sans appareil réel : la fermeture du clavier, qui agrandit la zone visible au même moment. Elle est gérée par le système, pas par le site ; le délai évite seulement que le site ajoute son propre déplacement pendant l'appui.

Test écrit (non lancé) : `apps/site/tests/e2e/bugs/forum.spec.ts`, groupe « Carte 113 ». Le groupe force la taille téléphone (Pixel 7), car la configuration ne rejoue en projet « telephone » que les tests d'inventaire et le test smoke. Il saisit l'équipe dans le profil puis appuie aussitôt sur « Sauvegarder le profil » (vérifié en base), et fait de même avec la réponse rapide d'un sujet. La messagerie n'est pas testée : la conversation s'affiche en plein écran, sans barre basse, et n'est donc pas concernée.

À essayer à la main sur un vrai téléphone : sur le profil (onglet « Modifier »), dans le formulaire d'une ligue et dans la réponse rapide d'un sujet, écrire un texte puis appuyer directement sur le bouton d'envoi, sans fermer le clavier avant ; l'envoi doit partir du premier coup. Si l'appui rate encore, essayer une valeur plus grande de `TYPING_RELEASE_DELAY_MS` (par exemple 500).
