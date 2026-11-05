"use client";

/**
 * Panneau « Plus » du téléphone (ADR 0006, carte 081) : tout ce qui n'est pas dans la barre basse.
 * Il reste monté en permanence (caché et inerte quand il est fermé), pour que son ouverture soit immédiate.
 * Les outils propres à une page sont affichés dans la page elle-même (carte 156). Ouvert, il se comporte comme
 * une fenêtre : focus déplacé dedans,
 * Échap ou appui à côté pour fermer, défilement de la page bloqué, fermeture au changement de page.
 * Ordre (carte 189) : le profil ou « Se connecter / S'inscrire », les rubriques rangées dans les mêmes groupes que
 * l'accueil (NAV_GROUPS), la gestion pour l'équipe, le choix du thème, la déconnexion à part, puis le pied de page.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Github, LogIn, LogOut, Settings, ShieldAlert } from "lucide-react";
import { Avatar, Button, CountBadge } from "@bbfrance/ui";
import ThemePicker from "./ThemePicker";
import { NAV_GROUPS, isActive, moreNavFor } from "./navItems";
import { signOutUser } from "@/common/utils/signOutUser";
import "./MorePanel.css";

interface MorePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { id: string; name?: string | null; image?: string | null } | null;
  hubLogout: boolean;
  isAdmin: boolean;
  isMod: boolean;
  pendingModCount: number;
}

const sectionTitle = "m-0 border-0 p-0 text-[0.8rem] font-bold tracking-wider text-bb-text-muted uppercase not-italic";

export default function MorePanel({ isOpen, onClose, user, hubLogout, isAdmin, isMod, pendingModCount }: MorePanelProps) {
  const pathname = usePathname();
  const items = moreNavFor(!!user);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermeture au changement de page (un lien du panneau ou du contenu de la page a été suivi)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Ouvert : défilement de la page bloqué, focus dans le panneau, Échap pour fermer
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <div className="more-panel-root lg:hidden" data-open={isOpen}>
      <div className="more-panel-overlay" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        id="more-panel"
        role="dialog"
        aria-modal={isOpen}
        aria-label="Plus"
        tabIndex={-1}
        inert={!isOpen}
        className="more-panel flex flex-col bg-bb-surface font-bb-sans text-bb-text outline-none"
      >
        <div aria-hidden="true" className="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-bb-border" />
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pt-2 pb-4">
          {user ? (
            <Link href="/profile" className="flex min-h-15 items-center gap-3 rounded-bb-lg bg-bb-surface-2 px-3 py-2">
              <Avatar name={user.name} src={user.image} size={44} ring />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-bold">{user.name || "Joueur"}</span>
                <span className="text-sm text-bb-text-muted">Voir mon profil et mes réglages</span>
              </span>
              <ChevronRight size={18} className="text-bb-text-muted" aria-hidden="true" />
            </Link>
          ) : (
            <Button asChild variant="primary" size="tap">
              <Link href="/auth/login">
                <LogIn size={18} aria-hidden="true" /> Se connecter / S&apos;inscrire
              </Link>
            </Button>
          )}

          <nav className="flex flex-col gap-4" aria-label="Rubriques du site">
            {NAV_GROUPS.map((group) => {
              const groupItems = items.filter((item) => item.group === group.id);
              if (groupItems.length === 0) return null;
              return (
                <section key={group.id} className="flex flex-col gap-2" aria-labelledby={`more-group-${group.id}`}>
                  <h2 id={`more-group-${group.id}`} className={sectionTitle}>{group.title}</h2>
                  <ul className="m-0 grid list-none grid-cols-4 gap-2 p-0">
                    {groupItems.map(({ label, href, icon: Icon }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          aria-current={isActive(pathname, href) ? "page" : undefined}
                          className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-bb-lg border border-bb-border bg-bb-bg px-1 text-center text-xs font-semibold text-bb-text aria-[current=page]:border-bb-accent aria-[current=page]:bg-bb-accent-soft"
                        >
                          <Icon size={22} className="text-bb-accent-text" aria-hidden="true" />
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </nav>

          {(isMod || isAdmin) && (
            <section className="flex flex-col gap-2" aria-label="Gestion">
              <h2 className={sectionTitle}>Gestion</h2>
              <div className="grid grid-cols-2 gap-2">
                {isMod && (
                  <Link href="/moderation" className="flex min-h-12 items-center gap-2 rounded-bb-md border border-bb-border px-3 font-semibold">
                    <ShieldAlert size={18} aria-hidden="true" /> Modération
                    <CountBadge count={pendingModCount} className="ml-auto" aria-label={`${pendingModCount} en attente`} />
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/administration" className="flex min-h-12 items-center gap-2 rounded-bb-md border border-bb-border px-3 font-semibold">
                    <Settings size={18} aria-hidden="true" /> Administration
                  </Link>
                )}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-2" aria-labelledby="more-theme">
            <h2 id="more-theme" className={sectionTitle}>Thème</h2>
            <ThemePicker isLoggedIn={!!user} />
          </section>

          {/* Déconnexion : un bloc à part, loin des liens du pied de page, pour ne pas l'appuyer par erreur */}
          {user && (
            <Button type="button" variant="secondary" size="tap" className="w-full" onClick={() => signOutUser(hubLogout)}>
              <LogOut size={16} aria-hidden="true" /> Déconnexion
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-bb-border pt-2 text-sm text-bb-text-muted">
            <Link href="/mentions-legales" className="flex min-h-11 items-center">Mentions légales</Link>
            <a href="https://github.com/Breakfasttt/francebb" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1">
              <Github size={14} aria-hidden="true" /> GitHub
            </a>
            <span>Conçu avec l&apos;aide de l&apos;IA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
