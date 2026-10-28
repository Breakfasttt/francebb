/**
 * Instance Better Auth du hub d'identité BBFrance (fournisseur OIDC des apps du monorepo).
 * - Connexion : Discord, Google, lien magique. Mot de passe uniquement en dev/test (HUB_DEV_PASSWORD_LOGIN=1).
 * - Liaison de comptes : uniquement si le fournisseur certifie l'email (pas de `trustedProviders`),
 *   pour qu'un compte Discord ne puisse pas s'approprier le compte d'un autre via un email non vérifié.
 */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma.mjs";
import { authPlugins } from "./authPlugins.mjs";
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
  // /token du plugin jwt entre en conflit avec le endpoint OAuth : désactivé (doc oauth-provider)
  disabledPaths: ["/token"],
  emailAndPassword: { enabled: !isProduction && process.env.HUB_DEV_PASSWORD_LOGIN === "1" },
  socialProviders,
  account: { accountLinking: { enabled: true } },
  plugins: [...authPlugins({ sendMagicLink }), nextCookies()],
});
