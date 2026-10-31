/**
 * Plugins Better Auth du hub, partagés entre la config runtime (lib/auth.ts) et le générateur de schéma
 * (scripts/generate-schema.mjs) : un plugin ajouté ici ajoute ses tables au schéma.
 * - jwt : clés de signature (JWKS) des id_token OIDC.
 * - magicLink : connexion par lien envoyé par email.
 * - oauthProvider : le hub devient fournisseur OIDC pour le site, bbscheme et les futures apps.
 * - admin : bannissement global (un compte banni ne peut plus se connecter à aucune application, carte 037).
 * - hubTables : tables propres au hub : journal d'audit (lib/audit.mjs, carte 118), pseudos réservés (carte 119),
 *   adresses des applications et événements à leur envoyer (lib/events.mjs, carte 121).
 *
 * Profil du coach (carte 119, ADR-0007) : champs ajoutés à la table user (userAdditionalFields), transmis aux
 * applications sous la portée `bbfrance:profile`, modifiables seulement par /api/v1/profile (lib/passportPlugin.ts).
 */
import { admin, jwt, magicLink } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { hashClientSecret } from "./clientSecret.mjs";

/**
 * Limite du nombre de requêtes, stockée dans la base (carte 118) : en mémoire, chaque serveur Vercel aurait sa propre
 * limite et elle ne protégerait rien. Active en production, ou en test avec HUB_RATE_LIMIT=1.
 * Partagée avec le générateur de schéma, qui en déduit la table `rateLimit`.
 */
export const rateLimitOptions = {
  enabled: process.env.NODE_ENV === "production" || process.env.HUB_RATE_LIMIT === "1",
  storage: /** @type {const} */ ("database"),
};

/** Portées propres au passeport : lire le profil du coach, et le modifier depuis l'application. */
export const PROFILE_SCOPE = "bbfrance:profile";
export const PROFILE_WRITE_SCOPE = "bbfrance:profile:write";

/**
 * Champs du profil ajoutés à la table user. `input: false` : Better Auth ne les accepte jamais d'un formulaire ;
 * ils passent par /api/v1/profile, qui les vérifie (lib/profile.ts). Le pseudo est le champ `name` de Better Auth ;
 * `nameKey` est sa forme en minuscules, unique, qui empêche deux pseudos identiques à la casse près.
 */
export const userAdditionalFields = {
  nameKey: { type: /** @type {const} */ ("string"), required: false, unique: true, input: false },
  naf: { type: /** @type {const} */ ("string"), required: false, input: false },
  region: { type: /** @type {const} */ ("string"), required: false, input: false },
  locale: { type: /** @type {const} */ ("string"), required: false, input: false },
  timezone: { type: /** @type {const} */ ("string"), required: false, input: false },
  // Suppression demandée (carte 123) : date d'effacement prévue, rappel envoyé, événement user.deleted en cours
  deletionScheduledAt: { type: /** @type {const} */ ("date"), required: false, input: false },
  deletionReminderSentAt: { type: /** @type {const} */ ("date"), required: false, input: false },
  deletionEventId: { type: /** @type {const} */ ("string"), required: false, input: false },
};

/**
 * Informations du profil envoyées dans le jeton et par userinfo quand la portée `bbfrance:profile` est accordée.
 * `locale` et `zoneinfo` sont des noms standard d'OIDC ; le NAF est toujours « déclaré » par le coach, jamais vérifié.
 * @param {Record<string, unknown>} user
 * @param {string[]} scopes
 */
export function profileClaims(user, scopes) {
  if (!scopes.includes(PROFILE_SCOPE)) return {};
  const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(String(user.createdAt));
  return {
    naf: user.naf ?? null,
    region: user.region ?? null,
    locale: user.locale ?? null,
    zoneinfo: user.timezone ?? null,
    member_since: createdAt.toISOString(),
  };
}

