/**
 * Adresse de lecture d'un schéma : `GET /api/boards/<identifiant>` (carte 179, ADR-0008).
 *
 * C'est par elle que le site affiche les schémas des messages du forum (balise [bbscheme]) : le serveur du site
 * l'appelle avec le réglage BBSCHEME_URL. L'identifiant est celui du schéma ou, à défaut, son empreinte (hash), car
 * d'anciens liens utilisent l'une ou l'autre.
 *
 * Réponse : `{ "data": "<contenu JSON du schéma>" }`, la même forme que l'ancienne action `getBoardState` du site.
 * Aucune donnée personnelle n'est renvoyée (pas l'identifiant du créateur). Un schéma ne change jamais une fois
 * enregistré : la réponse peut être gardée une minute par les navigateurs et les serveurs intermédiaires.
 * Schéma inconnu : 404 ; base injoignable : 500. Dans les deux cas, le site affiche « Schéma indisponible ».
 */
import { prisma } from "@/lib/prisma";

const CACHE_SECONDS = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const board =
      (await prisma.bBSchemeState.findUnique({ where: { id }, select: { data: true } })) ??
      (await prisma.bBSchemeState.findUnique({ where: { hash: id }, select: { data: true } }));
    if (!board) {
      return Response.json({ error: "Schéma introuvable" }, { status: 404, headers: { "Cache-Control": `public, max-age=${CACHE_SECONDS}` } });
    }
    return Response.json({ data: board.data }, { headers: { "Cache-Control": `public, max-age=${CACHE_SECONDS}` } });
  } catch (error) {
    console.error("Lecture d'un schéma impossible :", error);
    return Response.json({ error: "Lecture du schéma impossible" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
