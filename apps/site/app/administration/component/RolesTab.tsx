"use client";

/**
 * Onglet « Gestion des rôles » de l'administration (refonte, carte 099) : créer un rôle personnalisé (identifiant,
 * libellé, couleur), le supprimer (ses membres redeviennent coachs) et régler la hiérarchie en faisant glisser les
 * rôles (poignée à gauche ; au clavier : Espace pour prendre, flèches pour déplacer, Espace pour poser). Les rôles de
 * base ne bougent pas et un rôle personnalisé reste sous Modérateur. Les actions `getAllRoles`, `createCustomRole`,
 * `deleteCustomRole` et `reorderRoles` sont inchangées.
 */
import { useEffect, useState, useTransition } from "react";
import { GripVertical, Lock, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, Field, Input, Label, Skeleton, toast } from "@bbfrance/ui";
import { getRolePower } from "@/lib/roles";
import { createCustomRole, deleteCustomRole, getAllRoles, reorderRoles } from "../actions";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RolesTabProps {
  currentUserRole: string;
  isSuperAdmin: boolean;
}

/**
 * Couleur proposée pour un nouveau rôle (gris neutre), comme avant la refonte. C'est une donnée enregistrée avec le
 * rôle, pas une couleur du thème, et le sélecteur de couleur du navigateur n'accepte que ce format.
 */
// eslint-disable-next-line no-restricted-syntax -- valeur d'un champ de couleur, pas une couleur d'interface
const DEFAULT_ROLE_COLOR = "#888888";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rôle renvoyé par getAllRoles (RoleConfig + nombre de membres)
type Role = any;

