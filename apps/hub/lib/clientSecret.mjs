/**
 * Hachage des secrets des apps clientes OIDC (SHA-256, base64url). Explicite plutôt que le hachage interne
 * du plugin : scripts/register-client.mjs enregistre ainsi un client sans session admin.
 */
import { createHash } from "node:crypto";

/** @param {string} secret */
export async function hashClientSecret(secret) {
  return createHash("sha256").update(secret).digest("base64url");
}
