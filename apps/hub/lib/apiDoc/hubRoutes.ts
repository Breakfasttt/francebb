/**
 * Description OpenAPI des routes propres au hub (hors `/api/auth`, qui est décrit par Better Auth).
 * Règle (apps/hub/CLAUDE.md) : toute nouvelle route publique du hub ajoute ici sa description.
 * Le test tests/api/doc.spec.ts échoue si une route de `app/api` n'y figure pas.
 */

type OpenApiPaths = Record<string, Record<string, unknown>>;

// Profil public du coach, renvoyé par /api/v1/profile (lib/profile.ts, publicProfile)
const profileSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: "Identifiant du coach : unique, jamais modifié, jamais affiché. Même valeur que `sub` dans les jetons. Les applications rattachent leurs données à cet identifiant." },
    name: { type: "string", description: "Pseudo (nom de coach), affiché et modifiable. Unique sans tenir compte des majuscules." },
    image: { type: ["string", "null"], description: "Adresse https de l'avatar." },
    naf: { type: ["string", "null"], description: "Numéro NAF déclaré par le coach (chiffres). Jamais vérifié par le hub." },
    region: { type: ["string", "null"], description: "Région, en texte libre." },
    locale: { type: ["string", "null"], description: "Langue, par exemple « fr »." },
    timezone: { type: ["string", "null"], description: "Fuseau horaire, par exemple « Europe/Paris »." },
    memberSince: { type: "string", format: "date-time", description: "Date d'inscription au hub." },
  },
};

const errorSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    code: { type: "string" },
    errors: { type: "object", additionalProperties: { type: "string" }, description: "Message d'erreur par champ." },
  },
};

const profileSecurity = [{ bearerAuth: [] }, { apiKeyCookie: [] }];

/**
 * Événements signés envoyés par le hub aux applications (carte 121, lib/events.mjs), décrits dans la partie
 * `webhooks` d'OpenAPI 3.1 : ce sont des requêtes que l'application reçoit, pas des routes du hub.
 */
const eventHeaders = [
  { name: "X-BBFrance-Event-Id", in: "header", required: true, schema: { type: "string" }, description: "Identifiant unique de l'événement : ignorer un identifiant déjà traité." },
  { name: "X-BBFrance-Timestamp", in: "header", required: true, schema: { type: "string" }, description: "Date d'envoi en secondes : refuser un envoi de plus de 5 minutes." },
  {
    name: "X-BBFrance-Signature",
    in: "header",
    required: true,
    schema: { type: "string" },
    description: "« v1=<empreinte> » : HMAC SHA-256, en hexadécimal, de « <timestamp>.<corps brut> » avec le secret d'événements de l'application. Code de vérification de référence : apps/hub/lib/verifyEvent.mjs.",
  },
];

function eventOperation(type: string, summary: string, data: Record<string, unknown>) {
  return {
    post: {
      tags: ["Événements"],
      operationId: type.replace(".", "_"),
      summary,
      description:
        "Envoyé en POST à l'adresse d'événements de l'application (scripts/client-hooks.mjs), seulement pour un coach que l'application connaît déjà. Répondre 2xx pour accuser réception ; sinon le hub renvoie l'événement plus tard (1 min, 5 min, 30 min, 2 h, puis toutes les 12 h, 10 essais au plus). Ignorer les champs inconnus : la version ne change que si un champ disparaît ou change de sens.",
      parameters: eventHeaders,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", const: type },
                version: { type: "integer", const: 1 },
                createdAt: { type: "string", format: "date-time" },
                data: { type: "object", properties: { userId: { type: "string", description: "Identifiant du coach (le `sub` des jetons)." }, ...data } },
              },
            },
          },
        },
      },
      responses: { "2XX": { description: "Accusé de réception." } },
    },
  };
}

export const hubWebhooks = {
  "user.updated": eventOperation("user.updated", "Le profil d'un coach a changé (ou son bannissement a été levé)", {
    profile: { ...profileSchema, description: "Profil complet après la modification (absent quand seul le bannissement change)." },
    banned: { type: "boolean", const: false },
  }),
  "user.banned": eventOperation("user.banned", "Un coach est banni de toutes les applications : couper son accès tout de suite", {
    banned: { type: "boolean", const: true },
  }),
};

const sessionOnly = [{ apiKeyCookie: [] }];

