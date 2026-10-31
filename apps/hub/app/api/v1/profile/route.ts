/**
 * GET et PATCH /api/v1/profile : profil du coach (carte 119). Transmis tel quel au plugin du passeport
 * (lib/passportPlugin.ts), qui vit sous /api/auth comme toutes les routes de Better Auth.
 */
import { auth } from "@/lib/auth";

async function forward(request: Request) {
  const url = request.url.replace("/api/v1/", "/api/auth/v1/");
  const body = request.method === "GET" ? undefined : await request.text();
  return auth.handler(new Request(url, { method: request.method, headers: request.headers, body }));
}

export const GET = forward;
export const PATCH = forward;
