/**
 * Script de nettoyage des tournois orphelins (sans topic forum).
 * Version compatible avec l'adaptateur LibSQL du projet.
 */
import { PrismaClient } from '../prisma/generated-client';
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  url: process.env.DATABASE_URL || "file:./dev.db",
};

const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Nettoyage de la base de données Tournois ---');
  console.log(`Base de données : ${config.url}`);
  
  const initialCount = await prisma.tournament.count();
  console.log(`Nombre total de tournois : ${initialCount}`);

  // Trouver les tournois qui n'ont pas de topic associé
  const tournamentsToDelete = await prisma.tournament.findMany({
    where: {
      topic: null
    },
    select: { id: true }
  });

  const ids = tournamentsToDelete.map(t => t.id);

  if (ids.length > 0) {
    const deleted = await prisma.tournament.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    console.log(`Tournois supprimés : ${deleted.count}`);
  } else {
    console.log("Aucun tournoi orphelin trouvé.");
  }

  const finalCount = await prisma.tournament.count();
  console.log(`Nombre de tournois restants : ${finalCount}`);
  
  console.log('--- Fin du nettoyage ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
