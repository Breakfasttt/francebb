"use client";

/**
 * Éditeur d'une archive du classement du Championnat de France (refonte, carte 097, ADR 0006), réservé à la
 * modération : création à la main, modification d'une archive existante ou reprise d'un import de l'ancien site.
 * Le formulaire est découpé en blocs :
 * - « L'archive » : l'année et le nom ;
 * - « Classement » : une ligne par coach, triée par points (nom du coach, lien vers un membre du site, numéro NAF,
 *   points total, nombre de tournois). Sur ordinateur, une colonne par information ; sur téléphone, une carte par
 *   coach avec des champs libellés. Le bouton « Détails des tournois de … » déplie les 4 meilleurs tournois retenus
 *   (nom, place, points) ; « Supprimer la ligne de … » retire le coach.
 * « Enregistrer l'archive » est dans la colonne « Publication » sur ordinateur et dans la barre collée en bas de l'écran
 * sur téléphone (l'écran n'a alors pas la barre de navigation du bas, voir `isComposePath`).
 * Les données enregistrées et l'action serveur `saveArchive` sont celles d'avant la refonte.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Info, ListOrdered, PlusCircle, Save, Trash2, Trophy } from "lucide-react";
import { Button, Card, Field, Input, cn, toast } from "@bbfrance/ui";
import UserMapper from "@/common/components/UserMapper/UserMapper";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import { saveArchive } from "../actions";

/* eslint-disable @typescript-eslint/no-explicit-any -- les lignes d'une archive sont un JSON libre (voir saveArchive) */

interface ArchiveEditorProps {
  initialData: {
    year: number;
    name: string;
    rankingData: any[];
  };
  allUsers: any[];
}

const emptyResult = () => ({ name: "", rank: 0, points: 0 });

/** Un bloc du formulaire : carte avec un titre et son icône. */
function Block({ icon, title, action, children }: { icon: ReactNode; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-4 p-4 lg:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
          <span aria-hidden="true" className="text-bb-accent-text">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

/** Champ numérique : clavier numérique sur téléphone, chiffres alignés. */
function NumberField({ id, value, onChange, decimal, className }: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  decimal?: boolean;
  className?: string;
}) {
  return (
    <Input
      id={id}
      type="number"
      inputMode={decimal ? "decimal" : "numeric"}
      step={decimal ? "0.0001" : "1"}
      className={cn("tabular-nums", className)}
      value={Number.isNaN(value) ? "" : value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : decimal ? parseFloat(e.target.value) : parseInt(e.target.value))}
    />
  );
}

/** Libellé d'un champ de ligne : visible sur téléphone (carte du coach), lu seulement par les lecteurs d'écran sur ordinateur. */
const cellLabel = "text-xs font-semibold text-bb-text-muted lg:sr-only";
const cell = "flex min-w-0 flex-col gap-1";

/**
 * Grille d'une ligne. Ordinateur : rang, coach, membre, NAF, points, tournois, détails, suppression (comme l'en-tête).
 * Téléphone : carte de 4 colonnes (rang, coach, détails et suppression en haut ; membre ; NAF, points et tournois).
 */
const rowColumns =
  "grid grid-cols-[2.25rem_minmax(0,1fr)_2.75rem_2.75rem] gap-x-2 gap-y-3 lg:grid-cols-[2.5rem_minmax(0,1.2fr)_minmax(0,1fr)_7rem_7rem_6rem_2.75rem_2.75rem] lg:items-center lg:gap-2";

