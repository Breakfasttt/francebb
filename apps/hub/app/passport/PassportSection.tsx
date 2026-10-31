/**
 * Une section du passeport (profil, applications liées…) : une carte avec son titre (carte 128).
 */
import { Card, CardBody, CardHeader, CardTitle } from "@bbfrance/ui";

export default function PassportSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <Card>
        <CardHeader>
          <CardTitle id={`${id}-title`}>{title}</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">{children}</CardBody>
      </Card>
    </section>
  );
}
