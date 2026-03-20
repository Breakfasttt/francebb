import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const config = { url: "file:./dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = "user_test_breakyt";

  console.log("Seeding tournaments...");

  const tournaments = [
    {
      name: "Bordeaux Bowl 2027",
      date: new Date("2027-02-15"),
      location: "Bordeaux, France",
      description: "Le tournoi annuel dans le sud-ouest.",
    },
    {
      name: "Lutèce Bowl 2027",
      date: new Date("2027-06-20"),
      location: "Paris, France",
      description: "Le plus grand rassemblement français.",
    },
    {
      name: "Lyon Cup",
      date: new Date("2026-12-05"),
      location: "Lyon, France",
      description: "Compétition féroce entre les Gones.",
    },
    {
      name: "Breizh Open",
      date: new Date("2027-04-10"),
      location: "Rennes, France",
      description: "Du cidre et des pains, mais surtout du Blood Bowl.",
    },
    {
      name: "Toulouse Blitz",
      date: new Date("2027-08-22"),
      location: "Toulouse, France",
      description: "Le tournoi de la ville rose.",
    }
  ];

  for (const t of tournaments) {
    await prisma.tournament.create({
      data: {
        ...t,
        organizerId: userId,
      }
    });
  }

  console.log("Seed finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
