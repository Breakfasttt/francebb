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

## Résultat

Dans `apps/site/common/components/BBCodeEditor/BBCodeEditor.tsx`, la touche « @ » n'est plus interceptée. La détection se fait maintenant sur le texte saisi (nouvelle fonction `handleTextareaChange`) : quand un seul caractère vient d'être ajouté, que c'est un « @ » et qu'il est au début du texte ou après une espace ou un retour à la ligne, la recherche d'un membre s'ouvre en plus. Le « @ » reste écrit ; Échap ferme la recherche et le garde ; choisir un membre le remplace par la balise de mention (comportement déjà présent dans `submitMention`). Cette détection sur le texte marche aussi avec les claviers Android, qui n'indiquent souvent pas la touche appuyée. L'inventaire (section 2) et la fiche `docs/features/forum/README.md` sont mis à jour.

Test écrit (non lancé) : `apps/site/tests/e2e/bugs/forum.spec.ts`, groupe « Carte 112 ». Il tape « jean@exemple.fr » (texte écrit tel quel, pas de recherche), puis « @ » après une espace (recherche ouverte, « @ » écrit), puis Échap (recherche fermée, « @ » gardé).

Le test `apps/site/tests/e2e/inventaire/forum-editeur.spec.ts` n'a pas été modifié (la mission limitait les tests à un seul fichier) : son cas « mention en tapant @ » tape « @ » après « Bonjour », suivi d'une espace, ce qui ouvre toujours la recherche ; il doit donc continuer de passer.

À essayer à la main, sur un vrai téléphone Android et sur un iPhone : taper une adresse électronique dans un message, puis « @ » en début de mot.
