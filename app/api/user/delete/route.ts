import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const userId = "user_test_breakyt";

  await prisma.user.deleteMany({
    where: { id: userId },
  });

  return NextResponse.json({ success: true });
}
