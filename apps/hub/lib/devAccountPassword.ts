/**
 * Mot de passe commun à tous les comptes de test du hub (carte 153). Ce n'est pas un secret : ces comptes
 * n'existent qu'en local, et la connexion par mot de passe est refusée en production (lib/auth.ts).
 * Fichier à part pour être lu à la fois par le serveur (lib/devAccounts.ts) et par le navigateur.
 */
export const DEV_ACCOUNT_PASSWORD = "dev-password-123";
