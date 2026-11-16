---
id: 069
title: "Bannissement et changement de rôle immédiats"
epic: E02
app: site
depends_on: [017]
adr:
verify: un membre connecté, banni par un modérateur, est envoyé vers /banned dès sa page suivante ; un administrateur rétrogradé perd l'accès à /administration dès sa page suivante (test e2e dans tests/e2e/)
---

# 069 — Bannissement et changement de rôle immédiats

## Pourquoi

Depuis la carte 017, le site garde le profil du membre (rôle, bannissement, thème, pseudo) dans le cookie de session et ne le relit en base qu'une fois toutes les 5 minutes, pour alléger la base. Conséquence : un membre banni peut continuer à naviguer et à écrire pendant 5 minutes au plus, et un administrateur rétrogradé garde ses droits pendant le même délai. Le responsable du projet exige qu'un bannissement soit immédiat ; la sécurité passe avant ce gain de rapidité.

## Action

- Dans `apps/site/auth.ts`, relire le profil en base à chaque demande de page, en supprimant le délai `SESSION_REFRESH_INTERVAL_MS`. La lecture se fait par l'identifiant du membre (clé primaire), elle est donc très rapide.
- Garder la règle de sécurité de la carte 017 : le rôle ne vient jamais du navigateur.
- Ajouter le test e2e décrit dans `verify`.
- Mettre à jour la fiche `docs/features/profil-membres/README.md` (ou celle de la modération) et retirer la mention du délai de 5 minutes partout où elle apparaît.

## Résultat

- `apps/site/auth.ts` : le callback `jwt` relit le profil du membre en base (rôle, bannissement, thème, pseudo, fin de l'inscription) à chaque lecture de la session, dès que le membre est déjà connecté. La constante `SESSION_REFRESH_INTERVAL_MS` et le champ `refreshedAt` du jeton sont supprimés. La règle de la carte 017 est gardée : la valeur lue en base écrase toujours ce que le navigateur envoie avec `update()`, il ne peut donc pas s'attribuer un rôle.
- Coût : une lecture du membre par son identifiant (clé primaire) à chaque lecture de la session, donc très rapide. Les mesures « Après 017 » de `docs/baseline.md` ne valent plus, ce qui y est signalé.
- Commentaires mis à jour (plus de mention des 5 minutes) : `proxy.ts`, `app/layout.tsx`, `app/profile/component/ProfileEdit.tsx`, `lib/authGuard.ts`. Documentation : la fiche `docs/features/auth/README.md` (celle qui décrit la session, plutôt que celle du profil), `docs/GLOSSAIRE.md` et `docs/baseline.md`.
- Nouveau test e2e `apps/site/tests/e2e/session-refresh.spec.ts` : un membre banni en base pendant sa session est envoyé vers `/banned` à la page suivante ; un administrateur rétrogradé en base perd `/administration` à la page suivante. Les deux membres sont créés puis supprimés par le test.
- Vérifications : `npx tsc --noEmit` sans erreur ; `node scripts/lint-ratchet.mjs` à 840 erreurs (plafond 840, pas de hausse).
- Le test « choisir le thème Sombre » de `smoke.spec.ts` bloquait maintenant : il ouvrait une seconde connexion à la base de test, qui n'en accepte qu'une, alors que le site la sollicite à chaque page (même cause que la carte 067). Il vérifie désormais le thème par l'interface, en rechargeant la page et en lisant l'attribut `data-theme` de la balise `<html>`.
- Tests e2e : `session-refresh.spec.ts` et `smoke.spec.ts` réussis, puis suite complète réussie (73 réussis, 1 ignoré, journal `logs/069-e2e.log`).
