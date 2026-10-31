/**
 * Instance Better Auth du hub d'identité BBFrance (fournisseur OIDC des apps du monorepo).
 * - Connexion : Discord, Google, lien magique. Mot de passe uniquement en dev/test (HUB_DEV_PASSWORD_LOGIN=1).
 * - Liaison de comptes : uniquement si le fournisseur certifie l'email (pas de `trustedProviders`),
 *   pour qu'un compte Discord ne puisse pas s'approprier le compte d'un autre via un email non vérifié.
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { openAPI } from "better-auth/plugins";
import { prisma } from "./prisma.mjs";
import { authPlugins, rateLimitOptions, userAdditionalFields } from "./authPlugins.mjs";
import { passportPlugin } from "./passportPlugin";
import { nameKeyOf, publicProfile, uniqueNameFor } from "./profile";
import { emitUserEvent } from "./events.mjs";
import { isBannedEmail } from "./accountDeletion";
import { writeAudit } from "./audit.mjs";
import { sendMagicLinkEmail } from "./mail";

const isProduction = process.env.NODE_ENV === "production";

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  socialProviders.discord = { clientId: process.env.DISCORD_CLIENT_ID, clientSecret: process.env.DISCORD_CLIENT_SECRET };
}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET };
}

async function sendMagicLink({ email, url }: { email: string; url: string }) {
  const sent = await sendMagicLinkEmail(email, url);
  // Better Auth renvoie l'erreur au formulaire : le membre sait que le lien n'est pas parti
  if (!sent) throw new Error("Envoi du lien de connexion impossible");
}

export const auth = betterAuth({
  appName: "BBFrance",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // /token du plugin jwt entre en conflit avec le endpoint OAuth : désactivé (doc oauth-provider).
  // Les deux adresses du plugin openAPI montrent aussi les routes d'administration : la documentation publique
  // passe uniquement par GET /api/doc, qui les retire (carte 117)
  // /update-user est remplacé par /api/v1/profile, qui vérifie le profil et l'unicité du pseudo (carte 119)
  disabledPaths: ["/token", "/open-api/generate-schema", "/reference", "/update-user"],
  // Profil du coach : pseudo unique, NAF, région, langue, fuseau horaire (lib/authPlugins.mjs)
  user: { additionalFields: userAdditionalFields },
  emailAndPassword: { enabled: !isProduction && process.env.HUB_DEV_PASSWORD_LOGIN === "1" },
  socialProviders,
  // Jetons Discord et Google chiffrés en base avec BETTER_AUTH_SECRET (carte 118)
  account: { accountLinking: { enabled: true }, encryptOAuthTokens: true },
  rateLimit: rateLimitOptions,
  // Journal d'audit des actions sensibles (lib/audit.mjs) : l'adresse de la route appelante dit ce qui s'est passé
  databaseHooks: {
    user: {
      create: {
        // Un compte créé par Discord ou Google garde son pseudo s'il est libre, sinon « Pseudo 2 », « Pseudo 3 »…
        before: async (user) => {
          // Un compte banni puis supprimé ne revient pas avec le même email (ADR-0007)
          if (await isBannedEmail(user.email)) return false;
          const name = await uniqueNameFor(user.name);
          return { data: { ...user, name, nameKey: nameKeyOf(name), locale: "fr", timezone: "Europe/Paris" } };
        },
        after: async (user) => writeAudit({ action: "inscription", userId: user.id }),
      },
      update: {
        // Garde la clé d'unicité alignée sur le pseudo, quel que soit le chemin de la modification
        before: async (data) => (typeof data.name === "string" ? { data: { ...data, nameKey: nameKeyOf(data.name) } } : undefined),
        // Journal, puis événement signé aux applications qui connaissent ce coach (carte 121)
        after: async (user, ctx) => {
          await writeAudit({ action: `compte modifié (${ctx?.path ?? "serveur"})`, userId: user.id });
          const fields = user as typeof user & Record<string, unknown>;
          await emitUserEvent(fields.banned ? "user.banned" : "user.updated", user.id, { profile: publicProfile(fields), banned: Boolean(fields.banned) });
        },
      },
      delete: { after: async (user) => writeAudit({ action: "compte supprimé", userId: user.id }) },
    },
    session: {
      create: { after: async (session) => writeAudit({ action: "connexion", userId: session.userId, ipAddress: session.ipAddress }) },
    },
  },
  // openAPI : décrit les routes pour GET /api/doc ; il n'ajoute aucune table, d'où sa place hors de authPlugins
  plugins: [...authPlugins({ sendMagicLink }), openAPI({ disableDefaultReference: true }), passportPlugin(), nextCookies()],
});
