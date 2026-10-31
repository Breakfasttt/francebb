"use client";

/**
 * Onglet « Éditer mon profil » (refonte, carte 092, ADR 0006) : des blocs empilés comme à l'inscription.
 * - Avatar : aperçu avec le cadre de rang, adresse de l'image, et trois boutons (« Aléatoire », « Générer » qui ouvre
 *   le générateur DiceBear partagé avec l'inscription, « Envoyer une image » vers le service ImgBB) ; contour
 *   d'avatar (les contours pas encore débloqués sont grisés, avec le nombre de messages qui manquent).
 * - Profil de coach : pseudo, numéro NAF, région, équipe ; ligues ; signature (250 caractères au plus).
 * - Thème du site : le même sélecteur que l'inscription et le menu du compte (`AppShell/ThemePicker`), appliqué et
 *   enregistré tout de suite.
 * Les noms des champs envoyés à l'action `updateProfile` sont inchangés.
 */
import { useEffect, useRef, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Dices, Loader2, Save, Sparkles, Upload } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CardTitle, Field, Input, Label, Select, toast } from "@bbfrance/ui";
import { getReferenceDataAction, updateProfile } from "@/app/profile/actions";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import UserAvatar, { RANK_REQUIREMENTS, type Rank } from "@/common/components/UserAvatar/UserAvatar";
import MultiLigueSearch from "@/common/components/MultiLigueSearch/MultiLigueSearch";
import ThemePicker from "@/common/components/AppShell/ThemePicker";
import AvatarGeneratorSheet, { randomDicebearUrl } from "@/common/components/AvatarGenerator/AvatarGeneratorSheet";
import { siteConfig } from "@/lib/siteConfig";

const IMGBB_API_KEY = siteConfig.api.imgbb.apiKey;

/** Contours d'avatar proposés ; ceux qui ont un seuil se débloquent avec le nombre de messages. */
const FRAMES: { id: Rank; label: string }[] = [
  { id: "auto", label: "Automatique (par défaut)" },
  { id: "none", label: "Aucun contour" },
  { id: "bronze", label: "Bronze" },
  { id: "silver", label: "Argent" },
  { id: "gold", label: "Or" },
  { id: "platinum", label: "Platine" },
  { id: "diamond", label: "Diamant" },
  { id: "master", label: "Master" },
  { id: "grand-master", label: "Grand Master" },
];

interface ProfileEditProps {
  user: {
    name?: string | null;
    image?: string | null;
    nafNumber?: string | null;
    region?: string | null;
    equipe?: string | null;
    ligues?: Parameters<typeof MultiLigueSearch>[0]["initialLigues"];
    ligueCustom?: string | null;
    signature?: string | null;
    avatarFrame?: string | null;
  };
  postCount: number;
  onUpdate?: () => void;
  isModerator?: boolean;
}

