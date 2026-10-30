---
id: 082
title: "Composants de base dans packages/ui"
epic: E08
app: packages/ui
depends_on: [077, 080]
adr: 0006
verify: composants exportés par @bbfrance/ui et utilisés par le site ; aucune bibliothèque ajoutée ; typecheck et lint verts
---

# 082 — Composants de base dans packages/ui

## Pourquoi

Les écrans refaits ont besoin des mêmes briques : carte, panneau qui monte du bas, menu « ⋯ », onglets, badges, champs. Sans composants communs, chaque écran réinventerait les siens.

## Action

- Lire le skill `reuse-first` et le skill `shadcn`.
- Créer dans `packages/ui` : Card, Sheet (panneau qui monte du bas, basé sur le `Dialog` existant), ActionMenu (menu « ⋯ » : panneau sur téléphone, liste déroulante sur ordinateur), Tabs, Badge, Avatar, Input, Textarea, Select, Switch, Tooltip, Pagination, EmptyState, Skeleton, ListRow. Radix vient du paquet `radix-ui`, déjà installé.
- Les composants de `apps/site/common/components` qui ont un équivalent deviennent de simples enveloppes de ces composants, sans changer leur interface publique.
- Mettre à jour la liste du skill `reuse-first`.
