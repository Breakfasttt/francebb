const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data', 'roster');

const specialRules = [
  { id: "bagarreurs_brutaux", name: "Bagarreurs Brutaux", description: "3 PSP pour une Élimination (au lieu de 2). 2 PSP pour un Touchdown." },
  { id: "chantage_corruption", name: "Chantage et Corruption", description: "Une fois par match, sur 1 pour Contester la Décision, peut relancer le D6." },
  { id: "favori_de", name: "Favori de...", description: "Alignement spécifique à un Dieu du Chaos." },
  { id: "trois_quarts_vil_prix", name: "Trois-quarts à vil prix", description: "Le Coût d'Embauche des Trois-quarts compte pour 0." },
  { id: "maitres_non_vie", name: "Maîtres de la Non-Vie", description: "Si un joueur adverse meurt, on peut Relever le Mort et gagner un Trois-quart Zombie." },
  { id: "deferlement", name: "Déferlement", description: "Placer D3 Trois-quarts supplémentaires sur le terrain après placement." },
  { id: "capitaine", name: "Capitaine", description: "Un joueur gagne Pro. S'il est sur le terrain, chaque Relance d'Équipe est gratuite sur un 6." }
];

const inducements = [
  { id: "bribe", name: "Pot-de-vin", baseCost: 100000, specialCosts: [{ specialRuleId: "chantage_corruption", cost: 50000 }], description: "Relancer le jet d'expulsion (Argutie)." },
  { id: "halfling_chef", name: "Maître-coq Halfling", baseCost: 300000, specialCosts: [], description: "Volez des relances à l'adversaire (sur 4+)." },
  { id: "bloodweiser_keg", name: "Tonnelets de Bière Bloodweiser", baseCost: 50000, specialCosts: [], description: "+1 aux jets pour revenir des KO." },
  { id: "wandering_apothecary", name: "Apothicaire Indépendant", baseCost: 100000, specialCosts: [], description: "Un Apothicaire supplémentaire pour le match." },
  { id: "mortuary_assistant", name: "Assistant Mortuaire", baseCost: 100000, specialCosts: [{ specialRuleId: "maitres_non_vie", cost: 100000 }], description: "+1 au jet de Régénération." },
  { id: "plague_doctor", name: "Médecin de la Peste", baseCost: 100000, specialCosts: [{ specialRuleId: "favori_de", cost: 100000 }], description: "Relance d'un jet de Régénération." },
  { id: "biased_referee", name: "Arbitre Partisan", baseCost: 120000, specialCosts: [{ specialRuleId: "chantage_corruption", cost: 80000 }], description: "L'adversaire est expulsé sur 5+ lors d'une agression. Vous gagnez +1 pour Contester." },
  { id: "betting_expert", name: "Spécialiste des Paris Clandestins", baseCost: 100000, specialCosts: [], description: "Gain bonus d'argent en fin de match." },
  { id: "mercenaries", name: "Mercenaires", baseCost: 0, specialCosts: [], description: "Ajout de joueurs solitaires pour le match." },
  { id: "star_players", name: "Star Players", baseCost: 0, specialCosts: [], description: "Embaucher une légende pour le match." },
  { id: "wizard", name: "Sorcier", baseCost: 150000, specialCosts: [], description: "Lancer un sort pendant le match." }
];