export const hubRoutes: OpenApiPaths = {
  "/api/v1/applications": {
    get: {
      tags: ["Passeport"],
      operationId: "listApplications",
      summary: "Applications qui ont accès au compte du coach",
      description: "Réservé aux pages du passeport (session du coach sur le hub) : une application ne voit pas les autres.",
      security: sessionOnly,
      responses: {
        "200": {
          description: "Liste des applications.",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { type: "object", properties: { clientId: { type: "string" }, name: { type: "string" }, scopes: { type: "array", items: { type: "string" } } } },
              },
            },
          },
        },
        "401": { description: "Pas de session sur le hub.", content: { "application/json": { schema: errorSchema } } },
      },
    },
  },
  "/api/v1/applications/revoke": {
    post: {
      tags: ["Passeport"],
      operationId: "revokeApplication",
      summary: "Retirer l'accès d'une application au compte du coach",
      description: "Réservé aux pages du passeport. Les jetons de l'application sont révoqués et son consentement effacé : elle devra redemander la connexion.",
      security: sessionOnly,
      requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["clientId"], properties: { clientId: { type: "string" } } } } } },
      responses: {
        "200": { description: "Accès retiré.", content: { "application/json": { schema: { type: "object", properties: { revoked: { type: "string" } } } } } },
        "400": { description: "clientId manquant.", content: { "application/json": { schema: errorSchema } } },
        "401": { description: "Pas de session sur le hub.", content: { "application/json": { schema: errorSchema } } },
      },
    },
  },
  "/api/v1/profile": {
    get: {
      tags: ["Passeport"],
      operationId: "getProfile",
      summary: "Lire le profil du coach connecté",
      description:
        "Avec le jeton d'accès du coach (`Authorization: Bearer …`) et la portée `bbfrance:profile`, ou avec la session du coach sur le hub. Les mêmes informations arrivent aussi dans l'id_token et par `/api/auth/oauth2/userinfo` (`naf`, `region`, `locale`, `zoneinfo`, `member_since`).",
      security: profileSecurity,
      responses: {
        "200": { description: "Profil du coach.", content: { "application/json": { schema: profileSchema } } },
        "401": { description: "Jeton absent, expiré ou révoqué.", content: { "application/json": { schema: errorSchema } } },
        "403": { description: "Portée `bbfrance:profile` manquante, ou compte suspendu.", content: { "application/json": { schema: errorSchema } } },
      },
    },
    patch: {
      tags: ["Passeport"],
      operationId: "updateProfile",
      summary: "Modifier le profil du coach connecté",
      description:
        "Une application peut proposer sa propre interface de profil et envoyer ici les modifications. Il faut le jeton d'accès du coach avec la portée `bbfrance:profile:write`, ou la session du coach sur le hub. Seuls les champs envoyés changent ; `null` efface un champ facultatif. Le hub prévient ensuite toutes les applications (événement `user.updated`).",
      security: profileSecurity,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string", minLength: 2, maxLength: 32 },
                image: { type: ["string", "null"], description: "Adresse https." },
                naf: { type: ["string", "null"], pattern: "^\\d{1,10}$" },
                region: { type: ["string", "null"], maxLength: 60 },
                locale: { type: ["string", "null"], example: "fr" },
                timezone: { type: ["string", "null"], example: "Europe/Paris" },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Profil modifié.", content: { "application/json": { schema: profileSchema } } },
        "400": { description: "Données invalides (`code: INVALID_PROFILE`, détail par champ dans `errors`).", content: { "application/json": { schema: errorSchema } } },
        "401": { description: "Jeton absent, expiré ou révoqué.", content: { "application/json": { schema: errorSchema } } },
        "403": { description: "Portée `bbfrance:profile:write` manquante, ou compte suspendu.", content: { "application/json": { schema: errorSchema } } },
        "409": { description: "Pseudo déjà pris (`code: NAME_TAKEN`).", content: { "application/json": { schema: errorSchema } } },
      },
    },
  },
  "/api/doc": {
    get: {
      tags: ["Documentation"],
      operationId: "getApiDoc",
      summary: "Documentation de l'API du hub",
      description:
        "Renvoie la description complète de l'API du hub au format OpenAPI 3.1. Avec le paramètre `route`, ne renvoie que la description de cette route.",
      security: [],
      parameters: [
        {
          name: "route",
          in: "query",
          required: false,
          description: "Chemin d'une route, par exemple `/api/auth/oauth2/userinfo`. Sans ce paramètre, toute l'API est décrite.",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": { description: "Description OpenAPI de l'API, ou de la seule route demandée.", content: { "application/json": { schema: { type: "object" } } } },
        "404": {
          description: "Route inconnue. La réponse liste les routes existantes.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { error: { type: "string" }, routes: { type: "array", items: { type: "string" } } },
              },
            },
          },
        },
      },
    },
  },
};
