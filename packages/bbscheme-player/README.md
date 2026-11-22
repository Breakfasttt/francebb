# Lecteur de schémas BBScheme (`@bbfrance/bbscheme-player`)

Le lecteur des schémas tactiques BBScheme : un terrain de Blood Bowl, des pions de joueurs, des tracés de déplacement, et l'enchaînement des images d'une action. Il est partagé par :

- **le site** : il affiche, animés, les schémas cités dans les messages par la balise `[bbscheme]` (`apps/site/common/components/BBCodeContent/BBCodeContent.tsx`), en lisant le schéma auprès de l'application BBScheme (`BBSCHEME_URL`) ;
- **l'application BBScheme** : son éditeur (en attente, `apps/bbscheme/editeur-en-attente/`).

Ce paquet n'est pas déployé seul : il est compilé avec l'application qui l'utilise.

## Ce qu'il contient

| Fichier | Rôle |
|---|---|
| `src/BBSchemePlayer.tsx` | Le lecteur complet (images, lecture, plein écran sur téléphone) |
| `src/Pitch.tsx`, `src/Token.tsx` | Le terrain et un pion |
| `src/types.ts` | Les types d'un schéma (pions, images, tracés, rosters) |
| `src/*.css` | Leur mise en forme |

Les rosters (listes d'équipes et de joueurs) sont lus dans `apps/site/public/data/roster/`.

## Utiliser

```tsx
import { BBSchemePlayer } from "@bbfrance/bbscheme-player";
```

## Tester

`corepack pnpm check` (à la racine) vérifie les types et l'ESLint du paquet. En situation : lancer BBScheme et le site (voir [apps/bbscheme/README.md](../../apps/bbscheme/README.md)), puis ouvrir un message qui contient `[bbscheme]`.
