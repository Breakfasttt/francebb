# Inventaire de non-régression de la refonte visuelle

Cette liste de contrôle sert à vérifier qu'aucune fonctionnalité ne disparaît pendant la refonte visuelle (épic E08, carte 075). Chaque ligne décrit quelque chose que l'on peut voir ou faire aujourd'hui sur le site. Une carte de refonte coche les lignes de l'écran qu'elle refait. Elle ne les coche qu'après les avoir vérifiées par un test Playwright d'inventaire (un test automatique qui ouvre la page et contrôle que l'action est présente et utilisable), en taille ordinateur et en taille téléphone.

**Les rôles.** Dans les listes ci-dessous, le rôle requis est indiqué entre crochets :
- **[tous]** : tout le monde, connecté ou non ;
- **[visiteur]** : une personne non connectée ;
- **[membre]** : une personne connectée et non bannie ;
- **[auteur]** : l'auteur du contenu concerné ;
- **[modo]** : modérateur ou rôle supérieur (puissance 70 ou plus) ;
- **[admin]** : administrateur (puissance 90 ou plus) ;
- **[SA]** : super administrateur ;
- **[orga]** : organisateur ou commissaire d'un tournoi, ou modérateur.

**Ce qui ne doit jamais changer.** Les adresses (URL), les paramètres d'adresse et les ancres listés ici sont utilisés par des liens déjà partagés, par des courriels et par le code. Une refonte visuelle ne les modifie pas.

**Ce qui n'existe pas aujourd'hui.** La dernière section liste ce que le site ne fait pas encore. La refonte ne doit pas l'inventer sans une carte dédiée.

---

## 1. Éléments présents sur toutes les pages

Fichiers actuels : `apps/site/app/layout.tsx`, `common/components/Navbar/`, `MobileSidebar/`, `PageHeader/`, `CookieBanner/`.

- [ ] [tous] Le logo du site ramène à l'accueil. Sur l'accueil, la barre n'affiche pas de logo, parce que la page a déjà le sien en grand.
- [x] [visiteur] Un bouton « Connexion » mène à `/auth/login`.
- [x] [membre] Une pastille de profil (avatar ou initiale, plus le pseudo) mène à `/profile`.
- [x] [membre] Un bouton « Déconnexion » déconnecte et ramène à l'accueil. En mode hub, il ferme aussi la session du hub par un envoi POST vers `/auth/logout`.
- [x] [membre] Une icône Messagerie mène à `/messagerie` et affiche une pastille avec le nombre de messages privés non lus.
- [x] [modo] Une icône Modération mène à `/moderation` et affiche une pastille avec le nombre d'éléments en attente : signalements et ressources à valider, avec « 9+ » au-delà de 9.
- [ ] [admin] Une icône Administration mène à `/administration`.
- [x] [tous] Sur téléphone, le contenu propre à chaque page (onglets du profil, de la modération, de l'administration, colonnes latérales du forum, gestion d'une ligue…) reste accessible. Aujourd'hui, il est dans l'emplacement `#mobile-page-sidebar-slot` du menu latéral.
- [ ] [tous] Sur téléphone, le bouton retour de la page reste accessible. Aujourd'hui, il est dans l'emplacement `#mobile-back-button-slot` de la barre.
- [x] [tous] Le menu de téléphone se ferme quand on change de page, et le défilement de la page est bloqué tant qu'il est ouvert.
- [x] [tous] Le pied de page donne accès aux mentions légales, à la mention « Conçu avec l'aide de l'IA », au GitHub (lien externe) et aux statistiques (`/statistiques`). Sur téléphone, ces liens sont aujourd'hui en bas du menu latéral.
- [ ] [tous] Le bandeau cookies apparaît après 1,5 seconde si aucun consentement n'est enregistré. « Accepter » est mémorisé dans le navigateur, la croix ferme le bandeau pour la session, et un lien mène aux mentions légales.
- [ ] [tous] Les notifications temporaires (toasts) s'affichent, sans être cachées par la navigation.
- [ ] [tous] Le thème choisi est appliqué dès le premier affichage, sans éclair d'une autre couleur (ADR 0005). Pour un membre, il vient de sa session ; pour un visiteur, de la mémoire du navigateur.
- [ ] [membre banni] Un membre banni est envoyé vers `/banned`.
- [ ] [membre] Tant que le profil n'est pas terminé, le membre est renvoyé vers l'onboarding (`proxy.ts`).
- [ ] [tous, en développement seulement] Le widget de comptes de test (`DebugAuthWidget`) et le widget de thème (`DebugThemeWidget`) restent utilisables.

## 2. L'éditeur BBCode (partagé par le forum, les articles, la messagerie, les ligues, le profil et l'administration)

Fichier actuel : `common/components/BBCodeEditor/BBCodeEditor.tsx`. Le BBCode est une syntaxe de mise en forme par balises entre crochets, par exemple `[b]gras[/b]`.

