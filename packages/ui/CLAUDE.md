# packages/ui — composants d'interface partagés (@bbfrance/ui)

Ce paquet regroupe les composants communs à toutes les applications du dépôt (site, hub, futures applications). Il repose sur shadcn/ui : des composants Radix (comportement accessible) mis en forme avec Tailwind v4. Les règles générales sont dans `.claude/CLAUDE.md` à la racine.

- **Les couleurs viennent des 7 thèmes du site**, jamais de valeur en dur. Les classes Tailwind (`bg-primary`, `text-muted-foreground`…) passent par `src/tokens.css`, qui les relie aux variables de thème (`--primary`, `--text-muted`…).
- **Fenêtres (`Dialog`)** : le paquet fournit le comportement (fermeture par Échap, focus clavier gardé dans la fenêtre, rôle annoncé aux lecteurs d'écran, défilement de la page bloqué). L'apparence reste celle du composant qui l'utilise.
- **Notifications** : uniquement `toast` et `Toaster` de ce paquet (bibliothèque sonner).
- **Ajouter un composant** : partir de la version shadcn, remplacer ses couleurs par les tokens, l'exporter dans `src/index.ts`, l'ajouter au skill `reuse-first`, puis le vérifier en taille téléphone.
- Le site utilise directement les fichiers sources TypeScript (`transpilePackages` dans `apps/site/next.config.ts`) : il n'y a pas d'étape de compilation du paquet.
