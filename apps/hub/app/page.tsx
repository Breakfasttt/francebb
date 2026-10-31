/**
 * Accueil du hub = le passeport Blood Bowl du coach (carte 120, ADR-0007) : profil, moyens de connexion, applications
 * qui ont accès au compte, appareils connectés, suppression du compte (carte 123). Sans session, formulaire de
 * connexion (qui ramène ici).
 *
 * Le hub ne connaît aucune application : un bouton de retour n'apparaît que si l'application qui a ouvert le passeport
 * a donné `client_id` et `return_to`, et que cette adresse appartient bien à ce client enregistré.
 */
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma.mjs";
import { publicProfile } from "@/lib/profile";
import { listUserApplications, validReturnLink } from "@/lib/applications";
import SignInForm from "./sign-in/SignInForm";
import ProfileForm from "./passport/ProfileForm";
import Applications from "./passport/Applications";
import Sessions from "./passport/Sessions";
import SignOutButton from "./passport/SignOutButton";
import DeleteAccount from "./passport/DeleteAccount";
import PassportSection from "./passport/PassportSection";
import ItemList from "./passport/ItemList";
import { Muted } from "./components/Messages";
import { Avatar, buttonVariants, cn } from "@bbfrance/ui";

/**
 * Lien présenté comme un bouton secondaire, à la taille tactile (44 pixels au moins). `cn` retire les classes de base
 * contredites par la variante (sans fond, sans bordure), comme le fait le composant Button.
 */
const linkButton = cn(buttonVariants({ variant: "secondary", size: "tap" }));

const PROVIDER_LABELS: Record<string, string> = { discord: "Discord", google: "Google", credential: "Mot de passe (développement)" };

export default async function PassportPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <SignInForm />;

  const searchParams = await props.searchParams;
  const userId = session.user.id;
  // Lectures l'une après l'autre : la base locale de développement (prisma dev) ne sert qu'une requête à la fois
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const accounts = await prisma.account.findMany({ where: { userId }, select: { providerId: true } });
  const applications = await listUserApplications(userId);
  const back = await validReturnLink(searchParams.client_id, searchParams.return_to);
  const profile = publicProfile(user) as { name: string; image: string | null; naf: string | null; region: string | null; locale: string | null; timezone: string | null };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={profile.name} src={profile.image} size={48} />
          <h1 className="m-0 text-2xl font-bold uppercase text-bb-accent-text">Mon passeport Blood Bowl</h1>
        </div>
        <Muted>
          Ton identité de coach, commune à toutes les applications. Les réglages propres à une application (thème,
          notifications…) se changent dans l&apos;application elle-même.
        </Muted>
        {user.deletionScheduledAt && (
          <p className="m-0 rounded-bb-md border border-bb-warning-text px-4 py-3" role="status">
            Suppression de ton compte prévue le {user.deletionScheduledAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
            Les applications n&apos;y ont plus accès. Pour l&apos;annuler, va en bas de cette page.
          </p>
        )}
        {back && (
          <a className={linkButton} href={back.url}>Retour vers {back.name}</a>
        )}
      </header>

      <PassportSection id="profile" title="Profil">
        <ProfileForm initial={profile} />
      </PassportSection>

      <PassportSection id="accounts" title="Moyens de connexion">
        <ItemList
          items={[
            ...accounts.map((account) => ({ key: account.providerId, name: PROVIDER_LABELS[account.providerId] ?? account.providerId })),
            { key: "email", name: "Lien par email", detail: user.email },
          ]}
        />
      </PassportSection>

      <PassportSection id="apps" title="Applications liées">
        <Applications initial={applications} />
      </PassportSection>

      <PassportSection id="sessions" title="Appareils connectés au passeport">
        <Sessions currentToken={session.session.token} />
      </PassportSection>

      <PassportSection id="export" title="Mes données">
        <Muted>
          Un fichier avec tout ce que le hub et les applications BBFrance savent de toi (profil, connexions, et les
          données de chaque application).
        </Muted>
        <a className={linkButton} href="/api/v1/account/export" download>Télécharger mes données</a>
      </PassportSection>

      <PassportSection id="delete" title="Supprimer mon compte">
        <DeleteAccount scheduledAt={user.deletionScheduledAt?.toISOString() ?? null} />
      </PassportSection>

      <SignOutButton />
    </main>
  );
}
