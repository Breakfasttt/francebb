---
id: 184
title: "Forum : ajouter des photos depuis le téléphone"
epic: E10
app: site
depends_on: [181]
verify: "sur téléphone, l'outil Image propose d'abord un gros bouton « Choisir des photos » sans ouvrir le clavier ; on peut choisir plusieurs photos d'un coup (elles deviennent une galerie) ; la progression de l'envoi est visible"
---

# 184 — Forum : ajouter des photos depuis le téléphone

## Pourquoi

Ajouter une photo prise avec le téléphone demande 5 à 6 gestes : l'outil Image ouvre le clavier sur le champ d'adresse, qui recouvre le bouton d'envoi. Une seule photo à la fois (audit, section 3.4).

## Action

Sur téléphone, bouton « Choisir des photos » en premier et sans mise au point automatique sur l'adresse ; choix multiple, transformé en `[gallery]` ; progression affichée ; réduction de la taille des photos avant l'envoi si c'est simple, sans nouvelle bibliothèque.

## Résultat

L'outil Image de l'éditeur commence maintenant par un gros bouton « Choisir des photos » (56 pixels de haut), suivi de « ou une image déjà en ligne », du champ d'adresse, des options et de « Insérer l'image ». La même disposition sert sur ordinateur et sur téléphone ; sur téléphone, le champ d'adresse ne reçoit plus le focus à l'ouverture, donc le clavier ne s'ouvre plus et ne recouvre plus le bouton. Le sélecteur de fichiers accepte plusieurs photos : elles partent une par une, le bouton affiche la progression (« Envoi 2 sur 4… », annoncée aussi aux lecteurs d'écran), puis elles sont insérées en `[gallery]` ; une seule photo donne une balise `[img]` comme avant. Si certaines photos échouent, une notification dit combien et pourquoi (« 1 photo sur 4 n'a pas pu être envoyée : … »), et celles qui sont parties sont insérées.

La réduction avant l'envoi a été faite sans bibliothèque, avec le `canvas` du navigateur (`common/utils/photoUpload.ts`) : une photo de plus de 2000 pixels de côté, plus lourde que 4 Mo ou dans un format que l'hébergeur refuse est ramenée à 2000 pixels au plus et réenregistrée en JPEG de qualité 0,85. Les GIF ne sont jamais réduits, ni les PNG sous la limite, pour ne pas perdre l'animation ou la transparence. Si le navigateur ne sait pas lire la photo, elle part telle quelle. Les règles pures sont vérifiées par `tests/unit/photoUpload.test.mjs` ; la réduction elle-même n'a pas de test automatique, car elle demande un vrai navigateur et une vraie photo. L'insertion lit maintenant le texte dans la zone de saisie elle-même, pour ne pas perdre ce que le membre a tapé pendant l'envoi. Le test d'inventaire `forum-editeur.spec.ts` est adapté (nouveau nom du bouton, envoi de deux photos en galerie) ; il n'a pas été lancé dans cette session, et l'essai sur un vrai téléphone reste à faire.
