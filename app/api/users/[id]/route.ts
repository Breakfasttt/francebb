import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const isSelf = session?.user?.id === id;
  const isMod = isModerator(session?.user?.role);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        nafNumber: true,
        region: true,
        equipe: true,
        ligueCustom: true,
        ligues: {
          select: {
            id: true,
            name: true,
            acronym: true,
            geographicalZone: true,
            region: true
          }
        },
        signature: true,
        isBanned: true,
        avatarFrame: true,
        theme: true,
        // Données sensibles (uniquement si soi-même ou modo/admin)
        notifPm: isSelf || isMod,
        notifMention: isSelf || isMod,
        notifFollowedTopic: isSelf || isMod,
        notifNewsletter: isSelf || isMod,
        accounts: (isSelf || isMod) ? {
          select: {
            provider: true
          }
        } : false,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
