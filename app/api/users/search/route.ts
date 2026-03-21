import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
