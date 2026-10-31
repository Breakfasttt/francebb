/**
 * Consentement OIDC (carte 127) : affiché seulement pour une application tierce (les applications BBFrance sont
 * enregistrées sans consentement). Le nom de l'application et ses droits, expliqués en français, viennent de la
 * demande d'autorisation signée présente dans l'adresse.
 */
import { prisma } from "@/lib/prisma.mjs";
import { describeScopes } from "@/lib/scopes";
import ConsentForm from "./ConsentForm";

export default async function ConsentPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const clientId = typeof searchParams.client_id === "string" ? searchParams.client_id : "";
  const scopes = typeof searchParams.scope === "string" ? searchParams.scope.split(" ").filter(Boolean) : [];
  const client = clientId ? await prisma.oauthClient.findUnique({ where: { clientId }, select: { name: true } }) : null;
  return <ConsentForm appName={client?.name ?? "Une application"} rights={describeScopes(scopes)} />;
}
