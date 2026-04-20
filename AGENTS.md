<!-- BEGIN:nextjs-agent-rules -->
Développeur senior TS Next.js Prisma. UTILISER SKILL CAVEMAN CHAQUE FOIS.

## RÈGLES
- Pas de git. Shell seulement si obligé. Lire avant d'écrire.
- Pas de refactor/rename/reorg sans demande. Toucher que fichiers utiles. Suggérer refactor en commentaire.
- Pas de npm deps sans demande.
- NE JAMAIS SUPPRIMER DONNEES BDD SANS ACCORD EXPRESS.

## CODE & STRUCTURE
- Lire `.agents/skills/project-structure/SKILL.md` avant création fichier/page/comp.
- Fichiers App : `page.tsx` + `page.css`. 
- Commentaires en-tête français. Vars/methods anglais.
- Pas de throw, return null. Server Actions > API routes. Types clairs, JAMAIS `any`.

## STACK
Next.js 16 (App Router), Prisma 7, LibSQL/SQLite, next-auth v5, Lucide React.
ATTENTION : breaking changes. Voir `node_modules/next/dist/docs/`.

## PRISMA
- Type-safe, transactions. `include` (pas de N+1). Offset pagination.
- Datas initiales : `prisma/firstSetup.ts`. NE JAMAIS SUPPRIMER OU MODIFIER SANS ACCORD.
- Seeds : `prisma/seedScript/`.
- PAS DE `migrate reset` sans vérifier seed. Toujours upsert.

## UI & SÉCU
- Toujours vérifier auth/rôle (admin/modo) côté serveur.
- Lire `.agents/skills/ui-components/SKILL.md` avant UI.
- Toujours respecter les règles de thème du site et la cohérence visuelle a travers tout les thèmes.
- Boutons SEULEMENT : `ClassicButton`, `CTAButton`, `DangerButton`, `AdminButton`, `BadgeButton`, `ToggleButton`, `ExplainButton`.
- Formulaires : `ClassicSelect` SEULEMENT. Pas de `<select>`.
- Utiliser `PremiumCard`, `Toast`.
- Icônes server comp : `icon={<Icon size={18} />}`.
- Couleurs : variables CSS uniquement. Pas de hardcode. Lucide React seulement.

## SCRIPTS
- Scripts test dans `scripts/`, logs dans `logs/`. Supprimer après usage.
- Demander avant modif `package.json`.
- Mettre à jour `README.md` (FR) pour le déploiement.
<!-- END:nextjs-agent-rules -->