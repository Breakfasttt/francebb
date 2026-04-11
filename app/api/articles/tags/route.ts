import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Retourne la liste de tous les tags d'articles existants
 * Utile pour les suggestions du TagSelector
 */
export async function GET() {
  try {
    const tags = await prisma.articleTag.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("API Tags Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
