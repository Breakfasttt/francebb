# Profil et membres

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Chaque coach gère son compte : informations publiques (pseudo, avatar, numéro NAF, région, ligues), réglages (thème, emails, comptes de connexion liés), coachs bloqués, et suppression de son compte. L'annuaire des membres permet de trouver un coach, de lui écrire et, pour la modération, de changer son rôle, de le bannir ou de le supprimer.

## Ce que voit le coach

- `/profile` : « Mon Compte », réservé au membre connecté. Onglets choisis par `?tab=` : sujets suivis (par défaut), activité, `edit` (modifier le profil), `articles`, `ressources`, `settings` (réglages), `blocked` (coachs bloqués).
- `/membres` : l'annuaire, réservé aux membres connectés. Tableau avec filtres (nom, ligue, région, rôle), tri et pagination de 25. Liens vers le profil public, la page NAF et la messagerie. Les modérateurs voient aussi les bannis et le bouton bannir ; ceux qui gèrent les rôles (`canManageRoles`) changent les rôles ; seul le SUPERADMIN voit le bouton supprimer (l'action `deleteUser`, elle, accepte tout modérateur de rang supérieur à la cible).
- `/spy/[id]` : le profil public d'un autre coach. Il réutilise `ProfileSidebar` et permet d'écrire, de bloquer, de signaler, et pour un modérateur, de bannir.
- **Sur téléphone** (`app/profile/page-mobile.css`, 900 pixels, et `useIsMobile`, 768 pixels) : le profil passe sur une colonne ; les onglets quittent la carte du profil et sont déplacés dans le menu latéral global avec `MobilePortal` ; l'avatar est plus petit ; les réglages, la liste des bloqués et l'activité sont empilés.
- **Problèmes possibles** : `/membres` n'a aucune règle mobile (pas de `page-mobile.css`, aucun `@media` dans `MembersTable.css`). Le tableau défile dans son cadre (`overflow-x: auto`), ce qui évite le défilement de la page, mais il reste peu pratique au pouce ; les filtres ne passent pas par `MobileFilterWrapper`. `app/profile/page-mobile.css` contient aussi des règles de la messagerie, à ranger.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/profile/page.tsx` | Page client « Mon Compte » ; charge le membre par `/api/users/[id]`. |
| `apps/site/app/profile/component/ProfileSidebar.tsx` | Carte du profil et onglets (aussi utilisée par `/spy/[id]`). |
| `apps/site/app/profile/component/ProfileEdit.tsx`, `ProfileSettings.tsx` | Modification du profil ; réglages, comptes liés, suppression du compte. |
| `apps/site/app/profile/component/ProfileActivity.tsx`, `ProfileArticles.tsx`, `ProfileResources.tsx`, `ProfileBlockedUsers.tsx` | Onglets d'activité, d'articles, de ressources et de blocages. |
| `apps/site/app/profile/actions.ts` | Actions serveur du profil. |
| `apps/site/app/membres/page.tsx` | Annuaire (rendu serveur). |
| `apps/site/app/membres/component/MembersTable.tsx` | Tableau, filtres, tri, pagination et fenêtres de modération. |
| `apps/site/app/membres/actions.ts` | Actions de modération des membres. |
| `apps/site/app/spy/[id]/page.tsx` | Profil public d'un coach. |
| `apps/site/app/api/users/[id]/route.ts` | Données d'un membre (l'email seulement pour lui-même ou un modérateur). |

Actions serveur : `app/profile/actions.ts` : `updateProfile`, `updateTheme`, `updateNotificationSettings`, `unlinkAccount`, `deleteAccount`, `toggleBlockUser`, `getBlockedUsers`, `getBlockedUsersIds` (utilisée par le forum pour masquer les messages des bloqués), `reportUser`, `getUserStats`, `getUserActivity`, `toggleBanUser`, `getReferenceDataAction` (aussi utilisée par l'onboarding). `app/membres/actions.ts` : `updateUserRole`, `toggleBanUser`, `deleteUser`.

## Les pièges

- Il existe **deux** `toggleBanUser` : celle de `app/membres/actions.ts` vérifie la hiérarchie des rôles (`canEditTargetRole`) ; celle de `app/profile/actions.ts`, appelée depuis le profil public, ne la vérifie pas. Un modérateur peut donc bannir un admin depuis `/spy/[id]`. À corriger.
- `deleteAccount` (le coach supprime son compte) anonymise : ses sujets, messages, articles et résultats passent au compte fantôme `ghost_coach`. Mais `deleteUser` (un modérateur supprime un membre) **efface définitivement** ses sujets et ses messages du forum. Règle du projet : jamais de suppression de données sans accord exprès.
- `/membres` charge tous les membres d'un coup (`include` sans `select`) et les envoie entiers au composant client. Le filtre, le tri et la pagination se font dans le navigateur. Cela contredit la règle « jamais un `User` complet vers un composant client » et ralentira avec le nombre de membres.
- `/membres` utilise `auth()` puis relit le rôle en base ; `/profile` renvoie vers `/api/auth/signin` au lieu de `/auth/login`.
- Dette : `throw` dans les deux fichiers d'actions (12 et 13), types `any` dans la page profil, un commentaire de test oublié dans `app/membres/page.tsx`.

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

- Marche : modification du profil, réglages, blocages, suppression de compte anonymisée, annuaire avec modération.
- Manque : contrôle de hiérarchie dans le bannissement depuis le profil, suppression par un modérateur qui anonymise au lieu d'effacer, pagination côté serveur de `/membres`, version mobile de l'annuaire.
- Cartes : 049 (audit mobile), 019 (avatars en `next/image`).
