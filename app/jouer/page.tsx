import { getHowToPlaySettings } from "@/app/administration/actions";
import { parseBBCode } from "@/lib/bbcode";
import { Gamepad2, MonitorSmartphone, Users, Trophy, ShieldCheck, Map, ChevronRight } from "lucide-react";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import "./page.css";
import "./page-mobile.css";


// Page "Comment Jouer" - Guide pour les nouveaux coachs
// Le contenu est géré via le panneau d'administration (SiteSetting)

export default async function HowToPlayPage() {
  const settings = await getHowToPlaySettings();

  const sections = [
    { 
      key: "how_to_play_what_is_bb", 
      title: "C'est quoi Blood Bowl ?", 
      icon: <Gamepad2 />, 
      image: "/images/how-to-play/intro.png" 
    },
    { 
      key: "how_to_play_platforms", 
      title: "Comment y jouer ?", 
      icon: <MonitorSmartphone />, 
      image: "/images/how-to-play/platforms.png" 
    },
    { 
      key: "how_to_play_community", 
      title: "Communauté & Ligues", 
      icon: <Users />, 
      image: "/images/how-to-play/community.png" 
    },
    { 
      key: "how_to_play_tournaments", 
      title: "Rejoindre un Tournoi", 
      icon: <Trophy />, 
      image: "/images/how-to-play/tournaments.png" 
    },
    { 
      key: "how_to_play_naf_cdf_rtc", 
      title: "NAF, CdF & RTC", 
      icon: <ShieldCheck />, 
      image: "/images/how-to-play/official.png" 
    },
    { 
      key: "how_to_play_challenges", 
      title: "Challenges Régionaux", 
      icon: <Map />, 
      image: "/images/how-to-play/challenges.png" 
    }
  ];

  return (
    <main className="container how-to-play-page">
      <PageHeader 
        title={<><span>Guide du Coach</span></>}
        subtitle="Tout ce qu'il faut savoir pour débuter l'aventure Blood Bowl en France"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="sections-container">
        {sections.map((section, index) => {
          const content = settings[section.key];
          if (!content && index !== 0) return null;

          return (
            <article key={section.key} className="guide-section" id={section.key}>
              <div className="section-visual">
                <img src={section.image} alt={section.title} className="section-image" loading="lazy" />
                <div className="section-overlay"></div>
                <div className="section-icon-float">
                  {section.icon}
                </div>
              </div>
              
              <PremiumCard className="section-card">
                <header className="title-group">
                  <span className="section-number">0{index + 1}</span>
                  <h2 className="section-title">{section.title}</h2>
                </header>
                
                <div 
                  className="section-content bb-content" 
                  dangerouslySetInnerHTML={{ __html: parseBBCode(content || "Contenu en cours de rédaction...") }} 
                />

                {index < sections.length - 1 && (
                  <footer className="section-footer">
                    <a href={`#${sections[index + 1].key}`} className="next-section-link">
                      <span>Prochaine étape</span>
                      <ChevronRight size={18} />
                    </a>
                  </footer>
                )}
              </PremiumCard>
            </article>
          );
        })}
      </div>

      <footer className="guide-footer-cta">
        <PremiumCard className="cta-card">
          <h3>Prêt à lancer vos premiers dés ?</h3>
          <p>Rejoignez les milliers de coachs français déjà présents sur le forum et dans les ligues.</p>
          <div className="cta-buttons">
            <a href="/auth/signin" className="cta-primary">Créer mon compte</a>
            <a href="/forum" className="cta-secondary">Parcourir le forum</a>
          </div>
        </PremiumCard>
      </footer>
    </main>
  );
}
