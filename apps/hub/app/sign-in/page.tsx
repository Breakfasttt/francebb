/**
 * Page de connexion du hub, appelée par le flux OIDC (`loginPage`) avec la demande d'autorisation signée dans
 * l'adresse. Si l'application a indiqué le moyen de connexion choisi par le membre (`login_method`, carte 073),
 * le hub le lance aussitôt sans afficher ses boutons : il reste invisible. Sinon, formulaire de connexion normal.
 */
import { readRequestedLogin } from "@/lib/oauthResume";
import AutoSignIn from "./AutoSignIn";
import SignInForm from "./SignInForm";

export default async function SignInPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = await props.searchParams;
  const requested = readRequestedLogin(searchParams);
  if (requested) return <AutoSignIn method={requested.method} email={requested.email} />;
  const error = typeof searchParams.error === "string" ? searchParams.error : null;
  return <SignInForm errorCode={error} />;
}
