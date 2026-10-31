"use client";

/**
 * Formulaire de création et de modification d'une ligue (refonte, carte 094, ADR 0006), sur le modèle du formulaire
 * de tournoi (carte 089). Il est découpé en blocs lisibles sur téléphone : la ligue (nom, acronyme), le blason, la
 * localisation (zone, ville, région, département, adresse avec le choix sur une carte), les commissaires, puis la
 * présentation (éditeur BBCode), en dernier parce que c'est le champ le plus long. Sur téléphone, la liste des coachs
 * trouvés pour les commissaires reste ainsi loin de la barre d'envoi collée en bas de l'écran.
 * Sur ordinateur, la colonne « Publication » à droite porte les boutons ; sur téléphone, ils sont dans la barre
 * collée en bas de l'écran (`ComposeActionBar`) et l'écran n'a pas la barre de navigation du bas (`isComposePath`).
 * Les noms des champs envoyés et les actions serveur (`createLigue`, `updateLigue`) sont ceux d'avant la refonte.
 */
import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Check, FileText, Globe, ImageIcon, Map, MapPin, Save, Shield, Users } from "lucide-react";
import { Button, Card, Field, Input, Label, Select, Sheet, SheetContent, Skeleton, cn, toast, DESKTOP_QUERY, useMediaQuery } from "@bbfrance/ui";
import ActionForm from "@/common/components/Form/ActionForm";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import UserSearch from "@/common/components/UserSearch/UserSearch";
import type { Rank } from "@/common/components/UserAvatar/UserAvatar";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import { REGION_BY_DEPARTMENT } from "@/lib/france";
import { createLigue, updateLigue } from "@/app/ligues/actions";
import LigueBlasonUpload from "./LigueBlasonUpload";

const MapPicker = dynamic(() => import("@/app/forum/component/MapPicker"), {
  ssr: false,
  loading: () => <Skeleton className="h-[50dvh] w-full lg:h-[420px]" />,
});

type Option = { key: string; label: string };
type Member = { id: string; name: string | null; image: string | null; avatarFrame?: Rank | null };

