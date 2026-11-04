"use client";

/**
 * Formulaire de création et de modification d'un tournoi (refonte, carte 089, ADR 0006).
 * Le formulaire est découpé en blocs lisibles sur téléphone : le tournoi (titre, ligue), les dates, le lieu (avec le
 * choix sur une carte et la recherche d'adresse), les participants et commissaires, les championnats, le jeu, les prix
 * et la logistique, puis la présentation détaillée (éditeur BBCode).
 * Sur ordinateur, la colonne « Publication » à droite porte les cases de modération et les boutons. Sur téléphone, les
 * cases passent sous la présentation et les boutons dans la barre collée en bas de l'écran (`ComposeActionBar`).
 * Les noms des champs envoyés et les actions serveur (`createTopic`, `updateTournament`) sont ceux d'avant la refonte.
 */
import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BedDouble, Calendar, Check, Coins, FileText, Globe, Lock, Map, MapPin, Monitor, Pin, Save, Shield, Sun, Trophy, Users, Utensils
} from "lucide-react";
import { Button, Card, Field, Input, Label, Select, Sheet, SheetContent, Skeleton, cn, toast, DESKTOP_QUERY, useMediaQuery } from "@bbfrance/ui";
import { createTopic, updateTournament } from "../actions";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import TitleInputWithSmiley from "@/app/forum/component/TitleInputWithSmiley";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import UserSearch from "@/common/components/UserSearch/UserSearch";
import LigueSearch from "@/common/components/LigueSearch/LigueSearch";
import { REGION_BY_DEPARTMENT } from "@/lib/france";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <Skeleton className="h-[50dvh] w-full lg:h-[420px]" />,
});

interface TournamentFormProps {
  forumId: string;
  userCanStick: boolean;
  /** Vrai pour un modérateur ou un administrateur : seuls eux voient et changent la case « CDF » (carte 162). */
  canSetCdf: boolean;
  referenceData: {
    franceRegions: any[];
    gameEditions: any[];
    departments: any[];
    tournamentTypes: any[];
    platforms: any[];
    coachRegions: any[];
    tournamentFormats: any[];
  };
  initialData?: {
    id: string;
    name: string;
    date: Date;
    endDate: Date | null;
    address: string | null;
    gmapsUrl: string | null;
    location: string;
    ville: string | null;
    departement: string | null;
    region: string | null;
    regionNAF: string | null;
    maxParticipants: number | null;
    isTeam: boolean;
    coachsPerTeam: number | null;
    price: number | null;
    priceMeals: number | null;
    priceLodging: number | null;
    structure: string | null;
    ruleset: string | null;
    gameEdition: string | null;
    platform: string | null;
    mealsIncluded: boolean;
    lodgingAtVenue: boolean;
    fridayArrival: boolean;
    isNAF: boolean;
    isCDF: boolean;
    isCGO: boolean;
    isTGE: boolean;
    isTSC: boolean;
    typeCDF: string | null;
    ligueId: string | null;
    ligueCustom: string | null;
    /** Ligue du site déjà rattachée : affichée choisie dans `LigueSearch`, sinon elle serait perdue à l'enregistrement. */
    ligue?: { id: string; name: string; acronym: string; region: string | null; geographicalZone: string | null } | null;
    commissaires: any[];
    topicId: string;
    firstPostId: string;
    postContent: string;
    isOrganizer: boolean;
    lat: number | null;
    lng: number | null;
    totalMatches: number | null;
    tournamentType: string | null;
  };
}

