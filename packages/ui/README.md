# Composants d'interface partagés (`@bbfrance/ui`)

Les composants communs à toutes les applications du dépôt : le site, le hub, et plus tard BBScheme et BBQuizz. Ils reposent sur shadcn/ui (composants Radix accessibles, mis en forme avec Tailwind v4) et n'utilisent que les **variables de couleur `--bb-*`** des thèmes : c'est ce qui fait marcher les 5 thèmes du site.

Ce paquet n'est pas déployé seul : il est compilé avec chaque application qui l'utilise (`transpilePackages`), sans étape de construction à part.

## Ce qu'il contient

| Fichier | Rôle |
|---|---|
| `src/index.ts` | Liste des composants exportés : `Button`, `Card`, `Field`/`Input`/`Select`, `Sheet` (panneau du bas ou fenêtre), `ConfirmDialog`, `ActionMenu`, `Tabs`, `Avatar`, `toast`, `AvatarGeneratorSheet`… |
| `src/tokens.css` | Tailles, angles, polices (voix Display et Heading) et classes Tailwind des couleurs (`bg-bb-surface`, `text-bb-text-muted`…) |
| `src/themes/themeData.mjs` | **Source unique des thèmes** : Saison 3 (par défaut, aussi posé sur `:root`), Sombre, NAF, Néhékhara, Violet |
| `src/themes/*.css`, `themeList.ts` | Fichiers **générés** depuis `themeData.mjs` : ne jamais les modifier à la main |

## Utiliser un composant

```tsx
import { Button, Card, CardHeader, CardTitle, CardBody } from "@bbfrance/ui";

<Card>
  <CardHeader><CardTitle>Titre</CardTitle></CardHeader>
  <CardBody><Button variant="primary" size="tap">Enregistrer</Button></CardBody>
</Card>
```

Règles : une cible tactile mesure au moins 44 pixels (`size="tap"` ou `"tap-icon"`) ; une seule action principale (rouge) par écran ; jamais de couleur écrite en dur. Détail : [DESIGN.md](../../DESIGN.md) et le skill `ui`. Inventaire avant d'en créer un nouveau : skill `reuse-first`.

## Modifier un thème

1. Modifier `src/themes/themeData.mjs` (couleurs, nom, ou nouvelle entrée).
2. `corepack pnpm themes:build` (à la racine) régénère les fichiers.
3. Vérifier à l'œil, sur téléphone et ordinateur, puis le test de contraste du site (`apps/site/tests/e2e/contraste.spec.ts`).
4. Ne jamais changer l'identifiant d'un thème existant : il est enregistré dans le profil des membres.

## Tester

`corepack pnpm check` (à la racine) vérifie les types du paquet et son ESLint. Les composants sont vérifiés en situation par les tests du site (`test:parcours`) et du hub (`test:api`).
