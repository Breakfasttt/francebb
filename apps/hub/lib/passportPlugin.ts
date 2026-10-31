/**
 * Plugin Better Auth du passeport (carte 119, ADR-0007) : lecture et modification du profil du coach.
 * Adresse publique : /api/v1/profile (app/api/v1/profile/route.ts la transmet à /api/auth/v1/profile).
 *
 * Deux façons d'appeler :
 * - une application cliente, avec le jeton d'accès du coach (« Authorization: Bearer … ») : la portée
 *   `bbfrance:profile` permet de lire, `bbfrance:profile:write` de modifier ;
 * - les pages du passeport, avec la session du coach sur le hub (cookie).
 *
 * C'est le seul moyen de modifier le profil : la route /update-user de Better Auth est désactivée (lib/auth.ts).
 *
 * Il donne aussi au coach, avec sa session seulement, la liste des applications qui ont accès à son compte et le
 * moyen de leur retirer cet accès (/api/v1/applications, carte 120).
 */
import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { getOAuthProviderApi } from "@better-auth/oauth-provider";
import { PROFILE_SCOPE, PROFILE_WRITE_SCOPE } from "./authPlugins.mjs";
import { isNameAvailable, nameKeyOf, publicProfile, validateProfileUpdate } from "./profile";
import { listUserApplications, revokeUserApplication } from "./applications";
import { writeAudit } from "./audit.mjs";

type EndpointContext = Parameters<typeof getSessionFromCtx>[0];
type OAuthProviderOptions = Parameters<typeof getOAuthProviderApi>[1];

/** Retrouve le coach qui appelle, par son jeton d'accès (avec la portée demandée) ou par sa session sur le hub. */
async function resolveCoach(ctx: EndpointContext, requiredScope: string) {
  const authorization = ctx.headers?.get("authorization");
  let userId: string | undefined;

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    const oauthPlugin = ctx.context.getPlugin("oauth-provider") as { options: OAuthProviderOptions } | null;
    if (!oauthPlugin) throw new APIError("INTERNAL_SERVER_ERROR", { message: "Fournisseur OIDC absent" });
    const payload = await getOAuthProviderApi(ctx, oauthPlugin.options).requireActiveAccessToken(authorization.slice(7).trim());
    const scopes = String(payload.scope ?? "").split(" ");
    if (!scopes.includes(requiredScope)) {
      throw new APIError("FORBIDDEN", { message: `Le jeton n'a pas la portée ${requiredScope}.`, code: "INSUFFICIENT_SCOPE" });
    }
    userId = typeof payload.sub === "string" ? payload.sub : undefined;
  } else {
    userId = (await getSessionFromCtx(ctx))?.user.id;
  }

  if (!userId) throw new APIError("UNAUTHORIZED", { message: "Connexion requise." });
  const user = (await ctx.context.internalAdapter.findUserById(userId)) as Record<string, unknown> | null;
  if (!user) throw new APIError("UNAUTHORIZED", { message: "Compte introuvable." });
  if (user.banned) throw new APIError("FORBIDDEN", { message: "Ce compte BBFrance a été suspendu.", code: "BANNED" });
  return user;
}

export const passportPlugin = () =>
  ({
    id: "bbfrance-passport",
    endpoints: {
      profile: createAuthEndpoint("/v1/profile", { method: ["GET", "PATCH"] }, async (ctx) => {
        if (ctx.request?.method !== "PATCH") {
          return ctx.json(publicProfile(await resolveCoach(ctx, PROFILE_SCOPE)));
        }

        const user = await resolveCoach(ctx, PROFILE_WRITE_SCOPE);
        const result = validateProfileUpdate(ctx.body);
        if ("errors" in result) throw new APIError("BAD_REQUEST", { message: "Profil invalide.", code: "INVALID_PROFILE", errors: result.errors });
        const { data } = result;
        if (data.name && !(await isNameAvailable(data.name, String(user.id)))) {
          throw new APIError("CONFLICT", { message: "Ce pseudo est déjà pris.", code: "NAME_TAKEN", errors: { name: "Ce pseudo est déjà pris." } });
        }

        const updated = await ctx.context.internalAdapter.updateUser(
          String(user.id),
          { ...data, ...(data.name ? { nameKey: nameKeyOf(data.name) } : {}) },
        );
        return ctx.json(publicProfile(updated as Record<string, unknown>));
      }),
      // Réservé à la session du coach sur le hub : une application ne peut pas voir ni retirer l'accès des autres
      applications: createAuthEndpoint("/v1/applications", { method: "GET" }, async (ctx) => {
        const session = await getSessionFromCtx(ctx);
        if (!session) throw new APIError("UNAUTHORIZED", { message: "Connexion requise." });
        return ctx.json(await listUserApplications(session.user.id));
      }),
      revokeApplication: createAuthEndpoint("/v1/applications/revoke", { method: "POST" }, async (ctx) => {
        const session = await getSessionFromCtx(ctx);
        if (!session) throw new APIError("UNAUTHORIZED", { message: "Connexion requise." });
        const clientId = (ctx.body as { clientId?: unknown } | undefined)?.clientId;
        if (typeof clientId !== "string" || !clientId) throw new APIError("BAD_REQUEST", { message: "clientId manquant." });
        await revokeUserApplication(session.user.id, clientId);
        await writeAudit({ action: `accès retiré à l'application ${clientId}`, userId: session.user.id });
        return ctx.json({ revoked: clientId });
      }),
    },
  }) satisfies BetterAuthPlugin;
