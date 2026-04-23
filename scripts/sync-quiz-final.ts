import { createClient } from "@libsql/client";
import { loadEnvConfig } from "@next/env";
import { questions } from "../app/bbquizz/data/questions";
// On va utiliser des IDs simples pour les IDs manquants

loadEnvConfig(process.cwd());

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "";
const client = createClient({ url });

async function sync() {
    console.log("🔍 Analyse des questions du Quizz...");
    console.log(`📂 Fichier source : ${questions.length} questions.`);

    try {
        // 1. Récupérer les questions actuelles pour éviter les doublons
        const existingResult = await client.execute("SELECT id, question FROM QuizQuestion");
        const existingMap = new Map();
        existingResult.rows.forEach(row => {
            existingMap.set(row.question, row.id);
        });

        console.log(`db : ${existingMap.size} questions trouvées.`);

        const toInsert = [];
        const toUpdate = [];

        for (const q of questions) {
            const optionsStr = JSON.stringify(q.options);
            const now = new Date().toISOString();

            if (existingMap.has(q.question)) {
                // Update
                toUpdate.push({
                    sql: "UPDATE QuizQuestion SET category = ?, options = ?, correctIndex = ?, explanation = ?, updatedAt = ? WHERE question = ?",
                    args: [q.category, optionsStr, q.correctIndex, q.explanation || null, now, q.question]
                });
            } else {
                // Insert
                const newId = "quiz_" + Math.random().toString(36).substring(2, 15);
                toInsert.push({
                    sql: "INSERT INTO QuizQuestion (id, category, question, options, correctIndex, explanation, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    args: [newId, q.category, q.question, optionsStr, q.correctIndex, q.explanation || null, now, now]
                });
            }
        }

        console.log(`📊 Plan : ${toInsert.length} à insérer, ${toUpdate.length} à mettre à jour.`);

        // 2. Exécution par batches (pour ne pas saturer Turso)
        const allOps = [...toUpdate, ...toInsert];
        const batchSize = 50;
        
        for (let i = 0; i < allOps.length; i += batchSize) {
            const batch = allOps.slice(i, i + batchSize);
            await client.batch(batch, "write");
            console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} envoyé...`);
        }

        console.log("🎉 Synchronisation terminée avec succès !");

    } catch (error) {
        console.error("❌ Erreur lors de la synchronisation :", error);
    } finally {
        client.close();
    }
}

sync();
