"use client";

/**
 * Onglet « Données de référence » de l'administration (refonte, carte 099) : les listes de valeurs proposées dans les
 * formulaires du site (régions des coachs…), rangées par groupe. Chaque donnée a une clé (identifiant technique), un
 * libellé (texte affiché), un ordre et un état actif ou non. On peut en ajouter, en modifier et en supprimer. Une seule
 * liste de fiches sur ordinateur comme sur téléphone (avant la refonte : un tableau qui défilait de côté). Les actions
 * `getAllReferenceDataAdmin`, `createReferenceData`, `updateReferenceData` et `deleteReferenceData` sont inchangées.
 * Carte 221 : chaque groupe a un nom lisible et une phrase « Utilisé dans… », et se replie (fermé par défaut).
 * Carte 227 : une description facultative pour chaque donnée, le groupe « Championnats », et le CDF protégé (ni
 * suppression, ni désactivation, ni changement de clé : le classement en dépend ; le serveur le refuse aussi).
 */
import { useEffect, useState, useTransition } from "react";
import { Check, ChevronDown, Edit2, Plus, Trash2, X } from "lucide-react";
import {
  Badge, Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, Field, Input, Label, Select, Skeleton, Switch, Textarea, toast,
} from "@bbfrance/ui";
import { PROTECTED_REFERENCE_KEYS } from "@/lib/championships";
import { createReferenceData, deleteReferenceData, getAllReferenceDataAdmin, updateReferenceData } from "../actions";

