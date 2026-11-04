# Profil et membres

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Chaque coach gère son compte : informations publiques (pseudo, avatar, numéro NAF, région, ligues), réglages (thème, emails, comptes de connexion liés), coachs bloqués, et suppression de son compte. L'annuaire des membres permet de trouver un coach, de lui écrire et, pour la modération, de changer son rôle, de le bannir ou de le supprimer.

## Ce que voit le coach

Depuis la refonte (carte 092, ADR 0006), les trois écrans utilisent les composants et les couleurs v2 de `packages/ui`.

- `/profile` : « Mon compte », réservé au membre connecté. Sur ordinateur, la carte du membre à gauche (avatar avec son cadre, pseudo, rôle en clair, badge « Banni », NAF, nombre de messages, région, équipe, ligues), les onglets et leur contenu à droite. Sur téléphone, une seule colonne : la carte, puis la rangée des onglets (elle défile de côté), puis le contenu ; avant la refonte, les onglets étaient rangés dans le panneau « Plus ». Chaque onglet est un lien `?tab=` : `followed` (sujets suivis, par défaut, 20 par page, pastille « Non lu »), `activity`, `articles` (6 par page), `ressources` (5 par page, « Éditer », « Supprimer » avec confirmation), `blocked` (« Débloquer »), `edit`, `settings`.
- Onglet `edit` : blocs empilés comme à l'inscription. Avatar de quatre façons (adresse de l'image, « Aléatoire », « Générer » qui ouvre le générateur DiceBear partagé avec l'inscription, « Envoyer une image » vers ImgBB) ; contour d'avatar dans une liste (les contours pas encore débloqués sont grisés) ; pseudo, NAF, région, équipe ; ligues ; signature (250 caractères) ; thème avec le sélecteur du menu du compte (`AppShell/ThemePicker`), appliqué et enregistré tout de suite.
- Onglet `settings` : passeport Blood Bowl (mode hub), moyens de connexion (« Associer » ou « Délier » Discord et Google ; le dernier moyen ne peut pas être délié), bloc « Notifications » (carte 167 : e-mails des messages privés, des sujets suivis et des annonces, et « Suivre automatiquement mes sujets » ; l'interrupteur « Mentions » a disparu, car les mentions n'envoient plus d'e-mail), newsletter de test en développement, « Supprimer mon compte » avec deux confirmations (en mode hub : lien vers le passeport).
- `/spy/[id]` : le profil d'un autre coach, même mise en page, onglets « Activité du forum » et « Articles » (`?tab=`). Boutons « Message privé », « Signaler », « Bloquer » ou « Débloquer » (pas sur un modérateur) et, pour un modérateur, « Bannir » ou « Débannir ». Chaque action passe par une fenêtre de confirmation (panneau qui monte du bas sur téléphone). Son propre identifiant renvoie vers `/profile`.
- `/membres` : l'annuaire, réservé aux membres connectés. Recherche par nom toujours visible ; sur ordinateur, filtres (rôle, région, ligue) au-dessus d'un tableau dont les en-têtes trient la liste ; sur téléphone, un membre par carte, et les filtres avec le tri dans le panneau « Filtrer les membres » ouvert par le bouton « Filtres ». Les filtres actifs sont rappelés en pastilles. 25 membres par page. Pour un modérateur : les bannis sont visibles, « Bannir », « Débannir » et « Supprimer » (super administrateur) sont dans le menu « ⋯ » de chaque membre, et le rôle se change avec la liste « Changer le rôle ».

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/profile/page.tsx` | Page client « Mon compte » ; lit l'onglet dans l'adresse et charge le membre par `/api/users/[id]`. |
| `apps/site/app/profile/component/ProfileSidebar.tsx` | Carte du membre et actions sur un autre membre (aussi utilisée par `/spy/[id]`). |
| `apps/site/app/profile/component/profileLayout.ts` | Largeur et grille communes à `/profile` et `/spy/[id]`. |
| `apps/site/app/profile/component/ProfileFollowedTopics.tsx`, `ProfileActivity.tsx`, `ProfileArticles.tsx`, `ProfileResources.tsx`, `ProfileBlockedUsers.tsx` | Onglets des sujets suivis, de l'activité, des articles, des ressources et des blocages. |
| `apps/site/app/profile/component/ProfileEdit.tsx`, `ProfileSettings.tsx` | Modification du profil ; réglages, comptes liés, suppression du compte. |
| `apps/site/app/profile/actions.ts` | Actions serveur du profil. |
| `apps/site/app/spy/[id]/page.tsx` | Profil d'un autre coach. |
| `apps/site/app/membres/page.tsx`, `component/MembersTable.tsx` | Annuaire : lecture serveur, puis recherche, filtres, tri, pagination et fenêtres de modération dans le navigateur. |
| `apps/site/app/membres/actions.ts` | Actions de modération des membres. |
| `apps/site/common/components/AvatarGenerator/AvatarGeneratorSheet.tsx` | Générateur d'avatar DiceBear, partagé avec l'inscription. |
| `apps/site/common/components/BanUserDialog/BanUserDialog.tsx` | Fenêtre « Bannir » ou « Débannir », partagée par `/spy/[id]` et `/membres`. |
| `apps/site/lib/roleLabels.ts` | Libellés des rôles lus dans la table `RoleConfig`, pour afficher « Modérateur » au lieu de `MODERATOR`. |
| `apps/site/lib/accountDeletion.ts` | `anonymizeAndDeleteUser` : suppression d'un compte avec rattachement de ses contenus publics au compte fantôme. Fonction interne (pas une action serveur), appelée par `deleteAccount` et `deleteUser`. |
| `apps/site/app/api/users/[id]/route.ts` | Données d'un membre (l'email seulement pour lui-même ou un modérateur). |
| `apps/site/tests/e2e/inventaire/profil.spec.ts` | Test d'inventaire des trois écrans, en taille ordinateur et téléphone (carte 092). |

Actions serveur : `app/profile/actions.ts` : `updateProfile`, `updateTheme`, `updateNotificationSettings`, `unlinkAccount`, `deleteAccount`, `toggleBlockUser`, `getBlockedUsers`, `getBlockedUsersIds` (utilisée par le forum pour masquer les messages des bloqués), `reportUser`, `getUserStats`, `getUserActivity`, `getReferenceDataAction` (aussi utilisée par l'onboarding), `getRoleLabels` (carte 092). `app/membres/actions.ts` : `updateUserRole`, `toggleBanUser`, `deleteUser`.

## Les pièges

- Le bannissement depuis `/spy/[id]` utilise le `toggleBanUser` de `app/membres/actions.ts` (seule version) : il vérifie la hiérarchie des rôles (`canEditTargetRole`) et trace l'action au journal (carte 050). La raison envoyée garde le format « [raison rapide] précisions ».
- `deleteAccount` (le coach supprime son compte) et `deleteUser` (un modérateur supprime un membre) passent par la même fonction, `anonymizeAndDeleteUser` (`lib/accountDeletion.ts`, carte 051) : ses sujets, messages, articles, ligues, tournois organisés et résultats passent au compte fantôme `ghost_coach` ; ses données privées (messages privés, réactions, inscriptions) sont supprimées. Les parties et les scores du quiz sont dans la base de l'application BBQuizz depuis la carte 180 : le site ne peut plus les effacer, ce sera fait par l'application à sa relance, prévenue par le hub. Toute nouvelle table liée à un membre doit être ajoutée à cette fonction, sinon la base refusera de supprimer le membre.
- `/membres` charge tous les membres d'un coup, mais seulement les champs que l'annuaire affiche ou dont ses actions ont besoin (identifiant, pseudo, avatar, rôle, bannissement, NAF, région, ligues), grâce à un `select` (carte 135). Tout ce qui est lu part dans la page envoyée au navigateur : un champ ajouté à ce `select` devient visible par tout membre connecté. Le test `tests/e2e/bugs/articles-membres.spec.ts` vérifie qu'aucun champ non affiché n'y arrive. Charger tous les membres ralentira avec leur nombre.
- Le filtre « Rôle » de l'annuaire propose les rôles de base et les rôles personnalisés de la table `RoleConfig` (carte 135), du plus puissant au moins puissant.
- L'annuaire existe en deux versions dans `MembersTable.tsx` : le tableau (ordinateur) et la liste de cartes (téléphone), choisies par les classes `hidden lg:block` et `lg:hidden`. Une colonne ou un bouton ajouté au tableau doit aussi être ajouté aux cartes.
- En mode hub (ADR-0007), le pseudo, l'avatar, le NAF et la région appartiennent au passeport : « Sauvegarder le profil » les envoie d'abord au hub, qui peut refuser. La suppression du compte se fait aussi sur le passeport.
- Les pages de profil sont des composants client : un visiteur non connecté est renvoyé vers `/auth/login` par le JavaScript (carte 106).
- Les actions des membres et du profil renvoient `{ success, error }` au lieu de lever une erreur (carte 052) : le message de refus s'affiche dans la notification. `toggleBlockUser` renvoie aussi `isBlocked`.
- Le thème du profil vient de la liste officielle `lib/themes.ts` (carte 062) ; l'action `updateTheme` refuse tout identifiant absent de la liste.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Profil public (*spy*) | La page d'un autre coach, à l'adresse `/spy/[id]`. |
| Bloquer | Masquer un coach : ses messages du forum sont cachés et il n'apparaît plus dans les recherches de coachs. |
| Bannir | Sanction de modération : le coach ne peut plus agir sur le site (voir `docs/features/auth/`). |
| Compte fantôme (`ghost_coach`) | Compte « Coach Inconnu » auquel on rattache les contenus d'un coach qui a supprimé son compte. |
| Compte lié | Moyen de connexion rattaché au compte (Discord, Google) ; on peut le délier dans les réglages. |
| Numéro NAF | Identifiant du coach à la fédération internationale ; il donne un lien vers sa page NAF. |
| Hiérarchie des rôles | On ne peut agir que sur un membre de rôle inférieur au sien (`lib/roles.ts`). |

## État

- Marche : modification du profil, réglages, blocages, suppression de compte anonymisée (par le membre ou par un modérateur, carte 051), annuaire avec modération ; refonte des trois écrans (carte 092), vérifiée par `tests/e2e/inventaire/profil.spec.ts` en taille ordinateur et téléphone.
- Carte 167 : bloc « Notifications » du profil (préférence `autoFollowTopics` ajoutée, interrupteur « Mentions » retiré ; la colonne `notifMention`, devenue sans effet, a été supprimée de la base par la carte 171 et ne figure plus dans l'export des données du membre ni dans la fiche renvoyée par `/api/users/[id]`).
- Manque : pagination côté serveur de `/membres`.
- Cartes : 049 (audit mobile), 054 (annuaire sur téléphone), 019 (avatars en `next/image`), 062 (identifiant du thème « Sombre »), 063 (fluidité du profil), 061 (textes de 12 pixels), 092 (refonte).
