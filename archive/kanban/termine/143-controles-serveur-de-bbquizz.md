---
id: 143
title: "BBQuizz : contrôles côté serveur"
epic: E01
app: site
depends_on: [102]
adr: 
verify: les actions serveur de BBQuizz refusent une proposition incomplète ou incohérente, n'enregistrent que les champs prévus et ne créent pas de doublon quand une proposition est approuvée deux fois ; tests dans security.spec.ts
---

# 143 — BBQuizz : contrôles côté serveur

## Pourquoi

Défauts trouvés pendant la refonte de BBQuizz (carte 098), dans `apps/site/app/bbquizz/actions.ts` :

- `updateQuizQuestion` enregistre tel quel l'objet reçu (type `any`) : un modérateur pourrait y glisser d'autres colonnes de la table.
- `suggestQuizQuestion` ne vérifie rien côté serveur : réponses vides, numéro de bonne réponse hors de 0 à 3, textes très longs.
- `handleQuizSuggestion` ne vérifie pas que la proposition est encore en attente : l'approuver deux fois crée une question en double. Un identifiant inconnu provoque une erreur non gérée.
- Le classement « Semaine » commence le dimanche, à l'heure du serveur, au lieu du lundi à l'heure de Paris.
- Le champ `quizStreak` n'est jamais mis à jour.

Les trois premiers points touchent la sécurité et l'intégrité des données. Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Ne recopier dans `updateQuizQuestion` que les champs prévus (question, réponses, bonne réponse, catégorie, explication).
- Valider côté serveur les propositions (4 réponses non vides, bonne réponse entre 0 et 3, longueurs maximales).
- Dans `handleQuizSuggestion`, vérifier le statut « en attente » et renvoyer une erreur claire si la proposition n'existe pas.
- Faire commencer la semaine le lundi, heure de Paris ; décider avec le responsable si `quizStreak` doit être calculé ou retiré.
- Ajouter les tests dans `apps/site/tests/e2e/security.spec.ts`.

## Résultat

Ce qui a été fait, dans `apps/site/app/bbquizz/actions.ts` :

- `suggestQuizQuestion` et `updateQuizQuestion` passent par un même contrôle côté serveur : catégorie (60 caractères au plus), question (500), quatre réponses non vides (200 chacune), bonne réponse entier entre 0 et 3, explication facultative (1 000). Seuls ces champs sont enregistrés : une colonne en plus glissée dans la requête (compteurs de réponses, image…) est ignorée. Le type `any` de `updateQuizQuestion` est retiré.
- `handleQuizSuggestion` renvoie « Proposition introuvable » pour un identifiant inconnu, et « déjà été traitée » pour une proposition qui n'est plus en attente. Le changement de statut et la création de la question se font dans une transaction, et le statut n'est changé que s'il vaut encore `PENDING` : deux approbations simultanées ne peuvent pas créer de doublon.
- Ces trois actions renvoient `{ success, error }` (`ActionResult`) ; `ProposerContent.tsx`, `EditQuestion.tsx` et `ValiderContent.tsx` affichent le message du serveur dans la notification.
- Les classements « Du jour » et « Semaine » commencent à minuit, heure de Paris, et la semaine le lundi (`startOfQuizDay` et `startOfQuizWeek` dans `apps/site/app/bbquizz/utils.ts`, calculés avec `Intl`, sans nouvelle bibliothèque). Le serveur Vercel tourne en heure universelle : avant, la journée commençait à 1 h ou 2 h du matin, heure de Paris.
- `quizStreak` : **colonne gardée, rien de changé** (choix prudent, sans changement de la structure de la base). La série reste affichée dans le classement quand elle existe, c'est-à-dire jamais pour l'instant.

Fichiers modifiés : `apps/site/app/bbquizz/actions.ts`, `apps/site/app/bbquizz/utils.ts`, `apps/site/app/bbquizz/proposer/ProposerContent.tsx`, `apps/site/app/bbquizz/editer/EditQuestion.tsx`, `apps/site/app/bbquizz/valider/ValiderContent.tsx`, `apps/site/tests/e2e/security.spec.ts`, `docs/features/bbquizz/README.md`, `docs/GLOSSAIRE.md` (mot « Transaction »).

Tests écrits dans `apps/site/tests/e2e/security.spec.ts` (groupe « Carte 143 ») : cinq propositions faussées en route (réponse vide, deux réponses seulement, bonne réponse 7, question et réponse trop longues), toutes refusées avec leur message ; modification d'une question avec des colonnes en plus, ignorées ; approbation rejouée (refusée, une seule question créée) et proposition inconnue ; début du jour et de la semaine à l'heure de Paris, en hiver, en été et le jour du passage à l'heure d'été.

**Question pour le responsable** : faut-il calculer la série (`quizStreak`, nombre de jours joués d'affilée) ou retirer la colonne ? La retirer demande une migration de la base ; la calculer demande de décider ce qu'est un « jour joué » (une partie finie dans la journée, heure de Paris ?).

À essayer à la main : proposer une question, l'approuver depuis deux onglets ouverts sur `/bbquizz/valider` (le second affiche « déjà été traitée ») ; modifier une question ; regarder le classement « Semaine » un lundi matin.
