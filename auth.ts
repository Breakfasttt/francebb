import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";

// auth.ts - MODE SIMULATION DYNAMIQUE
export const auth = async () => {
  noStore();
  const userId = "user_test_breakyt";
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const now = new Date().toLocaleTimeString();
    console.log(`[AUTH @ ${now}] Session demandée pour ${userId}. Trouvé en base : ${user?.name || "aucun (par défaut)"}`);

    return {
      user: user || {
        id: userId,
        name: "Breakyt",
        email: "breakyt@bbfrance.fr",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Breakyt",
        role: "ADMIN"
      },
      expires: "2030-01-01T00:00:00.000Z"
    };
  } catch (error) {
    console.error("Erreur lors du fetch de la session simulée:", error);
    return null;
  }
};

export const handlers = {
  GET: async () => {
    const session = await auth();
    return NextResponse.json(session);
  },
  POST: () => NextResponse.json({ success: true }),
};

export const signIn = async () => { console.log("SignIn désactivé en mode simulation"); };
export const signOut = async () => { console.log("SignOut désactivé en mode simulation"); };
