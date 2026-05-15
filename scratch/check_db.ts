import { PrismaClient } from '../prisma/generated-client';
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await (prisma as any).$queryRawUnsafe(`PRAGMA table_info(Ligue)`);
    console.log('Columns in Ligue table:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
