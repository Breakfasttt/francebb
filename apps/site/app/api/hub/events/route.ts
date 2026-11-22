/**
 * POST /api/hub/events : le hub prévient le site (profil modifié, bannissement, suppression : cartes 122 et 124).
 * Le message est accepté seulement s'il est signé avec HUB_EVENTS_SECRET, récent et pas déjà reçu.
 * Une réponse 200 vaut accusé de réception ; une erreur fait renvoyer le message plus tard par le hub.
 */
import { markHubEventHandled, verifyHubEvent } from "@/lib/hub/verifyHubEvent";
import { handleHubEvent, type HubEventInput } from "@/lib/hub/hubEvents";

/** Erreurs passagères de la base (connexion coupée, requête mêlée à une autre) : le traitement est rejoué. */
const TRANSIENT_DB_ERROR = /bind message supplies|prepared statement|Server has closed|Connection terminated|ECONNRESET|ConnectionClosed/;
const ATTEMPTS = 3;

/**
 * Traite l'événement, en le rejouant jusqu'à 3 fois sur une erreur passagère de la base. Sans cela, le hub ne le
 * renvoie qu'à sa tâche quotidienne. Chaque traitement écrit l'état reçu : le rejouer ne change rien (lib/hub/hubEvents.ts).
 */
async function handleWithRetry(event: HubEventInput) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await handleHubEvent(event);
    } catch (error) {
      const transient = error instanceof Error && TRANSIENT_DB_ERROR.test(`${error.message} ${String((error as { cause?: unknown }).cause ?? "")}`);
      if (!transient || attempt >= ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
    }
  }
}

export async function POST(request: Request) {
  const secret = process.env.HUB_EVENTS_SECRET;
  if (!secret) return Response.json({ error: "Événements du hub non configurés" }, { status: 503 });

  const body = await request.text();
  const check = verifyHubEvent(secret, body, request.headers);
  // Un message déjà traité reçoit quand même un accusé de réception, pour que le hub arrête de le renvoyer
  if (!check.ok) return Response.json({ error: check.reason }, { status: check.reason === "événement déjà reçu" ? 200 : 401 });

  try {
    await handleWithRetry(check.event);
    markHubEventHandled(check.event.id);
    return Response.json({ received: check.event.id });
  } catch (error) {
    console.error(`Événement du hub ${check.event.type} non traité`, error);
    return Response.json({ error: "Traitement impossible" }, { status: 500 });
  }
}
