import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";

// On force le chargement du .env
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL || "";
if (!url) {
    console.error("❌ DATABASE_URL manquante dans le .env");
    process.exit(1);
}

const client = createClient({
    url: url,
});

async function seed() {
    console.log("🚀 Connexion directe à Turso (Mode SQL)...");

    const referenceData = [
        // COACH_REGION
        { g: "COACH_REGION", k: "R1-IDF", l: "R1 - Île-de-France", o: 1 },
        { g: "COACH_REGION", k: "R2-NO", l: "R2 - Nord-Ouest", o: 2 },
        { g: "COACH_REGION", k: "R3-NE", l: "R3 - Nord-Est", o: 3 },
        { g: "COACH_REGION", k: "R4-SE", l: "R4 - Sud-Est", o: 4 },
        { g: "COACH_REGION", k: "R5-SO", l: "R5 - Sud-Ouest", o: 5 },
        
        // REGION_FRANCE
        { g: "REGION_FRANCE", k: "Auvergne-Rhône-Alpes", l: "Auvergne-Rhône-Alpes", o: 1 },
        { g: "REGION_FRANCE", k: "Bourgogne-Franche-Comté", l: "Bourgogne-Franche-Comté", o: 2 },
        { g: "REGION_FRANCE", k: "Bretagne", l: "Bretagne", o: 3 },
        { g: "REGION_FRANCE", k: "Centre-Val de Loire", l: "Centre-Val de Loire", o: 4 },
        { g: "REGION_FRANCE", k: "Corse", l: "Corse", o: 5 },
        { g: "REGION_FRANCE", k: "Grand Est", l: "Grand Est", o: 6 },
        { g: "REGION_FRANCE", k: "Hauts-de-France", l: "Hauts-de-France", o: 7 },
        { g: "REGION_FRANCE", k: "Île-de-France", l: "Île-de-France", o: 8 },
        { g: "REGION_FRANCE", k: "Normandie", l: "Normandie", o: 9 },
        { g: "REGION_FRANCE", k: "Nouvelle-Aquitaine", l: "Nouvelle-Aquitaine", o: 10 },
        { g: "REGION_FRANCE", k: "Occitanie", l: "Occitanie", o: 11 },
        { g: "REGION_FRANCE", k: "Pays de la Loire", l: "Pays de la Loire", o: 12 },
        { g: "REGION_FRANCE", k: "Provence-Alpes-Côte d'Azur", l: "Provence-Alpes-Côte d'Azur", o: 13 },

        // PLATFORM
        { g: "PLATFORM", k: "Tabletop", l: "Tabletop (Plateau)", o: 1 },
        { g: "PLATFORM", k: "Fumbbl", l: "Fumbbl", o: 2 },
        { g: "PLATFORM", k: "VideoGame", l: "Jeu Vidéo (BB3/BB2)", o: 3 },
        { g: "PLATFORM", k: "Other", l: "Autre", o: 4 },

        // GAME_EDITION
        { g: "GAME_EDITION", k: "BB25", l: "Blood Bowl 2025", o: 1 },
        { g: "GAME_EDITION", k: "BB20", l: "Blood Bowl 2020", o: 2 },
        { g: "GAME_EDITION", k: "BB3", l: "Blood Bowl 3", o: 3 },
        { g: "GAME_EDITION", k: "BB7", l: "Blood Bowl 7's", o: 4 },
        { g: "GAME_EDITION", k: "GutterBowl", l: "Gutter Bowl", o: 5 },
        { g: "GAME_EDITION", k: "Classic", l: "Classic / LRB6", o: 6 },
        { g: "GAME_EDITION", k: "DungeonBowl", l: "Dungeon Bowl", o: 7 },

        // TOURNAMENT_TYPE
        { g: "TOURNAMENT_TYPE", k: "LIGUE", l: "Ligue", o: 1 },
        { g: "TOURNAMENT_TYPE", k: "SWISS", l: "Tournoi - ronde suisse", o: 2 },
        { g: "TOURNAMENT_TYPE", k: "ROBIN", l: "Tournoi - toute ronde", o: 3 },
        { g: "TOURNAMENT_TYPE", k: "BRACKET", l: "Tournoi - Bracket", o: 4 },
        { g: "TOURNAMENT_TYPE", k: "DBRACKET", l: "Tournoi - Double Bracket", o: 5 },
        { g: "TOURNAMENT_TYPE", k: "OTHER", l: "Autre", o: 6 },

        // TOURNAMENT_FORMAT
        { g: "TOURNAMENT_FORMAT", k: "Evolutif", l: "Évolutif", o: 1 },
        { g: "TOURNAMENT_FORMAT", k: "Resurrection", l: "Résurrection", o: 2 },
        { g: "TOURNAMENT_FORMAT", k: "Other", l: "Autre", o: 3 },

        // DEPARTEMENTS
        { g: "DEPARTEMENT_FRANCE", k: "01", l: "01 - Ain", o: 1 },
        { g: "DEPARTEMENT_FRANCE", k: "75", l: "75 - Paris", o: 75 },
        // ... (J'ajoute les plus importants, le script les injectera tous)
    ];

    // Note: Pour les départements, on va reconstruire les 95+ pour l'injection
    for(let i=1; i<=95; i++) {
        const key = i.toString().padStart(2, '0');
        if (key === "01" || key === "75") continue; // déjà mis
        referenceData.push({ g: "DEPARTEMENT_FRANCE", k: key, l: `${key} - Département ${key}`, o: i });
    }
    // Dom Tom
    ["2A", "2B", "971", "972", "973", "974", "976"].forEach(k => {
        referenceData.push({ g: "DEPARTEMENT_FRANCE", k: k, l: `${k} - Outre-mer`, o: 200 });
    });

    console.log(`📊 Préparation de ${referenceData.length} insertions...`);

    const queries = referenceData.map(item => ({
        sql: `INSERT INTO ReferenceData (id, "group", "key", label, "order", isActive) 
              VALUES (?, ?, ?, ?, ?, 1) 
              ON CONFLICT("group", "key") DO UPDATE SET label = excluded.label, "order" = excluded."order"`,
        args: [
            `seed-${item.g}-${item.k}`, // id
            item.g,
            item.k,
            item.l,
            item.o
        ]
    }));

    try {
        await client.batch(queries, "write");
        console.log("✅ Données de référence injectées avec succès via SQL !");
    } catch (error) {
        console.error("❌ Erreur lors de l'injection SQL :", error);
    } finally {
        client.close();
    }
}

seed();
