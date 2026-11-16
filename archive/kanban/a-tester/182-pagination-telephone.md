---
id: 182
title: "Forum : pagination utilisable sur téléphone"
epic: E10
app: site
depends_on: []
verify: "dans un long sujet, sur téléphone, « Page 3 sur 15 » est touchable et ouvre un panneau avec la liste des pages, « Première page » et « Dernier message » ; on va de la page 15 à la page 1 en deux appuis"
---

# 182 — Forum : pagination utilisable sur téléphone

## Pourquoi

La barre de pages d'un sujet ne propose que « précédente », « suivante » et « dernière » : revenir de la page 15 à la page 1 demande 14 appuis (audit, section 3.4).

## Action

Rendre l'indication « Page X sur Y » touchable ; elle ouvre un panneau (composant `Sheet`) avec « Première page », « Dernier message » et la liste des pages (ou un champ de saisie au-delà d'une vingtaine de pages). Ajouter le bouton « début » à la barre. Même comportement sur ordinateur. Boutons d'au moins 44 pixels.

## Résultat

La pagination d'un sujet du forum propose maintenant quatre flèches : « Première page », « Page précédente », « Page suivante » et « Aller à la fin ». L'indication « Page 3 sur 15 » est devenue un bouton qui ouvre le panneau « Choisir une page » : il monte du bas de l'écran sur téléphone et s'affiche en fenêtre centrée sur ordinateur. Le panneau contient « Première page », « Dernier message » et la liste des pages en boutons de 44 pixels, la page actuelle étant mise en avant et signalée aux lecteurs d'écran. Au-delà de 30 pages, il ne liste que les pages proches de la page actuelle et ajoute un champ « Aller à la page ». On va ainsi de la page 15 à la page 1 en deux appuis.

Le panneau est un nouveau composant partagé, `PagePicker` (`packages/ui/src/page-picker.tsx`). `PageNav` gagne deux options facultatives, `showFirst` et `pagePicker`, utilisées seulement par la pagination d'un sujet (`TopicPageNav` dans `apps/site/app/forum/component/TopicTools.tsx`) : les autres listes du site ne changent pas. Dans la barre collée en bas de l'écran sur téléphone, le bouton « Page N sur M » peut passer sur deux lignes, pour que la barre tienne sur 360 pixels de large à côté de « Répondre », même avec des numéros de page à trois chiffres.

Vérifications : `pnpm check` passe. Un test a été ajouté à `tests/e2e/inventaire/forum-sujet.spec.ts`, en taille ordinateur et téléphone : il ouvre le panneau, vérifie les liens et la page actuelle, revient à la page 1 en deux appuis, et contrôle que la barre du bas d'un membre ne déborde pas à 360, 375 et 412 pixels de large. Le champ « Aller à la page » (sujets de plus de 30 pages) n'est pas couvert par un test, faute de sujet aussi long dans les données de test.
