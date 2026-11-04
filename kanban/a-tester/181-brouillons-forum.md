---
id: 181
title: "Forum : brouillons sauvegardés"
epic: E10
app: site
depends_on: []
verify: "un texte tapé dans la réponse rapide, l'écran Répondre, la modification d'un message ou la création d'un sujet est retrouvé après un rechargement de la page, avec un bandeau « Brouillon restauré · Effacer » ; « Annuler » demande confirmation si le texte n'est pas vide ; le brouillon disparaît une fois le message publié"
---

# 181 — Forum : brouillons sauvegardés

## Pourquoi

Sur téléphone, un geste de retour par erreur, un appel ou un onglet rechargé fait perdre un long message (audit, section 3.4).

## Action

Enregistrer le texte en cours dans le navigateur (`localStorage`) toutes les quelques secondes, un brouillon par sujet et par écran ; le restaurer avec un bandeau ; l'effacer après publication ou sur « Effacer » ; confirmation avant « Annuler » si le texte n'est pas vide. Un seul crochet (`hook`) réutilisable pour tous les formulaires.

## Résultat

Le crochet réutilisable `useDraft` (`apps/site/common/hooks/useDraft.ts`) garde le texte en cours dans le `localStorage` du navigateur, une seconde après la dernière frappe et tout de suite quand la page passe en arrière-plan (appel, changement d'application). Il y a un brouillon par membre, par écran et par sujet, message ou forum. À l'ouverture de l'écran, un brouillon de moins de 7 jours, non vide et différent du texte de départ est remis dans l'éditeur, avec un bandeau discret « Brouillon restauré · Effacer » (`DraftBanner`). Les brouillons expirés sont effacés à chaque ouverture d'un écran de rédaction. Toutes les lectures et écritures du stockage sont protégées : en navigation privée, le brouillon n'est simplement pas gardé. Les règles pures (nom de la case, expiration, texte à restaurer) sont dans `common/utils/draftRules.ts` et vérifiées par `tests/unit/draftRules.test.mjs`.

Le crochet est branché sur la réponse rapide, l'écran « Répondre » (un brouillon par citation), la modification d'un message (un brouillon identique au message d'origine n'est pas restauré) et la création d'un sujet. Pour ce dernier écran, le formulaire est sorti de la page dans `app/forum/component/NewTopicForm.tsx`, copié à l'identique. Le brouillon est effacé après une publication réussie. « Annuler » passe par `CancelComposeButton`, qui demande confirmation avec `ConfirmDialog` quand le texte a changé ; sur les trois écrans plein écran, le navigateur demande aussi confirmation avant de quitter la page (événement `beforeunload`). Le test d'inventaire `forum-editeur.spec.ts` vérifie le brouillon retrouvé après un rechargement, la confirmation de « Annuler » et « Effacer » ; il n'a pas été lancé dans cette session.

Lancement du test d'inventaire `forum-editeur.spec.ts` (ordinateur et téléphone) : les échecs venaient non des brouillons mais de la connexion de test. La petite base locale des tests (`prisma dev`) rate parfois la première requête qui suit un test terminé par une publication (erreur « bind message supplies 3 parameters… » dans le journal du site) ; le fournisseur de connexion de développement refusait alors la connexion et le test suivant se retrouvait visiteur (zone de texte introuvable, renvoi vers la page de connexion). La fonction d'aide `loginAs` (`tests/e2e/fixtures.ts`) vérifie maintenant que la connexion a réussi et la retente chaque seconde, cinq fois au plus. Le site n'a pas été modifié : la demande de confirmation avant de quitter la page ne se déclenche que si le texte diffère du texte de départ, et jamais après une publication ou « Effacer », qui remettent le texte de départ. Le test du brouillon accepte malgré tout explicitement la fenêtre « Quitter la page ? » avant son rechargement voulu. Le fichier entier est passé deux fois de suite (32 tests sur 32).

Ce qui n'a pas été fait : le titre d'un nouveau sujet n'est pas gardé en brouillon, seulement le message. Le bouton retour en haut des écrans de rédaction ne demande pas de confirmation, mais le brouillon est enregistré en quittant l'écran. Les autres éditeurs du site (articles, messagerie, ligues, profil) ne sont pas branchés : le crochet est prêt pour eux.
