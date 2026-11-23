---
id: 228
title: Emails et images servis par le hub (idée à étudier)
app: hub
---

# 228 — Emails et images servis par le hub (idée à étudier)

## Pourquoi

Remarque du responsable pendant la mise en ligne (23/11/2026) : il faut saisir deux fois les réglages SMTP (Resend) et la clé ImgBB, une fois sur le projet Vercel du hub, une fois sur celui du site. Chaque nouvelle application (BBScheme…) devrait les recopier à son tour. Idée : c'est au hub de s'en occuper, et les applications lui demandent d'envoyer un email ou d'héberger une image.

## À étudier (rien de décidé)

- **Ce qui serait gagné** : une seule clé Resend et une seule clé ImgBB, gardées par le hub ; les applications n'ont plus de secret d'envoi ; un seul endroit pour changer de fournisseur.
- **Comment** : deux routes du hub, appelées par les applications avec leur identité de client enregistré (secret du client ou jeton signé), par exemple `POST /api/v1/mail` (destinataire désigné par l'identifiant du coach, jamais une adresse libre) et `POST /api/v1/images`. À documenter dans `lib/apiDoc/hubRoutes.ts`.
- **Points de vigilance** :
  - le hub devient un point de passage de plus : s'il tombe, les notifications du site et l'envoi d'images s'arrêtent aussi ;
  - le hub reste indépendant (ADR-0007) : il envoie un email ou héberge une image pour une application, sans connaître ses gabarits ni ses règles ; les gabarits d'email restent dans chaque application ;
  - quotas et abus : une application ne doit pas pouvoir envoyer des emails à n'importe qui ni remplir le compte ImgBB (limites par application, destinataires limités aux coachs qui la connaissent) ;
  - les applications tierces (carte 127) n'y auraient pas accès, ou seulement avec un accord explicite.
- **Alternative plus simple** : garder les deux copies des réglages, documentées dans DEPLOY (situation actuelle, qui marche).

Décision à prendre avec le responsable après la mise en ligne, éventuellement avec une ADR.

## Résultat
