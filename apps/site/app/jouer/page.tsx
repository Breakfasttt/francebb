import Image from "next/image";
import Link from "next/link";
import { getHowToPlaySettings } from "@/app/administration/actions";
import { parseBBCode } from "@/lib/bbcode";
import { Gamepad2, MonitorSmartphone, Users, Trophy, ShieldCheck, Map, ChevronRight } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
// Styles des blocs BBCode (accordéons, spoilers, galeries), comme dans les sujets du forum ; avant la carte 090,
// la page en gardait une copie dans son propre page.css
import "@/app/forum/page.css";

/**
 * Page « Jouer » : le guide du coach débutant (refonte, carte 090, ADR 0006).
 * Le texte de chaque section est saisi dans l'administration (réglages du site `how_to_play_…`). Une section vide est
 * masquée, sauf la première, qui affiche alors un texte d'attente. Une seule colonne, de largeur de lecture : chaque
 * section est une carte avec son illustration en bandeau, son titre et un lien « Prochaine étape » vers la suivante.
 * Les ancres des sections (`#how_to_play_…`) n'ont pas changé.
 */

export default async function HowToPlayPage() {
  const settings = await getHowToPlaySettings();

  const sections = [
    {
      key: "how_to_play_what_is_bb",
      title: "C'est quoi Blood Bowl ?",
      icon: Gamepad2,
      image: "/images/how-to-play/intro.png"
    },
    {
      key: "how_to_play_platforms",
      title: "Comment y jouer ?",
      icon: MonitorSmartphone,
      image: "/images/how-to-play/platforms.png"
    },
    {
      key: "how_to_play_community",
      title: "Communauté & Ligues",
      icon: Users,
      image: "/images/how-to-play/community.png"
    },
    {
      key: "how_to_play_tournaments",
      title: "Rejoindre un Tournoi",
      icon: Trophy,
      image: "/images/how-to-play/tournaments.png"
    },
    {
      key: "how_to_play_naf_cdf_rtc",
      title: "NAF, CdF & RTC",
      icon: ShieldCheck,
      image: "/images/how-to-play/official.png"
    },
    {
      key: "how_to_play_challenges",
      title: "Challenges Régionaux",
      icon: Map,
      image: "/images/how-to-play/challenges.png"
    }
  ];

  return (
    <div className="mx-auto w-full max-w-[880px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader
        title="Guide du coach"
        subtitle="Tout ce qu'il faut savoir pour débuter l'aventure Blood Bowl en France"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="flex flex-col gap-4 lg:gap-6">
        {sections.map((section, index) => {
          const content = settings[section.key];
          if (!content && index !== 0) return null;
          const Icon = section.icon;

          return (
            // scroll-mt : l'ancre ne passe pas sous la barre du haut, collée en haut de l'écran
            <article key={section.key} id={section.key} className="scroll-mt-20">
              <Card className="overflow-hidden">
                <div className="relative aspect-[16/7] w-full bg-bb-surface-2">
                  {/* L'image remplit son bandeau ; « sizes » donne sa largeur affichée (880 pixels au plus) */}
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    sizes="(max-width: 880px) 100vw, 880px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-4 p-4 lg:p-6">
                  <header className="flex items-center gap-3">
                    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-bb-md bg-bb-accent-soft text-bb-accent-text">
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-semibold text-bb-accent-text">Étape {index + 1}</p>
                      <h2 className="m-0 border-0 p-0 text-xl leading-tight font-bold text-bb-text normal-case not-italic">{section.title}</h2>
                    </div>
                  </header>

                  {/* Texte mis en forme saisi dans l'administration (BBCode converti en HTML) */}
                  <div
                    className="text-[1.05rem] leading-relaxed break-words text-bb-text [&_a]:text-bb-accent-text [&_a]:underline [&_b]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_strong]:font-bold"
                    dangerouslySetInnerHTML={{ __html: parseBBCode(content || "Contenu en cours de rédaction...") }}
                  />

                  {index < sections.length - 1 && (
                    <div className="flex justify-end border-t border-bb-border pt-4">
                      <Button asChild variant="secondary" size="tap">
                        <a href={`#${sections[index + 1].key}`} className="no-underline">
                          Prochaine étape <ChevronRight size={18} aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </article>
          );
        })}

        <Card className="flex flex-col items-center gap-3 p-6 text-center lg:p-8">
          <h2 className="m-0 border-0 p-0 text-xl leading-tight font-bold text-bb-text normal-case not-italic">Prêt à lancer vos premiers dés ?</h2>
          <p className="m-0 max-w-prose text-bb-text-muted">Rejoignez les milliers de coachs français déjà présents sur le forum et dans les ligues.</p>
          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild variant="primary" size="tap">
              <Link href="/auth/login" className="no-underline">Créer mon compte</Link>
            </Button>
            <Button asChild variant="secondary" size="tap">
              <Link href="/forum" className="no-underline">Parcourir le forum</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
