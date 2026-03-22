const { PrismaClient } = require("../prisma/generated-client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

async function main() {
  const config = {
    url: "file:d:/devperso/antigravity/bbfrance/dev.db",
  };
  const adapter = new PrismaLibSql(config);
  const prisma = new PrismaClient({ adapter });

  try {
    const topic = await prisma.topic.findFirst({ select: { id: true, title: true } });
    const user = await prisma.user.findFirst({ select: { id: true, name: true } });

    if (!topic || !user) {
      console.error("Topic or user not found");
      return;
    }

    console.log(`Seeding 200 posts to topic: "${topic.title}" (${topic.id}) by user: ${user.name}`);

    const postsData = [];
    for (let i = 1; i <= 200; i++) {
        postsData.push({
            content: `Test post #${i} for pagination testing.`,
            topicId: topic.id,
            authorId: user.id,
            createdAt: new Date(Date.now() + i * 1000) // Slightly different timestamps
        });
    }

    // Prisma doesn't support createMany with this adapter easily in some versions, 
    // or maybe it does. Let's do a loop or check.
    // Actually, createMany is generally supported.
    const result = await prisma.post.createMany({
        data: postsData
    });

    console.log(`Successfully added ${result.count} posts.`);
    
    // Update topic updatedAt to bubble it up
    await prisma.topic.update({
        where: { id: topic.id },
        data: { updatedAt: new Date() }
    });

  } catch (error) {
    console.error("Error seeding posts:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
