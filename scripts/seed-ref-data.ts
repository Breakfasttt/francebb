const { prisma } = require("../lib/prisma");

async function main() {
  console.log("Seeding COMPLETE ReferenceData...");

  const zones = [
    { group: "COACH_REGION", key: "01", label: "Zone 1 : Paris - Nord - Nord Ouest", order: 1 },
    { group: "COACH_REGION", key: "02", label: "Zone 2 : Grand Ouest", order: 2 },
    { group: "COACH_REGION", key: "03", label: "Zone 3 : Grand Sud", order: 3 },
    { group: "COACH_REGION", key: "04", label: "Zone 4 : Grand Est", order: 4 },
    { group: "COACH_REGION", key: "05", label: "Zone 5 : Centre - Rhône Alpes", order: 5 },
  ];

  const regions = [
    { group: "REGION_FRANCE", key: "ARA", label: "Auvergne-Rhone-Alpes" },
    { group: "REGION_FRANCE", key: "BFC", label: "Bourgogne-Franche-Comte" },
    { group: "REGION_FRANCE", key: "BRE", label: "Bretagne" },
    { group: "REGION_FRANCE", key: "CVL", label: "Centre-Val de Loire" },
    { group: "REGION_FRANCE", key: "COR", label: "Corse" },
    { group: "REGION_FRANCE", key: "GES", label: "Grand Est" },
    { group: "REGION_FRANCE", key: "HDF", label: "Hauts-de-France" },
    { group: "REGION_FRANCE", key: "IDF", label: "Ile-de-France" },
    { group: "REGION_FRANCE", key: "NOR", label: "Normandie" },
    { group: "REGION_FRANCE", key: "NAQ", label: "Nouvelle-Aquitaine" },
    { group: "REGION_FRANCE", key: "OCC", label: "Occitanie" },
    { group: "REGION_FRANCE", key: "PDL", label: "Pays de la Loire" },
    { group: "REGION_FRANCE", key: "PAC", label: "Provence-Alpes-Côte d'Azur" },
  ];

  const depts = [
    { key: "01", label: "Ain" }, { key: "02", label: "Aisne" }, { key: "03", label: "Allier" },
    { key: "04", label: "Alpes-de-Haute-Provence" }, { key: "05", label: "Hautes-Alpes" },
    { key: "06", label: "Alpes-Maritimes" }, { key: "07", label: "Ardeche" },
    { key: "08", label: "Ardennes" }, { key: "09", label: "Ariege" }, { key: "10", label: "Aube" },
    { key: "11", label: "Aude" }, { key: "12", label: "Aveyron" }, { key: "13", label: "Bouches-du-Rhône" },
    { key: "14", label: "Calvados" }, { key: "15", label: "Cantal" }, { key: "16", label: "Charente" },
    { key: "17", label: "Charente-Maritime" }, { key: "18", label: "Cher" }, { key: "19", label: "Correze" },
    { key: "21", label: "Côte-d'Or" }, { key: "22", label: "Côtes-d'Armor" }, { key: "23", label: "Creuse" },
    { key: "24", label: "Dordogne" }, { key: "25", label: "Doubs" }, { key: "26", label: "Drôme" },
    { key: "27", label: "Eure" }, { key: "28", label: "Eure-et-Loir" }, { key: "29", label: "Finistere" },
    { key: "2A", label: "Corse-du-Sud" }, { key: "2B", label: "Haute-Corse" }, { key: "30", label: "Gard" },
    { key: "31", label: "Haute-Garonne" }, { key: "32", label: "Gers" }, { key: "33", label: "Gironde" },
    { key: "34", label: "Herault" }, { key: "35", label: "Ille-et-Vilaine" }, { key: "36", label: "Indre" },
    { key: "37", label: "Indre-et-Loire" }, { key: "38", label: "Isere" }, { key: "39", label: "Jura" },
    { key: "40", label: "Landes" }, { key: "41", label: "Loir-et-Cher" }, { key: "42", label: "Loire" },
    { key: "43", label: "Haute-Loire" }, { key: "44", label: "Loire-Atlantique" }, { key: "45", label: "Loiret" },
    { key: "46", label: "Lot" }, { key: "47", label: "Lot-et-Garonne" }, { key: "48", label: "Lozere" },
    { key: "49", label: "Maine-et-Loire" }, { key: "50", label: "Manche" }, { key: "51", label: "Marne" },
    { key: "52", label: "Haute-Marne" }, { key: "53", label: "Mayenne" }, { key: "54", label: "Meurthe-et-Moselle" },
    { key: "55", label: "Meuse" }, { key: "56", label: "Morbihan" }, { key: "57", label: "Moselle" },
    { key: "58", label: "Nievre" }, { key: "59", label: "Nord" }, { key: "60", label: "Oise" },
    { key: "61", label: "Orne" }, { key: "62", label: "Pas-de-Calais" }, { key: "63", label: "Puy-de-Dôme" },
    { key: "64", label: "Pyrenees-Atlantiques" }, { key: "65", label: "Hautes-Pyrenees" },
    { key: "66", label: "Pyrenees-Orientales" }, { key: "67", label: "Bas-Rhin" }, { key: "68", label: "Haut-Rhin" },
    { key: "69", label: "Rhône" }, { key: "70", label: "Haute-Saône" }, { key: "71", label: "Saône-et-Loire" },
    { key: "72", label: "Sarthe" }, { key: "73", label: "Savoie" }, { key: "74", label: "Haute-Savoie" },
    { key: "75", label: "Paris" }, { key: "76", label: "Seine-Maritime" }, { key: "77", label: "Seine-et-Marne" },
    { key: "78", label: "Yvelines" }, { key: "79", label: "Deux-Sevres" }, { key: "80", label: "Somme" },
    { key: "81", label: "Tarn" }, { key: "82", label: "Tarn-et-Garonne" }, { key: "83", label: "Var" },
    { key: "84", label: "Vaucluse" }, { key: "85", label: "Vendee" }, { key: "86", label: "Vienne" },
    { key: "87", label: "Haute-Vienne" }, { key: "88", label: "Vosges" }, { key: "89", label: "Yonne" },
    { key: "90", label: "Territoire de Belfort" }, { key: "91", label: "Essonne" },
    { key: "92", label: "Hauts-de-Seine" }, { key: "93", label: "Seine-Saint-Denis" },
    { key: "94", label: "Val-de-Marne" }, { key: "95", label: "Val-d'Oise" },
    { key: "971", label: "Guadeloupe" }, { key: "972", label: "Martinique" },
    { key: "973", label: "Guyane" }, { key: "974", label: "La Reunion" }, { key: "976", label: "Mayotte" }
  ];

  const gameEditions = [
    { group: "GAME_EDITION", key: "BB2020", label: "Blood Bowl (Saison 2 / 2020)" },
    { group: "GAME_EDITION", key: "BB3", label: "Blood Bowl 3 (Jeu Vidéo)" },
    { group: "GAME_EDITION", key: "BB2", label: "Blood Bowl 2 (Jeu Vidéo)" },
  ];

  const tournamentTypes = [
    { group: "TOURNAMENT_TYPE", key: "NAF", label: "Tournoi Approuvé NAF" },
    { group: "TOURNAMENT_TYPE", key: "AMICAL", label: "Tournoi Amical" },
    { group: "TOURNAMENT_TYPE", key: "LIGUE", label: "Tournoi de Ligue" },
  ];

  const platforms = [
    { group: "PLATFORM", key: "TABLETOP", label: "Plateau (Figurines)" },
    { group: "PLATFORM", key: "FUMBBL", label: "FUMBBL" },
    { group: "PLATFORM", key: "BB3", label: "BB3 (PC/Console)" },
  ];

  for (const item of [...zones, ...regions, ...gameEditions, ...tournamentTypes, ...platforms]) {
    await prisma.referenceData.upsert({
      where: { group_key: { group: item.group, key: item.key } },
      update: { label: item.label, order: (item as any).order || 0 },
      create: { 
        group: item.group, 
        key: item.key, 
        label: item.label, 
        order: (item as any).order || 0 
      }
    });
  }

  for (const d of depts) {
    await prisma.referenceData.upsert({
      where: { group_key: { group: "DEPARTEMENT_FRANCE", key: d.key } },
      update: { label: d.label },
      create: { group: "DEPARTEMENT_FRANCE", key: d.key, label: d.label }
    });
  }

  console.log("✅ COMPLETE ReferenceData seeded successfully (101 departments).");
}

main().catch(console.error).finally(() => prisma.$disconnect());
