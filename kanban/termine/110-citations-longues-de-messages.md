---
id: 110
title: "Citations de messages supprimés ou modérés"
epic: E01
app: site
depends_on: [102]
adr: 
verify: une citation faite avec le bouton « Citer » d'un message ensuite supprimé ou modéré affiche le même encart que la forme courte ; test e2e qui le vérifie
---

# 110 — Citations de messages supprimés ou modérés

## Pourquoi

Bug trouvé pendant la refonte (carte 086). Quand un message cité est supprimé ou modéré, la citation doit être remplacée par un encart qui le signale. La fonction `getQuoteStatusMap` ne reconnaît que la forme courte de la balise, `[quote=membre|message]`. Or le bouton « Citer » crée une balise en trois parties. Pour ces citations, le texte du message supprimé ou modéré reste donc affiché tel quel, ce qui contourne la modération.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Repérer `getQuoteStatusMap` et la fonction qui affiche les citations, puis leur faire reconnaître les deux formes de la balise (courte et en trois parties).
- Ajouter un test e2e : citer un message avec le bouton « Citer », modérer le message cité, vérifier que la citation est masquée ; idem après suppression.

## Résultat

La fonction d'affichage (`parseBBCode` dans `apps/site/lib/bbcode.ts`) reconnaissait déjà les deux formes de la balise. Seule `getQuoteStatusMap` (`apps/site/app/forum/actions.ts`) ignorait la forme en trois parties `[quote=membre|message|nom]` créée par « Citer » : son expression régulière exigeait un `]` juste après l'identifiant du message. Elle reconnaît maintenant les deux formes, avec la même règle que `parseBBCode`. Un commentaire l'explique, et un piège est ajouté à la fiche `docs/features/forum/README.md`.

Test écrit (non lancé) : `apps/site/tests/e2e/bugs/forum.spec.ts`, groupe « Carte 110 ». Le lecteur cite un message avec « Citer » et envoie sa réponse ; le message cité est ensuite modéré, puis supprimé, directement dans la base ; à chaque fois, un autre membre vérifie que la citation montre l'encart et plus le texte d'origine.

À essayer à la main : citer un message avec « Citer », le faire modérer, puis vérifier avec un compte de simple membre que la citation est masquée.
