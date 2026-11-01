# Essais à la main de fin de refonte visuelle

Cette liste rassemble tout ce que les tests automatiques ne peuvent pas vérifier à la place d'une vraie personne : le comportement du clavier d'un téléphone, la zone protégée de l'iPhone (la bande en bas de l'écran réservée au geste de retour à l'accueil, voir `docs/GLOSSAIRE.md`), la fluidité du défilement, l'aspect des huit thèmes et le confort de lecture. Elle est tirée de la section « Résultat » de chaque carte de l'épic E08 (cartes 075 à 101) et des lignes de `docs/refonte/inventaire.md` qui n'ont pas pu être cochées par un test. Elle correspond à la carte 114.

**Comment la dérouler.**
- Préparer quatre comptes : un visiteur (navigation privée, sans être connecté), un membre ordinaire, un modérateur et un administrateur. Le super administrateur (le compte du responsable du site) sert pour les essais de la section « Administration ».
- Utiliser un téléphone Android et, si possible, un iPhone, plus un ordinateur. Chaque ligne précise l'appareil où l'essai a de la valeur ; « téléphone » veut dire Android et iPhone. Les lignes marquées « iPhone » ne se vérifient que sur ce téléphone, à cause de sa zone protégée et de son clavier.
- Suivre l'ordre des sections : la coquille (barre du haut, barre du bas, panneau « Plus ») et les thèmes d'abord, puis les écrans, du plus fréquent au plus rare.
- Refaire quelques essais en position horizontale du téléphone, surtout pour les écrans de rédaction et BBScheme.
- Cocher la case quand le résultat attendu est obtenu. Sinon, laisser la case vide et noter à côté l'appareil, le compte, le thème et ce qui s'est passé (une capture d'écran aide beaucoup).
- Un problème trouvé n'est pas corrigé sur le moment : il est noté, puis il devient une carte séparée du kanban. Avant de noter, relire la dernière section : le problème est peut-être déjà en carte.
- Aucune ligne ne demande d'effacer des données réelles. Quand un essai touche une suppression, un envoi à tous les membres ou une remise à zéro, il se limite à ouvrir la fenêtre puis à l'annuler, ou se fait sur des données d'essai.

Les rôles sont ceux de `docs/refonte/inventaire.md` : visiteur, membre, modérateur, administrateur, super administrateur.

## 1. Coquille et navigation

- [ ] **Téléphone, visiteur.** La barre du bas affiche cinq onglets (Accueil, Forum, Tournois, Messages, Plus) lisibles sans zoom, chacun se touche facilement au pouce, et la barre du haut ne montre que le retour, le logo et le bouton « Connexion ».
- [ ] **Téléphone, membre.** L'onglet Messages porte une pastille avec le nombre de messages non lus, et elle disparaît une fois les messages lus.
- [ ] **Téléphone, modérateur.** L'onglet Plus porte une pastille de modération quand il y a des éléments à traiter.
- [ ] **Téléphone, membre.** Le panneau « Plus » s'ouvre par le bas et montre le profil, le choix du thème (les 8 thèmes), les autres rubriques, les liens du pied de page et « Déconnexion ». Tout se lit sans zoom, se ferme facilement et défile jusqu'au dernier lien.
- [ ] **Téléphone, visiteur.** Le panneau « Plus » propose la connexion à la place du profil et ne montre ni Modération ni Administration.
- [ ] **Téléphone, administrateur.** Le panneau « Plus » montre Modération et Administration avec leur pastille.
- [ ] **Téléphone, membre.** Sur la page d'un sujet du forum, la rubrique « Cette page » du panneau « Plus » affiche les outils du sujet ; sur une page sans outils, la rubrique n'apparaît pas.
- [ ] **Android, membre.** Toucher une zone de saisie fait disparaître la barre du bas pour laisser la place au clavier ; fermer le clavier la fait revenir, sans que la page saute.
- [ ] **iPhone, membre.** Même essai : la barre du bas disparaît quand le clavier s'ouvre, revient à sa fermeture, et rien ne passe sous la bande de l'iPhone en bas de l'écran.
- [ ] **Téléphone, membre.** Un bouton « Envoyer » ou « Enregistrer » touché juste après avoir tapé du texte atteint bien le bouton visé (la barre ne se glisse pas sous le doigt).
- [ ] **Téléphone, visiteur (navigation privée).** Au premier passage, le bandeau des cookies apparaît au-dessus de la barre du bas ; la page défile jusqu'à son dernier bouton sans qu'il soit caché ; « Accepter » et la croix fonctionnent, et le bandeau ne revient pas.
- [ ] **Téléphone, modérateur.** Enregistrer un réglage dans la modération ou l'administration affiche la notification au-dessus de la barre du bas, et on peut encore défiler jusqu'au dernier bouton.
- [ ] **Téléphone, membre.** Le logo de la barre du haut (hors accueil) s'atteint facilement au pouce, et les libellés de la barre du bas sont lisibles.
- [ ] **Ordinateur, visiteur.** La barre du haut propose Accueil, Forum, Tournois, Ligues, Articles et Ressources, plus un menu « Plus » pour le reste ; les boutons « Thème » et « Connexion » sont présents.
- [ ] **Ordinateur, membre.** Le menu du compte propose Mon profil, Réglages, Changer de thème et Déconnexion ; Messagerie et Modération ont leur pastille, Administration son icône.
- [ ] **Tous appareils, membre.** Recharger plusieurs pages avec le thème Clair puis avec un thème sombre : pas d'éclair d'une autre couleur avant le bon thème.

## 2. Bandeau « Nouveau look » et changement de thème

Pour ces lignes, utiliser un membre dont l'ancien thème, d'avant la bascule vers Vestiaire, a été conservé (le bandeau n'apparaît que dans ce cas).

- [ ] **Téléphone, membre.** Le bandeau « Nouveau look » apparaît en haut de la page avec « Revenir à l'ancien thème » et « Garder le nouveau look » ; le texte est lisible et les deux boutons font au moins 44 pixels de haut.
- [ ] **Ordinateur, membre.** Même contrôle du bandeau, sans débordement.
- [ ] **Téléphone, membre.** « Revenir à l'ancien thème » applique tout de suite l'ancien thème, qui reste après un rechargement puis après une déconnexion suivie d'une reconnexion.
- [ ] **Téléphone, membre.** « Garder le nouveau look » fait disparaître le bandeau, qui ne revient pas aux visites suivantes.
- [ ] **Téléphone, membre.** Changer de thème depuis le panneau « Plus » prend effet immédiatement, et le choix se retrouve ensuite dans « Éditer mon profil ».
- [ ] **Ordinateur, membre.** Changer de thème depuis le menu du compte prend effet immédiatement et se garde au rechargement.
- [ ] **Ordinateur, visiteur.** Le bouton « Thème » change l'aspect du site et le thème choisi revient au rechargement (un très court éclair du thème par défaut est possible pour un visiteur, il est déjà en carte, voir la dernière section).

## 3. Les huit thèmes

Les huit thèmes sont : Vestiaire (le thème par défaut), Saison 3, Sombre, Clair, Blood, Malpierre, Néhékhara et NAF. Pour chacun, parcourir les cinq écrans suivants, sur téléphone puis sur ordinateur : l'accueil, la liste d'un forum, la page d'un sujet, l'éditeur d'une réponse et la fenêtre d'un signalement.

- [ ] **Vestiaire, téléphone et ordinateur, membre.** Les cinq écrans sont lisibles, rien ne déborde, les boutons ressortent clairement, aucun texte n'est gris sur gris.
- [ ] **Saison 3, téléphone et ordinateur, membre.** Fond en léger dégradé, titres sans trait vertical ni bleu marine imposé, textes lisibles.
- [ ] **Sombre, téléphone et ordinateur, membre.** Fond en léger dégradé, cartes en verre dépoli (fond translucide et flouté) qui restent fluides au défilement sur téléphone, texte lisible.
- [ ] **Clair, téléphone et ordinateur, membre.** Textes foncés sur fond clair, bordures visibles, aucune zone restée sombre.
- [ ] **Blood, téléphone et ordinateur, membre.** Contraste suffisant entre le texte et le fond ; boutons et liens reconnaissables.
- [ ] **Malpierre, téléphone et ordinateur, membre.** Même contrôle de lisibilité et de contraste.
- [ ] **Néhékhara, téléphone et ordinateur, membre.** Même contrôle de lisibilité et de contraste.
- [ ] **NAF, téléphone et ordinateur, membre.** Même contrôle ; les couleurs rappellent bien celles de la NAF.
- [ ] **Ordinateur, membre, chaque thème.** Dans un message, un spoiler, un accordéon, une citation, un tableau et une galerie sont lisibles (texte visible, bordures visibles).
- [ ] **Téléphone, membre, thèmes Sombre et Blood.** La barre du bas, le panneau « Plus » et le bandeau des cookies restent lisibles et se distinguent du fond de la page.
- [ ] **Tous appareils, chaque thème.** Après un changement de thème en cours de navigation, aucun élément ne garde les couleurs de l'ancien thème (cartes, boutons, menus, fenêtres, notifications).

## 4. Accueil, `/jouer`, `/media` et pages fixes

- [ ] **Téléphone, visiteur.** L'accueil : le logo et les tuiles tiennent sur deux colonnes sans déborder, et le grand logo n'est pas caché par la barre du haut.
- [ ] **Téléphone, visiteur.** Toucher « Créer » sur Ligues sans être connecté mène à la connexion ; après connexion, on arrive sur le formulaire de création d'une ligue.
- [ ] **Téléphone, membre.** Toucher un tournoi puis un article depuis l'accueil ouvre la bonne page.
- [ ] **Ordinateur, visiteur.** L'accueil est équilibré : pas de grand vide, tuiles alignées.
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

## 6. Forum : accueil, listes de sujets, non lus

- [ ] **Téléphone, membre.** L'accueil du forum : les catégories sont des cartes repliables (toucher l'en-tête les ouvre et les ferme) ; chaque forum affiche son icône, son nom, sa description, son dernier sujet et son nombre de sujets.
- [ ] **Téléphone, membre.** Un forum qui contient du non-lu est mis en valeur (nom en gras, point bleu), y compris quand le non-lu est dans un sous-forum ; un forum verrouillé montre son cadenas.
- [ ] **Téléphone, membre.** Le bandeau « N sujets non lus » mène à la liste des sujets non lus.
- [ ] **Téléphone, membre.** Un forum de tournoi a son trophée ; un forum sans sujet affiche « Aucun sujet ».
- [ ] **Téléphone, membre.** La page d'un forum : fil d'Ariane, sous-forums en lignes, sujets en lignes avec avatar, titre, épinglé, badge de tournoi (« Annulé », « Terminé », « Passé »), cadenas, auteur, date, messages, vues et dernière activité ; tout est lisible sans zoom.
- [ ] **Téléphone, membre.** « Nouveau sujet » et « Nouveau tournoi » sont visibles en haut de la liste ; dans un forum verrouillé, le bouton grisé « Forum verrouillé » s'affiche à la place.
- [ ] **Téléphone, membre.** La rubrique « Cette page » du panneau « Plus » contient la recherche avancée, les membres, les non-lus, « Tout marquer comme lu » et, pour un modérateur, l'administration du forum.
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
- [ ] **Téléphone, membre.** « Citer » insère la citation dans la réponse rapide et fait défiler jusqu'à elle.
- [ ] **Téléphone, membre.** Un message supprimé, un auteur bloqué ou banni (« Afficher le message », « AFFICHAGE TEMPORAIRE », « Masquer à nouveau ») et un message modéré s'affichent correctement.
- [ ] **Téléphone, membre.** Sur une page suivante d'un sujet de tournoi, le premier message est mis en valeur (bordure d'accent et badge « Premier message »).
- [ ] **Téléphone, membre.** Publier une réponse : le nouveau message apparaît avec une brève animation et la page reste fluide.
- [ ] **Téléphone, membre.** Le panneau « Outils du sujet » et la rubrique « Cette page » du panneau « Plus » donnent les mêmes outils (sujet, gestion du tournoi, modération) et chaque outil fonctionne.
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
- [ ] **Téléphone, membre.** Signaler un message (menu « ⋯ ») et un sujet (panneau « Outils du sujet » et rubrique « Cette page »), avec le clavier ouvert dans « Précisions » : la fenêtre passe au-dessus de la barre du bas et le bouton d'envoi reste atteignable.

