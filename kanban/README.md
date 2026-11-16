# Kanban BBFrance

Le kanban ne sert qu'aux **gros chantiers** : un travail qui demande plusieurs séances, ou qui touche la connexion des membres, la sécurité, la base de données ou une nouvelle application. Une petite ou moyenne modification n'a pas de carte : son message de commit sert de journal (titre clair, corps qui dit pourquoi).

## Où sont les cartes

Le dossier d'une carte **est** son état :

| Dossier | Contenu |
|---|---|
| `a-faire/` | Chantiers pas encore commencés |
| `en-cours/` | Chantiers en cours |

Une carte terminée ou abandonnée part dans `archive/kanban/` avec `git mv`. Ce qui reste à essayer à la main (vrai téléphone, vrai compte Discord ou Google…) va dans [TESTS-MANUELS.md](../TESTS-MANUELS.md), pas dans une carte.

`pnpm kanban` liste les cartes et vérifie que chacune a un numéro unique.

## Format d'une carte

Nom du fichier : `NNN-titre-court.md`, où `NNN` est le plus grand numéro existant + 1 (archives comprises).

```markdown
---
id: 219
title: Titre court
---

# 219 — Titre court

## Pourquoi
## À faire
## Résultat
```

La section « Résultat » se remplit à la fin : ce qui a été fait, les décisions prises, ce qui reste à essayer à la main (recopié dans `TESTS-MANUELS.md`). Une carte abandonnée dit pourquoi dans une section « Annulée ».

Champs facultatifs : `app` (application concernée), `adr` (numéro de la décision écrite dans `docs/adr/`).

## Les étapes

1. `/card` rédige la carte dans `a-faire/`.
2. Démarrage : la carte passe dans `en-cours/`.
3. Fin : `/ship` vérifie, remplit le « Résultat » et range la carte dans `archive/kanban/`.
