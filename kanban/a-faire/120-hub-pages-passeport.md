---
id: 120
title: Pages du passeport (socle)
epic: E09
app: hub
depends_on: [119]
adr: 0007
verify: test e2e à 375 px de large - aucun défilement horizontal, boutons d'au moins 44 px, retour refusé vers une adresse non enregistrée ; une recherche ne trouve aucun import depuis apps/site dans apps/hub
---

# 120 — Pages du passeport (socle)

## Pourquoi

Le coach doit pouvoir gérer son passeport à un endroit unique, même si une application ne propose pas sa propre interface. Il peut y modifier son profil, voir les comptes et les applications liés, et voir ses sessions. En dehors de la connexion, ce sont les seules pages du hub.

## Action

- Copier dans `apps/hub` les couleurs du thème par défaut (`packages/ui/src/themes/default.css`) et la police Inter (`apps/site/app/fonts/`), avec un commentaire qui indique leur origine. Ni choix de thème, ni lecture du thème du coach, ni import depuis `apps/site`.
- Utiliser les composants de `packages/ui`.
- Pages en une colonne, adaptées au téléphone :
  - profil ;
  - comptes liés, avec la possibilité de retirer l'accès accordé à une application (get-consents et delete-consent) ;
  - sessions actives ;
  - double authentification.
- Pas de lien codé en dur vers une application. Un bouton de retour n'apparaît que si le client appelant a fourni une adresse de retour enregistrée pour lui.
