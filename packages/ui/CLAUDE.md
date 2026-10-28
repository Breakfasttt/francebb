# packages/ui — composants partagés (@bbfrance/ui)

Base shadcn/ui (Radix + Tailwind v4) pour toutes les apps du monorepo. Règles générales : `.claude/CLAUDE.md` (racine).

- Le style vient des **7 thèmes du site** : jamais de couleur en dur. Les classes Tailwind utilisent les tokens de `src/tokens.css` (`bg-primary`, `text-muted-foreground`…) qui pointent sur les variables de thème (`--primary`, `--text-muted`…).
- Primitives sans style (Dialog) : le composant appelant garde son CSS (overlay, carte). Le paquet apporte le comportement : focus piégé, Échap, `role="dialog"`, scroll bloqué.
- Notifications : `toast` / `Toaster` (sonner) uniquement.
- Ajouter un composant : copier la version shadcn, remplacer ses couleurs par les tokens, l'exporter dans `src/index.ts`, l'ajouter au skill `reuse-first`.
- Le site consomme les sources TS directement (`transpilePackages` dans `apps/site/next.config.ts`) : pas de build.
