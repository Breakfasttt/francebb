---
id: 204
title: "Outils de développement dans la barre haute"
epic:
app: site
depends_on: []
verify: "en développement, plus aucun bouton flottant ; « Dev Auth » est dans la barre haute en 375 et en 1366 pixels de large et permet de changer de compte ; la barre haute tient en 360 pixels avec « Se connecter / S'inscrire » ; corepack pnpm check passe, ainsi que le test « widgets de développement » de coquille-fin.spec.ts"
---

# 204 — Outils de développement dans la barre haute

## Pourquoi

En développement (le site lancé sur l'ordinateur du développeur, jamais le site en ligne), deux boutons flottants, « Dev Theme » et « Dev Auth », restent collés en bas à droite de l'écran. Ils recouvrent le bandeau des cookies et des boutons des pages, au point que plusieurs tests doivent les contourner (`apps/site/tests/e2e/inventaire/coquille-fin.spec.ts:108`, `forum-sujet.spec.ts:745`).

Le sélecteur « Dev Theme » fait en plus doublon : le thème se choisit déjà dans la barre haute sur ordinateur (bouton palette de `common/components/AppShell/AppShell.tsx:194` et menu du compte) et dans le panneau « Plus » sur téléphone.

## Action

1. Supprimer `apps/site/common/components/DebugThemeWidget/` et son appel dans `apps/site/app/layout.tsx:82` (aucun autre fichier ne l'utilise).
2. Transformer `DebugAuthWidget` (sélecteur de comptes de test) :
   - le bouton flottant devient un bouton à icône de 44 pixels placé dans la barre haute de `AppShell`, sur téléphone comme sur ordinateur, avec le nom accessible « Dev Auth » (lu par les lecteurs d'écran et utilisé par les tests) ;
   - la liste des comptes s'ouvre dans la fenêtre `Sheet` de `@bbfrance/ui`, déjà utilisée pour le choix du thème, au lieu d'un panneau aux styles écrits à la main ;
   - même contenu qu'aujourd'hui : changer de compte, créer un compte de test ;
   - toujours absent hors développement (`process.env.NODE_ENV`).
3. Mettre à jour le test `coquille-fin.spec.ts:170` (seul « Dev Auth » reste), les commentaires de test qui parlent des boutons flottants, `docs/features/pages-diverses/README.md` (lignes 54 et 72) et `docs/refonte/inventaire.md:41`.
4. Vérifier en taille téléphone (360 et 375 pixels) : la barre haute ne déborde pas, le bouton fait 44 pixels.

## Résultat

- Le sélecteur de thème flottant « Dev Theme » est supprimé (`common/components/DebugThemeWidget/`) : en développement, le thème se choisit comme sur le site en ligne (bouton palette de la barre haute, menu du compte, panneau « Plus »).
- `DebugAuthWidget` (comptes de test) n'est plus monté par `app/layout.tsx` mais par `AppShell`, dans la barre haute du téléphone et de l'ordinateur : un bouton à icône de 44 pixels (icône `UserCog`), nommé « Dev Auth » pour les lecteurs d'écran et les tests. Il ouvre une fenêtre centrée (`Sheet` de `@bbfrance/ui`) avec la liste des comptes de test et le formulaire de création, en composants partagés (`Button`, `Avatar`, `Field`, `Input`, `Select`) et aux couleurs du thème, au lieu des styles écrits à la main. Il reste absent du site en ligne.
- Les tests ne contournent plus les boutons flottants : les clics envoyés directement (`dispatchEvent`) de `coquille-fin.spec.ts`, `forum-sujet.spec.ts` et des tests de filtres (`tournois`, `ressources`, `ligues`, `articles`) sont redevenus de vrais clics. Le test « widgets de développement » vérifie maintenant que « Dev Theme » n'existe plus, que « Dev Auth » est dans la barre haute avec 44 pixels de haut et qu'il ouvre sa fenêtre.
- Fiche `pages-diverses` et `docs/refonte/inventaire.md` à jour.

Vérifié à l'écran en 360 pixels (accueil et `/forum`, avec « Se connecter / S'inscrire ») et en 1366 pixels : aucun bouton flottant, bouton de 44 × 44 pixels (il était écrasé à 40 pixels de large sur `/forum` avant l'ajout de `shrink-0`), pas de défilement horizontal, fenêtre des comptes lisible. `corepack pnpm check` passe.

Tests : `coquille-fin.spec.ts` (dont le nouveau test du bouton « Dev Auth ») passe en taille ordinateur et téléphone ; le parcours de fin de carte (`test:parcours`) passe.

**À essayer à la main** : en développement, sur téléphone, ouvrir « Dev Auth » depuis la barre haute et changer de compte.
