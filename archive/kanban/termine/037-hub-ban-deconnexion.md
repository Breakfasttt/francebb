---
id: 037
title: Ban global et déconnexion propagés
epic: E06
app: hub
depends_on: [022]
adr: 0003
verify: un membre banni au hub ne peut plus se connecter au site ; logout site déconnecte du hub
---

# 037 — Ban global et déconnexion propagés

## Action

Ban décidé au hub : refus de connexion + révocation des refresh tokens. Déconnexion globale (`end_session`). Le site garde son ban local (rôle forum).

## Résultat

- Bannissement au hub : plugin `admin` de Better Auth et script `pnpm ban <email> "<raison>"` (ou `--unban`) dans `apps/hub`. Un compte banni ne peut plus se connecter au hub ; ses sessions hub sont fermées et ses jetons d'accès aux applications révoqués. Une session déjà ouverte sur le site dure jusqu'à son expiration : le bannissement local du site reste l'outil pour un effet immédiat.
- Déconnexion globale : sur le site en mode hub, « Déconnexion » passe par la route `/auth/logout` (POST seulement), qui ferme la session du site puis envoie le coach vers la page de déconnexion du hub. Le jeton d'identité du hub reste dans le cookie de session chiffré, lu côté serveur : le navigateur ne le voit jamais.
- Tests : `tests/sso.spec.ts` couvre la déconnexion globale, l'absence du jeton dans la session du navigateur et le refus d'un compte banni (5/5). Tests du site : 50 passent.
- Documentation : `DEPLOY.md` (commande de bannissement, nouvel enregistrement des applications clientes), fiche `docs/features/hub/README.md`, glossaire (« Déconnexion globale »).
