import { signIn, isHubAuthMode } from "@/auth";
import { getSession } from "@/lib/authGuard";
import { redirect } from "next/navigation";
import { safeCallbackUrl } from "@/lib/safeRedirect";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DevLoginSection from "./DevLoginSection";
import { Button, Card, Field, Input } from "@bbfrance/ui";
import { DiscordIcon, GoogleIcon } from "@/common/components/Icons/SocialIcons";

export const metadata = {
  title: "Connexion - BBFrance",
};

/*
 * Page de connexion (refonte, carte 091, ADR 0006) : une carte centrée sur une colonne, avec les composants et les
 * couleurs v2 de packages/ui. Seule la mise en page a changé : les actions des formulaires, le champ `email` et le
 * paramètre `callbackUrl` sont ceux d'avant.
 */

/**
 * Mode hub (carte 073) : le hub reste invisible. Chaque bouton lance la connexion par le hub en lui indiquant
 * le moyen choisi dans le paramètre `login_method` de la demande d'autorisation ; la page de connexion du hub
 * enchaîne alors directement sur Discord, Google ou l'envoi du lien, sans afficher ses propres boutons.
 * Pour le lien par email, l'adresse saisie est transmise dans `login_hint` (paramètre standard OIDC).
 */
async function signInThroughHub(method: "discord" | "google" | "email", redirectTo: string, email?: string) {
  await signIn("hub", { redirectTo }, { login_method: method, ...(email ? { login_hint: email } : {}) });
}

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  // Session brute (bannis compris) : un membre déjà connecté, même banni, n'a rien à faire sur cette page.
  const session = await getSession();
  const searchParams = await props.searchParams;
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl);

  if (session) {
    redirect(callbackUrl);
  }

  const error = searchParams.error;

  // En mode hub, les trois moyens sont proposés : c'est le hub qui les fournit (ses propres réglages Discord,
  // Google et envoi d'emails), les réglages correspondants du site ne servent plus.
  const isHubEnabled = isHubAuthMode;
  const isDiscordEnabled = isHubEnabled || !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  const isGoogleEnabled = isHubEnabled || !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const isEmailEnabled = isHubEnabled || !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

  const hasAnyMethod = isDiscordEnabled || isGoogleEnabled || isEmailEnabled;
  
  // Récupération des comptes de test en mode dev (aligné avec DebugAuthWidget)
  const devUsers = process.env.NODE_ENV === "development" 
    ? await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: "system" } },
            {
              OR: [
                { email: { contains: "@test.com" } },
                { id: { startsWith: "test_" } },
                { id: { startsWith: "user_test_" } },
                { role: { in: ["SUPERADMIN", "ADMIN", "MODERATOR"] } }
              ]
            }
          ]
        },
        select: { id: true, name: true, email: true, role: true, image: true },
        take: 10,
        orderBy: { name: "asc" }
      })
    : [];

  return (
    <div className="flex justify-center px-3 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <section aria-labelledby="login-title" className="w-full max-w-md">
        <Card className="flex flex-col gap-5 p-5 lg:p-8">
          <header className="flex flex-col gap-1 text-center">
            <h1 id="login-title" className="m-0 border-0 p-0 text-2xl leading-tight font-bold text-bb-text normal-case not-italic">
              Connexion
            </h1>
            <p className="m-0 text-sm text-bb-text-muted">
              Choisissez comment vous connecter. Un compte est créé automatiquement à la première connexion.
            </p>
          </header>

          {error === "OAuthAccountNotLinked" && (
            <p role="alert" className="m-0 rounded-bb-md border border-bb-danger bg-bb-surface-2 p-3 text-sm text-bb-danger-text">
              Cet email est déjà lié à un autre mode de connexion.
            </p>
          )}

          {!hasAnyMethod && (
            <p role="alert" className="m-0 rounded-bb-md border border-bb-danger bg-bb-surface-2 p-3 text-sm text-bb-danger-text">
              L&apos;authentification n&apos;est pas encore configurée sur ce serveur.
            </p>
          )}

          {(isDiscordEnabled || isGoogleEnabled) && (
            <div className="flex flex-col gap-3">
              {/* Discord */}
              {isDiscordEnabled && (
                <form
                  className="m-0"
                  action={async () => {
                    "use server";
                    if (isHubAuthMode) await signInThroughHub("discord", callbackUrl);
                    else await signIn("discord", { redirectTo: callbackUrl });
                  }}
                >
                  <Button type="submit" variant="secondary" size="tap" className="w-full">
                    <DiscordIcon size={20} />
                    Se connecter avec Discord
                  </Button>
                </form>
              )}

              {/* Google */}
              {isGoogleEnabled && (
                <form
                  className="m-0"
                  action={async () => {
                    "use server";
                    if (isHubAuthMode) await signInThroughHub("google", callbackUrl);
                    else await signIn("google", { redirectTo: callbackUrl });
                  }}
                >
                  <Button type="submit" variant="secondary" size="tap" className="w-full">
                    <GoogleIcon size={20} />
                    Se connecter avec Google
                  </Button>
                </form>
              )}
            </div>
          )}

          {hasAnyMethod && isEmailEnabled && (isDiscordEnabled || isGoogleEnabled) && (
            <div className="flex items-center gap-3 text-sm text-bb-text-muted" aria-hidden="true">
              <span className="h-px flex-1 bg-bb-border" />
              ou
              <span className="h-px flex-1 bg-bb-border" />
            </div>
          )}

          {/* Lien magique : un lien de connexion envoyé par email */}
          {isEmailEnabled && (
            <form
              className="m-0 flex flex-col gap-3"
              action={async (formData) => {
                "use server";
                const email = formData.get("email");
                if (typeof email === "string" && email) {
                  if (isHubAuthMode) await signInThroughHub("email", callbackUrl, email.trim());
                  else await signIn("nodemailer", { email, redirectTo: callbackUrl });
                }
              }}
            >
              <Field label="Adresse email" htmlFor="email" hint="Vous recevrez un lien qui vous connecte sans mot de passe.">
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="nom@exemple.fr" required />
              </Field>
              <Button type="submit" variant="primary" size="tap" className="w-full">
                <LogIn size={18} aria-hidden="true" />
                Recevoir un lien magique
              </Button>
            </form>
          )}

          {/* Mode hub, développement uniquement (carte 153) : sans moyen indiqué, le hub affiche son formulaire
              complet, avec ses comptes de test. La connexion passe alors par le vrai chemin, hub compris. */}
          {process.env.NODE_ENV === "development" && isHubAuthMode && (
            <form
              action={async () => {
                "use server";
                await signIn("hub", { redirectTo: callbackUrl });
              }}
            >
              <Button type="submit" variant="secondary" size="tap" className="w-full">
                Comptes de test du hub
              </Button>
            </form>
          )}

          {/* Comptes de test (développement uniquement) */}
          {process.env.NODE_ENV === "development" && (
            <DevLoginSection
              initialUsers={devUsers}
              callbackUrl={callbackUrl}
            />
          )}

          <p className="m-0 text-center text-sm text-bb-text-muted">
            En vous connectant, vous acceptez nos{" "}
            <Link href="/mentions-legales" className="inline-flex min-h-11 items-center text-bb-accent-text underline">mentions légales</Link>.
          </p>
        </Card>
      </section>
    </div>
  );
}
