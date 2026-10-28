---
id: 051
title: Bugs repérés pendant la rédaction des fiches
epic: E03
app: site
depends_on: []
adr:
verify: chaque point corrigé (ou laissé avec une raison écrite) ; fiches de fonctionnalités mises à jour
---

# 051 — Bugs repérés pendant la rédaction des fiches

## Pourquoi

Comportements incorrects relevés dans les fiches `docs/features/` (sections « Les pièges » et « État »).

## Action

- `cleanupModerationLogs` calcule une date invalide : la purge automatique du journal ne supprime rien.
- `getRolePower` (`lib/roles.ts`) donne la puissance d'un simple coach aux rôles personnalisés, alors que `lib/forumAccess.ts` lit la vraie puissance en base : les deux calculs divergent.
- Ligues : les boutons « Transférer la propriété » et « Supprimer la ligue » ne font rien (actions jamais appelées).
- Tournois : la page de résultats accepte les modérateurs, mais l'enregistrement n'accepte que les admins ; le lien de secours `/tournois/[id]` mène à une page inexistante ; les points du championnat sont calculés dans le navigateur sans recalcul côté serveur.
- BBQuizz : le score et les bonnes réponses sont envoyés au navigateur (triche facile) ; un visiteur est envoyé vers `/auth/signin`, adresse inexistante.
- Statistiques : « Connectés » compte une table qui reste vide (sessions en JWT).
- Thèmes : le thème mémorisé dans le navigateur écrase celui du profil ; seuls 5 thèmes sur 7 sont proposés à l'inscription.
- Suppression d'un membre par un modérateur : ses messages sont effacés définitivement, alors que la suppression de compte par le membre les rattache à un compte « fantôme ».
