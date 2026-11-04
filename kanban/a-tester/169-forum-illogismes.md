---
id: 169
title: "Forum : corriger les illogismes"
epic: E10
app: site
depends_on: [166]
verify: "chercher un mot du titre renvoie le sujet une seule fois ; « Marquer comme non lu » reste sur le sujet ; un sujet archivé refuse les réponses ; un modérateur peut scinder et fusionner des sujets ; les autres points de la section 3.2 de l'audit sont réglés"
---

# 169 — Forum : corriger les illogismes

## Pourquoi

Section 3.2 de l'audit, et petits bugs de la section 3.1. Décision du responsable : tout corriger.

## Action

1. Recherche : une correspondance sur le titre renvoie le sujet une seule fois (onglets « Sujets » et « Messages »).
2. « Marquer comme non lu » reste sur le sujet et affiche une notification.
3. Un sujet archivé est traité comme verrouillé : réponses et réactions refusées.
4. Modération : scinder un sujet (déplacer des messages choisis vers un nouveau sujet) et fusionner deux sujets.
5. Limites : message et titre vides refusés, titre de 3 caractères au moins, message de 30 000 caractères au plus ; renommer un sujet verrouillé est réservé aux modérateurs.
6. Supprimer un forum se fait dans une transaction, et c'est refusé si le forum contient des tournois.
7. Les citations pointent vers un lien permanent `/forum/post/[id]`, qui renvoie à la bonne page ; une citation dont l'auteur ne correspond pas au message cité n'affiche pas « Par @… ».
8. Réactions : emoji vérifié par le serveur, pas de doublon en cas de double appui. `/forum/unread?page=abc` affiche la page 1.

## Résultat

Tous les points de l'action sont faits, sans changer la structure de la base (aucune migration).

1. **Recherche** : un mot trouvé dans le titre d'un sujet ne ramène plus que le premier message de ce sujet ; les messages qui contiennent eux-mêmes le mot restent tous trouvés. La recherche n'a pas d'onglets « Sujets » et « Messages » : le doublon venait du titre, et le corriger à la source suffisait sans refaire l'écran.
2. **« Marquer comme non lu à partir d'ici »** laisse le coach sur le sujet et affiche « Sujet marqué comme non lu à partir de ce message. ».
3. **Sujet archivé** : il est fermé comme un sujet verrouillé (réponse, réaction, modification et suppression d'un message, page Répondre), sauf pour un modérateur. La page affiche l'encart « Sujet archivé » et les réactions y sont seulement affichées.
4. **Scinder et fusionner** (modérateurs, interdit pour un sujet de tournoi) : boutons dans les outils du sujet. Scinder fait apparaître une case « Déplacer » sur chaque message sauf le premier ; le compte et « Scinder… » sont dans une barre collée en bas sur téléphone et dans la colonne des outils sur ordinateur. Fusionner cherche le sujet d'arrivée par titre ou identifiant, puis supprime en douce le sujet vidé avec une raison automatique. Tout se fait dans une transaction : dernier message des deux sujets recalculé, positions de lecture et abonnements recopiés, notifications déplacées avec leur message, journal de modération sur les deux sujets. Un sujet fusionné ne peut plus être restauré, puisqu'il n'a plus de messages.
5. **Limites** : titre de 3 à 150 caractères, message non vide et de 30 000 caractères au plus, à la création d'un sujet, d'une réponse, d'un tournoi et à la modification. Renommer vérifie maintenant l'accès au forum, et un sujet verrouillé ou archivé ne se renomme plus que par un modérateur.
6. **Supprimer un forum** : j'ai choisi le refus plutôt que la suppression douce des sujets, parce que c'est le plus simple et le plus sûr. Un forum ne peut pas disparaître de la base tant que des sujets, même supprimés, y sont rangés ; les effacer reviendrait à effacer des messages de membres. Le forum (et ses sous-forums, à tous les niveaux) n'est donc supprimé que s'il est vide, dans une transaction ; sinon un message dit combien de sujets restent et quoi faire. C'est la même règle que dans l'administration. Les tournois sont toujours attachés à un sujet : ils ne peuvent donc plus devenir orphelins.
7. **Citations** : nouvelle adresse `/forum/post/[id]`, qui renvoie à la bonne page du sujet (droits d'accès et sujets supprimés respectés) ; « Voir le message » des citations et « Voir l'élément » du journal de modération l'utilisent. `getQuoteStatusMap` renvoie l'auteur réel de chaque message cité, et `parseBBCode` n'affiche « Par @… » que si la balise désigne bien cet auteur, avec son vrai pseudo.
8. **Réactions et pages** : le serveur n'accepte que les dix émojis proposés ; un verrou de la base par membre et par message fait passer les appels l'un après l'autre, donc un double appui ne crée plus de doublon. `?page=abc` donne la page 1 sur les non-lus, la liste d'un forum et la recherche.

En plus : le compteur de vues compte une vue par membre à sa première ouverture, puis à chaque nouvelle visite (plus de 30 minutes après la précédente) où il lit un nouveau message ; un visiteur compte une vue par onglet. Le calcul de la page d'un message n'est plus écrit qu'une fois (`lib/forumPostLink.ts`), utilisé par la page du sujet, la recherche, la modification d'un message et l'écran de modération.

**Vérifications** : `pnpm check` (types, tests unitaires, ESLint) passe ; nouveaux tests unitaires `forumWriteRules.test.mjs`, et ajouts dans `bbcode.test.mjs` (citations) et `forumReadPosition.test.mjs` (vues). Tests e2e lancés un à un, en taille ordinateur et téléphone : le nouveau test « scinder puis fusionner » et les tests modifiés de `forum-sujet.spec.ts` (non-lu, citation, outils du modérateur, titre), la suppression d'un forum de `forum-listes.spec.ts` et toute la recherche de `forum-recherche.spec.ts` passent. Le parcours de fin de carte passe sans erreur.

**Reste** : le test « la fenêtre de signalement s'ouvre depuis le panneau « Plus » » de `forum-recherche.spec.ts` échoue en taille téléphone. Il cherche « Signaler » dans le panneau « Plus », alors que les outils du sujet sont dans le panneau « Outils du sujet » depuis la carte 156 : l'échec ne vient pas de cette carte, le test est à adapter dans une carte à part.
