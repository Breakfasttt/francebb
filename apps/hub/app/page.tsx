/**
 * Accueil du hub : indique le compte connecté. Les apps clientes passent par /api/auth/oauth2/authorize.
 */
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function HubHome() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <main className="hub-card">
      <h1>Compte BBFrance</h1>
      {session ? <p>Connecté : {session.user.name}</p> : <p className="hub-muted">Non connecté.</p>}
    </main>
  );
}
