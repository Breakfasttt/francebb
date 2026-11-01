---
id: 148
title: "Capture de l'accueil fragile, retour de BBScheme"
epic: E01
app: site
depends_on: [102]
adr: 
verify: visual-themes.spec.ts passe aussi lancé juste après tournois.spec.ts ; le bouton retour de /bbscheme fait au moins 44 pixels sur téléphone
---

# 148 — Capture de l'accueil fragile, retour de BBScheme

## Pourquoi

Relevé pendant la carte 101 :

- La capture `accueil-vestiaire` de `apps/site/tests/e2e/visual-themes.spec.ts` dépend des tournois que `tournois.spec.ts` laisse dans le cache de l'accueil, gardé 60 secondes. Elle passe dans l'ordre de la suite complète, mais échoue si l'on lance les deux fichiers l'un après l'autre.
- `apps/site/app/bbscheme/page.tsx` garde un bouton retour de 40 pixels (`style={{ width: 40, height: 40 }}`), sous les 44 pixels demandés sur téléphone.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Masquer dans la capture la zone des tournois à venir (option `mask` de Playwright), ou vider le cache de l'accueil avant la capture.
- Utiliser `BackButton` ou une taille d'au moins 44 pixels pour le retour de BBScheme, et vérifier avec `mobile-audit.spec.ts`.

## Complément

- `apps/site/tests/e2e/inventaire/accueil.spec.ts`, test « prochains tournois et article aléatoire » : il dépend du même cache. Pendant la carte 101, il a réussi puis échoué sur le même code, la liste en cache n'ayant pas été renouvelée en deux minutes. Ce cache (`unstable_cache`) est enregistré dans `.next` et survit au redémarrage du serveur de test, alors que la base de test est recréée.
- Quand ce test échoue, son nettoyage est sauté ; la préparation suivante (`prisma.topic.deleteMany`) échoue alors sur la contrainte `Post_topicId_fkey`, parce qu'elle supprime les sujets sans leurs messages. Supprimer d'abord les messages des sujets de test.
- Piste : vider le cache de l'accueil au lancement des tests, ou donner au test un moyen de forcer le renouvellement (`revalidateTag`).
