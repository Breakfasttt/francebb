/**
 * Profil du coach dans le hub (carte 119, ADR-0007) : vérification des données, unicité du pseudo, forme publique.
 * - L'identifiant (`id`, transmis comme `sub`) est fixe et sert aux applications à rattacher leurs données.
 * - Le pseudo (`name`) est modifiable et unique sans tenir compte des majuscules (`nameKey`).
 * - Un pseudo supprimé reste réservé : seule son empreinte est gardée (table reservedName, carte 123).
 */
import { prisma } from "./prisma.mjs";
import { auditHash } from "./audit.mjs";

export const NAME_MIN = 2;
export const NAME_MAX = 32;
const REGION_MAX = 60;
const IMAGE_MAX = 500;
const TIMEZONES = new Set(Intl.supportedValuesOf("timeZone"));

export type ProfileUpdate = {
  name?: string;
  image?: string | null;
  naf?: string | null;
  region?: string | null;
  locale?: string | null;
  timezone?: string | null;
};

/** Pseudo nettoyé : espaces en trop retirés, caractères Unicode ramenés à une forme unique. */
export function cleanName(name: string) {
  return name.normalize("NFKC").replace(/\s+/g, " ").trim();
}

/** Clé d'unicité du pseudo : en minuscules, pour que « Nuffle » et « nuffle » soient le même pseudo. */
export function nameKeyOf(name: string) {
  return cleanName(name).toLocaleLowerCase("fr");
}

/** Vrai si le pseudo n'est porté par aucun autre compte et n'a pas été réservé par une suppression. */
export async function isNameAvailable(name: string, exceptUserId?: string) {
  const nameKey = nameKeyOf(name);
  const owner = await prisma.user.findUnique({ where: { nameKey }, select: { id: true } });
  if (owner && owner.id !== exceptUserId) return false;
  const reserved = await prisma.reservedName.findUnique({ where: { nameHash: auditHash(nameKey) ?? "" } });
  return !reserved;
}

/**
 * Pseudo libre le plus proche, pour un compte créé par Discord ou Google dont le pseudo est déjà pris :
 * « Nuffle », puis « Nuffle 2 », « Nuffle 3 »…
 */
export async function uniqueNameFor(name: string) {
  const base = cleanName(name).slice(0, NAME_MAX - 4) || "Coach";
  if (base.length >= NAME_MIN && (await isNameAvailable(base))) return base;
  for (let suffix = 2; ; suffix++) {
    const candidate = `${base} ${suffix}`;
    if (await isNameAvailable(candidate)) return candidate;
  }
}

const textOrNull = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value.trim() : null);

/**
 * Vérifie une demande de modification du profil. Renvoie les données propres, ou un message d'erreur par champ.
 * Seuls les champs présents dans la demande sont modifiés ; `null` ou une chaîne vide efface un champ facultatif.
 */
export function validateProfileUpdate(body: unknown): { data: ProfileUpdate } | { errors: Record<string, string> } {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { errors: { body: "Le corps de la demande doit être un objet JSON." } };
  const input = body as Record<string, unknown>;
  const data: ProfileUpdate = {};
  const errors: Record<string, string> = {};

  const allowed = new Set(["name", "image", "naf", "region", "locale", "timezone"]);
  for (const key of Object.keys(input)) if (!allowed.has(key)) errors[key] = "Champ inconnu ou non modifiable.";

  if ("name" in input) {
    const name = typeof input.name === "string" ? cleanName(input.name) : "";
    if (name.length < NAME_MIN || name.length > NAME_MAX) errors.name = `Le pseudo doit faire entre ${NAME_MIN} et ${NAME_MAX} caractères.`;
    else if (/\p{C}/u.test(name)) errors.name = "Le pseudo contient des caractères invisibles.";
    else data.name = name;
  }
  if ("image" in input) {
    const image = textOrNull(input.image);
    if (image && (image.length > IMAGE_MAX || !/^https:\/\//.test(image))) errors.image = "L'avatar doit être une adresse https.";
    else data.image = image;
  }
  if ("naf" in input) {
    const naf = textOrNull(input.naf);
    if (naf && !/^\d{1,10}$/.test(naf)) errors.naf = "Le numéro NAF ne contient que des chiffres (10 au plus).";
    else data.naf = naf;
  }
  if ("region" in input) {
    const region = textOrNull(input.region);
    if (region && region.length > REGION_MAX) errors.region = `La région fait ${REGION_MAX} caractères au plus.`;
    else data.region = region;
  }
  if ("locale" in input) {
    const locale = textOrNull(input.locale);
    if (locale && !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) errors.locale = "Langue attendue au format « fr » ou « fr-FR ».";
    else data.locale = locale;
  }
  if ("timezone" in input) {
    const timezone = textOrNull(input.timezone);
    if (timezone && !TIMEZONES.has(timezone)) errors.timezone = "Fuseau horaire inconnu (exemple : « Europe/Paris »).";
    else data.timezone = timezone;
  }
  return Object.keys(errors).length ? { errors } : { data };
}

/** Forme publique du profil, renvoyée par /api/v1/profile. Ni email, ni données de connexion. */
export function publicProfile(user: Record<string, unknown>) {
  return {
    id: user.id,
    name: user.name,
    image: user.image ?? null,
    naf: user.naf ?? null,
    region: user.region ?? null,
    locale: user.locale ?? null,
    timezone: user.timezone ?? null,
    memberSince: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  };
}