/** Une ligne de la hiérarchie, déplaçable par sa poignée (sauf les rôles de base). */
function SortableRoleItem({ role, myPower, isSuperAdmin, onDelete, disabled }: {
  role: Role;
  myPower: number;
  isSuperAdmin: boolean;
  onDelete: (role: Role) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: role.name,
    disabled: role.isBaseRole || disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const canDelete = !role.isBaseRole && (isSuperAdmin || role.power < myPower);
  const count = role._count?.users || 0;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex min-h-14 items-center gap-2 border-b border-bb-border bg-bb-surface px-2 py-2 last:border-b-0 ${isDragging ? "opacity-60 shadow-bb" : ""}`}
    >
      {!role.isBaseRole && !disabled ? (
        <span
          {...attributes}
          {...listeners}
          aria-label={`Déplacer le rôle ${role.label}`}
          title="Glisser pour modifier la hiérarchie"
          className="inline-flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-bb-md text-bb-text-muted hover:bg-bb-surface-2 hover:text-bb-text focus-visible:outline-2 focus-visible:outline-bb-focus active:cursor-grabbing"
        >
          <GripVertical size={20} aria-hidden="true" />
        </span>
      ) : (
        <span className="size-11 shrink-0" aria-hidden="true" />
      )}

      <span className="size-3 shrink-0 rounded-full border border-bb-border" style={{ background: role.color || undefined }} aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-semibold text-bb-text">{role.label}</span>
        <span className="truncate font-mono text-sm text-bb-text-muted">{role.name}</span>
      </span>
      <Badge variant="neutral" className="hidden lg:inline-flex">{count} coach{count > 1 ? "s" : ""}</Badge>

      {role.isBaseRole ? (
        <Badge variant="neutral" title="Rôle de base : il ne peut être ni déplacé ni supprimé">
          <Lock size={12} aria-hidden="true" />
          Base
        </Badge>
      ) : canDelete ? (
        <Button
          type="button"
          variant="quiet"
          size="tap-icon"
          className="text-bb-danger-text"
          aria-label={`Supprimer le rôle ${role.label}`}
          title="Supprimer ce rôle"
          disabled={disabled}
          onClick={() => onDelete(role)}
        >
          <Trash2 size={18} aria-hidden="true" />
        </Button>
      ) : (
        <Badge variant="neutral" title="Hiérarchie bloquée : rôle de rang égal ou supérieur au vôtre">
          <Lock size={12} aria-hidden="true" />
          Bloqué
        </Badge>
      )}
    </li>
  );
}

export default function RolesTab({ currentUserRole, isSuperAdmin }: RolesTabProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newName, setNewName] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_ROLE_COLOR);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const myPower = getRolePower(currentUserRole);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /** Recharge la liste après une modification, sans effacer celle qui est affichée. */
  const loadRoles = async () => {
    setRoles(await getAllRoles());
  };

  // Premier chargement : la liste arrive, puis l'attente s'arrête
  useEffect(() => {
    getAllRoles().then((data) => {
      setRoles(data);
      setIsLoading(false);
    });
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newLabel) return toast.error("Champs requis");

    startTransition(async () => {
      const res = await createCustomRole({ name: newName, label: newLabel, color: newColor, power: 5 });
      if (res.success) {
        toast.success("Rôle créé !");
        setNewName("");
        setNewLabel("");
        setNewColor(DEFAULT_ROLE_COLOR);
        loadRoles();
      } else {
        toast.error(res.error || "Erreur lors de la création");
      }
    });
  };

  const confirmDelete = () => {
    if (!roleToDelete) return;

    startTransition(async () => {
      const res = await deleteCustomRole(roleToDelete.name);
      if (res.success) {
        toast.success("Rôle supprimé !");
        setRoleToDelete(null);
        loadRoles();
      } else {
        toast.error(res.error || "Erreur de suppression");
      }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = roles.findIndex((item) => item.name === active.id);
      const newIndex = roles.findIndex((item) => item.name === over.id);

      const newArray = arrayMove(roles, oldIndex, newIndex);

      // Vérification avant l'envoi : aucun rôle personnalisé au-dessus de Modérateur
      const modIndex = newArray.findIndex((r) => r.name === "MODERATOR");
      const movedItem = newArray[newIndex];

      if (modIndex !== -1 && newIndex < modIndex && !movedItem.isBaseRole) {
        toast.error("Impossible de placer un grade personnalisé au dessus de Modérateur.");
        return;
      }

      setRoles(newArray);

      const namesInOrder = newArray.map((r) => r.name);
      startTransition(async () => {
        const res = await reorderRoles(namesInOrder);
        if (res.success) {
          toast.success("Hiérarchie mise à jour !");
          loadRoles();
        } else {
          toast.error(res.error || "Erreur lors de la sauvegarde.");
          loadRoles();
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <Plus size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Nouveau rôle</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
              <Field label="Identifiant du rôle" htmlFor="role-name" hint="En majuscules, sans espace. Exemple : ARBITRE.">
                <Input id="role-name" value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isPending} required placeholder="ARBITRE" autoCapitalize="characters" />
              </Field>
              <Field label="Libellé du rôle" htmlFor="role-label" hint="Le nom affiché aux membres. Exemple : Arbitre principal.">
                <Input id="role-label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} disabled={isPending} required placeholder="Arbitre principal" />
              </Field>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-center gap-3">
                <Label htmlFor="role-color">Couleur du rôle</Label>
                <input
                  id="role-color"
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  disabled={isPending}
                  className="h-11 w-14 cursor-pointer rounded-bb-md border border-bb-border bg-bb-surface-2 p-1 text-base"
                />
              </div>
              <Button type="submit" variant="primary" size="tap" className="w-full lg:w-auto" disabled={isPending}>
                <Plus size={18} aria-hidden="true" />
                Créer le rôle
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <ShieldCheck size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Hiérarchie</CardTitle>
          {isPending && <span className="text-sm text-bb-text-muted">Enregistrement…</span>}
        </CardHeader>
        <p className="m-0 px-4 pt-3 text-[0.95rem] text-bb-text-muted">
          L&apos;ordre donne le pouvoir : le rôle le plus haut est le plus puissant. Faites glisser la poignée
          <GripVertical size={14} className="mx-1 inline align-middle" aria-hidden="true" />
          d&apos;un rôle personnalisé pour le déplacer.
        </p>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={roles.map((r) => r.name)} strategy={verticalListSortingStrategy}>
              <ul aria-label="Hiérarchie des rôles" className="m-0 mt-2 list-none border-t border-bb-border p-0">
                {roles.map((r) => (
                  <SortableRoleItem
                    key={r.name}
                    role={r}
                    myPower={myPower}
                    isSuperAdmin={isSuperAdmin}
                    onDelete={setRoleToDelete}
                    disabled={isPending}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <ConfirmDialog
        open={roleToDelete !== null}
        onOpenChange={(open) => { if (!open) setRoleToDelete(null); }}
        title="Supprimer le rôle ?"
        message={`Supprimer le rôle « ${roleToDelete?.label ?? ""} » ? Les membres qui l'ont redeviendront coachs.`}
        confirmLabel="Supprimer"
        danger
        pending={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
