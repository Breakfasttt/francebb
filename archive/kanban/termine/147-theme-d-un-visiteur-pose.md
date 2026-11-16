---
id: 147
title: "Thème d'un visiteur posé trop tard"
epic: E01
app: site
depends_on: [102]
adr: 0005
verify: un visiteur non connecté qui a choisi un thème voit la page directement dans ce thème, sans passage par le thème par défaut ; test e2e
---

# 147 — Thème d'un visiteur posé trop tard

## Pourquoi

Relevé pendant la carte 101 : pour un visiteur non connecté, le thème gardé par le navigateur n'est appliqué qu'après le chargement de la page, par `ThemeProvider`. La page s'affiche donc un instant dans le thème par défaut, puis change de couleurs (effet de clignotement).

L'ADR 0005 veut que le thème soit posé par le serveur. Pour un membre connecté, c'est le cas ; pour un visiteur, le serveur ne connaît pas encore son choix.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Enregistrer le choix d'un visiteur dans un cookie lu par le serveur au rendu (`app/layout.tsx`), ou poser le thème par un court script exécuté avant l'affichage.
- Ajouter un test e2e qui vérifie l'attribut `data-theme` dès la réponse du serveur.

## Résultat

Fait (tests écrits, pas encore lancés), par la solution du cookie lu au rendu serveur.

- `apps/site/lib/themes.ts` : nouvelle constante `THEME_COOKIE` (`bbfrance_theme`).
- `apps/site/common/components/ThemeProvider/ThemeProvider.tsx` : le thème affiché est recopié dans ce cookie (gardé un an, `path=/`, `SameSite=Lax`, `Secure` en HTTPS), pour un visiteur comme pour un membre. Un visiteur qui n'avait son thème que dans le `localStorage` le voit recopié dans le cookie à sa première visite ; dès la page suivante, il n'y a plus de clignotement.
- `apps/site/app/layout.tsx` : pour un visiteur non connecté, le thème du cookie (s'il fait partie des 8 thèmes) est posé dans l'attribut `data-theme` envoyé par le serveur et passé à `ThemeProvider`. Pour un membre, le thème du profil gagne toujours. La mise en page lisait déjà le cookie de session : lire ce cookie-là ne change pas la façon dont les pages sont calculées, et les caches de données (`unstable_cache`) ne sont pas concernés.
- Documentation : fiche `docs/features/pages-diverses/README.md`, terme « Cookie » ajouté à `docs/GLOSSAIRE.md`.
- Tests : `apps/site/tests/e2e/bugs/divers.spec.ts` (attribut `data-theme` lu dans le HTML de la réponse du serveur : cookie respecté, valeur inconnue ignorée, thème du `localStorage` recopié dans le cookie, membre qui garde le thème de son profil).
- Question pour le responsable : ce cookie de préférence d'affichage ne contient aucune donnée personnelle ; il faudra peut-être le citer dans les mentions légales ou la documentation RGPD, que cette carte ne modifie pas.
- À essayer à la main : en visiteur, choisir le thème Clair, puis recharger la page en ralentissant le réseau (outils du navigateur) : aucun passage par le thème Vestiaire.
