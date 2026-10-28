/**
 * Liste paginée des articles d'un auteur, pour l'onglet « Articles » du profil (ProfileArticles).
 * Adresse publique : ne renvoie que ce que la carte d'article affiche (jamais la fiche complète de l'auteur),
 * et cache les articles masqués par la modération, sauf à leur auteur et aux modérateurs (carte 050).
 */
import { getSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import type { Prisma } from "@/prisma/generated-client";
import { NextRequest, NextResponse } from "next/server";

const MAX_PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get("authorId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("limit") || "6") || 6));
  const skip = (page - 1) * limit;

  try {
    const session = await getSession();
    const viewerId = session?.user?.id;
    const canSeeModerated = isModerator(session?.user?.role) || (!!viewerId && viewerId === authorId);

    const where: Prisma.ArticleWhereInput = {};
    if (authorId) where.authorId = authorId;
    if (!canSeeModerated) where.isModerated = false;

    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true, avatarFrame: true, role: true } },
          tags: true,
          reactions: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (error) {
    console.error("Error in GET /api/articles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
