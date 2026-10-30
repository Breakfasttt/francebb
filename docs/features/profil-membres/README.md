# Profil et membres

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Chaque coach gère son compte : informations publiques (pseudo, avatar, numéro NAF, région, ligues), réglages (thème, emails, comptes de connexion liés), coachs bloqués, et suppression de son compte. L'annuaire des membres permet de trouver un coach, de lui écrire et, pour la modération, de changer son rôle, de le bannir ou de le supprimer.

## Ce que voit le coach

- `/profile` : « Mon Compte », réservé au membre connecté. Onglets choisis par `?tab=` : sujets suivis (par défaut), activité, `edit` (modifier le profil), `articles`, `ressources`, `settings` (réglages), `blocked` (coachs bloqués).
- `/membres` : l'annuaire, réservé aux membres connectés. Tableau avec filtres (nom, ligue, région, rôle), tri et pagination de 25. Liens vers le profil public, la page NAF et la messagerie. Les modérateurs voient aussi les bannis et le bouton bannir ; ceux qui gèrent les rôles (`canManageRoles`) changent les rôles ; seul le SUPERADMIN voit le bouton supprimer (l'action `deleteUser`, elle, accepte tout modérateur de rang supérieur à la cible).
- `/spy/[id]` : le profil public d'un autre coach. Il réutilise `ProfileSidebar` et permet d'écrire, de bloquer, de signaler, et pour un modérateur, de bannir.
- **Sur téléphone** (et tablette : `app/profile/page-mobile.css` et `useIsMobile` basculent tous deux à 1024 pixels, le seuil unique de la carte 055, au lieu de 900 et 768 avant) : le profil passe sur une colonne ; les onglets quittent la carte du profil et sont déplacés dans le menu latéral global avec `MobilePortal` ; l'avatar est plus petit ; les réglages, la liste des bloqués et l'activité sont empilés.
- **`/membres` sur téléphone** (et tablette, jusqu'à 1024 pixels, cartes 054 et 055) : le tableau, trop large (915 pixels), est remplacé par une liste de cartes empilées, une par membre (`MembersTable-mobile.css`) : nom et avatar en lien de 44 pixels vers le profil, rôle, badge « Banni », numéro NAF, région, ligues, puis les boutons « Message privé », changement de rôle, bannir et supprimer selon les droits. Les filtres (recherche, rôle, région, ligue) et une liste « Trier par » (qui remplace les en-têtes de colonnes cliquables) sont derrière le bouton flottant en forme d'entonnoir (`MobileFilterWrapper`). Sur ordinateur, rien ne change : même bloc de filtres au-dessus du tableau.
- **Problèmes possibles** : `app/profile/page-mobile.css` contient aussi des règles de la messagerie, à ranger.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/profile/page.tsx` | Page client « Mon Compte » ; charge le membre par `/api/users/[id]`. |
| `apps/site/app/profile/component/ProfileSidebar.tsx` | Carte du profil et onglets (aussi utilisée par `/spy/[id]`). |
| `apps/site/app/profile/component/ProfileEdit.tsx`, `ProfileSettings.tsx` | Modification du profil ; réglages, comptes liés, suppression du compte. |
| `apps/site/app/profile/component/ProfileActivity.tsx`, `ProfileArticles.tsx`, `ProfileResources.tsx`, `ProfileBlockedUsers.tsx` | Onglets d'activité, d'articles, de ressources et de blocages. |
| `apps/site/app/profile/actions.ts` | Actions serveur du profil. |
| `apps/site/app/membres/page.tsx` | Annuaire (rendu serveur). |
| `apps/site/app/membres/component/MembersTable.tsx` | Tableau (ordinateur) ou cartes (téléphone), filtres, tri, pagination et fenêtres de modération. |
| `apps/site/app/membres/component/MembersTable-mobile.css`, `apps/site/app/membres/page-mobile.css` | Affichage téléphone de l'annuaire : cartes empilées, tri du téléphone, marges de la page. |
| `apps/site/app/membres/actions.ts` | Actions de modération des membres. |
| `apps/site/lib/accountDeletion.ts` | `anonymizeAndDeleteUser` : suppression d'un compte avec rattachement de ses contenus publics au compte fantôme. Fonction interne (pas une action serveur), appelée par `deleteAccount` et `deleteUser`. |
| `apps/site/app/spy/[id]/page.tsx` | Profil public d'un coach. |
| `apps/site/app/api/users/[id]/route.ts` | Données d'un membre (l'email seulement pour lui-même ou un modérateur). |

Actions serveur : `app/profile/actions.ts` : `updateProfile`, `updateTheme`, `updateNotificationSettings`, `unlinkAccount`, `deleteAccount`, `toggleBlockUser`, `getBlockedUsers`, `getBlockedUsersIds` (utilisée par le forum pour masquer les messages des bloqués), `reportUser`, `getUserStats`, `getUserActivity`, `getReferenceDataAction` (aussi utilisée par l'onboarding). `app/membres/actions.ts` : `updateUserRole`, `toggleBanUser`, `deleteUser`.

## Les pièges

- Le bannissement depuis `/spy/[id]` utilise le `toggleBanUser` de `app/membres/actions.ts` (seule version) : il vérifie la hiérarchie des rôles (`canEditTargetRole`) et trace l'action au journal (carte 050).
- `deleteAccount` (le coach supprime son compte) et `deleteUser` (un modérateur supprime un membre) passent par la même fonction, `anonymizeAndDeleteUser` (`lib/accountDeletion.ts`, carte 051) : ses sujets, messages, articles, ligues, tournois organisés et résultats passent au compte fantôme `ghost_coach` ; ses données privées (messages privés, réactions, inscriptions, parties de quiz) sont supprimées. Le texte de ses messages du forum est remplacé par « [Ce message a été supprimé suite à la clôture du compte] ». Avant, `deleteUser` effaçait définitivement ses sujets et messages. Toute nouvelle table liée à un membre doit être ajoutée à cette fonction, sinon la base refusera de supprimer le membre.
- `/membres` charge tous les membres d'un coup (`include` sans `select`) et les envoie entiers au composant client. Le filtre, le tri et la pagination se font dans le navigateur. Cela contredit la règle « jamais un `User` complet vers un composant client » et ralentira avec le nombre de membres.
- L'annuaire existe en deux versions dans `MembersTable.tsx` : le tableau (ordinateur) et la liste de cartes (téléphone). Le CSS choisit laquelle afficher. Une colonne ou un bouton ajouté au tableau doit aussi être ajouté aux cartes.
- La fenêtre de suppression d'un membre et son message de confirmation annoncent maintenant (carte 054) le vrai comportement de `deleteUser` (contenus rattachés au compte « Coach Inconnu ») : l'ancien texte parlait d'une suppression définitive de tous les messages.
- `/membres` utilise `getActiveSession()` puis relit le rôle en base ; `/profile` renvoie vers `/api/auth/signin` au lieu de `/auth/login`.
- Les actions des membres et du profil renvoient `{ success, error }` au lieu de lever une erreur (carte 052) : le message de refus (rôle trop élevé, membre de l'équipe qu'on ne peut pas bloquer…) s'affiche dans la notification. `toggleBlockUser` renvoie aussi `isBlocked`.
- Les 7 thèmes proposés dans l'onglet « Modifier » viennent de la liste officielle `lib/themes.ts` (carte 062) : identifiant enregistré, nom affiché et thème par défaut (`saison3`). Pour ajouter un thème, on l'ajoute à cette liste en plus de son fichier CSS ; l'action `updateTheme` refuse tout identifiant absent de la liste.
- Dette : types `any` dans la page profil, un commentaire de test oublié dans `app/membres/page.tsx`.

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

- Marche : modification du profil, réglages, blocages, suppression de compte anonymisée (par le membre ou par un modérateur, carte 051), annuaire avec modération, annuaire sur téléphone (cartes empilées et bouton de filtres, carte 054 : aucun contenu coupé ni cible trop petite à 360, 390 et 430 pixels).
- Manque : contrôle de hiérarchie dans le bannissement depuis le profil, pagination côté serveur de `/membres`.
- Cartes : 049 (audit mobile), 054 (annuaire sur téléphone), 019 (avatars en `next/image`), 062 (identifiant du thème « Sombre »).
