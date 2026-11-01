"use server";

/**
 * Actions serveur de la section « Comptes de test » de la page de connexion (carte 153).
 * Refusées en production et sans HUB_DEV_PASSWORD_LOGIN=1 (voir lib/devAccounts.ts).
 */
import { createDevAccount, devAccountsEnabled, listDevAccounts } from "@/lib/devAccounts";

/** Liste des comptes de test, ou `null` si la fonction est désactivée (la section reste alors cachée). */
export async function listDevAccountsAction() {
  return devAccountsEnabled() ? listDevAccounts() : null;
}

export async function createDevAccountAction() {
  return createDevAccount();
}