export default function ArchiveEditor({ initialData, allUsers }: ArchiveEditorProps) {
  const router = useRouter();
  const [year, setYear] = useState(initialData.year);
  const [name, setName] = useState(initialData.name);
  // Chaque ligne reçoit une clé interne (`_key`), retirée à l'enregistrement, et le membre lié pour l'affichage (`user`)
  const [entries, setEntries] = useState<any[]>(() =>
    initialData.rankingData.map((entry, index) => ({
      ...entry,
      _key: entry.id ?? `row-${index}`,
      user: entry.userId ? allUsers.find((u) => u.id === entry.userId) ?? null : null,
      bestResults: Array.isArray(entry.bestResults) ? entry.bestResults : [],
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (key: string) => setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));

  const addEntry = () => {
    const key = `new-${Date.now()}`;
    setEntries((prev) => [
      { id: key, _key: key, name: "", nafNumber: "", userId: null, user: null, totalPoints: 0, bestResults: [emptyResult(), emptyResult(), emptyResult(), emptyResult()], count: 0 },
      ...prev,
    ]);
    setExpandedRows((prev) => ({ ...prev, [key]: true }));
    toast.success("Nouveau coach ajouté");
  };

  // Mises à jour par fonction : plusieurs changements de suite sur la même ligne s'additionnent au lieu de s'écraser
  const updateEntry = (key: string, changes: Record<string, unknown>) =>
    setEntries((prev) => prev.map((entry) => (entry._key === key ? { ...entry, ...changes } : entry)));

  const removeEntry = (key: string) => setEntries((prev) => prev.filter((entry) => entry._key !== key));

  const updateBestResult = (key: string, resultIndex: number, field: string, value: unknown) =>
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry._key !== key) return entry;
        const results = [...entry.bestResults];
        while (results.length <= resultIndex) results.push(emptyResult());
        results[resultIndex] = { ...results[resultIndex], [field]: value };
        return { ...entry, bestResults: results };
      })
    );

  const onUserSelect = (entry: any, selected: any) => {
    // Le numéro NAF du membre vient de la liste complète des membres (la recherche ne le renvoie pas)
    const user = allUsers.find((u) => u.id === selected.id) ?? selected;
    const fillNaf = !entry.nafNumber && user.nafNumber;
    updateEntry(entry._key, {
      userId: user.id,
      user,
      ...(entry.name ? {} : { name: user.name }),
      ...(fillNaf ? { nafNumber: user.nafNumber } : {}),
    });
    if (fillNaf) toast.success(`NAF #${user.nafNumber} récupéré du compte`);
  };

  const handleSave = async () => {
    if (!year || Number.isNaN(year) || !name) {
      toast.error("Veuillez remplir l'année et le nom avec des valeurs valides.");
      return;
    }
    setIsSaving(true);
    try {
      // Le membre affiché et la clé interne ne sont pas enregistrés (seul `userId` l'est)
      const cleanEntries = entries.map((entry) => {
        const saved = { ...entry };
        delete saved.user;
        delete saved._key;
        return saved;
      });
      const res = await saveArchive(year, name, cleanEntries);
      if (res.success) {
        toast.success("Archive sauvegardée !");
        // La page du classement recharge ses données à l'ouverture : un simple changement de page suffit
        router.push("/classement");
      } else {
        toast.error(res.error || "Erreur lors de la sauvegarde.");
      }
    } catch {
      toast.error("Une erreur serveur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const sortedEntries = [...entries].sort((a, b) => b.totalPoints - a.totalPoints);
  const saveIcon = <Save size={18} aria-hidden="true" />;

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
      <div className="flex min-w-0 flex-col gap-4">
        <Block icon={<Trophy size={18} />} title="L'archive">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <Field label="Année du championnat" htmlFor="archive-year">
              <Input
                id="archive-year"
                type="number"
                inputMode="numeric"
                value={Number.isNaN(year) ? "" : year}
                onChange={(e) => setYear(e.target.value === "" ? NaN : parseInt(e.target.value))}
              />
            </Field>
            <Field label="Nom de l'archive" htmlFor="archive-name">
              <Input id="archive-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Championnat de France 2026" />
            </Field>
          </div>
        </Block>

        <Block
          icon={<ListOrdered size={18} />}
          title={`Classement (${entries.length} coach${entries.length > 1 ? "s" : ""})`}
          action={
            <Button type="button" variant="secondary" size="tap" onClick={addEntry}>
              <PlusCircle size={18} aria-hidden="true" /> Ajouter un coach
            </Button>
          }
        >
          {entries.length === 0 ? (
            <p className="m-0 rounded-bb-md border border-dashed border-bb-border px-4 py-8 text-center text-[0.95rem] text-bb-text-muted">
              Aucune ligne pour l&apos;instant. Appuyez sur « Ajouter un coach » pour commencer.
            </p>
          ) : (
            <div className="flex flex-col gap-3 lg:gap-0">
              <div aria-hidden="true" className={cn(rowColumns, "hidden border-b border-bb-border px-2 pb-2 text-xs font-bold tracking-wide text-bb-text-muted uppercase lg:grid")}>
                <span className="text-center">#</span>
                <span>Coach</span>
                <span>Membre du site</span>
                <span>NAF</span>
                <span>Points total</span>
                <span>Tournois</span>
                <span />
                <span />
              </div>
              <ol className="m-0 flex list-none flex-col gap-3 p-0 lg:gap-0">
                {sortedEntries.map((entry, index) => {
                  const key = entry._key;
                  const isExpanded = !!expandedRows[key];
                  const coachLabel = entry.name || "ce coach";
                  const id = (field: string) => `archive-${index}-${field}`;
                  return (
                    <li key={key} className="rounded-bb-md border border-bb-border bg-bb-surface p-3 lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:px-2 lg:py-2">
                      <div className={rowColumns}>
                        <span className="self-center text-center text-lg font-bold text-bb-text-muted tabular-nums max-lg:col-start-1 max-lg:row-start-1">{index + 1}</span>
                        <div className={cn(cell, "max-lg:col-start-2 max-lg:row-start-1")}>
                          <label htmlFor={id("coach")} className={cellLabel}>Nom du coach</label>
                          <Input id={id("coach")} type="text" value={entry.name} onChange={(e) => updateEntry(key, { name: e.target.value })} placeholder="Nom du coach" />
                        </div>
                        <div className={cn(cell, "max-lg:col-span-4 max-lg:row-start-2")}>
                          <span className={cellLabel}>Membre du site</span>
                          <div className="min-w-0">
                            <UserMapper
                              selectedUser={entry.user}
                              onSelect={(user) => onUserSelect(entry, user)}
                              onRemove={() => updateEntry(key, { userId: null, user: null })}
                              placeholder="Lier à un membre…"
                            />
                          </div>
                        </div>
                        {/* Téléphone : NAF, points et tournois sur une ligne ; ordinateur : chacun dans sa colonne */}
                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.8fr)] items-end gap-2 max-lg:col-span-4 max-lg:row-start-3 lg:contents">
                          <div className={cell}>
                            <label htmlFor={id("naf")} className={cellLabel}>Numéro NAF</label>
                            <Input id={id("naf")} type="text" inputMode="numeric" value={entry.nafNumber || ""} onChange={(e) => updateEntry(key, { nafNumber: e.target.value })} placeholder="NAF" />
                          </div>
                          <div className={cell}>
                            <label htmlFor={id("points")} className={cellLabel}>Points total</label>
                            <NumberField id={id("points")} decimal value={entry.totalPoints} onChange={(value) => updateEntry(key, { totalPoints: value })} />
                          </div>
                          <div className={cell}>
                            <label htmlFor={id("count")} className={cellLabel}>Nombre de tournois</label>
                            <NumberField id={id("count")} value={entry.count} onChange={(value) => updateEntry(key, { count: value })} />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="tap-icon"
                          className="self-end lg:self-center max-lg:col-start-3 max-lg:row-start-1"
                          aria-expanded={isExpanded}
                          aria-controls={`archive-details-${key}`}
                          aria-label={`Détails des tournois de ${coachLabel}`}
                          title="Meilleurs tournois retenus"
                          onClick={() => toggleRow(key)}
                        >
                          <ChevronDown size={18} aria-hidden="true" className={cn("transition-transform", isExpanded && "rotate-180")} />
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="tap-icon"
                          className="self-end lg:self-center max-lg:col-start-4 max-lg:row-start-1"
                          aria-label={`Supprimer la ligne de ${coachLabel}`}
                          title="Supprimer la ligne"
                          onClick={() => removeEntry(key)}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>

                      {isExpanded && (
                        <div id={`archive-details-${key}`} className="mt-3 rounded-bb-md border border-dashed border-bb-border bg-bb-surface-2 p-3">
                          <p className="m-0 mb-3 text-sm font-bold text-bb-text">Meilleurs tournois retenus (4 au plus)</p>
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {[0, 1, 2, 3].map((resultIndex) => {
                              const result = entry.bestResults[resultIndex] || emptyResult();
                              const rid = (field: string) => `${id("t")}${resultIndex}-${field}`;
                              const prefix = <span className="sr-only">Tournoi {resultIndex + 1} : </span>;
                              return (
                                <fieldset key={resultIndex} className="m-0 grid min-w-0 grid-cols-[minmax(0,1fr)_4.5rem_6rem] gap-2 border-0 p-0">
                                  <legend className="mb-1 p-0 text-xs font-bold tracking-wide text-bb-text-muted uppercase">Tournoi {resultIndex + 1}</legend>
                                  <div className={cn(cell, "col-span-3 sm:col-span-1")}>
                                    <label htmlFor={rid("name")} className="text-xs font-semibold text-bb-text-muted">{prefix}Nom</label>
                                    <Input id={rid("name")} type="text" value={result.name} onChange={(e) => updateBestResult(key, resultIndex, "name", e.target.value)} placeholder="Nom du tournoi" />
                                  </div>
                                  <div className={cn(cell, "max-sm:col-start-1")}>
                                    <label htmlFor={rid("rank")} className="text-xs font-semibold text-bb-text-muted">{prefix}Rang</label>
                                    <Input
                                      id={rid("rank")}
                                      type="number"
                                      inputMode="numeric"
                                      className="tabular-nums"
                                      value={result.rank === 0 ? "" : result.rank}
                                      onChange={(e) => updateBestResult(key, resultIndex, "rank", e.target.value === "" ? 0 : parseInt(e.target.value))}
                                    />
                                  </div>
                                  <div className={cn(cell, "max-sm:col-span-2")}>
                                    <label htmlFor={rid("points")} className="text-xs font-semibold text-bb-text-muted">{prefix}Points</label>
                                    <Input
                                      id={rid("points")}
                                      type="number"
                                      inputMode="decimal"
                                      step="0.0001"
                                      className="tabular-nums"
                                      value={result.points === 0 ? "" : result.points}
                                      onChange={(e) => updateBestResult(key, resultIndex, "points", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                    />
                                  </div>
                                </fieldset>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </Block>

        <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm text-bb-text-muted">
          {[
            "Le bouton en forme de flèche de chaque ligne ouvre le détail des tournois retenus.",
            "Lier un membre remplit le numéro NAF seulement si le champ est vide.",
            "Les « points total » sont le score officiel calculé sur la saison.",
          ].map((note) => (
            <li key={note} className="flex items-start gap-1.5">
              <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Colonne « Publication » (ordinateur) */}
      <aside aria-label="Publication" className="hidden lg:block">
        <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
          <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
            <span aria-hidden="true" className="text-bb-accent-text">{saveIcon}</span>
            Publication
          </h2>
          <p className="m-0 text-sm text-bb-text-muted">
            L&apos;archive remplace le calcul en direct pour cette année. Elle est visible de tous dès l&apos;enregistrement.
          </p>
          <Button type="button" variant="primary" size="tap" className="w-full" disabled={isSaving} onClick={handleSave}>
            {saveIcon} Enregistrer l&apos;archive
          </Button>
          <Button asChild variant="secondary" size="tap" className="w-full">
            <Link href="/classement">Annuler</Link>
          </Button>
        </Card>
      </aside>

      <ComposeActionBar className="lg:hidden">
        <Button asChild variant="secondary" size="tap">
          <Link href="/classement">Annuler</Link>
        </Button>
        <Button type="button" variant="primary" size="tap" className="flex-1" disabled={isSaving} onClick={handleSave}>
          {saveIcon} Enregistrer
        </Button>
      </ComposeActionBar>
    </div>
  );
}
