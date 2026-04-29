const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data', 'roster');

const specialRules = [
  {
    "id": "brutal_brawlers",
    "name": "Bagarreurs Brutaux",
    "description": "3 PSP pour une Élimination (au lieu de 2). 2 PSP pour un Touchdown (au lieu de 3)."
  },
  {
    "id": "bribery_and_corruption",
    "name": "Chantage et Corruption",
    "description": "Une fois par match, sur un 1 pour Contester la Décision, peut relancer le D6."
  },
  {
    "id": "favored_of",
    "name": "Favori de...",
    "description": "Alignement spécifique à un Dieu du Chaos (Khorne, Nurgle, Slaanesh, Tzeentch, ou Universel)."
  },
  {
    "id": "low_cost_linemen",
    "name": "Trois-quarts à vil prix",
    "description": "Le Coût d'Embauche des Trois-quarts compte pour 0 dans la Valeur d'Équipe Actuelle."
  },
  {
    "id": "masters_of_undeath",
    "name": "Maîtres de la Non-Vie",
    "description": "Si un joueur adverse (F4 ou moins, sans Minus) meurt, on peut Relever le Mort et gagner un Trois-quart Zombie gratuit."
  },
  {
    "id": "swarming",
    "name": "Déferlement",
    "description": "Permet de placer D3 Trois-quarts supplémentaires sur le terrain après le placement (dépasse la limite de 11)."
  },
  {
    "id": "captain",
    "name": "Capitaine",
    "description": "Un joueur gagne Pro gratuitement. S'il est sur le terrain, chaque Relance d'Équipe est gratuite sur un 6."
  }
];

const inducements = [
  {
    "id": "bribe",
    "name": "Pot-de-vin",
    "baseCost": 100000,
    "specialCosts": [
      {
        "specialRuleId": "bribery_and_corruption",
        "cost": 50000
      }
    ],
    "description": "Permet de relancer le jet d'expulsion (Argutie) après une Agression ou l'utilisation d'une Arme Secrète."
  },
  {
    "id": "halfling_chef",
    "name": "Maître-coq Halfling",
    "baseCost": 300000,
    "specialCosts": [
      {
        "specialRuleId": "halfling_thimble_cup",
        "cost": 100000
      }
    ],
    "description": "Jetez 3 dés. Pour chaque 4+, volez une relance à l'adversaire pour la mi-temps."
  },
  {
    "id": "bloodweiser_keg",
    "name": "Tonnelets de Bière Bloodweiser",
    "baseCost": 50000,
    "specialCosts": [],
    "description": "+1 aux jets pour revenir des KO en fin de phase (cumulable)."
  },
  {
    "id": "wandering_apothecary",
    "name": "Apothicaire Indépendant",
    "baseCost": 100000,
    "specialCosts": [],
    "description": "Fonctionne comme un Apothicaire normal. Les équipes sans accès à l'apothicaire régulier peuvent l'utiliser."
  },
  {
    "id": "mortuary_assistant",
    "name": "Assistant Mortuaire",
    "baseCost": 100000,
    "specialCosts": [],
    "description": "+1 au jet de Régénération (Réservé aux Maîtres de la Non-Vie, etc.)."
  },
  {
    "id": "plague_doctor",
    "name": "Médecin de la Peste",
    "baseCost": 100000,
    "specialCosts": [],
    "description": "Relance d'un jet de Régénération (Réservé aux Favoris de Nurgle)."
  },
  {
    "id": "biased_referee",
    "name": "Arbitre Partisan",
    "baseCost": 120000,
    "specialCosts": [
      {
        "specialRuleId": "bribery_and_corruption",
        "cost": 80000
      }
    ],
    "description": "L'adversaire est expulsé sur 5+ lors d'une agression. Vous n'êtes expulsé que sur 6+ et gagnez +1 pour Contester la Décision."
  }
];

