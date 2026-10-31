/**
 * Description OpenAPI des routes propres au hub (hors `/api/auth`, qui est décrit par Better Auth).
 * Règle (apps/hub/CLAUDE.md) : toute nouvelle route publique du hub ajoute ici sa description.
 * Le test tests/api/doc.spec.ts échoue si une route de `app/api` n'y figure pas.
 */

type OpenApiPaths = Record<string, Record<string, unknown>>;

export const hubRoutes: OpenApiPaths = {
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
