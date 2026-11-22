/**
 * Compte une lecture d'article (appelée par ViewCounter.tsx à l'ouverture de l'article).
 *
 * Carte 221 : une seule lecture par article et par visite, contrôlée par le serveur grâce au cookie de session
 * `bbf_articles_lus`. Avant, l'action serveur `incrementArticleViews` ne s'appuyait que sur le navigateur, et n'importe
 * qui pouvait gonfler le compteur en la rappelant. C'est une route et non une action serveur : une action qui pose un
 * cookie fait recharger la page par Next.js, ce qui affichait tout de suite le compteur augmenté.
 * Un article masqué par la modération n'est pas compté.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VIEWED_ARTICLES_COOKIE = "bbf_articles_lus";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id.length > 100) return NextResponse.json({ success: false }, { status: 400 });

  const cookieHeader = request.headers.get("cookie") ?? "";
  const raw = cookieHeader.split(/;\s*/).find((part) => part.startsWith(`${VIEWED_ARTICLES_COOKIE}=`))?.split("=")[1] ?? "";
  const seen = decodeURIComponent(raw).split(",").filter(Boolean);
  if (seen.includes(id)) return NextResponse.json({ success: true, counted: false });

  const updated = await prisma.article.updateMany({ where: { id, isModerated: false }, data: { views: { increment: 1 } } });
  const response = NextResponse.json({ success: true, counted: updated.count > 0 });
  if (updated.count > 0) {
    response.cookies.set(VIEWED_ARTICLES_COOKIE, [...seen, id].slice(-50).join(","), { httpOnly: true, sameSite: "lax", path: "/" });
  }
  return response;
}
