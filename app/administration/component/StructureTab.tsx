"use client";

// Gestion de la structure du forum : catégories, forums, sous-forums (max 2 niveaux)
// DnD pour réordonner au sein du même niveau, boutons ←/→ pour changer de niveau

import Modal from "@/common/components/Modal/Modal";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import { UserRole } from "@/lib/roles";
import {
  ArrowBigDown, ArrowBigUp, ChevronDown, ChevronRight, FolderGit2, GripVertical,
  IndentDecrease, IndentIncrease, Plus, Settings2, Trophy, Trash2
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { getAllRoles } from "../actions";
import {
  createCategory, createForum, deleteCategory, deleteForum,
  getForumStructure, reorderCategories, reorderForums,
  updateCategory, updateForum
} from "../actionsStructure";

import {
  closestCenter, DndContext, DragEndEvent, DragOverlay,
  DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StructureTabProps {
  currentUserRole: UserRole;
  isSuperAdmin: boolean;
}

// ------ Composants DND ------
function SortableCategoryItem({ category, onEditClick, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `cat-${category.id}`,
    data: { type: 'Category', category }
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [expanded, setExpanded] = useState(true);

  return (
    <div ref={setNodeRef} style={style} className="category-block">
      <div className="category-header">
        <div {...attributes} {...listeners} className="drag-handle"><GripVertical size={20} /></div>
        <div className="cat-title-container">
          <h4 className="cat-title">{category.name}</h4>
          <span className={`badge-role ${category.allowedRoles === "ALL" ? "badge-all" : "badge-restricted"}`}>
            {category.allowedRoles === "ALL" ? "🌐 Public" : `🔒 ${category.allowedRoles}`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <span>Forums ({category.forums?.length || 0})</span>
          </button>
          <Tooltip text="Gérer la catégorie">
            <button className="action-button secondary-btn" onClick={() => onEditClick(category, 'Category')}>
              <Settings2 size={16} /> <span>Éditer</span>
            </button>
          </Tooltip>
        </div>
      </div>
      {expanded && <div className="category-content">{children}</div>}
    </div>
  );
}

function SortableForumItem({
  forum, onEditClick, level, onIndent, onDedent, canIndent, canDedent,
  onMoveUpCat, onMoveDownCat, canMoveUpCat, canMoveDownCat, children
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `forum-${forum.id}`,
    data: { type: 'Forum', forum }
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [expanded, setExpanded] = useState(false);
  const hasSubForums = (forum.subForums?.length || 0) > 0;

  return (
    <div ref={setNodeRef} style={style} className={`forum-block level-${level}`}>
      <div className="forum-row">
        <div {...attributes} {...listeners} className="drag-handle"><GripVertical size={16} /></div>
        <div className="forum-title-container">
          {forum.isTournamentForum ? (
            <Trophy size={15} color="var(--accent)" />
          ) : (
            <FolderGit2 size={15} color="var(--primary)" />
          )}
          <strong>{forum.name}</strong>
          <span className={`badge-role ${forum.allowedRoles === "ALL" ? "badge-all" : "badge-restricted"}`}>
            {forum.allowedRoles === "ALL" ? "🌐 Public" : `🔒 ${forum.allowedRoles}`}
          </span>
        </div>
        <div className="forum-actions">
          {/* Déplacement inter-catégorie */}
          {canMoveUpCat && (
            <Tooltip text="Déplacer vers la catégorie précédente" position="top">
              <button className="level-btn" onClick={onMoveUpCat}>
                <ArrowBigUp size={15} />
              </button>
            </Tooltip>
          )}
          {canMoveDownCat && (
            <Tooltip text="Déplacer vers la catégorie suivante" position="top">
              <button className="level-btn" onClick={onMoveDownCat}>
                <ArrowBigDown size={15} />
              </button>
            </Tooltip>
          )}

          {/* Boutons changement de niveau */}
          {canDedent && (
            <Tooltip text="Remonter d'un niveau (dédenter)" position="top">
              <button className="level-btn" onClick={onDedent}>
                <IndentDecrease size={15} />
              </button>
            </Tooltip>
          )}
          {canIndent && (
            <Tooltip text="Descendre d'un niveau (indenter)" position="top">
              <button className="level-btn" onClick={onIndent}>
                <IndentIncrease size={15} />
              </button>
            </Tooltip>
          )}

          <Tooltip text="Gérer le forum" position="top">
            <button className="action-button secondary-btn icon-btn" onClick={() => onEditClick(forum, 'Forum')}>
              <Settings2 size={14} />
            </button>
          </Tooltip>

          {/* Bouton pour ouvrir les enfants, le plus à droite */}
          {hasSubForums && (
            <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>{forum.subForums.length}/5</span>
            </button>
          )}
        </div>
      </div>
      {expanded && hasSubForums && (
        <div className="sub-forums-container">{children}</div>
      )}
    </div>
  );
}

// ------ StructureTab ------
export default function StructureTab({ currentUserRole, isSuperAdmin }: StructureTabProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'Category' | 'Forum'>('Category');
  const [parentTargetId, setParentTargetId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAllowedRoles, setFormAllowedRoles] = useState<string>("ALL");
  const [formIsTournament, setFormIsTournament] = useState(false);
  const [availableDbRoles, setAvailableDbRoles] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { loadData(); }, []);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const [cats, roles] = await Promise.all([getForumStructure(), getAllRoles()]);
    setCategories(cats);
    setAvailableDbRoles(roles);
    if (!silent) setIsLoading(false);
  };

  // --- DND : réordonnancement au sein du même niveau uniquement ---
  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStr = active.id as string;
    const overStr = over.id as string;

    // Réordonnancement de catégories
    if (activeStr.startsWith('cat-') && overStr.startsWith('cat-')) {
      const oldIdx = categories.findIndex(c => `cat-${c.id}` === activeStr);
      const newIdx = categories.findIndex(c => `cat-${c.id}` === overStr);
      const newArr = arrayMove(categories, oldIdx, newIdx);
      setCategories(newArr);
      startTransition(async () => {
        await reorderCategories(newArr.map(c => c.id));
        toast.success("Catégories réordonnées");
        loadData(true);
      });
      return;
    }

    // Réordonnancement de forums (même niveau)
    if (activeStr.startsWith('forum-') && overStr.startsWith('forum-')) {
      const draggedForum = active.data.current?.forum;
      const targetForum = over.data.current?.forum;
      if (!draggedForum || !targetForum) return;

      // Même parent seulement
      if (draggedForum.categoryId !== targetForum.categoryId || draggedForum.parentForumId !== targetForum.parentForumId) {
        toast("Utilisez les boutons ← → pour changer de niveau", { icon: "ℹ️" });
        return;
      }

      const parentId = draggedForum.categoryId || draggedForum.parentForumId;
      const isCat = !!draggedForum.categoryId;
      let list: any[] = [];
      if (isCat) {
        list = categories.find(c => c.id === parentId)?.forums || [];
      } else {
        for (const cat of categories) {
          const parent = cat.forums?.find((f: any) => f.id === parentId);
          if (parent) { list = parent.subForums || []; break; }
        }
      }
      const oldIdx = list.findIndex((f: any) => `forum-${f.id}` === activeStr);
      const newIdx = list.findIndex((f: any) => `forum-${f.id}` === overStr);
      if (oldIdx === -1 || newIdx === -1) return;
      const newArr = arrayMove(list, oldIdx, newIdx);

      if (isCat) {
        setCategories(prev => prev.map(c => c.id === parentId ? { ...c, forums: newArr } : c));
      }
      startTransition(async () => {
        const res = await reorderForums(parentId, isCat, newArr.map((f: any) => f.id));
        if (res.success) toast.success("Ordre mis à jour");
        else toast.error("Erreur de réorganisation");
        loadData(true);
      });
    }
  };

  // --- INDENT / DEDENT ---

  // Indenter : forum racine → sous-forum du forum juste au-dessus
  const handleIndent = (forum: any, categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    const list: any[] = cat.forums || [];
    const idx = list.findIndex((f: any) => f.id === forum.id);
    if (idx <= 0) { toast.error("Impossible : aucun forum au-dessus pour y être indenté"); return; }
    const targetParent = list[idx - 1];
    if ((targetParent.subForums?.length || 0) >= 5) { toast.error("Le forum au-dessus a déjà 5 sous-forums"); return; }

    const newOrder = [...(targetParent.subForums || []).map((f: any) => f.id), forum.id];
    startTransition(async () => {
      const res = await reorderForums(targetParent.id, false, newOrder);
      if (res.success) toast.success(`"${forum.name}" est maintenant sous-forum de "${targetParent.name}"`);
      else toast.error(res.error || "Erreur");
      loadData(true);
    });
  };

  // Indenter niveau 1 → niveau 2 (sous-forum → sous-forum du voisin au-dessus)
  const handleIndentSub = (forum: any, parentForumId: string) => {
    let parentForum: any = null;
    for (const cat of categories) {
      parentForum = cat.forums?.find((f: any) => f.id === parentForumId);
      if (parentForum) break;
    }
    if (!parentForum) return;
    const list: any[] = parentForum.subForums || [];
    const idx = list.findIndex((f: any) => f.id === forum.id);
    if (idx <= 0) { toast.error("Impossible : aucun sous-forum au-dessus"); return; }
    const targetParent = list[idx - 1];
    if ((targetParent.subForums?.length || 0) >= 5) { toast.error("Le sous-forum au-dessus a déjà 5 sous-forums"); return; }

    const newOrder = [...(targetParent.subForums || []).map((f: any) => f.id), forum.id];
    startTransition(async () => {
      const res = await reorderForums(targetParent.id, false, newOrder);
      if (res.success) toast.success(`"${forum.name}" est maintenant sous-forum de niveau 2`);
      else toast.error(res.error || "Erreur");
      loadData(true);
    });
  };

  // Dédenter niveau 1 → forum racine dans la catégorie parente
  const handleDedent = (forum: any) => {
    let parentCategoryId: string | null = null;
    for (const cat of categories) {
      const found = cat.forums?.find((f: any) => f.subForums?.some((sf: any) => sf.id === forum.id));
      if (found) { parentCategoryId = cat.id; break; }
    }
    if (!parentCategoryId) return;
    const cat = categories.find(c => c.id === parentCategoryId);
    const newOrder = [...(cat?.forums || []).map((f: any) => f.id), forum.id];
    startTransition(async () => {
      const res = await reorderForums(parentCategoryId!, true, newOrder);
      if (res.success) toast.success(`"${forum.name}" est maintenant un forum racine`);
      else toast.error(res.error || "Erreur");
      loadData(true);
    });
  };

  // Dédenter niveau 2 → sous-forum niveau 1 du grand-parent
  const handleDedentSub = (forum: any) => {
    let grandParentForumId: string | null = null;
    for (const cat of categories) {
      for (const f of (cat.forums || [])) {
        const found = f.subForums?.find((sf: any) => sf.subForums?.some((ssf: any) => ssf.id === forum.id));
        if (found) { grandParentForumId = f.id; break; }
      }
      if (grandParentForumId) break;
    }
    if (!grandParentForumId) return;
    let grandParent: any = null;
    for (const cat of categories) {
      grandParent = cat.forums?.find((f: any) => f.id === grandParentForumId);
      if (grandParent) break;
    }
    const newOrder = [...(grandParent?.subForums || []).map((f: any) => f.id), forum.id];
    startTransition(async () => {
      const res = await reorderForums(grandParentForumId!, false, newOrder);
      if (res.success) toast.success(`"${forum.name}" est maintenant sous-forum de niveau 1`);
      else toast.error(res.error || "Erreur");
      loadData(true);
    });
  };

  // Changement de catégorie (pour forums racines)
  const handleMoveCat = (forum: any, direction: 'up' | 'down') => {
    const curCatIdx = categories.findIndex(c => c.id === forum.categoryId);
    if (curCatIdx === -1) return;
    const targetCat = categories[direction === 'up' ? curCatIdx - 1 : curCatIdx + 1];
    if (!targetCat) return;

    const newOrder = [...(targetCat.forums || []).map((f: any) => f.id), forum.id];
    startTransition(async () => {
      const res = await reorderForums(targetCat.id, true, newOrder);
      if (res.success) toast.success(`Forum déplacé vers "${targetCat.name}"`);
      else toast.error(res.error || "Erreur");
      loadData(true);
    });
  };

  // ----- EDIT PANEL -----
  const openCreateCategory = () => {
    setEditingItem(null); setEditingType('Category'); setParentTargetId(null);
    setFormName(""); setFormDesc(""); setFormAllowedRoles("ALL"); setIsPanelOpen(true);
  };
  const openCreateForum = (parentId = "") => {
    setEditingItem(null); setEditingType('Forum'); setParentTargetId(parentId);
    setFormName(""); setFormDesc(""); setFormAllowedRoles("ALL"); setFormIsTournament(false); setIsPanelOpen(true);
  };
  const openEdit = (item: any, type: 'Category' | 'Forum') => {
    setEditingItem(item); setEditingType(type);
    setParentTargetId(item.categoryId || item.parentForumId || null);
    setFormName(item.name); setFormDesc(item.description || "");
    setFormAllowedRoles(item.allowedRoles || "ALL"); 
    setFormIsTournament(item.isTournamentForum || false);
    setIsPanelOpen(true);
  };

  const handleSave = () => {
    if (!formName) return toast.error("Le nom est obligatoire");
    startTransition(async () => {
      let res;
      if (editingType === 'Category') {
        res = editingItem
          ? await updateCategory(editingItem.id, { name: formName, description: formDesc, allowedRoles: formAllowedRoles })
          : await createCategory({ name: formName, description: formDesc, allowedRoles: formAllowedRoles });
      } else {
        if (editingItem) {
          res = await updateForum(editingItem.id, { name: formName, description: formDesc, allowedRoles: formAllowedRoles, isTournamentForum: formIsTournament });
        } else {
          const isCat = categories.some((c: any) => c.id === parentTargetId);
          res = await createForum({
            name: formName, description: formDesc, allowedRoles: formAllowedRoles,
            isTournamentForum: formIsTournament,
            categoryId: isCat ? (parentTargetId ?? undefined) : undefined,
            parentForumId: !isCat ? (parentTargetId ?? undefined) : undefined,
          });
        }
      }
      if (res?.success) { toast.success("Sauvegardé"); setIsPanelOpen(false); loadData(true); }
      else toast.error(res?.error || "Erreur");
    });
  };

  const handleDeleteItem = () => setIsDeleteModalOpen(true);
  const confirmDelete = () => {
    startTransition(async () => {
      const res = editingType === 'Category' ? await deleteCategory(editingItem.id) : await deleteForum(editingItem.id);
      if (res?.success) { toast.success("Supprimé"); setIsDeleteModalOpen(false); setIsPanelOpen(false); loadData(true); }
      else { toast.error(res?.error || "Erreur"); setIsDeleteModalOpen(false); }
    });
  };

  // Trouver le nom du forum actif pour le DragOverlay
  const getActiveName = () => {
    if (!activeId) return "";
    for (const cat of categories) {
      const f = cat.forums?.find((f: any) => `forum-${f.id}` === activeId);
      if (f) return f.name;
      for (const rf of (cat.forums || [])) {
        const sf = rf.subForums?.find((sf: any) => `forum-${sf.id}` === activeId);
        if (sf) return sf.name;
      }
    }
    return "Forum";
  };

  return (
    <div className="premium-card fade-in" style={{ padding: '2rem', display: 'flex', gap: '2rem', position: 'relative' }}>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}
        title={`Supprimer ${editingType === 'Category' ? 'la catégorie' : 'le forum'} "${editingItem?.name}" ?`}
        confirmText="Supprimer définitivement" onConfirm={confirmDelete} variant="danger">
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Cette action est <strong style={{ color: 'var(--danger)' }}>irréversible</strong>. L&apos;élément doit être <strong>vide</strong> pour pouvoir être supprimé.
        </p>
      </Modal>

      {/* MAIN */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FolderGit2 size={28} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Structure du forum</h3>
          </div>
          <button className="action-button primary-btn" onClick={openCreateCategory}>
            <Plus size={18} /> Ajouter une Catégorie
          </button>
        </div>

        <div className="struct-legend">
          <span><GripVertical size={14} /> Réordonner</span>
          <span><IndentIncrease size={14} /> Indenter</span>
          <span><IndentDecrease size={14} /> Dédenter</span>
          <span><ArrowBigUp size={14} /> Catégorie Préc.</span>
          <span><ArrowBigDown size={14} /> Catégorie Suiv.</span>
        </div>

        {isLoading ? <p style={{ color: 'var(--text-muted)' }}>Chargement...</p> : (
          <DndContext sensors={sensors} collisionDetection={closestCenter}
            onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

            <SortableContext items={categories.map(c => `cat-${c.id}`)} strategy={verticalListSortingStrategy}>
              <div className="categories-list">
                {categories.map((cat, ci) => (
                  <SortableCategoryItem key={`cat-${cat.id}`} category={cat} onEditClick={openEdit}>
                    <SortableContext items={(cat.forums || []).map((f: any) => `forum-${f.id}`)} strategy={verticalListSortingStrategy}>
                      <div className="forums-list">
                        {(cat.forums || []).map((forum: any, fi: number) => (
                          <SortableForumItem
                            key={`forum-${forum.id}`} forum={forum} onEditClick={openEdit}
                            level={1}
                            canIndent={fi > 0} // peut indenter si il y a un forum au-dessus
                            canDedent={false}   // forum racine ne peut pas dédenter
                            canMoveUpCat={ci > 0}
                            canMoveDownCat={ci < categories.length - 1}
                            onIndent={() => handleIndent(forum, cat.id)}
                            onDedent={() => {}}
                            onMoveUpCat={() => handleMoveCat(forum, 'up')}
                            onMoveDownCat={() => handleMoveCat(forum, 'down')}
                          >
                            {/* SOUS-FORUMS NIVEAU 1 */}
                            <SortableContext items={(forum.subForums || []).map((sf: any) => `forum-${sf.id}`)} strategy={verticalListSortingStrategy}>
                              <div className="sub-forums-list">
                                {(forum.subForums || []).map((sf: any, sfi: number) => (
                                  <SortableForumItem
                                    key={`forum-${sf.id}`} forum={sf} onEditClick={openEdit}
                                    level={2}
                                    canIndent={sfi > 0 && (sf.subForums?.length || 0) === 0} // peut indenter si pas de sous-sous-forums + voisin au-dessus
                                    canDedent={true}
                                    onIndent={() => handleIndentSub(sf, forum.id)}
                                    onDedent={() => handleDedent(sf)}
                                  >
                                    {/* SOUS-FORUMS NIVEAU 2 (max) */}
                                    <SortableContext items={(sf.subForums || []).map((ssf: any) => `forum-${ssf.id}`)} strategy={verticalListSortingStrategy}>
                                      <div className="sub-forums-list">
                                        {(sf.subForums || []).map((ssf: any) => (
                                          <SortableForumItem
                                            key={`forum-${ssf.id}`} forum={ssf} onEditClick={openEdit}
                                            level={3}
                                            canIndent={false}
                                            canDedent={true}
                                            onIndent={() => {}}
                                            onDedent={() => handleDedentSub(ssf)}
                                          />
                                        ))}
                                        {(sf.subForums?.length || 0) < 5 && (
                                          <button className="add-forum-btn" onClick={() => openCreateForum(sf.id)}>
                                            <Plus size={14} /> Ajouter un sous-forum
                                          </button>
                                        )}
                                      </div>
                                    </SortableContext>
                                  </SortableForumItem>
                                ))}
                                {(forum.subForums?.length || 0) < 5 && (
                                  <button className="add-forum-btn" onClick={() => openCreateForum(forum.id)}>
                                    <Plus size={14} /> Ajouter un sous-forum
                                  </button>
                                )}
                              </div>
                            </SortableContext>
                          </SortableForumItem>
                        ))}
                        <button className="add-forum-btn" onClick={() => openCreateForum(cat.id)}>
                          <Plus size={16} /> Ajouter un forum ici
                        </button>
                      </div>
                    </SortableContext>
                  </SortableCategoryItem>
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId && (
                <div className="forum-block drag-ghost">
                  <div className="forum-row">
                    <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                    <FolderGit2 size={15} color="var(--primary)" />
                    <strong style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>{getActiveName()}</strong>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* SIDE PANEL */}
      {isPanelOpen && (
        <div className="side-panel fade-in">
          <div className="panel-header">
            <div>
              <h4>{editingItem ? editingItem.name : `Nouveau ${editingType === 'Category' ? 'Catégorie' : 'Forum'}`}</h4>
              <span className="panel-type-badge">{editingItem ? `Modifier ${editingType}` : `Créer ${editingType}`}</span>
            </div>
            <button className="close-btn" onClick={() => setIsPanelOpen(false)}>×</button>
          </div>

          <div className="panel-field">
            <label>Nom {editingType === 'Category' ? "de la Catégorie" : "du Forum"}</label>
            <input className="default-input" value={formName} onChange={e => setFormName(e.target.value)}
              placeholder="Ex: Discussions Générales" disabled={isPending} />
          </div>

          <div className="panel-field">
            <label>Description (optionnelle)</label>
            <textarea className="default-input" value={formDesc} onChange={e => setFormDesc(e.target.value)}
              placeholder="Une courte phrase de présentation" disabled={isPending} rows={3} />
          </div>

          <div className="panel-field">
            <label>Droits d&apos;accès minimum</label>
            <p>Rôle minimum requis pour y accéder.</p>
            <select className="default-input" value={formAllowedRoles} onChange={e => setFormAllowedRoles(e.target.value)} disabled={isPending}>
              <option value="ALL">🌐 Public (ALL)</option>
              {availableDbRoles.map(r => (<option key={r.name} value={r.name}>{r.label} et supérieurs</option>))}
            </select>
          </div>

          {editingType === 'Forum' && (
            <div className="panel-field">
              <label>Options de forum</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <input 
                  type="checkbox" 
                  id="chk-tournament"
                  checked={formIsTournament} 
                  onChange={e => setFormIsTournament(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="chk-tournament" style={{ margin: 0, cursor: 'pointer', fontSize: '0.85rem' }}>
                  Forum de tournoi
                </label>
              </div>
              <p style={{ marginTop: '0.2rem', color: '#888' }}>
                Active le type "Tournament Topic" et les icônes de trophées.
              </p>
            </div>
          )}

          <div className="panel-footer">
            <button className="action-button primary-btn full-width" onClick={handleSave} disabled={isPending}>
              {isPending ? "Sauvegarde..." : "Enregistrer"}
            </button>
            {editingItem && (
              <button className="action-button danger-btn full-width" onClick={handleDeleteItem} disabled={isPending}>
                <Trash2 size={16} /> Supprimer (si vide)
              </button>
            )}
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx global>{`
        /* ---- Layout ---- */
        .categories-list { display: flex; flex-direction: column; gap: 2rem; }
        .forums-list { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; background: rgba(0,0,0,0.12); }
        .sub-forums-list { display: flex; flex-direction: column; gap: 0.4rem; padding-left: 0; }

        /* ---- Légende ---- */
        .struct-legend {
          display: flex; gap: 1rem; flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 0.6rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          font-size: 0.72rem;
          color: #eee;
        }
        .struct-legend span { display: flex; align-items: center; gap: 0.35rem; }

        /* ---- Category Block ---- */
        .category-block {
          background: linear-gradient(135deg, rgba(25,25,35,0.95), rgba(20,20,30,0.98));
          border: 1px solid rgba(194,29,29,0.35);
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
          transition: border-color 0.2s;
          position: relative;
        }
        .category-block:hover { border-color: var(--primary); z-index: 5; }
        .category-header {
          display: flex; align-items: center; padding: 0.9rem 1.2rem;
          background: var(--glass-bg);
          border-bottom: 1px solid var(--glass-border);
          gap: 0.8rem;
          border-radius: 16px 16px 0 0;
        }
        .cat-title-container { flex: 1; display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
        .cat-title { margin: 0; font-size: 1rem; color: white; font-weight: 700; }

        /* ---- Forum Block ---- */
        .forum-block {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          transition: background 0.2s, border-color 0.2s;
          position: relative;
        }
        .forum-block:hover { 
          background: rgba(255,255,255,0.06); 
          border-color: rgba(255,255,255,0.14);
          z-index: 30;
        }
        .forum-block.level-2 {
          background: rgba(255,255,255,0.02);
          border-color: rgba(255,255,255,0.05);
          margin-left: 1.2rem;
          border-left: 2px solid rgba(194,29,29,0.25);
          border-radius: 6px;
        }
        .forum-block.level-3 {
          background: rgba(0,0,0,0.1);
          border-color: rgba(255,255,255,0.04);
          margin-left: 2.4rem;
          border-left: 2px solid rgba(194,29,29,0.15);
          border-radius: 4px;
        }
        .forum-block.drag-ghost {
          box-shadow: 0 8px 30px rgba(0,0,0,0.6);
          border-color: var(--primary);
          opacity: 0.95 !important;
        }

        .forum-row { display: flex; align-items: center; padding: 0.65rem 0.9rem; gap: 0.65rem; }
        .forum-title-container { flex: 1; display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
        .forum-title-container strong { color: var(--foreground); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .forum-actions { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; }
        .sub-forums-container { padding: 0.6rem 0.8rem 0.8rem; background: rgba(0,0,0,0.15); }

        /* ---- Boutons de niveau ---- */
        .level-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #888;
          cursor: pointer;
          border-radius: 5px;
          padding: 0.3rem 0.4rem;
          display: flex; align-items: center;
          transition: all 0.2s;
          font-size: 0;
        }
        .level-btn:hover { background: rgba(194,29,29,0.15); border-color: rgba(194,29,29,0.4); color: var(--primary); }

        /* ---- Drag Handle ---- */
        .drag-handle {
          cursor: grab; padding: 0.2rem;
          color: rgba(255,255,255,0.18);
          transition: color 0.2s; flex-shrink: 0;
          display: flex; align-items: center;
        }
        .drag-handle:hover { color: rgba(255,255,255,0.55); }
        .drag-handle:active { cursor: grabbing; color: white; }

        /* ---- Badges ---- */
        .badge-role { font-size: 0.66rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }
        .badge-all { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
        .badge-restricted { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }

        /* ---- Add Buttons ---- */
        .add-forum-btn {
          background: rgba(194,29,29,0.05); border: 1px dashed rgba(194,29,29,0.3);
          color: rgba(255,255,255,0.45); width: 100%; padding: 0.5rem;
          border-radius: 8px; cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 0.4rem; margin-top: 0.5rem; font-size: 0.8rem;
          transition: all 0.2s;
        }
        .add-forum-btn:hover { background: rgba(194,29,29,0.1); border-color: rgba(194,29,29,0.55); color: white; }
        .expand-btn {
          background: none; border: none; color: #888; cursor: pointer;
          display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem;
          padding: 0.25rem 0.5rem; border-radius: 5px; transition: all 0.2s; white-space: nowrap;
        }
        .expand-btn:hover { color: white; background: rgba(255,255,255,0.07); }

        /* ---- UI Buttons ---- */
        .action-button { display: inline-flex; align-items: center; gap: 0.4rem; justify-content: center; font-weight: 700; cursor: pointer; border-radius: 8px; border: none; transition: all 0.2s; font-size: 0.87rem; }
        .action-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .primary-btn { padding: 0.65rem 1.2rem; background: var(--primary); color: white; }
        .primary-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
        .secondary-btn { padding: 0.45rem 0.8rem; background: rgba(255,255,255,0.05); color: #ccc; border: 1px solid rgba(255,255,255,0.1); font-weight: 600; }
        .secondary-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; }
        .danger-btn { padding: 0.65rem 1.2rem; background: #dc2626; color: white; }
        .danger-btn:hover:not(:disabled) { background: #b91c1c; }
        .icon-btn { padding: 0.3rem 0.5rem; font-size: 0.8rem; border-radius: 5px; }

        /* ---- Side Panel ---- */
        .side-panel {
          width: 300px; flex-shrink: 0;
          background: rgba(15,15,25,0.98);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.4rem;
          position: sticky; top: 1rem; align-self: flex-start;
          display: flex; flex-direction: column; gap: 1.1rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .panel-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .panel-header h4 { margin: 0; color: white; font-size: 1rem; line-height: 1.3; }
        .panel-type-badge { font-size: 0.62rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(194,29,29,0.2); color: var(--primary); border: 1px solid rgba(194,29,29,0.3); display: block; margin-top: 4px; }
        .close-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #888; font-size: 1.1rem; line-height: 1; cursor: pointer; border-radius: 6px; padding: 0.25rem 0.55rem; transition: all 0.2s; flex-shrink: 0; margin-left: 0.5rem; }
        .close-btn:hover { color: white; background: rgba(255,255,255,0.1); }
        .panel-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .panel-field label { color: rgba(255,255,255,0.65); font-weight: 600; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .panel-field p { margin: 0; font-size: 0.74rem; color: #555; }
        .default-input { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.65rem 0.85rem; border-radius: 8px; width: 100%; font-family: inherit; font-size: 0.87rem; transition: border-color 0.2s; box-sizing: border-box; }
        .default-input:focus { outline: none; border-color: var(--primary); }
        .full-width { width: 100%; }
        .panel-footer { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 0.9rem; border-top: 1px solid rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}