export default function ProfileEdit({ user, postCount, onUpdate, isModerator = false }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    image: user.image || "",
    nafNumber: user.nafNumber || "",
    region: user.region || "",
    equipe: user.equipe || "",
    signature: user.signature || "",
    avatarFrame: user.avatarFrame || "auto",
  });

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  // Après une modification, update() demande au serveur de relire le profil en base et de réécrire le cookie
  // de session, pour que le pseudo soit à jour partout sans attendre la page suivante.
  const { update: refreshSession } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [regions, setRegions] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    getReferenceDataAction("COACH_REGION").then(setRegions);
  }, []);

  const setField = (name: keyof typeof formData, value: string) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.success) {
        setField("image", data.data.url);
        toast.success("Image envoyée !");
      } else {
        toast.error(`Erreur ImgBB : ${data.error?.message || "échec"}`);
      }
    } catch {
      toast.error("Erreur lors de l'envoi de l'image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // La signature (éditeur BBCode), l'image et le contour viennent de l'état du formulaire
    data.set("signature", formData.signature);
    data.set("image", formData.image);
    data.set("avatarFrame", formData.avatarFrame);

    startTransition(async () => {
      try {
        const result = await updateProfile(data);
        if (result.success) {
          await refreshSession();
          toast.success("Profil mis à jour !");
          if (onUpdate) setTimeout(() => onUpdate(), 1000);
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="m-0 flex flex-col gap-4">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* Avatar */}
      <Card>
        <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-1 self-center sm:self-start">
            <UserAvatar
              key={`${formData.image}-${formData.avatarFrame}`}
              image={formData.image}
              selectedRank={formData.avatarFrame as Rank}
              size={112}
              postCount={postCount}
              isModerator={isModerator}
            />
            <span className="text-xs font-semibold text-bb-text-muted">Aperçu</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Field label="URL de l'avatar" htmlFor="profile-image" hint="L'adresse d'une image en ligne, ou l'un des boutons ci-dessous.">
              <Input id="profile-image" name="image" value={formData.image} onChange={(e) => setField("image", e.target.value)} placeholder="https://…" />
            </Field>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button type="button" variant="secondary" size="tap" className="w-full sm:w-auto" onClick={() => setField("image", randomDicebearUrl())}>
                <Dices size={18} aria-hidden="true" /> Aléatoire
              </Button>
              <Button type="button" variant="secondary" size="tap" className="w-full sm:w-auto" onClick={() => setIsGeneratorOpen(true)}>
                <Sparkles size={18} aria-hidden="true" /> Générer
              </Button>
              <Button type="button" variant="secondary" size="tap" className="w-full sm:w-auto" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}
                Envoyer une image
              </Button>
            </div>
            <Field label="Contour d'avatar" htmlFor="profile-frame" hint={isModerator ? undefined : `Les contours se débloquent avec vos messages (vous en avez ${postCount}).`}>
              <Select id="profile-frame" name="avatarFrame" value={formData.avatarFrame} onChange={(e) => setField("avatarFrame", e.target.value)}>
                {FRAMES.map((frame) => {
                  const min = frame.id === "auto" || frame.id === "none" ? 0 : RANK_REQUIREMENTS[frame.id];
                  const locked = !isModerator && postCount < min;
                  return (
                    <option key={frame.id} value={frame.id} disabled={locked}>
                      {locked ? `${frame.label} (à ${min} messages)` : frame.label}
                    </option>
                  );
                })}
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* Profil de coach */}
      <Card>
        <CardHeader><CardTitle>Profil de coach</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Pseudo" htmlFor="profile-name" hint="C'est le nom affiché sur le forum." className="lg:col-span-2">
            <Input id="profile-name" name="name" value={formData.name} onChange={(e) => setField("name", e.target.value)} placeholder="Pseudo" autoComplete="nickname" />
          </Field>
          <Field label="Numéro NAF" htmlFor="profile-naf" hint="Facultatif.">
            <Input id="profile-naf" name="nafNumber" value={formData.nafNumber} onChange={(e) => setField("nafNumber", e.target.value)} placeholder="Ex : 12345" inputMode="numeric" />
          </Field>
          <Field label="Région de tournoi" htmlFor="profile-region" hint="Facultatif.">
            <Select id="profile-region" name="region" value={formData.region} onChange={(e) => setField("region", e.target.value)}>
              <option value="">Sélectionnez une région</option>
              {regions.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="Équipe Blood Bowl principale" htmlFor="profile-equipe" hint="Le nom de votre équipe fétiche, 100 caractères au plus." className="lg:col-span-2">
            <Input id="profile-equipe" name="equipe" value={formData.equipe} onChange={(e) => setField("equipe", e.target.value)} maxLength={100} placeholder="Ex : The Greentide Raiders" />
          </Field>
        </CardBody>
      </Card>

      {/* Ligues */}
      <Card>
        <CardHeader><CardTitle>Mes ligues</CardTitle></CardHeader>
        <CardBody className="flex flex-col gap-2">
          <p className="m-0 text-sm text-bb-text-muted">Associez-vous à une ou plusieurs ligues référencées, ou ajoutez-en une librement.</p>
          <MultiLigueSearch initialLigues={user.ligues} initialCustom={user.ligueCustom ?? undefined} />
        </CardBody>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader><CardTitle>Signature</CardTitle></CardHeader>
        <CardBody className="flex flex-col gap-1.5">
          <Label htmlFor="signature">Signature du forum (BBCode)</Label>
          <p className="m-0 text-sm text-bb-text-muted">Elle s&apos;affiche sous vos messages du forum, 250 caractères au plus.</p>
          <BBCodeEditor
            id="signature"
            name="signature"
            defaultValue={user.signature || ""}
            maxLength={250}
            rows={4}
            onChange={(val) => setField("signature", val)}
          />
        </CardBody>
      </Card>

      {/* Thème : appliqué tout de suite et enregistré dans le profil (même sélecteur que l'inscription) */}
      <Card>
        <CardHeader><CardTitle>Thème du site</CardTitle></CardHeader>
        <CardBody className="flex flex-col gap-3">
          <p className="m-0 text-sm text-bb-text-muted">Le thème change tout de suite et il est enregistré dans votre profil.</p>
          <ThemePicker isLoggedIn />
        </CardBody>
      </Card>

      <div className="flex lg:justify-end">
        <Button type="submit" variant="primary" size="tap" className="min-h-12 w-full text-base lg:w-auto" disabled={isPending}>
          {isPending ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
          Sauvegarder le profil
        </Button>
      </div>

      <AvatarGeneratorSheet
        open={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
        initialSeed={user.name || ""}
        seedInputId="profile-seed"
        onApply={(url) => setField("image", url)}
      />
    </form>
  );
}
