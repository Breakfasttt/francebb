# Essais à la main

Ce fichier est la liste unique des essais à faire à la main sur le projet. Il rassemble tout ce que les tests automatiques ne peuvent pas vérifier à la place d'une vraie personne : le comportement du clavier d'un téléphone, la zone protégée de l'iPhone (la bande en bas de l'écran réservée au geste de retour à l'accueil, voir `docs/GLOSSAIRE.md`), la fluidité du défilement, l'aspect des cinq thèmes, le confort de lecture, la connexion avec de vrais comptes Discord ou Google, les vrais e-mails et les contrôles à faire en production, c'est-à-dire sur le site en ligne.

Les sections 1 à 20 viennent de la fin de la refonte visuelle (carte 114) : elles sont tirées des cartes de l'épic E08 (cartes 075 à 101) et des lignes de `docs/refonte/inventaire.md` qu'aucun test n'a pu cocher. La section 22 rassemble les essais demandés par les cartes suivantes. Une ligne venue d'une carte porte son numéro entre parenthèses, pour retrouver le détail. Quand une nouvelle carte demande un essai à la main, il est ajouté à ce fichier.

**Comment la dérouler.**
- Préparer quatre comptes : un visiteur (navigation privée, sans être connecté), un membre ordinaire, un modérateur et un administrateur. Le super administrateur (le compte du responsable du site) sert pour les essais de la section « Administration ».
- Utiliser un téléphone Android et, si possible, un iPhone, plus un ordinateur. Chaque ligne précise l'appareil où l'essai a de la valeur ; « téléphone » veut dire Android et iPhone. Les lignes marquées « iPhone » ne se vérifient que sur ce téléphone, à cause de sa zone protégée et de son clavier.
- Suivre l'ordre des sections : la coquille (barre du haut, barre du bas, panneau « Plus ») et les thèmes d'abord, puis les écrans, du plus fréquent au plus rare.
- Refaire quelques essais en position horizontale du téléphone, surtout pour les écrans de rédaction et BBScheme.
- Cocher la case quand le résultat attendu est obtenu. Sinon, laisser la case vide et noter à côté l'appareil, le compte, le thème et ce qui s'est passé (une capture d'écran aide beaucoup).
- Un problème trouvé est d'abord noté à côté de la ligne. Ensuite, s'il est petit, il est corrigé directement ; s'il demande un vrai chantier, il devient une carte du kanban. Avant de noter, relire la section 21 : le problème est peut-être déjà en carte.
- Aucune ligne ne demande d'effacer des données réelles. Quand un essai touche une suppression ou un envoi à tous les membres, il se limite à ouvrir la fenêtre puis à l'annuler, ou se fait sur des données d'essai.

Les rôles sont ceux de `docs/refonte/inventaire.md` : visiteur, membre, modérateur, administrateur, super administrateur.

## 1. Coquille et navigation

- [ ] **Téléphone, visiteur.** La barre du bas affiche cinq onglets (Accueil, Forum, Tournois, Messages, Plus) lisibles sans zoom, chacun se touche facilement au pouce, et la barre du haut ne montre que le retour, le logo et le bouton « Connexion ».
- [ ] **Téléphone, membre.** L'onglet Messages porte une pastille avec le nombre de messages non lus, et elle disparaît une fois les messages lus.
- [ ] **Téléphone, modérateur.** L'onglet Plus porte une pastille de modération quand il y a des éléments à traiter.
- [ ] **Téléphone, membre.** Le panneau « Plus » s'ouvre par le bas et montre le profil, le choix du thème (les 5 thèmes), les autres rubriques, les liens du pied de page et « Déconnexion ». Tout se lit sans zoom, se ferme facilement et défile jusqu'au dernier lien.
- [ ] **Téléphone, visiteur.** Le panneau « Plus » propose la connexion à la place du profil et ne montre ni Modération ni Administration.
- [ ] **Téléphone, administrateur.** Le panneau « Plus » montre Modération et Administration avec leur pastille.
- [ ] **Android, membre.** Toucher une zone de saisie fait disparaître la barre du bas pour laisser la place au clavier ; fermer le clavier la fait revenir, sans que la page saute.
- [ ] **iPhone, membre.** Même essai : la barre du bas disparaît quand le clavier s'ouvre, revient à sa fermeture, et rien ne passe sous la bande de l'iPhone en bas de l'écran.
- [ ] **Téléphone, membre.** Un bouton « Envoyer » ou « Enregistrer » touché juste après avoir tapé du texte atteint bien le bouton visé (la barre ne se glisse pas sous le doigt).
- [ ] **Téléphone, visiteur (navigation privée).** Au premier passage, le bandeau des cookies apparaît au-dessus de la barre du bas ; la page défile jusqu'à son dernier bouton sans qu'il soit caché ; « Accepter » et la croix fonctionnent, et le bandeau ne revient pas.
- [ ] **Téléphone, modérateur.** Enregistrer un réglage dans la modération ou l'administration affiche la notification au-dessus de la barre du bas, et on peut encore défiler jusqu'au dernier bouton.
- [ ] **Téléphone, membre.** Le logo de la barre du haut (hors accueil) s'atteint facilement au pouce, et les libellés de la barre du bas sont lisibles.
- [ ] **Ordinateur, visiteur.** La barre du haut propose Accueil, Forum, Tournois, Ligues, Articles et Ressources, plus un menu « Plus » pour le reste ; les boutons « Thème » et « Connexion » sont présents.
- [ ] **Ordinateur, membre.** Le menu du compte propose Mon profil, Réglages, Changer de thème et Déconnexion ; Messagerie et Modération ont leur pastille, Administration son icône.
- [ ] **Tous appareils, membre.** Recharger plusieurs pages avec le thème NAF puis avec le thème Sombre : pas d'éclair d'une autre couleur avant le bon thème.
- [ ] **Téléphone, membre.** Sur le profil (onglet « Modifier »), dans le formulaire d'une ligue et dans la réponse rapide d'un sujet, écrire un texte puis appuyer directement sur le bouton d'envoi, sans fermer le clavier : l'envoi part du premier coup. Si l'appui rate encore, essayer une valeur plus grande de `TYPING_RELEASE_DELAY_MS`, par exemple 500 (carte 113).
- [ ] **Téléphone, membre.** Le panneau « Plus » range ses rubriques dans les groupes Débuter, Jouer en compétition et La communauté (avec l'annuaire des membres), met en évidence la rubrique en cours, et place « Déconnexion » dans un bloc à part, avant le pied de page (carte 189).
- [ ] **Téléphone, membre.** Un seul onglet de la barre du bas est allumé à la fois : « Plus » s'allume quand son panneau est ouvert ou quand la page en cours y est rangée (profil, modération, mentions légales…) (carte 189).

## 2. Bandeau « Nouveau look » et changement de thème

Pour ces lignes, utiliser un membre dont l'ancien thème, d'avant la bascule vers le thème par défaut (aujourd'hui Sombre), a été conservé (le bandeau n'apparaît que dans ce cas).

- [ ] **Téléphone, membre.** Le bandeau « Nouveau look » apparaît en haut de la page avec « Revenir à l'ancien thème » et « Garder le nouveau look » ; le texte est lisible et les deux boutons font au moins 44 pixels de haut.
- [ ] **Ordinateur, membre.** Même contrôle du bandeau, sans débordement.
- [ ] **Téléphone, membre.** « Revenir à l'ancien thème » applique tout de suite l'ancien thème, qui reste après un rechargement puis après une déconnexion suivie d'une reconnexion.
- [ ] **Téléphone, membre.** « Garder le nouveau look » fait disparaître le bandeau, qui ne revient pas aux visites suivantes.
- [ ] **Téléphone, membre.** Changer de thème depuis le panneau « Plus » prend effet immédiatement, et le choix se retrouve ensuite dans « Modifier mon profil ».
- [ ] **Ordinateur, membre.** Changer de thème depuis le menu du compte prend effet immédiatement et se garde au rechargement.
- [ ] **Ordinateur, visiteur.** Le bouton « Thème » change l'aspect du site et le thème choisi revient au rechargement (un très court éclair du thème par défaut est possible pour un visiteur, il est déjà en carte, voir la section 21).

## 3. Les cinq thèmes

Depuis la carte 218, le site a cinq thèmes : Sombre (le thème par défaut, identifiant `vestiaire`), Saison 3, NAF, Néhékhara et Violet. Pour chacun, parcourir les cinq écrans suivants, sur téléphone puis sur ordinateur : l'accueil, la liste d'un forum, la page d'un sujet, l'éditeur d'une réponse et la fenêtre d'un signalement.

- [ ] **Sombre, téléphone et ordinateur, membre.** Les cinq écrans sont lisibles, rien ne déborde, les boutons ressortent clairement, aucun texte n'est gris sur gris ; les cartes en verre dépoli (fond translucide et flouté) restent fluides au défilement sur téléphone.
- [ ] **Saison 3, téléphone et ordinateur, membre.** Fond en léger dégradé, titres sans trait vertical ni bleu marine imposé, textes lisibles.
- [ ] **NAF, téléphone et ordinateur, membre.** Même contrôle de lisibilité et de contraste ; les couleurs rappellent bien celles de la NAF.
- [ ] **Néhékhara, téléphone et ordinateur, membre.** Même contrôle de lisibilité et de contraste.
- [ ] **Violet, téléphone et ordinateur, membre.** Même contrôle de lisibilité et de contraste ; boutons et liens reconnaissables.
- [ ] **Tous appareils, membre.** Choisir chacun des cinq thèmes l'un après l'autre : chacun s'applique et se garde au rechargement (carte 218).
- [ ] **Tous appareils, membre.** Un compte qui avait choisi un thème retiré (par exemple l'ancien Clair ou Blood) arrive sur Sombre, sans erreur (carte 218).
- [ ] **Ordinateur, membre, chaque thème.** Dans un message, un spoiler, un accordéon, une citation, un tableau et une galerie sont lisibles (texte visible, bordures visibles).
- [ ] **Téléphone, membre, thèmes Sombre et Violet.** La barre du bas, le panneau « Plus » et le bandeau des cookies restent lisibles et se distinguent du fond de la page.
- [ ] **Tous appareils, chaque thème.** Après un changement de thème en cours de navigation, aucun élément ne garde les couleurs de l'ancien thème (cartes, boutons, menus, fenêtres, notifications).

## 4. Accueil, `/jouer`, `/media` et pages fixes

- [ ] **Téléphone, visiteur.** L'accueil « feuille de match » : le titre dans l'en-but, puis les deux camps « Tu joues déjà » et « Tu découvres » l'un sous l'autre, séparés par la ligne de mêlée « contre ». Rien ne déborde, aucun texte n'est posé directement sur le quadrillage du terrain.
- [ ] **Téléphone, visiteur.** « Aller au forum » est le bouton le plus visible ; Discord est à côté, moins voyant (et absent si l'invitation n'est pas réglée dans l'administration).
- [ ] **Téléphone, visiteur.** Dans une rubrique, toucher « Créer » sans être connecté mène à la connexion ; après connexion, on arrive sur le formulaire de création.
- [ ] **Téléphone, membre.** L'accueil du membre, de haut en bas : le forum avec le bouton « Forum » (« Non lus au forum », ou « Derniers sujets du forum » quand tout est lu), les prochains tournois (« Tu es inscrit » sur un tournoi où il l'est), le classement de l'année, « Ligues de ta région » (ou « Dernières ligues » sans région au profil), l'article au hasard, les ressources, les médias.
- [ ] **Téléphone, membre.** Toucher un sujet non lu, un tournoi, une ligue et l'article depuis l'accueil ouvre chaque fois la bonne page.
- [ ] **Ordinateur, visiteur.** Le terrain est couché : les deux camps côte à côte de part et d'autre d'une ligne de mêlée verticale, puis tournois, derniers messages et article en trois colonnes. Pas de grand vide.
- [ ] **Ordinateur, membre.** Une colonne centrée ; à droite, les repères suivent le défilement (le bloc en cours allumé, le trait se remplit) et un clic sur un repère descend au bloc, sans qu'il passe sous la barre du haut. La petite carte des ligues s'affiche quand on arrive au bloc.
- [ ] **Téléphone, visiteur.** `/jouer` : faire défiler la page puis toucher « Prochaine étape » ; la section suivante s'affiche sous la barre du haut, sans être cachée par elle.
- [ ] **Téléphone, visiteur.** Dans `/jouer`, ouvrir un spoiler ou un accordéon s'il y en a dans le texte : il s'ouvre et se referme.
- [ ] **Téléphone, membre.** `/media` (depuis le panneau « Plus ») : lancer un direct Twitch et une vidéo YouTube, passer en plein écran, toucher « Voir sur Twitch ».
- [ ] **Téléphone, visiteur.** `/statistiques` s'affiche lisiblement, sans défilement horizontal.
- [ ] **Téléphone, visiteur.** Une adresse qui n'existe pas (par exemple `/nimportequoi`) affiche une page 404 claire.
- [ ] **Téléphone, visiteur.** Les mentions légales et les liens du pied de page (dans le panneau « Plus ») s'ouvrent et se lisent.
- [ ] **Téléphone, super administrateur.** La console d'administration s'affiche sans déborder.

## 5. Connexion et inscription

- [ ] **Téléphone, visiteur.** Ouvrir une page réservée (par exemple un message privé) renvoie à la connexion ; après connexion avec Discord, puis avec Google, puis avec un lien magique (lien de connexion reçu par courriel), on revient à la page demandée.
- [ ] **Téléphone, visiteur.** Ouvrir un lien magique déjà utilisé affiche une page d'erreur propre.
- [ ] **Téléphone, nouveau compte.** L'inscription : remplir le formulaire, ouvrir le générateur d'avatar (le panneau monte du bas et le clavier ne cache pas le champ « Graine »), envoyer une vraie image depuis la galerie du téléphone, chercher une ligue, en ajouter une libre, changer de thème, valider.
- [ ] **iPhone, nouveau compte.** Même inscription : aucune zone coupée par la bande de l'iPhone.
- [ ] **Ordinateur, nouveau compte.** L'inscription complète fonctionne et le thème choisi s'applique à la fin.
- [ ] **Tous appareils, visiteur.** Les connexions Discord et Google ouvrent leur écran d'autorisation et reviennent sur le site (essai avec de vrais comptes).

Les trois essais suivants se font avec le site branché sur le hub, le service de connexion commun aux applications FranceBB (réglage `AUTH_MODE="hub"` ; la préparation est décrite dans la carte 115). Le hub doit rester invisible : le coach ne voit jamais son écran.

- [ ] **Ordinateur, visiteur, navigation privée.** L'écran de connexion montre Discord, Google et e-mail, sans bouton « Compte FranceBB ». Saisir une adresse, ouvrir le lien reçu dans la même fenêtre : on arrive sur le site connecté, sans voir d'écran du hub (au plus un court « Redirection… »). Rouvrir le même lien : un message d'erreur clair, sans boucle de redirection (cartes 073 et 115).
- [ ] **Ordinateur, visiteur, navigation privée.** Le bouton Discord mène directement à l'écran d'autorisation de Discord, puis on revient sur le site connecté, sans écran du hub entre les deux ; se déconnecter et refaire l'essai avec Google (cartes 073 et 115).
- [ ] **Ordinateur, administrateur et compte d'essai.** Connecté avec un compte d'essai dans une fenêtre, le bannir depuis l'administration dans une autre fenêtre : à la page suivante, le compte banni arrive sur `/banned`, sans attendre (carte 115).

## 6. Forum : accueil, listes de sujets, non lus

- [ ] **Téléphone, membre.** L'accueil du forum : les catégories sont des cartes repliables (toucher l'en-tête les ouvre et les ferme) ; chaque forum affiche son icône, son nom, sa description, son dernier sujet et son nombre de sujets.
- [ ] **Téléphone, membre.** Un forum qui contient du non-lu est mis en valeur (nom en gras, point bleu), y compris quand le non-lu est dans un sous-forum ; un forum verrouillé montre son cadenas.
- [ ] **Téléphone, membre.** Le bandeau « N sujets non lus » mène à la liste des sujets non lus.
- [ ] **Téléphone, membre.** Un forum de tournoi a son trophée ; un forum sans sujet affiche « Aucun sujet ».
- [ ] **Téléphone, membre.** La page d'un forum : fil d'Ariane, sous-forums en lignes, sujets en lignes avec avatar, titre, épinglé, badge de tournoi (« Annulé », « Terminé », « Passé »), cadenas, auteur, date, messages, vues et dernière activité ; tout est lisible sans zoom.
- [ ] **Téléphone, membre.** « Nouveau sujet » et « Nouveau tournoi » sont visibles en haut de la liste ; dans un forum verrouillé, le bouton grisé « Forum verrouillé » s'affiche à la place.
- [ ] **Téléphone, membre.** Le bloc « Outils du forum », sous la liste des sujets, contient la recherche avancée, les membres, les non-lus, « Tout marquer comme lu » et, pour un modérateur, l'administration du forum.
- [ ] **Téléphone, membre.** La pagination de la liste fonctionne et se trouve en bas de la liste.
- [ ] **Ordinateur, membre.** La page d'un forum montre des colonnes de chiffres et une colonne d'actions à droite qui reste visible pendant le défilement.
- [ ] **Téléphone, membre.** La liste des sujets non lus : la coche « Marquer ce sujet comme lu » (44 pixels) fonctionne, « Tout marquer comme lu » vide la liste, puis « Vous êtes à jour » s'affiche.
- [ ] **Téléphone, membre.** Dans la liste des non-lus, chaque ligne montre le trophée pour un tournoi, le forum, l'auteur, le nombre de messages et la date du dernier message.

## 7. Forum : page d'un sujet

- [ ] **Téléphone, membre.** L'en-tête du sujet : titre en grand, badge « ARCHIVÉ » pour un sujet archivé, nom du forum cliquable, bouton retour dans la barre du haut et bouton « Outils du sujet ».
- [ ] **Téléphone, membre.** Chaque message : avatar avec son cadre de rang (bronze à grand maître selon le nombre de messages de l'auteur), pseudo, badge de rang, puis une ligne « rôle · date · numéro » ; le texte se lit sans zoom et la largeur de ligne reste confortable.
- [ ] **Ordinateur, membre.** Même contrôle : le cadre de rang de l'avatar est bien visible, et les messages d'un auteur banni ont le style « banni ».
- [ ] **Téléphone, membre.** Toucher l'avatar ou le pseudo ouvre la fiche coach (statistiques, NAF avec lien, équipe, région, ligues) avec les boutons « Profil » et « MP » ; pour un coach sans statistiques, « Ce coach n'a pas renseigné de statistiques. » s'affiche.
- [ ] **Téléphone, membre.** « MP » dans la fiche coach ouvre directement la conversation avec ce coach.
- [ ] **Téléphone, membre.** Le menu « ⋯ » d'un message propose partager (notification « Lien copié ! »), signaler, marquer comme non lu à partir d'ici et, selon le compte, modifier, supprimer (avec confirmation), modérer ou restaurer.
- [ ] **Téléphone, membre.** Ajouter une réaction puis la retirer fonctionne.
- [ ] **Téléphone, membre.** « Citer » ajoute la citation à la fin de la réponse rapide, sans faire défiler la page ; la notification « Citation ajoutée » propose « Voir ma réponse », qui y mène (carte 183).
- [ ] **Téléphone, membre.** Un message supprimé, un auteur bloqué ou banni (« Afficher le message », « AFFICHAGE TEMPORAIRE », « Masquer à nouveau ») et un message modéré s'affichent correctement.
- [ ] **Téléphone, membre.** Sur une page suivante d'un sujet de tournoi, le premier message est mis en valeur (bordure d'accent et badge « Premier message »).
- [ ] **Téléphone, membre.** Publier une réponse : le nouveau message apparaît avec une brève animation et la page reste fluide.
- [ ] **Téléphone, membre.** Le panneau « Outils du sujet » donne les outils du sujet, de la gestion du tournoi et de la modération, et chaque outil fonctionne.
- [ ] **Téléphone, membre.** La barre collée en bas, au-dessus de la barre du bas, affiche la pagination compacte et « Répondre » ; elle s'efface pendant la saisie et quand la zone de réponse est visible ; sur un écran étroit (moins de 375 pixels de large), « Répondre » n'affiche que son icône.
- [ ] **iPhone, membre.** Taper dans la réponse rapide, fermer le clavier puis toucher « Envoyer ma réponse » : l'appui atteint bien le bouton (la barre ne se glisse pas dessous).
- [ ] **Ordinateur, membre.** Les outils du sujet forment une colonne de cartes à droite, collée en haut de l'écran, qui défile pour elle-même si elle est plus haute que l'écran ; la pagination est en haut et en bas de la liste.
- [ ] **Téléphone, membre.** Sur un sujet verrouillé, l'encart « Sujet verrouillé » remplace la zone de réponse.
- [ ] **Téléphone, modérateur.** Modérer un message puis le restaurer, déplacer le sujet, modifier son titre avec un smiley : chaque fenêtre s'affiche au-dessus de la barre du bas.
- [ ] **Téléphone, membre.** Un message avec spoiler, accordéon, citation, tableau et galerie s'affiche bien, et les balises de mise en forme courantes (gras, couleurs, tailles, listes, vidéos, images) sont rendues correctement.

## 8. Éditeur de messages

- [ ] **Android, membre.** Ouvrir « Répondre » en plein écran : la barre d'outils (gras, italique, lien, image, smileys, « + ») reste visible en haut et la barre d'envoi reste visible juste au-dessus du clavier ouvert.
- [ ] **iPhone, membre.** Même essai : avec le clavier ouvert, le curseur reste visible, la barre d'outils et la barre d'envoi sont atteignables, et rien ne passe sous la bande de l'iPhone.
- [ ] **Téléphone, membre.** Écrire un long message de plusieurs écrans : la zone de texte grandit, la page défile et le curseur reste au-dessus du clavier.
- [ ] **Téléphone, membre.** Le panneau « + » (« Plus d'outils de mise en forme ») range les outils en rubriques Texte, Blocs, Liens et médias ; le spoiler s'y trouve sur un écran étroit ; chaque outil insère le bon code.
- [ ] **Téléphone, membre.** Les formulaires des outils (lien, image, vidéo, couleur) montent du bas ; leurs champs se lisent et se touchent facilement, et le clavier ne les cache pas.
- [ ] **Téléphone, membre.** L'aperçu prend la place de la zone de texte, montre le rendu correct, et on revient à la saisie sans perdre le texte.
- [ ] **Ordinateur, membre.** L'aperçu s'affiche sous la zone de texte ; les formulaires d'outils s'ouvrent sous la barre ; la touche Échap ferme l'outil ouvert.
- [ ] **Téléphone et ordinateur, membre.** L'assistant IA génère un texte de consigne, le bouton de copie fonctionne, et chacun des trois boutons (Gemini, Claude, ChatGPT) ouvre bien l'outil dans un nouvel onglet.
- [ ] **Téléphone, membre.** La grille des smileys a des cases faciles à toucher ; le smiley s'insère à l'endroit du curseur, y compris dans le titre d'un nouveau sujet.
- [ ] **Téléphone, membre.** Nouveau sujet : le titre avec smiley et aperçu en direct, puis le message, les cases de modération sous le message et les boutons dans la barre du bas.
- [ ] **Ordinateur, modérateur.** Nouveau sujet : la colonne « Publication » à droite contient les cases de modération, « Créer le sujet » et « Annuler ».
- [ ] **Téléphone, membre.** Modifier un de ses messages : le rappel des derniers messages montre des cartes compactes, et le message modifié est grisé avec une bordure en pointillés et la mention « (Ce message) ».
- [ ] **Téléphone, membre.** Les écrans de rédaction n'ont pas de barre du bas, le bouton retour est dans la barre du haut, et le fil d'Ariane n'est visible que sur ordinateur.
- [ ] **Téléphone, membre.** L'éditeur refait apparaît aussi dans les articles, la messagerie, les ligues, la signature du profil, l'inscription et l'administration : chacun s'ouvre, s'utilise et se lit correctement.
- [ ] **Téléphone, organisateur.** Dans le formulaire de tournoi et la fenêtre « Modifier le titre », la grille des smileys et le champ du titre s'affichent correctement.

## 9. Recherche et création de forum

- [ ] **Téléphone, membre.** `/forum/search` : taper un mot et lancer la recherche avec la touche Entrée du clavier ; le bouton de recherche est réduit à la loupe.
- [ ] **Téléphone, membre.** Ouvrir « Filtres », changer le forum et la période, lancer depuis le panneau ; les pastilles des filtres actifs s'affichent, et en retirer une relance la recherche.
- [ ] **Téléphone, membre.** Parcourir les pages de résultats puis ouvrir un résultat : on arrive sur le bon message du bon sujet.
- [ ] **Téléphone, membre.** Sans mot-clé, l'extrait d'un résultat est le début du message en texte simple, et le bouton « Voir » reste à droite de chaque ligne.
- [ ] **Ordinateur, membre.** Les filtres sont affichés en ligne, sans panneau, et tiennent sur la largeur.
- [ ] **Téléphone, membre.** Rechercher un message qui contient du texte ressemblant à du code HTML : l'extrait l'affiche tel quel, comme du texte, et rien ne s'exécute.
- [ ] **Téléphone, modérateur.** Créer un forum : choisir une catégorie puis un forum parent ; la liste « Insérer après » suit ce choix.
- [ ] **Téléphone, membre.** Signaler un message (menu « ⋯ ») et un sujet (panneau « Outils du sujet »), avec le clavier ouvert dans « Précisions » : la fenêtre passe au-dessus de la barre du bas et le bouton d'envoi reste atteignable.

## 10. Tournois

- [ ] **Téléphone, visiteur.** `/tournois` : taper un nom, ouvrir « Filtres », choisir une région puis un département, cocher un circuit, fermer avec « Voir N tournois », retirer une pastille, changer le tri, passer en liste, aller à la page 2.
- [ ] **Ordinateur, visiteur.** Les filtres s'affichent en ligne, et le passage entre carte, liste et tri fonctionne.
- [ ] **Téléphone, membre.** Sujet d'un tournoi : se pré-inscrire puis annuler la pré-inscription.
- [ ] **Téléphone, membre.** Sur un tournoi par équipes, inscrire une équipe en cochant un coéquipier parmi les mercenaires (carte 186), la modifier, ouvrir ses détails, la désinscrire.
- [ ] **Téléphone, organisateur.** Déplier les inscriptions, changer un paiement, valider un inscrit (sur un tournoi d'essai).
- [ ] **Téléphone, membre.** Créer un tournoi d'essai : remplir chaque bloc, ouvrir « Choisir sur la carte », chercher une adresse, déplacer le repère, valider ; « Publier » se touche depuis la barre du bas.
- [ ] **Téléphone, organisateur.** Saisie des résultats d'un tournoi d'essai : importer un fichier NAF depuis le téléphone, réordonner deux coachs avec la poignée, ajouter une ronde et un match, publier.
- [ ] **Téléphone, organisateur.** « Vider les résultats » : ouvrir la confirmation puis « Annuler » (ne pas confirmer sur un tournoi réel).
- [ ] **Téléphone, membre.** Le classement d'un tournoi publié se lit sans défilement horizontal.

## 11. Profil et membres

- [ ] **Téléphone, membre.** `/profile` : passer d'un onglet à l'autre en faisant défiler la rangée d'onglets ; aller à la page 2 des sujets suivis.
- [ ] **Téléphone, membre.** « Modifier mon profil » (bouton sous la carte du membre) : « Générer » (le clavier ne cache pas le champ « Graine »), « Aléatoire », envoyer une vraie image, changer de contour, ajouter une ligue, changer de thème, puis « Sauvegarder le profil ».
- [ ] **iPhone, membre.** Même édition : le panneau d'avatar monte du bas sans passer sous la bande de l'iPhone.
- [ ] **Téléphone, membre.** « Réglages du compte » (bouton sous la carte du membre) : basculer un interrupteur de notification (il garde sa position après rechargement), délier puis réassocier Discord ou Google.
- [ ] **Téléphone, membre.** Profil d'un autre membre : bloquer puis débloquer, signaler.
- [ ] **Téléphone, modérateur.** Profil d'un membre d'essai : bannir puis débannir.
- [ ] **Téléphone, membre.** `/membres` : chercher un nom, ouvrir « Filtres », choisir une région et « Nom (Z-A) », retirer une pastille.
- [ ] **Téléphone, modérateur.** `/membres` : ouvrir le menu « ⋯ » d'un membre d'essai et changer son rôle, puis le remettre.
- [ ] **Ordinateur, membre.** Le profil et l'annuaire des membres utilisent bien la largeur de l'écran, sans colonnes vides.

## 12. Messagerie

- [ ] **Android, membre.** Ouvrir une conversation depuis la liste puis toucher la zone de texte : le clavier s'ouvre, la zone de saisie et « Envoyer » restent visibles juste au-dessus, et l'en-tête reste en haut.
- [ ] **iPhone, membre.** Même essai : la page derrière la conversation ne défile pas et rien ne passe sous la bande de l'iPhone.
- [ ] **Téléphone, membre.** Écrire et envoyer un message, puis revenir à la liste avec la flèche.
- [ ] **Téléphone, membre.** Faire défiler un long fil ; recevoir un message pendant la lecture (envoyé depuis un second compte) : il apparaît en dix secondes au plus.
- [ ] **Téléphone, membre.** « Nouvelle conversation » : chercher un coach (le champ de recherche reste au-dessus du clavier), le choisir, démarrer ; puis créer un groupe avec un titre.
- [ ] **Téléphone, membre.** Dans un groupe : « Participants », menu « ⋯ » puis « Ajouter des participants », « Renommer le groupe », « Quitter la conversation ».
- [ ] **Téléphone, membre.** Le lien « MP » d'un message du forum ou d'un profil ouvre directement la conversation.
- [ ] **Ordinateur, membre.** La liste des conversations et le fil s'affichent côte à côte, et un message avec spoiler, citation, tableau ou galerie se lit bien.

## 13. Ligues et carte

- [ ] **Téléphone, visiteur.** `/ligues` : chercher un nom, ouvrir « Filtres », choisir une zone, retirer la pastille, passer en liste, aller à la page 2.
- [ ] **Téléphone, membre.** Fiche d'une ligue : ouvrir « ⋯ » et signaler.
- [ ] **Téléphone, chef de ligue.** « Transférer la propriété » : le clavier ouvert ne cache pas la liste des coachs trouvés ; ensuite « Annuler » (ne pas transférer une vraie ligue).
- [ ] **Téléphone, membre.** « Créer une ligue » d'essai : remplir chaque bloc, envoyer un vrai blason, « Choisir sur la carte », chercher une adresse, déplacer le repère, valider, ajouter un commissaire, « Créer la ligue » depuis la barre du bas.
- [ ] **Téléphone, visiteur.** `/carte` : déplacer et zoomer la carte au doigt, passer de « Tournois » à « Ligues », toucher un repère puis « Détails ».
- [ ] **iPhone, visiteur.** `/carte` : passer en plein écran et en sortir ; rien ne passe sous la bande de l'iPhone.
- [ ] **Ordinateur, visiteur.** `/carte` et `/ligues` : la carte et la liste tiennent dans l'écran, et le zoom à la molette fonctionne.

## 14. Articles

- [ ] **Téléphone, visiteur.** `/articles` : chercher un mot, ouvrir « Filtres », choisir un tag dans les suggestions, saisir un auteur, retirer une pastille, changer le tri, passer en liste, aller à la page 2.
- [ ] **Téléphone, visiteur.** Page d'un long article : la colonne de lecture est confortable, sans défilement horizontal.
- [ ] **Téléphone, membre.** « Réagir » : choisir un émoji puis le retirer ; ouvrir « ⋯ ».
- [ ] **Téléphone, modérateur.** Modérer un article puis annuler la modération.
- [ ] **Téléphone, membre.** « Créer un article » d'essai : ajouter deux tags (un suggéré, un nouveau), choisir une ligue, écrire avec la barre d'outils de l'éditeur, « Publier » depuis la barre du bas ; le clavier ne cache pas les suggestions de tags.
- [ ] **Ordinateur, membre.** Même création et lecture d'un article, avec une mise en page équilibrée.

## 15. Ressources

- [ ] **Téléphone, visiteur.** `/ressources` : chercher un mot, ouvrir « Filtres », choisir un tag dans les suggestions, retirer la pastille, passer en liste, aller à la page 2.
- [ ] **Téléphone, membre.** Ouvrir une ressource externe (elle s'ouvre dans un nouvel onglet) et un outil du site.
- [ ] **Téléphone, membre.** Sur une de ses ressources d'essai : « ⋯ », « Éditer », puis « ⋯ », « Supprimer » et « Annuler » (ne pas supprimer une vraie ressource).
- [ ] **Téléphone, membre.** « Soumettre une ressource » : remplir les champs, envoyer une image depuis la galerie du téléphone (envoi réel vers ImgBB, un service d'hébergement d'images), ajouter un tag suggéré et un nouveau, « Soumettre » depuis la barre du bas ; le clavier ne cache pas les suggestions de tags.
- [ ] **Ordinateur, modérateur.** Approuver une ressource soumise depuis `/moderation`.

## 16. Classement (CDF)

- [ ] **Téléphone, visiteur.** `/classement` : passer d'un onglet à l'autre, choisir une autre année puis une archive, déplier une ligne et ouvrir un tournoi, puis le profil d'un coach.
- [ ] **Téléphone, visiteur.** Ouvrir « Comment sont calculés les points ? » : la fenêtre se lit et se ferme.
- [ ] **Téléphone, modérateur.** « Gestion », « Archiver l'année », puis « Annuler » (ne pas archiver pour de vrai).
- [ ] **Téléphone, modérateur.** Sur une archive d'essai : « Gestion », « Modifier l'archive » ; ajouter un coach, lier un membre (son numéro NAF se remplit si le champ est vide), ouvrir le détail des tournois, « Enregistrer » depuis la barre du bas, vérifier le retour au classement et le membre lié.
- [ ] **Téléphone, administrateur.** « Importer des archives » : ouvrir la fenêtre puis annuler. Un import réel d'une année (qui appelle l'ancien site) se fait seulement avec l'accord du responsable.
- [ ] **Ordinateur, visiteur.** Les tableaux du classement tiennent dans l'écran et restent lisibles.

## 17. BBQuizz

*Sans objet depuis la carte 180 : le quiz a quitté le site et attend sa relance dans l'application `apps/bbquizz`.*

- [ ] **Téléphone, membre.** `/bbquizz` : jouer une partie entière ; la question, le chronomètre, le score et les quatre réponses tiennent dans l'écran.
- [ ] **Téléphone, membre.** Essayer les trois jokers, laisser filer le temps sur une question, attendre le passage automatique après une réponse, puis « Rejouer ».
- [ ] **Téléphone, membre.** Changer d'onglet dans le classement (« Du jour », « Semaine », « Panthéon »).
- [ ] **Téléphone, membre.** « Proposer une question » : remplir les quatre réponses, choisir la bonne, envoyer depuis la barre du bas ; le clavier ne cache pas le champ en cours.
- [ ] **Téléphone, modérateur.** « Gestion du quizz » : approuver puis rejeter une proposition ; dans « Éditer les questions », chercher, modifier, puis ouvrir la suppression avec sa confirmation et annuler.
- [ ] **Ordinateur, membre.** Une partie complète se joue à la souris, sans mise en page étirée.

## 18. Modération

- [ ] **Téléphone, modérateur.** `/moderation` : faire défiler la rangée d'onglets sans qu'aucun reste coupé ou inaccessible.
- [ ] **Téléphone, modérateur.** Ouvrir « Coachs bannis » : la liste se lit et se parcourt page par page.
- [ ] **Téléphone, modérateur.** Ouvrir les détails d'un signalement et le marquer comme traité avec un commentaire.
- [ ] **Téléphone, modérateur.** Approuver une ressource soumise.
- [ ] **Ordinateur, modérateur.** Les tableaux de modération tiennent dans l'écran et leurs actions sont atteignables.
- [ ] **Téléphone, membre.** Aucun lien vers la modération n'apparaît dans le panneau « Plus » d'un membre ordinaire.

## 19. Administration

- [ ] **Téléphone, administrateur.** `/administration?tab=roles` : faire glisser un rôle personnalisé au doigt avec la poignée à gauche ; l'ordre change et se retrouve après rechargement (remettre l'ordre d'origine ensuite).
- [ ] **Téléphone, administrateur.** `/administration?tab=structure` : faire glisser un forum au doigt, ouvrir le menu « ⋯ » d'un forum, l'indenter puis le désindenter, modifier un forum dans le panneau du bas (sur un forum d'essai).
- [ ] **Téléphone, administrateur.** Les autres onglets de l'administration s'ouvrent sans débordement ni bouton trop petit.
- [ ] **Téléphone, administrateur.** Annonces par courriel : écrire l'objet et le message, ouvrir la fenêtre « Oui, diffuser » puis l'annuler. Ne pas envoyer : l'annonce partirait à tous les membres.
- [ ] **Ordinateur, administrateur.** L'administration s'utilise à la souris : glisser-déposer, menus « ⋯ », panneaux.

## 20. BBScheme

- [ ] **Téléphone, visiteur.** `/bbscheme` : il n'y a pas de barre du bas, le terrain occupe l'écran, et la page elle-même ne bouge pas quand on touche le terrain.
- [ ] **Téléphone, visiteur.** Ouvrir « Bleue », choisir un roster, toucher un pion (le panneau se referme), puis une case : le pion se déplace.
- [ ] **Téléphone, visiteur.** Dessiner au crayon, changer l'état d'un joueur avec la baguette, annuler.
- [ ] **Android et iPhone, visiteur.** Pincer le terrain à deux doigts pour zoomer et le faire défiler d'un doigt ; la page derrière ne bouge pas.
- [ ] **Téléphone, visiteur.** « Plus d'outils » : régler le zoom et la vitesse, choisir un Star Player, « Remettre en réserve », « Partager » (le lien est copié), « Exporter en GIF » puis « Télécharger ».
- [ ] **Téléphone, visiteur.** Ajouter quelques images avec le bouton à droite du compteur, puis « Lecture » : la séquence se joue.
- [ ] **Téléphone, visiteur.** Ouvrir un lien partagé en ajoutant `&embed=true` à l'adresse : le lecteur seul remplit l'écran.
- [ ] **iPhone, visiteur.** Les barres d'outils respectent la bande de l'iPhone et restent atteignables au pouce, en position verticale et horizontale.
- [ ] **Ordinateur, visiteur.** Le terrain, les barres d'outils et le choix des rosters se manient à la souris ; la molette zoome.

## 21. Points connus, déjà en carte

Les problèmes ci-dessous sont déjà connus, et chacun a sa carte dans `kanban/a-faire/`. Inutile de les signaler une seconde fois.

**Forum et éditeur (cartes 109 à 113).**
- 109 : une page de sujet trop grande (par exemple `?page=99`) n'affiche aucun message.
- 110 : les citations de messages supprimés ou modérés restent affichées telles quelles.
- 111 : le bouton « Citer » sur un sujet verrouillé.
- 112 : taper « @ » dans un message ouvre la recherche d'un membre sans écrire le caractère lui-même.
- 113 : un appui peut tomber à côté juste après une saisie, quand la barre du bas réapparaît.

**Tournois, ligues, annuaire (cartes 129 à 138).**
- 129 : le filtre de région des tournois ne tient pas compte des accents.
- 130 : le filtre « Places restantes » des tournois.
- 131 : une ligue peut être perdue en modifiant un tournoi.
- 132 : petits défauts des pages `/jouer` et `/statistiques`.
- 133 : à la fin d'une inscription, on arrive à l'accueil au lieu de la page demandée.
- 134 : lien mort vers un coach dans les résultats d'un tournoi.
- 135 : l'annuaire des membres envoie trop de données et son filtre des rôles est incomplet.
- 136 : des participants partis d'un tournoi restent affichés.
- 137 : lien Google Maps effacé et département d'une ligue perdus ou mal gérés.
- 138 : icônes de la carte et recherche d'un membre.

**Articles, ressources, classement, quizz, modération, annonces, BBScheme, thèmes (cartes 139 à 148).**
- 139 : des articles modérés restent visibles dans la liste.
- 140 : ligue effacée, schéma et fenêtre de modération des articles.
- 141 : accès d'un visiteur aux ressources, lien et clé ImgBB.
- 142 : import en double et vue par roster du classement.
- 143 : contrôles côté serveur de BBQuizz.
- 144 : liste des bannis, journal et bouton « Ignorer » de la modération.
- 145 : annonces par courriel, envoi à rendre testable et suivi.
- 146 : bulle d'informations d'un pion de BBScheme et code mort.
- 147 : thème d'un visiteur posé trop tard, d'où un court éclair du thème par défaut.
- 148 : capture de l'accueil fragile dans les tests et retour de BBScheme.

## 22. Essais issus des cartes de novembre

Ces essais viennent des cartes terminées après la refonte. Le numéro entre parenthèses renvoie à la carte, dont la section « Résultat » donne le détail.

**Accueil.**
- [ ] **Téléphone, visiteur puis membre.** L'accueil dans deux ou trois thèmes : les boutons du haut, les liens « Créer » et les blocs se lisent sans zoom et fonctionnent (cartes 155 et 205).
- [ ] **Téléphone, membre.** Publier un message depuis un autre appareil : il arrive dans « Derniers messages » de l'accueil en moins de 30 secondes, avec son apparition en fondu (carte 205).
- [ ] **Téléphone et ordinateur, visiteur puis membre.** Sur de vraies données (production ou copie), vérifier les tournois remplis, l'article au hasard, le bouton Discord et, sur ordinateur, la petite carte des ligues de l'accueil du membre (cartes 205 et 210).
- [ ] **Ordinateur, modérateur.** Annuler un tournoi d'essai à venir, puis ouvrir l'accueil : il a quitté les prochains tournois tout de suite, sans attendre une minute (carte 202).

**Navigation, chargement et erreurs.**
- [ ] **Téléphone, membre.** Le bouton retour en haut d'un sujet du forum, d'une liste de forum et de BBScheme ramène à la bonne page ; le bloc « Outils du forum » s'affiche sous la liste d'un forum (carte 156).
- [ ] **Téléphone, membre.** Filtrer `/ressources` ou `/membres`, ouvrir un élément, revenir en arrière : la liste revient avec ses filtres. Copier l'adresse d'une liste filtrée dans un autre onglet : les mêmes filtres s'appliquent (carte 196).
- [ ] **Téléphone, membre.** Ouvrir « Mon compte » depuis le forum puis toucher le bouton retour : retour au forum. Ouvrir « Mon compte » dans un nouvel onglet : le bouton retour mène à l'accueil (carte 196).
- [ ] **Téléphone, visiteur.** Ouvrir `/carte` en plein écran puis faire le geste de retour du téléphone : le plein écran se ferme et on reste sur la carte (carte 196).
- [ ] **Téléphone, membre, connexion lente.** En touchant un lien, une fine barre colorée avance en haut de l'écran jusqu'à l'arrivée de la page suivante (carte 188).
- [ ] **Ordinateur et téléphone, poste de développement.** Arrêter la base locale puis ouvrir une page : l'écran « Match interrompu par l'orage ! » s'affiche, avec « Réessayer » et « Retour à l'accueil » de 44 pixels ; après avoir relancé la base, « Réessayer » affiche la page (carte 188).

**Forum.**
- [ ] **Téléphone et ordinateur.** Un message masqué par la modération : un visiteur lit « Le contenu de ce message a été masqué par la modération. », tandis que son auteur et un modérateur voient encore le texte ; aucun bouton « Citer » sur ce message (carte 164).
- [ ] **Téléphone, modérateur.** Supprimer un sujet d'essai : la fenêtre demande une raison, puis le modérateur voit le bandeau « Sujet supprimé » et « Restaurer le sujet ». Le menu « ⋯ » d'un message propose « Supprimer (modération) » et « Restaurer le message supprimé » (carte 165).
- [ ] **Téléphone, membre.** Commencer une réponse, passer à une autre application puis revenir, ou fermer l'onglet puis rouvrir le sujet : le texte revient avec le bandeau « Brouillon restauré · Effacer » (carte 181).
- [ ] **Téléphone, membre.** Sur un long sujet (plus de 30 pages, en production), toucher « Page N sur M » : le panneau « Choisir une page » monte du bas, liste les pages proches et propose le champ « Aller à la page », qui fonctionne (carte 182).
- [ ] **Téléphone, membre.** Sélectionner au doigt un passage d'un message : le bouton « Citer la sélection » apparaît centré en bas, au-dessus de la barre « Répondre », sans gêner le menu de sélection du téléphone ; le passage s'ajoute à la réponse (carte 183).
- [ ] **Téléphone, membre.** Dans l'outil Image de l'éditeur, « Choisir des photos » ouvre la galerie sans ouvrir le clavier ; envoyer quatre vraies photos : le bouton affiche « Envoi 2 sur 4… », puis les photos sont insérées en galerie (carte 184).
- [ ] **Téléphone, membre.** Envoyer une grande photo de l'appareil photo (plus de 4 Mo) : elle est réduite avant l'envoi et part sans erreur (carte 184).
- [ ] **Téléphone, coach.** Dans un sujet archivé, l'outil « Répondre » n'apparaît plus ; dans un sujet verrouillé, le menu « ⋯ » de son propre message ne propose plus « Modifier » ni « Supprimer ». Un modérateur garde ces actions (carte 200).
- [ ] **Téléphone, modérateur.** Depuis `/forum`, créer un forum d'essai puis le supprimer ; essayer de supprimer « Les tournois » (refus) ; dans l'administration, renommer un forum : `/forum` affiche aussitôt le nouveau nom. L'écran « Nouveau forum » n'a pas de barre du bas, et « Annuler » et « Créer le forum » restent en bas de l'écran à 360 pixels de large (cartes 196 et 199).

**Membres, avatars et profil.**
- [ ] **Téléphone, membre.** Avec le réglage « réduire les animations » du téléphone, ouvrir un sujet dont un auteur a le rang or ou plus : le cadre de l'avatar reste immobile (carte 192).
- [ ] **Téléphone, membre.** Sans ce réglage, un auteur de rang or ou diamant : la pulsation du cadre reste visible et fluide, et la liste des sujets reste lisible (carte 207).
- [ ] **Téléphone, membre.** Le bandeau « banni » d'un avatar se lit dans deux ou trois thèmes ; le liseré des avatars sans rang n'est pas trop marqué dans les thèmes sombres (carte 192).
- [ ] **Téléphone, membre.** Sur son propre profil sans numéro NAF : « Non renseigné », une phrase d'explication et le lien « Ajouter mon numéro », qui ouvre l'onglet de modification (carte 190).
- [ ] **Téléphone, membre.** Dans un sujet, la signature d'un message est repliée derrière « Voir la signature » ; dans la messagerie, le bouton retour est à gauche du titre (carte 190).
- [ ] **Téléphone, membre.** Dans l'annuaire, toucher le sigle d'une ligue mène à la page de la ligue (carte 195).
- [ ] **Téléphone, membre.** Choisir sa région dans son profil : la liste déroulante est remplie (carte 203).

**Images envoyées.**
- [ ] **Téléphone, membre.** Envoyer une photo de la galerie comme avatar (profil), comme blason (ligue), dans un message du forum et comme image d'une ressource : chaque envoi réussit (carte 141).
- [ ] **Téléphone, membre.** Envoyer comme avatar une image de plus de 4 Mo (pas une photo, qui serait réduite) : le message « L'image est trop lourde » s'affiche (carte 141).
- [ ] **Téléphone, visiteur.** Ouvrir `/ressources/submit` sans être connecté : on arrive sur la page de connexion, et après connexion sur le formulaire (carte 141).

**Formulaires et réactions.**
- [ ] **Ordinateur, membre, connexion ralentie** (outils du navigateur, « 3G lente »). Créer un sujet puis un tournoi d'essai en appuyant deux fois de suite sur « Publier » : un seul envoi, bouton grisé avec indicateur de chargement. Même essai sur les boutons de la page de connexion (carte 193).
- [ ] **Téléphone, membre, 360 pixels de large.** Publier un article sans titre ni contenu, signaler un message sans raison, supprimer un sujet sans raison (modérateur) : l'erreur apparaît sous le champ, sans pousser les boutons hors de l'écran (carte 194).
- [ ] **Téléphone, membre, lecteur d'écran** (TalkBack sur Android, VoiceOver sur iPhone). Un champ en erreur est annoncé « invalide » avec son explication (carte 194).
- [ ] **Téléphone, membre, 360 pixels de large.** Réagir à un message du forum : le choix d'émojis monte du bas et se ferme d'un geste. Sous un article, « Voir qui a réagi » liste les membres par émoji (carte 195).
- [ ] **Ordinateur, membre, deux thèmes.** Parcourir un menu « ⋯ » au clavier : l'élément choisi est entouré d'un contour visible, et le choix d'émojis du forum se ferme avec Échap (carte 195).
- [ ] **Téléphone, membre, 360 pixels de large.** Ouvrir une recherche de ligue ou de membre dans un formulaire, puis dans une fenêtre : la liste des résultats passe au-dessus de tout le reste. Ouvrir la carte en plein écran et une conversation : rien ne passe par-dessus (carte 197).
- [ ] **Téléphone et ordinateur, membre, chaque thème.** Un bouton « danger » (suppression) se lit bien ; l'en-tête des pages des articles, des ligues et des ressources est bien aligné (carte 197).

**Tournois.**
- [ ] **Téléphone, modérateur.** Sur un tournoi CDF terminé, le bloc « Résultats du tournoi » montre « Résultats en attente de validation par la modération » et le bouton de validation sur toute la largeur ; valider, puis retirer la validation (carte 162).
- [ ] **Téléphone, organisateur.** Modifier un tournoi d'essai sans toucher à l'édition du jeu : elle reste « BB2025 ». Devenir mercenaire puis se retirer (carte 201).
- [ ] **Téléphone, coach inscrit.** Essayer de terminer un tournoi dont on n'est pas l'organisateur, par l'outil du sujet : le refus est affiché (carte 201).
- [ ] **Téléphone, membre.** Ouvrir la création et la modification d'un tournoi et d'une ligue : toutes les listes déroulantes sont remplies ; filtrer `/tournois` par région (carte 203).

**Modération et notifications.**
- [ ] **Téléphone, modérateur.** Dans `/moderation`, la fiche d'un message signalé se lit (type, raison, auteur du signalement, date, extrait) ; « Voir dans le sujet » ouvre le bon message dans le même onglet ; « Masquer » ferme le signalement ; un contenu déjà supprimé affiche « Contenu déjà supprimé » et « Fermer le signalement » (carte 168).
- [ ] **Avec un vrai envoi d'e-mails.** Une réponse dans un sujet suivi et un premier message privé non lu envoient bien un e-mail lisible ; une mention n'en envoie plus (carte 167).

**Outils du développeur.**
- [ ] **Téléphone, poste de développement.** Le bouton « Dev Auth » de la barre du haut ouvre la liste des comptes de test, et changer de compte fonctionne (carte 204).
- [ ] **Ordinateur, VS Code.** Rouvrir `apps/hub/playwright.config.ts` : l'erreur a disparu ; lancer une fois `pnpm test:sso` depuis `apps/hub` : les tests démarrent (carte 154).
- [ ] **GitHub.** Après l'envoi sur la branche `development`, réactiver l'intégration continue (`gh workflow enable CI`, l'automate qui lance les tests à chaque envoi) et contrôler que son premier lancement passe (carte 074).

**Production (site en ligne).**
- [ ] Créer une nouvelle clé ImgBB, supprimer l'ancienne qui a été publique, renseigner `IMGBB_API_KEY` sur Vercel et retirer `NEXT_PUBLIC_IMGBB_API_KEY` (voir `DEPLOY.md`), puis envoyer une image sur le site en ligne : elle s'affiche (carte 141).
- [ ] Après une branche de sauvegarde Neon, lancer `scripts/find-trapped-bbcode.mjs` sur la base de production pour retrouver les messages piégés, puis retirer ce script du dépôt. Sur le site en ligne, les spoilers s'ouvrent et se ferment toujours (carte 159).
- [ ] Au premier déploiement de la recherche plein texte, vérifier que la migration crée bien l'extension `unaccent` (sinon la créer dans l'éditeur SQL de Neon, voir `DEPLOY.md`) et qu'elle reste rapide sur la vraie table des messages ; puis chercher « equipe » sur le forum en ligne : les messages qui contiennent « équipe » sont trouvés (carte 191).

## 23. Refonte visuelle « feuille de match » (carte 220)

Les tests automatiques ont été adaptés au nouveau rendu mais n'ont pas pu être lancés (intégration continue coupée, mémoire insuffisante sur le poste) : ces essais à la main sont d'autant plus utiles.

- [ ] **Vrai téléphone, visiteur.** Accueil, forum, un sujet, la liste des tournois, les ligues et le classement : rien ne déborde, le nom BBFRANCE est lisible en haut, un seul bouton rouge par écran, la barre basse ne cache rien.
- [ ] **Vrai téléphone, membre.** Dans un sujet, l'auteur tient sur une ligne en tête du message avec la date et l'heure ; le bouton « Outils » ouvre le panneau des outils ; « Répondre » fonctionne.
- [ ] **Ordinateur, grand écran (1920 pixels).** Les pages utilisent la largeur (panneau à gauche, contenu, colonne de droite sur le forum et l'accueil) sans grands vides sur les côtés ; dans un sujet, l'auteur est dans une colonne à gauche du texte.
- [ ] **Les 5 thèmes.** Changer de thème depuis la barre du haut : dans chacun, le nom du site, les titres en capitales et les lignes de tableau restent lisibles (Saison 3 et NAF ont une barre rouge).
- [ ] **Administrateur.** Dans l'annuaire des membres, « Changer le rôle » s'ouvre depuis le menu « … » de la ligne et la confirmation change bien le rôle ; administration et modération se parcourent par le panneau de gauche.
- [ ] **Administration, page « Jouer ».** Reprendre le texte saisi dans « Guide du débutant » : tutoiement et sous-titre en casse normale (le site tutoie partout).

## 24. Rôles : un passage par compte de test (carte 221)

Base locale `pnpm dev exemple` ; changer de compte avec « Mode Développement » (page de connexion) ou le widget de la barre. Le tableau des droits attendus est dans `docs/features/INTERACTIONS.md`. Les refus du serveur sont vérifiés par `tests/e2e/permissions.spec.ts` ; ici, on vérifie ce que **voit** chaque rôle.

- [ ] **Visiteur (déconnecté).** Les forums « Salle des modérateurs » et « Bureau des admins » n'apparaissent pas ; le sujet supprimé « Achetez mes dés truqués ! » non plus ; « Répondre », « Signaler » et l'inscription aux tournois envoient vers la connexion. `/messagerie` envoie vers la connexion (plus de liste vide trompeuse).
- [ ] **`exemple-nouveau`.** La connexion envoie d'abord sur l'inscription (`/auth/onboarding`) : pas de barre de navigation, mais un « Me déconnecter » discret sous le formulaire, qui fonctionne.
- [ ] **`exemple-coach-1`.** Sujet « Vitrine BBCode » : chaque balise s'affiche (tableau, galerie, vidéo, spoiler, accordéon, mention, lien vers un sujet) ; le spoiler s'ouvre aussi au clavier (Tab puis Entrée). Sujet « Quel roster… » : deux pages, non-lus à partir de la bonne position. Tournoi par équipes : il est capitaine des « Bourrins du Poitou ». Messagerie : le groupe « Covoiturage Printemps » montre que Lézard est parti. Notifications : une lue, des non lues, dates relatives (« il y a 2 heures »).
- [ ] **`exemple-coach-1`, repère « Nouveaux messages » (carte 221).** Ouvrir « Quel roster… » depuis la liste : la page s'ouvre sur le premier message non lu, précédé du trait bleu « Nouveaux messages ». Recharger la même page : le trait a disparu (ces messages sont lus). Un sujet jamais ouvert n'a pas de trait devant son premier message.
- [ ] **`exemple-coach-1`, statut dans un tournoi (carte 221).** « Trophée des Équipes » : au-dessus des boutons, « Tu es dans l'équipe Les Bourrins du Poitou (capitaine). » ; « Modifier » l'équipe : deux coéquipiers cochés, pas « 4 / 3 ». « Petit Tournoi Complet » : « Tu es inscrit. », badge « Complet » dans `/tournois`. « Tournoi Annulé » : la fiche dit « Ce tournoi est annulé. Les inscriptions sont fermées. »
- [ ] **`exemple-coach-2`.** Sur la fiche de Lézard Patient, « Message privé » est grisé avec la raison (blocage). « Tournoi aux inscriptions fermées » : plus de bouton d'inscription, badge « Inscriptions fermées » dans `/tournois`. « Tournoi au sujet supprimé » : s'il apparaît dans `/tournois`, l'inscription est refusée (« retiré par la modération »).
- [ ] **`exemple-coach-3`.** Le message qu'il a supprimé dans « Débat : faut-il toujours bliter… » ne se modifie plus : « Modifier » (ou l'adresse `/forum/post/…/edit`) le ramène sur le message avec la notification « Ce message a été supprimé : il ne se modifie plus. » Sur la fiche de « Fraudeur Inscrit », « Message privé » est grisé : « Ce membre a été banni ».
- [ ] **`exemple-coach-role-perso` (Arbitre).** Son message masqué ne se modifie plus (même retour sur le message, avec « masqué par la modération ») et n'a plus de bouton « Réagir ». Son article masqué reste visible pour lui seul ; ouvert avec `exemple-coach-1`, la même adresse répond « Terrain impraticable » (404).
- [ ] **Sujets archivés (carte 221).** Avec n'importe quel compte, forum « Les challenges régionaux » : en bas de la liste, le groupe replié « Sujets archivés (1) » contient « Challenge du Nord-Ouest 2024 (archivé) ». La recherche « Nord-Ouest » le trouve, avec le badge « Archivé ». Le sujet n'apparaît jamais dans « Sujets non lus ».
- [ ] **`exemple-chef-ligue`.** « Gestion des inscriptions » du « Tournoi du Printemps » : dépliée d'office, « Fraudeur Inscrit » porte le badge « Banni » ; les états de paiement se changent. « Petit Tournoi Complet » : en-tête « (4 / 4 places · 1 en attente) », boutons écrits « Valider », « Pré-inscription », « Liste d'attente », et la liste de paiement affiche bien « Dépannage » pour le RTC.
- [ ] **`exemple-banni-inscrit`, page `/banned` (carte 221).** Toute page l'envoie sur `/banned`. La page n'a ni barre de navigation ni cloche ; elle montre la raison et comment contester. « Me déconnecter » le déconnecte et le ramène sur le site en visiteur.
- [ ] **`exemple-modo`.** Voit la « Salle des modérateurs », pas le « Bureau des admins ». Restaure le sujet supprimé ; fusionne les deux « Cherche une ligue vers Lyon » ; scinde le message 14 du sujet long. `/moderation` sans paramètre s'ouvre sur le premier onglet qui a des cas en attente ; sur téléphone, la ligne « En attente aussi : … » mène aux autres. Un signalement de chaque type ; sur un coach signalé, « Bannir » ouvre la fenêtre (annuler). Journal : rempli, les boutons « Membres », « Forum », « Contenus », « Administration » filtrent. Annuaire des membres : pas de « Supprimer » ; « Changer le rôle » n'est proposé que sur les rangs inférieurs, rôles personnalisés compris ; le filtre « État » › « Bannis seulement » ne montre que les bannis ; pas de « Bannir » sur sa propre ligne ni sur un admin. Fiche d'un banni : « Motif du bannissement » visible. « Tournoi à Valider » : validation CDF possible.
- [ ] **`exemple-admin`.** Annuaire : « Supprimer » apparaît sur un coach, pas sur `exemple-admin-2`. Administration : créer puis supprimer un rôle personnalisé, modifier le lien Discord, réordonner une catégorie ; chaque action apparaît dans le journal de modération avec un libellé en français. « Données de référence » : chaque liste est repliée, avec son nom lisible et « Utilisé dans : … ». « Annonces par e-mail » : « M'envoyer un essai » arrive dans sa boîte (objet « [Essai] … », gras et lien rendus) ; « Diffuser aux coachs » annonce le nombre réel de destinataires (annuler).
- [ ] **`exemple-superadmin`.** Peut changer le rôle d'un admin ; ne peut changer ni son propre rôle, ni supprimer son propre compte, ni se bannir (pas de « Bannir » sur sa ligne de `/membres`).

## 25. Tiroir des rubriques, médias et cookies (22/11/2026)

- [ ] Sur un vrai téléphone : profil, fiche d'un membre, classement, modération, administration. La barre des rubriques reste collée sous la barre du haut en défilant ; le tiroir s'ouvre entre les deux barres, se ferme d'un appui à côté ou d'un glissement, et la page derrière ne bouge pas.
- [ ] En production, page `/media` : les images des vidéos s'affichent (optimiseur d'images de Vercel) et la vidéo se lance au clic.
- [ ] En production, un direct Twitch s'affiche après « Afficher le contenu Twitch » (le paramètre `parent` doit être le vrai domaine) ; un clip et une vidéo Twitch collés dans un message aussi.
- [ ] « Toujours afficher les contenus Twitch », puis le retirer depuis `/mentions-legales#cookies` : le cadre d'accord revient.
- [ ] Administration > Médias : ajouter une chaîne YouTube par son adresse `@nom` (le serveur de Vercel doit pouvoir lire la page YouTube), l'ordonner, enregistrer ; elle apparaît sur `/media` et dans le bloc Médias de l'accueil.
- [ ] Plus aucun bandeau des cookies, sur aucune page.
- [ ] `/media`, onglet YouTube, quand une chaîne de la liste est en direct : le tourniquet apparaît et le direct joue sans le son (sur un vrai téléphone, glisser d'un direct à l'autre).
- [ ] `/media`, onglet Twitch : rien de Twitch avant l'accord (aucune image, aucun lecteur) ; après l'accord, les chaînes en direct sont dans le tourniquet. Refaire l'essai une fois `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` réglés sur Vercel : dernières vidéos et clips des chaînes hors ligne, page plus rapide.


## 26. Cartes de fin novembre (145, 222 à 225)

- [ ] **Ordinateur, admin, serveur de mail réel.** Administration > Annonces par e-mail : une annonce à quelques comptes de test. Lavancement
- [ ] **Téléphone, modérateur.** Fiche d'un coach : « Avertir » avec un motif ; le coach reçoit la notification sur son téléphone et lit le motif en tête de son profil, sans le pseudo du modérateur (carte 222).
- [ ] **Téléphone, modérateur.** Bannir un compte de test pour 1 jour : la fenêtre garde « Confirmer le bannissement » en bas de l'écran ; le coach voit « Compte suspendu » et la date ; le lendemain, il retrouve l'accès en revenant sur le site, et le journal note « Fin du bannissement temporaire » (carte 222).
- [ ] **Téléphone, deux comptes de test et un modérateur.** Dans une conversation à deux : « Signaler la conversation », puis la fenêtre « Inviter un modérateur » s'ouvre ; la fermer. Côté modérateur : la fiche ne montre que les participants, et la conversation reste fermée. « Marquer comme traité » : le membre reçoit « La modération a traité ton signalement ». Puis inviter le modérateur (avec confirmation) : il reçoit la notification et lit tout l'historique ; l'autre membre le voit arriver (carte 223).
- [ ] **Téléphone, site en mode hub.** Profil > réglages : la section « Passeport Blood Bowl » s'affiche sans débordement ; changer le pseudo depuis le site puis depuis le passeport, il suit dans les deux sens (cartes 122, 124, 125).
- [ ] **Téléphone, admin puis coach.** Administration > Structure du forum > Modifier un forum : ajouter un coach dans « Modérateurs de ce forum ». Ce coach masque un message de ce forum et d'un de ses sous-forums ; dans un autre forum, le menu du message ne propose ni « Masquer » ni « Supprimer » (carte 225).

## 27. Championnats en données de référence (carte 227)

- [ ] **Ordinateur, admin.** Administration > Données de référence > Championnats : modifier la description de TSC, ajouter un championnat (clé `TEST`), puis le désactiver. Le CDF n'a ni bouton Supprimer ni interrupteur actif utilisable.
- [ ] **Téléphone, organisateur puis modérateur.** Annoncer un tournoi : les cases des championnats s'affichent avec leur description, sans débordement ; l'organisateur ne voit pas le CDF, le modérateur le voit et peut le cocher. La fiche du tournoi affiche les sigles cochés.
- [ ] **Téléphone.** `/tournois` > Filtres > Circuits et labels : cocher deux championnats, la pastille de chacun s'affiche, seuls les tournois qui ont les deux restent.
- [ ] **Après la mise en ligne.** Un tournoi CDF terminé, résultats saisis puis validés par la modération, apparaît au classement de l'année.
