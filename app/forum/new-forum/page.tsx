import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { ArrowLeft, FolderPlus } from "lucide-react";
import ForumSidebar from "@/components/forum/ForumSidebar";
import "../forum.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createForum, getCategories, getForums } from "../actions";


export default async function NewForumPage({ searchParams }: { searchParams: Promise<{ categoryId?: string, parentForumId?: string }> }) {
  const { categoryId, parentForumId } = await searchParams;
  const session = await auth();
  const userRole = session?.user?.role;

  if (!userRole || !isModerator(userRole)) {
    redirect("/forum");
  }

  const categories = await getCategories();
  const topForums = await getForums();

  return (
    <main className="container forum-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <Link href="/forum" className="back-button" title="Retour au forum" style={{ position: 'absolute', left: 0 }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Créer un <span>nouveau forum</span></h1>
          <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Ajoutez une nouvelle section ou un sous-forum à la communauté</p>
        </div>
      </header>
 
       <div className="forum-layout">
         <div className="forum-main-content">

      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(26, 26, 32, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <form action={createForum} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom du forum</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex: Discussions générales, Archives..."
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Décrivez brièvement le contenu de ce forum"
              style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            ></textarea>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600 }}>Type et Emplacement</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="categoryId" style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Catégorie principale</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={categoryId || ""}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                >
                  <option value="">-- Aucune (Sous-forum) --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="parentForumId" style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>Forum parent (optionnel)</label>
                <select
                  id="parentForumId"
                  name="parentForumId"
                  defaultValue={parentForumId || ""}
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
                >
                  <option value="">-- Aucun (Top-level) --</option>
                  {topForums.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="order" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Ordre d'affichage</label>
            <input
              type="number"
              id="order"
              name="order"
              defaultValue={0}
              style={{ width: '100px', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white' }}
            />
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="widget-button" style={{ flex: 1 }}>
              <FolderPlus size={18} />
              Créer le forum
            </button>
            <Link href="/forum" className="widget-button secondary-btn" style={{ flex: 1, textAlign: 'center' }}>
              Annuler
            </Link>
          </div>
        </form>
      </div>
        </div>
       <ForumSidebar />
     </div>
   </main>
  );
}
