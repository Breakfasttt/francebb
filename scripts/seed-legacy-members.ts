import { prisma } from "../lib/prisma";

/**
 * Script de pré-remplissage des membres Forumactif.
 * Remplissez le tableau legacyMembers avec les données exportées de Forumactif.
 */
const legacyMembers = [
  // Exemple : { email: "coach@example.com", forumactifName: "CoachDu92", nafNumber: "12345" },
];

async function main() {
  console.log("Démarrage du seeding des membres legacy...");
  
  if (legacyMembers.length === 0) {
    console.warn("Tableau legacyMembers vide. Ajoutez des données pour les importer.");
    return;
  }

  for (const member of legacyMembers) {
    await prisma.legacyMember.upsert({
      where: { email: member.email.toLowerCase() },
      update: {
        forumactifName: member.forumactifName,
        nafNumber: member.nafNumber
      },
      create: {
        email: member.email.toLowerCase(),
        forumactifName: member.forumactifName,
        nafNumber: member.nafNumber
      }
    });
    console.log(`Importé/Mis à jour : ${member.forumactifName} (${member.email})`);
  }

  console.log("Seeding terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
