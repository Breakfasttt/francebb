# ADR-0004 — Remettre de l'ordre dans le projet et passer à Postgres

- **Statut** : accepté
- **Date** : 2026-10-28
- **Conseil** : oui (`/council`), décision finale prise par le user

> Un ADR (Architecture Decision Record) est une fiche qui garde la trace d'une décision importante : le problème, le choix fait, et pourquoi. Voir `docs/GLOSSAIRE.md`.

## Le problème

**Le projet est difficile à lire**, pour un développeur qui arrive comme pour l'IA :

- la racine du projet est encombrée (copies de base de données, journaux, résultats de tests) ;
- la même règle est écrite à 6 ou 8 endroits ;
- le kanban est une longue liste de fichiers, où le statut est caché à l'intérieur de chaque carte ;
- le dossier `.claude` (consignes de l'IA) contient des fichiers périmés ;
- seules 3 fonctionnalités ont une fiche explicative.

**La base de données de production pose problème depuis le début.** Elle est hébergée chez Turso. Le site s'y connecte bien, mais l'outil qui met à jour sa structure (Prisma Migrate) ne sait pas joindre une base Turso distante. Il fallait donc appliquer les changements à la main, sans historique (voir ADR-0002 et l'ancien skill `database-ops`).

Le site était en bêta, avec 4 à 5 utilisateurs : on peut repartir d'une base neuve, **sans conserver les données**.

## La décision

1. **Base de données : Postgres, hébergé chez Neon.** On repart d'une base vide, avec une seule migration de départ. La structure est mise à jour automatiquement à chaque déploiement.
   - En local, **pas de Docker** (il ne fonctionne pas sur le poste du développeur). On utilise, dans cet ordre de préférence :
     1. le serveur Postgres local de Prisma (`npx prisma dev`) ;
     2. une base Neon de développement ;
     3. l'installation classique de Postgres.
   - Un essai de 4 heures (carte 041) valide le choix avant la bascule.
2. **Une fiche par fonctionnalité** dans `docs/features/<nom>/README.md`, toujours sur le même modèle :
   - À quoi ça sert ;
   - Ce que voit le coach ;
   - Les fichiers ;
   - Les pièges ;
   - Les mots expliqués.

   Le code ne change pas de place.
3. **Kanban rangé en dossiers** : `a-faire/`, `en-cours/`, `termine/`, `annule/`, `deprecie/`. Le dossier donne le statut. Plus de tableau généré (`BOARD.md`).
4. **Documentation** : le `README.md` à la racine devient l'unique porte d'entrée. Un glossaire (`docs/GLOSSAIRE.md`) explique tous les termes techniques. Chaque règle n'est écrite qu'à un seul endroit.
5. **Le dossier `.claude` est nettoyé.** Les membres du conseil sont renommés pour que leur nom dise leur rôle :
   - vérificateur des faits ;
   - avocat du diable ;
   - visionnaire ;
   - voix des utilisateurs ;
   - arbitre.
6. **Deux règles absolues du projet** :
   - tout doit être compréhensible par quelqu'un qui découvre le projet ;
   - **le site doit être impeccable sur mobile** (ergonomie, fluidité). Cette règle est inscrite dans le README, dans les consignes de l'IA et dans chaque fiche de fonctionnalité.

## Pourquoi

- **Postgres** est la base la plus utilisée avec Prisma et Vercel : les migrations y fonctionnent sans contournement. Le problème Turso disparaît au lieu d'être contourné.
- **Les fiches dans `docs/features/`** donnent une vue claire de chaque fonctionnalité, sans déplacer des centaines de fichiers de code (moins de risques de casse).
- **Les dossiers du kanban** se lisent sans aucun outil.

**Options écartées :**

| Option | Raison du rejet |
|---|---|
| Rester sur Turso | Le problème des migrations n'est pas résolu |
| Supabase | Fournit beaucoup plus que nécessaire |
| Docker en local | Ne fonctionne pas sur le poste |
| Déplacer le code dans des dossiers `features/` | Gros chantier risqué pour un gain faible |

## Ce qu'on ne fait pas

- Pas de déplacement du code des fonctionnalités.
- Pas de changement de base de données et de rangement dans la même étape.
- On ne conserve pas les données de la bêta (accord exprès du user). Les bêta-testeurs sont prévenus 7 jours avant.

## Risques

- **L'essai Postgres échoue.** On reste sur Turso en repartant d'une base propre avec une seule migration, et on écrit un nouvel ADR.
- **Retour arrière** : les tags git `pre-reorg-dev` et `pre-reorg-p5` marquent l'état d'avant la réorganisation.

## Cartes

| Cartes | Sujet |
|---|---|
| 040 | Fusion des branches |
| 041 | Essai Postgres |
| 042 | Nettoyage de la racine |
| 043 | Kanban en dossiers |
| 044 | README, glossaire, dédoublonnage |
| 045 | Fiches des fonctionnalités |
| 046 | Bascule du site et du hub sur Postgres |
| 047 | Mise en production |
| 048 | Nettoyage de `.claude` |
| 049 | Audit mobile |

Cartes annulées : 011, 012, 025 et 026 (Turso). La carte 029 est reprise dans la 042.
