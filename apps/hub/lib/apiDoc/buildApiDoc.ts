/**
 * Construit la documentation OpenAPI du hub servie par GET /api/doc (carte 117, ADR-0007).
 * - Les routes de connexion (`/api/auth/*`) viennent du plugin `openAPI()` de Better Auth.
 * - Les routes propres au hub viennent de `hubRoutes.ts`.
 * - Les routes d'administration, de développement ou désactivées sont retirées : la documentation est publique.
 * - Seuls les schémas réellement cités sont gardés, pour ne pas décrire les tables internes (comptes, secrets des clients).
 */
import { auth } from "@/lib/auth";
import { hubRoutes, hubWebhooks } from "./hubRoutes";

type OpenApiDocument = {
  openapi: string;
  info: Record<string, unknown>;
  servers: { url: string }[];
  paths: Record<string, Record<string, unknown>>;
  components: { schemas?: Record<string, unknown>; securitySchemes?: Record<string, unknown> };
  [key: string]: unknown;
};

// Préfixe des routes Better Auth dans le hub (app/api/auth/[...all]/route.ts)
const AUTH_PREFIX = "/api/auth";

// Routes Better Auth absentes de la documentation : administration, connexion par mot de passe (développement
// uniquement), inscription libre des applications (désactivée : les clients sont enregistrés à la main)
const HIDDEN_ROUTES = [
  /^\/admin\//,
  /^\/open-api\//,
  /^\/reference$/,
  /^\/sign-in\/email$/,
  /^\/sign-up\//,
  /password/i,
  /^\/oauth2\/register$/,
  /^\/oauth2\/(create|update|delete|get)-client/,
  /^\/oauth2\/client\//,
  // Plugin du passeport : documenté sous son adresse publique /api/v1/… (hubRoutes.ts)
  /^\/v1\//,
];

function isHidden(path: string) {
  return HIDDEN_ROUTES.some((pattern) => pattern.test(path));
}

/** Liste les schémas cités par `$ref` dans une partie du document. */
function collectRefs(value: unknown, refs: Set<string>) {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, refs));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "$ref" && typeof child === "string") refs.add(child.replace("#/components/schemas/", ""));
      else collectRefs(child, refs);
    }
  }
}

export async function buildApiDoc(): Promise<OpenApiDocument> {
  // L'inférence de types de `auth.api` ne suit plus avec autant de plugins (voir la route .well-known) :
  // l'endpoint du plugin openAPI existe bien à l'exécution, ce que vérifie tests/api/doc.spec.ts
  const api = auth.api as unknown as { generateOpenAPISchema: () => Promise<OpenApiDocument> };
  const generated = await api.generateOpenAPISchema();

  const paths: OpenApiDocument["paths"] = {};
  for (const [path, operations] of Object.entries(generated.paths)) {
    if (!isHidden(path)) paths[`${AUTH_PREFIX}${path}`] = operations;
  }
  Object.assign(paths, hubRoutes);

  const refs = new Set<string>();
  collectRefs(paths, refs);
  const schemas = Object.fromEntries(Object.entries(generated.components.schemas ?? {}).filter(([name]) => refs.has(name)));

  return {
    ...generated,
    info: {
      title: "Passeport Blood Bowl — API du hub BBFrance",
      description:
        "Service de connexion commun aux applications Blood Bowl (OIDC). Une application cliente enregistrée connecte un coach par `/api/auth/oauth2/authorize`, puis lit son profil par `/api/auth/oauth2/userinfo`. Découverte OIDC : `/api/auth/.well-known/openid-configuration`.",
      version: "1.0.0",
    },
    servers: [{ url: process.env.BETTER_AUTH_URL ?? "" }],
    paths,
    webhooks: hubWebhooks,
    components: { ...generated.components, schemas },
  };
}

/**
 * Ne garde que la description d'une route ; `null` si la route n'est pas documentée.
 * Une route de connexion peut être donnée sans son préfixe (`/oauth2/userinfo` comme `/api/auth/oauth2/userinfo`).
 */
export function pickRoute(doc: OpenApiDocument, requested: string): OpenApiDocument | null {
  const route = doc.paths[requested] ? requested : `${AUTH_PREFIX}${requested}`;
  const operations = doc.paths[route];
  if (!operations) return null;
  const refs = new Set<string>();
  collectRefs(operations, refs);
  const schemas = Object.fromEntries(Object.entries(doc.components.schemas ?? {}).filter(([name]) => refs.has(name)));
  return { ...doc, paths: { [route]: operations }, components: { ...doc.components, schemas } };
}
