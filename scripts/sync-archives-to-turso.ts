import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";
import * as fs from 'fs';
import * as path from 'path';

// Charge les variables d'environnement
loadEnvConfig(process.cwd());

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("❌ TURSO_DATABASE_URL manquante dans le .env");
  process.exit(1);
}

const client = createClient({
  url: url,
  authToken: authToken
});

async function syncArchives() {
  console.log("🚀 Synchronisation des archives vers Turso...");

  const dataPath = path.join(process.cwd(), 'prisma', 'archives_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error("❌ Fichier prisma/archives_data.json introuvable.");
    process.exit(1);
  }

  const archives = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📂 Lecture de ${archives.length} archives depuis le JSON.`);

  const systemUserId = "cmo92gc8j000004l8j4lf8xtw"; // ID Système de prod

  const queries = archives.map((archive: any) => ({
    sql: `INSERT INTO RankingArchive (id, year, name, data, archivedById, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET 
            data = excluded.data,
            name = excluded.name,
            updatedAt = excluded.updatedAt`,
    args: [
      archive.id,
      archive.year,
      archive.name,
      archive.data,
      systemUserId,
      archive.createdAt,
      new Date().toISOString()
    ]
  }));

  try {
    // Batch par groupes de 5 pour éviter de saturer la connexion si le JSON est gros
    for (let i = 0; i < queries.length; i += 5) {
      const batch = queries.slice(i, i + 5);
      await client.batch(batch, "write");
      console.log(`✅ Batch ${Math.floor(i/5) + 1} envoyé...`);
    }
    console.log("🎉 Synchronisation Turso terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la synchro Turso :", error);
  } finally {
    client.close();
  }
}

syncArchives();
