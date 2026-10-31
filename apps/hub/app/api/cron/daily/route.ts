/**
 * Tâche planifiée quotidienne, lancée chaque nuit par Vercel (vercel.json) : purge des données expirées
 * (lib/purge.ts) et nouvel essai des événements que les applications n'ont pas encore reçus (lib/events.mjs).
 * Route interne, absente de la documentation publique : Vercel l'appelle avec l'en-tête
 * « Authorization: Bearer <CRON_SECRET> », toute autre demande est refusée.
 */
import { timingSafeEqual } from "node:crypto";
import { purgeExpiredData } from "@/lib/purge";
import { deliverDueEvents } from "@/lib/events.mjs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "Accès refusé" }, { status: 401 });
  return Response.json({ purge: await purgeExpiredData(), events: await deliverDueEvents() });
}
