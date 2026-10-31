/**
 * Carte seule au centre de l'écran, pour les pages courtes du hub : connexion, consentement (carte 128).
 * Sur téléphone, elle prend toute la largeur moins une marge de 16 pixels de chaque côté.
 */
import { Card, CardBody } from "@bbfrance/ui";

export default function CenteredCard({ title, children, ...props }: { title?: string; children: React.ReactNode } & React.ComponentProps<"main">) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8" {...props}>
      <Card>
        <CardBody className="flex flex-col gap-4 p-5 sm:p-8">
          {title && <h1 className="m-0 text-xl font-bold uppercase text-bb-accent-text">{title}</h1>}
          {children}
        </CardBody>
      </Card>
    </main>
  );
}
