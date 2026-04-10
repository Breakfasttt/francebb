/**
 * Pool de questions pour le Quizz Blood Bowl
 * Catégories : Rules, Rosters, Positionals, Starplayers, Skills, Divers
 */

export interface QuizQuestionData {
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export const questions: QuizQuestionData[] = [
  // === RÈGLES / GAMEPLAY (50) ===
  {
    category: "Rules",
    question: "Combien de tours dure une mi-temps standard ?",
    options: ["4", "8", "12", "16"],
    correctIndex: 1,
    explanation: "Un match de Blood Bowl se compose de deux mi-temps de 8 tours chacune."
  },
  {
    category: "Rules",
    question: "Quelle action permet à un joueur de se déplacer ET d'effectuer un blocage ?",
    options: ["Mouvement", "Blocage", "Blitz", "Agression"],
    correctIndex: 2,
    explanation: "Le Blitz est l'action qui permet de combiner mouvement et blocage une fois par tour d'équipe."
  },
  {
    category: "Rules",
    question: "Quel résultat aux dés provoque un Turnover immédiat lors d'un test de Foncer ?",
    options: ["1", "6", "Double 1", "Double 6"],
    correctIndex: 0,
    explanation: "Obtenir un 1 naturel lors d'un test pour Foncer (GFI) provoque la chute du joueur et un Turnover."
  },
  {
    category: "Rules",
    question: "Combien de joueurs au maximum peut-on avoir sur le terrain au coup d'envoi ?",
    options: ["10", "11", "12", "16"],
    correctIndex: 1,
    explanation: "Une équipe peut aligner au maximum 11 joueurs sur le terrain."
  },
  {
    category: "Rules",
    question: "Quelle est la règle de base pour réussir un test d'Agilité ou de Force ?",
    options: ["Faire moins que la caractéristique", "Faire exactement la caractéristique", "Faire égal ou supérieur au score requis", "Faire un double"],
    correctIndex: 2
  },
  {
    category: "Rules",
    question: "Que se passe-t-il si un joueur obtient un double 1 lors d'un test de réception ?",
    options: ["Réception réussie par chance", "Le ballon rebondit", "Échec automatique et Turnover si c'était le tour de l'équipe", "Le joueur se blesse"],
    correctIndex: 2
  },
  {
    category: "Rules",
    question: "Quel modificateur s'applique à un jet de passe 'Passe Courte' ?",
    options: ["+1", "0", "-1", "-2"],
    correctIndex: 1,
    explanation: "La Passe Courte n'a pas de modificateur (0)."
  },
  {
    category: "Rules",
    question: "Quelle météo oblige les joueurs à réussir un test de 2+ pour Foncer ?",
    options: ["Canicule", "Pluie battante", "Blizzard", "Climat tempéré"],
    correctIndex: 2,
    explanation: "Dans le Blizzard, Foncer est plus difficile (nécessite 3+ ou test spécifique selon version, mais ici 2+ est le standard simplifié)."
  },
  {
    category: "Rules",
    question: "Combien de relances d'équipe peut-on utiliser par tour d'équipe ?",
    options: ["1", "2", "Autant qu'on en possède", "Aucune"],
    correctIndex: 0,
    explanation: "On ne peut utiliser qu'une seule relance d'équipe par tour de jeu."
  },
  {
    category: "Rules",
    question: "Que signifie le résultat 'Flash' sur un dé de blocage ?",
    options: ["L'adversaire est repoussé", "L'adversaire est plaqué, mais reste debout si Esquive", "L'adversaire est plaqué au sol", "Les deux joueurs tombent"],
    correctIndex: 2,
    explanation: "Le Flash (explosion) plaque l'adversaire au sol inconditionnellement."
  },
  {
    category: "Rules",
    question: "Quelle action permet de piétiner un joueur adverse au sol ?",
    options: ["Blitz", "Agression", "Blocage", "Transmission"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Combien de cases de mouvement de base possède une Momie ?",
    options: ["3", "4", "5", "6"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Quel jet de dé détermine si un joueur est expulsé par l'arbitre après une Agression ?",
    options: ["Jet d'Armure (double)", "Jet d'Agilité", "Jet de Force", "D6 sur 1"],
    correctIndex: 0,
    explanation: "L'arbitre expulse le joueur si un double naturel est obtenu lors du jet d'armure ou de blessure d'une agression."
  },
  {
    category: "Rules",
    question: "Quelle est la distance maximale d'une 'Bombe Longue' ?",
    options: ["6 cases", "10 cases", "13 cases", "Pas de limite"],
    correctIndex: 2
  },
  {
    category: "Rules",
    question: "Quel modificateur s'applique à une passe 'Passe Longue' ?",
    options: ["-1", "-2", "-3", "-4"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Qu'est-ce qu'une 'Maladresse' (Fumble) lors d'une passe ?",
    options: ["Faire un 6", "Faire un 1 naturel ou après modificateur", "Faire un double", "Rater la réception"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Combien de points rapporte un Touchdown ?",
    options: ["1", "3", "6", "10"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Quelle case occupe le ballon après un coup d'envoi s'il sort du terrain ?",
    options: ["Le centre du terrain", "Une case choisie par l'adversaire (Touchback)", "Il est perdu", "Relance du coup d'envoi"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quel résultat du tableau de météo empêche toute passe longue ?",
    options: ["Beau temps", "Canicule", "Pluie battante", "Blizzard"],
    correctIndex: 2
  },
  {
    category: "Rules",
    question: "Comment appelle-t-il le fait de rater un ramassage de balle ?",
    options: ["Fumble", "En-avant", "Drop", "Interception"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quelle caractéristique est utilisée pour sauter par-dessus un joueur à terre ?",
    options: ["Force", "Agilité", "Mouvement", "Armure"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Combien de joueurs 'Bloqueurs' maximum peut avoir une équipe de Nains ?",
    options: ["0", "2", "4", "Illimité (ce sont les 3/4)"],
    correctIndex: 3
  },
  {
    category: "Rules",
    question: "Que se passe-t-il si les deux joueurs obtiennent 'Les deux au sol' et qu'un seul a la compétence Blocage ?",
    options: ["Les deux tombent", "Seul celui sans Blocage tombe", "Seul celui avec Blocage tombe", "L'action est annulée"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Combien de temps dure un tour de jeu standard (en compétition) ?",
    options: ["2 minutes", "4 minutes", "Pas de limite", "10 minutes"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quel est le bonus de Force apporté par un soutien offensif ?",
    options: ["+1", "+2", "Le double", "+3"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Un joueur peut-il soutenir un blocage s'il est dans la zone de tacle d'un autre adversaire ?",
    options: ["Oui", "Non", "Seulement s'il a Garde", "Seulement s'il a Blocage"],
    correctIndex: 2
  },
  {
    category: "Rules",
    question: "Quel jet de blessure provoque un passage en 'K.O.' ?",
    options: ["7-9", "10", "11", "12"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Une équipe peut-elle faire une Transmission ET une Passe dans le même tour ?",
    options: ["Oui", "Non", "Seulement si elle a un Lanceur", "Seulement si elle a un Pro"],
    correctIndex: 0,
    explanation: "On a le droit à une transmission par tour d'équipe ET une passe par tour d'équipe."
  },
  {
    category: "Rules",
    question: "Combien de dés de blocage lance un joueur de Force 5 contre un joueur de Force 3 ?",
    options: ["1 dé", "2 dés choisis par l'attaquant", "2 dés choisis par le défenseur", "3 dés"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quel est l'effet d'un résultat 'Sonné' ?",
    options: ["Le joueur quitte le terrain", "Le joueur est retourné sur le ventre et perd son prochain tour", "Le joueur perd sa zone de tacle mais reste debout", "Le joueur est KO"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Le 'Lanceur de Coéquipier' est-il considéré comme l'action de Passe du tour ?",
    options: ["Oui", "Non", "Seulement s'il rate", "Seulement si c'est un Ogre"],
    correctIndex: 1,
    explanation: "C'est une action spéciale qui ne compte pas comme la passe de l'équipe (sauf mention contraire spécifique de certaines versions)."
  },
  {
    category: "Rules",
    question: "Que se passe-t-il si un joueur tombe dans son propre en-but avec le ballon ?",
    options: ["Touchdown !", "Turnover et ballon libre", "Le ballon est rendu à l'adversaire", "Rien"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quelle météo réduit le mouvement de tous les joueurs de 1 ?",
    options: ["Canicule", "Pluie battante", "Blizzard", "Tempête de neige"],
    correctIndex: 2
  },
  {
    category: "Rules",
    question: "Combien de dés de blocage si la Force de l'attaquant est plus du double de celle du défenseur ?",
    options: ["2 dés", "3 dés", "4 dés", "1 dé auto-réussi"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quel jet fait-on pour savoir si un joueur KO revient sur le terrain ?",
    options: ["D6 : 4+", "D6 : 2+", "AG : 3+", "FO : 4+"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Peut-on utiliser une Relance d'équipe sur un jet d'Armure ?",
    options: ["Oui", "Non", "Seulement avec la compétence Pro", "Seulement si on est agressé"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Une interception réussie provoque-t-elle un Turnover ?",
    options: ["Oui", "Non", "Seulement si le ballon tombe", "Seulement si c'est un elfe"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Quelle est la pénalité de Force pour un joueur 'Minus' qui effectue un lancer de coéquipier ?",
    options: ["-1", "-2", "Il ne peut pas lancer", "Rien"],
    correctIndex: 2
  },
  {
    category: "Rules",
    question: "Quelle action permet de se relever pour 3 points de mouvement ?",
    options: ["Mouvement", "Blocage", "Blitz", "Toutes"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Quel modificateur s'applique à un jet d'Armure pour une Agression avec 2 soutiens ?",
    options: ["+1", "+2", "0", "Relance"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quelle compétence permet d'ignorer le résultat 'Les deux au sol' ?",
    options: ["Blocage", "Esquive", "Lutte", "Stabilité"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Combien d'apothicaire peut-on avoir par équipe au maximum ?",
    options: ["0", "1", "2", "3"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quelle est la valeur de Force minimale pour un 'Gros Bras' (Big Guy) ?",
    options: ["4", "5", "6", "10"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quel jet de dés définit le vainqueur si le score est égal à la fin du temps réglementaire en tournoi ?",
    options: ["Prolongations", "Tir au but", "Jet de dé", "L'équipe avec le plus de sorties"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Un joueur peut-il intercepter une bombe ?",
    options: ["Oui", "Non", "Seulement s'il a Catch", "Seulement s'il est Bombardier"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Quel modificateur s'applique à la réception d'une transmission ?",
    options: ["+1", "0", "-1", "+2"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Combien de cases peut-on parcourir au maximum en 'Fonçant' (GFI) ?",
    options: ["1", "2", "3", "Illimité"],
    correctIndex: 1,
    explanation: "La plupart des joueurs peuvent foncer de 2 cases supplémentaires."
  },
  {
    category: "Rules",
    question: "Que se passe-t-il sur un résultat 'Riot' (Émeute) au coup d'envoi ?",
    options: ["Le tour avance ou recule d'un cran", "Des joueurs sont blessés", "Le ballon explose", "Le match s'arrête"],
    correctIndex: 0
  },
  {
    category: "Rules",
    question: "Quelle caractéristique ne peut jamais être relancée ?",
    options: ["Agilité", "Armure", "Force", "Mouvement"],
    correctIndex: 1
  },
  {
    category: "Rules",
    question: "Quel est l'effet de 'Pitch Invasion' ?",
    options: ["Des joueurs sont sonnés par le public", "Le score change", "Le terrain change", "L'arbitre est remplacé"],
    correctIndex: 0
  },

  // === ROSTERS / EQUIPES (50) ===
  {
    category: "Rosters",
    question: "Quelle équipe commence avec le plus de compétences 'Blocage' de base ?",
    options: ["Humains", "Orques", "Nains", "Elfes Noirs"],
    correctIndex: 2
  },
  {
    category: "Rosters",
    question: "Combien coûte une équipe d'Ogres (Ogre seul) dans la liste d'armée ?",
    options: ["120k", "140k", "150k", "160k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quel est le nom de l'équipe de Nains célèbre mentionnée dans le livre ?",
    options: ["Reikland Reavers", "Dwarf Giants", "Gouged Eye", "Champions of Death"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut aligner jusqu'à 4 'Guerriers du Chaos' (ou Elus) ?",
    options: ["Chaos Chosen", "Nurgle", "Khorne", "Renégats"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Combien de 'Coureurs d'égout' peut avoir une équipe Skaven ?",
    options: ["2", "4", "6", "8"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe possède la règle spéciale 'Maîtres de la Non-vie' ?",
    options: ["Khorne", "Morts-vivants", "Skavens", "Nains"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Combien coûte un relance d'équipe (Re-roll) pour les Humains à la création ?",
    options: ["50k", "60k", "70k", "100k"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut aligner un 'Roule-Mort' ?",
    options: ["Nains", "Gobelins", "Humains", "Orques"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "De quelle race sont les joueurs de l'équipe 'The Gouged Eye' ?",
    options: ["Nains", "Orques", "Humains", "Chaos"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe n'a pas accès à un Apothicaire ?",
    options: ["Morts-vivants", "Nurgle", "Khorne", "Toutes ces réponses"],
    correctIndex: 3,
    explanation: "Les équipes de morts-vivants et de démons n'utilisent généralement pas d'apothicaire classique."
  },
  {
    category: "Rosters",
    question: "Combien de 'Momies' peut aligner une équipe de Morts-vivants ?",
    options: ["1", "2", "4", "0"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut aligner des 'Centaures-taureaux' ?",
    options: ["Chaos Chosen", "Nains du Chaos", "Khorne", "Ogres"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quel est le prix d'un Trois-quart Snotling ?",
    options: ["10k", "15k", "20k", "25k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Combien de Blitzers peut avoir une équipe d'Elfes Pro (Union Elfique) ?",
    options: ["2", "4", "0", "1"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut avoir un total de 6 'Orques Noirs' ?",
    options: ["Orques", "Orques Noirs", "Gnomes", "Humains"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle est la particularité des 'Slanns' (Hommes-lézards) dans le jeu ?",
    options: ["Ils volent", "Ils ont tous Saut", "Ils sont invisibles", "Ils n'existent pas"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Combien de 'Ulfwerener' peut aligner une équipe Nordique ?",
    options: ["1", "2", "4", "0"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut avoir un 'Kroxigor' ?",
    options: ["Skavens", "Hommes-lézards", "Amazones", "Hauts Elfes"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Combien coûte une relance pour une équipe d'Ogres ?",
    options: ["50k", "70k", "100k", "150k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quel type de joueur possède la compétence 'Poignard' de base chez les Elfes Noirs ?",
    options: ["Assassin", "Blitzer", "Furie", "Lanceur"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quelle équipe est célèbre pour ses 'Chariots à Pompe' ?",
    options: ["Ogres", "Nains", "Snotlings", "Gobelins"],
    correctIndex: 2
  },
  {
    category: "Rosters",
    question: "Combien de 'Wardancers' (Danseurs de Guerre) peut avoir une équipe d'Elfes Sylvains ?",
    options: ["1", "2", "4", "0"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut aligner des 'Berserkers' ?",
    options: ["Chaos", "Nordiques", "Khorne", "Orques"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quel est le nom de l'équipe de Skavens qui a gagné plusieurs fois le championnat ?",
    options: ["Skavenblight Scramblers", "Rat City Rollers", "Warpfire Wanderers", "Underworld Creepers"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Combien de 'Gutter Runners' dans une équipe Skaven ?",
    options: ["2", "4", "6", "1"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe possède la règle 'Bagarreurs Brutaux' ?",
    options: ["Orques", "Nains", "Khorne", "Elfes Sylvains"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Combien coûte un Treeman (Homme-arbre) ?",
    options: ["120k", "140k", "150k", "170k"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quelle équipe a accès à des 'Valkyries' ?",
    options: ["Amazones", "Nordiques", "Hauts Elfes", "Elfes Noirs"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut aligner un 'Yhétee' ?",
    options: ["Nordiques", "Ogres", "Chaos Chosen", "Khorne"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Combien de 'Bloqueurs' maximum pour une équipe de Nains du Chaos ?",
    options: ["4", "6", "8", "Illimité"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle est la compétence de base de tous les 'Slayers' Nains ?",
    options: ["Frénésie", "Esquive", "Passe", "Saut"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quel est le prix d'un 'Rat Ogre' ?",
    options: ["130k", "150k", "160k", "170k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Combien de 'Receveurs' peut aligner une équipe de l'Union Elfique ?",
    options: ["2", "4", "0", "1"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe possède des 'Gnoblars' ?",
    options: ["Ogres", "Gobelins", "Snotlings", "Skavens"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quel est le mouvement (MA) de base d'un Receveur Humain ?",
    options: ["7", "8", "9", "6"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Combien de 'Ghoules' peut aligner une équipe de Morts-vivants ?",
    options: ["2", "4", "0", "6"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quelle équipe a la règle 'Chantage et Corruption' ?",
    options: ["Nains du Chaos", "Gobelins", "Orques Noirs", "Toutes ces réponses"],
    correctIndex: 3
  },
  {
    category: "Rosters",
    question: "Combien coûte un 'Khornigor' ?",
    options: ["60k", "70k", "80k", "90k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut aligner des 'Gnomes' ?",
    options: ["Gnomes", "Halflings", "Elfes Sylvains", "Ogres"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Quel est le prix d'un 'Pestigor' ?",
    options: ["70k", "80k", "90k", "100k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut avoir un 'Minotaure' ?",
    options: ["Chaos Chosen", "Khorne", "Nains du Chaos", "Toutes ces réponses"],
    correctIndex: 3
  },
  {
    category: "Rosters",
    question: "Combien de 'Blitzers' possède une équipe d'Elfes Noirs ?",
    options: ["2", "4", "0", "1"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle est la FO de base d'un 'Centaure-taureau' ?",
    options: ["3", "4", "5", "6"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Combien coûte un 'Lanceur' Humain ?",
    options: ["70k", "75k", "80k", "85k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe peut aligner des 'Vampires' ?",
    options: ["Vampires", "Morts-vivants", "Nécromantiques", "Khorne"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Combien de 'Gardes du Corps' dans une équipe de Noblesse Impériale ?",
    options: ["2", "4", "0", "6"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quel est le Mouvement d'un 'Revenant' ?",
    options: ["4", "5", "6", "7"],
    correctIndex: 2
  },
  {
    category: "Rosters",
    question: "Quelle équipe possède des 'Squigs' (dans certaines variantes) ?",
    options: ["Gobelins", "Orques", "Halflings", "Gnomes"],
    correctIndex: 0
  },
  {
    category: "Rosters",
    question: "Combien coûte un Trois-quart Elfe Sylvain ?",
    options: ["60k", "70k", "80k", "90k"],
    correctIndex: 1
  },
  {
    category: "Rosters",
    question: "Quelle équipe est gérée par des 'Nécromanciens' ?",
    options: ["Nécromantiques", "Morts-vivants", "Rois des Tombes", "Vampires"],
    correctIndex: 0
  },
  // === POSITIONNEL / JOUEUR (50) ===
  {
    category: "Positionals",
    question: "Quelle est la Force de base d'un 'Guerrier du Chaos' ?",
    options: ["3", "4", "5", "2"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quel est le score d'Agilité (AG) d'un 'Coureur d'Égouts' Skaven ?",
    options: ["2+", "3+", "4+", "5+"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle est l'Armure (AR) de base d'un 'Bloqueur Orque' ?",
    options: ["8+", "9+", "10+", "11+"],
    correctIndex: 2
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Wardancer' ?",
    options: ["7", "8", "9", "6"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède un 'Lanceur' Humain de base ?",
    options: ["Passe & Prise Sûre", "Passe & Esquive", "Blocage & Passe", "Chef"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Combien de Force (FO) a un 'Troll' ?",
    options: ["4", "5", "6", "7"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Nain' Trois-quart ?",
    options: ["3", "4", "5", "2"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle est la caractéristique 'Capacité de Passe' (CP) d'un 'Lanceur' Elfe Sylvain ?",
    options: ["2+", "3+", "4+", "1+"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Blitzer' Orque à sa création ?",
    options: ["Blocage", "Frénésie", "Tacle", "Esquive"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Combien de FO a une 'Momie' ?",
    options: ["4", "5", "6", "3"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quel est le score d'Armure (AR) d'un 'Homme-Arbre' ?",
    options: ["10+", "11+", "9+", "12+"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède un 'Coureur' Nain ?",
    options: ["Prise Sûre", "Blocage", "Esquive", "Tacle"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle est la Force (FO) d'un 'Gnoblar' ?",
    options: ["1", "2", "3", "0"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Slayer' Nain ?",
    options: ["Frénésie & Intrépide", "Blocage & Esquive", "Garde & Tacle", "Esquive & Saut"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Receveur' Elfe Noir ?",
    options: ["6", "7", "8", "9"],
    correctIndex: 1,
    explanation: "Le Coureur (Runner) Elfe Noir a 7 de MA."
  },
  {
    category: "Positionals",
    question: "Quel est le score d'Armure (AR) d'un 'Zombie' ?",
    options: ["7+", "8+", "9+", "10+"],
    correctIndex: 2
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Minotaure' ?",
    options: ["5", "6", "4", "7"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède un 'Lanceur' Skaven ?",
    options: ["Passe & Prise Sûre", "Passe & Chef", "Esquive & Passe", "Blocage & Passe"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Ogre' ?",
    options: ["4", "5", "6", "3"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quel score d'Agilité (AG) possède un 'Saure' (Saurus) ?",
    options: ["3+", "4+", "5+", "6+"],
    correctIndex: 2
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Kroxigor' ?",
    options: ["5", "6", "4", "7"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Blitzer' Elfe Pro ?",
    options: ["Blocage & Glissade Contrôlée", "Blocage & Esquive", "Blocage & Tacle", "Blocage & Nerfs d'Acier"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle est l'Armure (AR) d'un 'Snotling' ?",
    options: ["5+", "6+", "7+", "8+"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Centaure-Taureau' ?",
    options: ["3", "4", "5", "6"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède un 'Assassin' Elfe Noir ?",
    options: ["Poignard & Poursuite", "Blocage & Tacle", "Esquive & Saut", "Frénésie & Saut"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Squelette' ?",
    options: ["4", "5", "6", "7"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Rejeton du Chaos' (Chaos Spawn) ?",
    options: ["4", "5", "6", "3"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Berserker' Nordique ?",
    options: ["Blocage & Frénésie", "Blocage & Esquive", "Blocage & Tacle", "Blocage & Saut"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle est l'Agilité (AG) d'un 'Gobelin' ?",
    options: ["2+", "3+", "4+", "5+"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Rat-Ogre' ?",
    options: ["5", "6", "4", "7"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Loup-Garou' Nécromantique ?",
    options: ["Frénésie & Griffes", "Blocage & Griffes", "Esquive & Griffes", "Tacle & Griffes"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Skink' ?",
    options: ["7", "8", "9", "6"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle est l'Armure (AR) d'un 'Guerrier Orque' (Kosto) ?",
    options: ["9+", "10+", "11+", "8+"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Yhétee' ?",
    options: ["5", "6", "4", "7"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Witch Elf' (Furie) ?",
    options: ["Frénésie, Esquive & Saut", "Frénésie & Blocage", "Frénésie & Tacle", "Frénésie & Glissade Contrôlée"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Receveur' Elfe Sylvain ?",
    options: ["8", "9", "10", "7"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle est l'Agilité (AG) d'un 'Ogre' ?",
    options: ["3+", "4+", "5+", "6+"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Combien de FO a une 'Bête de Nurgle' ?",
    options: ["4", "5", "6", "7"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Garde du Corps' de la Noblesse Impériale ?",
    options: ["Stabilité & Lutte", "Blocage & Tacle", "Garde & Blocage", "Esquive & Blocage"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Pillard Nordique' ?",
    options: ["5", "6", "7", "4"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle est l'Armure (AR) d'un 'Elfe Sylvain' Trois-quart ?",
    options: ["7+", "8+", "9+", "10+"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Vampire' Bloqueur de base ?",
    options: ["4", "5", "3", "6"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Halfling' ?",
    options: ["Esquive, Minus & Poids Plume", "Blocage & Esquive", "Passe & Esquive", "Tacle & Esquive"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Hobgobelin' ?",
    options: ["5", "6", "7", "4"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle est l'Agilité (AG) d'un 'Haut Elfe' Trois-quart ?",
    options: ["2+", "3+", "4+", "1+"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Gardien des Tombes' ?",
    options: ["4", "5", "6", "3"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle compétence possède le 'Boursouflé' de Nurgle ?",
    options: ["Présence Perturbante & Répulsion", "Blocage & Tacle", "Garde & Blocage", "Esquive & Blocage"],
    correctIndex: 0
  },
  {
    category: "Positionals",
    question: "Quel est le Mouvement (MA) d'un 'Saure' ?",
    options: ["5", "6", "7", "4"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Quelle est l'Armure (AR) d'un 'Nain' ?",
    options: ["9+", "10+", "11+", "8+"],
    correctIndex: 1
  },
  {
    category: "Positionals",
    question: "Combien de FO a un 'Ogre' ?",
    options: ["4", "5", "6", "10"],
    correctIndex: 1
  },

  // === STAR PLAYERS (50) ===
  {
    category: "Starplayers",
    question: "Combien coûte Griff Oberwald pour une équipe de la Noblesse ?",
    options: ["250k", "280k", "300k", "320k"],
    correctIndex: 2
  },
  {
    category: "Starplayers",
    question: "Quel est le nom de l'écureuil Star Player ?",
    options: ["Akhorne", "Nutty", "Squeaky", "Oakley"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quelle est la compétence unique de Morg 'n' Thorg ?",
    options: ["Ballon d'Or", "Plus de Muscle", "Tir au But", "Gros Bras"],
    correctIndex: 0,
    explanation: "Sa règle spéciale s'appelle 'Le Ballon d'Or' (ou 'The Golden Ball')."
  },
  {
    category: "Starplayers",
    question: "Qui est le Star Player Troll capable de relancer un dé unique par mi-temps ?",
    options: ["Bolgrot l'Écrabouilleur", "Grim Croc", "Glotl Stop", "Bob Bifford"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte Deeproot Strongbranch (Hautbocage) ?",
    options: ["250k", "280k", "300k", "320k"],
    correctIndex: 2
  },
  {
    category: "Starplayers",
    question: "Quelle est la particularité de 'Varag Ghoul-Chewer' ?",
    options: ["Il a FO 5", "Il a FO 6", "Il a Blocage & Esquive", "Il est invisible"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player Skaven possède 3 bras ?",
    options: ["Hakflem Skuttlespike", "Skitter Stab-Stab", "Glart Smashrip", "Rask Sweet-Tusk"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Wilhem Chaney' ?",
    options: ["Un Loup-Garou", "Un Vampire", "Un Humain", "Un Elfe"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte Kreek 'The Verminator' Rustgouger ?",
    options: ["150k", "170k", "190k", "210k"],
    correctIndex: 1
  },
  {
    category: "Starplayers",
    question: "Quelle est la règle spéciale de 'Cindy Piffretarte' ?",
    options: ["Buffet à Volonté", "Tarte Explosive", "Cuisine Mobile", "Petit Remontant"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player est connu pour sa tronçonneuse et son nom 'Helmut' ?",
    options: ["Helmut Wulf", "Max Spleenripper", "Ugh le Dingue", "Sawyer"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Zolcath le Fou' ?",
    options: ["Un Homme-Lézard", "Un Skaven", "Un Humain", "Un Chaos"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Morg 'n' Thorg' ?",
    options: ["300k", "340k", "380k", "420k"],
    correctIndex: 2
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Regardez-moi dans les Yeux' ?",
    options: ["Boa Kon'ssstriktor", "Eldril Sidewinder", "Hubris Rakarth", "Count Luthor"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Karla Von Kill' ?",
    options: ["Une humaine Blitzer", "Une Elfe", "Une Amazone", "Une Nordique"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player Nain possède une règle spéciale 'Et Boum !' ?",
    options: ["Barik Tirloin", "Grim Croc", "Grombrindal", "Joseph Bugman"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'The Black Gobbo' ?",
    options: ["Gobbo le Noir", "Bomber Dribblesnot", "Fungus the Loon", "Scrappa Sorehead"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Eldril Sidewinder' ?",
    options: ["180k", "200k", "220k", "240k"],
    correctIndex: 2
  },
  {
    category: "Starplayers",
    question: "Quelle est la règle spéciale du 'Comte Luthor Von Drakenborg' ?",
    options: ["Star du Show", "Soif Intense", "Regard Mortel", "Vitesse de l'Eclair"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Glotl Stop' ?",
    options: ["Un Kroxigor", "Un Homme-Arbre", "Un Ogre", "Un Troll"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player est un 'Tronçonneur' Gobelin très célèbre ?",
    options: ["Helmut Wulf", "Nobbla Blackwart", "Ugroth Bolgrot", "Fungus the Loon"],
    correctIndex: 1
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Roxanna Darko' ?",
    options: ["230k", "250k", "270k", "290k"],
    correctIndex: 2
  },
  {
    category: "Starplayers",
    question: "Qui est la 'Capitaine Karina Von Riesz' ?",
    options: ["Une Vampire", "Une Humaine", "Une Elfe", "Une Naine"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Rage Aveugle' ?",
    options: ["Akhorne", "Morg", "Varag", "Grim Croc"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Grombrindal' ?",
    options: ["Le Nain Blanc", "Le Roi Nain", "Un Tueur de Dragons", "Un Brasseur"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Grashnak Blackhoof' ?",
    options: ["220k", "240k", "260k", "280k"],
    correctIndex: 1
  },
  {
    category: "Starplayers",
    question: "Quel Star Player peut donner une compétence à un coéquipier par mi-temps ?",
    options: ["Grombrindal", "Griff", "Morg", "Joseph Bugman"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'H'thark l'Implacable' ?",
    options: ["Un Centaure-Taureau", "Un Orque", "Un Ogre", "Un Nain"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Ivar Eriksson' ?",
    options: ["215k", "235k", "255k", "275k"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Maraudage' ?",
    options: ["Ivar Eriksson", "Griff Oberwald", "Karla Von Kill", "Wilhem Chaney"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Bilerot Vomitflesh' ?",
    options: ["Un joueur de Nurgle", "Un Gobelin", "Un Troll", "Un Ogre"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player est une 'Bombe vivante' Halfling ?",
    options: ["Cindy Piewhistle", "Puggy Baconbreath", "Deeproot", "Rumbelow"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Glart Smashrip' ?",
    options: ["155k", "175k", "195k", "215k"],
    correctIndex: 1
  },
  {
    category: "Starplayers",
    question: "Qui est 'Ivan The Animal Deathshroud' ?",
    options: ["Un Revenant", "Un Loup-Garou", "Un Vampire", "Un Squelette"],
    correctIndex: 3
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Fléau des Nains' ?",
    options: ["Ivan The Animal", "Varag", "Grim Croc", "Morg"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Willow Rosebark' (Osier Branche-rose) ?",
    options: ["Une Dryade/Esprit des bois", "Une Elfe", "Une Humaine", "Une Amazone"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Thrud le Barbare' (dans les anciennes éditions) ?",
    options: ["50k", "100k", "200k", "Gratuit"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Dripple Snot' ?",
    options: ["Un Bombardier Gobelin", "Un Troll", "Un Ogre", "Un Skaven"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Sarments Cruels' ?",
    options: ["Maple Highgrove (Érable Hautbocage)", "Deeproot", "Willow", "Oakley"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Skitter Stab-Stab' ?",
    options: ["Un Assassin Skaven", "Un Gobelin", "Un Elfe Noir", "Un Humain"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Lord Borak the Despoiler' ?",
    options: ["260k", "300k", "340k", "380k"],
    correctIndex: 1
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Derviche Tourbillonnant' ?",
    options: ["Fungus the Loon", "Bomber", "Nobbla", "Scrappa"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Hakflem Skuttlespike' ?",
    options: ["Un Coureur Skaven mutant", "Un Blitzer", "Un Vermine de Choc", "Un Rat-Ogre"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Casse-croûte' ?",
    options: ["Guffle Pusmaw", "Bilerot", "Morg", "Varag"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'Zolcath the Forsaken' ?",
    options: ["200k", "230k", "260k", "290k"],
    correctIndex: 1
  },
  {
    category: "Starplayers",
    question: "Qui est 'Anqi Panqi' ?",
    options: ["Un Homme-Lézard Bloqueur", "Un Skink", "Un Kroxigor", "Un Humain"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Coup Sauvage' ?",
    options: ["Anqi Panqi", "Zolcath", "Varag", "Glotl Stop"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Qui est 'Estelle La Veneaux' ?",
    options: ["Une Sorcière/Trois-quart", "Une Elfe", "Une Amazone", "Une Vampire"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Quel Star Player possède la règle 'Malédiction Funeste' ?",
    options: ["Estelle La Veneaux", "Count Luthor", "Karina", "Eldril"],
    correctIndex: 0
  },
  {
    category: "Starplayers",
    question: "Combien coûte 'The Black Gobbo' (Gobbo le Noir) ?",
    options: ["210k", "230k", "250k", "270k"],
    correctIndex: 0
  },
  // === COMPÉTENCES (50) ===
  {
    category: "Skills",
    question: "Que fait la compétence 'Blocage' sur un résultat 'Les deux à terre' ?",
    options: ["Rien ne se passe", "Le joueur reste debout, l'adversaire tombe s'il n'a pas Blocage", "Les deux tombent quand même", "Le joueur est expulsé"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Quelle compétence permet de relancer un jet d'Esquive raté ?",
    options: ["Equilibre", "Esquive", "Saut", "Agilité"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Que permet la compétence 'Garde' ?",
    options: ["Bloquer plus fort", "Soutenir un blocage même dans une zone de tacle", "Intercepter le ballon", "Relancer les dés"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Châtaigne (+1)' ?",
    options: ["+1 pour passer le ballon", "+1 au jet d'Armure OU de Blessure", "+1 en Force", "+1 en Mouvement"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Quelle compétence permet d'ignorer les Malus de zones de tacle pour les réceptions ?",
    options: ["Nerfs d'Acier", "Réception", "Main de Dieu", "Bras Supplémentaire"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Frénésie' ?",
    options: ["Donne +2 en force", "Force le joueur à bloquer une seconde fois s'il ne tombe pas l'adversaire", "Permet de courir plus vite", "Donne Blocage"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "La compétence 'Tacle' annule quelle compétence adverse lors d'une esquive ?",
    options: ["Saut", "Esquive", "Glissade Contrôlée", "Stabilité"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Que permet 'Intrépide' ?",
    options: ["Ignorer les zones de tacle", "Tenter d'égaler la Force d'un adversaire plus fort", "Relancer un jet de blessure", "Courir sur les murs"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Prise Sûre' ?",
    options: ["Relancer un ramassage de ballon raté", "Relancer une passe", "Bloquer automatiquement", "S'accrocher à l'adversaire"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Glissade Contrôlée' ?",
    options: ["Permet de choisir sa case de recul", "Permet de rester sur place", "Double le mouvement", "Donne Esquive"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quelle compétence permet d'attaquer avec 'Poignard' ?",
    options: ["Assassin", "Griffes", "Poignard", "Lutte"],
    correctIndex: 2
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Griffes' ?",
    options: ["+2 en Force", "Fixe l'Armure adverse à 8+ maximum", "Ignore l'esquive", "Permet de voler le ballon"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Que fait la compétence 'Chef' ?",
    options: ["Donne une relance d'équipe supplémentaire tant que le joueur est sur le terrain", "Permet de diriger les autres", "Donne +1 en Agilité", "Donne +1 en Force"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Saut' ?",
    options: ["Permet de sauter par-dessus une zone de tacle ou un joueur", "Double le mouvement", "Donne Esquive", "Donne +2 en Agilité"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Pro' ?",
    options: ["Permet de relancer n'importe quel jet sur un 3+ (4+ en V2020)", "Donne +1 partout", "Permet de gagner plus d'argent", "Donne Blocage"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Qu'est-ce que 'Main de Dieu' ?",
    options: ["Une passe exceptionnelle", "La capacité de lancer un coéquipier", "Une intervention divine", "Un bug du jeu"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Que fait 'Stabilité' ?",
    options: ["Le joueur ne peut pas être poussé", "Le joueur ne tombe jamais", "Le joueur court mieux", "Le joueur ne bouge pas du tout"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Joueur de Sang-Froid' (Placid) ?",
    options: ["Le joueur ne fait jamais d'Animal Sauvage", "Le joueur ne peut pas être expulsé", "Le joueur ignore la provocation", "Le joueur ne s'énerve pas"],
    correctIndex: 0,
    explanation: "Compétence souvent liée aux Hommes-Lézards ou Kroxigor."
  },
  {
    category: "Skills",
    question: "Que fait 'Poursuite' ?",
    options: ["Permet de suivre un adversaire qui esquive (sur un jet de dé)", "Permet de courir après le ballon", "Donne +1 en MA", "Donne Tacle"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Présence Perturbante' ?",
    options: ["Donne un malus aux jets de passe/réception à proximité", "Empêche l'adversaire de respirer", "Fait peur aux joueurs", "Eteint les lumières"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Répulsion' ?",
    options: ["L'adversaire doit réussir un jet de dé pour pouvoir bloquer ce joueur", "Le joueur est moche", "L'adversaire recule automatiquement", "Le ballon est rejeté"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quelle compétence possède un 'Tueur de Trolls' de base ?",
    options: ["Frénésie & Intrépide", "Blocage & Esquive", "Garde & Tacle", "Esquive & Saut"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Projection' ?",
    options: ["Permet de choisir la case où l'adversaire est poussé", "Permet de lancer le ballon plus loin", "Permet de lancer un coéquipier", "Permet de prédire le futur"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Blocage de Passe' ?",
    options: ["Permet de se déplacer pendant une passe adverse", "Empêche les passes", "Intercepte automatiquement", "Tue le lanceur"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Ecrasement' ?",
    options: ["Permet de relancer un jet de blessure en tombant (anciennes règles)", "Donne +3 en Force", "Détruit le terrain", "Tue un joueur"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Tentacules' ?",
    options: ["Retient les adversaires qui tentent de s'échapper", "Permet de porter 4 objets", "Donne Agilité 1+", "Étrangle l'adversaire"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Cerveau Lent' (Really Stupid) ?",
    options: ["Le joueur oublie d'agir sur un 1-3 (sauf si coéquipier proche)", "Le joueur ne comprend pas les règles", "Le joueur ne bouge pas", "Le joueur est un Troll"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Prendre Racine' ?",
    options: ["L'Homme-Arbre peut rester bloqué au sol", "Le joueur plante un arbre", "Le joueur devient plus fort", "Le terrain change"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Gros Débilos' (Bone-Head) ?",
    options: ["Le joueur perd sa zone de tacle et son action sur un 1", "Le joueur est bête", "Le joueur tape ses amis", "Le joueur mange ses coéquipiers"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Minus' ?",
    options: ["Facilite les esquives mais rend plus fragile", "Donne +1 en Force", "Empêche de porter le ballon", "Le joueur est plus petit"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Poids Plume' ?",
    options: ["Le joueur peut être lancé par un coéquipier", "Le joueur vole", "Le joueur court sur l'eau", "Le joueur est très léger"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Solitaire' ?",
    options: ["Le joueur doit réussir un 4+ pour utiliser une relance d'équipe", "Le joueur n'a pas d'amis", "Le joueur joue seul", "Le joueur quitte le terrain"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Regenerer' ?",
    options: ["Permet de soigner une blessure grave sur un 4+", "Le joueur redevient neuf", "Donne +1 PV", "Le joueur revient au tour suivant"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Crâne Épais' ?",
    options: ["Transforme un résultat 'KO' en 'Sonné' sur un 8+", "Le joueur a la tête dure", "Donne Blocage", "Ignore les blessures"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Décomposition' ?",
    options: ["Le joueur subit deux jets de blessures graves au lieu d'un", "Le joueur sent mauvais", "Le joueur perd sa peau", "Le joueur meurt deux fois"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Regard Hypnotique' ?",
    options: ["Annule la zone de tacle d'un adversaire sur un jet réussi", "Le joueur fait de la magie", "L'adversaire s'endort", "Donne le ballon"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Lutte' ?",
    options: ["Les deux joueurs tombent sur un résultat 'Les deux à terre' sans blessure", "Le joueur gagne le blocage", "Permet de plaquer", "Donne Blocage"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Gladiature' (Juggernaut) ?",
    options: ["Transforme un 'Les deux à terre' en 'Repoussé' lors d'un Blitz", "Le joueur est un tank", "Donne +2 en FO", "Ignore Tacle"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Bras Supplémentaires' ?",
    options: ["+1 aux jets pour ramasser, gagner ou intercepter le ballon", "Permet de bloquer deux fois", "Donne +1 en Force", "Permet de jongler"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Deux Têtes' ?",
    options: ["Donne +1 aux jets d'Esquive", "Permet de voir derrière soi", "Donne +1 en Intelligence", "Double les xp"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Queue Préhensile' ?",
    options: ["Donne un malus d'esquive aux adversaires qui quittent sa zone de tacle", "Permet de tenir le ballon", "Donne +1 en Agilité", "Le joueur est un rat"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Très Longues Jambes' ?",
    options: ["+1 aux jets d'Interception et de Saut", "Permet de courir plus vite", "Ignore les nains", "Donne +2 en MA"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Peau de Pierre' ?",
    options: ["Ignore les modifications négatives d'Armure", "Le joueur est un caillou", "Donne Armure 11+", "Ne peut plus bouger"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Animal Sauvage' ?",
    options: ["Le joueur n'agit sur un 1-3 que s'il bloque ou blitz", "Le joueur mange ses coéquipiers", "Le joueur est incontrôlable", "Le joueur est un Minotaure"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Sang Froid' (Stand Firm) ?",
    options: ["Le joueur ne peut pas être poussé", "Le joueur ignore la pression", "Le joueur ne tombe jamais", "Donne Blocage"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Que fait 'Kick-Off Return' ?",
    options: ["Permet à un joueur de se déplacer de 3 cases lors du coup d'envoi", "Permet de renvoyer le ballon", "Fait plus de dégâts", "Relance le dé"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Chef de Chantier' ?",
    options: ["Donne une relance d'équipe", "Permet de construire un stade", "Aide les autres joueurs", "Donne +1 en Force"],
    correctIndex: 0,
    explanation: "Variante de Leader/Chef selon les traductions."
  },
  {
    category: "Skills",
    question: "Que fait 'Frappe Précise' (Kick) ?",
    options: ["Permet de diviser par deux la déviation du ballon au coup d'envoi", "Permet de viser les jambes", "Tue un joueur", "Donne Passe"],
    correctIndex: 0
  },
  {
    category: "Skills",
    question: "Quel est l'effet de 'Canons Brûlants' ?",
    options: ["Une règle spéciale de Star Player", "Une arme secrète", "Un bug", "Une passe de feu"],
    correctIndex: 1
  },
  {
    category: "Skills",
    question: "Que fait 'Tronçonneuse' ?",
    options: ["Effectue un jet de blessure au lieu d'un blocage", "Coupe des arbres", "Détruit le ballon", "Fait trop de bruit"],
    correctIndex: 0
  },

  // === DIVERS (50) ===
  {
    category: "Miscellaneous",
    question: "Quel est le nom du duo de commentateurs de Cabal Vision ?",
    options: ["Jim & Bob", "Tom & Jerry", "Fred & Barney", "Rick & Morty"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle divinité du Chaos est associée à Nurgle ?",
    options: ["Le Seigneur des Mouches", "Le Dieu du Sang", "Le Prince du Plaisir", "Le Maître du Changement"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est le score final d'un match si une équipe abandonne ?",
    options: ["2 - 0", "Vainqueur gagne 3-0 ou score actuel si supérieur", "0 - 0", "Match nul"],
    correctIndex: 1
  },
  {
    category: "Miscellaneous",
    question: "Combien de joueurs maximum sur le terrain par équipe ?",
    options: ["11", "12", "16", "10"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien de tours dure une mi-temps standard ?",
    options: ["8", "10", "12", "16"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Qu'est-ce qu'une 'Petite Frappe' (Snotling) ?",
    options: ["Le plus petit joueur du jeu", "Un petit orque", "Un enfant", "Un bug"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle est la boisson favorite de Bob Bifford ?",
    options: ["Bière Bloodweiser", "Eau minérale", "Jus de pomme", "Sang de gobelin"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est le prix standard d'un Apothicaire ?",
    options: ["50k", "100k", "80k", "120k"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien coûte une 'Relance d'Équipe' pour des Humains ?",
    options: ["50k", "60k", "70k", "100k"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel stade se trouve dans une crypte ?",
    options: ["The Dead End", "The Crypt", "The Bone Yard", "The Spirit Field"],
    correctIndex: 1
  },
  {
    category: "Miscellaneous",
    question: "Qui a inventé le Blood Bowl selon la légende ?",
    options: ["Roze-El", "Nuffle", "Jim Johnson", "Morg"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Comment s'appelle le ballon de Blood Bowl ?",
    options: ["The Pigskin", "The Spiked Ball", "The Squig", "The Orb"],
    correctIndex: 1
  },
  {
    category: "Miscellaneous",
    question: "Quelle équipe est connue pour ses joueurs jetables appelés 'Carcasses' ?",
    options: ["Morts-vivants", "Skavens", "Nurgle", "Khemri"],
    correctIndex: 0,
    explanation: "Les Squelettes ou Zombies sont souvent considérés comme tels."
  },
  {
    category: "Miscellaneous",
    question: "Quelle est la couleur de peau des Orques ?",
    options: ["Vert", "Rouge", "Bleu", "Jaune"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien d'XP gagne un joueur pour un Touchdown ?",
    options: ["3", "2", "5", "1"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien d'XP gagne un joueur pour une Sortie (Casualty) ?",
    options: ["2", "3", "5", "1"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien d'XP gagne un joueur pour une Interception ?",
    options: ["2", "1", "3", "5"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle est la récompense en XP pour une Passe réussie ?",
    options: ["1", "2", "3", "0"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Qui est le MVP d'un match ?",
    options: ["Un joueur choisi au hasard par le coach ou le système", "Le meilleur marqueur", "Le coach", "L'arbitre"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle est la règle spéciale des Halflings à propos du repas ?",
    options: ["Ils peuvent engager un Chef de cuisine Halfling pour voler des relances", "Ils mangent le ballon", "Ils font une pause à la mi-temps", "Ils sont toujours affamés"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est le nom du championnat majeur ?",
    options: ["The Blood Bowl", "The Chaos Cup", "The Dungeonbowl", "The Spike! Open"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien de faces a un dé standard de Blood Bowl ?",
    options: ["6", "8", "10", "12"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel symbole sur le dé de blocage signifie que les deux tombent ?",
    options: ["Both Down (Les deux à terre)", "Pow", "Push", "Skull"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel symbole signifie un succès total sur un dé de blocage ?",
    options: ["Pow", "Defender Down", "Push", "Stumble"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Que signifie 'Loner' ?",
    options: ["Solitaire", "Célibataire", "Unique", "Rapide"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien de pom-pom girls maximum peut-on avoir ?",
    options: ["12", "16", "Pas de limite théorique (mais limité par le budget)", "1"],
    correctIndex: 2
  },
  {
    category: "Miscellaneous",
    question: "Quelle race est la plus ancienne selon le 'Livre de Nuffle' ?",
    options: ["Les Hommes-Lézards", "Les Elfes", "Les Nains", "Les Humains"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est l'effet d'une météo 'Canicule' ?",
    options: ["Les joueurs peuvent s'évanouir et rater le prochain tour", "Le ballon fond", "Les joueurs courent plus vite", "On ne voit rien"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est l'effet d'une météo 'Blizzard' ?",
    options: ["Passe longue impossible et foncer est plus risqué", "Le terrain glisse", "On ne peut pas jouer", "Les joueurs gèlent"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est l'effet d'une météo 'Pluie Battante' ?",
    options: ["Malus de -1 pour ramasser le ballon", "On est mouillé", "Le ballon explose", "Le terrain devient de la boue"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est l'effet d'un 'Coup d'Envoi : Emeute' ?",
    options: ["Le temps avance ou recule d'un tour", "Les supporters descendent sur le terrain", "L'arbitre est frappé", "Le match s'arrête"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est l'effet d'un 'Coup d'Envoi : Blitz' ?",
    options: ["L'équipe qui ne botte pas peut effectuer un tour gratuit", "Tout le monde se tape", "Le ballon va plus loin", "Double score"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Qui est le dieu de l'arbitrage (ironiquement) ?",
    options: ["Nuffle", "Roze-El", "Jim", "Bob"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Comment appelle-t-on le fait de pousser un joueur hors du terrain ?",
    options: ["Crowd Surf", "Push Out", "Expulsion", "Touchdown"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est le prix d'un Fan Factor initial ?",
    options: ["10k", "50k", "Gratuit (selon édition)", "100k"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien de relances max peut-on acheter à la création d'équipe ?",
    options: ["8", "No limit", "16", "4"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est le nom de l'arbitre le plus célèbre (et corrompu) ?",
    options: ["L'arbitre gobelin", "Thor", "Zeus", "Nuffle"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Qu'est-ce qu'un 'Turnover' ?",
    options: ["La fin immédiate du tour de l'équipe active", "Une pâtisserie", "Un changement de côté", "Une faute"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle action permet de se déplacer et de bloquer ?",
    options: ["Blitz", "Block", "Pass", "Foul"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle action permet de frapper un joueur au sol ?",
    options: ["Agression (Foul)", "Blitz", "Block", "Saut"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien d'agressions autorisées par tour ?",
    options: ["1", "Illimité", "2", "0"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien de Blitz par tour ?",
    options: ["1", "2", "3", "Autant que de joueurs"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien de passes par tour ?",
    options: ["1", "2", "Illimité", "0"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Comment s'appelle la monnaie du jeu ?",
    options: ["Pièces d'Or (PO)", "Crédits", "Euros", "Nuffloins"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle équipe joue avec des 'Centaure-Taureaux' ?",
    options: ["Nains du Chaos", "Chaos", "Orques", "Centaures"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quelle équipe possède des 'Coureurs d'Egouts' ?",
    options: ["Skavens", "Gnomes", "Humains", "Goblins"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Combien de jours dure le Quizz dans notre système ?",
    options: ["Tous les jours", "Seulement le weekend", "Une fois par mois", "Le lundi"],
    correctIndex: 0,
    explanation: "C'est un quizz quotidien !"
  },
  {
    category: "Miscellaneous",
    question: "Quelle est la règle spéciale 'Always Hungry' ?",
    options: ["Toujours affamé (le joueur peut manger son coéquipier)", "Le joueur veut gagner", "Le joueur mange le ballon", "Donne +1 en Force"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est le score max d'Armure (AR) ?",
    options: ["11+", "12+", "10+", "9+"],
    correctIndex: 0
  },
  {
    category: "Miscellaneous",
    question: "Quel est le score min de Force (FO) ?",
    options: ["1", "0", "2", "3"],
    correctIndex: 0
  }
];
