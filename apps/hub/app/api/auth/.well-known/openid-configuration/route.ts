/**
 * Découverte OIDC (issuer = <BETTER_AUTH_URL>/api/auth) : lue par les apps clientes (Auth.js côté site).
 */
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import { auth } from "@/lib/auth";

export const GET = oauthProviderOpenIdConfigMetadata(auth);
