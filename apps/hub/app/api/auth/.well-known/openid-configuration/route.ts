/**
 * Découverte OIDC (issuer = <BETTER_AUTH_URL>/api/auth) : lue par les apps clientes (Auth.js côté site).
 */
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import { auth } from "@/lib/auth";

// Avec 4 plugins, TypeScript n'arrive plus à déduire tous les endpoints de `auth.api` (limite de l'inférence de
// types, pas du code) : `getOpenIdConfig` existe bien à l'exécution, ce que vérifie le test SSO (tests/sso.spec.ts).
type OpenIdConfigAuth = Parameters<typeof oauthProviderOpenIdConfigMetadata>[0];

export const GET = oauthProviderOpenIdConfigMetadata(auth as unknown as OpenIdConfigAuth);
