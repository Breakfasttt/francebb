
const { createClient } = require("@libsql/client");

const config = { 
  url: "file:./dev.db" 
};
const client = createClient(config);

async function main() {
  console.log("Creating Tournament Forum...");
  
  // Find category "Le terrain"
  const cat = await client.execute("SELECT id FROM Category WHERE name = 'Le terrain' LIMIT 1;");
  let catId;
  if (cat.rows.length === 0) {
    const res = await client.execute("INSERT INTO Category (id, name, [order]) VALUES ('cat_terrain', 'Le terrain', 2) RETURNING id;");
    catId = res.rows[0].id;
  } else {
    catId = cat.rows[0].id;
  }

  // Create Forum
  await client.execute({
    sql: "INSERT INTO Forum (id, name, description, categoryId, isTournamentForum) VALUES (?, ?, ?, ?, ?) ON CONFLICT(name) DO UPDATE SET isTournamentForum = 1;",
    args: ["forum_tournois", "Les tournois", "Annonces, résultats et débriefings de tournois.", catId, 1]
  });

  console.log("✅ Tournament Forum created/updated!");
}

main().catch(console.error);
