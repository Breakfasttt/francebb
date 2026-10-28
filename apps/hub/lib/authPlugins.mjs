/**
 * Plugins Better Auth du hub, partagés entre la config runtime (lib/auth.ts) et le générateur de schéma
 * (scripts/generate-schema.mjs) : un plugin ajouté ici ajoute ses tables au schéma.
 * - jwt : clés de signature (JWKS) des id_token OIDC.
 * - magicLink : connexion par lien envoyé par email.
 * - oauthProvider : le hub devient fournisseur OIDC pour le site, bbscheme et les futures apps.
 */
import { jwt, magicLink } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { hashClientSecret } from "./clientSecret.mjs";

/**
 * @param {{ sendMagicLink: (data: { email: string, url: string }) => Promise<void> }} options
 * @returns {[ReturnType<typeof jwt>, ReturnType<typeof magicLink>, ReturnType<typeof oauthProvider>]}
 * Tuple explicite : sans lui, TypeScript perd le type de chaque plugin et `auth.api` n'expose plus leurs endpoints.
 */
export function authPlugins({ sendMagicLink }) {
  return [
    jwt(),
    magicLink({ sendMagicLink }),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/consent",
      scopes: ["openid", "profile", "email", "offline_access"],
      storeClientSecret: { hash: hashClientSecret },
      // Le plugin ne met les claims profil/email que dans /userinfo ; Auth.js (site) lit l'id_token :
      // on y copie pseudo, avatar et email vérifié selon les scopes accordés (OIDC Core §5.4)
      customIdTokenClaims: ({ user, scopes }) => ({
        ...(scopes.includes("profile") ? { name: user.name, picture: user.image ?? undefined } : {}),
        ...(scopes.includes("email") ? { email: user.email, email_verified: user.emailVerified } : {}),
      }),
    }),
  ];
}
