/**
 * Utilitaires pour le système de Quizz Blood Bowl.
 */

/**
 * Traduit les catégories de l'anglais vers le français.
 */
export function translateCategory(category: string): string {
  if (!category) return "Autre";
  
  const mapping: Record<string, string> = {
    "rules": "Règles",
    "rosters": "Équipes",
    "positionals": "Positionnels",
    "starplayers": "Star Players",
    "star player": "Star Players",
    "skills": "Compétences",
    "divers": "Autre",
    "miscellaneous": "Autre",
    "misc": "Autre",
    "other": "Autre"
  };

  const key = String(category).trim().toLowerCase();
  
  // Recherche directe ou recherche partielle
  if (mapping[key]) return mapping[key];
  
  // Fallbacks basés sur le contenu
  if (key.includes("rule")) return "Règles";
  if (key.includes("roster")) return "Équipes";
  if (key.includes("skill")) return "Compétences";
  if (key.includes("star")) return "Star Players";
  if (key.includes("misc") || key.includes("divers") || key.includes("other")) return "Autre";

  return category;
}
