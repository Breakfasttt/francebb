import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../prisma/generated-client";
import fs from "fs";
import path from "path";

// Configuration pour Turso (Prod)
// NOTE: L'utilisateur doit avoir décommenté TURSO_DATABASE_URL dans .env ou on le passe ici.
const TURSO_URL = "libsql://bbfrance-db-breakfasttt.aws-eu-west-1.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY3ODEyNjksImlkIjoiMDE5ZGIwNmEtMjMwMS03NTU4LWIxZTctY2MxNDkyNGJjZDEwIiwicmlkIjoiNDA5ZGVkZmUtMzBlZC00MmVlLThhNjQtZmFhMzc3NTA3MzY3In0.BSYUzer0C_1F6XwRFFnGtBFirMeL3q9mB4s8z3JQ9b-i3jiZBXRRLtv6ZZonxWDYkNky0d1dBeakbYaOV6e2BA";

const adapter = new PrismaLibSql({ url: TURSO_URL });
const prisma = new PrismaClient({ adapter });

async function exportArchives() {
  console.log("📡 Connexion à Turso pour récupérer les archives...");
  
  const archives = await prisma.rankingArchive.findMany({
    orderBy: { year: 'desc' }
  });

  console.log(`✅ ${archives.length} archives récupérées.`);

  const outputPath = path.join(process.cwd(), "prisma", "archives_data.json");
  fs.writeFileSync(outputPath, JSON.stringify(archives, null, 2));

  console.log(`💾 Données sauvegardées dans : ${outputPath}`);
}

exportArchives()
  .catch(e => console.error("❌ Erreur :", e))
  .finally(() => prisma.$disconnect());
