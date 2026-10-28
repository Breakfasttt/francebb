---
id: 030
title: Socle packages/ui (shadcn) + pont des tokens
epic: E05
app: packages/ui
depends_on: [021, 023]
adr: 0001
verify: pnpm typecheck + build verts, captures 7 thèmes (visual-themes.spec.ts) identiques
---

# 030 — Socle packages/ui (shadcn) + pont des tokens

## Action

Créer `packages/ui` (`@bbfrance/ui`) : `cn`, primitives Dialog (Radix), `Toaster`/`toast` (sonner), `Button` (cva) pour le nouveau code. Le style reste celui des 7 thèmes : `tokens.css` relie les variables shadcn/Tailwind (`--color-primary`…) aux variables de thème existantes (`--primary`, `--card-bg`…), sans nouvelle couleur. Tailwind scanne `packages/ui/src`.

## Résultat

`packages/ui` créé (`cn`, `Button`, primitives `Dialog`, `Toaster`/`toast`, `tokens.css`). Le site le consomme en sources (`transpilePackages`). Tailwind scanne `packages/ui/src`. Deps : radix-ui 1.7.0, sonner 2.0.8, class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.7.0 (versions de plus de 2 semaines). Filet visuel `tests/e2e/visual-themes.spec.ts` : accueil, forum et modale de signalement dans les 7 thèmes, captures prises avant toute modification.
