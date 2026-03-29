const { prisma } = require("../lib/prisma");

async function geocode(ville, address) {
  try {
    const query = `${address || ""} ${ville || ""}`.trim();
    if (!query) return null;

    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
      headers: { "User-Agent": "BBFrance-App-Fix-Tournaments" }
    });
    const data = await res.json();
    
    if (data && data.length > 0) {
      return { 
        lat: parseFloat(data[0].lat), 
        lng: parseFloat(data[0].lon) 
      };
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return null;
}

async function main() {
  const tournaments = await prisma.tournament.findMany({
    where: { OR: [{ lat: null }, { lng: null }] }
  });

  console.log(`Found ${tournaments.length} tournaments to geocode.`);

  for (const t of tournaments) {
    const coords = await geocode(t.ville, t.address);
    if (coords) {
      await prisma.tournament.update({
        where: { id: t.id },
        data: { lat: coords.lat, lng: coords.lng }
      });
      console.log(`✅ Geocoded Tournament ${t.name}: ${coords.lat}, ${coords.lng}`);
      await new Promise(r => setTimeout(r, 1000));
    } else {
      console.log(`❌ Could not geocode Tournament ${t.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
