const { PrismaClient } = require("./prisma/generated-client");
const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.ligue.count();
    const all = await prisma.ligue.findMany({ take: 5 });
    console.log(`Ligue Count: ${count}`);
    console.log(`Ligue samples:`, JSON.stringify(all, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
