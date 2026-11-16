---
id: 175
title: "Statistiques : ne plus compter les sujets et messages supprimés"
epic: E10
app: site
depends_on: [165]
verify: "les chiffres de /statistiques ne comptent ni les sujets ni les messages supprimés, ni les membres bannis ou le compte fantôme ; le texte ne mentionne plus de quota d'un service d'e-mail qui n'est plus utilisé"
---

# 175 — Statistiques : ne plus compter les sujets et messages supprimés

## Pourquoi

Depuis la carte 165, un sujet ou un message supprimé reste en base (suppression douce). La page des statistiques (`app/statistiques/actions.ts`) les compte encore. L'audit (section 4.6) a aussi relevé qu'elle compte les membres bannis et le compte fantôme qui sert à anonymiser, et qu'elle affiche un quota du service d'e-mail Resend, qui n'est plus utilisé (l'envoi passe par SMTP).

## Action

Exclure les sujets et messages supprimés, les membres bannis et le compte fantôme des compteurs ; retirer ou corriger la mention du quota Resend ; mettre à jour la fiche `classement-statistiques`.

## Résultat

Les compteurs de `/statistiques` ne prennent plus en compte les sujets supprimés, les messages supprimés (ni ceux qui appartiennent à un sujet supprimé), les membres bannis et le compte fantôme (identifiant `GHOST_USER_ID`, réutilisé depuis `lib/rankingCoach.ts`). Le total des vues ignore aussi les sujets supprimés. La carte « Quota restant » et la constante Resend ont disparu de la console d'administration, car le site envoie ses courriels par SMTP et ne connaît pas de plafond ; le nombre de courriels du mois reste affiché. La fiche `docs/features/classement-statistiques/README.md` est à jour.

Correction après coup : le test « /statistiques » de `tests/e2e/inventaire/accueil.spec.ts` cherchait encore « Quota restant » ; il vérifie maintenant les autres chiffres réservés. Les 4 tests des statistiques passent.
