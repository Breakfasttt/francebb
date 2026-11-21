import Link from "next/link";
import { getHowToPlaySettings } from "@/app/administration/actions";
import { parseBBCode } from "@/lib/bbcode";
import { Button } from "@bbfrance/ui";
import SiteLayout, { PanelTitle, panelItemClass } from "@/common/components/SiteLayout/SiteLayout";
import ForumListHeader from "@/app/forum/component/ForumListHeader";

/**
 * Page « Jouer » : le guide du coach débutant (refonte, carte 090, ADR 0006).
 * Le texte de chaque section est saisi dans l'administration (réglages du site `how_to_play_…`). Une section vide est
 * masquée, sauf la première, qui affiche alors un texte d'attente. Page de lecture (DESIGN.md) : sommaire des étapes
 * dans le panneau gauche, texte calé à gauche à largeur de lecture, lien vers l'étape suivante. Les illustrations
 * générées ont été retirées (carte 220).
 * Les ancres des sections (`#how_to_play_…`) n'ont pas changé.
 */

export default async function HowToPlayPage() {
  const settings = await getHowToPlaySettings();

  const sections = [
    {
      key: "how_to_play_what_is_bb",
      title: "C'est quoi Blood Bowl ?"
    },
    {
      key: "how_to_play_platforms",
      title: "Comment y jouer ?"
    },
    {
      key: "how_to_play_community",
      title: "Communauté et ligues"
    },
    {
      key: "how_to_play_tournaments",
      title: "Rejoindre un tournoi"
    },
    {
      key: "how_to_play_naf_cdf_rtc",
      title: "NAF, CdF & RTC"
    },
    {
      key: "how_to_play_challenges",
      title: "Challenges régionaux"
    }
  ];

  // Sections réellement affichées : une section vide est masquée, sauf la première (carte 132). Les étapes sont
  // numérotées parmi les sections affichées ; le lien « Prochaine étape » vise la section affichée suivante, et
  // n'apparaît pas sur la dernière section affichée (il ne mènerait nulle part).
  const visibleSections = sections.filter((section, index) => index === 0 || Boolean(settings[section.key]));

  return (
    <SiteLayout
      asideOnMobile="hidden"
      asideLabel="Sommaire du guide"
      header={
        <ForumListHeader
          title="Guide du coach"
          subtitle="Tout ce qu'il faut savoir pour débuter à Blood Bowl en France"
          backHref="/"
          backTitle="Retour à l'accueil"
        />
      }
      aside={
        <nav aria-labelledby="guide-toc-title" className="flex flex-col">
          <PanelTitle id="guide-toc-title">Les étapes</PanelTitle>
          {visibleSections.map((section, index) => (
            <a key={section.key} href={`#${section.key}`} className={panelItemClass(false)}>
              <span className="w-5 shrink-0 text-sm text-bb-text-muted tabular-nums">{index + 1}</span>
              <span className="min-w-0 flex-1">{section.title}</span>
            </a>
          ))}
        </nav>
      }
    >
      {/* Page de lecture (DESIGN.md) : texte calé à gauche à largeur de lecture, sections séparées par des filets,
          sans illustration ni icône décorative */}
      <div className="flex max-w-[75ch] flex-col">
        {visibleSections.map((section, index) => {
          const content = settings[section.key];
          const nextSection = visibleSections[index + 1];
          return (
            // scroll-mt : l'ancre ne passe pas sous la barre du haut, collée en haut de l'écran
            <article key={section.key} id={section.key} className="scroll-mt-20 border-b border-bb-border py-6 first:pt-0">
              <p className="font-bb-heading text-bb-label text-bb-accent-text">Étape {index + 1}</p>
              <h2 className="mt-1 text-2xl leading-tight font-extrabold text-bb-text [font-stretch:88%]">{section.title}</h2>
              {/* Texte mis en forme saisi dans l'administration (BBCode converti en HTML) */}
              <div
                className="mt-3 text-bb-lead break-words text-bb-text [&_a]:text-bb-accent-text [&_a]:underline [&_b]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_strong]:font-bold"
                dangerouslySetInnerHTML={{ __html: parseBBCode(content || "Contenu en cours de rédaction...") }}
              />
              {nextSection && (
                <a href={`#${nextSection.key}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-bb-text-muted no-underline hover:text-bb-accent-text">
                  Étape suivante : {nextSection.title}
                </a>
              )}
            </article>
          );
        })}

        <section aria-labelledby="guide-next-title" className="flex flex-col gap-3 py-6">
          <h2 id="guide-next-title" className="font-bb-heading text-[0.95rem] text-bb-text">Et maintenant ?</h2>
          <p className="text-bb-text-muted">Crée ton compte pour écrire sur le forum et t&apos;inscrire aux tournois, ou parcours le forum sans compte.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="tap">
              <Link href="/auth/login">Créer mon compte</Link>
            </Button>
            <Button asChild variant="secondary" size="tap">
              <Link href="/forum">Parcourir le forum</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