const skills = [
  // GÉNÉRALE
  { "name": "Arracher le Ballon", "category": "Générale", "type": "Skill", "description": "Si le joueur plaque un porteur du ballon (sans le mettre à terre), le ballon rebondit." },
  { "name": "Blocage", "category": "Générale", "type": "Skill", "description": "Immunisé au résultat 'Les Deux Joueurs à Terre'." },
  { "name": "Dextérité", "category": "Générale", "type": "Skill", "description": "Relance pour ramasser. Annule la compétence Arracher le Ballon." },
  { "name": "Frappe Précise", "category": "Générale", "type": "Skill", "description": "Divise par 2 la déviation lors de l'engagement (D68)." },
  { "name": "Frénésie", "category": "Générale", "type": "Skill", "description": "Doit toujours poursuivre. Si l'adversaire n'est pas à terre, doit bloquer à nouveau." },
  { "name": "Intrépidité", "category": "Générale", "type": "Skill", "description": "Si la Force adverse est supérieure, jetez 1D6. Sur Force+D6 > Force Adverse, la Force est égale." },
  { "name": "Joueur Vicieux (+1)", "category": "Générale", "type": "Skill", "description": "+1 pour briser l'Armure ou Blesser lors d'une Agression." },
  { "name": "Lutte", "category": "Générale", "type": "Skill", "description": "Sur 'Les Deux Joueurs à Terre', les deux joueurs tombent sans jet d'armure ni turnover." },
  { "name": "Poursuite", "category": "Générale", "type": "Skill", "description": "Peut suivre un joueur qui esquive. Jet: D6 + (Mv propre - Mv adverse) > 3." },
  { "name": "Pro", "category": "Générale", "type": "Skill", "description": "Sur un 3+, permet de relancer un de ses propres dés." },
  { "name": "Repousser", "category": "Générale", "type": "Skill", "description": "L'adversaire ne peut pas poursuivre après un blocage." },
  { "name": "Tacle", "category": "Générale", "type": "Skill", "description": "Empêche l'utilisation de la compétence Esquive." },
  // AGILITÉ
  { "name": "Équilibre", "category": "Agilité", "type": "Skill", "description": "Relance gratuite pour Mettre le Paquet." },
  { "name": "Esquive", "category": "Agilité", "type": "Skill", "description": "Relance pour Esquive. Transforme le résultat 'Bousculé' en simple repousse." },
  { "name": "Glissade Contrôlée", "category": "Agilité", "type": "Skill", "description": "Choisit la case de recul lors d'un blocage." },
  { "name": "Passe Sécurisée", "category": "Agilité", "type": "Skill", "description": "En cas de maladresse, le joueur conserve le ballon et ne le lâche pas." },
  { "name": "Plongeon", "category": "Agilité", "type": "Skill", "description": "+1 pour attraper une passe précise ou récupérer un ballon qui atterrit dans la zone de tacle." },
  { "name": "Rétablissement", "category": "Agilité", "type": "Skill", "description": "Se relève gratuitement. Peut bloquer à terre avec un jet d'Agilité +2." },
  { "name": "Saut", "category": "Agilité", "type": "Skill", "description": "Peut sauter par-dessus une case occupée. Agilité requise." },
  { "name": "Sournois", "category": "Agilité", "type": "Skill", "description": "N'est pas expulsé s'il brise l'armure lors d'une Agression, et peut se déplacer après." },
  { "name": "Sprint", "category": "Agilité", "type": "Skill", "description": "Peut tenter jusqu'à 3 Mettre le Paquet." },
  { "name": "Tacle Plongeant", "category": "Agilité", "type": "Skill", "description": "S'inflige un 'A terre' pour donner un -2 à l'Esquive adverse." },
  // FORCE
  { "name": "Bagarreur", "category": "Force", "type": "Skill", "description": "Peut relancer un résultat 'Les Deux Joueurs à Terre' sur un de ses dés de Blocage." },
  { "name": "Blocage Multiple", "category": "Force", "type": "Skill", "description": "Peut bloquer deux adversaires à la fois avec -2 en Force." },
  { "name": "Bras Fort", "category": "Force", "type": "Skill", "description": "+1 aux jets de Passe Courte, Longue et Bombe." },
  { "name": "Châtaigne (+1)", "category": "Force", "type": "Skill", "description": "Peut ajouter +1 au jet d'Armure OU de Blessure après un blocage." },
  { "name": "Clé de Bras", "category": "Force", "type": "Skill", "description": "+1 au jet d'Armure d'un adversaire qui rate une Esquive depuis sa zone." },
  { "name": "Crâne Épais", "category": "Force", "type": "Skill", "description": "Traitez les résultats de Blessure 8 comme des Sonnés. Un KO nécessite un 9." },
  { "name": "Esquive en Force", "category": "Force", "type": "Skill", "description": "Utilise la Force au lieu de l'Agilité pour s'extraire d'une Zone de Tacle (1 fois/tour)." },
  { "name": "Garde", "category": "Force", "type": "Skill", "description": "Apporte un soutien même s'il est lui-même dans une Zone de Tacle." },
  { "name": "Marteau-Pilon", "category": "Force", "type": "Skill", "description": "Peut faire une Agression gratuite sur l'adversaire qu'il vient de bloquer." },
  { "name": "Projection", "category": "Force", "type": "Skill", "description": "Annule Glissade Contrôlée. Le joueur choisit la case de recul de l'adversaire." },
  { "name": "Stabilité", "category": "Force", "type": "Skill", "description": "Ne recule jamais après un blocage." },
  // MUTATION
  { "name": "Cornes", "category": "Mutation", "type": "Skill", "description": "+1 en Force lors d'un Blitz." },
  { "name": "Deux Têtes", "category": "Mutation", "type": "Skill", "description": "+1 aux jets d'Esquive." },
  { "name": "Griffes", "category": "Mutation", "type": "Skill", "description": "L'armure de la cible est toujours brisée sur un 8+ naturel." },
  { "name": "Main Démesurée", "category": "Mutation", "type": "Skill", "description": "Ignore les modificateurs de Zones de Tacle pour ramasser le ballon." },
  { "name": "Peau Écailleuse", "category": "Mutation", "type": "Skill", "description": "+1 Armure." },
  { "name": "Préhension", "category": "Mutation", "type": "Skill", "description": "+1 aux jets pour Interférer et Tacle Plongeant." },
  { "name": "Présence Perturbante", "category": "Mutation", "type": "Skill", "description": "-1 à toutes les Passes, Réceptions et Interférences à 3 cases ou moins." },
  { "name": "Queue Préhensile", "category": "Mutation", "type": "Skill", "description": "-1 aux jets d'Esquive des adversaires fuyant sa zone." },
  { "name": "Répulsion", "category": "Mutation", "type": "Skill", "description": "L'adversaire doit jeter 2+ pour le bloquer, sinon perd son action." },
  { "name": "Tentacules", "category": "Mutation", "type": "Skill", "description": "Peut bloquer l'Esquive. D6 + (F - F adverse) > 3 pour immobiliser." },
  { "name": "Très Longues Jambes", "category": "Mutation", "type": "Skill", "description": "-1 pénalité pour sauter, et donne +2 à Interférer." }
];

fs.writeFileSync(path.join(dataDir, 'skills.json'), JSON.stringify(skills, null, 2));
fs.writeFileSync(path.join(dataDir, 'special_rules.json'), JSON.stringify(specialRules, null, 2));
fs.writeFileSync(path.join(dataDir, 'inducements.json'), JSON.stringify(inducements, null, 2));

console.log('JSON files successfully populated!');
