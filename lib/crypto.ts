import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12; // GCM recommended IV length
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "bbfrance_default_secret_encryption_key_32_chars_long!!";

/**
 * Chiffre un texte en utilisant AES-256-GCM
 * Format de sortie : v1.hex_iv.hex_tag.hex_ciphertext
 */
export function encrypt(text: string): string {
  if (!text) return "";
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY.slice(0, KEY_LENGTH)), 
    iv
  );
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `v1.${iv.toString("hex")}.${authTag}.${encrypted}`;
}

/**
 * Déchiffre un texte chiffré par la fonction encrypt
 * Si le format ne correspond pas à v1, retourne le texte brut (compatibilité)
 */
export function decrypt(data: string): string {
  if (!data || !data.startsWith("v1.")) return data;

  try {
    const parts = data.split(".");
    if (parts.length !== 4) return data;

    const [, ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY.slice(0, KEY_LENGTH)), 
      iv
    );
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted as any, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Erreur de déchiffrement :", error);
    return "[Message illisible ou erreur de clé]";
  }
}
