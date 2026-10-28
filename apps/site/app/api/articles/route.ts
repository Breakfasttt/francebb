import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get("authorId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "6");
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (authorId) {
      where.authorId = authorId;
    }
    
    // On ne montre que les articles non modérés (ou on laisse le frontend gérer ?)
    // En général on veut cacher les modérés sauf si c'est notre propre profil
    // Pour simplifier, on montre tout ici.
    
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: true,
          tags: true,
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
