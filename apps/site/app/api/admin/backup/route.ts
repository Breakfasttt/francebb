import { auth } from "@/auth";
import { getRolePower, ROLE_POWER } from "@/lib/roles";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const session = await auth();
  if (!session?.user?.role || getRolePower(session.user.role) < ROLE_POWER.SUPERADMIN) {
    return new NextResponse("Accès refusé. Seul un Super Admin peut télécharger la base.", { status: 403 });
  }

  try {
    const dbPath = path.join(process.cwd(), "dev.db");
    if (!fs.existsSync(dbPath)) {
      return new NextResponse("Fichier de base de données introuvable", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="backup_bbfrance.db"',
        "Content-Type": "application/x-sqlite3",
      },
    });
  } catch (error) {
    return new NextResponse("Erreur lors de la génération de la sauvegarde", { status: 500 });
  }
}
