const { prisma } = require("../lib/prisma");

async function main() {
  const userId = "user_test_breakyt";
  
  // S'assurer qu'un utilisateur existe
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        name: "Admin",
        role: "ADMIN"
      }
    });
    console.log("✅ Utilisateur de test créé.");
  }

  // Chercher un forum de tournoi
  let forum = await prisma.forum.findFirst({
    where: { isTournamentForum: true },
  });
  
  if (forum) {
    console.log(`✅ Forum trouvé : "${forum.name}" (ID: ${forum.id})`);
    return;
  }

  console.log("❌ Aucun forum de tournoi trouvé. Création...");

  // Créer une catégorie si besoin
  let category = await prisma.category.findFirst({ where: { name: "Le terrain" } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: "Le terrain", order: 2 }
    });
    console.log("✅ Catégorie créée.");
  }

  // Créer le forum
  forum = await prisma.forum.create({
    data: {
      name: "Les tournois",
      description: "Annonces et organisation de tournois",
      isTournamentForum: true,
      categoryId: category.id
    }
  });

  console.log(`✅ Forum de tournoi créé : "${forum.name}" (ID: ${forum.id})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
