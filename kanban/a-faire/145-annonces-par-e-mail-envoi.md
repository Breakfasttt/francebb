---
id: 145
title: "Annonces par e-mail : envoi testable et suivi"
epic: E01
app: site
depends_on: [102]
adr: 
verify: l'envoi d'une annonce est vérifié par un test e2e sans écrire à de vraies adresses ; l'écran indique l'avancement de l'envoi
---

# 145 — Annonces par e-mail : envoi testable et suivi

## Pourquoi

Pendant la refonte de l'administration (carte 099), l'envoi d'une annonce par e-mail n'a pas pu être vérifié par un test : `sendGlobalInfoMail` envoie réellement un e-mail à chaque membre, un toutes les 500 millisecondes. Un test écrirait donc à tous les membres de la base de test. Avec beaucoup de membres, l'envoi dure aussi plusieurs minutes, sans suivi visible.

La ligne « info-mails » de `docs/refonte/inventaire.md` reste non cochée pour cette raison.

Cette carte est à traiter une fois la refonte (épic E08) terminée, en accord avec la session qui travaille sur `apps/site/lib/mail.ts`.

## Action

- Permettre de remplacer l'envoi réel par un faux envoi pendant les tests (variable d'environnement lue par `apps/site/lib/mail.ts`).
- Tester l'envoi complet et l'écran « Diffusion terminée » dans `apps/site/tests/e2e/inventaire/administration.spec.ts`, puis cocher la ligne de l'inventaire.
- Étudier un envoi par lots avec suivi de l'avancement.
