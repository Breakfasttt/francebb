import { PrismaClient } from "../prisma/generated-client/index.js";
// @ts-ignore
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:d:/devperso/antigravity/bbfrance/dev.db" });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seed: Start ReferenceData...');

  const coachRegions = [
    { key: "IDF", label: "R1 - Île-de-France", order: 1 },
    { key: "Nord-Ouest", label: "R2 - Nord-Ouest", order: 2 },
    { key: "Nord-Est", label: "R3 - Nord-Est", order: 3 },
    { key: "Sud-Est", label: "R4 - Sud-Est", order: 4 },
    { key: "Sud-Ouest", label: "R5 - Sud-Ouest", order: 5 },
  ];

  const franceRegions = [
    { key: "Auvergne-Rhône-Alpes", label: "Auvergne-Rhône-Alpes", order: 1 },
    { key: "Bourgogne-Franche-Comté", label: "Bourgogne-Franche-Comté", order: 2 },
    { key: "Bretagne", label: "Bretagne", order: 3 },
    { key: "Centre-Val de Loire", label: "Centre-Val de Loire", order: 4 },
    { key: "Corse", label: "Corse", order: 5 },
    { key: "Grand Est", label: "Grand Est", order: 6 },
    { key: "Hauts-de-France", label: "Hauts-de-France", order: 7 },
    { key: "Île-de-France", label: "Île-de-France", order: 8 },
    { key: "Normandie", label: "Normandie", order: 9 },
    { key: "Nouvelle-Aquitaine", label: "Nouvelle-Aquitaine", order: 10 },
    { key: "Occitanie", label: "Occitanie", order: 11 },
    { key: "Pays de la Loire", label: "Pays de la Loire", order: 12 },
    { key: "Provence-Alpes-Côte d'Azur", label: "Provence-Alpes-Côte d'Azur", order: 13 },
  ];

  const gameEditions = [
    { key: "BB20", label: "Blood Bowl 2020", order: 1 },
    { key: "BB3", label: "Blood Bowl 3", order: 2 },
    { key: "BB7", label: "Blood Bowl 7's", order: 3 },
    { key: "GutterBowl", label: "Gutter Bowl", order: 4 },
    { key: "Classic", label: "Classic / LRB6", order: 5 },
  ];

  // Upsert Coach Regions
  for (const r of coachRegions) {
    // @ts-ignore
    await prisma.referenceData.upsert({
      where: { group_key: { group: 'COACH_REGION', key: r.key } },
      update: { label: r.label, order: r.order },
      create: { group: 'COACH_REGION', key: r.key, label: r.label, order: r.order }
    });
  }

  // Upsert France Regions
  for (const r of franceRegions) {
    // @ts-ignore
    await prisma.referenceData.upsert({
      where: { group_key: { group: 'REGION_FRANCE', key: r.key } },
      update: { label: r.label, order: r.order },
      create: { group: 'REGION_FRANCE', key: r.key, label: r.label, order: r.order }
    });
  }

  // Upsert Game Editions
  for (const g of gameEditions) {
    // @ts-ignore
    await prisma.referenceData.upsert({
      where: { group_key: { group: 'GAME_EDITION', key: g.key } },
      update: { label: g.label, order: g.order },
      create: { group: 'GAME_EDITION', key: g.key, label: g.label, order: g.order }
    });
  }

  console.log('Seed: ReferenceData complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
