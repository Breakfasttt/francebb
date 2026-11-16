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

## Résultat

Fait, avec une action restante pour le coordinateur (tests écrits, pas encore lancés).

- **Capture de l'accueil** : dans `apps/site/tests/e2e/visual-themes.spec.ts`, la région « Prochains tournois » est masquée (option `mask` de Playwright) dans les captures `accueil-<thème>.png`. **Les 8 captures de référence `accueil-*-chromium-win32.png` doivent être régénérées une fois** (`--update-snapshots` limité à ce test), puisque la zone masquée devient un rectangle uni ; cette carte ne l'a pas fait, comme demandé.
- **Test « prochains tournois et article aléatoire »** (`apps/site/tests/e2e/inventaire/accueil.spec.ts`) : le cache de la liste des tournois de l'accueil porte maintenant l'étiquette `home-tournaments` (`apps/site/app/page.tsx`). Avant de préparer ses données, le test efface du disque (`.next/dev/cache/fetch-cache` et `.next/cache/fetch-cache`) les entrées qui portent cette étiquette, puis recharge l'accueil jusqu'à voir ses tournois, comme avant. Limite : un serveur déjà lancé garde aussi ce cache en mémoire ; si le test reste instable, la piste suivante est une route réservée aux tests qui appelle `revalidateTag("home-tournaments")` (à décider).
- **Nettoyage** : la préparation supprime d'abord les messages des sujets de test, puis les sujets (plus d'échec sur `Post_topicId_fkey` après un lancement interrompu).
- **Bouton retour de BBScheme** : 44 pixels sur ordinateur aussi (`apps/site/app/bbscheme/page.tsx`) ; il faisait déjà 44 pixels sur téléphone. Test dans `apps/site/tests/e2e/bugs/divers.spec.ts` (tailles ordinateur et téléphone) ; `mobile-audit.spec.ts` n'a pas été lancé.
- Fiche `docs/features/bbscheme/README.md` mise à jour.
