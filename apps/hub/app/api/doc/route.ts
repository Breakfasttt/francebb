/**
 * GET /api/doc : documentation de l'API du hub au format OpenAPI 3.1 (JSON), lisible par une application, un outil ou une IA.
 * GET /api/doc?route=<chemin> : seulement la description de cette route (carte 117).
 */
import { buildApiDoc, pickRoute } from "@/lib/apiDoc/buildApiDoc";

export async function GET(request: Request) {
  const doc = await buildApiDoc();
  const route = new URL(request.url).searchParams.get("route");
  if (!route) return Response.json(doc);

  const picked = pickRoute(doc, route);
  if (!picked) {
    return Response.json({ error: `Route inconnue : ${route}`, routes: Object.keys(doc.paths).sort() }, { status: 404 });
  }
  return Response.json(picked);
}
