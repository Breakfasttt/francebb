import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const userId = "user_test_breakyt";
  const { name, image } = await req.json();

  const updatedUser = await prisma.user.upsert({
    where: { id: userId },
    update: { name, image },
    create: {
      id: userId,
      name: name || "Breakyt",
      email: "breakyt@bbfrance.fr",
      image: image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Breakyt"
    }
  });

  revalidatePath("/");
  revalidatePath("/profile");

  return NextResponse.json({ success: true });
}
