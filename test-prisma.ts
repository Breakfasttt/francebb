import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function test() {
  const config = { url: "file:./dev.db" };
  const adapter = new PrismaLibSql(config);
  const prisma = new PrismaClient({ adapter });

  console.log("--- Test Prisma Direct ---");
  const userId = "user_test_breakyt";
  
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { name: "TestPersistanceDirect" },
    create: { 
      id: userId, 
      name: "TestPersistanceDirect", 
      email: "test@test.com" 
    }
  });

  console.log("Utilisateur après upsert:", user.name);
  
  const fetched = await prisma.user.findUnique({ where: { id: userId } });
  console.log("Vérification findUnique:", fetched?.name);

  await prisma.$disconnect();
}

test();
