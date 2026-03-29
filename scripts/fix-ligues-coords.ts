const { prisma } = require("../lib/prisma");

async function geocode(ville, address) {
  try {
    const query = `${address || ""} ${ville || ""}`.trim();
    if (!query) return null;

    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
      headers: { "User-Agent": "BBFrance-App-Fix" }
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
  const ligues = await prisma.ligue.findMany({
    where: { OR: [{ lat: null }, { lng: null }] }
  });

  console.log(`Found ${ligues.length} ligues to geocode.`);

  for (const l of ligues) {
    const coords = await geocode(l.ville, l.address);
    if (coords) {
      await prisma.ligue.update({
        where: { id: l.id },
        data: { lat: coords.lat, lng: coords.lng }
      });
      console.log(`✅ Geocoded ${l.name}: ${coords.lat}, ${coords.lng}`);
      // On attend un peu pour respecter les limites de Nominatim
      await new Promise(r => setTimeout(r, 1000));
    } else {
      console.log(`❌ Could not geocode ${l.name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
