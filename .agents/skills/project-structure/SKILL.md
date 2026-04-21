---
name: Project Structure
description: Guide structure BBFrance. Dossiers, conventions, UI. Ultra compressé.
---

# Archi BBFrance

## RACINE
- `.agents/`: Skills IA.
- `app/`: Next.js App Router. Pages, layouts, actions.
- `common/`: UI partagée.
- `lib/`: Business logic, Prisma, BBCode, rôles.
- `prisma/`: Schéma DB, seeds (`firstSetup.ts`).
- `public/`: Fichiers statiques.
- `scripts/`: Scripts temporaires.
- `styles/`: CSS global.

## APP (Next.js)
- **Chemin**: `app/[nom]/page.tsx`
- **Style**: `page.css` + `page-mobile.css`. Importer dans `.tsx`.
- **Règle Next 16**: Utiliser `proxy.ts` à la racine (dépréciation de `middleware.ts`).
- **Comps Locaux**: `app/[nom]/component/Nom/Nom.tsx` + `.css`.
- **Actions DB Serveur**: `actions.ts`.

## COMMON / COMPONENTS
- Structure: `Nom.tsx` + `.css` + `-mobile.css`.
- Clés: `PremiumCard`, `UserAvatar`, `BBCodeEditor`.
- Boutons: `Classic`, `CTA`, `Danger`, `Admin`, `Badge`.

## PRISMA
- `firstSetup.ts`: Init données de base (Rôles, catégories).
- `seedScript/`: Importateurs.
- **Règles**: Toujours `upsert`. NE JAMAIS drop données globales.

## RÈGLES IA
1. **Localité**: Utilisé 1 page ? `app/[page]/component/`. Utilisé >1 page ? `common/components/`.
2. **Logique**: Code DB dans `actions.ts`, jamais dans composant.
3. **Styles**: Utilise variables CSS (`app/theme/`). PAS DE HEX EN DUR.
4. **Fichiers**: 1 comp = 1 dossier avec `.css` + `-mobile.css`.
