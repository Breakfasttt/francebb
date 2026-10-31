/**
 * Tâche planifiée de purge (lib/purge.ts), lancée chaque nuit par Vercel (vercel.json).
 * Route interne, absente de la documentation publique : Vercel l'appelle avec l'en-tête
 * « Authorization: Bearer <CRON_SECRET> », toute autre demande est refusée.
 */
import { timingSafeEqual } from "node:crypto";
import { purgeExpiredData } from "@/lib/purge";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return Response.json({ error: "Accès refusé" }, { status: 401 });
  return Response.json(await purgeExpiredData());
}
