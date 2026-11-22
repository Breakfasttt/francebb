import Link from "next/link";
import { getHowToPlaySettings } from "@/app/administration/actions";
import { parseBBCode } from "@/lib/bbcode";
import { Button } from "@bbfrance/ui";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import SiteLayout, { PanelTitle, panelItemClass } from "@/common/components/SiteLayout/SiteLayout";
import ForumListHeader from "@/app/forum/component/ForumListHeader";

/**
 * Page « Jouer » : le guide du coach débutant (refonte, carte 090, ADR 0006).
 * Le texte de chaque section est saisi dans l'administration (réglages du site `how_to_play_…`). Une section vide est
 * masquée, sauf la première, qui affiche alors un texte d'attente. Page de lecture (DESIGN.md) : sommaire des étapes
 * dans le panneau gauche ; chaque étape est une carte (22/11/2026) avec un grand numéro, un titre en voix Display, un
 * texte aéré à largeur de lecture (puces rouges, filets discrets) et un bouton vers l'étape suivante. Les illustrations
 * générées ont été retirées (carte 220) ; chaque étape a désormais une vraie photo de figurines ou de terrain, prise par le
 * responsable du site en tournoi (sans personne reconnaissable, métadonnées retirées), dans `public/images/guide/`.
 * Les ancres des sections (`#how_to_play_…`) n'ont pas changé.
 */

/** Photo de chaque étape : vraies photos de tournoi du responsable, figurines et terrains, sans personne. */
const STEP_PHOTOS: Record<string, { src: string; alt: string }> = {
  how_to_play_what_is_bb: { src: "/images/guide/melee.jpg", alt: "Mêlée de figurines peintes au centre d'un terrain de Blood Bowl" },
  how_to_play_platforms: { src: "/images/guide/stade.jpg", alt: "Terrain de Blood Bowl installé dans un stade miniature avec tribunes et tour" },
  how_to_play_community: { src: "/images/guide/equipe-nold.jpg", alt: "Équipe peinte présentée sur un socle décoré, lors d'un tournoi" },
  how_to_play_tournaments: { src: "/images/guide/tournoi-table.jpg", alt: "Partie de tournoi en cours, vue du dessus du terrain" },
  how_to_play_naf_cdf_rtc: { src: "/images/guide/equipe-ruines.jpg", alt: "Équipe peinte exposée dans un décor de ruines enneigées" },
  how_to_play_challenges: { src: "/images/guide/death-roller.jpg", alt: "Rouleau compresseur nain peint, posé sur le terrain" },
};

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
      {/* Page de lecture (DESIGN.md) : une carte par étape, texte à largeur de lecture, sans illustration */}
      <div className="flex flex-col gap-5">
        {visibleSections.map((section, index) => {
          const content = settings[section.key];
          const nextSection = visibleSections[index + 1];
          return (
            // scroll-mt : l'ancre ne passe pas sous la barre du haut, collée en haut de l'écran
            <article
              key={section.key}
              id={section.key}
              aria-labelledby={`${section.key}-titre`}
              className="scroll-mt-20 overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface"
            >
              {/* En-tête : grand numéro et titre, sur la teinte des en-têtes de bloc */}
              <header className="flex items-center gap-4 border-b border-bb-border bg-bb-surface-2 px-4 py-4 lg:px-6">
                <span aria-hidden="true" className="font-bb-display text-[2.75rem] leading-none text-bb-accent-text tabular-nums lg:text-[3.25rem]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-bb-heading text-bb-label text-bb-text-muted">Étape {index + 1} sur {visibleSections.length}</span>
                  <h2 id={`${section.key}-titre`} className="font-bb-display text-[1.6rem] leading-tight text-bb-text lg:text-[1.9rem]">{section.title}</h2>
                </span>
              </header>
              {/* Toute la largeur (22/11/2026) : photo en bandeau au-dessus du texte jusqu'à 1279 px ; à partir de 1280 px,
                  texte à largeur de lecture à gauche et photo à droite, collée en haut pendant la lecture */}
              <div className="xl:grid xl:grid-cols-[minmax(0,72ch)_minmax(0,1fr)] xl:items-start">
              {STEP_PHOTOS[section.key] && (
                <div className="relative aspect-[16/7] w-full border-b border-bb-border bg-bb-surface-2 xl:sticky xl:top-20 xl:order-last xl:m-6 xl:ml-0 xl:aspect-[4/3] xl:w-auto xl:overflow-hidden xl:rounded-bb-md xl:border">
                  <Image
                    src={STEP_PHOTOS[section.key].src}
                    alt={STEP_PHOTOS[section.key].alt}
                    fill
                    sizes="(min-width: 1280px) 45vw, (min-width: 1025px) 70vw, 100vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              )}
              {/* Texte mis en forme saisi dans l'administration (BBCode converti en HTML) : interligne aéré, puces
                  rouges, filets discrets, citations et intertitres lisibles */}
              <div
                className="max-w-[72ch] px-4 py-5 text-bb-lead leading-relaxed break-words text-bb-text lg:px-6 lg:py-6 [&_a]:text-bb-accent-text [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_i]:text-bb-text-muted [&_img]:h-auto [&_img]:max-w-full [&_ul]:my-4 [&_ol]:my-4 [&_li]:my-1.5 [&_li]:pl-1 [&_li::marker]:text-bb-accent-text [&_hr]:my-6"
                dangerouslySetInnerHTML={{ __html: parseBBCode(content || "Contenu en cours de rédaction...") }}
              />
              </div>
              {nextSection && (
                <footer className="border-t border-bb-border px-4 py-3 lg:px-6">
                  <a
                    href={`#${nextSection.key}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-bb-md text-sm font-semibold text-bb-text no-underline hover:text-bb-accent-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus"
                  >
                    <ArrowDown size={16} aria-hidden="true" className="text-bb-accent-text" />
                    Étape suivante : {nextSection.title}
                  </a>
                </footer>
              )}
            </article>
          );
        })}

        <section aria-labelledby="guide-next-title" className="flex flex-col gap-3 rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-5 lg:px-6">
          <h2 id="guide-next-title" className="font-bb-display text-[1.6rem] leading-tight text-bb-text">Et maintenant ?</h2>
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
