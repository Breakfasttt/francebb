/**
 * Transmet une demande reçue sur /api/v1/… au plugin du passeport (lib/passportPlugin.ts), qui vit sous /api/auth/v1/…
 * comme toutes les routes de Better Auth : l'adresse publique reste courte et versionnée.
 */
import { auth } from "@/lib/auth";

export async function forwardToAuth(request: Request) {
  const url = request.url.replace("/api/v1/", "/api/auth/v1/");
  const body = request.method === "GET" ? undefined : await request.text();
  return auth.handler(new Request(url, { method: request.method, headers: request.headers, body }));
}
