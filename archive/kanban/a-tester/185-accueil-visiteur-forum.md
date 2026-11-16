---
id: 185
title: "Forum : inviter les visiteurs à participer"
epic: E10
app: site
depends_on: []
verify: "un visiteur non connecté voit en bas de chaque sujet un encart « Envie de participer ? » avec « Se connecter ou créer un compte », qui le ramène au sujet après la connexion ; l'accueil du forum lui affiche un court bandeau d'explication"
---

# 185 — Forum : inviter les visiteurs à participer

## Pourquoi

Un visiteur lit les sujets, mais rien ne l'invite à participer : la zone de réponse disparaît simplement (audit, section 3.4).

## Action

Encart en bas de chaque sujet pour les visiteurs, avec retour au sujet après la connexion (`callbackUrl`) ; bandeau de trois lignes sur l'accueil du forum, réservé aux visiteurs, qui explique le site et invite à s'inscrire. Textes simples, boutons d'au moins 44 pixels.

## Résultat

Un visiteur non connecté voit, en bas de chaque sujet, l'encart « Envie de participer ? » à la place de la zone de réponse, qui disparaissait auparavant sans explication. Son bouton « Se connecter ou créer un compte » mène à la page de connexion avec l'adresse de la page du sujet dans `?callbackUrl=` : après la connexion ou la création du compte, le visiteur revient là où il lisait. Cet encart ne se ferme pas.

L'accueil du forum affiche aux seuls visiteurs un bandeau « Bienvenue sur BBFrance » de trois lignes : ce qu'est le site, le fait que tout se lit sans compte, et qu'un compte se crée en un appui avec Discord, Google ou une adresse e-mail. Le bandeau a le même bouton, qui ramène à l'accueil du forum, et une croix pour le fermer ; ce choix est gardé dans le navigateur (`localStorage`), et un navigateur qui refuse ce stockage masque simplement le bandeau pour la visite en cours. Les deux invitations sont dans `apps/site/app/forum/component/ForumVisitorInvite.tsx`.

Vérifications : `pnpm check` passe. Un test a été ajouté à `tests/e2e/inventaire/forum-sujet.spec.ts`, en taille ordinateur et téléphone : l'encart est visible pour un visiteur, avec la bonne adresse de retour, et absent pour un membre connecté. Les captures de référence de l'accueil du forum (`forum-*.png` de `visual-themes.spec.ts`, huit thèmes) ont été régénérées, car elles montrent désormais le bandeau ; les captures de l'accueil du site n'ont pas changé.