- [x] Gras, italique, souligné, barré.
- [x] Taille du texte (0,7 / 0,85 / 1 / 1,25 / 1,5 / 2 rem).
- [x] Couleur (10 pastilles).
- [x] Trait horizontal `[hr]`.
- [x] Listes : à points, à tirets, numérotée, par lettres.
- [x] Tableau (insertion d'un modèle).
- [x] Lien : adresse plus texte, ou texte sélectionné.
- [x] Lien vers un sujet du forum `[topic=id]`, avec une recherche par `GET /api/forum/topics/search`.
- [x] Image par adresse, ou par envoi de fichier vers ImgBB. Options : alignement gauche, centre ou droite ; habillage du texte ; taille réduite.
- [x] Galerie (liste d'adresses d'images).
- [x] Vidéo YouTube, avec les mêmes options d'alignement, d'habillage et de taille.
- [x] Mention d'un membre par un bouton, **et en tapant `@`** dans la zone de texte. La recherche passe par `GET /api/users/search`.
- [x] Spoiler (texte caché), avec un titre facultatif.
- [x] Accordéon (bloc repliable, avec un titre).
- [x] Bloc de code.
- [x] Alignement : centré, à droite, justifié.
- [x] Exposant et indice.
- [x] Schéma BBScheme (adresse ou identifiant), disposé à l'horizontale ou à la verticale.
- [x] Smileys.
- [ ] Assistant de mise en forme par IA : il génère un texte de consigne à copier et ouvre Gemini, Claude ou ChatGPT. *(Carte 087 : la consigne, sa copie et les trois boutons sont vérifiés ; l'ouverture de l'IA dans un nouvel onglet ne l'est pas.)*
- [x] Bouton Aperçu, qui affiche ou masque le rendu.
- [x] Compteur de caractères quand une longueur maximale est fixée.
- [x] La touche Échap ferme l'outil ouvert.
- [x] L'événement `bbcode-insert-text` insère une citation depuis le bouton « Citer » d'un message.
- [x] La zone de texte garde son attribut `name`, parce que les formulaires lisent son contenu par `FormData`.

**Rendu des messages** (`BBCodeContent`, `lib/bbcode.ts`) :
- [ ] Toutes les balises sont affichées correctement : `b i u s color size center right justify code sup sub hr bbscheme spoiler accordion quote url topic mention img youtube list table gallery`, plus les smileys écrits en texte.
- [x] Une citation affiche les onglets « Citation », « Par @nom » (lien vers le profil) et « Voir le message » (ancre `#post-id`). Si le message cité a été supprimé ou modéré, un texte d'explication remplace son contenu.
- [x] Une mention `@Pseudo` mène à `/spy/id`, ou à `/profile` quand il s'agit de soi.
- [x] Un schéma `[bbscheme]` affiche le lecteur : lecture, pause, image par image, vitesse.

---

## 3. Forum

Fichiers actuels : `apps/site/app/forum/**`, actions serveur dans `app/forum/actions.ts`, droits d'accès dans `lib/forumAccess.ts`.

### 3.1 `/forum` : accueil du forum
- [ ] [tous] Les catégories, triées par ordre, sont repliables. Une catégorie qui contient du non-lu est mise en valeur.
- [ ] [tous] Seuls les forums de premier niveau sont listés. Pour chacun : icône (trophée pour un forum de tournoi, dossier sinon), nom, description, cadenas s'il est verrouillé, cloche s'il contient du non-lu (sous-forums compris), nombre de sujets.
- [ ] [tous] Le dernier sujet de chaque forum : titre (avec un trophée pour un tournoi), auteur, date ; ou « Aucun sujet ».
- [x] [tous] Après une suppression, le message « Sujet supprimé » ou « Forum supprimé » s'affiche pendant 8 secondes (`?deletedTopic=`, `?deletedForum=`), puis l'adresse est nettoyée.
- [x] [tous] Liens « Recherche avancée » (`/forum/search`) et « Les membres » (`/membres`).
- [x] [membre] S'il y a du non-lu : lien « Posts non lus (N) » vers `/forum/unread`, et bouton « Tout marquer comme lu », avec confirmation.
- [x] [modo] Bouton « Nouveau forum » vers `/forum/new-forum`.
- [x] [tous] Les forums réservés à un rôle sont masqués à qui n'a pas ce rôle.

### 3.2 `/forum/[id]` : un forum
- [ ] [tous] Titre, cadenas, cloche de non-lu, description.
- [x] [visiteur] Un forum réservé envoie vers `/auth/login?callbackUrl=`. [membre sans le rôle] Il affiche une page introuvable.
- [ ] [tous] Sous-forums (10 au plus), avec icône, nom, cadenas, cloche, description, nombre de sujets, dernier sujet et badge de tournoi (« Annulé », « Terminé », « Passé »).
- [ ] [tous] Liste des sujets : icône épinglé, tournoi ou sujet ordinaire ; titre ; badge de statut du tournoi ; cadenas ; cloche de non-lu ; « Par X le date » ; nombre de messages ; nombre de vues ; date de dernière activité.
- [x] [tous] Les sujets épinglés sont en premier, puis les autres du plus récent au plus ancien. Les sujets archivés sont exclus.
- [x] [tous] Liste vide : « Aucun sujet dans ce forum pour le moment. »
- [x] [tous] Pagination de 30 sujets par page (`?page=`).
- [x] [membre] « Nouveau sujet » vers `/forum/new-topic?forumId=`. Dans un forum de tournoi, il y a aussi « Nouveau tournoi » vers `/forum/new-tournament?forumId=`. Si le forum est verrouillé et que le membre n'est pas modérateur, un bouton désactivé « Forum verrouillé » les remplace.
- [x] [tous] « Recherche avancée », avec le forum prérempli (`?forumId=`), et « Les membres ».
- [x] [modo] Nouveau sous-forum. Au-delà de 5 sous-forums, une fenêtre « Limite atteinte » s'ouvre.
- [x] [modo] Supprimer le forum, avec confirmation. Ses sous-forums, sujets et messages sont supprimés aussi.
- [x] [modo] Verrouiller ou déverrouiller le forum.

### 3.3 `/forum/topic/[id]` : un sujet
**Lecture et navigation**
- [x] [membre] Sans `?page=`, la page saute au premier message non lu (`?page=N#post-<id>`).
- [x] [membre] Le sujet est marqué comme lu et le compteur de vues augmente.
- [x] [tous] La page défile jusqu'à l'ancre `#post-<id>`.
- [ ] [tous] Pagination de 20 messages par page. Une page trop grande est ramenée à la dernière.
- [x] [tous] Titre, badge « ARCHIVÉ », nom du forum, retour au forum, fil d'Ariane (chemin cliquable : Accueil Forum › catégorie › forum parent › forum › sujet).
- [x] [visiteur / membre sans le rôle] Même règle d'accès réservé que pour un forum.
- [x] [membre] Les messages des membres qu'on a bloqués sont masqués.

**Sujet de tournoi**
- [x] [tous] Résumé du tournoi, widget de résultats quand il est terminé, module d'inscription.
- [x] [tous] Le premier message reste affiché, mis en valeur, sur les pages suivantes.

**Un message (ancre `id="post-<id>"`)**
- [ ] [tous] Avatar avec le cadre de rang. Rangs selon le nombre de messages : bronze 100, argent 300, or 700, platine 1000, diamant 2000, maître 4000, grand maître 10000. L'auteur banni a un style « banni ».
- [x] [tous] Nom et rôle de l'auteur.
- [x] [tous] Statistiques de l'auteur, si elles sont renseignées : numéro NAF avec lien vers `member.thenaf.net`, équipe, région, ligues (liens vers `/ligue/[id]`) et ligue saisie à la main.
- [x] [membre] Bouton « Profil » vers `/spy/[id]`, et bouton « MP » vers `/messagerie?userId=`, sauf sur ses propres messages.
- [x] [tous] « Posté le … », et « modifié le … » si le message a été modifié.
- [x] [tous] Numéro du message `#N`.
- [x] [membre] « Marquer comme non lu à partir d'ici ».
- [x] [tous] Partager : copie du lien `…/forum/topic/id?page=N#post-id`, avec la confirmation « Lien copié ! ».
- [x] [membre, pas l'auteur] Signaler le message (raisons : spam, harcèlement, contenu inapproprié, bot, autre ; plus des précisions).
- [x] [tous] Message supprimé : « Ce message a été supprimé par son auteur », sans actions.
- [x] [membre] Auteur bloqué ou banni : écran masqué, bouton « Afficher le message », bandeau « AFFICHAGE TEMPORAIRE » et bouton « Masquer à nouveau ».
- [x] [tous] Message modéré : bandeau avec le nom du modérateur et la raison. [auteur, modo] Le contenu d'origine reste visible avec une mention. [autres] « Contenu masqué par la modération ».
- [x] [tous] Signature de l'auteur sous le message.
- [x] [modo] « Modérer » (raison obligatoire) ou « Restaurer » (avec confirmation).
- [x] [tous] Les réactions affichent un émoji et un compteur, et celle du membre est mise en valeur. [membre] Choix parmi 10 émojis : 👍 ❤️ 😂 😢 😡 🔥 👀 🎉 👎 🍻. Une seule réaction par membre : un autre émoji remplace la réaction, le même émoji la retire. L'écran se met à jour tout de suite et revient en arrière si le serveur refuse.
- [ ] [membre] « Citer » insère la citation dans la réponse rapide puis fait défiler jusqu'à elle. Sans réponse rapide, il mène à `/forum/topic/[id]/reply?quotePostId=`.
- [x] [auteur, modo] « Modifier » vers `/forum/post/[id]/edit`. Pour le premier message d'un tournoi, il mène à `/forum/edit-tournament/[tournamentId]`.
- [x] [auteur] « Supprimer », avec confirmation.

**Réponse rapide (`id="quick-reply-area"`)**
- [x] [membre, sujet et forum non verrouillés, ou modo] Éditeur BBCode et bouton « Envoyer ma réponse ».
- [x] [membre] Après l'envoi, l'éditeur est vidé et la page défile jusqu'au nouveau message, mis en valeur par une animation.
- [x] [membre] Si le sujet est verrouillé pour lui, un encart « Sujet verrouillé » s'affiche.

**Outils du sujet (aujourd'hui dans la colonne latérale)**
- [x] [tous] Nombre de vues.
- [x] [tous] Bandeau « Forum verrouillé » ou « Sujet verrouillé ».
- [x] [membre] « Répondre » fait défiler jusqu'à la réponse rapide.
- [x] [membre] « Suivre le sujet » ou « Arrêter de suivre ».
- [x] [auteur, modo, hors tournoi] « Modifier le titre », avec des smileys et un aperçu.
- [x] [membre, pas l'auteur] Signaler le sujet.
- [x] [tous] « Dernier message » (`?page=last#post-lastId`).
- [x] [tous] « Haut de page ».
- [x] [orga, tournoi non annulé] « Modifier le tournoi ». Si le tournoi est terminé : « Publier les résultats » et « Réouvrir le tournoi ». Sinon : « Terminer », « Bloquer / Réouvrir les inscriptions », « Annuler ». Chaque action demande une confirmation.
- [x] [modo] Épingler ou désépingler.
- [x] [modo] Déplacer vers un autre forum (fenêtre avec la liste des forums).
- [x] [modo] Archiver ou désarchiver.
- [x] [modo] Verrouiller ou déverrouiller le sujet.
- [x] [modo] Supprimer le sujet définitivement, avec un avertissement. Le tournoi lié est supprimé aussi.

### 3.4 `/forum/topic/[id]/reply` : page de réponse
- [x] [membre] Éditeur BBCode, boutons « Annuler » et « Publier ma réponse ».
- [x] [membre] `?quotePostId=` préremplit la citation.
- [x] [membre] Rappel des 3 derniers messages.
- [x] [visiteur] Est renvoyé vers le sujet.

### 3.5 `/forum/post/[id]/edit` : modifier un message
- [x] [auteur, modo] Éditeur prérempli, « Annuler », « Enregistrer les modifications », puis retour à `?page=N#post-id`.
- [x] [auteur, modo] Rappel des 3 derniers messages, avec le message modifié grisé et marqué « (Ce message) ». *(Carte 087 : la marque « (Ce message) » est vérifiée par le test ; le grisé seulement sur les captures.)*

### 3.6 `/forum/new-topic?forumId=` : nouveau sujet
- [x] [membre] Titre avec bouton smiley et aperçu en direct.
- [x] [membre] Message dans l'éditeur BBCode.
- [x] [modo] Cases « Épingler » et « Verrouiller le sujet ».
- [x] [membre] « Créer le sujet » et « Annuler ». Une erreur s'affiche en notification, puis on est redirigé vers le sujet créé.
- [x] [membre] La création est refusée dans un forum verrouillé, sauf pour un modo.

### 3.7 `/forum/new-forum` : créer un forum
- [x] [modo] Champs : nom (obligatoire), description, catégorie, forum parent, « Insérer après ». Les erreurs sont affichées : nom vide, nom déjà pris, plus de 5 sous-forums. *(Carte 088 : vérifié par `forum-recherche.spec.ts`, y compris le renvoi d'un membre vers `/forum` et la création réussie d'un sous-forum.)*

### 3.8 `/forum/search` : recherche avancée
- [x] [tous] Filtres : mots-clés, auteur, forum (arborescence, sous-forums inclus), période (tout, 7 jours, 30 jours, 1 an), tri (récents ou anciens).
- [x] [tous] Résultats : trophée, titre du sujet, forum, auteur, ancienneté, vues, date du dernier message, bouton « Voir », extrait avec les mots surlignés. *(Carte 088 : sans mot-clé (recherche par auteur ou par forum seul), l'extrait est désormais le début du message en texte simple, et non plus le message entier mis en forme.)*
- [x] [tous] 20 résultats par page. Message dédié si la recherche ne donne rien.

### 3.9 `/forum/unread` : sujets non lus
- [ ] [membre] Liste des sujets : trophée, titre, forum, auteur, nombre de messages, date du dernier message.
- [x] [membre] Marquer un sujet comme lu, et tout marquer comme lu.
- [x] [membre] Liste vide : « Vous êtes à jour », avec un bouton de retour.
- [x] [membre] Pagination de 20 par page.
- [x] [visiteur] Est renvoyé vers la connexion.

---

## 4. Tournois

- [x] [tous] `/tournois` : affichage en grille (10) ou en liste (20), pagination, recherche par nom.
- [x] [tous] Filtres de `/tournois` : région et département ; mode individuel ou par équipe ; plateforme ; version ; structure ; circuits (NAF, CDF, CGO, TGE, TSC) ; logement, repas, arrivée le vendredi ; prix maximum ; places restantes minimum ; historique.
- [x] [tous] Les filtres actifs s'affichent en pastilles, chacune avec une croix pour la retirer. Tri par date, prix ou places, dans les deux sens. Badges Passé, Terminé, Annulé. Une carte de tournoi ouvre son sujet.
- [x] [membre] `/forum/new-tournament?forumId=` : formulaire de tournoi complet, avec choix du lieu sur une carte et recherche d'adresse (géocodage).
- [x] [orga] `/forum/edit-tournament/[id]` : modifier le tournoi.
- [x] [membre] Module d'inscription : s'inscrire, se désinscrire, se déclarer mercenaire, créer, modifier ou supprimer une équipe.
- [x] [orga] Module d'inscription : changer le statut d'inscription et de paiement, ouvrir ou fermer les inscriptions.
- [x] [orga] `/forum/tournament/[id]/results` : saisie du classement et des rondes, import d'un rapport NAF, terminer, annuler, réouvrir, effacer les résultats.
- [x] [tous] `/forum/tournament/[id]/results/view` : classement final.

*Section vérifiée par `tests/e2e/inventaire/tournois.spec.ts` (carte 089), en taille ordinateur et en taille téléphone. Terminer, annuler et réouvrir un tournoi se font depuis les outils du sujet (`TopicTools.tsx`, carte 086) ; le test les exerce sur le sujet d'un tournoi. Le bug « `?ligueId=` n'est pas lu par `/tournois` » (section 18) n'existe plus : il a été corrigé par la carte 105, et le test le vérifie.*

## 5. Accueil et pages fixes

- [x] [tous] `/` : grand logo. Tuiles Jouer, Forum, Ligues (avec « Créer »), Tournois (avec « Créer »), La Carte, Championnat de France, Articles, Ressources, BBScheme, Quizz, Discord (lien réglé dans l'administration). *Le test vérifie le logo en taille ordinateur seulement : avant la refonte, l'accueil n'avait pas de logo sur téléphone (il en a un depuis la carte 090). Pour Discord, il vérifie la tuile et son ouverture dans un nouvel onglet, pas l'adresse réglée (gardée en cache une heure par le site).*
- [x] [visiteur] Sur l'accueil, « Créer » une ligue envoie vers la connexion.
- [x] [tous] `/` : bloc « Prochains tournois » (3, liens vers leur sujet) et bloc « Article aléatoire ».
- [x] [tous] `/jouer` : guide en 6 sections illustrées (texte saisi dans l'administration), liens « Prochaine étape », boutons « Créer mon compte » et « Parcourir le forum ». Une section vide est masquée, sauf la première.
- [ ] [tous] `/mentions-legales`. *Non traitée par la carte 090 : le texte de la page était réécrit au même moment (carte 126, RGPD). Sa mise en forme est reportée à la carte 101.*
- [x] [tous] `/media` : lecteurs Twitch avec le lien « Suivez… » et listes de lecture YouTube. *Le lien s'appelle « Voir sur Twitch » (avant comme après la refonte).*
- [x] [tous] `/statistiques` : utilisateurs, ligues, articles, sujets du forum, vues totales, personnes en ligne.
- [x] [admin] `/statistiques` : courriels du mois, quota restant, quota de stockage, taille de la base, signalements, ressources.
- [x] [banni] `/banned` : raison du bannissement, bouton de retour.
- [x] [tous] Page 404 « Terrain impraticable ! », avec un bouton vers l'accueil.

*Section vérifiée par `tests/e2e/inventaire/accueil.spec.ts` (carte 090), en taille ordinateur et en taille téléphone, sauf les mentions légales. Le test vérifie aussi qu'un membre voit les liens « Créer » mener directement aux formulaires, et qu'un modérateur ne voit pas la partie des statistiques réservée aux administrateurs.*

## 6. Connexion et compte

- [x] [visiteur] `/auth/login` : Discord, Google, adresse email avec « Recevoir un lien magique » ; en mode hub, « compte BBFrance » ; en développement, la section « Comptes de test ». Le paramètre `callbackUrl` est respecté. *Le bouton « compte BBFrance » n'existe plus depuis la carte 073 : en mode hub, les boutons Discord, Google et lien magique passent par le hub sans le montrer. Le test tourne en mode hub et vérifie que ces boutons sont présents et utilisables, sans suivre la connexion jusqu'au service extérieur ; `callbackUrl` est vérifié avec un compte de test et pour un membre déjà connecté.*
- [x] [tous] `/auth/verify-request` (« Vérifiez votre boîte mail ») et `/auth/error` (message d'erreur lisible).
- [x] [membre] `/auth/onboarding` : pseudo ; avatar (adresse, aléatoire, générateur DiceBear avec graine et style, envoi d'image) ; NAF ; région ; équipe fétiche ; ligues ; signature BBCode ; thème. Puis écran de succès. *L'envoi d'image n'est vérifié que jusqu'à l'ouverture du choix de fichier (l'envoi passe par le service extérieur ImgBB). Le formulaire n'a pas de champ « adresse » de l'avatar : seuls les boutons le changent (avant comme après la refonte).*

*Section vérifiée par `tests/e2e/inventaire/connexion.spec.ts` (carte 091), en taille ordinateur et en taille téléphone : le test remplit toute l'inscription d'un nouveau membre et contrôle ce qui est enregistré en base.*

## 7. Profil et membres

- [x] [membre] `/profile`, carte de profil : avatar avec cadre, pseudo, rôle, badge « Banni », lien NAF, nombre de messages, région, équipe, ligues. *Le badge « Banni » est vérifié sur le profil d'un banni vu par un modérateur (un banni ne peut pas ouvrir `/profile`). Le cadre de l'avatar n'est pas vérifié par le test (c'est un dessin, sans nom accessible).*
- [x] [membre] Onglets gardés dans l'adresse (`?tab=`) : `followed`, `activity`, `articles`, `ressources`, `blocked`, `edit`, `settings`. *`?tab=activity` ouvrait les sujets suivis (valeur oubliée dans la page) : corrigé par la carte 092, avant l'écriture du test.*
- [x] [membre] Onglet `followed` : sujets suivis, avec une pastille de non-lu et une pagination.
- [x] [membre] Onglet `activity` : activité récente sur le forum.
- [x] [membre] Onglet `articles` : mes articles, 6 par page.
- [x] [membre] Onglet `ressources` : mes ressources, avec Éditer et Supprimer (confirmation).
- [x] [membre] Onglet `blocked` : utilisateurs bloqués, avec « Débloquer ».
- [x] [membre] Onglet `edit` : avatar (4 façons), contour d'avatar, pseudo, NAF, région, équipe, ligues, signature (250 caractères), **choix du thème**. *Les tests tournent en mode hub, sans hub lancé : « Sauvegarder le profil » est vérifié jusqu'au message affiché (le passeport refuse), pas jusqu'à l'enregistrement en base. Le thème, lui, est vérifié en base. L'envoi d'image n'est vérifié que jusqu'à l'ouverture du choix de fichier (service extérieur ImgBB).*
- [x] [membre] Onglet `settings` : associer ou délier email, Discord et Google ; interrupteurs de notification par email (messages privés, mentions, sujets suivis, newsletter) ; « Supprimer mon compte » avec double confirmation. En développement : newsletter de test. *Délier est vérifié en base ; « Associer » est vérifié présent et utilisable, sans suivre la connexion jusqu'au fournisseur. En mode hub, la suppression du compte est un lien vers le passeport : c'est ce que le test vérifie ; la double confirmation (hors mode hub) n'est pas vérifiée. La newsletter de test est vérifiée présente, pas envoyée.*
- [x] [membre] `/spy/[id]` : onglets Activité et Articles ; « Message privé » ; « Signaler » ; « Bloquer » ou « Débloquer » (pas sur un modérateur). Son propre identifiant renvoie vers `/profile`. *Ce renvoi ne marchait pas (la page affichait « Utilisateur introuvable ») : corrigé par la carte 092, avant l'écriture du test.*
- [x] [modo] `/spy/[id]` : « Bannir » (raisons rapides plus détails) ou « Débannir ».
- [x] [membre] `/membres` : recherche par nom, filtres par ligue, région et rôle ; tri (A-Z, Z-A, en-têtes cliquables) ; 25 par page ; liens vers le profil, la NAF et le message privé.
- [x] [modo] `/membres` : voit les bannis, bannit ou débannit.
- [x] [rôle autorisé] `/membres` : « Changer le rôle ».
- [x] [SA] `/membres` : suppression définitive d'un membre.

*Section vérifiée par `tests/e2e/inventaire/profil.spec.ts` (carte 092), en taille ordinateur et en taille téléphone. Sur l'ancienne version, en taille téléphone, la pagination des sujets suivis restait cachée sous la barre de navigation du bas (le test échouait pour cette raison) ; la refonte corrige ce défaut.*

## 8. Messagerie `/messagerie`

*Vérifiée par `apps/site/tests/e2e/inventaire/messagerie.spec.ts` (carte 093), en taille ordinateur et en taille téléphone.*

- [x] [membre] Liste des conversations (20) : dernier message et nombre de non-lus.
- [x] [membre] « Nouvelle discussion » : recherche de coachs et titre facultatif. *(Carte 093 : le bouton s'appelle « Nouvelle conversation » et ouvre la fenêtre « Nouvelle discussion ». Vérifié avec un seul coach sans titre (conversation à deux) et avec deux coachs et un titre (groupe).)*
- [x] [membre] Conversation (`?id=`) : 30 derniers messages, rafraîchis toutes les 10 secondes, marqués comme lus à l'ouverture. *(Carte 093 : le rafraîchissement est vérifié par un message écrit dans la base pendant la lecture, qui apparaît sans recharger la page.)*
- [x] [membre] Saisie avec l'éditeur BBCode et « Envoyer ».
- [x] [membre] Groupe : ajouter des participants, renommer, liste des participants. *(Carte 093 : « Ajouter des participants » n'est plus proposé dans une conversation à deux, où l'action serveur le refusait toujours (« Ce n'est pas un groupe »).)*
- [x] [membre] « Quitter la conversation », avec confirmation.
- [x] [membre] `?userId=` ouvre ou reprend directement une conversation à deux.
- [x] [membre] La note sur le chiffrement est affichée. *(Carte 093 : vérifiée dans la fenêtre « Nouvelle discussion » ; sur ordinateur, elle est aussi rappelée dans la colonne de droite quand aucune conversation n'est ouverte.)*

## 9. Ligues et carte

- [x] [tous] `/ligues` : grille (12) ou liste (20) ; recherche par nom ou acronyme ; filtre par zone ; pagination ; « Créer une ligue ». Les filtres sont dans l'adresse (`?view&query&region`).
- [x] [membre] `/ligues/create` : nom, acronyme, blason (envoi), zone, région, département, ville, adresse avec choix sur la carte, description BBCode, commissaires. *L'envoi du blason n'est vérifié que jusqu'à l'ouverture du choix de fichier (service extérieur ImgBB). Le lieu est choisi par un appui sur la carte ; la recherche d'adresse (service extérieur Nominatim) est seulement présente.*
- [x] [tous] `/ligue/[id]` : blason, « À propos », chef, commissaires, membres, 5 prochains tournois et « Voir tout ». *La liste des membres n'est affichée qu'aux membres connectés, avant comme après la refonte : le test la vérifie avec un membre connecté.*
- [x] [membre] `/ligue/[id]` : signaler la ligue.
- [x] [chef, commissaire, modo] `/ligue/[id]` : « Modifier ».
- [x] [chef, modo] `/ligue/[id]` : « Transférer la propriété » et « Supprimer la ligue ».
- [x] [chef, commissaire, modo] `/ligue/edit/[id]` : même formulaire que la création.
- [x] [tous] `/carte` : carte Leaflet ; bascule entre Tournois et Ligues ; plein écran ; zoom ; bulle avec un lien « Détails ». *Le fond de carte (tuiles d'OpenStreetMap) n'est pas vérifié, seulement les boutons, les repères et la bulle.*

*Section vérifiée par `tests/e2e/inventaire/ligues.spec.ts` (carte 094), en taille ordinateur et en taille téléphone. Sur l'ancienne version en taille téléphone, le test attend que le champ en cours de saisie soit quitté avant d'appuyer sur « Enregistrer » : la barre du bas, qui réapparaît à ce moment, faisait rater l'appui (bug de la carte 113). Depuis la refonte, le formulaire n'a plus cette barre.*

## 10. Articles

- [x] [tous] `/articles` : grille (12) ou liste (20) ; pagination ; filtres `query`, `tag`, `author`, `sort` (récents, anciens, titre A-Z, populaires) et `view` ; « Réinitialiser ».
- [x] [membre] « Créer un article ». *Le bouton n'est montré qu'aux membres connectés, avant comme après la refonte.*
- [x] [tous] `/articles/[id]` : contenu, auteur, date, vues, tags, réactions émoji. *La mention « Membre depuis 2024 », écrite en dur sous le nom de l'auteur et fausse pour la plupart des membres, n'a pas été reprise.*
- [x] [auteur, modo] `/articles/[id]` : Modifier, Supprimer.
- [x] [modo] `/articles/[id]` : modérer, annuler la modération. Un article modéré n'est visible que par son auteur et les modos.
- [x] [membre, pas l'auteur] `/articles/[id]` : signaler.
- [x] [membre / auteur, modo] `/articles/create`, `/articles/edit/[id]` : titre, tags avec suggestions, ligue liée, contenu BBCode.

*Section vérifiée par `tests/e2e/inventaire/articles.spec.ts` (carte 095), en taille ordinateur et en taille téléphone. Le test masque la pastille des outils de développement de Next.js, absente du site en ligne : sur téléphone, elle recouvrait les boutons placés en bas à gauche d'un panneau. Défauts connus gardés tels quels : la liste montre aussi les articles modérés (avec la mention « Modéré »), et la modification d'un article efface sa ligue rattachée.*

## 11. Ressources

- [x] [tous] `/ressources` : outils officiels en premier (badge « Officiel ») ; grille ou liste ; 20 par page ; recherche par texte et par tags ; un clic ouvre le lien.
- [x] [auteur, modo] Éditer, et supprimer avec confirmation (une ressource officielle ne peut pas être supprimée). *Depuis la refonte, ces deux actions sont dans le menu « ⋯ » de chaque ressource ; avant, elles n'apparaissaient qu'au survol de la souris.*
- [x] [membre] `/ressources/submit` : titre, description (200 caractères), adresse, image (adresse ou envoi), tags ; puis attente de validation. *L'envoi d'un fichier image est vérifié jusqu'à l'ouverture du choix du fichier : l'envoi lui-même passe par le service externe ImgBB, que le test n'appelle pas.*
- [x] [auteur, modo ; admin pour une ressource officielle] `/ressources/edit/[id]` : la ressource modifiée repasse en attente de validation.

*Section vérifiée par `tests/e2e/inventaire/ressources.spec.ts` (carte 096), en taille ordinateur et en taille téléphone. Défaut connu gardé tel quel : la page `/ressources/submit` et le bouton « Soumettre une ressource » sont ouverts aux visiteurs, dont l'envoi est refusé seulement à la fin.*

## 12. Classement du Championnat de France (CDF)

- [x] [tous] `/classement` : onglets Année, Glissant, Par roster, Hall of Fame, Archives ; choix de l'année et de l'archive ; lignes dépliables (4 meilleurs tournois, liens vers le profil et vers le tournoi) ; fenêtre d'aide « Calcul des points CDF ». *Avant la refonte, le détail des tournois était toujours affiché ; il est maintenant derrière le bouton « Détails de … » de chaque ligne.*
- [x] [modo] `/classement` : archiver l'année (avec confirmation), éditer une archive, importer des archives depuis l'ancien site, créer une archive. *Depuis la refonte, ces actions sont dans le menu « Gestion du classement ». L'archivage demande une seule confirmation (la ligne parlait de deux étapes : c'est la suppression qui en demande deux). L'import est vérifié jusqu'à la fenêtre qui demande l'année : l'import lui-même interroge l'ancien site depuis le serveur, ce que le test ne fait pas, et la confirmation d'une année déjà présente (`ConfirmDialog` depuis la refonte) n'est donc pas vérifiée automatiquement.*
- [x] [admin] `/classement` : supprimer une archive (deux confirmations).
- [x] [modo] `/classement/edit-archive[?year=]` : année, nom, tableau de lignes (coach, lien vers un membre, NAF, points, nombre de tournois, détails) ; ajouter ou supprimer une ligne ; enregistrer. *Le test vérifie l'enregistrement dans la base. Avant la refonte, le membre lié n'était pas enregistré et la page ne revenait pas au classement après l'enregistrement : les deux sont corrigés (voir la fiche `docs/features/classement-statistiques/README.md`).*

*Section vérifiée par `tests/e2e/inventaire/classement.spec.ts` (carte 097), en taille ordinateur et en taille téléphone.*

## 13. BBScheme `/bbscheme`

- [ ] [tous] Choix du roster bleu et du roster rouge, Star Players, réserves des deux équipes, « Remettre en réserve ».
- [ ] [tous] Outils : sélection ou déplacement (y compris du terrain), crayon, gomme, « Vider » les dessins, baguette (état du pion : debout, à terre, sonné, bonehead, stupid, fourchette), ballon, annuler, « Tout vider », désélectionner.
- [ ] [tous] Images de l'animation : ajouter, dupliquer, supprimer, précédente, suivante, compteur `n/N`, 50 au plus. Lecture, pause, vitesse.
- [ ] [tous] Vue : rotation, zoom (curseur, molette, pincement à deux doigts), plein écran.
- [ ] [tous] « Partager » : enregistre et copie le lien `?id=`. Export en GIF avec barre de progression et « Télécharger ». Fenêtre « Infos ».
- [ ] [tous] Paramètres d'adresse `?id=`, `&embed=true` et `&layout=vertical`.
- [ ] [tous] Interface dédiée au téléphone : barre d'outils qui défile avec des flèches, panneaux de réserve, terrain vertical.

## 14. BBQuizz

- [x] [membre] `/bbquizz` : « Jouer », « Proposer une question ». *Le bouton pour jouer s'appelle « Commencer le quizz ! ». Le test vérifie aussi qu'un visiteur est envoyé vers la connexion et qu'un membre ne voit ni « Éditer » ni « Valider ».*
- [x] [modo] `/bbquizz` : « Éditer », « Valider ». *Depuis la refonte, ces deux actions sont dans le menu « Gestion du quizz » (« Éditer les questions », « Valider les propositions »).*
- [x] [membre] Partie : 20 questions, chronomètre, 4 réponses, jokers 50/50, appel à la communauté et passer, explication, « Suivant », écran de fin avec « Rejouer ». *Le test joue deux questions d'une vraie partie de 20 (score, chronomètre, les trois jokers, « Suivant »), puis une partie d'une seule question enregistrée pour le test, pour vérifier les points gagnés, l'explication, l'écran de fin, « Rejouer » et l'enregistrement du score. Le passage automatique à la question suivante après 5 secondes et la fin du temps de réponse ne sont pas vérifiés à part. Avant la refonte, « Suivant » s'appelait « Continuer » et « Rejouer » « Recommencer une partie ».*
- [x] [membre] Classement Jour, Semaine, Tout temps. *Onglets « Du jour », « Semaine » et « Panthéon » (tout temps) ; le test vérifie qu'une partie vieille de 30 jours n'apparaît que dans le Panthéon.*
- [x] [membre] `/bbquizz/proposer` : catégorie, question, 4 réponses, la bonne réponse, explication. *Le test vérifie la proposition enregistrée dans la base.*
- [x] [modo] `/bbquizz/valider` : accepter ou refuser une proposition. *Boutons « Approuver » et « Rejeter » ; le test vérifie que la question approuvée entre dans le jeu et que la question rejetée n'y entre pas. Un membre qui ouvre cette page est renvoyé vers `/bbquizz`.*
- [x] [modo] `/bbquizz/editer` : recherche, éditer, supprimer. *La modification est vérifiée dans la base, la suppression passe par une confirmation (`ConfirmDialog` depuis la refonte, la fenêtre `confirm()` du navigateur avant). Un membre qui ouvre cette page est renvoyé vers `/bbquizz`.*

*Section vérifiée par `tests/e2e/inventaire/bbquizz.spec.ts` (carte 098), en taille ordinateur et en taille téléphone.*

## 15. Modération `/moderation`

- [ ] [modo] Onglets (`?tab=`) avec pastilles de compteur : `logs`, `users`, `reports_post`, `reports_topic`, `reports_user`, `reports_article`, `reports_ligue`, `reports_user_banned`, `resources_validation`.
- [ ] [modo] Journal : pagination, détails, « Purger », lien vers le profil du modérateur.
- [ ] [modo] Signalements regroupés par contenu visé : « Marquer comme traité » ou ignorer, avec un commentaire.
- [ ] [modo] Bannis : « Débannir ».
- [ ] [modo] Ressources : approuver ou refuser.
- [ ] [modo] L'onglet `users` renvoie vers `/membres`.

## 16. Administration `/administration`

- [ ] [admin] `general` : lien d'invitation Discord.
- [ ] [admin] `roles` : créer, supprimer et réordonner les rôles par glisser-déposer.
- [ ] [admin] `coachs` : chercher un coach, changer son rôle.
- [ ] [admin] `structure` : catégories, forums et sous-forums : créer, modifier, supprimer, indenter ou désindenter, rôle minimum d'accès, glisser-déposer.
- [ ] [admin] `reference` : données de référence (clé, libellé, groupe, ordre) : créer, éditer, supprimer.
- [ ] [admin] `howtoplay` : textes des 6 sections de `/jouer`.
- [ ] [admin] `info-mails` : objet et message BBCode, confirmation « Oui, diffuser », écran « Diffusion terminée ».
- [ ] [SA] `reset` : remise à zéro, protégée par la saisie de « JE COMPRENDS LES RISQUES ».

---

## 17. Ce qui n'existe pas aujourd'hui

La refonte ne les ajoute pas sans une carte dédiée :
- sondages ;
- pièces jointes autres que des images hébergées chez ImgBB ;
- brouillons et sauvegarde automatique ;
- fusion ou scission de sujets ;
- marquer un seul forum comme lu ;
- notifications sur le site pour les mentions (seulement des courriels) ;
- compteur de non-lus du forum dans la navigation ;
- coller ou glisser-déposer une image dans l'éditeur ;
- Markdown (le site utilise uniquement le BBCode) ;
- recherche globale sur tout le site ;
- sélecteur de thème rapide. La refonte en ajoute un dans le panneau « Plus » et le menu de compte : c'est un ajout, pas une perte.

## 18. Bugs repérés pendant l'inventaire

Ces bugs sont traités dans des cartes séparées, hors refonte. La refonte ne doit ni les corriger en passant, ni les aggraver.

- **Contrôles d'accès manquants** :
  - `moveTopic` ne vérifie pas le forum de destination ;
  - `updatePost`, `deletePost`, `togglePostReaction` et `markTopicAsRead` ignorent `forumAccess` et le verrouillage ;
  - `markAllTopicsAsRead` ignore les filtres (sujets archivés et inaccessibles).
- **Liens cassés dans le forum** :
  - le lien d'un résultat de `/forum/search` n'atteint pas le message (il manque `post-` et `?page=`) ; *corrigé par la carte 104, vérifié par `forum-recherche.spec.ts` (carte 088)* ;
  - une citation faite depuis `/reply` n'a pas de pseudo.
- **Liens morts sur le site** :
  - `/profile/${id}` dans la messagerie ;
  - `/profile?id=` sur la page d'un article ; *ces deux liens ont été corrigés par la carte 105 (vérifié par la carte 092). Il en reste un : le classement d'un tournoi (`TournamentResultWidget`) mène encore à `/profile/${id}`, une page qui n'existe pas* ;
  - `?ligueId=` n'est pas lu par `/tournois` ; *corrigé par la carte 105, vérifié par `tournois.spec.ts` (carte 089)* ;
  - `/media` n'a aucun lien d'entrée.
- **Mauvais écran de connexion** : `/administration`, `/moderation`, `/profile` et `/spy` renvoient vers `/api/auth/signin` au lieu de `/auth/login`.
- **Fenêtres du navigateur** : il reste des `alert()` à la place des notifications du site.
- **Rôle affiché en code brut** : par exemple `MODERATOR`, au lieu de son libellé. *Corrigé dans le forum (carte 108), puis dans le profil, la liste des bloqués et l'annuaire (carte 092).*
