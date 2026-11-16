---
id: 183
title: "Forum : citer seulement un passage"
epic: E10
app: site
depends_on: [181]
verify: "sélectionner du texte dans un message fait apparaître un bouton « Citer » qui ne cite que ce passage ; « Citer » sans sélection retire les citations imbriquées du message cité ; la position de lecture est gardée et une notification « Citation ajoutée » propose d'aller à la réponse"
---

# 183 — Forum : citer seulement un passage

## Pourquoi

« Citer » prend tout le message, citations comprises, ce qui fait des pyramides de citations, et fait perdre la position de lecture (audit, section 3.4).

## Action

Bouton « Citer la sélection » qui apparaît sur une sélection de texte dans un message (téléphone et ordinateur) ; citation sans les citations imbriquées ; garder la position et afficher « Citation ajoutée · Voir ma réponse ».

## Résultat

« Citer » sous un message recopie désormais ce message sans les citations qu'il contenait déjà : les pyramides de citations disparaissent. La page « Répondre » ouverte avec `?quotePostId=` applique la même règle. La fonction qui retire les citations, imbriquées ou non, est dans `apps/site/lib/forumQuote.ts` (`stripNestedQuotes`), avec la fabrication de la balise de citation ; elle est vérifiée par `tests/unit/forumQuote.test.mjs`.

Pour citer un passage seulement, le coach le sélectionne dans un message. Un bouton « Citer la sélection » de 44 pixels apparaît alors juste au-dessus du passage sur ordinateur, et centré en bas de l'écran sur téléphone, au-dessus de la barre « Répondre », pour ne pas gêner le menu de sélection du téléphone. Le passage est repris en texte brut, tel qu'il est affiché. Le bouton n'apparaît pas pour une sélection à cheval sur deux messages, dans une signature, dans un message masqué ou supprimé, ni quand le coach ne peut pas répondre. Il est écrit dans `apps/site/app/forum/component/QuoteSelectionButton.tsx`, monté par la réponse rapide.

Dans les deux cas, la citation s'ajoute à la fin du texte déjà écrit, sans remplacer un brouillon. La page ne défile plus jusqu'à la réponse rapide : une notification « Citation ajoutée » propose « Voir ma réponse », qui y mène. Plusieurs citations de suite remplacent la notification au lieu de les empiler.

Vérifications : `pnpm check` sans erreur ; les tests d'inventaire de `forum-sujet.spec.ts` sur la citation (sans imbrication, avec un brouillon déjà tapé, position gardée, page Répondre, citation d'une sélection) passent en taille ordinateur et téléphone. Sur la version de développement, les boutons « Dev Theme » et « Dev Auth » recouvrent en partie le bouton sur téléphone ; ils n'existent pas sur le site en ligne.