interface LigueFormProps {
  /** Identifiant de la ligue modifiée ; absent pour une création. */
  ligueId?: string;
  initialData?: {
    name: string;
    acronym: string;
    geographicalZone: string | null;
    region: string | null;
    departement: string | null;
    ville: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    description: string | null;
    image: string | null;
  };
  referenceData: { coachRegions: Option[]; franceRegions: Option[]; departments: Option[] };
  /** Commissaires actuels (modification). */
  commissaires?: Member[];
  /** Chef de ligue ou modération (et toute création) : la liste des commissaires peut être changée. */
  canEditCommissaires: boolean;
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

const hint = "m-0 text-sm text-bb-text-muted";

export default function LigueForm({ ligueId, initialData, referenceData, commissaires: initialCommissaires = [], canEditCommissaires }: LigueFormProps) {
  const isEdit = !!ligueId;
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [commissaires, setCommissaires] = useState<Member[]>(initialCommissaires);
  const [selectedRegion, setSelectedRegion] = useState(initialData?.region || "");
  const [selectedDept, setSelectedDept] = useState(initialData?.departement || "");
  const [lat, setLat] = useState<number | null>(initialData?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initialData?.lng ?? null);
  const [address, setAddress] = useState(initialData?.address || "");
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Départements proposés : ceux de la région choisie, sinon tous
  const departments = selectedRegion
    ? referenceData.departments.filter((d) => REGION_BY_DEPARTMENT[d.key] === selectedRegion)
    : referenceData.departments;

  // Création : l'action redirige vers la nouvelle ligue. Modification : l'action renvoie le résultat, annoncé ici.
  const action = async (formData: FormData) => {
    if (!isEdit) return createLigue(formData);
    const result = await updateLigue(ligueId, formData);
    if (result.success) toast.success("Ligue mise à jour avec succès !");
    return result;
  };

  const submitLabel = isEdit ? "Enregistrer les modifications" : "Créer la ligue";
  const submitIcon = isEdit ? <Save size={18} aria-hidden="true" /> : <Shield size={18} aria-hidden="true" />;
  const cancelHref = isEdit ? `/ligue/${ligueId}` : "/ligues";

  return (
    // La classe ligue-form sert de repère au test smoke.spec.ts (création refusée sans nom)
    <ActionForm action={action} className="ligue-form" fallbackError={isEdit ? "Erreur lors de la mise à jour." : "La création de la ligue a échoué."}>
      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />
      {canEditCommissaires && <input type="hidden" name="commissaireIds" value={commissaires.map((user) => user.id).join(",")} />}

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Block icon={<Shield size={18} />} title="La ligue">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
              <Field label="Nom complet de la ligue (obligatoire)" htmlFor="ligueName">
                <Input id="ligueName" type="text" name="name" required defaultValue={initialData?.name} placeholder="Ex : Ligue de Blood Bowl de Lyon" />
              </Field>
              <Field label="Acronyme (obligatoire)" htmlFor="ligueAcronym">
                <Input id="ligueAcronym" type="text" name="acronym" required maxLength={10} defaultValue={initialData?.acronym} placeholder="Ex : LBBL" />
              </Field>
            </div>
          </Block>

          <Block icon={<ImageIcon size={18} />} title="Blason">
            <LigueBlasonUpload initialImage={initialData?.image} />
          </Block>

          <Block icon={<MapPin size={18} />} title="Localisation">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Zone géographique (obligatoire)" htmlFor="ligueZone" hint="La zone des championnats et des tournois.">
                <Select id="ligueZone" name="geographicalZone" required defaultValue={initialData?.geographicalZone || ""}>
                  <option value="">Choisir une zone</option>
                  {referenceData.coachRegions.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Ville siège" htmlFor="ligueVille">
                <Input id="ligueVille" type="text" name="ville" defaultValue={initialData?.ville || ""} placeholder="Ex : Lyon" autoComplete="address-level2" />
              </Field>
              <Field label="Région administrative" htmlFor="ligueRegion">
                <Select
                  id="ligueRegion"
                  name="region"
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedDept("");
                  }}
                >
                  <option value="">Toutes les régions</option>
                  {referenceData.franceRegions.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Département" htmlFor="ligueDept">
                <Select id="ligueDept" name="departement" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  <option value="">Choisir</option>
                  {departments.map((d) => (
                    // La valeur enregistrée est le libellé (« 35 - Ille-et-Vilaine »), comme avant la refonte
                    <option key={d.key} value={d.label}>{d.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ligueAddress">Adresse du lieu habituel</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Map size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
                  <Input
                    id="ligueAddress"
                    type="text"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex : 5 rue de la Paix, Paris"
                    className="pl-10"
                    autoComplete="street-address"
                  />
                </div>
                <Button type="button" variant="secondary" size="tap" className="shrink-0" onClick={() => setIsMapOpen(true)}>
                  <Globe size={18} aria-hidden="true" /> Choisir sur la carte
                </Button>
              </div>
              {lat != null && lng != null ? (
                <p className="m-0 flex items-center gap-1.5 text-sm text-bb-success-text">
                  <Check size={16} aria-hidden="true" /> Localisation précise définie ({lat.toFixed(5)}, {lng.toFixed(5)})
                </p>
              ) : (
                <p className={hint}>Sans choix sur la carte, la position est cherchée d&apos;après la ville et l&apos;adresse.</p>
              )}
            </div>
          </Block>

          <Block icon={<Users size={18} />} title="Commissaires">
            {canEditCommissaires ? (
              <>
                <p className={hint}>Désignez d&apos;autres membres pour vous aider à gérer la ligue (modifier sa fiche, gérer ses tournois).</p>
                <UserSearch
                  selectedUsers={commissaires.map((user) => ({ ...user, avatarFrame: user.avatarFrame ?? null }))}
                  onSelect={(user) => setCommissaires((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]))}
                  onRemove={(userId) => setCommissaires((prev) => prev.filter((u) => u.id !== userId))}
                  placeholder="Chercher un commissaire..."
                  maxSelections={10}
                />
              </>
            ) : (
              <>
                <p className={hint}>Seul le chef de ligue peut modifier cette liste.</p>
                {commissaires.length > 0 ? (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {commissaires.map((user) => (
                      <li key={user.id} className="flex items-center gap-2 text-bb-text">
                        <Shield size={16} aria-hidden="true" className="text-bb-accent-text" />
                        {user.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={hint}>Aucun commissaire.</p>
                )}
              </>
            )}
          </Block>

          <Block icon={<FileText size={18} />} title="Présentation">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description de la ligue : fonctionnement, lien Discord… (BBCode)</Label>
              <BBCodeEditor
                id="description"
                name="description"
                defaultValue={initialData?.description || ""}
                placeholder="Présentez votre ligue aux nouveaux coachs..."
                rows={12}
              />
            </div>
          </Block>
        </div>

        {/* Colonne « Publication » (ordinateur) */}
        <aside aria-label="Publication" className="hidden lg:block">
          <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
            <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
              <span aria-hidden="true" className="text-bb-accent-text">{submitIcon}</span>
              Publication
            </h2>
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
          {/* Libellé court sur téléphone : « Enregistrer les modifications » ne tient pas sur 360 pixels */}
          {submitIcon} {isEdit ? "Enregistrer" : submitLabel}
        </Button>
      </ComposeActionBar>

      <Sheet open={isMapOpen} onOpenChange={setIsMapOpen}>
        <SheetContent title="Localisation de la ligue" side={isDesktop ? "center" : "bottom"} className="lg:w-[min(860px,calc(100vw-2rem))]">
          <MapPicker
            initialCenter={lat != null && lng != null ? [lat, lng] : undefined}
            initialSearch={address}
            onSelect={(newLat, newLng, newAddress) => {
              setLat(newLat);
              setLng(newLng);
              if (newAddress) {
                // L'adresse renvoyée par le géocodage est souvent très longue : on garde ses trois premières parties
                const parts = newAddress.split(",");
                setAddress(parts.slice(0, 3).join(",").trim());
              }
              setIsMapOpen(false);
            }}
            onCancel={() => setIsMapOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </ActionForm>
  );
}
