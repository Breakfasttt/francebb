---
name: ecriture-fr
description: Règles d'écriture du texte visible sur le site BBFrance (boutons, titres, états vides, messages d'erreur, aides) — voix de la communauté Blood Bowl, tutoiement, mots bannis, typographie française. À lire avant d'écrire ou de modifier un texte de l'interface.
---

# Écrire le texte du site

Le site parle comme un membre de la communauté qui aide un autre coach : direct, simple, sans jargon marketing.

## La voix

- **Tutoiement partout** (« Annonce ton tournoi », « Tu as tout lu »).
- **Phrases courtes**, une idée par phrase. Un état vide tient en une phrase, deux au plus.
- **Le bouton dit ce qu'il fait** : « Annoncer le tournoi », « Envoyer le message », « Enregistrer ». Jamais « Valider », « OK », « Soumettre ».
- **Un mot par action**, partout : Créer, Modifier, Supprimer, Répondre, Citer, Signaler, Enregistrer, Annuler.
- **Le vocabulaire de la communauté**, tel quel : coach, roster, ligue, commissaire, CDF, NAF, TV, sortie, touchdown, blitz. Un terme propre au projet va dans `docs/GLOSSAIRE.md`.

## Mots et tournures bannis

« Découvrez », « N'hésitez pas à », « Bienvenue sur la plateforme », « de référence », « crucial », « essentiel », « incontournable », « notamment » en tic, « Oups ! », « Une erreur est survenue » sans dire laquelle, « Aucun élément pour le moment », les points d'exclamation en série, les emoji dans un titre ou un bouton, les anglicismes évitables (« checker », « setup », « faire sens »).

## Messages d'erreur et états vides

- Dire **ce qui se passe** et **quoi faire** : « Ce pseudo est déjà pris. Essaie-en un autre. »
- État vide : ce qui manque et, s'il y en a une, l'action qui le change : « Pas de tournoi annoncé pour le moment. Tu en organises un ? Annonce-le ici. »
- Jamais d'excuse vague ni de ton enjoué forcé.

## Typographie française

- Espace insécable avant `: ; ! ?` et à l'intérieur des guillemets « ».
- Guillemets français « … », apostrophe typographique ’ dans les textes longs (l'apostrophe droite reste acceptée dans le code JSX).
- Dates : « 21/11/2026 à 14:32 » dans un message, « il y a 2 h » dans une liste. Nombres : `toLocaleString("fr-FR")` (espace des milliers).
- Pas de tiret cadratin en rafale : une virgule, deux-points ou une nouvelle phrase font mieux.

## Passe complète

Pour un texte long (page « Jouer », article d'aide, mentions), lancer le skill `humaniseur-fr` (appel manuel, il est long) après le premier jet.
