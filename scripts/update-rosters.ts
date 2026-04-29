import fs from 'fs';
import path from 'path';

const rosterDir = path.join(process.cwd(), 'public', 'data', 'roster');

// Certaines équipes n'ont pas le droit à l'apothicaire
const noApoTeams = ['shambling_undead', 'necromantic_horror', 'khemri', 'tomb_kings', 'nurgle', 'chaos_dwarfs'];

async function updateRosters() {
  const files = fs.readdirSync(rosterDir).filter(f => f.endsWith('.json') && f !== 'skills.json' && f !== 'special_rules.json' && f !== 'inducements.json');

  for (const file of files) {
    const filePath = path.join(rosterDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Ajout des champs manquants si inexistants
    if (data.rerollCost === undefined) {
      data.rerollCost = 50000; // Coût par défaut à corriger manuellement plus tard
    }
    
    if (data.apothecary === undefined) {
      const isNoApo = noApoTeams.some(t => file.includes(t));
      data.apothecary = !isNoApo;
    }

    if (data.tier === undefined) {
      data.tier = 1; // Tier par défaut
    }

    // Sauvegarde
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
}

updateRosters().then(() => console.log('Done!'));
