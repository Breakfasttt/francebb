---
id: 112
title: "Pouvoir taper « @ » dans un message"
epic: E01
app: site
depends_on: [102]
adr: 
verify: taper « jean@exemple.fr » dans l'éditeur écrit le texte tel quel ; taper « @ » en début de mot propose toujours la mention d'un membre ; test e2e qui vérifie les deux
---

# 112 — Pouvoir taper « @ » dans un message

## Pourquoi

Bug trouvé pendant la refonte (carte 087). Dans l'éditeur de message, la touche « @ » ouvre toujours la recherche d'un membre (pour le mentionner) et le caractère n'est pas écrit. Il est donc impossible de taper une adresse électronique ou tout autre texte contenant « @ ». La refonte a gardé ce comportement d'origine pour ne rien changer aux fonctionnalités.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Dans `apps/site/common/components/BBCodeEditor/BBCodeEditor.tsx`, écrire le caractère « @ » normalement, et n'ouvrir la recherche de membre que si « @ » est tapé en début de mot (après un espace, un retour à la ligne ou au tout début du texte). Échap ferme la recherche et garde le « @ ».
- Mettre à jour la ligne de l'inventaire sur la mention (`docs/refonte/inventaire.md`, section 2) et le test `apps/site/tests/e2e/inventaire/forum-editeur.spec.ts`.
