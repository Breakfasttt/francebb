"use client";

import { useSession } from "next-auth/react";
import { redirect, useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import AdminSidebar, { AdminTab } from "./component/AdminSidebar";
import RolesTab from "./component/RolesTab";
import BackupTab from "./component/BackupTab";
import ResetTab from "./component/ResetTab";
import { getRolePower, ROLE_POWER } from "@/lib/roles";

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

  const [activeTab, setActiveTab] = useState<AdminTab>("backup");

  useEffect(() => {
    if (status === "loading") return;
    const userRole = (session?.user as any)?.role;
    if (!userRole || getRolePower(userRole) < ROLE_POWER.ADMIN) {
      redirect("/");
    }
  }, [session, status]);

  useEffect(() => {
    if (tabParam && ["roles", "structure", "backup", "reset"].includes(tabParam)) {
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
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/" className="back-button" title="Retour à l'accueil" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 className="page-title">Super <span>Administration</span></h1>
          <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>
            Gestion avancée de la plateforme
          </p>
        </div>
      </header>

      <div className="admin-content-layout">
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} isSuperAdmin={isSuperAdmin} />

        <div className="admin-main-content">
          {activeTab === "roles" && (
             <RolesTab currentUserRole={userRole} isSuperAdmin={isSuperAdmin} />
          )}

          {activeTab === "structure" && (
            <div className="premium-card fade-in" style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
              Le constructeur de base Forum (Drag & Drop) va bientôt être développé.
            </div>
          )}

          {activeTab === "backup" && isSuperAdmin && <BackupTab />}
          {activeTab === "reset" && isSuperAdmin && <ResetTab />}
        </div>
      </div>
    </main>
  );
}