/** Un bloc du formulaire : carte avec un titre et son icône. */
function Block({ icon, title, children, className }: { icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("flex flex-col gap-4 p-4 lg:p-5", className)}>
      <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
        <span aria-hidden="true" className="text-bb-accent-text">{icon}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

/** Case à cocher sur une ligne de 44 pixels (libellé à droite). */
function CheckRow({ name, label, icon, checked, defaultChecked, onChange }: {
  name: string;
  label: string;
  icon?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 text-[0.95rem] text-bb-text has-[:checked]:border-bb-accent-text has-[:checked]:bg-bb-accent-soft">
      <input
        type="checkbox"
        name={name}
        className="size-5 shrink-0 cursor-pointer accent-[var(--bb-accent)]"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
      />
      {icon && <span aria-hidden="true" className="text-bb-text-muted">{icon}</span>}
      <span>{label}</span>
    </label>
  );
}

const hint = "m-0 text-sm text-bb-text-muted";

export default function TournamentForm({ forumId, userCanStick, canSetCdf, referenceData, initialData }: TournamentFormProps) {
  const isEdit = !!initialData;
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isTeam, setIsTeam] = useState(initialData?.isTeam ?? false);
  const [isCDF, setIsCDF] = useState(initialData?.isCDF ?? false);
  const [commissaires, setCommissaires] = useState<any[]>(initialData?.commissaires ?? []);
  const [startDate, setStartDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : "");
  const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "");

  const [lat, setLat] = useState<number | null>(initialData?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initialData?.lng ?? null);
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [pairingType, setPairingType] = useState<"INDIVIDUEL" | "EQUIPE">(
    initialData?.typeCDF === "EQUIPE_TOTALE" ? "EQUIPE" : "INDIVIDUEL"
  );

  const [selectedRegion, setSelectedRegion] = useState<string>(initialData?.region || "");
  const [selectedDept, setSelectedDept] = useState<string>(initialData?.departement || "");

  const filteredDepartments = selectedRegion
    ? referenceData.departments.filter(d => REGION_BY_DEPARTMENT[d.key] === selectedRegion)
    : referenceData.departments;

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, allowDecimal = false) => {
    // Liste des touches spéciales autorisées
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter', 'Escape'];
    if (allowDecimal) {
      allowedKeys.push('.', ',');
    }

    // Autoriser les raccourcis Ctrl/Cmd + A, C, V, X
    if (e.ctrlKey || e.metaKey) return;

    // Bloquer ce qui n'est pas un chiffre ou une touche autorisée
    if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }

    // Bloquer les virgules/points multiples
    if ((e.key === '.' || e.key === ',') && (e.currentTarget.value.includes('.') || e.currentTarget.value.includes(','))) {
      e.preventDefault();
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    if (endDate && val && endDate < val) {
      setEndDate(val);
    }
  };

  // On crée une version client-side de l'action pour injecter les IDs fixes en mode édition
  const formAction = async (formData: FormData) => {
    if (isEdit && initialData) {
      // En cas de succès, l'action redirige vers le sujet : on n'arrive ici qu'en cas de refus.
      const res = await updateTournament(initialData.id, initialData.topicId, initialData.firstPostId, formData);
      if (!res.success) toast.error(res.error || "Erreur lors de la modification du tournoi.");
    } else {
      // Même chose à la création : redirection vers le nouveau sujet en cas de succès, notification sinon
      const res = await createTopic(formData);
      if (res && !res.success) toast.error(res.error || "Erreur lors de la création du tournoi.");
    }
  };

  const submitLabel = isEdit ? "Enregistrer les modifications" : "Publier le tournoi";
  const submitIcon = isEdit ? <Save size={18} aria-hidden="true" /> : <Trophy size={18} aria-hidden="true" />;
  const cancelHref = isEdit && initialData ? `/forum/topic/${initialData.topicId}` : `/forum/${forumId}`;
  const grid2 = "grid gap-4 sm:grid-cols-2";
  const numeric = { inputMode: "numeric" as const, onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => handleNumericKeyDown(e) };
  const decimal = { inputMode: "decimal" as const, onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => handleNumericKeyDown(e, true) };

  const moderationBoxes = userCanStick && (
    <div className="flex flex-col gap-2">
      <CheckRow name="isSticky" label="Épingler (Post-it)" icon={<Pin size={16} />} />
      <CheckRow name="isLocked" label="Verrouiller le sujet" icon={<Lock size={16} />} />
    </div>
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="forumId" value={forumId} />
      <input type="hidden" name="tLat" value={lat ?? ""} />
      <input type="hidden" name="tLng" value={lng ?? ""} />
      <input type="hidden" name="commissaireIds" value={commissaires.map(u => u.id).join(',')} />
      <input type="hidden" name="typeCDF" value={!isTeam ? "INDIVIDUEL" : (pairingType === "EQUIPE" ? "EQUIPE_TOTALE" : "EQUIPE_PARTIELLE")} />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Block icon={<Trophy size={18} />} title="Le tournoi">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Titre de l&apos;annonce (nom du tournoi)</Label>
              <TitleInputWithSmiley name="title" initialValue={initialData?.name} placeholder="Ex : Open de Bretagne 2027" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="m-0 text-sm font-semibold text-bb-text">Ligue organisatrice (facultatif)</p>
              <LigueSearch initialLigue={initialData?.ligue} initialCustom={initialData?.ligueCustom} placeholder="Rechercher une ligue ou saisir un nom personnalisé..." />
              <p className={hint}>Laissez vide si le tournoi n&apos;est rattaché à aucune ligue.</p>
            </div>
          </Block>

          <Block icon={<Calendar size={18} />} title="Dates">
            <div className={grid2}>
              <Field label="Date de début" htmlFor="tDate">
                <Input id="tDate" type="date" name="tDate" required value={startDate} onChange={handleStartDateChange} />
              </Field>
              <Field label="Date de fin" htmlFor="tEndDate" hint="Laissez vide pour un tournoi d'un jour.">
                <Input id="tEndDate" type="date" name="tEndDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} />
              </Field>
            </div>
          </Block>

          <Block icon={<MapPin size={18} />} title="Lieu">
            <div className={grid2}>
              <Field label="Région de tournoi (NAF)" htmlFor="tRegionNAF">
                <Select id="tRegionNAF" name="tRegionNAF" defaultValue={initialData?.regionNAF || ""}>
                  <option value="">Sélectionner</option>
                  {referenceData.coachRegions.map(r => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Région (France)" htmlFor="tRegion">
                <Select
                  id="tRegion"
                  name="tRegion"
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedDept("");
                  }}
                >
                  <option value="">Sélectionner</option>
                  {referenceData.franceRegions.map(r => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Département" htmlFor="tDept">
                <Select id="tDept" name="tDept" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  <option value="">Sélectionner</option>
                  {filteredDepartments.map(d => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Ville" htmlFor="tVille">
                <Input id="tVille" type="text" name="tVille" defaultValue={initialData?.ville || ""} placeholder="Ex : Lyon" autoComplete="address-level2" />
              </Field>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tAddress">Adresse exacte du lieu</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Map size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
                  <Input
                    id="tAddress"
                    type="text"
                    name="tAddress"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex : 5 rue de la Paix, Paris"
                    className="pl-10"
                    autoComplete="street-address"
                  />
                </div>
                <Button type="button" variant="secondary" size="tap" className="shrink-0" onClick={() => setIsMapModalOpen(true)}>
                  <Globe size={18} aria-hidden="true" /> Choisir sur la carte
                </Button>
              </div>
              {lat != null && lng != null && (
                <p className="m-0 flex items-center gap-1.5 text-sm text-bb-success-text">
                  <Check size={16} aria-hidden="true" /> Localisation précise définie ({lat.toFixed(5)}, {lng.toFixed(5)})
                </p>
              )}
            </div>
          </Block>

          <Block icon={<Users size={18} />} title="Participants">
            <div className={cn(grid2, "sm:items-end")}>
              <CheckRow name="isTeam" label="En équipe" icon={<Users size={16} />} checked={isTeam} onChange={setIsTeam} />
              <Field label={isTeam ? "Nombre d'équipes max" : "Nombre de coachs max"} htmlFor="tMax">
                <Input
                  id="tMax"
                  type="number"
                  name="tMax"
                  defaultValue={initialData?.maxParticipants || ""}
                  placeholder="Ex : 40"
                  min={1}
                  {...numeric}
                  onBlur={(e) => {
                    if (e.target.value && parseInt(e.target.value) < 1) e.target.value = "1";
                  }}
                />
              </Field>
            </div>

            {isTeam && (
              <div className={cn(grid2, "rounded-bb-md border border-dashed border-bb-border p-3")}>
                <Field label="Coachs par équipe" htmlFor="tCoachsPerTeam">
                  <Input
                    id="tCoachsPerTeam"
                    type="number"
                    name="tCoachsPerTeam"
                    defaultValue={Math.max(2, initialData?.coachsPerTeam || 2)}
                    min={2}
                    {...numeric}
                    onBlur={(e) => {
                      if (parseInt(e.target.value) < 2 || !e.target.value) e.target.value = "2";
                    }}
                  />
                </Field>
                <Field label="Système d'appariement" htmlFor="pairingType">
                  <Select id="pairingType" value={pairingType} onChange={(e) => setPairingType(e.target.value as "INDIVIDUEL" | "EQUIPE")}>
                    <option value="INDIVIDUEL">Individuel (Partiel)</option>
                    <option value="EQUIPE">Par équipe (Total)</option>
                  </Select>
                </Field>
              </div>
            )}

            {(initialData?.isOrganizer ?? true) && (
              <div className="flex flex-col gap-1.5">
                <p className="m-0 text-sm font-semibold text-bb-text">Commissaires (en plus de vous)</p>
                <UserSearch
                  selectedUsers={commissaires}
                  onSelect={(user) => setCommissaires(prev => [...prev, user])}
                  onRemove={(userId) => setCommissaires(prev => prev.filter(u => u.id !== userId))}
                  placeholder="Chercher un commissaire..."
                  maxSelections={10}
                />
                <p className={hint}>Les commissaires pourront modifier les infos du tournoi et gérer les inscriptions.</p>
              </div>
            )}
          </Block>

          <Block icon={<Shield size={18} />} title="Championnats et points">
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 text-sm font-semibold text-bb-text">Le tournoi compte pour</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {(canSetCdf ? ['NAF', 'CDF', 'CGO', 'TGE', 'TSC'] : ['NAF', 'CGO', 'TGE', 'TSC']).map(c => (
                  <label
                    key={c}
                    className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-bb-md border border-bb-border bg-bb-surface-2 px-2 font-bold text-bb-text has-[:checked]:border-bb-accent-text has-[:checked]:bg-bb-accent-soft has-[:checked]:text-bb-accent-text"
                  >
                    <input
                      type="checkbox"
                      name={`is${c}`}
                      className="size-5 shrink-0 cursor-pointer accent-[var(--bb-accent)]"
                      defaultChecked={(initialData as any)?.[`is${c}`] ?? (c === 'CDF' ? isCDF : false)}
                      onChange={(e) => {
                        if (c === 'CDF') setIsCDF(e.target.checked);
                      }}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
              {!canSetCdf && (
                <p className={cn(hint, "mt-2")}>
                  {isCDF
                    ? "Ce tournoi compte pour la Coupe de France (CDF). Seuls les modérateurs et les administrateurs peuvent changer ce choix."
                    : "La Coupe de France (CDF) est accordée par les modérateurs et les administrateurs : demandez-leur de l'ajouter à votre tournoi."}
                </p>
              )}
            </fieldset>

            {isCDF && (
              <div className="rounded-bb-md border-l-4 border-bb-accent bg-bb-surface-2 px-3 py-2">
                <p className="m-0 text-sm font-semibold text-bb-text">
                  Type de classement CDF :{" "}
                  <span className="text-bb-accent-text">{!isTeam ? "Individuel" : (pairingType === "EQUIPE" ? "Équipe Totale" : "Équipe Partielle")}</span>
                </p>
                <p className={hint}>Le calcul des points s&apos;adaptera automatiquement à ce format.</p>
              </div>
            )}

            <Field label="Nombre de rondes (total)" htmlFor="tTotalMatches" hint="Sert au calcul des points CDF. Sans valeur, le site prend le nombre de rondes saisies avec les résultats, ou à défaut 3 rondes par jour.">
              <Input id="tTotalMatches" type="number" name="tTotalMatches" defaultValue={initialData?.totalMatches ?? ""} placeholder="Ex : 5" min={1} className="sm:max-w-40" {...numeric} />
            </Field>
          </Block>

          <Block icon={<Monitor size={18} />} title="Jeu">
            <div className={grid2}>
              <Field label="Plateforme" htmlFor="tPlatform">
                <Select id="tPlatform" name="tPlatform" defaultValue={initialData?.platform || "Tabletop"}>
                  {referenceData.platforms.map(p => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Édition du jeu" htmlFor="tGame">
                <Select id="tGame" name="tGame" defaultValue={initialData?.gameEdition || "BB2025"}>
                  {referenceData.gameEditions.map(g => (
                    <option key={g.key} value={g.key}>{g.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Format de tournoi" htmlFor="tStructure">
                <Select id="tStructure" name="tStructure" defaultValue={initialData?.structure || "Resurrection"}>
                  {referenceData.tournamentFormats.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Type de tournoi" htmlFor="tournamentType">
                <Select id="tournamentType" name="tournamentType" defaultValue={initialData?.tournamentType || "SWISS"}>
                  {referenceData.tournamentTypes.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Ruleset (pack de règles)" htmlFor="tRuleset">
              <Input id="tRuleset" type="text" name="tRuleset" defaultValue={initialData?.ruleset || ""} placeholder="Ex : Eurobowl 2024" />
            </Field>
          </Block>

          <Block icon={<Coins size={18} />} title="Prix et logistique">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Prix d'inscription (€)" htmlFor="tPrice">
                <Input id="tPrice" type="number" step="0.5" name="tPrice" defaultValue={initialData?.price || ""} placeholder="Ex : 15" {...decimal} />
              </Field>
              <Field label="Prix du repas (€, facultatif)" htmlFor="tPriceMeals">
                <Input id="tPriceMeals" type="number" step="0.5" name="tPriceMeals" defaultValue={initialData?.priceMeals || ""} placeholder="Ex : 5" {...decimal} />
              </Field>
              <Field label="Prix du logement (€, facultatif)" htmlFor="tPriceLodging">
                <Input id="tPriceLodging" type="number" step="0.5" name="tPriceLodging" defaultValue={initialData?.priceLodging || ""} placeholder="Ex : 10" {...decimal} />
              </Field>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <CheckRow name="tMeals" label="Repas inclus" icon={<Utensils size={16} />} defaultChecked={initialData?.mealsIncluded} />
              <CheckRow name="tLodging" label="Dodo sur place" icon={<BedDouble size={16} />} defaultChecked={initialData?.lodgingAtVenue} />
              <CheckRow name="tFriday" label="Accueil vendredi" icon={<Sun size={16} />} defaultChecked={initialData?.fridayArrival} />
            </div>
          </Block>

          <Block icon={<FileText size={18} />} title="Présentation">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Présentation complète et règlement détaillé</Label>
              <BBCodeEditor
                id="content"
                name="content"
                required={true}
                defaultValue={initialData?.postContent}
                placeholder="Détaillez ici votre tournoi, horaires, lots, etc. Le parser BBCode est disponible."
                rows={18}
              />
            </div>
          </Block>

          {/* Téléphone : cases de modération sous la présentation */}
          {userCanStick && <div className="lg:hidden">{moderationBoxes}</div>}
        </div>

        {/* Colonne « Publication » (ordinateur) */}
        <aside aria-label="Publication" className="hidden lg:block">
          <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
            <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
              <span aria-hidden="true" className="text-bb-accent-text">{submitIcon}</span>
              Publication
            </h2>
            {moderationBoxes}
            <Button type="submit" variant="primary" size="tap" className="w-full">
              {submitLabel}
            </Button>
            <Button asChild variant="secondary" size="tap" className="w-full">
              <Link href={cancelHref}>Annuler</Link>
            </Button>
          </Card>
        </aside>
      </div>

      <ComposeActionBar className="lg:hidden">
        <Button asChild variant="secondary" size="tap">
          <Link href={cancelHref}>Annuler</Link>
        </Button>
        <Button type="submit" variant="primary" size="tap" className="flex-1">
          {submitIcon} {submitLabel}
        </Button>
      </ComposeActionBar>

      <Sheet open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <SheetContent title="Localisation du tournoi" side={isDesktop ? "center" : "bottom"} className="lg:w-[min(860px,calc(100vw-2rem))]">
          <MapPicker
            initialCenter={lat && lng ? [lat, lng] : undefined}
            initialSearch={address}
            onSelect={(newLat, newLng, newAddress) => {
              setLat(newLat);
              setLng(newLng);
              if (newAddress) {
                // On nettoie un peu l'adresse de Nominatim qui est souvent trop longue
                const parts = newAddress.split(',');
                const shortAddress = parts.slice(0, 3).join(',').trim();
                setAddress(shortAddress);
              }
              setIsMapModalOpen(false);
            }}
            onCancel={() => setIsMapModalOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </form>
  );
}
