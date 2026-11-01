"use client";

/**
 * Onglet « Données de référence » de l'administration (refonte, carte 099) : les listes de valeurs proposées dans les
 * formulaires du site (régions des coachs…), rangées par groupe. Chaque donnée a une clé (identifiant technique), un
 * libellé (texte affiché), un ordre et un état actif ou non. On peut en ajouter, en modifier et en supprimer. Une seule
 * liste de fiches sur ordinateur comme sur téléphone (avant la refonte : un tableau qui défilait de côté). Les actions
 * `getAllReferenceDataAdmin`, `createReferenceData`, `updateReferenceData` et `deleteReferenceData` sont inchangées.
 */
import { useEffect, useState, useTransition } from "react";
import { Check, Database, Edit2, Plus, Trash2, X } from "lucide-react";
import {
  Badge, Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, Field, Input, Label, Skeleton, Switch, toast,
} from "@bbfrance/ui";
import { createReferenceData, deleteReferenceData, getAllReferenceDataAdmin, updateReferenceData } from "../actions";

interface ReferenceData {
  id: string;
  group: string;
  key: string;
  label: string;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = { group: "COACH_REGION", key: "", label: "", order: 0 };

export default function ReferenceDataTab() {
  const [data, setData] = useState<ReferenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Donnée en cours de modification
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReferenceData>>({});

  // Formulaire de création
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_FORM);

  const [deleteItem, setDeleteItem] = useState<ReferenceData | null>(null);

  async function loadData() {
    const result = await getAllReferenceDataAdmin();
    setData(result as ReferenceData[]);
    setLoading(false);
  }

  useEffect(() => {
    getAllReferenceDataAdmin().then((result) => {
      setData(result as ReferenceData[]);
      setLoading(false);
    });
  }, []);

