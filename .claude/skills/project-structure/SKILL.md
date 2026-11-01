---
name: project-structure
description: Où créer un nouveau fichier, composant ou page dans BBFrance, et comment le nommer. À lire avant de créer un fichier ou un dossier.
---

# Où ranger un nouveau fichier

Le plan des dossiers et leurs règles sont dans `ARCHITECTURE.md` (section « Où mettre le code ») : le lire d'abord. Ce skill ne précise que les conventions de nommage et les cas courants.

## Une nouvelle page

- Dossier `apps/site/app/<adresse>/`. Exemple : `app/classement/` correspond à l'adresse `/classement`.
- Fichiers :
  - `page.tsx` (la page), mise en forme en classes Tailwind avec les variables v2 (skill `theming-rules`), ajustements pour téléphone avec `max-lg:` ;
  - `actions.ts` si la page lit ou modifie des données.
- Pas de `page.css` : toute la mise en forme passe par les classes Tailwind.

## Un nouveau composant

- Utilisé par une seule rubrique du site : `app/<rubrique>/component/<Nom>.tsx` (exemple : `app/forum/component/TopicTools.tsx`).
- Utilisé par au moins deux rubriques : `common/components/<Nom>/<Nom>.tsx` (un dossier par composant), puis l'ajouter au skill `reuse-first`.
- Partagé entre plusieurs applications (site, hub…) : `packages/ui/src/<nom>.tsx`, en minuscules avec des tirets comme les composants shadcn (`confirm-dialog.tsx`), exporté par `src/index.ts` (voir `packages/ui/CLAUDE.md`). Une partie de BBScheme (lecteur, terrain, pions) : `packages/bbscheme-player/src/` (voir son `CLAUDE.md`).
- La mise en forme s'écrit en classes Tailwind dans le `.tsx`, avec un réglage téléphone en `max-lg:` (skill `mobile-ux`). Pas de fichier `-mobile.css`. Un fichier `<Nom>.css` à côté du composant n'est permis que pour ce que Tailwind exprime mal (skill `theming-rules`).

## Autres cas

| Besoin | Emplacement |
|---|---|
| Fonction côté serveur (base de données, droits, mail…) | `apps/site/lib/` |
| Petite fonction ou hook côté navigateur | `apps/site/common/utils/`, `apps/site/common/hooks/` |
| Changement de structure de la base | `apps/site/prisma/schema.prisma`, puis une migration Prisma |
| Script ponctuel | `apps/site/scripts/`, à supprimer après usage |
| Nouvelle fonctionnalité | Créer aussi sa fiche `docs/features/<nom>/README.md` (modèle `docs/features/TEMPLATE.md`) |
| Nouveau terme technique | L'ajouter à `docs/GLOSSAIRE.md` |

## Noms

- Fichiers de composants du site en `PascalCase` (`UserAvatar.tsx`), autres fichiers en `camelCase` (`forumAccess.ts`). Dans `packages/ui`, minuscules et tirets (`page-nav.tsx`), comme shadcn.
- Code en anglais, commentaire d'en-tête de fichier en français : il dit en une ou deux phrases à quoi sert le fichier.
