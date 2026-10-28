# Baseline du refacto (P0) — 2026-10-28

Référence chiffrée avant toute modification d'architecture. À remesurer à chaque phase avec les mêmes scripts pour comparer.

## Comment remesurer

```bash
npm run build
node scripts/baseline.mjs     # perf : next start sur une copie de dev.db (logs/baseline.db)
node scripts/debt-count.mjs   # compteurs de dette
npm run lint:ratchet          # erreurs ESLint vs plafond lint-baseline.json
npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script
```

## Perf par route

Mobile 4G simulé (150 ms, 9 Mb/s, CPU ×4), médiane de 3 runs, copie locale de dev.db (SQLite).

| Route | Session | TTFB ms | FCP ms | LCP ms | JS kB | Requêtes Prisma |
|---|---|---|---|---|---|---|
| / | anonyme | 21 | 504 | 952 | 156 | 5 |
| / | connecté | 26 | 500 | 932 | 156 | 11 |
| /forum | anonyme | 21 | 716 | 716 | 169 | 5 |
| /forum | connecté | 33 | 716 | 716 | 169 | 16 |
| /forum/[id] (forum le plus rempli) | anonyme | 21 | 684 | 684 | 164 | 20 |
| /forum/[id] (forum le plus rempli) | connecté | 32 | 708 | 708 | 164 | 31 |
| /forum/topic/[id] (topic le plus long) | anonyme | 31 | 1088 | 1088 | 207 | 32 |
| /forum/topic/[id] (topic le plus long) | connecté | 42 | 1112 | 1112 | 207 | **89** |
| /tournois | anonyme | 19 | 744 | 744 | 163 | 4 |
| /tournois | connecté | 15 | 736 | 736 | 163 | 9 |
| /classement | anonyme | 14 | 656 | 656 | 167 | 7 |
| /classement | connecté | 17 | 680 | 680 | 167 | 12 |
| /bbscheme | anonyme | 16 | 768 | 860 | 235 | 0 |
| /bbscheme | connecté | 17 | 768 | 864 | 235 | 5 |

**Lecture** :
- Le TTFB local est trompeur : SQLite local répond en ~0 ms. En prod (Turso distant), chaque requête Prisma est un aller-retour réseau. **Le nombre de requêtes par rendu est la métrique qui prédit la lenteur en prod.**
- Les requêtes comptent aussi les préchargements RSC des liens visibles (`<Link>` prefetch), déclenchés pendant la mesure : c'est une charge réelle.
- Toutes les routes sont dynamiques (`ƒ`) : `force-dynamic` dans `app/layout.tsx`.
- Cible P2 : ≥ -30 % de requêtes par rendu et de LCP sur les routes forum.

## Dette technique (app/, common/, lib/)

| Compteur | Valeur |
|---|---|
| Fichiers TS/TSX | 244 |
| Fichiers "use client" | 143 |
| `any` explicites | 379 |
| Couleurs hex en TSX | 186 |
| `<button>` natifs | 206 |
| `<select>` natifs | 2 |
| `style={{` inline | 1114 |
| @ts-ignore / @ts-expect-error | 7 |
| `<img>` (hors next/image) | 36 |
| Couleurs hex en CSS (hors thèmes) | 233 |
| Erreurs ESLint (hors client Prisma généré) | 590 (+312 warnings) |

## Base de données

- Historique `prisma/migrations` ↔ `schema.prisma` : **cohérent** (diff vide).
- Copie de dev.db ↔ schéma : cohérent.
- **Prod Turso ↔ schéma : à vérifier** (accès Turso requis, prod initialisée en `db push`) — étape P1.
- Backup prod (`scripts/turso-backup.mjs`, restauration testée) : reporté, P0 ne modifie pas la prod. **Obligatoire avant la baseline Prisma de P1** et toute migration de schéma/auth.

## Sécurité corrigée en P0

- Supprimés : `app/api/user/delete/route.ts` et `app/api/user/update/route.ts` (sans auth, upsert/suppression en dur de `user_test_breakyt`) + `app/profile/component/ProfileForm.tsx` (seul consommateur, importé nulle part).
- Ban vérifié côté serveur : `lib/authGuard.ts` → `getActiveSession()` remplace `auth()` dans les 128 appels des server actions (16 fichiers). `isBanned` est rafraîchi par le callback jwt (pas de requête en plus).