// Plugin sans route qui déclare seulement des tables propres au hub, pour que le générateur de schéma les crée
const hubTables = {
  id: "bbfrance-hub-tables",
  schema: {
    // Empreintes des pseudos supprimés : un pseudo supprimé ne peut pas être repris (carte 123)
    reservedName: {
      fields: {
        nameHash: { type: /** @type {const} */ ("string"), required: true, unique: true },
        createdAt: { type: /** @type {const} */ ("date"), required: true },
      },
    },
    // Empreintes des emails des comptes bannis puis supprimés : un banni ne peut pas revenir en recréant un compte
    bannedEmail: {
      fields: {
        emailHash: { type: /** @type {const} */ ("string"), required: true, unique: true },
        createdAt: { type: /** @type {const} */ ("date"), required: true },
      },
    },
    // Adresses où le hub prévient une application cliente (événements) et lui demande les données d'un coach (export),
    // avec le secret de signature, chiffré par BETTER_AUTH_SECRET. Une ligne par application (scripts/client-hooks.mjs)
    clientHook: {
      fields: {
        clientId: { type: /** @type {const} */ ("string"), required: true, unique: true },
        eventsUrl: { type: /** @type {const} */ ("string"), required: false },
        exportUrl: { type: /** @type {const} */ ("string"), required: false },
        secret: { type: /** @type {const} */ ("string"), required: true },
        createdAt: { type: /** @type {const} */ ("date"), required: true },
      },
    },
    // Un événement à envoyer à une application : gardé jusqu'à son accusé de réception, renvoyé en cas d'échec
    outboundEvent: {
      fields: {
        eventId: { type: /** @type {const} */ ("string"), required: true, index: true },
        clientId: { type: /** @type {const} */ ("string"), required: true, index: true },
        type: { type: /** @type {const} */ ("string"), required: true },
        version: { type: /** @type {const} */ ("number"), required: true },
        payload: { type: /** @type {const} */ ("json"), required: true },
        status: { type: /** @type {const} */ ("string"), required: true, index: true },
        attempts: { type: /** @type {const} */ ("number"), required: true },
        nextAttemptAt: { type: /** @type {const} */ ("date"), required: true },
        lastError: { type: /** @type {const} */ ("string"), required: false },
        createdAt: { type: /** @type {const} */ ("date"), required: true },
        deliveredAt: { type: /** @type {const} */ ("date"), required: false },
      },
    },
    auditLog: {
      fields: {
        action: { type: /** @type {const} */ ("string"), required: true },
        userHash: { type: /** @type {const} */ ("string"), required: false, index: true },
        ipHash: { type: /** @type {const} */ ("string"), required: false },
        createdAt: { type: /** @type {const} */ ("date"), required: true, index: true },
      },
    },
  },
};

/**
 * @param {{ sendMagicLink: (data: { email: string, url: string }) => Promise<void> }} options
 * @returns {[ReturnType<typeof jwt>, ReturnType<typeof magicLink>, ReturnType<typeof oauthProvider>, ReturnType<typeof admin>, typeof hubTables]}
 * Tuple explicite : sans lui, TypeScript perd le type de chaque plugin et `auth.api` n'expose plus leurs endpoints.
 */
export function authPlugins({ sendMagicLink }) {
  return [
    // Nouvelle clé de signature tous les 90 jours ; l'ancienne reste publiée 30 jours pour vérifier les jetons déjà émis
    jwt({ jwks: { rotationInterval: 60 * 60 * 24 * 90, gracePeriod: 60 * 60 * 24 * 30 } }),
    magicLink({ sendMagicLink }),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/consent",
      scopes: ["openid", "profile", "email", "offline_access", PROFILE_SCOPE, PROFILE_WRITE_SCOPE],
      storeClientSecret: { hash: hashClientSecret },
      // Le plugin ne met les claims profil/email que dans /userinfo ; Auth.js (site) lit l'id_token :
      // on y copie pseudo, avatar et email vérifié selon les scopes accordés (OIDC Core §5.4)
      customIdTokenClaims: ({ user, scopes }) => ({
        ...(scopes.includes("profile") ? { name: user.name, picture: user.image ?? undefined } : {}),
        ...(scopes.includes("email") ? { email: user.email, email_verified: user.emailVerified } : {}),
        ...profileClaims(user, scopes),
      }),
      customUserInfoClaims: ({ user, scopes }) => profileClaims(user, scopes),
    }),
    admin({ bannedUserMessage: "Ce compte BBFrance a été suspendu." }),
    hubTables,
  ];
}