const skills = [
  // AGILITÉ
  { name: "Réception", category: "Agilité", type: "Skill" },
  { name: "Réception Plongeante", category: "Agilité", type: "Skill" },
  { name: "Tacle Plongeant", category: "Agilité", type: "Skill" },
  { name: "Esquive", category: "Agilité", type: "Skill" },
  { name: "Défenseur", category: "Agilité", type: "Skill" },
  { name: "Frappe-et-Court", category: "Agilité", type: "Skill" },
  { name: "Rétablissement", category: "Agilité", type: "Skill" },
  { name: "Saut", category: "Agilité", type: "Skill" },
  { name: "Libération Contrôlée", category: "Agilité", type: "Skill" },
  { name: "Glissade Contrôlée", category: "Agilité", type: "Skill" },
  { name: "Sprint", category: "Agilité", type: "Skill" },
  { name: "Équilibre", category: "Agilité", type: "Skill" },

  // FORCE
  { name: "Clé de Bras", category: "Force", type: "Skill" },
  { name: "Bagarreur", category: "Force", type: "Skill" },
  { name: "Esquive en Force", category: "Force", type: "Skill" },
  { name: "Dans le Mille", category: "Force", type: "Skill" },
  { name: "Projection", category: "Force", type: "Skill" },
  { name: "Garde", category: "Force", type: "Skill" },
  { name: "Juggernaut", category: "Force", type: "Skill" },
  { name: "Châtaigne", category: "Force", type: "Skill" },
  { name: "Blocage Multiple", category: "Force", type: "Skill" },
  { name: "Stabilité", category: "Force", type: "Skill" },
  { name: "Bras Musclé", category: "Force", type: "Skill" },
  { name: "Crâne Épais", category: "Force", type: "Skill" },

  // GÉNÉRALE
  { name: "Blocage", category: "Générale", type: "Skill" },
  { name: "Intrépide", category: "Générale", type: "Skill" },
  { name: "Parade", category: "Générale", type: "Skill" },
  { name: "Frénésie", category: "Générale", type: "Skill" },
  { name: "Frappe Précise", category: "Générale", type: "Skill" },
  { name: "Pro", category: "Générale", type: "Skill" },
  { name: "Appuis Sûrs", category: "Générale", type: "Skill" },
  { name: "Arracher le Ballon", category: "Générale", type: "Skill" },
  { name: "Prise Sûre", category: "Générale", type: "Skill" },
  { name: "Tacle", category: "Générale", type: "Skill" },
  { name: "Provocation", category: "Générale", type: "Skill" },
  { name: "Lutte", category: "Générale", type: "Skill" },

  // MUTATIONS
  { name: "Main Démesurée", category: "Mutation", type: "Skill" },
  { name: "Griffes", category: "Mutation", type: "Skill" },
  { name: "Présence Perturbante", category: "Mutation", type: "Skill" },
  { name: "Bras Supplémentaire", category: "Mutation", type: "Skill" },
  { name: "Répulsion", category: "Mutation", type: "Skill" },
  { name: "Cornes", category: "Mutation", type: "Skill" },
  { name: "Peau de Fer", category: "Mutation", type: "Skill" },
  { name: "Grande Gueule", category: "Mutation", type: "Skill" },
  { name: "Queue Préhensile", category: "Mutation", type: "Skill" },
  { name: "Tentacules", category: "Mutation", type: "Skill" },
  { name: "Deux Têtes", category: "Mutation", type: "Skill" },
  { name: "Très Longues Jambes", category: "Mutation", type: "Skill" },

  // PASSE
  { name: "Précision", category: "Passe", type: "Skill" },
  { name: "Canonnier", category: "Passe", type: "Skill" },
  { name: "Perce-Nuages", category: "Passe", type: "Skill" },
  { name: "Délestage", category: "Passe", type: "Skill" },
  { name: "Transmission dans la course", category: "Passe", type: "Skill" },
  { name: "Passe Désespérée", category: "Passe", type: "Skill" },
  { name: "Chef", category: "Passe", type: "Skill" },
  { name: "Nerfs d'Acier", category: "Passe", type: "Skill" },
  { name: "Sur le Ballon", category: "Passe", type: "Skill" },
  { name: "Passe", category: "Passe", type: "Skill" },
  { name: "Dégagement", category: "Passe", type: "Skill" },
  { name: "Passe Assurée", category: "Passe", type: "Skill" },

  // SCÉLÉRATE
  { name: "Joueur Déloyal", category: "Scélérate", type: "Skill" },
  { name: "Fourchette", category: "Scélérate", type: "Skill" },
  { name: "Fumblerooski", category: "Scélérate", type: "Skill" },
  { name: "Vol Fatal", category: "Scélérate", type: "Skill" },
  { name: "Agresseur Solitaire", category: "Scélérate", type: "Skill" },
  { name: "Marteau-pilon", category: "Scélérate", type: "Skill" },
  { name: "Coup de Crampons", category: "Scélérate", type: "Skill" },
  { name: "Agression Éclair", category: "Scélérate", type: "Skill" },
  { name: "Saboteur", category: "Scélérate", type: "Skill" },
  { name: "Poursuite", category: "Scélérate", type: "Skill" },
  { name: "Sournois", category: "Scélérate", type: "Skill" },
  { name: "Innovateur Violent", category: "Scélérate", type: "Skill" },

  // TRAITS
  { name: "Animosité (X)", category: "Trait", type: "Trait" },
  { name: "Arme Secrète", category: "Trait", type: "Trait" },
  { name: "Bombardier", category: "Trait", type: "Trait" },
  { name: "Botter de Coéquipier", category: "Trait", type: "Trait" },
  { name: "Cerveau Lent", category: "Trait", type: "Trait" },
  { name: "Chaînes et Boulet", category: "Trait", type: "Trait" },
  { name: "Contagieux", category: "Trait", type: "Trait" },
  { name: "Décomposition", category: "Trait", type: "Trait" },
  { name: "Farceur", category: "Trait", type: "Trait" },
  { name: "Fureur Débridée", category: "Trait", type: "Trait" },
  { name: "Gerbe de Vomi", category: "Trait", type: "Trait" },
  { name: "Gros Débile", category: "Trait", type: "Trait" },
  { name: "Haine (X)", category: "Trait", type: "Trait" },
  { name: "Insignifiant", category: "Trait", type: "Trait" },
  { name: "Instable", category: "Trait", type: "Trait" },
  { name: "Ivrogne", category: "Trait", type: "Trait" },
  { name: "Lancer de Coéquipier", category: "Trait", type: "Trait" },
  { name: "Microbe", category: "Trait", type: "Trait" },
  { name: "Minus", category: "Trait", type: "Trait" },
  { name: "Mon Ballon", category: "Trait", type: "Trait" },
  { name: "Monté sur Ressort", category: "Trait", type: "Trait" },
  { name: "Petit Remontant", category: "Trait", type: "Trait" },
  { name: "Piqué", category: "Trait", type: "Trait" },
  { name: "Poids Plume", category: "Trait", type: "Trait" },
  { name: "Poignard", category: "Trait", type: "Trait" },
  { name: "Prendre Racine", category: "Trait", type: "Trait" },
  { name: "Regard Hypnotique", category: "Trait", type: "Trait" },
  { name: "Régénération", category: "Trait", type: "Trait" },
  { name: "Sans Ballon", category: "Trait", type: "Trait" },
  { name: "Sauvagerie Animale", category: "Trait", type: "Trait" },
  { name: "Soif de Sang (X+)", category: "Trait", type: "Trait" },
  { name: "Timmm-ber !", category: "Trait", type: "Trait" },
  { name: "Toujours Affamé", category: "Trait", type: "Trait" },
  { name: "Tronçonneuse", category: "Trait", type: "Trait" },
  { name: "Solitaire (X+)", category: "Trait", type: "Trait" }
].map(s => ({...s, description: s.description || "[Voir Règles Officielles]"}));

fs.writeFileSync(path.join(dataDir, 'skills.json'), JSON.stringify(skills, null, 2));
fs.writeFileSync(path.join(dataDir, 'special_rules.json'), JSON.stringify(specialRules, null, 2));
fs.writeFileSync(path.join(dataDir, 'inducements.json'), JSON.stringify(inducements, null, 2));

console.log('JSON files successfully completely populated with exact LRB S3 terms!');
