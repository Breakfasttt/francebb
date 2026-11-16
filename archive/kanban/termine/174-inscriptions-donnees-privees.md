---
id: 174
title: "Tournoi : ne plus envoyer l'état de paiement des inscrits à tout le monde"
epic: E10
app: site
depends_on: [164]
verify: "le code de la page d'un sujet de tournoi, ouverte par un visiteur ou un simple membre, ne contient plus l'état de paiement ni les notes privées des inscriptions ; l'organisateur et les commissaires les voient toujours"
---

# 174 — Tournoi : ne plus envoyer l'état de paiement des inscrits à tout le monde

## Pourquoi

La page d'un sujet de tournoi confie le tournoi entier au composant d'inscription (`RegistrationModule`), qui s'exécute dans le navigateur. Toutes les données des inscriptions partent donc dans la page, y compris l'état de paiement de chaque coach, même pour un visiteur (relevé pendant la carte 164).

## Action

1. Repérer les champs des inscriptions, des équipes et des mercenaires qui ne regardent que l'organisateur (paiement, statut interne, notes).
2. Ne les charger que si le lecteur est l'organisateur, un commissaire ou un modérateur ; pour les autres, un `select` réduit à ce qui est affiché publiquement.
3. Vérifier dans le code de la page, en visiteur puis en organisateur.

## Résultat

Parmi les champs des inscriptions, des équipes et des mercenaires, seul l'état de paiement (`paymentStatus`, sur les inscriptions individuelles et sur les équipes) ne regarde que l'organisateur, ses commissaires et la modération. Le statut d'inscription (pré-inscrit, validé, liste d'attente) reste envoyé, car il range chaque coach dans la bonne liste, visible de tous. Les dates de création et de mise à jour ne sont plus envoyées non plus, puisque rien ne les affiche.

La page du sujet (`apps/site/app/forum/topic/[id]/page.tsx`) charge désormais les inscriptions, les équipes et les mercenaires avec trois `select` réduits, ajoutés dans `apps/site/lib/forumPostPrivacy.ts` à côté de ceux de la carte 164. Quand le lecteur est l'organisateur, un commissaire ou un modérateur (la même règle que l'action `updateRegistrationStatus`), la page lit l'état de paiement dans une requête à part et l'ajoute avec la fonction `withPaymentStatus`. Le module d'inscription (`apps/site/app/forum/component/RegistrationModule.tsx`) ne reçoit plus le tournoi entier (avec sa ligue, ses résultats et ses rondes), mais un objet réduit aux champs qu'il lit, décrit par le type `RegistrationTournament`, qui remplace l'ancien type `any` de cette propriété.

Vérification : un script temporaire a créé, dans une transaction annulée à la fin (la base de développement n'a pas été modifiée), un tournoi avec une inscription payée et une équipe « paiement sur place », puis a reconstruit les données confiées au module comme le fait la page. Avec l'ancien chargement, l'état de paiement était présent ; pour un visiteur, il est absent (ainsi que les dates) ; pour l'organisateur, il est présent. `corepack pnpm check` passe. Le test d'inventaire `tests/e2e/inventaire/tournois.spec.ts` (réglage du paiement par l'organisateur) n'a pas été relancé, un autre test utilisant la base de test au même moment.

Point remarqué, non modifié : un modérateur qui n'est ni organisateur ni commissaire reçoit l'état de paiement, mais le module n'affiche les réglages qu'à l'organisateur et aux commissaires (`canManage`), alors que l'action serveur l'autorise. Une carte pourra décider s'il faut lui montrer ces réglages.
