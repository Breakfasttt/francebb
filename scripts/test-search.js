const { PrismaClient } = require("../prisma/generated-client");
const prisma = new PrismaClient();

async function test() {
  const query = "test";
  try {
    const results = await prisma.ligue.findMany({
      where: {
        OR: [
          { name: { contains: "test" } },
          { name: { contains: "Test" } },
          { acronym: { contains: "test" } }
        ]
      }
    });
    console.log(`Results for '${query}':`, results);
  } catch (e) {
    console.error(e);
  }
}

test();
