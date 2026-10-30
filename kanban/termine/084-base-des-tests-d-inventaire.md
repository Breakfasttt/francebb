---
id: 084
title: "Base des tests d'inventaire"
epic: E08
app: site
depends_on: [081]
adr: 0006
verify: dossier tests/e2e/inventaire/ créé ; le projet telephone rejoue les tests d'inventaire ; captures stables sur trois lancements de suite
---

# 084 — Base des tests d'inventaire

## Pourquoi

Chaque carte d'écran commence par écrire son test d'inventaire. Il faut une base commune : connexion par rôle, captures stables, projet téléphone.

## Action

- Créer `apps/site/tests/e2e/inventaire/` avec des fonctions d'aide pour se connecter comme visiteur, membre, modo, admin ou super admin.
- Configurer le projet Playwright `telephone` pour qu'il rejoue aussi les tests d'inventaire.
- Stabiliser les captures : police chargée, animations coupées, données de test fixes.
- Écrire le test d'inventaire de la section 1 (éléments présents sur toutes les pages).

## Résultat

- **Dossier.** `apps/site/tests/e2e/inventaire/` est créé. Le projet Playwright `telephone` (Pixel 7) rejoue tout ce dossier en plus de `smoke.spec.ts` (`playwright.config.ts`).
- **Méthode.** Les tests d'inventaire cherchent chaque action par son rôle et son nom accessible (`getByRole`), jamais par une classe CSS. Ils passent donc sans modification, quel que soit le design. Les captures prises pendant ces tests servent à la relecture humaine et ne sont pas comparées au pixel. Seul `visual-themes.spec.ts` fait de la comparaison au pixel.
- **Comptes.** La connexion par rôle réutilise `loginAs` et les comptes de test existants : visiteur, coach, modérateur. Le jeu de données n'a ni administrateur ni super administrateur : les lignes de l'inventaire qui les concernent seront couvertes en ajoutant ces comptes à `globalSetup` lors de la carte 099.
- **Section 1 de l'inventaire.** Son test est `coquille.spec.ts`. 8 lignes sont cochées dans `docs/refonte/inventaire.md` : connexion, profil, déconnexion, messagerie, modération, « Cette page », fermeture du panneau, pied de page.
- **Lignes encore à cocher**, parce que d'autres tests les couvrent déjà ou qu'il faut un compte administrateur :
  - le logo ;
  - l'icône Administration ;
  - le thème posé sans éclair (ADR 0005) ;
  - la redirection des bannis (`visual-themes.spec.ts`) ;
  - l'onboarding ;
  - les widgets de développement.
- **Captures stables.** La police est chargée et les animations sont coupées. Les tests `visual-themes` ont réussi à chaque lancement de la session.
