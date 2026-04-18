import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating all users with default theme 'dark' to 'saison3'...");
  const result = await prisma.user.updateMany({
    where: { theme: "dark" },
    data: { theme: "saison3" }
  });
  console.log(`Updated ${result.count} users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
