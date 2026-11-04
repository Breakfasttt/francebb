/**
 * Faux serveur BBScheme des tests du site (carte 179). Depuis cette carte, les schémas tactiques ne sont plus dans la
 * base du site : le site les lit auprès de l'application apps/bbscheme, par l'adresse `GET /api/boards/<identifiant>`
 * (réglage BBSCHEME_URL). Pendant les tests, ce petit serveur joue le rôle de cette application, sans base de données.
 *
 * Usage (lancé par playwright.config.ts) : node tests/e2e/fakeBbschemeServer.mjs <port> <identifiant> [identifiant…]
 * Chaque identifiant donné répond par un plateau vide (`{}` : terrain sans joueurs), comme celui que globalSetup créait
 * avant la carte 179. Tout autre identifiant répond « introuvable » (404), ce qui fait afficher « Schéma indisponible ».
 * L'adresse « / » répond 200 : Playwright s'en sert pour savoir que le serveur est prêt.
 */
import { createServer } from "node:http";

const [port, ...knownBoards] = process.argv.slice(2);

createServer((request, response) => {
  const match = request.method === "GET" && request.url?.match(/^\/api\/boards\/([^/?]+)$/);
  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/plain" }).end("Faux serveur BBScheme des tests");
  } else if (match && knownBoards.includes(decodeURIComponent(match[1]))) {
    response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ data: "{}" }));
  } else {
    response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Schéma introuvable" }));
  }
}).listen(Number(port));
