import { PrismaClient } from "../prisma/generated-client/index.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:d:/devperso/antigravity/bbfrance/dev.db" });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const topic = await prisma.topic.findFirst({ include: { author: true } });
  if (!topic) { console.error("No topic found."); return; }

  const user = await prisma.user.findFirst();
  if (!user) { console.error("No user found."); return; }

  console.log(`Adding 200 more posts to topic: "${topic.title}"`);

  const templates = [
    "Toujours aussi intéressant ce sujet. Message numéro",
    "Je reviens toujours sur ce thread. Réponse numéro",
    "On ne se lasse pas ! Post de test numéro",
    "Encore moi ! C'est le message numéro",
    "Pour tester la pagination au maximum — message",
    "Un de plus pour la route. Numéro",
    "Je continue à alimenter ce sujet. Réponse",
    "La pagination doit gérer ça tranquillement. Message",
  ];

  const posts = Array.from({ length: 200 }, (_, i) => ({
    content: `${templates[i % templates.length]} ${i + 1} sur 200.`,
    topicId: topic.id,
    authorId: user.id,
  }));

  await prisma.post.createMany({ data: posts });
  await prisma.topic.update({ where: { id: topic.id }, data: { updatedAt: new Date() } });

  console.log("Done! 200 posts seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
