"use client";

/**
 * Page d'administration `/administration` (refonte, carte 099, ADR 0006), réservée aux administrateurs (puissance 90
 * ou plus). L'onglet ouvert est lu dans l'adresse (`?tab=general|roles|coachs|structure|reference|howtoplay|
 * info-mails|reset`) ; sans paramètre, ou avec une valeur inconnue, c'est la configuration générale. L'onglet
 * « Zone de danger » (`reset`, remise à zéro du site) n'existe que pour le super administrateur.
 * Mise en page commune avec la modération : `StaffPageLayout` (onglets en colonne sur ordinateur, en rangée en haut de
 * la page sur téléphone).
 */
import { getRolePower, ROLE_POWER } from "@/lib/roles";
import { BookOpen, Database, Globe, LayoutList, Mail, OctagonAlert, ShieldCheck, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import StaffPageLayout from "@/common/components/StaffPageLayout/StaffPageLayout";
import CoachsTab from "./component/CoachsTab";
import ResetTab from "./component/ResetTab";
import RolesTab from "./component/RolesTab";
import StructureTab from "./component/StructureTab";
import ReferenceDataTab from "./component/ReferenceDataTab";
import GeneralTab from "./component/GeneralTab";
import HowToPlayTab from "./component/HowToPlayTab";
import InfoMailsTab from "./component/InfoMailsTab";

const TABS = [
  { id: "general", label: "Configuration", icon: Globe },
  { id: "roles", label: "Gestion des rôles", icon: ShieldCheck },
  { id: "coachs", label: "Membres & accès", icon: Users },
  { id: "structure", label: "Structure du forum", icon: LayoutList },
  { id: "reference", label: "Données de référence", icon: Database },
  { id: "howtoplay", label: "Guide du débutant", icon: BookOpen },
  { id: "info-mails", label: "Annonces par e-mail", icon: Mail },
  // Réservé au super administrateur
  { id: "reset", label: "Zone de danger", icon: OctagonAlert },
] as const;

type AdminTab = (typeof TABS)[number]["id"];

const sanitizeTab = (tab: string | null): AdminTab => TABS.find((t) => t.id === tab)?.id ?? "general";

export default function AdministrationPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Visiteur non connecté : page de connexion du site, qui le ramènera ici ensuite
      redirect(`/auth/login?callbackUrl=${encodeURIComponent("/administration")}`);
    },
  });

  const searchParams = useSearchParams();
  const activeTab = sanitizeTab(searchParams.get("tab"));

  useEffect(() => {
    if (status === "loading") return;
    const userRole = session?.user?.role;
    if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
      redirect("/");
    }
  }, [session, status]);

  const userRole = session?.user?.role;
  const isSuperAdmin = !!userRole && getRolePower(userRole) >= ROLE_POWER.SUPERADMIN;

  const tabs = TABS.filter((tab) => tab.id !== "reset" || isSuperAdmin).map((tab) => {
    const Icon = tab.icon;
    return {
      label: tab.label,
      href: `/administration?tab=${tab.id}`,
      active: tab.id === activeTab,
      icon: <Icon size={18} aria-hidden="true" className={tab.id === "reset" ? "shrink-0 text-bb-danger-text" : "shrink-0"} />,
    };
  });

  const layoutProps = {
    title: "Administration",
    subtitle: "Gestion avancée de la plateforme",
    tabsLabel: "Onglets de l'administration",
    tabs,
  };

  if (status === "loading") return <StaffPageLayout {...layoutProps} loading />;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) return null;

  return (
    <StaffPageLayout {...layoutProps} contentLabel={TABS.find((t) => t.id === activeTab)?.label}>
      {activeTab === "general" && <GeneralTab />}
      {activeTab === "coachs" && <CoachsTab currentUserRole={userRole} isSuperAdmin={isSuperAdmin} />}
      {activeTab === "roles" && <RolesTab currentUserRole={userRole} isSuperAdmin={isSuperAdmin} />}
      {activeTab === "structure" && <StructureTab />}
      {activeTab === "reference" && <ReferenceDataTab />}
      {activeTab === "howtoplay" && <HowToPlayTab />}
      {activeTab === "info-mails" && <InfoMailsTab />}
      {activeTab === "reset" && isSuperAdmin && <ResetTab />}
    </StaffPageLayout>
  );
}
