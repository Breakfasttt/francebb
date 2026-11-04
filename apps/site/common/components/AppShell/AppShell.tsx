"use client";

/**
 * Nouvelle coquille du site (ADR 0006, carte 081) : ce qui entoure chaque page.
 * - Téléphone : petite barre haute (logo, cloche des notifications ou connexion) et barre basse à cinq onglets
 *   (Accueil, Forum, Tournois, Messages, Plus) ; « Plus » ouvre le panneau du reste du site.
 * - Ordinateur : barre haute avec les destinations principales, un menu « Plus », les pastilles et le menu du compte.
 * La cloche (carte 167) mène à la page /notifications ; sa pastille compte les notifications non lues. Sur téléphone,
 * elle est dans la barre haute, pour ne pas ajouter un sixième onglet à la barre basse.
 * La barre basse se cache pendant la saisie (clavier ouvert) et sur les écrans de rédaction du forum (répondre,
 * modifier un message, nouveau sujet), qui occupent tout l'écran.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogIn, LogOut, Mail, Palette, Settings, ShieldAlert, User } from "lucide-react";
import { ActionMenu, Avatar, Button, CountBadge, Sheet, SheetContent, cn } from "@bbfrance/ui";
import SiteLogo from "@/common/components/SiteLogo/SiteLogo";
import type { NavCounts } from "./navCounts";
import { useNavCounts } from "./useNavCounts";
import { signOutUser } from "@/common/utils/signOutUser";
import MorePanel from "./MorePanel";
import ThemePicker from "./ThemePicker";
import { DESKTOP_NAV, MORE_ICON, MORE_NAV, PRIMARY_NAV, isActive, isComposePath } from "./navItems";
import "./AppShell.css";

interface AppShellProps {
  user?: { id: string; name?: string | null; image?: string | null } | null;
  hubLogout: boolean;
  isAdmin: boolean;
  isMod: boolean;
  counts?: Promise<NavCounts>;
}

/**
 * Délai entre la sortie d'un champ et le retour de la barre basse (carte 113). Sur téléphone, quand on appuie sur un
 * bouton juste après avoir écrit, le champ perd le focus au milieu de l'appui : le navigateur envoie « doigt posé »
 * (qui retire le focus du champ), puis « doigt levé » et le clic, et il recherche l'élément sous le doigt à chacune
 * de ces étapes. Si la barre basse revenait aussitôt, la mise en page changerait entre ces étapes et le clic pourrait
 * tomber à côté du bouton. Avec ce délai, l'appui entier se termine avant que la barre ne revienne.
 */
const TYPING_RELEASE_DELAY_MS = 350;

/** Marque la page pendant la saisie dans un champ : la barre basse s'efface pour laisser la place au clavier. */
function useTypingFlag() {
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "SELECT" ||
        (el.tagName === "INPUT" && !["checkbox", "radio", "button", "submit", "range", "file", "color"].includes((el as HTMLInputElement).type)));
    let releaseTimer: number | undefined;
    const onIn = (event: FocusEvent) => {
      if (!isField(event.target)) return;
      window.clearTimeout(releaseTimer);
      document.documentElement.dataset.typing = "true";
    };
    // Retrait différé ; s'il est passé directement dans un autre champ entre-temps, la barre reste cachée
    const onOut = () => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        if (!isField(document.activeElement)) delete document.documentElement.dataset.typing;
      }, TYPING_RELEASE_DELAY_MS);
    };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      window.clearTimeout(releaseTimer);
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      delete document.documentElement.dataset.typing;
    };
  }, []);
}

const navLinkClass = (active: boolean) =>
  cn(
    // Lien actif : couleur et trait sous le lien, sans fond (le contraste reste celui de la barre dans chaque thème)
    "inline-flex min-h-11 items-center border-b-2 px-3 text-[0.95rem] font-semibold",
    active ? "border-bb-nav-active text-bb-nav-active" : "border-transparent text-bb-nav-text hover:border-bb-nav-text"
  );

const iconLinkClass =
  "relative inline-flex size-11 items-center justify-center rounded-bb-md text-bb-nav-text hover:text-bb-nav-active";

/** Cloche des notifications (carte 167), carré de 44 pixels avec la pastille du nombre de notifications non lues. */
function NotificationBell({ count, active }: { count: number; active: boolean }) {
  return (
    <Link
      href="/notifications"
      aria-label={`Notifications, ${count} non lue(s)`}
      aria-current={active ? "page" : undefined}
      className={cn(iconLinkClass, active && "text-bb-nav-active")}
    >
      <Bell size={22} aria-hidden="true" />
      <CountBadge count={count} className="absolute top-1 right-0.5" aria-hidden="true" />
    </Link>
  );
}

