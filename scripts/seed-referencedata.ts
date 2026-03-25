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
    { key: "BB25", label: "Blood Bowl 2025", order: 1 },
    { key: "BB20", label: "Blood Bowl 2020", order: 2 },
    { key: "BB3", label: "Blood Bowl 3", order: 3 },
    { key: "BB7", label: "Blood Bowl 7's", order: 4 },
    { key: "GutterBowl", label: "Gutter Bowl", order: 5 },
    { key: "Classic", label: "Classic / LRB6", order: 6 },
  ];

  const tournamentTypes = [
    { key: "Resurrection", label: "Résurrection", order: 1 },
    { key: "Evolutif", label: "Évolutif", order: 2 },
  ];

  const platforms = [
    { key: "Tabletop", label: "Tabletop (Plateau)", order: 1 },
    { key: "Fumbbl", label: "Fumbbl", order: 2 },
    { key: "VideoGame", label: "Jeu Vidéo (BB3/BB2)", order: 3 },
  ];

  const departments = [
    { key: "01", label: "01 - Ain", order: 1 }, { key: "02", label: "02 - Aisne", order: 2 },
    { key: "03", label: "03 - Allier", order: 3 }, { key: "04", label: "04 - Alpes-de-Haute-Provence", order: 4 },
    { key: "05", label: "05 - Hautes-Alpes", order: 5 }, { key: "06", label: "06 - Alpes-Maritimes", order: 6 },
    { key: "07", label: "07 - Ardèche", order: 7 }, { key: "08", label: "08 - Ardennes", order: 8 },
    { key: "09", label: "09 - Ariège", order: 9 }, { key: "10", label: "10 - Aube", order: 10 },
    { key: "11", label: "11 - Aude", order: 11 }, { key: "12", label: "12 - Aveyron", order: 12 },
    { key: "13", label: "13 - Bouches-du-Rhône", order: 13 }, { key: "14", label: "14 - Calvados", order: 14 },
    { key: "15", label: "15 - Cantal", order: 15 }, { key: "16", label: "16 - Charente", order: 16 },
    { key: "17", label: "17 - Charente-Maritime", order: 17 }, { key: "18", label: "18 - Cher", order: 18 },
    { key: "19", label: "19 - Corrèze", order: 19 }, { key: "2A", label: "2A - Corse-du-Sud", order: 20 },
    { key: "2B", label: "2B - Haute-Corse", order: 21 }, { key: "21", label: "21 - Côte-d'Or", order: 22 },
    { key: "22", label: "22 - Côtes-d'Armor", order: 23 }, { key: "23", label: "23 - Creuse", order: 24 },
    { key: "24", label: "24 - Dordogne", order: 25 }, { key: "25", label: "25 - Doubs", order: 26 },
    { key: "26", label: "26 - Drôme", order: 27 }, { key: "27", label: "27 - Eure", order: 28 },
    { key: "28", label: "28 - Eure-et-Loir", order: 29 }, { key: "29", label: "29 - Finistère", order: 30 },
    { key: "30", label: "30 - Gard", order: 31 }, { key: "31", label: "31 - Haute-Garonne", order: 32 },
    { key: "32", label: "32 - Gers", order: 33 }, { key: "33", label: "33 - Gironde", order: 34 },
    { key: "34", label: "34 - Hérault", order: 35 }, { key: "35", label: "35 - Ille-et-Vilaine", order: 36 },
    { key: "36", label: "36 - Indre", order: 37 }, { key: "37", label: "37 - Indre-et-Loire", order: 38 },
    { key: "38", label: "38 - Isère", order: 39 }, { key: "39", label: "39 - Jura", order: 40 },
    { key: "40", label: "40 - Landes", order: 41 }, { key: "41", label: "41 - Loir-et-Cher", order: 42 },
    { key: "42", label: "42 - Loire", order: 43 }, { key: "43", label: "43 - Haute-Loire", order: 44 },
    { key: "44", label: "44 - Loire-Atlantique", order: 45 }, { key: "45", label: "45 - Loiret", order: 46 },
    { key: "46", label: "46 - Lot", order: 47 }, { key: "47", label: "47 - Lot-et-Garonne", order: 48 },
    { key: "48", label: "48 - Lozère", order: 49 }, { key: "49", label: "49 - Maine-et-Loire", order: 50 },
    { key: "50", label: "50 - Manche", order: 51 }, { key: "51", label: "51 - Marne", order: 52 },
    { key: "52", label: "52 - Haute-Marne", order: 53 }, { key: "53", label: "53 - Mayenne", order: 54 },
    { key: "54", label: "54 - Meurthe-et-Moselle", order: 55 }, { key: "55", label: "55 - Meuse", order: 56 },
    { key: "56", label: "56 - Morbihan", order: 57 }, { key: "57", label: "57 - Moselle", order: 58 },
    { key: "58", label: "58 - Nièvre", order: 59 }, { key: "59", label: "59 - Nord", order: 60 },
    { key: "60", label: "60 - Oise", order: 61 }, { key: "61", label: "61 - Orne", order: 62 },
    { key: "62", label: "62 - Pas-de-Calais", order: 63 }, { key: "63", label: "63 - Puy-de-Dôme", order: 64 },
    { key: "64", label: "64 - Pyrénées-Atlantiques", order: 65 }, { key: "65", label: "65 - Hautes-Pyrénées", order: 66 },
    { key: "66", label: "66 - Pyrénées-Orientales", order: 67 }, { key: "67", label: "67 - Bas-Rhin", order: 68 },
    { key: "68", label: "68 - Haut-Rhin", order: 69 }, { key: "69", label: "69 - Rhône", order: 70 },
    { key: "70", label: "70 - Haute-Saône", order: 71 }, { key: "71", label: "71 - Saône-et-Loire", order: 72 },
    { key: "72", label: "72 - Sarthe", order: 73 }, { key: "73", label: "73 - Savoie", order: 74 },
    { key: "74", label: "74 - Haute-Savoie", order: 75 }, { key: "75", label: "75 - Paris", order: 76 },
    { key: "76", label: "76 - Seine-Maritime", order: 77 }, { key: "77", label: "77 - Seine-et-Marne", order: 78 },
    { key: "78", label: "78 - Yvelines", order: 79 }, { key: "79", label: "79 - Deux-Sèvres", order: 80 },
    { key: "80", label: "80 - Somme", order: 81 }, { key: "81", label: "81 - Tarn", order: 82 },
    { key: "82", label: "82 - Tarn-et-Garonne", order: 83 }, { key: "83", label: "83 - Var", order: 84 },
    { key: "84", label: "84 - Vaucluse", order: 85 }, { key: "85", label: "85 - Vendée", order: 86 },
    { key: "86", label: "86 - Vienne", order: 87 }, { key: "87", label: "87 - Haute-Vienne", order: 88 },
    { key: "88", label: "88 - Vosges", order: 89 }, { key: "89", label: "89 - Yonne", order: 90 },
    { key: "90", label: "90 - Territoire de Belfort", order: 91 }, { key: "91", label: "91 - Essonne", order: 92 },
    { key: "92", label: "92 - Hauts-de-Seine", order: 93 }, { key: "93", label: "93 - Seine-Saint-Denis", order: 94 },
    { key: "94", label: "94 - Val-de-Marne", order: 95 }, { key: "95", label: "95 - Val-d'Oise", order: 96 },
    { key: "971", label: "971 - Guadeloupe", order: 97 }, { key: "972", label: "972 - Martinique", order: 98 },
    { key: "973", label: "973 - Guyane", order: 99 }, { key: "974", label: "974 - La Réunion", order: 100 },
    { key: "976", label: "976 - Mayotte", order: 101 },
  ];

  const allToSeed = [
    { group: 'COACH_REGION', data: coachRegions },
    { group: 'REGION_FRANCE', data: franceRegions },
    { group: 'GAME_EDITION', data: gameEditions },
    { group: 'TOURNAMENT_TYPE', data: tournamentTypes },
    { group: 'PLATFORM', data: platforms },
    { group: 'DEPARTEMENT_FRANCE', data: departments },
  ];

  for (const group of allToSeed) {
    for (const item of group.data) {
        // @ts-ignore
        await prisma.referenceData.upsert({
            where: { group_key: { group: group.group, key: item.key } },
            update: { label: item.label, order: item.order },
            create: { group: group.group, key: item.key, label: item.label, order: item.order }
        });
    }
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
