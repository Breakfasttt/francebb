# Conseil : Feuille de route du forum BBFrance après audit : quelles corrections en premier (top 10 ordonné), et quels ajouts valent vraiment la peine pour une communauté Blood Bowl française de taille modeste, lue surtout sur téléphone ?

_2026-11-04 · Médiateur, Pragmatique, Pessimiste, Coach mobile du dimanche, Modérateur bénévole, Organisateur de tournoi, Ancien administrateur phpBB puis Discour, Expert sécurité web_

## Décision proposée

Je propose cet ordre, **sécurité et irréversible en semaine 1, intégrité et modération en semaine 2** :

1. **Retirer le bouton de remise à zéro** (10 min) et prouver en parallèle qu'une sauvegarde se restaure.
2. **XSS BBCode** : échappement avant balisage, liste blanche, purge des signatures et MP, CSP et cookies HttpOnly/SameSite, invalidation des sessions avec bandeau explicatif.
3. **Liaison Discord/Google** : tester le drapeau « e-mail vérifié », auditer les comptes liés, prévoir une récupération par un modo.
4. **CDF** : rôle organisateur accrédité, résultats existants passés « en attente de validation », recalcul historisé.
5. **Suppression douce** des réponses et des tournois, réservée aux modos, avec bouton Restaurer et journal.
6. **Texte modéré masqué côté serveur** (Citer, Répondre).
7. **Signalements lisibles et actionnables** : masquer, ignorer, avertir.
8. **Non-lu** : corriger page 1, épinglage et nouveaux membres, avec une date-plancher « tout lu avant le X ».
9. **E-mails** : échappement HTML et file de renvoi.
10. **Index manquants**, livrés dès la semaine 1 parce qu'ils coûtent peu.

**Ajouts retenus** : brouillons en localStorage, citation partielle, pagination mobile (début, fin, saut de page), message unique de l'équipe expliquant les changements.

## Pourquoi

- Le retrait du reset prend dix minutes et ne détruit rien. Il ne doit donc pas attendre la sauvegarde (Expert sécurité, Pragmatique).
- Le XSS est peut-être déjà exploité, d'où l'invalidation des sessions (Pessimiste), présentée sur téléphone par un bandeau et une reconnexion en un appui (Coach).
- Vérifier la seule présence d'une adresse e-mail laisse la faille ouverte. Il faut tester le drapeau « vérifié » (Expert).
- Geler les résultats CDF sans circuit d'accréditation ne ferait que déplacer le problème (Organisateur). Le statut réversible vient du Modérateur.
- La date-plancher évite une vague de non-lus sans réécrire la base (Pessimiste, Coach, Modérateur).

## Ce qu'on ne fait pas

- Notifications dans le site : la file d'e-mails fiabilisée suffit pour l'instant.
- Recherche plein texte : les index d'abord.
- Liste d'attente et rappels de tournoi : après le rôle organisateur.

## Désaccords restants

- **Non-lu ou signalements d'abord** : l'Ancien admin juge que le non-lu fait revenir les membres, l'Expert le classe comme irritant. Je tranche pour les signalements d'abord, livrés dans la même semaine.
- **Notifications internes** : réclamées par le Modérateur, l'Organisateur et l'Ancien admin, reportées ici.

## Actions

- J1 : retirer le reset, ajouter les index, lancer le test de restauration.
- Semaine 1 : XSS, CSP, liaison vérifiée, invalidation des sessions, gel CDF.
- Semaine 2 : suppression douce, masquage, signalements, non-lu, e-mails, message de l'équipe.
- Semaine 3 : brouillons, citation partielle, pagination.

## Questions ouvertes

- Qui est l'admin CDF qui accrédite les organisateurs ?
- Que fait-on si l'audit révèle une exploitation du XSS ?
- À quelle date fixer la bascule du non-lu ?

## Positions des membres

