/**
 * Lecture du formulaire de tournoi (carte 201), commune à la création (`createTopic`) et à la modification
 * (`updateTournament`) dans `app/forum/actions.ts`.
 *
 * Avant cette carte, la quarantaine de champs était lue deux fois, et les copies avaient divergé : l'édition du jeu
 * valait « BB2025 » par défaut à la création mais restait vide à la modification (même écart pour la plateforme), et
 * la recherche des coordonnées de l'adresse n'existait qu'à la création. Les deux actions appellent maintenant
 * `readTournamentForm`, puis ajoutent ce qui leur est propre (organisateur, statut CDF, commissaires).
 *
 * `readTournamentForm` est pure (testée par `tests/unit/tournamentForm.test.mjs`). `geocodeAddress` interroge le
 * service Nominatim d'OpenStreetMap ; la fonction d'appel au réseau lui est passée en paramètre, pour pouvoir la
 * remplacer dans un test.
 */
import { tournamentDatesError } from "@/lib/tournamentDates";

/** Champs du tournoi lus dans le formulaire, identiques à la création et à la modification. */
export interface TournamentFormFields {
  date: Date;
  endDate: Date;
  days: string;
  location: string;
  address: string | null;
  gmapsUrl: null;
  ville: string | null;
  departement: string | null;
  region: string | null;
  regionNAF: string | null;
  lat: number | null;
  lng: number | null;
  maxParticipants: number | null;
  isTeam: boolean;
  coachsPerTeam: number;
  price: number | null;
  priceMeals: number | null;
  priceLodging: number | null;
  totalMatches: number | null;
  structure: string | null;
  ruleset: string | null;
  gameEdition: string;
  platform: string;
  tournamentType: string;
  mealsIncluded: boolean;
  lodgingAtVenue: boolean;
  fridayArrival: boolean;
  isNAF: boolean;
  isCGO: boolean;
  isTGE: boolean;
  isTSC: boolean;
  ligueId: string | null;
  ligueCustom: string | null;
}

/** Ce que le formulaire demande en plus, que chaque action traite selon ses règles. */
export interface TournamentFormRequests {
  /** Case « Coupe de France » cochée (seuls les modérateurs peuvent la changer, carte 162). */
  wantsCdf: boolean;
  /** Type de classement CDF envoyé par le formulaire, ou rien. */
  typeCDF: string | null;
  /** Commissaires choisis (identifiants de membres). */
  commissaireIds: string[];
}

export const DEFAULT_GAME_EDITION = "BB2025";
export const DEFAULT_PLATFORM = "Tabletop";
export const DEFAULT_TOURNAMENT_TYPE = "SWISS";

/** Texte d'un champ, sans espaces autour, ou `null` s'il est vide. */
function text(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function int(formData: FormData, name: string): number | null {
  const value = Number.parseInt(text(formData, name) ?? "", 10);
  return Number.isFinite(value) ? value : null;
}

function float(formData: FormData, name: string): number | null {
  const value = Number.parseFloat(text(formData, name) ?? "");
  return Number.isFinite(value) ? value : null;
}

/** Nombre de jours du tournoi, du premier au dernier jour compris. */
export function tournamentDays(startDate: Date, endDate: Date): number {
  return Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Lit et valide le formulaire de tournoi. Refuse un tournoi sans date de début, ou dont la date de fin précède la date
 * de début (carte 187). Les prix et nombres vides ou illisibles valent `null` ; un nombre maximal de participants à 0
 * aussi (tournoi sans limite), comme avant.
 */
export function readTournamentForm(formData: FormData): { error: string } | { fields: TournamentFormFields; requests: TournamentFormRequests } {
  const startText = text(formData, "tDate");
  if (!startText) return { error: "La date de début du tournoi est obligatoire." };
  const date = new Date(startText);
  const endText = text(formData, "tEndDate");
  const endDate = endText ? new Date(endText) : date;
  const datesError = tournamentDatesError(date, endDate);
  if (datesError) return { error: datesError };

  const isTeam = formData.get("isTeam") === "on";
  const address = text(formData, "tAddress");
  const wantsCdf = formData.get("isCDF") === "on";

  return {
    fields: {
      date,
      endDate,
      days: tournamentDays(date, endDate).toString(),
      location: address ?? "Lieu non précisé",
      address,
      gmapsUrl: null,
      ville: text(formData, "tVille"),
      departement: text(formData, "tDept"),
      region: text(formData, "tRegion"),
      regionNAF: text(formData, "tRegionNAF"),
      lat: float(formData, "tLat"),
      lng: float(formData, "tLng"),
      maxParticipants: int(formData, "tMax") || null,
      isTeam,
      coachsPerTeam: isTeam ? Math.max(2, int(formData, "tCoachsPerTeam") || 2) : 1,
      price: float(formData, "tPrice") || null,
      priceMeals: float(formData, "tPriceMeals") || null,
      priceLodging: float(formData, "tPriceLodging") || null,
      totalMatches: int(formData, "tTotalMatches") || null,
      structure: text(formData, "tStructure"),
      ruleset: text(formData, "tRuleset"),
      gameEdition: text(formData, "tGame") ?? DEFAULT_GAME_EDITION,
      platform: text(formData, "tPlatform") ?? DEFAULT_PLATFORM,
      tournamentType: text(formData, "tournamentType") ?? DEFAULT_TOURNAMENT_TYPE,
      mealsIncluded: formData.get("tMeals") === "on",
      lodgingAtVenue: formData.get("tLodging") === "on",
      fridayArrival: formData.get("tFriday") === "on",
      isNAF: formData.get("isNAF") === "on",
      isCGO: formData.get("isCGO") === "on",
      isTGE: formData.get("isTGE") === "on",
      isTSC: formData.get("isTSC") === "on",
      ligueId: text(formData, "ligueId"),
      ligueCustom: text(formData, "ligueCustom"),
    },
    requests: {
      wantsCdf,
      typeCDF: text(formData, "typeCDF"),
      commissaireIds: (text(formData, "commissaireIds") ?? "").split(",").map((id) => id.trim()).filter(Boolean),
    },
  };
}

/**
 * Coordonnées d'une adresse, demandées au service Nominatim d'OpenStreetMap, ou `null` si elle est introuvable ou si
 * le service ne répond pas (le tournoi est alors enregistré sans position sur la carte).
 */
export async function geocodeAddress(
  query: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ lat: number; lng: number } | null> {
  if (!query.trim()) return null;
  try {
    const response = await fetchImpl(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=1`, {
      headers: { "User-Agent": "BBFrance-App" },
    });
    const results: { lat: string; lon: string }[] = await response.json();
    if (!results?.length) return null;
    const lat = Number.parseFloat(results[0].lat);
    const lng = Number.parseFloat(results[0].lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch (error) {
    console.error("Tournament geocoding error:", error);
    return null;
  }
}

/** Ajoute les coordonnées de l'adresse aux champs lus, si le formulaire n'en donnait pas. */
export async function withCoordinates(fields: TournamentFormFields, fetchImpl: typeof fetch = fetch): Promise<TournamentFormFields> {
  if (fields.lat !== null && fields.lng !== null) return fields;
  const found = await geocodeAddress(`${fields.address ?? ""} ${fields.ville ?? ""}`, fetchImpl);
  return found ? { ...fields, ...found } : fields;
}
