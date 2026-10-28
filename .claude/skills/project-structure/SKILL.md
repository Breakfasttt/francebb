---
name: project-structure
description: Où créer un nouveau fichier, composant ou page dans BBFrance, et comment le nommer. À lire avant de créer un fichier ou un dossier.
---

# Où ranger un nouveau fichier

Le plan des dossiers et leurs règles sont dans `ARCHITECTURE.md` (section « Où mettre le code ») : le lire d'abord. Ce skill ne précise que les conventions de nommage et les cas courants.

## Une nouvelle page

- Dossier `apps/site/app/<adresse>/`. Exemple : `app/classement/` correspond à l'adresse `/classement`.
- Fichiers :
  - `page.tsx` (la page) ;
  - `page.css` (son style) ;
  - `page-mobile.css` (ses ajustements pour téléphone) ;
  - `actions.ts` si la page lit ou modifie des données.
- Les deux fichiers CSS sont importés dans `page.tsx`.

## Un nouveau composant

- Utilisé par une seule page : `app/<page>/component/<Nom>/<Nom>.tsx`.
- Utilisé par au moins deux pages : `common/components/<Nom>/<Nom>.tsx`, puis l'ajouter au skill `reuse-first`.
- Partagé entre plusieurs applications (site, hub…) : `packages/ui/src/` (voir `packages/ui/CLAUDE.md`).
- Un composant = un dossier, avec `<Nom>.tsx`, `<Nom>.css` et `<Nom>-mobile.css`.

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

- Fichiers de composants en `PascalCase` (`UserAvatar.tsx`), autres fichiers en `camelCase` (`forumAccess.ts`).
- Code en anglais, commentaire d'en-tête de fichier en français : il dit en une ou deux phrases à quoi sert le fichier.
