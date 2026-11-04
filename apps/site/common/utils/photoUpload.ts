/**
 * Envoi de photos depuis l'éditeur de messages (carte 184) : balise de galerie pour plusieurs photos, texte de la
 * progression, messages d'échec et réduction d'une photo trop grande avant l'envoi. La réduction se fait dans le
 * navigateur avec un `canvas` (zone de dessin du navigateur), sans bibliothèque : la photo est ramenée à 2000 pixels
 * au plus de côté et réenregistrée en JPEG.
 * Les règles pures sont vérifiées par `tests/unit/photoUpload.test.mjs` : ce fichier n'importe rien du projet, la
 * limite de taille lui est donc passée en paramètre (`IMAGE_UPLOAD_MAX_BYTES` de `imageUploadLimits.ts`).
 */

/** Plus grand côté d'une photo réduite, en pixels. */
export const PHOTO_MAX_SIDE = 2000;

/** Qualité du JPEG d'une photo réduite (de 0 à 1) : 0,85 garde une photo nette pour un poids bien moindre. */
export const PHOTO_JPEG_QUALITY = 0.85;

/** Formats acceptés tels quels par l'hébergeur d'images (voir `app/imageUploadActions.ts`). */
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** Balise BBCode d'une galerie (`[gallery]adresse1,adresse2[/gallery]`, lue par `lib/bbcode.ts`). */
export function galleryTag(urls: string[]): string {
  return `[gallery]${urls.join(",")}[/gallery]`;
}

/** Texte affiché pendant l'envoi : « Envoi 2 sur 4… », ou « Envoi en cours… » pour une seule photo. */
export function uploadProgressLabel(current: number, total: number): string {
  return total > 1 ? `Envoi ${current} sur ${total}…` : "Envoi en cours…";
}

/** Message d'échec quand certaines photos d'un envoi groupé n'ont pas pu partir, avec la première raison. */
export function photoFailureMessage(failed: number, total: number, firstError: string): string {
  if (total <= 1) return firstError;
  const what = failed > 1 ? `${failed} photos sur ${total} n'ont pas pu être envoyées` : `1 photo sur ${total} n'a pas pu être envoyée`;
  return `${what} : ${firstError}`;
}

/** Dimensions ramenées pour que le plus grand côté ne dépasse pas `maxSide`, proportions gardées. */
export function fitWithin(width: number, height: number, maxSide: number): { width: number; height: number } {
  const largest = Math.max(width, height);
  if (largest <= maxSide) return { width, height };
  const ratio = maxSide / largest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

/**
 * Faut-il réduire cette photo avant l'envoi ? Jamais un GIF (il perdrait son animation). Toujours une photo trop
 * lourde, ou d'un format que l'hébergeur refuse (une photo HEIC d'iPhone, si le navigateur sait la lire). Un PNG
 * sous la limite est gardé (le JPEG perdrait sa transparence). Sinon, seulement une photo de plus de 2000 pixels.
 */
export function shouldShrinkPhoto(photo: { type: string; size: number; width: number; height: number }, maxBytes: number): boolean {
  if (photo.type === "image/gif") return false;
  if (photo.size > maxBytes || !ACCEPTED_TYPES.has(photo.type)) return true;
  if (photo.type === "image/png") return false;
  return Math.max(photo.width, photo.height) > PHOTO_MAX_SIDE;
}

/** Nom du fichier réduit : même nom, extension `.jpg`. */
export function jpegFileName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "photo"}.jpg`;
}

/**
 * Renvoie la photo réduite (JPEG, 2000 pixels au plus de côté) quand c'est utile, sinon le fichier d'origine.
 * Ne lève jamais d'erreur : si le navigateur ne sait pas lire la photo, elle part telle quelle et l'hébergeur
 * répondra s'il la refuse.
 */
export async function shrinkPhoto(file: File, maxBytes: number): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  try {
    if (!shouldShrinkPhoto({ type: file.type, size: file.size, width: bitmap.width, height: bitmap.height }, maxBytes)) return file;
    const { width, height } = fitWithin(bitmap.width, bitmap.height, PHOTO_MAX_SIDE);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    // Le JPEG n'a pas de transparence : les zones transparentes deviennent blanches au lieu de noires
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", PHOTO_JPEG_QUALITY));
    if (!blob) return file;
    // Une photo déjà légère et acceptée que la réduction alourdirait part telle quelle
    if (blob.size >= file.size && file.size <= maxBytes && ACCEPTED_TYPES.has(file.type)) return file;
    return new File([blob], jpegFileName(file.name), { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}
