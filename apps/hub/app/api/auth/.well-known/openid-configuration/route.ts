/**
 * Découverte OIDC (issuer = <BETTER_AUTH_URL>/api/auth) : lue par les apps clientes (Auth.js côté site).
 * Le champ standard `service_documentation` indique où lire la documentation de l'API (GET /api/doc, carte 117).
 */
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import { auth } from "@/lib/auth";

// Avec 4 plugins, TypeScript n'arrive plus à déduire tous les endpoints de `auth.api` (limite de l'inférence de
// types, pas du code) : `getOpenIdConfig` existe bien à l'exécution, ce que vérifie le test SSO (tests/sso.spec.ts).
type OpenIdConfigAuth = Parameters<typeof oauthProviderOpenIdConfigMetadata>[0];

const getMetadata = oauthProviderOpenIdConfigMetadata(auth as unknown as OpenIdConfigAuth);

export async function GET(request: Request) {
  const response = await getMetadata(request);
  if (!response.ok) return response;
  const metadata = (await response.json()) as Record<string, unknown>;
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return Response.json({ ...metadata, service_documentation: `${process.env.BETTER_AUTH_URL}/api/doc` }, { status: response.status, headers });
}
