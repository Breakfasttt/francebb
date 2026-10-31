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
