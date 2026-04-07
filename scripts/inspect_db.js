const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        name: true,
        typeCDF: true,
        isCDF: true,
        isFinished: true
      }
    });

    let output = 'Tournament List:\n';
    tournaments.forEach(t => {
      output += `ID: ${t.id} | Name: ${t.name} | isCDF: ${t.isCDF} | isFinished: ${t.isFinished} | typeCDF: ${t.typeCDF}\n`;
    });

    fs.writeFileSync('scripts/db_inspect.txt', output);
    console.log('Inspection complete. Check scripts/db_inspect.txt');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
