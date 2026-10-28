/**
 * Endpoints Better Auth du hub : connexion, sessions, OAuth 2.1 / OIDC (authorize, token, userinfo, jwks).
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
