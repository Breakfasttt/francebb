# Kanban BBFrance

Une carte = un fichier `kanban/NNN-slug.md`. Le **frontmatter est la source de vérité** : le statut est un champ, pas un dossier (pas de déplacement de fichier, donc pas de carte en double).
`kanban/BOARD.md` est **généré** par `npm run board` — ne jamais l'éditer à la main. La CI échoue s'il n'est pas à jour (`npm run board -- --check`).

## Format d'une carte

```markdown
---
id: 025
title: Titre court
status: refine
epic: E03
app: site
depends_on: [017, 018]
adr: 0002
verify: commande ou vérification observable qui prouve que c'est fini
---

# 025 — Titre court

## Problème
## Action
```

| Champ | Valeurs |
|---|---|
| `id` | 3 chiffres, = préfixe du nom de fichier, unique |
| `status` | `refine` → `ready` → `in_progress` → `done`, ou `cancelled` |
| `epic` | id d'un fichier `kanban/epics/Exx-*.md`, ou vide |
| `app` | `site` (puis `hub`, `bbscheme`, `packages/<nom>` après P3) |
| `depends_on` | ids de cartes, `[]` si aucune |
| `adr` | numéro d'ADR (`docs/adr/`) qui justifie la carte, ou vide |
| `verify` | obligatoire |

## Cycle

- `refine` : à préciser (fichiers, action, verify).
- `ready` : prête, dépendances connues.
- `in_progress` : en cours (une ou deux cartes max à la fois).
- `done` : `verify` vert + CI verte + README de feature à jour + **validation du user** (commande `/ship`).
- `cancelled` : abandonnée, garder la raison dans le corps.

Créer une carte : commande `/card`. Décision irréversible : `/council` d'abord.

## Épics

`kanban/epics/Exx-slug.md` : frontmatter `id`, `title`, `phase` + section « Terminé quand ». L'avancement est calculé dans `BOARD.md`.
