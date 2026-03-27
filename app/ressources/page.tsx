/*
  Page Hub pour les ressources et outils.
*/
import Link from "next/link";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { BookOpen, Map, HelpCircle, Layout, ExternalLink } from "lucide-react";
import "./page.css";

export default function RessourcesPage() {
  const tools = [
    {
      id: "bbpusher",
      title: "BB Pusher",
      description: "Plateau tactique interactif pour Blood Bowl. Placez vos joueurs, simulez des poussées et partagez vos schémas tactiques.",
      icon: <Map size={32} />,
      href: "/bbpusher",
      badge: "Nouveau"
    },
    {
      id: "bbowltools",
      title: "Outils Blood Bowl",
      description: "Liens et outils utiles pour la communauté Blood Bowl France.",
      icon: <Layout size={32} />,
      href: "/bbowltools",
      disabled: true
    },
    {
      id: "guides",
      title: "Guides & Règles",
      description: "Documentation, aides de jeu et règles officielles pour Blood Bowl 2020.",
      icon: <BookOpen size={32} />,
      href: "/articles", // Redirige vers articles pour le moment
    }
  ];

  return (
    <main className="container ressources-container">
      <PageHeader
        title="Ressources"
        subtitle="Outils et guides pour les coachs de Blood Bowl France"
      />

      <section className="tools-grid">
        {tools.map((tool) => (
          <div key={tool.id} className={`tool-card premium-card ${tool.disabled ? 'disabled' : 'hover-effect'}`}>
            {tool.badge && <span className="tool-badge">{tool.badge}</span>}
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-content">
              <h3>{tool.title}</h3>
              <p>{tool.description}</p>
              {tool.disabled ? (
                <span className="tool-link-disabled">Bientôt disponible</span>
              ) : (
                <Link href={tool.href} className="tool-link">
                  Accéder à l'outil <ExternalLink size={14} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="help-section premium-card">
        <div className="help-content">
          <HelpCircle size={40} className="help-icon" />
          <div>
            <h3>Besoin d'aide ou d'une nouvelle ressource ?</h3>
            <p>N'hésitez pas à proposer des outils ou à signaler des bugs sur notre Discord.</p>
          </div>
        </div>
        <a href="#" className="btn-primary">Rejoindre le Discord</a>
      </section>
    </main>
  );
}
