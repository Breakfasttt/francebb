# packages/ui — composants d'interface partagés (@bbfrance/ui)

Ce paquet regroupe les composants communs à toutes les applications du dépôt (site, hub, futures applications). Il repose sur shadcn/ui : des composants Radix (comportement accessible) mis en forme avec Tailwind v4. Les règles générales sont dans `.claude/CLAUDE.md` à la racine.

- **Les couleurs viennent des variables v2 (`--bb-*`) des 8 thèmes du site**, jamais d'une valeur en dur. Chaque thème est un fichier de `src/themes/` ; `src/tokens.css` les importe et crée les classes Tailwind correspondantes (`bg-bb-surface`, `text-bb-text-muted`, `border-bb-border`…). Les noms shadcn (`bg-primary`, `text-muted-foreground`…) y sont reliés aux variables v2 pour les variantes historiques, mais le nouveau code utilise les classes `bb-`. Détail dans le skill `theming-rules`.
- **Taille tactile** : un composant qu'on touche au doigt mesure au moins 44 pixels (`size="tap"` ou `"tap-icon"` pour `Button`) ; les champs ont un texte de 16 pixels.
- **Fenêtres (`Dialog`)** : le paquet fournit le comportement (fermeture par Échap, focus clavier gardé dans la fenêtre, rôle annoncé aux lecteurs d'écran, défilement de la page bloqué). Pour un panneau du bas, un tiroir ou une fenêtre déjà mise en forme, utiliser `Sheet` ; pour une confirmation, `ConfirmDialog`.
- **Notifications** : uniquement `toast` et `Toaster` de ce paquet (bibliothèque sonner).
- **Ajouter un composant** : partir de la version shadcn, remplacer ses couleurs par les variables v2, l'exporter dans `src/index.ts`, l'ajouter au skill `reuse-first`, puis le vérifier en taille téléphone.
- Le site utilise directement les fichiers sources TypeScript (`transpilePackages` dans `apps/site/next.config.ts`) : il n'y a pas d'étape de compilation du paquet.
