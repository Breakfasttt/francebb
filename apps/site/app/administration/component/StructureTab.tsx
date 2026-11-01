"use client";

/**
 * Onglet « Structure du forum » de l'administration (refonte, carte 099) : catégories, forums et sous-forums (deux
 * niveaux de sous-forums au plus, 5 sous-forums par forum).
 * - Glisser la poignée d'une catégorie ou d'un forum change son ordre au sein du même niveau (au clavier : Espace pour
 *   prendre, flèches pour déplacer, Espace pour poser).
 * - Le menu « ⋯ » d'un forum l'indente (il devient sous-forum du forum au-dessus), le désindente (il remonte d'un
 *   niveau) ou le fait passer dans la catégorie précédente ou suivante.
 * - « Modifier » ouvre un panneau (à droite sur ordinateur, en bas sur téléphone) : nom, description, rôle minimum
 *   d'accès, et suppression d'un élément vide. Le forum « Les tournois » ne peut être ni renommé ni supprimé.
 * Les actions de `actionsStructure.ts` et `getAllRoles` sont inchangées ; la logique de déplacement a été recopiée
 * telle quelle depuis l'ancienne version de l'onglet.
 */
import {
  ArrowBigDown, ArrowBigUp, ChevronDown, ChevronRight, FolderGit2, GripVertical, IndentDecrease, IndentIncrease, Lock,
  Plus, Settings2, Trash2, Trophy,
} from "lucide-react";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  ActionMenu, Badge, Button, Card, CardHeader, CardTitle, ConfirmDialog, DESKTOP_QUERY, Field, Input, Select, Sheet,
  SheetContent, Skeleton, Textarea, toast, useMediaQuery,
} from "@bbfrance/ui";
import { getRoleLabel } from "@/lib/roles";
import { getAllRoles } from "../actions";
import {
  createCategory, createForum, deleteCategory, deleteForum,
  getForumStructure, reorderCategories, reorderForums,
  updateCategory, updateForum
} from "../actionsStructure";

