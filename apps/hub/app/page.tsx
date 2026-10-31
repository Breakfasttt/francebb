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
    <main className="hub-page">
      <header className="hub-page-header">
        <h1>Mon passeport Blood Bowl</h1>
        <p className="hub-muted">
          Ton identité de coach, commune à toutes les applications. Les réglages propres à une application (thème,
          notifications…) se changent dans l&apos;application elle-même.
        </p>
        {user.deletionScheduledAt && (
          <p className="hub-warning" role="status">
            Suppression de ton compte prévue le {user.deletionScheduledAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
            Les applications n&apos;y ont plus accès. Pour l&apos;annuler, va en bas de cette page.
          </p>
        )}
        {back && (
          <a className="hub-button" href={back.url}>Retour vers {back.name}</a>
        )}
      </header>

      <section className="hub-card" aria-labelledby="profile-title">
        <h2 id="profile-title">Profil</h2>
        <ProfileForm initial={profile} />
      </section>

      <section className="hub-card" aria-labelledby="accounts-title">
        <h2 id="accounts-title">Moyens de connexion</h2>
        <ul className="hub-list">
          {accounts.map((account) => (
            <li key={account.providerId}>
              <strong>{PROVIDER_LABELS[account.providerId] ?? account.providerId}</strong>
            </li>
          ))}
          <li>
            <div>
              <strong>Lien par email</strong>
              <p className="hub-muted hub-help">{user.email}</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="hub-card" aria-labelledby="apps-title">
        <h2 id="apps-title">Applications liées</h2>
        <Applications initial={applications} />
      </section>

      <section className="hub-card" aria-labelledby="sessions-title">
        <h2 id="sessions-title">Appareils connectés au passeport</h2>
        <Sessions currentToken={session.session.token} />
      </section>

      <section className="hub-card" aria-labelledby="delete-title">
        <h2 id="delete-title">Supprimer mon compte</h2>
        <DeleteAccount scheduledAt={user.deletionScheduledAt?.toISOString() ?? null} />
      </section>

      <SignOutButton />
    </main>
  );
}
