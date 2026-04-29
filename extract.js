const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'data', 'docs', 'lrb_s3.md');
const text = fs.readFileSync(filePath, 'utf-8');

const lines = text.split('\n').map(l => l.trim());

// Cherchons les indices de base (en tolérant les espaces ou ponctuations)
const startIdx = lines.findIndex(l => l.includes('Liste des Compétences et Traits !'));
const endIdx = lines.findIndex(l => l.includes('Coups de Pouce !'));

if (startIdx !== -1 && endIdx !== -1) {
    // on saute l'index (la table des matières)
    // on va chercher l'occurrence de "COMPÉTENCES ET TRAITS !" en titre.
    const realStart = lines.findIndex((l, i) => i > 100 && l.includes('COMPÉTENCES ET TRAITS !'));
    const realEnd = lines.findIndex((l, i) => i > realStart && l.includes('COUPS DE POUCE !'));
    
    if (realStart !== -1 && realEnd !== -1) {
        fs.writeFileSync('parsed_skills.txt', lines.slice(realStart, realEnd).join('\n'), 'utf-8');
        console.log('Skills extraites dans parsed_skills.txt');
    }
}

// Règles Spéciales
const realSpeStart = lines.findIndex((l, i) => i > 100 && l.includes('RÈGLES SPÉCIALES !'));
const realSpeEnd = lines.findIndex((l, i) => i > realSpeStart && l.includes('CATÉGORIES D’ÉQUIPE !'));

if (realSpeStart !== -1 && realSpeEnd !== -1) {
    fs.writeFileSync('parsed_special_rules.txt', lines.slice(realSpeStart, realSpeEnd).join('\n'), 'utf-8');
    console.log('Special Rules extraites dans parsed_special_rules.txt');
}

const realIndStart = lines.findIndex((l, i) => i > 100 && l.includes('COUPS DE POUCE !'));
const realIndEnd = lines.findIndex((l, i) => i > realIndStart && l.includes('LES ÉQUIPES'));

if (realIndStart !== -1 && realIndEnd !== -1) {
    fs.writeFileSync('parsed_inducements.txt', lines.slice(realIndStart, realIndEnd).join('\n'), 'utf-8');
    console.log('Inducements extraits dans parsed_inducements.txt');
}