export default function AppShell({ user, hubLogout, isAdmin, isMod, counts }: AppShellProps) {
  const { unreadCount, notificationCount, pendingModCount } = useNavCounts(counts);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Écrans plein écran sans barre basse : les écrans de rédaction du forum (carte 087). L'éditeur BBScheme, qui en
  // faisait partie, a quitté le site (carte 179).
  const immersive = isComposePath(pathname);
  const [moreOpen, setMoreOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  useTypingFlag();

  const desktopMoreItems = MORE_NAV.filter((item) => !DESKTOP_NAV.includes(item)).map((item) => ({ label: item.label, href: item.href }));

  return (
    <>
      {/* Barre haute */}
      <header className="app-topbar sticky top-0 z-[5000] border-b border-bb-nav-border bg-bb-nav-bg font-bb-sans">
        {/* Téléphone */}
        <div className="flex h-14 items-center gap-2 px-2 lg:hidden">
          {/* SiteLogo est lui-même un lien vers l'accueil */}
          {!isHome && <SiteLogo scale={0.5} />}
          <div className="flex-1" />
          {user && <NotificationBell count={notificationCount} active={pathname === "/notifications"} />}
          {!user && (
            <Button asChild variant="primary" size="tap">
              <Link href="/auth/login">
                <LogIn size={16} aria-hidden="true" /> Connexion
              </Link>
            </Button>
          )}
        </div>

        {/* Ordinateur */}
        <div className="mx-auto hidden h-16 max-w-[1280px] items-center gap-4 px-6 lg:flex">
          <div className={cn("flex items-center", isHome && "invisible")}>
            <SiteLogo scale={0.6} />
          </div>
          <nav aria-label="Navigation principale" className="flex flex-1 flex-wrap items-center gap-1">
            {DESKTOP_NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined} className={navLinkClass(isActive(pathname, item.href))}>
                {item.label}
              </Link>
            ))}
            <ActionMenu
              label="Plus de rubriques"
              items={desktopMoreItems}
              linkComponent={Link}
              triggerClassName="px-3 gap-1 font-semibold text-[0.95rem] text-bb-nav-text hover:bg-transparent hover:text-bb-nav-active"
              trigger={<>Plus <ChevronDown size={16} aria-hidden="true" /></>}
            />
          </nav>

          {user ? (
            <div className="flex items-center gap-1">
              <NotificationBell count={notificationCount} active={pathname === "/notifications"} />
              <Link href="/messagerie" aria-label={`Messagerie, ${unreadCount} message(s) non lu(s)`} className={iconLinkClass}>
                <Mail size={22} aria-hidden="true" />
                <CountBadge count={unreadCount} className="absolute top-1 right-0.5" aria-hidden="true" />
              </Link>
              {isMod && (
                <Link href="/moderation" aria-label={`Modération, ${pendingModCount} action(s) en attente`} className={iconLinkClass}>
                  <ShieldAlert size={22} aria-hidden="true" />
                  <CountBadge count={pendingModCount} className="absolute top-1 right-0.5" aria-hidden="true" />
                </Link>
              )}
              {isAdmin && (
                <Link href="/administration" aria-label="Administration" className={iconLinkClass}>
                  <Settings size={22} aria-hidden="true" />
                </Link>
              )}
              <ActionMenu
                label="Menu du compte"
                triggerClassName="gap-2 rounded-full pr-2 pl-1 text-bb-nav-text hover:bg-transparent hover:text-bb-nav-active"
                trigger={<><Avatar name={user.name} src={user.image} size={34} ring /><span className="max-w-40 truncate text-sm font-semibold">{user.name || "Joueur"}</span><ChevronDown size={16} aria-hidden="true" /></>}
                linkComponent={Link}
                items={[
                  { label: "Mon profil", href: "/profile", icon: <User size={16} aria-hidden="true" /> },
                  { label: "Réglages du compte", href: "/profile?tab=settings", icon: <Settings size={16} aria-hidden="true" /> },
                  { label: "Changer de thème", onSelect: () => setThemeOpen(true), icon: <Palette size={16} aria-hidden="true" /> },
                  { label: "Déconnexion", onSelect: () => signOutUser(hubLogout), icon: <LogOut size={16} aria-hidden="true" /> },
                ]}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="button" variant="quiet" size="tap-icon" aria-label="Changer de thème" className="text-bb-nav-text hover:bg-transparent hover:text-bb-nav-active" onClick={() => setThemeOpen(true)}>
                <Palette size={20} aria-hidden="true" />
              </Button>
              <Button asChild variant="primary" size="tap">
                <Link href="/auth/login">
                  <LogIn size={16} aria-hidden="true" /> Connexion
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Barre basse du téléphone */}
      {!immersive && (
        <nav aria-label="Navigation principale" className="app-bottom-nav fixed inset-x-0 bottom-0 z-[5000] grid grid-cols-5 border-t border-bb-nav-border bg-bb-nav-bg font-bb-sans lg:hidden">
          {PRIMARY_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            const badge = href === "/messagerie" ? unreadCount : 0;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={badge ? `${label}, ${badge} non lu(s)` : undefined}
                className={cn("flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-xs leading-tight", active ? "font-bold text-bb-nav-active" : "font-medium text-bb-nav-text")}
              >
                <span className="relative flex" aria-hidden="true">
                  <Icon size={24} />
                  <CountBadge count={badge} className="absolute -top-1 -right-2.5" />
                </span>
                {label}
              </Link>
            );
          })}
          <Button
            type="button"
            variant="quiet"
            aria-expanded={moreOpen}
            aria-controls="more-panel"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn("flex h-auto min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-none bg-transparent p-0 text-xs leading-tight hover:bg-transparent", moreOpen ? "font-bold text-bb-nav-active" : "font-medium text-bb-nav-text")}
          >
            <span className="relative flex" aria-hidden="true">
              <MORE_ICON size={24} />
              <CountBadge count={isMod ? pendingModCount : 0} className="absolute -top-1 -right-2.5" />
            </span>
            Plus
          </Button>
        </nav>
      )}

      <MorePanel
        isOpen={moreOpen}
        onClose={closeMore}
        user={user}
        hubLogout={hubLogout}
        isAdmin={isAdmin}
        isMod={isMod}
        pendingModCount={pendingModCount}
      />

      <Sheet open={themeOpen} onOpenChange={setThemeOpen}>
        <SheetContent side="center" title="Thème du site" description="Le thème change l'apparence de tout le site.">
          <div className="pb-2">
            <ThemePicker isLoggedIn={!!user} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
