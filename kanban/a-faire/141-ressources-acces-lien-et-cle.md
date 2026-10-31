---
id: 141
title: "Ressources : accès visiteur, lien, clé ImgBB"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un visiteur qui ouvre /ressources/submit est envoyé vers la connexion ; un lien de ressource qui n'est pas en http(s) est refusé par le serveur ; la clé ImgBB n'apparaît plus dans le code envoyé au navigateur ; tests e2e
---

# 141 — Ressources : accès visiteur, lien, clé ImgBB

## Pourquoi

Trois défauts trouvés pendant la refonte (carte 096) :

- `/ressources/submit` et le bouton « Soumettre une ressource » sont ouverts aux visiteurs non connectés : l'envoi n'est refusé qu'à la fin, après avoir rempli tout le formulaire.
- Le lien d'une ressource n'est pas contrôlé côté serveur : on peut enregistrer une adresse qui n'est pas un lien web, par exemple `javascript:…`, qui s'exécuterait au clic (faille d'injection de code).
- La clé du service d'hébergement d'images ImgBB est publique, c'est-à-dire lisible dans le code envoyé au navigateur : n'importe qui peut l'utiliser pour envoyer des images sur le compte du site. Le même envoi sert aux avatars, aux blasons et aux images des articles.

Le deuxième et le troisième point touchent la sécurité : à traiter en premier parmi les cartes de bugs, une fois la refonte (épic E08) terminée.

## Action

- Rediriger les visiteurs de `/ressources/submit` vers la connexion (avec `callbackUrl`) et masquer le bouton pour eux.
- Dans les actions serveur des ressources, n'accepter que les liens `http://` et `https://` (et les adresses internes du site pour les outils officiels).
- Faire passer l'envoi d'images par une route du serveur qui garde la clé ImgBB secrète (variable d'environnement), puis changer la clé chez ImgBB. Mettre à jour `DEPLOY.md`.
- Retirer au passage les 5 types `any` restants de `apps/site/app/ressources/actions.ts`.
- Ajouter les tests dans `apps/site/tests/e2e/security.spec.ts`.
