import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBBPusher() {
  const pusherId = "bbpusher";
  const systemUserId = "system";

  try {
    // 1. Ensure system user exists
    let systemUser = await prisma.user.findUnique({ where: { id: systemUserId } });
    if (!systemUser) {
      console.log("Creating system user...");
      systemUser = await prisma.user.create({
        data: {
          id: systemUserId,
          name: "Système",
          email: "system@bbfrance.fr",
          role: "SUPERADMIN"
        }
      });
    }

    // 2. Ensure BBPusher resource exists
    const existing = await prisma.resource.findUnique({ where: { id: pusherId } });

    if (!existing) {
      console.log("Seeding BB Pusher resource...");
      await prisma.resource.create({
        data: {
          id: pusherId,
          title: "BB Pusher",
          description: "Plateau tactique interactif pour Blood Bowl. Placez vos joueurs, simulez des poussées et partagez vos schémas tactiques.",
          imageUrl: "/images/bbpusher-preview.jpg",
          link: "/bbpusher",
          status: "APPROVED",
          isSystem: true,
          authorId: systemUserId,
          tags: {
            connectOrCreate: {
              where: { name: "Outil Officiel" },
              create: { name: "Outil Officiel" }
            }
          }
        }
      });
      console.log("BB Pusher seeded.");
    } else {
      await prisma.resource.update({
        where: { id: pusherId },
        data: { isSystem: true }
      });
      console.log("BB Pusher updated and marked as System.");
    }
  } catch (err) {
    console.error("Error during seed:", err);
  }
}

seedBBPusher()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
