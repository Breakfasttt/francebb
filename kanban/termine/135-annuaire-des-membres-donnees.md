---
id: 135
title: "Annuaire : données envoyées et filtre des rôles"
epic: E01
app: site
depends_on: [102]
adr: 
verify: la page /membres n'envoie au navigateur que les champs affichés (vérifié dans le code et par un test) ; le filtre « Rôle » propose aussi les rôles personnalisés de la table RoleConfig
---

# 135 — Annuaire : données envoyées et filtre des rôles

## Pourquoi

Deux défauts trouvés pendant la refonte (carte 092) sur l'annuaire `/membres` :

- La requête lit la fiche complète de chaque membre (pas de `select`, c'est-à-dire sans choisir les champs) et l'envoie au navigateur. Même si certains champs sensibles sont retirés par le client de base de données du site, c'est plus de données que nécessaire : c'est plus lent, et risqué si un champ privé est ajouté un jour à la fiche d'un membre.
- Le filtre « Rôle » ne propose que les rôles de base, pas les rôles personnalisés créés dans la table `RoleConfig`.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Ajouter un `select` qui ne lit que les champs affichés par l'annuaire et par ses actions (bannir, changer le rôle, supprimer).
- Alimenter le filtre « Rôle » avec la table `RoleConfig` (voir `apps/site/lib/roleLabels.ts`).
- Ajouter un test dans `apps/site/tests/e2e/security.spec.ts` qui vérifie qu'aucune donnée non affichée n'arrive au navigateur.

## Résultat

Fait, sans lancer les tests.

- `apps/site/app/membres/page.tsx` : la requête des membres a un `select` qui ne lit que les champs affichés ou utilisés par les actions (identifiant, pseudo, avatar, rôle, bannissement, NAF, région, et l'identifiant, le nom et le sigle des ligues). La liste des régions ne lit plus que la clé et le libellé.
- `apps/site/app/membres/component/MembersTable.tsx` : le filtre « Rôle » propose les rôles de base et tous les rôles de la table `RoleConfig` (libellés lus par `getRoleLabelMap`, déjà transmis à la page), triés du plus puissant au moins puissant puis par ordre alphabétique. Un rôle personnalisé a la puissance d'un coach pour `lib/roles.ts` : sa puissance enregistrée dans `RoleConfig` n'est pas lue par ce tri.
- Test écrit : dans `apps/site/tests/e2e/bugs/articles-membres.spec.ts` et non dans `security.spec.ts` (la consigne de ce lot n'autorisait que ce fichier), groupe « carte 135 » : la page envoyée au navigateur contient le pseudo d'un membre mais aucune de ses données non affichées (signature, équipe, ligue saisie, ancien pseudo du forum, raison de bannissement, adresse email, réglages) ; le filtre « Rôle » propose un rôle personnalisé et le filtrage marche ; contrôle en taille téléphone dans le panneau « Filtrer les membres ».
- Fiche mise à jour : `docs/features/profil-membres/README.md`.
- À essayer à la main : créer un rôle personnalisé dans l'administration, l'attribuer à un membre, puis filtrer `/membres` sur ce rôle.