import {
  closestCenter, DndContext, DragEndEvent, DragOverlay,
  DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

/** Nom du forum système des tournois : il ne peut être ni renommé ni supprimé. */
const PROTECTED_FORUM_NAME = "Les tournois";

/** Poignée de glisser-déposer : 44 pixels, et `touch-none` pour que le doigt fasse glisser au lieu de défiler. */
const handleClass =
  "inline-flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-bb-md text-bb-text-muted hover:bg-bb-surface-2 hover:text-bb-text focus-visible:outline-2 focus-visible:outline-bb-focus active:cursor-grabbing";

/** Étiquette du rôle minimum d'accès : « Public », ou le libellé du rôle. */
function AccessBadge({ allowedRoles, roleLabels }: { allowedRoles: string; roleLabels: Record<string, string> }) {
  if (allowedRoles === "ALL") return <Badge variant="success">Public</Badge>;
  return (
    <Badge variant="outline" title="Rôle minimum pour y accéder">
      <Lock size={12} aria-hidden="true" />
      {getRoleLabel(allowedRoles, roleLabels)} et +
    </Badge>
  );
}

// ------ Éléments déplaçables ------
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- catégorie renvoyée par getForumStructure
function SortableCategoryItem({ category, onEditClick, roleLabels, children }: { category: any; onEditClick: (item: any, type: "Category" | "Forum") => void; roleLabels: Record<string, string>; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `cat-${category.id}`,
    data: { type: "Category", category }
  });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [expanded, setExpanded] = useState(true);
  const forumCount = category.forums?.length || 0;

  return (
    <section ref={setNodeRef} style={style} aria-label={`Catégorie ${category.name}`} className="overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-bb-border bg-bb-surface-2 px-1 py-1 lg:px-2">
        <span {...attributes} {...listeners} aria-label={`Déplacer la catégorie ${category.name}`} className={handleClass}>
          <GripVertical size={20} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 py-1">
          <h3 className="m-0 min-w-0 border-0 p-0 text-base font-bold break-words text-bb-text normal-case not-italic">{category.name}</h3>
          <AccessBadge allowedRoles={category.allowedRoles} roleLabels={roleLabels} />
        </div>
        <Button type="button" variant="quiet" size="tap" className="px-2" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
          <span>Forums<span className="sr-only"> de {category.name}</span> ({forumCount})</span>
        </Button>
        <Button type="button" variant="quiet" size="tap" className="min-w-11 px-2" aria-label={`Modifier la catégorie ${category.name}`} onClick={() => onEditClick(category, "Category")}>
          <Settings2 size={18} aria-hidden="true" />
          <span className="hidden lg:inline">Modifier</span>
        </Button>
      </div>
      {expanded && <div className="flex flex-col gap-2 p-2 lg:p-3">{children}</div>}
    </section>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any -- forum renvoyé par getForumStructure, rappels du parent */
function SortableForumItem({
  forum, onEditClick, level, onIndent, onDedent, canIndent, canDedent,
  onMoveUpCat, onMoveDownCat, canMoveUpCat, canMoveDownCat, roleLabels, children
}: {
  forum: any; onEditClick: (item: any, type: "Category" | "Forum") => void; level: number;
  onIndent: () => void; onDedent: () => void; canIndent: boolean; canDedent: boolean;
  onMoveUpCat?: () => void; onMoveDownCat?: () => void; canMoveUpCat?: boolean; canMoveDownCat?: boolean;
  roleLabels: Record<string, string>; children?: ReactNode;
}) {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `forum-${forum.id}`,
    data: { type: "Forum", forum }
  });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [expanded, setExpanded] = useState(false);
  const subCount = forum.subForums?.length || 0;
  const hasSubForums = subCount > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-bb-md border border-bb-border bg-bb-surface ${level > 1 ? "border-l-[3px] border-l-bb-accent-text" : ""}`}
    >
      <div className="flex items-center gap-1 py-0.5 pr-1">
        <span {...attributes} {...listeners} aria-label={`Déplacer le forum ${forum.name}`} className={handleClass}>
          <GripVertical size={18} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 py-1">
          {forum.isTournamentForum ? (
            <Trophy size={16} className="shrink-0 text-bb-rank" aria-hidden="true" />
          ) : (
            <FolderGit2 size={16} className="shrink-0 text-bb-text-muted" aria-hidden="true" />
          )}
          <strong className="min-w-0 font-semibold break-words text-bb-text">{forum.name}</strong>
          <AccessBadge allowedRoles={forum.allowedRoles} roleLabels={roleLabels} />
        </div>
        {hasSubForums && (
          <Button type="button" variant="quiet" size="tap" className="px-2 text-sm" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
            <span><span className="sr-only">Sous-forums de {forum.name} : </span>{subCount}/5</span>
          </Button>
        )}
        <Button type="button" variant="quiet" size="tap-icon" aria-label={`Modifier le forum ${forum.name}`} title="Modifier le forum" onClick={() => onEditClick(forum, "Forum")}>
          <Settings2 size={18} aria-hidden="true" />
        </Button>
        <ActionMenu
          label={`Actions du forum ${forum.name}`}
          title={forum.name}
          items={[
            { label: "Indenter : sous-forum du forum au-dessus", icon: <IndentIncrease size={18} aria-hidden="true" />, onSelect: onIndent, hidden: !canIndent },
            { label: "Dédenter : remonter d'un niveau", icon: <IndentDecrease size={18} aria-hidden="true" />, onSelect: onDedent, hidden: !canDedent },
            { label: "Vers la catégorie précédente", icon: <ArrowBigUp size={18} aria-hidden="true" />, onSelect: onMoveUpCat, hidden: !canMoveUpCat },
            { label: "Vers la catégorie suivante", icon: <ArrowBigDown size={18} aria-hidden="true" />, onSelect: onMoveDownCat, hidden: !canMoveDownCat },
          ]}
        />
      </div>
      {expanded && hasSubForums && (
        <div className="flex flex-col gap-2 border-t border-bb-border p-2 pl-3 lg:pl-6">{children}</div>
      )}
    </div>
  );
}

/** Bouton d'ajout en bas d'une liste de forums ou de sous-forums. */
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="quiet" size="tap" className="w-full border border-dashed border-bb-border text-[0.95rem]" onClick={onClick}>
      <Plus size={16} aria-hidden="true" />
      {label}
    </Button>
  );
}

// ------ Onglet ------
export default function StructureTab() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- arbre renvoyé par getForumStructure
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- catégorie ou forum en cours de modification
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<"Category" | "Forum">("Category");
  const [parentTargetId, setParentTargetId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAllowedRoles, setFormAllowedRoles] = useState<string>("ALL");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- gardé comme avant la refonte (un forum ne devient plus « tournoi » à la main)
  const [formIsTournament, setFormIsTournament] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- rôles renvoyés par getAllRoles
  const [availableDbRoles, setAvailableDbRoles] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const roleLabels = Object.fromEntries(availableDbRoles.map((r) => [r.name, r.label]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const [cats, roles] = await Promise.all([getForumStructure(), getAllRoles()]);
    setCategories(cats);
    setAvailableDbRoles(roles);
    if (!silent) setIsLoading(false);
  };

  // Premier chargement : l'arbre et les rôles arrivent, puis l'attente s'arrête
  useEffect(() => {
    Promise.all([getForumStructure(), getAllRoles()]).then(([cats, roles]) => {
      setCategories(cats);
      setAvailableDbRoles(roles);
      setIsLoading(false);
    });
  }, []);

  /* eslint-disable @typescript-eslint/no-explicit-any -- logique recopiée telle quelle de l'ancienne version (carte 099) : arbre non typé de getForumStructure */
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
        toast("Utilisez le menu ⋯ du forum pour changer de niveau", { icon: "ℹ️" });
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
          res = await updateForum(editingItem.id, { name: formName, description: formDesc, allowedRoles: formAllowedRoles });
        } else {
          const isCat = categories.some((c: any) => c.id === parentTargetId);
          res = await createForum({
            name: formName, description: formDesc, allowedRoles: formAllowedRoles,
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
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const isProtected = editingItem?.name === PROTECTED_FORUM_NAME;
  const panelTitle = editingItem
    ? `Modifier : ${editingItem.name}`
    : editingType === "Category" ? "Nouvelle catégorie" : "Nouveau forum";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-wrap">
        <FolderGit2 size={18} className="text-bb-text-muted" aria-hidden="true" />
        <CardTitle>Structure du forum</CardTitle>
        <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" onClick={openCreateCategory}>
          <Plus size={18} aria-hidden="true" />
          Ajouter une catégorie
        </Button>
      </CardHeader>

      <div className="flex flex-col gap-4 p-3 lg:p-4">
        <p className="m-0 text-[0.95rem] text-bb-text-muted">
          Faites glisser la poignée
          <GripVertical size={14} className="mx-1 inline align-middle" aria-hidden="true" />
          pour changer l&apos;ordre au sein d&apos;un même niveau. Le menu « ⋯ » d&apos;un forum permet de l&apos;indenter
          (il devient sous-forum du forum au-dessus), de le désindenter ou de le changer de catégorie.
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => `cat-${c.id}`)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-4">
                {categories.map((cat, ci) => (
                  <SortableCategoryItem key={`cat-${cat.id}`} category={cat} onEditClick={openEdit} roleLabels={roleLabels}>
                    <SortableContext items={(cat.forums || []).map((f: { id: string }) => `forum-${f.id}`)} strategy={verticalListSortingStrategy}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- forums de getForumStructure */}
                      {(cat.forums || []).map((forum: any, fi: number) => (
                        <SortableForumItem
                          key={`forum-${forum.id}`} forum={forum} onEditClick={openEdit} roleLabels={roleLabels}
                          level={1}
                          canIndent={fi > 0} // peut indenter s'il y a un forum au-dessus
                          canDedent={false} // un forum racine ne peut pas remonter
                          canMoveUpCat={ci > 0}
                          canMoveDownCat={ci < categories.length - 1}
                          onIndent={() => handleIndent(forum, cat.id)}
                          onDedent={() => {}}
                          onMoveUpCat={() => handleMoveCat(forum, "up")}
                          onMoveDownCat={() => handleMoveCat(forum, "down")}
                        >
                          {/* SOUS-FORUMS NIVEAU 1 */}
                          <SortableContext items={(forum.subForums || []).map((sf: { id: string }) => `forum-${sf.id}`)} strategy={verticalListSortingStrategy}>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- sous-forums de getForumStructure */}
                            {(forum.subForums || []).map((sf: any, sfi: number) => (
                              <SortableForumItem
                                key={`forum-${sf.id}`} forum={sf} onEditClick={openEdit} roleLabels={roleLabels}
                                level={2}
                                canIndent={sfi > 0 && (sf.subForums?.length || 0) === 0} // voisin au-dessus et pas de sous-sous-forums
                                canDedent={true}
                                onIndent={() => handleIndentSub(sf, forum.id)}
                                onDedent={() => handleDedent(sf)}
                              >
                                {/* SOUS-FORUMS NIVEAU 2 (le plus bas) */}
                                <SortableContext items={(sf.subForums || []).map((ssf: { id: string }) => `forum-${ssf.id}`)} strategy={verticalListSortingStrategy}>
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- sous-sous-forums de getForumStructure */}
                                  {(sf.subForums || []).map((ssf: any) => (
                                    <SortableForumItem
                                      key={`forum-${ssf.id}`} forum={ssf} onEditClick={openEdit} roleLabels={roleLabels}
                                      level={3}
                                      canIndent={false}
                                      canDedent={true}
                                      onIndent={() => {}}
                                      onDedent={() => handleDedentSub(ssf)}
                                    />
                                  ))}
                                  {(sf.subForums?.length || 0) < 5 && <AddButton label="Ajouter un sous-forum" onClick={() => openCreateForum(sf.id)} />}
                                </SortableContext>
                              </SortableForumItem>
                            ))}
                            {(forum.subForums?.length || 0) < 5 && <AddButton label="Ajouter un sous-forum" onClick={() => openCreateForum(forum.id)} />}
                          </SortableContext>
                        </SortableForumItem>
                      ))}
                      <AddButton label="Ajouter un forum ici" onClick={() => openCreateForum(cat.id)} />
                    </SortableContext>
                  </SortableCategoryItem>
                ))}
              </div>
            </SortableContext>

            {createPortal(
              <DragOverlay dropAnimation={null}>
                {activeId && (
                  <div className="flex w-[min(400px,80vw)] items-center gap-2 rounded-bb-md border border-bb-accent-text bg-bb-surface px-3 py-2 font-bb-sans shadow-bb">
                    <GripVertical size={16} className="text-bb-text-muted" aria-hidden="true" />
                    <FolderGit2 size={16} className="text-bb-text-muted" aria-hidden="true" />
                    <strong className="truncate text-[0.95rem] text-bb-text">{getActiveName()}</strong>
                  </div>
                )}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        )}
      </div>

      {/* Panneau de création et de modification */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent title={panelTitle} side={isDesktop ? "right" : "bottom"}>
          <div className="flex flex-col gap-4 pt-2 pb-2">
            <Field
              label={editingType === "Category" ? "Nom de la catégorie" : "Nom du forum"}
              htmlFor="structure-name"
              hint={isProtected ? "Ce forum est protégé et ne peut pas être renommé." : undefined}
            >
              <Input
                id="structure-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex. : Discussions générales"
                disabled={isPending || isProtected}
              />
            </Field>
            <Field label="Description (facultative)" htmlFor="structure-description">
              <Textarea
                id="structure-description"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Une courte phrase de présentation"
                disabled={isPending}
                rows={3}
                className="min-h-24 font-bb-sans"
              />
            </Field>
            <Field label="Droits d'accès minimum" htmlFor="structure-access" hint="Rôle minimum pour y accéder.">
              <Select id="structure-access" value={formAllowedRoles} onChange={(e) => setFormAllowedRoles(e.target.value)} disabled={isPending}>
                <option value="ALL">Public (tout le monde)</option>
                {availableDbRoles.map((r) => (<option key={r.name} value={r.name}>{r.label} et supérieurs</option>))}
              </Select>
            </Field>

            <div className="flex flex-col gap-2 border-t border-bb-border pt-4">
              <Button type="button" variant="primary" size="tap" className="w-full" onClick={handleSave} disabled={isPending}>
                {isPending ? "Sauvegarde…" : "Enregistrer"}
              </Button>
              {editingItem && !isProtected && (
                <Button type="button" variant="secondary" size="tap" className="w-full text-bb-danger-text" onClick={handleDeleteItem} disabled={isPending}>
                  <Trash2 size={16} aria-hidden="true" />
                  Supprimer (si vide)
                </Button>
              )}
              {isProtected && (
                <p className="m-0 text-center text-sm text-bb-text-muted">Ce forum système ne peut pas être supprimé.</p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={`Supprimer ${editingType === "Category" ? "la catégorie" : "le forum"} « ${editingItem?.name ?? ""} » ?`}
        message="Cette action est irréversible. L'élément doit être vide pour pouvoir être supprimé."
        confirmLabel="Supprimer définitivement"
        danger
        pending={isPending}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
