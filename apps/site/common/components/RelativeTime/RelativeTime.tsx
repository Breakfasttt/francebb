/**
 * Date relative d'une liste (DESIGN.md, « Dates ») : « il y a 2 heures », avec la date et l'heure complètes au survol
 * (attribut title) et pour les lecteurs d'écran (dateTime). Dans un message du forum, on montre au contraire la date
 * exacte (PostItem).
 * Calculée au rendu : le texte peut différer d'une minute entre le serveur et le navigateur, d'où
 * suppressHydrationWarning sur cette seule balise.
 */
import { formatDistanceToNowStrict } from "date-fns";
import { fr } from "date-fns/locale";

/** Date et heure complètes à l'heure de Paris, pour le survol (« 21/11/2026 à 14:32 »). */
export function fullFrenchDateTime(date: Date | string): string {
  const value = new Date(date);
  const day = value.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
  const time = value.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
  return `${day} à ${time}`;
}

export default function RelativeTime({ date, className }: { date: Date | string; className?: string }) {
  const value = new Date(date);
  return (
    <time dateTime={value.toISOString()} title={fullFrenchDateTime(value)} className={className} suppressHydrationWarning>
      {formatDistanceToNowStrict(value, { addSuffix: true, locale: fr })}
    </time>
  );
}
