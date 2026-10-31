/**
 * POST /api/hub/events : le hub prévient le site (profil modifié, bannissement, suppression : cartes 122 et 124).
 * Le message est accepté seulement s'il est signé avec HUB_EVENTS_SECRET, récent et pas déjà reçu.
 * Une réponse 200 vaut accusé de réception ; une erreur fait renvoyer le message plus tard par le hub.
 */
import { markHubEventHandled, verifyHubEvent } from "@/lib/hub/verifyHubEvent";
import { handleHubEvent } from "@/lib/hub/hubEvents";

export async function POST(request: Request) {
  const secret = process.env.HUB_EVENTS_SECRET;
  if (!secret) return Response.json({ error: "Événements du hub non configurés" }, { status: 503 });

  const body = await request.text();
  const check = verifyHubEvent(secret, body, request.headers);
  // Un message déjà traité reçoit quand même un accusé de réception, pour que le hub arrête de le renvoyer
  if (!check.ok) return Response.json({ error: check.reason }, { status: check.reason === "événement déjà reçu" ? 200 : 401 });

  try {
    await handleHubEvent(check.event);
    markHubEventHandled(check.event.id);
    return Response.json({ received: check.event.id });
  } catch (error) {
    console.error(`Événement du hub ${check.event.type} non traité`, error);
    return Response.json({ error: "Traitement impossible" }, { status: 500 });
  }
}
