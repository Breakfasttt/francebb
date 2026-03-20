import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { name, image } = await req.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, image },
  });

  return NextResponse.json({ success: true });
}
