---
id: 062
title: Thème « Sombre » enregistré sous un identifiant inconnu
epic: E03
app: site
depends_on: []
adr:
verify: choisir « Sombre » à l'inscription ou dans le profil enregistre un identifiant de la liste des thèmes ; les membres déjà enregistrés avec l'ancien identifiant gardent le bon affichage
---

# 062 — Thème « Sombre » enregistré sous un identifiant inconnu

## Pourquoi

Repéré pendant la carte 058. À l'inscription et dans le profil, le thème « Sombre » enregistre l'identifiant `dark`, qui n'existe pas dans la liste des thèmes du site (le thème sombre s'appelle `default`). Le site retombe sur le thème par défaut, donc l'affichage est juste par chance, mais la donnée enregistrée est fausse.

## Action

- Faire enregistrer l'identifiant correct à l'inscription et dans le profil, en lisant la liste officielle des thèmes plutôt qu'une liste recopiée.
- Pour les membres déjà enregistrés avec `dark` : soit une migration de données qui remplace `dark` par `default` (avec le skill `database-ops`, sans rien supprimer), soit une correspondance à la lecture. Choisir et écrire la raison.
- Mettre à jour les fiches concernées.

## Résultat

La liste officielle des 7 thèmes est maintenant dans `apps/site/lib/themes.ts` (`SITE_THEMES` : identifiant et nom affiché, `DEFAULT_SITE_THEME`, `isSiteTheme`). Ce fichier ne contient que des données, il peut donc être lu côté serveur comme dans le navigateur. L'inscription (`OnboardingForm.tsx`), le profil (`ProfileEdit.tsx`) et `ThemeProvider` lisent cette liste au lieu de leurs copies : le thème « Sombre » est enregistré sous `default`. Les aperçus de couleur des pastilles et des cartes de thème ont suivi (`.theme-dot.default`, `.theme-preview.default`). L'action serveur `updateTheme` refuse désormais un identifiant absent de la liste (« Thème inconnu »).

**Membres déjà enregistrés avec `dark` : migration de données.** Le fichier `apps/site/prisma/migrations/20261030120000_theme_dark_to_default/migration.sql` ne contient qu'une ligne, `UPDATE "User" SET "theme" = 'default' WHERE "theme" = 'dark';`, sans aucune suppression. Raison du choix : la donnée devient juste une fois pour toutes, sans laisser dans le code une correspondance à la lecture qu'il faudrait garder et expliquer indéfiniment ; la migration est appliquée automatiquement en production au déploiement (`prisma migrate deploy`) et rejouée à l'identique sur toutes les bases locales. L'affichage ne change pas pour ces membres, puisque `dark` affichait déjà le thème sombre par défaut.

Vérifications : `npx tsc --noEmit` sans erreur ; `node scripts/lint-ratchet.mjs` à 840 erreurs pour un plafond de 840 ; la base de test a appliqué la nouvelle migration ; nouveau test smoke « choisir le thème « Sombre » dans le profil enregistre l'identifiant default » vert sur ordinateur et sur téléphone ; captures des 7 thèmes inchangées (`visual-themes.spec.ts`). Au premier passage, quatre tests « page des bannis sur téléphone » ont dépassé le délai de 60 secondes pendant la fermeture du navigateur (enregistrement de la trace), sans écart de capture ; relancés seuls, les 7 passent (`logs/062-065-e2e-bannis.log`).