## 10. Tournois

- [ ] **Téléphone, visiteur.** `/tournois` : taper un nom, ouvrir « Filtres », choisir une région puis un département, cocher un circuit, fermer avec « Voir N tournois », retirer une pastille, changer le tri, passer en liste, aller à la page 2.
- [ ] **Ordinateur, visiteur.** Les filtres s'affichent en ligne, et le passage entre carte, liste et tri fonctionne.
- [ ] **Téléphone, membre.** Sujet d'un tournoi : se pré-inscrire puis annuler la pré-inscription.
- [ ] **Téléphone, membre.** Sur un tournoi par équipes, inscrire une équipe avec un coéquipier (le clavier ouvert dans la recherche ne cache pas la liste), la modifier, ouvrir ses détails, la désinscrire.
- [ ] **Téléphone, organisateur.** Déplier les inscriptions, changer un paiement, valider un inscrit (sur un tournoi d'essai).
- [ ] **Téléphone, membre.** Créer un tournoi d'essai : remplir chaque bloc, ouvrir « Choisir sur la carte », chercher une adresse, déplacer le repère, valider ; « Publier » se touche depuis la barre du bas.
- [ ] **Téléphone, organisateur.** Saisie des résultats d'un tournoi d'essai : importer un fichier NAF depuis le téléphone, réordonner deux coachs avec la poignée, ajouter une ronde et un match, publier.
- [ ] **Téléphone, organisateur.** « Vider les résultats » : ouvrir la confirmation puis « Annuler » (ne pas confirmer sur un tournoi réel).
- [ ] **Téléphone, membre.** Le classement d'un tournoi publié se lit sans défilement horizontal.

## 11. Profil et membres

- [ ] **Téléphone, membre.** `/profile` : passer d'un onglet à l'autre en faisant défiler la rangée d'onglets ; aller à la page 2 des sujets suivis.
- [ ] **Téléphone, membre.** « Éditer mon profil » : « Générer » (le clavier ne cache pas le champ « Graine »), « Aléatoire », envoyer une vraie image, changer de contour, ajouter une ligue, changer de thème, puis « Sauvegarder le profil ».
- [ ] **iPhone, membre.** Même édition : le panneau d'avatar monte du bas sans passer sous la bande de l'iPhone.
- [ ] **Téléphone, membre.** « Gérer mon compte » : basculer un interrupteur de notification (il garde sa position après rechargement), délier puis réassocier Discord ou Google.
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
- [ ] **Téléphone, super administrateur.** `/administration?tab=reset` : ouvrir le panneau de remise à zéro ; le bouton reste grisé tant que la phrase demandée n'est pas écrite exactement ; puis « Annuler ». Ne rien confirmer.
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
