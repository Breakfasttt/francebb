"use client";

/*
  Page Hub pour les ressources et outils (Version Dynamique).
*/
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Plus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import ResourceCard from "./component/ResourceCard/ResourceCard";
import ResourceFilterSidebar from "./component/ResourceFilterSidebar/ResourceFilterSidebar";
import Pagination from "@/common/components/Pagination/Pagination";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import { getResources, deleteResourceAction } from "./actions";
import { isModerator, isAdmin } from "@/lib/roles";
import { toast } from "react-hot-toast";
import "./page.css";

export default function RessourcesPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // État pour suppression
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getResources({
      query: searchQuery,
      tags: selectedTags,
      page,
      pageSize: 20
    });
    
    setResources(data.resources);
    setTotalPages(data.totalPages);
    setLoading(false);
  }, [searchQuery, selectedTags, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTags]);

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteResourceAction(deletingId);
    if (res.success) {
      toast.success("Ressource supprimée");
      setDeletingId(null);
      loadData();
    } else {
      toast.error(res.error || "Erreur");
    }
  };

  const user = session?.user as any;

  return (
    <main className="container ressources-page">
      <PageHeader
        title="Ressources"
        subtitle="Outils et guides pour les coachs de Blood Bowl France"
        backHref="/"
        backTitle="Retour à l'accueil"
      />

      <div className="ressources-layout">
        <ResourceFilterSidebar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
          availableTags={[]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="ressources-content">
          <div className="ressources-top-actions">
            <Link href="/ressources/submit" className="submit-resource-btn">
              <Plus size={18} />
              Soumettre une ressource
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={40} color="var(--primary)" />
              <p>Chargement des ressources...</p>
            </div>
          ) : (
            <>
              {resources.length === 0 ? (
                <PremiumCard className="empty-results">
                  <p>Aucune ressource ne correspond à vos critères.</p>
                </PremiumCard>
              ) : (
                <>
                  <div className={`resources-${viewMode}`}>
                    {resources.map(res => {
                      const isAuthor = user?.id === res.authorId;
                      const isMod = isModerator(user?.role);
                      const isSystem = res.isSystem || res.id === 'bbpusher';
                      
                      const canEdit = isSystem ? isAdmin(user?.role) : (isMod || isAuthor);
                      const canDelete = !isSystem && (isMod || isAuthor);
                      
                      return (
                        <ResourceCard 
                          key={res.id} 
                          resource={res} 
                          viewMode={viewMode}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          onDelete={() => setDeletingId(res.id)}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="pagination-wrapper" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <Pagination 
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer la ressource"
        message="Voulez-vous vraiment supprimer cette ressource ?"
        isDanger
      />
    </main>
  );
}
