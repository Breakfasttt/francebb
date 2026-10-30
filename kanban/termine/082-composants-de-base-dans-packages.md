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

## Résultat

- **Nouveaux fichiers dans `packages/ui/src/`**, tous exportés par `index.ts` :
  - `sheet.tsx` : panneau qui monte du bas, tiroir ou fenêtre centrée, sur la fenêtre Radix déjà présente, avec la marge de la zone protégée de l'iPhone ;
  - `action-menu.tsx` : menu « ⋯ », sous forme de panneau sur téléphone et de liste déroulante Radix sur ordinateur ;
  - `card.tsx` : carte, en-tête, titre, corps et ligne de liste ;
  - `badge.tsx` : étiquette et pastille de compteur ;
  - `avatar.tsx`, `field.tsx` (libellé, champ, zone de texte, liste, bloc de champ), `switch.tsx`, `tooltip.tsx` ;
  - `tabs.tsx` : onglets dans la page, et onglets liés à l'adresse (`LinkTabs`) ;
  - `page-nav.tsx` : pagination « Page 3 sur 5 » ;
  - `feedback.tsx` : liste vide et squelette de chargement ;
  - `use-media-query.ts` : seuil de 1024 px, qui part de la version téléphone au premier rendu.
- **Boutons.** `Button` reçoit les variantes `primary`, `secondary`, `quiet` et `danger`, et les tailles tactiles `tap` et `tap-icon` (44 px). Ses valeurs par défaut ne changent pas.
- **Aucune bibliothèque ajoutée.** Radix vient du paquet `radix-ui`, déjà installé.
- **Écart avec le plan.** Les composants historiques de `common/components` ne deviennent pas des enveloppes des nouveaux, parce que cela changerait l'apparence des écrans pas encore refaits. Ils sont remplacés écran par écran, puis supprimés à la carte 101.
- **Correction de la carte 078.** La couleur ajoutée au widget de thème de développement était écrite en hexadécimal : elle passe en `rgb()`.
- Skill `reuse-first` mis à jour.
- **Vérifications.** Types verts pour `packages/ui` et le site. ESLint : site à 817 erreurs (plafond 817), `packages/ui` à 0. Ces composants sont vérifiés à l'écran par les cartes qui les utilisent, à commencer par la coquille (081).