interface ReferenceData {
  id: string;
  group: string;
  key: string;
  label: string;
  description: string | null;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = { group: "COACH_REGION", key: "", label: "", description: "", order: 0 };

/** Donnée protégée (le CDF) : son nom, sa description et son ordre se modifient, rien d'autre. */
const isProtected = (item: Pick<ReferenceData, "group" | "key">) => (PROTECTED_REFERENCE_KEYS[item.group] ?? []).includes(item.key);

/**
 * Nom lisible et usage de chaque groupe (vérifiés dans le code, carte 221 : lib/referenceData.ts et ses appelants).
 * Un groupe absent de cette liste s'affiche par son code, sans phrase d'usage.
 */
const GROUP_INFO: Record<string, { label: string; usedIn: string }> = {
  COACH_REGION: {
    label: "Zones des coachs",
    usedIn: "profil et inscription, filtre de l'annuaire des membres, zone d'une ligue, formulaire de tournoi",
  },
  REGION_FRANCE: { label: "Régions de France", usedIn: "formulaires de tournoi et de ligue, filtre « Région » de la liste des tournois" },
  DEPARTEMENT_FRANCE: { label: "Départements", usedIn: "formulaires de tournoi et de ligue, filtre de la liste des tournois" },
  GAME_EDITION: { label: "Éditions du jeu", usedIn: "formulaire de tournoi" },
  PLATFORM: { label: "Plateformes en ligne", usedIn: "formulaire de tournoi (tournoi en ligne)" },
  TOURNAMENT_FORMAT: { label: "Formats de tournoi", usedIn: "formulaire de tournoi" },
  TOURNAMENT_TYPE: { label: "Types de tournoi", usedIn: "formulaire de tournoi" },
  CHAMPIONSHIP: {
    label: "Championnats",
    usedIn: "formulaire de tournoi (cases « Le tournoi compte pour », avec la description en aide), filtre de la liste des tournois, fiche du tournoi",
  },
};

const groupLabel = (group: string) => GROUP_INFO[group]?.label ?? group;

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
        description: editForm.description ?? null,
        order: Number(editForm.order) || 0,
        isActive: editForm.isActive ?? true
      });

      if (res.success) {
        toast.success("Donnée enregistrée.");
        setEditingId(null);
        loadData();
      } else {
        toast.error(res.error || "L'enregistrement a échoué.");
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
        toast.success("Donnée supprimée.");
        loadData();
      } else {
        toast.error(res.error || "La suppression a échoué.");
      }
    });
  };

  const handleCreate = async () => {
    if (!newForm.group || !newForm.key || !newForm.label) {
      toast.error("Remplis la clé et le libellé.");
      return;
    }

    startTransition(async () => {
      const res = await createReferenceData({
        ...newForm,
        order: Number(newForm.order) || 0
      });

      if (res.success) {
        toast.success("Donnée ajoutée.");
        setIsCreating(false);
        setNewForm(EMPTY_FORM);
        loadData();
      } else {
        toast.error(res.error || "L'enregistrement a échoué.");
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
              <h3 className="text-base font-bold text-bb-text">Nouvelle donnée</h3>
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
                <Field label="Liste" htmlFor="ref-new-group" hint={GROUP_INFO[newForm.group] ? `Utilisée dans : ${GROUP_INFO[newForm.group].usedIn}.` : undefined}>
                  <Select id="ref-new-group" value={newForm.group} onChange={(e) => setNewForm({ ...newForm, group: e.target.value })}>
                    {[...new Set([...Object.keys(GROUP_INFO), ...Object.keys(groupedData)])].map((group) => (
                      <option key={group} value={group}>{groupLabel(group)}</option>
                    ))}
                  </Select>
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
                <Field label="Description (facultative)" htmlFor="ref-new-description" hint="Explication affichée en aide dans les formulaires. 300 caractères au plus." className="lg:col-span-2">
                  <Textarea id="ref-new-description" rows={2} maxLength={300} value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} />
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
        Object.keys(groupedData).sort((a, b) => groupLabel(a).localeCompare(groupLabel(b), "fr")).map((group) => (
          <Card key={group} className="overflow-hidden">
            {/* Groupe repliable, fermé par défaut : on ouvre seulement la liste qu'on veut retoucher */}
            <details className="group/ref">
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bb-heading text-[0.95rem] font-bold tracking-[0.04em] text-bb-text uppercase">{groupLabel(group)}</span>
                  {GROUP_INFO[group] && <span className="text-sm text-bb-text-muted">Utilisé dans : {GROUP_INFO[group].usedIn}.</span>}
                </span>
                <Badge variant="neutral">{groupedData[group].length}</Badge>
                <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted transition-transform group-open/ref:rotate-180 motion-reduce:transition-none" />
              </summary>
              <ul aria-label={groupLabel(group)} className="m-0 list-none border-t border-bb-border p-0">
                {groupedData[group].map((item) => (
                  <li key={item.id} className="border-b border-bb-border px-4 py-3 last:border-b-0">
                    {editingId === item.id ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[160px_minmax(0,1fr)_110px]">
                          <Field label="Clé" htmlFor={`ref-edit-key-${item.id}`} hint={isProtected(item) ? "Clé protégée : le classement en dépend." : undefined}>
                            <Input id={`ref-edit-key-${item.id}`} className="font-mono" value={editForm.key} disabled={isProtected(item)} onChange={(e) => setEditForm({ ...editForm, key: e.target.value })} />
                          </Field>
                          <Field label="Libellé" htmlFor={`ref-edit-label-${item.id}`}>
                            <Input id={`ref-edit-label-${item.id}`} value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} />
                          </Field>
                          <Field label="Ordre" htmlFor={`ref-edit-order-${item.id}`}>
                            <Input id={`ref-edit-order-${item.id}`} type="number" inputMode="numeric" value={editForm.order} onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })} />
                          </Field>
                        </div>
                        <Field label="Description (facultative)" htmlFor={`ref-edit-description-${item.id}`} hint="Explication affichée en aide dans les formulaires. 300 caractères au plus.">
                          <Textarea id={`ref-edit-description-${item.id}`} rows={2} maxLength={300} value={editForm.description ?? ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                        </Field>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-h-11 items-center gap-3">
                            <Switch id={`ref-edit-active-${item.id}`} checked={editForm.isActive} disabled={isProtected(item)} onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })} />
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
                          {item.description && <span className="text-sm break-words text-bb-text-muted">{item.description}</span>}
                          <span className="flex flex-wrap items-center gap-2 text-sm text-bb-text-muted">
                            <span className="font-mono">{item.key}</span>
                            <span>Ordre {item.order}</span>
                            <Badge variant={item.isActive ? "success" : "danger"}>{item.isActive ? "Actif" : "Inactif"}</Badge>
                            {isProtected(item) && <Badge variant="neutral">Protégé</Badge>}
                          </span>
                        </div>
                        <Button type="button" variant="quiet" size="tap-icon" aria-label={`Modifier ${item.label}`} title="Modifier" onClick={() => handleStartEdit(item)}>
                          <Edit2 size={18} aria-hidden="true" />
                        </Button>
                        {!isProtected(item) && (
                          <Button type="button" variant="quiet" size="tap-icon" className="text-bb-danger-text" aria-label={`Supprimer ${item.label}`} title="Supprimer" onClick={() => setDeleteItem(item)}>
                            <Trash2 size={18} aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </details>
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