| Membre | Position |
|---|---|
| Pragmatique | Reset retiré d'abord, puis XSS, liaison et droits en une semaine, avec les index dans le même déploiement ; ensuite non-lu et brouillons. |
| Pessimiste | Sauvegarde testée avant tout, XSS avec invalidation des sessions, audit et gel des résultats CDF, puis le reste. |
| Coach mobile du dimanche | Sécurité avec bandeau et reconnexion facile, non-lu avec bascule « tout lu », brouillons purgés seulement à la déconnexion volontaire. |
| Modérateur bénévole | Sauvegarde, sécurité, puis suppression douce restaurable et signalements actionnables avant tout confort. |
| Organisateur de tournoi | Rôle organisateur accrédité, résultats gelés puis validés et historisés, suppression douce des tournois. |
| Ancien administrateur phpBB puis Discour | Sécurité, puis signalements et non-lu avec date-plancher, plus un message de transparence ; le non-lu décide du retour des membres. |
| Expert sécurité web | Reset retiré, CSP, XSS et liaison vérifiée d'abord, puis gel CDF, signalements et non-lu. |

C'est une proposition : la décision finale vous revient.

---

## Débat

### Contexte

Constats vérifiés dans le code. Sécurité : faille d'injection de script par BBCode imbriqué ([color] dans [gallery]/[img]/[url]/[quote]) touchant messages, signatures, MP ; liaison de comptes Discord/Google par e-mail non vérifié (prise de compte) ; n'importe quel membre peut créer un tournoi CDF et saisir des résultats comptant au classement national ; bouton de remise à zéro totale de la base. Forum : texte des messages modérés/supprimés lisible (bouton Citer, page Répondre) ; l'auteur d'un sujet peut supprimer définitivement les réponses des autres et le tournoi ; épingler/verrouiller/déplacer rend le sujet non lu pour tous ; lire la page 1 marque tout le sujet lu ; nouveau membre voit tout non lu ; e-mails de notification perdus (pas attendus) et HTML non échappé ; signalements de messages illisibles pour les modérateurs ; pas de brouillons ; pagination sans retour au début ni saut de page ; citation = message entier ; pas de notifications dans le site ; recherche lente (phrase exacte, pas d'index) ; index manquants.

**Pragmatique** _(tour 1)_ : 1. XSS BBCode : échapper après parsing, un correctif, un jour.
2. Liaison Discord/Google : exiger l'e-mail vérifié (0,5 j).
3. Retirer le reset de la base, ou le mettre derrière un accès admin plus un mot de passe.
4. Tournois CDF : réservés à un rôle organisateur.
5. Texte modéré/supprimé : masquer côté serveur.
6. L'auteur ne supprime plus les réponses des autres.
7. E-mails : échapper le HTML, puis file d'attente avec nouvel essai.
8. Non-lu : corriger page 1, épinglage, nouveau membre.
9. Signalements lisibles pour les modos.
10. Index manquants, qui règlent aussi l'essentiel de la lenteur de recherche.

Ajouts rentables : brouillon en localStorage, citation partielle, pagination mobile (début/fin/saut). À reporter : notifications internes, recherche plein texte.

Position : sécurité d'abord en 3-4 jours, puis intégrité du forum, puis confort mobile.

**Pessimiste** _(tour 1)_ : **Bloquant (dans cet ordre) :**
1. XSS BBCode : liste blanche, échappement avant balisage, purge des signatures et MP existants.
2. Liaison Discord/Google : exiger un e-mail vérifié, délier les comptes suspects.
3. Remise à zéro de la base : supprimer le bouton, tester une sauvegarde restaurable.
4. Tournois CDF : réservés aux organisateurs validés, avec journal d'audit.
5. Suppression définitive par l'auteur : suppression douce uniquement.

**À atténuer :**
6. Texte modéré encore lisible : le masquer partout.
7. E-mails : échapper le HTML, ajouter une file de renvoi.
8. Signalements illisibles.
9. Logique du non-lu : ne plus marquer lu après la page 1, et ne plus rouvrir un sujet épinglé/déplacé.
10. Index manquants, puis recherche.

**Accepté :** pagination, notifications internes.

**Ajouts :** citation partielle et brouillons, utiles sur téléphone.

Position : corriger d'abord la sécurité et l'irréversible, puis les irritants quotidiens ; reporter les nouveautés.

**Coach mobile du dimanche** _(tour 1)_ : Top 10, sécurité d'abord, puis ce qui casse ma lecture dans le métro :
1. XSS BBCode imbriqué.
2. Liaison Discord/Google sans e-mail vérifié.
3. Bouton de remise à zéro de la base.
4. Tournois CDF et résultats réservés aux organisateurs.
5. Suppression des réponses par l'auteur du sujet.
6. Texte modéré lisible via Citer.
7. Lire la page 1 marque tout le sujet lu.
8. Épingler/verrouiller rend le sujet non lu.
9. Nouveau membre : tout non lu.
10. E-mails perdus et HTML non échappé.

Ajouts rentables : brouillons automatiques (le tunnel coupe ma réponse), citation d'un passage, saut de page et retour au début, puis notifications dans le site. La recherche et les index attendent.

Position : sécuriser d'abord, puis réparer le « non lu » et les brouillons, qui font vivre la lecture sur téléphone.

**Modérateur bénévole** _(tour 1)_ : 1. Injection BBCode imbriqué (messages, signatures, MP).
2. Liaison Discord/Google sans e-mail vérifié.
3. Remise à zéro de la base : supprimer le bouton, ou le protéger par sauvegarde et double confirmation.
4. Tournois CDF et résultats : réservés à des rôles de confiance.
5. Suppression définitive par l'auteur : remplacer par une corbeille réversible.
6. Texte des messages modérés encore lisible (Citer, Répondre).
7. Signalements illisibles pour les modérateurs.
8. Lecture de la page 1 qui marque tout le sujet lu.
9. E-mails perdus et HTML non échappé.
10. Épingler/verrouiller/déplacer qui remet le sujet en non lu, plus le « tout non lu » des nouveaux.

Ajouts utiles : brouillons automatiques, citation partielle, notifications dans le site, retour au début et saut de page. Les index manquants sont peu coûteux, à faire au passage.

Position : Sécurité et réversibilité d'abord, confort mobile ensuite.

**Organisateur de tournoi** _(tour 1)_ : 1. Réserver création de tournoi CDF et saisie des résultats aux organisateurs validés : le classement national est ma raison d'être.
2. Corriger l'injection BBCode.
3. Vérifier l'e-mail avant liaison Discord/Google.
4. Supprimer le bouton de remise à zéro (ou double confirmation + sauvegarde).
5. Interdire à l'auteur de supprimer réponses et tournoi ; archiver.
6. Journal d'audit et correction des résultats.
7. Masquer le texte modéré.
8. Rendre les signalements lisibles.
9. Réparer les e-mails (file d'attente, HTML échappé).
10. Corriger le non-lu.

Ajouts utiles : inscription avec liste d'attente, rappels avant tournoi, notifications dans le site, brouillons. Le reste attendra.

Position : sécuriser d'abord le classement CDF et les comptes, puis seulement le confort de lecture.

**Ancien administrateur phpBB puis Discour** _(tour 1)_ : 1. Corriger l'injection BBCode (messages, signatures, MP).
2. Exiger un e-mail vérifié pour lier Discord/Google.
3. Supprimer le bouton de remise à zéro, ou le verrouiller derrière un accès serveur.
4. Réserver la création de tournois et la saisie des résultats CDF à des rôles validés.
5. Cacher le texte des messages modérés et retirer à l'auteur le pouvoir de supprimer les réponses des autres.
6. Réparer le non-lu : page 1, épinglage, nouveaux membres. Un forum meurt quand on ne sait plus où répondre.
7. Rendre les signalements lisibles : sans modération réactive, la communauté se fâche.
8. Fiabiliser les e-mails (file d'attente, échappement).
9. Ajouter les index, puis la recherche.
10. Citation partielle et pagination mobile.

À ajouter : notifications dans le site, puis brouillons (on perd moins de texte sur téléphone). Le reste attendra.

Position : sécuriser d'abord, puis rendre le non-lu et la modération fiables avant tout ajout.

**Expert sécurité web** _(tour 1)_ : 1. XSS BBCode imbriqué : stocké, exploitable par tout membre, vole la session admin via MP.
2. Bouton de remise à zéro de la base : le retirer de la prod ou exiger mot de passe et confirmation.
3. Liaison Discord/Google sans e-mail vérifié : prise de compte triviale.
4. Tournois et résultats CDF ouverts à tous : droits organisateur uniquement.
5. Suppression définitive par l'auteur du sujet : passer en suppression logique, réservée aux modérateurs.
6. Messages modérés lisibles via Citer/Répondre.
7. HTML non échappé dans les e-mails.
8. Index manquants et recherche lente : déni de service facile.
9. Signalements illisibles.
10. Non-lu : page 1 qui marque tout lu, nouveau membre, épinglage.

Ajouts rentables : brouillons (le mobile perd les messages), citation partielle, notifications internes. Le reste attend.

Position : corriger d'abord ce qu'un simple membre exploite sans effort (XSS, prise de compte, reset, tournois), puis l'ergonomie mobile.

**Pragmatique** _(tour 2)_ : Expert sécurité, tu as raison : le reset de la base se retire en dix minutes, donc il passe en premier, avant même le XSS. Pessimiste et Modérateur, je cède sur la suppression : un simple drapeau « supprimé » coûte presque autant que l'interdiction et c'est réversible. J'ajoute la purge des signatures et MP déjà infectés, que j'avais oubliée.

Ancien admin, les index ne sont pas en 9ᵉ position : une demi-journée, à faire dans le même déploiement que la sécurité.

Organisateur, liste d'attente et rappels viennent après un rôle organisateur propre. Coach, les notifications internes attendent : la file d'e-mails fiabilisée les remplace à moindre coût.

Position : retirer le reset, corriger XSS, liaison et droits en une semaine, puis non-lu et brouillons localStorage.

**Pessimiste** _(tour 2)_ : Pragmatique, d'accord : le reset passe en premier. Mais retirer le bouton ne suffit pas, il faut d'abord une sauvegarde dont on a prouvé la restauration. Sinon le prochain accident est définitif.

Trois angles morts que personne n'a cités :
- **Bloquant** : le XSS est peut-être déjà exploité. Après le correctif, invalider toutes les sessions et jetons admin, et auditer les comptes liés.
- **Bloquant** : les résultats CDF déjà saisis par n'importe qui. Les figer, les faire valider par un organisateur, puis seulement verrouiller les droits.
- **À atténuer** : délier les comptes suspects peut exclure de vrais membres. Prévoir une récupération manuelle par un modo.

Le correctif du non-lu risque de tout remettre en non lu d'un coup. Il faut une date de bascule. Les brouillons en localStorage sont acceptés, avec purge à la déconnexion.

Position : sauvegarde testée, reset retiré, XSS avec invalidation des sessions, audit CDF, puis le reste.

**Coach mobile du dimanche** _(tour 2)_ : Pessimiste, la date de bascule du non-lu est pile ce qui me concerne. Au déploiement, marquer tout l'historique comme lu, sinon je rouvre le forum avec des centaines de sujets non lus et je n'y reviens plus. Pour les brouillons, purge à la déconnexion volontaire seulement : dans le métro, la session saute souvent et je perdrais mon texte.

Pragmatique, je concède les notifications internes : la file d'e-mails fiabilisée suffit pour l'instant. Invalider toutes les sessions est justifié, mais prévoyez un bandeau d'explication et une reconnexion Discord en un appui. Sinon, sur téléphone, la moitié des membres croira à un bug.

Position : sécurité avec sessions invalidées et bandeau, puis non-lu avec bascule « tout lu », puis brouillons.

**Modérateur bénévole** _(tour 2)_ : Pragmatique, content que tu cèdes sur la suppression douce, mais un drapeau sans bouton « Restaurer » à un appui dans la file de modération ne sert à rien le soir sur mon téléphone. Il faut aussi un journal : qui a supprimé, quand.

Pessimiste, ton gel des résultats CDF me va, à condition que ce soit réversible : un statut « en attente de validation », pas des lignes effacées. Même logique pour la bascule du non-lu, Coach : une date-plancher « tout lu avant le X » plutôt qu'une réécriture de la base, qu'on pourrait annuler.

Nouveau : dans un signalement, trois actions directes (masquer, ignorer, avertir), sans ouvrir le sujet. Ça compte plus que le reste de ma liste.

Position : sauvegarde testée, reset retiré, sécurité, puis suppression douce et signalements actionnables avant tout confort.

**Organisateur de tournoi** _(tour 2)_ : Pessimiste, ton gel des résultats CDF me convient, et Modérateur, le statut « en attente de validation » est la bonne forme. J'ajoute ce qui manque : qui valide ? Il faut un circuit d'accréditation d'organisateur (demande, validation par un admin CDF), sinon on déplace le problème. Il faut aussi recalculer le classement après validation, avec correction possible et historisée dans le journal.

Pragmatique, je cède : liste d'attente et rappels attendent le rôle propre. Mais les tournois en cours ne doivent pas perdre leurs inscrits pendant la migration, donc suppression douce du sujet de tournoi dès le premier déploiement.

Position : rôle organisateur accrédité, résultats existants gelés puis validés, suppression douce du tournoi, journal d'audit, tout cela avant les confort.

**Ancien administrateur phpBB puis Discour** _(tour 2)_ : Pragmatique, je te donne les index dans le premier déploiement : c'est gratuit, personne n'y perd. Mais sur le non-lu, je tiens bon : les sécurités se corrigent en une semaine, et c'est le non-lu qui décide si les gens reviennent. Coach et Modérateur, la date-plancher « tout lu avant le X » est la bonne solution, réversible et sans réécriture de la base.

Point que personne n'a soulevé : après une semaine de bandeaux, de sessions coupées et de comptes déliés, il faut un message de l'équipe, en une fois, sur ce qui change. Un forum modeste vit de la confiance. Je mets les signalements actionnables de Modérateur juste après la sécurité : une modération qui répond le soir garde les membres.

Position : sécurité et sauvegarde d'abord, puis signalements actionnables et non-lu avec date-plancher, un message de transparence à l'équipe, brouillons ensuite.

**Expert sécurité web** _(tour 2)_ : Pessimiste, je prends l'invalidation des sessions, mais je ne retarde pas le retrait du bouton de reset pour la sauvegarde testée. Le retrait prend dix minutes, la preuve de restauration se fait en parallèle.

Trois ajouts concrets :
- **CSP stricte et cookies HttpOnly/SameSite** : ils limitent le vol de session même si le filtre BBCode rate un cas, pour un coût quasi nul.
- **Liaison de comptes** : il faut tester le drapeau « e-mail vérifié » renvoyé par Discord ou Google, pas seulement la présence d'une adresse. Sinon la faille reste ouverte.
- **Comptes déjà liés** : les auditer avant de les délier, comme le dit Pessimiste, avec récupération par un modo.

Ancien admin, je respecte ton argument sur le non-lu, mais ça reste un irritant, pas une prise de compte. Le non-lu passe en semaine 2, juste après les signalements actionnables.

Position : retirer le reset, CSP, XSS et liaison vérifiée d'abord, puis gel CDF, signalements, non-lu.
