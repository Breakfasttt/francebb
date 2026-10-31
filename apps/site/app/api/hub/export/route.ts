/**
 * POST /api/hub/export : le passeport demande les données d'un membre pour l'export RGPD (carte 125).
 * La demande doit être signée avec HUB_EVENTS_SECRET et récente, comme les événements (lib/hub/verifyHubEvent.ts).
 */
import { markHubEventHandled, verifyHubEvent } from "@/lib/hub/verifyHubEvent";
import { findUserByHubId } from "@/lib/hub/hubAccount";
import { exportMember } from "@/lib/hub/memberExport";

export async function POST(request: Request) {
  const secret = process.env.HUB_EVENTS_SECRET;
  if (!secret) return Response.json({ error: "Échanges avec le hub non configurés" }, { status: 503 });

  const check = verifyHubEvent(secret, await request.text(), request.headers);
  if (!check.ok || check.event.type !== "user.export") return Response.json({ error: check.ok ? "type inattendu" : check.reason }, { status: 401 });
  markHubEventHandled(check.event.id);

  const userId = await findUserByHubId(check.event.data.userId);
  if (!userId) return Response.json({ site: "BBFrance", message: "Aucune donnée : ce coach n'a pas de compte sur le site." });
  return Response.json(await exportMember(userId));
}
