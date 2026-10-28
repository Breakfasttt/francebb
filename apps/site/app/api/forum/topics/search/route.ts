import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getForumAccess, topicAccessWhere } from "@/lib/forumAccess";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (query.trim().length < 2) {
    return NextResponse.json([]);
  }

  const { roles } = await getForumAccess();
  const topics = await prisma.topic.findMany({
    where: {
      title: {
        contains: query,
        mode: "insensitive",
      },
      isArchived: false,
      ...topicAccessWhere(roles),
    },
    take: 10,
    select: {
      id: true,
      title: true,
      forum: {
        select: { name: true },
      },
    },
  });

  return NextResponse.json(
    topics.map((t) => ({ id: t.id, title: t.title, forumName: t.forum.name }))
  );
}
