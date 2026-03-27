/**
 * Script de debug pour voir le tournoi restant.
 */
import { PrismaClient } from '../prisma/generated-client';
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  url: process.env.DATABASE_URL || "file:./dev.db",
};

const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  const t = await prisma.tournament.findFirst({
    include: { topic: true }
  });
  console.log(JSON.stringify(t, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
