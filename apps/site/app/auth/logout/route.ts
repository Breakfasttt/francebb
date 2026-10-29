/**
 * Déconnexion (carte 037). Déconnecte du site ; si le membre s'est connecté via le hub (AUTH_MODE=hub),
 * l'envoie ensuite vers la page de déconnexion du hub, qui ferme aussi la session hub : sans cela,
 * la connexion suivante serait automatique. POST uniquement : une simple image piégée ne peut pas déconnecter un membre.
 *
 * Le jeton d'identité du hub n'est jamais envoyé au navigateur : il est lu ici, côté serveur, dans le cookie
 * de session chiffré (getToken), pour qu'un script injecté dans une page ne puisse pas le voler.
 */
import { getToken } from "next-auth/jwt";
import { signOut, isHubAuthMode } from "@/auth";

export async function POST(request: Request) {
  const siteUrl = (process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  // En HTTPS, Auth.js nomme le cookie « __Secure-authjs.session-token » : getToken doit chercher le même
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET, secureCookie: siteUrl.startsWith("https://") });
  const hubIdToken = typeof token?.hubIdToken === "string" ? token.hubIdToken : undefined;
  await signOut({ redirect: false });

  if (!isHubAuthMode || !hubIdToken) return Response.redirect(`${siteUrl}/`, 303);

  const endSession = new URL(`${process.env.HUB_ISSUER}/oauth2/end-session`);
  endSession.searchParams.set("id_token_hint", hubIdToken);
  endSession.searchParams.set("post_logout_redirect_uri", `${siteUrl}/`);
  return Response.redirect(endSession, 303);
}
