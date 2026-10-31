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