  const handleStartEdit = (item: ReferenceData) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.group || !editForm.key || !editForm.label) return;

    startTransition(async () => {
      const res = await updateReferenceData(editingId, {
        group: editForm.group!,
        key: editForm.key!,
        label: editForm.label!,
        order: Number(editForm.order) || 0,
        isActive: editForm.isActive ?? true
      });

      if (res.success) {
        toast.success("Mis à jour");
        setEditingId(null);
        loadData();
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    const id = deleteItem.id;
    setDeleteItem(null);

    startTransition(async () => {
      const res = await deleteReferenceData(id);
      if (res.success) {
        toast.success("Supprimé");
        loadData();
      } else {
        toast.error("Erreur");
      }
    });
  };

  const handleCreate = async () => {
    if (!newForm.group || !newForm.key || !newForm.label) {
      toast.error("Tous les champs sont requis");
      return;
    }

    startTransition(async () => {
      const res = await createReferenceData({
        ...newForm,
        order: Number(newForm.order) || 0
      });

      if (res.success) {
        toast.success("Créé avec succès");
        setIsCreating(false);
        setNewForm(EMPTY_FORM);
        loadData();
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const groupedData = data.reduce<Record<string, ReferenceData[]>>((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="flex-wrap">
          <Database size={18} className="text-bb-text-muted" aria-hidden="true" />
          <CardTitle>Données de référence</CardTitle>
          {!isCreating && (
            <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" onClick={() => setIsCreating(true)}>
              <Plus size={18} aria-hidden="true" />
              Ajouter
            </Button>
          )}
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <p className="m-0 text-[0.95rem] text-bb-text-muted">Listes de valeurs proposées dans les formulaires du site.</p>

          {isCreating && (
            <div className="flex flex-col gap-4 rounded-bb-md border border-bb-border bg-bb-surface-2 p-3 lg:p-4">
              <h3 className="m-0 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">Nouvelle donnée</h3>
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
                <Field label="Groupe" htmlFor="ref-new-group" hint="Exemple : COACH_REGION">
                  <Input id="ref-new-group" value={newForm.group} onChange={(e) => setNewForm({ ...newForm, group: e.target.value })} />
                </Field>
                <Field label="Clé" htmlFor="ref-new-key" hint="Identifiant technique. Exemple : IDF">
                  <Input id="ref-new-key" className="font-mono" value={newForm.key} onChange={(e) => setNewForm({ ...newForm, key: e.target.value })} />
                </Field>
                <Field label="Libellé" htmlFor="ref-new-label" hint="Texte affiché. Exemple : Île-de-France">
                  <Input id="ref-new-label" value={newForm.label} onChange={(e) => setNewForm({ ...newForm, label: e.target.value })} />
                </Field>
                <Field label="Ordre" htmlFor="ref-new-order" hint="Position dans la liste (la plus petite en premier).">
                  <Input id="ref-new-order" type="number" inputMode="numeric" value={newForm.order} onChange={(e) => setNewForm({ ...newForm, order: parseInt(e.target.value) || 0 })} />
                </Field>
              </div>
              <div className="flex flex-col-reverse gap-2 lg:flex-row lg:justify-end">
                <Button type="button" variant="secondary" size="tap" onClick={() => setIsCreating(false)}>
                  <X size={18} aria-hidden="true" />
                  Annuler
                </Button>
                <Button type="button" variant="primary" size="tap" disabled={isPending} onClick={handleCreate}>
                  <Check size={18} aria-hidden="true" />
                  Créer
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {loading ? (
        <Skeleton className="h-60 w-full" />
      ) : (
        Object.keys(groupedData).sort().map((group) => (
          <Card key={group} className="overflow-hidden">
            <section aria-label={`Groupe ${group}`}>
              <CardHeader>
                <CardTitle as="h3" className="text-[0.95rem]">
                  Groupe : <span className="font-mono text-bb-accent-text">{group}</span>
                </CardTitle>
                <Badge variant="neutral">{groupedData[group].length}</Badge>
              </CardHeader>
              <ul className="m-0 list-none p-0">
                {groupedData[group].map((item) => (
                  <li key={item.id} className="border-b border-bb-border px-4 py-3 last:border-b-0">
                    {editingId === item.id ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[160px_minmax(0,1fr)_110px]">
                          <Field label="Clé" htmlFor={`ref-edit-key-${item.id}`}>
                            <Input id={`ref-edit-key-${item.id}`} className="font-mono" value={editForm.key} onChange={(e) => setEditForm({ ...editForm, key: e.target.value })} />
                          </Field>
                          <Field label="Libellé" htmlFor={`ref-edit-label-${item.id}`}>
                            <Input id={`ref-edit-label-${item.id}`} value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} />
                          </Field>
                          <Field label="Ordre" htmlFor={`ref-edit-order-${item.id}`}>
                            <Input id={`ref-edit-order-${item.id}`} type="number" inputMode="numeric" value={editForm.order} onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })} />
                          </Field>
                        </div>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-h-11 items-center gap-3">
                            <Switch id={`ref-edit-active-${item.id}`} checked={editForm.isActive} onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })} />
                            <Label htmlFor={`ref-edit-active-${item.id}`}>Actif</Label>
                          </div>
                          <div className="flex flex-col-reverse gap-2 lg:flex-row">
                            <Button type="button" variant="secondary" size="tap" onClick={handleCancelEdit}>
                              <X size={18} aria-hidden="true" />
                              Annuler
                            </Button>
                            <Button type="button" variant="primary" size="tap" disabled={isPending} onClick={handleSaveEdit}>
                              <Check size={18} aria-hidden="true" />
                              Enregistrer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="font-semibold break-words text-bb-text">{item.label}</span>
                          <span className="flex flex-wrap items-center gap-2 text-sm text-bb-text-muted">
                            <span className="font-mono">{item.key}</span>
                            <span>Ordre {item.order}</span>
                            <Badge variant={item.isActive ? "success" : "danger"}>{item.isActive ? "Actif" : "Inactif"}</Badge>
                          </span>
                        </div>
                        <Button type="button" variant="quiet" size="tap-icon" aria-label={`Modifier ${item.label}`} title="Modifier" onClick={() => handleStartEdit(item)}>
                          <Edit2 size={18} aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="quiet" size="tap-icon" className="text-bb-danger-text" aria-label={`Supprimer ${item.label}`} title="Supprimer" onClick={() => setDeleteItem(item)}>
                          <Trash2 size={18} aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </Card>
        ))
      )}

      <ConfirmDialog
        open={deleteItem !== null}
        onOpenChange={(open) => { if (!open) setDeleteItem(null); }}
        title="Supprimer cette donnée ?"
        message={`« ${deleteItem?.label ?? ""} » sera retirée de la liste. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
