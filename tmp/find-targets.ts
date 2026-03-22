import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const topic = await prisma.topic.findFirst({ select: { id: true, title: true } });
  const user = await prisma.user.findFirst({ select: { id: true, name: true } });
  console.log(JSON.stringify({ topic, user }));
  await prisma.$disconnect();
}

main();
