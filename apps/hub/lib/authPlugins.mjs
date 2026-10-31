/**
 * Plugins Better Auth du hub, partagés entre la config runtime (lib/auth.ts) et le générateur de schéma
 * (scripts/generate-schema.mjs) : un plugin ajouté ici ajoute ses tables au schéma.
 * - jwt : clés de signature (JWKS) des id_token OIDC.
 * - magicLink : connexion par lien envoyé par email.
 * - oauthProvider : le hub devient fournisseur OIDC pour le site, bbscheme et les futures apps.
 * - admin : bannissement global (un compte banni ne peut plus se connecter à aucune application, carte 037).
 * - auditLogTable : table du journal d'audit (lib/audit.mjs, carte 118).
 */
import { admin, jwt, magicLink } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { hashClientSecret } from "./clientSecret.mjs";

/**
 * Limite du nombre de requêtes, stockée dans la base (carte 118) : en mémoire, chaque serveur Vercel aurait sa propre
 * limite et elle ne protégerait rien. Active en production, ou en test avec HUB_RATE_LIMIT=1.
 * Partagée avec le générateur de schéma, qui en déduit la table `rateLimit`.
 */
export const rateLimitOptions = {
  enabled: process.env.NODE_ENV === "production" || process.env.HUB_RATE_LIMIT === "1",
  storage: /** @type {const} */ ("database"),
};

// Plugin sans route qui déclare seulement la table du journal d'audit, pour que le générateur de schéma la crée
const auditLogTable = {
  id: "bbfrance-audit-log",
  schema: {
    auditLog: {
      fields: {
        action: { type: /** @type {const} */ ("string"), required: true },
        userHash: { type: /** @type {const} */ ("string"), required: false, index: true },
        ipHash: { type: /** @type {const} */ ("string"), required: false },
        createdAt: { type: /** @type {const} */ ("date"), required: true, index: true },
      },
    },
  },
};

/**
 * @param {{ sendMagicLink: (data: { email: string, url: string }) => Promise<void> }} options
 * @returns {[ReturnType<typeof jwt>, ReturnType<typeof magicLink>, ReturnType<typeof oauthProvider>, ReturnType<typeof admin>, typeof auditLogTable]}
 * Tuple explicite : sans lui, TypeScript perd le type de chaque plugin et `auth.api` n'expose plus leurs endpoints.
 */
export function authPlugins({ sendMagicLink }) {
  return [
    // Nouvelle clé de signature tous les 90 jours ; l'ancienne reste publiée 30 jours pour vérifier les jetons déjà émis
    jwt({ jwks: { rotationInterval: 60 * 60 * 24 * 90, gracePeriod: 60 * 60 * 24 * 30 } }),
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
    admin({ bannedUserMessage: "Ce compte BBFrance a été suspendu." }),
    auditLogTable,
  ];
}
