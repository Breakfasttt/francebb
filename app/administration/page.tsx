"use client";

import { getRolePower, ROLE_POWER } from "@/lib/roles";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BackButton from "@/common/components/BackButton/BackButton";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar, { AdminTab } from "./component/AdminSidebar";
import BackupTab from "./component/BackupTab";
import CoachsTab from "./component/CoachsTab";
import ResetTab from "./component/ResetTab";
import RolesTab from "./component/RolesTab";
import StructureTab from "./component/StructureTab";
import ReferenceDataTab from "./component/ReferenceDataTab";
import GeneralTab from "./component/GeneralTab";
import HowToPlayTab from "./component/HowToPlayTab";

import "./page.css";

export default function AdministrationPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/administration");
    },
  });

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as AdminTab;
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<AdminTab>("general");

  useEffect(() => {
    if (status === "loading") return;
    const userRole = (session?.user as any)?.role;
    if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
      redirect("/");
    }
  }, [session, status]);

  useEffect(() => {
    if (tabParam && ["general", "coachs", "roles", "structure", "backup", "reset", "reference", "howtoplay"].includes(tabParam)) {
      setActiveTab(tabParam as AdminTab);
    }
  }, [tabParam]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (status === "loading") {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) return null;

  const isSuperAdmin = getRolePower(userRole) >= ROLE_POWER.SUPERADMIN;

  return (
    <main className="container admin-container">
      <PageHeader 
        title={<><span>Administration</span></>}
        subtitle="Gestion avancée de la plateforme"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="admin-content-layout">
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} isSuperAdmin={isSuperAdmin} />

        <div className="admin-main-content">
          {activeTab === "general" && (
            <GeneralTab />
          )}

          {activeTab === "coachs" && (
            <CoachsTab currentUserRole={userRole} isSuperAdmin={isSuperAdmin} />
          )}

          {activeTab === "roles" && (
            <RolesTab currentUserRole={userRole} isSuperAdmin={isSuperAdmin} />
          )}

          {activeTab === "structure" && (
            <StructureTab currentUserRole={userRole} isSuperAdmin={isSuperAdmin} />
          )}

          {activeTab === "reference" && (
            <ReferenceDataTab />
          )}
          
          {activeTab === "howtoplay" && (
            <HowToPlayTab />
          )}

          {activeTab === "backup" && isSuperAdmin && <BackupTab />}
          {activeTab === "reset" && isSuperAdmin && <ResetTab />}
        </div>
      </div>
    </main>
  );
}
