import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// auth.ts - MODE SIMULATION DYNAMIQUE
export const auth = async () => {
  noStore();
  const cookieStore = await cookies();
  const simulatedId = cookieStore.get("simulated_user_id")?.value;

  // If explicitly set to empty or "DISCONNECTED", simulate a logged-out user
  if (simulatedId === "" || simulatedId === "DISCONNECTED") {
    return null;
  }

  const userId = simulatedId || "user_test_breakyt";

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.warn(`[AUTH] Utilisateur simulé introuvable en base : ${userId}. Cliquez sur "Créer comptes de Test" dans le widget de debug.`);
      return null;
    }

    return {
      user,
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
