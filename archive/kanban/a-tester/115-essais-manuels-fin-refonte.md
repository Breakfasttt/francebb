---
id: 115
title: "Essais à la main : hub de connexion et téléphones"
epic: E06
app: site, hub
depends_on: [073]
adr: 0003
verify: chaque essai de la procédure ci-dessous est coché et son résultat noté dans la section « Résultat » ; la carte 073 passe de kanban/a-tester/ à kanban/termine/
---

# 115 — Essais à la main : hub de connexion et téléphones

## Pourquoi

Certaines vérifications ne peuvent pas être faites par les tests automatiques : se connecter avec un vrai compte Discord ou Google, ou toucher l'écran d'un vrai téléphone. La carte 073 (hub invisible) attend donc dans `kanban/a-tester/`, et l'essai de la carte 068 (zoom à deux doigts) n'a été fait que sur un téléphone Android. Le responsable du projet a choisi de faire ces essais à la fin de la refonte visuelle (épic E08), pour ne pas tester deux fois les mêmes écrans.

Le **hub** est le service de connexion commun aux applications BBFrance (voir `docs/GLOSSAIRE.md` et l'ADR 0003). Il doit rester invisible : le coach clique sur Discord, Google ou email sur l'écran du site, et ne voit jamais l'écran du hub.

## Action

### Préparation (une seule fois)

1. Vérifier qu'aucune autre session ne lance le site, le hub ou les tests au même moment : la base locale n'accepte qu'une connexion, et les ports 3000 et 4000 doivent être libres.
2. Dans `apps/site/.env`, vérifier la présence de `AUTH_MODE="hub"`, `HUB_ISSUER`, `HUB_CLIENT_ID` et `HUB_CLIENT_SECRET` (ajoutés le 2026-10-30). Pour revenir à la connexion habituelle du site plus tard, vider `AUTH_MODE`.
3. Pour Discord et Google : remplir `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `apps/hub/.env` (modèle : `apps/hub/.env.example`), et déclarer chez Discord et chez Google les adresses de retour `http://localhost:4000/api/auth/callback/discord` et `http://localhost:4000/api/auth/callback/google`.
4. Dans VS Code : menu « Terminal », « Exécuter la tâche… », puis « Hub + site ». Deux terminaux s'ouvrent ; attendre que le hub (port 4000) et le site (port 3000) affichent « Ready ».

### Essai 1 — connexion par email (carte 073)

1. Ouvrir `http://localhost:3000/auth/login` dans une fenêtre de navigation privée.
2. Vérifier que l'écran montre les boutons Discord, Google et email, comme avant, et **aucun** bouton « Compte BBFrance ».
3. Saisir une adresse email et valider.
4. Sans service d'envoi d'emails configuré, le lien n'est pas envoyé : il s'affiche dans le terminal du hub (ligne « [hub] SMTP non configuré : lien magique pour … »). L'ouvrir dans **la même fenêtre** de navigateur.
5. Attendu : on arrive sur le site, connecté, sans avoir vu d'écran du hub (au plus un court message « Redirection… »).
6. Rouvrir un lien déjà utilisé : attendu, un message d'erreur clair et aucune boucle de redirection.

### Essai 2 — connexion par Discord, puis par Google (carte 073)

1. Fenêtre privée, `http://localhost:3000/auth/login`, bouton Discord.
2. Attendu : on passe directement à l'écran d'autorisation de Discord, puis on revient sur le site connecté. Aucun écran du hub entre les deux.
3. Se déconnecter, puis refaire la même chose avec Google.

### Essai 3 — bannissement immédiat (carte 069)

1. Connecté avec un compte de test dans une fenêtre, bannir ce compte depuis l'administration dans une autre fenêtre (compte administrateur).
2. Attendu : à la page suivante, le compte banni arrive sur `/banned`, sans attendre.

### Essai 4 — vrai téléphone, après la refonte (cartes 068 et E08)

1. Lancer le site accessible depuis le réseau local (procédure complète dans `docs/mobile-audit.md`, section « Tester sur un vrai téléphone ») : dans un terminal PowerShell de `apps/site`, `$env:ALLOWED_DEV_ORIGINS="192.168.1.99"; corepack pnpm dev -H 0.0.0.0`.
2. Sur le téléphone (Chrome ; Firefox pour Android n'arrive pas à ouvrir le site local), ouvrir `http://192.168.1.99:3000`.
3. Le tour complet des écrans refaits suit la liste de la carte 114 (`docs/refonte/tests-manuels.md`) : faire les deux essais pendant la même séance.
4. Sur `/bbscheme` : écarter et rapprocher deux doigts sur le terrain agrandit et réduit le terrain seul, pas la page ; le curseur de zoom suit.
5. Si un iPhone est disponible, refaire les points 3 et 4 avec Safari.

### Après les essais

- Noter les résultats dans une section « Résultat » de cette carte. Chaque défaut trouvé devient une carte séparée (`/card`).
- Si les essais 1 et 2 réussissent : `git mv kanban/a-tester/073-hub-invisible.md kanban/termine/`.
- La mise en ligne du hub (carte 035) ne commence qu'après la réussite des essais 1 et 2.
