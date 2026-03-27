import { PrismaClient } from '../prisma/generated-client';
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const config = {
  url: process.env.DATABASE_URL || "file:./dev.db",
};
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  const topicId = "cmn78g19t000buwpeb7i0l6iq";
  
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("ERREUR: Aucun utilisateur trouvé en DB.");
    return;
  }
  
  const authorId = user.id;

  console.log(`Début de l'ajout de 250 messages au topic ${topicId} (Auteur: ${user.name} / ID: ${authorId})`);

  // On crée par paquets pour aller plus vite (pagination possible)
  const posts = [];
  for (let i = 1; i <= 250; i++) {
    posts.push({
      content: `Message aléatoire n°${i} pour tester la pagination. [b]Test BBCode[/b]. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      topicId: topicId,
      authorId: authorId,
    });
  }

  // Utilisation de createMany si supporté par sqlite (nécessite prisma 2.22+)
  // Sinon boucle classique. Sqlite supporte createMany depuis peu.
  try {
    const result = await prisma.post.createMany({
      data: posts,
    });
    console.log(`${result.count} messages ajoutés avec succès.`);
  } catch (err) {
    console.log("Erreur lors du createMany, repli sur création individuelle...");
    for (let i = 0; i < posts.length; i++) {
      await prisma.post.create({ data: posts[i] });
      if (i % 50 === 0) console.log(`${i} messages créés...`);
    }
  }

  console.log("Terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
