/**
 * Client Better Auth du navigateur (pages du hub). oauthProviderClient joint la requête OAuth en cours
 * (signée) à la connexion : une fois connecté, le hub reprend l'autorisation et renvoie vers l'app cliente.
 */
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const authClient = createAuthClient({ plugins: [magicLinkClient(), oauthProviderClient()] });
