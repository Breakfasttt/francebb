"use client";

/**
 * Onglet « Guide du débutant » de l'administration (refonte, carte 099) : les textes des six sections de la page
 * `/jouer`, écrits en BBCode. Chaque section porte le titre qu'elle a sur `/jouer`. Le bouton « Enregistrer le guide »
 * reste visible en bas de l'écran pendant qu'on fait défiler les six éditeurs. Les actions `getHowToPlaySettings` et
 * `updateHowToPlaySettings` sont inchangées.
 */
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { BookOpen, Gamepad2, Map, MonitorSmartphone, Save, ShieldCheck, Trophy, Users } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, Skeleton, toast } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { getHowToPlaySettings, updateHowToPlaySettings } from "../actions";

/** Les six sections de /jouer : clé du réglage, titre affiché sur /jouer, rôle de la section. */
const SECTIONS = [
  { key: "how_to_play_what_is_bb", title: "C'est quoi Blood Bowl ?", icon: Gamepad2, desc: "Présentation du jeu." },
  { key: "how_to_play_platforms", title: "Comment y jouer ?", icon: MonitorSmartphone, desc: "Plateformes : sur table ou en ligne." },
  { key: "how_to_play_community", title: "Communauté & Ligues", icon: Users, desc: "Discord et ligues." },
  { key: "how_to_play_tournaments", title: "Rejoindre un Tournoi", icon: Trophy, desc: "Calendrier et inscriptions." },
  { key: "how_to_play_naf_cdf_rtc", title: "NAF, CdF & RTC", icon: ShieldCheck, desc: "Les instances officielles." },
  { key: "how_to_play_challenges", title: "Challenges Régionaux", icon: Map, desc: "Circuits régionaux." },
];

export default function HowToPlayTab() {
  const [settings, setSettings] = useState<Record<string, string>>({
    how_to_play_what_is_bb: "",
    how_to_play_platforms: "",
    how_to_play_community: "",
    how_to_play_tournaments: "",
    how_to_play_naf_cdf_rtc: "",
    how_to_play_challenges: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getHowToPlaySettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const res = await updateHowToPlaySettings(settings);
        if (res.success) {
          toast.success("Guide mis à jour !");
        } else {
          toast.error(res.error || "Erreur lors de la mise à jour");
        }
      } catch {
        toast.error("Erreur réseau");
      }
    });
  };

  const updateSection = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <BookOpen size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Guide « Jouer »</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="m-0 text-[0.95rem] text-bb-text-muted">
            Les textes des six sections de la page <Link href="/jouer" className="font-semibold text-bb-accent-text">Guide du coach</Link>,
            pour les débutants. Une section laissée vide n&apos;est pas affichée.
          </p>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : (
        <>
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.key} className="overflow-hidden">
                <section aria-label={section.title}>
                  <CardHeader>
                    <Icon size={18} className="text-bb-text-muted" aria-hidden="true" />
                    <CardTitle as="h3">
                      <label htmlFor={section.key}>{section.title}</label>
                    </CardTitle>
                    <span className="hidden text-sm text-bb-text-muted lg:inline">{section.desc}</span>
                  </CardHeader>
                  <CardBody>
                    <BBCodeEditor
                      name={section.key}
                      id={section.key}
                      defaultValue={settings[section.key]}
                      onChange={(val) => updateSection(section.key, val)}
                      rows={8}
                    />
                  </CardBody>
                </section>
              </Card>
            );
          })}

          {/* Barre d'enregistrement collée en bas de l'écran (au-dessus de la barre du bas sur téléphone) */}
          <div className="sticky bottom-[calc(var(--app-bottom-nav-space,0px)+0.75rem)] z-10 flex justify-end">
            <Button type="button" variant="primary" size="tap" className="w-full shadow-bb lg:w-auto" disabled={isPending} onClick={handleSave}>
              <Save size={18} aria-hidden="true" />
              {isPending ? "Enregistrement…" : "Enregistrer le guide"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
