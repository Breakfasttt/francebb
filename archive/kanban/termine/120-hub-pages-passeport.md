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
  - sessions actives.
- Pas de lien codé en dur vers une application. Un bouton de retour n'apparaît que si le client appelant a fourni une adresse de retour enregistrée pour lui.

## Résultat

- **L'accueil du hub (`/`) est le passeport.** Sans session, il affiche le formulaire de connexion, qui ramène ici. Avec session, il présente en une colonne :
  - le profil (`PATCH /api/v1/profile`, mêmes vérifications que pour les applications) ;
  - les moyens de connexion ;
  - les applications liées, avec le retrait de l'accès (`/api/v1/applications` et `/api/v1/applications/revoke`, réservés à la session du coach) ;
  - les appareils connectés, avec la déconnexion d'un appareil ou de tous les autres ;
  - la déconnexion du passeport.
- **Bouton de retour** : il apparaît seulement si `return_to` a la même origine qu'une adresse enregistrée du client `client_id` (`validReturnLink`). Aucun lien codé en dur.
- **Apparence** : la palette du thème par défaut (variables v2) est recopiée dans `app/globals.css`, avec un contour de focus visible. Le passage à `packages/ui` n'est **pas fait** : il demande d'installer Tailwind et ses outils dans le hub (nouvelles bibliothèques à valider). À proposer en carte séparée.
- **Tests** (`pnpm --filter @bbfrance/hub test:api`, 26 tests verts), à 375 px de large :
  - aucun défilement horizontal, toutes les cibles d'au moins 44 px ;
  - modification du profil et message d'erreur ;
  - retour accepté vers une adresse enregistrée et refusé vers une autre ;
  - retrait de l'accès d'une application ;
  - aucun import du site dans le hub.
- **Vérification visuelle** : capture d'écran à 375 px.
