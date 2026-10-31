"use client";

/**
 * Formulaire d'inscription (onboarding), refait par la carte 091 (ADR 0006) : une seule page découpée en blocs
 * empilés (avatar, profil de coach, ligues, signature, thème), avec les composants de packages/ui. Les noms des
 * champs envoyés à l'action serveur `finishOnboarding` et la suite (mise à jour de la session, cookie
 * `onboarding_sync`, retour à l'accueil) n'ont pas changé.
 */
import { useState, useEffect, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Button, Card, CardBody, CardHeader, CardTitle, Field, Input, Label, Select, Sheet, SheetContent,
  DESKTOP_QUERY, toast, useMediaQuery,
} from "@bbfrance/ui";
import { useTheme } from "@/common/components/ThemeProvider/ThemeProvider";
import { finishOnboarding } from "./actions";
import { getReferenceDataAction } from "@/app/profile/actions";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import MultiLigueSearch from "@/common/components/MultiLigueSearch/MultiLigueSearch";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import ThemePicker from "@/common/components/AppShell/ThemePicker";
import { siteConfig } from "@/lib/siteConfig";
import { Dices, Loader2, Sparkles, Upload, ArrowRight } from "lucide-react";

const IMGBB_API_KEY = siteConfig.api.imgbb.apiKey;

const DICEBEAR_STYLES = [
  { id: "adventurer", label: "Aventurier" },
  { id: "avataaars", label: "Moderne" },
  { id: "bottts", label: "Robot" },
  { id: "fun-emoji", label: "Smiley" },
  { id: "lorelei", label: "Lorelei" },
  { id: "open-peeps", label: "Minimaliste" },
  { id: "personas", label: "Humain" },
  { id: "pixel-art", label: "Pixel Art" },
];

export default function OnboardingForm({ user }: { user: any }) {
  const { update } = useSession();
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const [formData, setFormData] = useState({
    name: user.name || "",
    image: user.image || "",
    nafNumber: user.nafNumber || "",
    region: user.region || "",
    equipe: user.equipe || "",
    ligueCustom: user.ligueCustom || "",
    signature: user.signature || "",
    avatarFrame: user.avatarFrame || "auto",
  });

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genSeed, setGenSeed] = useState(user.name || "");
  const [genStyle, setGenStyle] = useState("avataaars");
  const [regions, setRegions] = useState<{ key: string; label: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadRegions() {
      const data = await getReferenceDataAction("COACH_REGION");
      setRegions(data);
    }
    loadRegions();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.data.url }));
        toast.success("Avatar téléchargé !");
      }
    } catch (error) {
      toast.error("Erreur d'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRandomAvatar = () => {
    const style = DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)].id;
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    setFormData(prev => ({ ...prev, image: url }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    
    data.set("image", formData.image);
    data.set("avatarFrame", formData.avatarFrame);
    data.set("signature", formData.signature);

    startTransition(async () => {
      try {
        const result = await finishOnboarding(data);
        if (result?.success) {
          toast.success("Synchronisation de votre profil...");
          // CRITIQUE : Il FAUT mettre à jour la session côté client 
          // pour que le cookie JWT soit régénéré avec le flag hasFinishedOnboarding: true
          await update({ 
            hasFinishedOnboarding: true,
            name: data.get("name"),
            theme: theme
          });
          
          document.cookie = "onboarding_sync=true; path=/; max-age=60";
          toast.success("Bienvenue sur BBFrance !");
          // Redirection forcée pour s'assurer que le middleware capte le nouveau cookie
          window.location.href = "/";
        } else {
          toast.error(result.error || "Erreur de configuration");
        }
      } catch {
        toast.error("Erreur de configuration");
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="m-0 flex flex-col gap-4">
        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />

        {/* Avatar */}
        <Card>
          <CardHeader><CardTitle>Votre avatar</CardTitle></CardHeader>
          <CardBody className="flex flex-col items-center gap-4 sm:flex-row">
            <UserAvatar image={formData.image} selectedRank={formData.avatarFrame as Rank} size={96} postCount={0} />
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button type="button" variant="secondary" size="tap" className="w-full sm:w-auto" onClick={handleRandomAvatar}>
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
          </CardBody>
        </Card>

        {/* Profil de coach */}
        <Card>
          <CardHeader><CardTitle>Votre profil de coach</CardTitle></CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Pseudo" htmlFor="onboarding-name" hint="3 caractères au moins. C'est le nom affiché sur le forum." className="lg:col-span-2">
              <Input id="onboarding-name" name="name" defaultValue={formData.name} required minLength={3} placeholder="Ex : Grumbly" autoComplete="nickname" />
            </Field>
            <Field label="Numéro NAF" htmlFor="onboarding-naf" hint="Facultatif.">
              <Input id="onboarding-naf" name="nafNumber" defaultValue={formData.nafNumber} placeholder="Ex : 12345" inputMode="numeric" />
            </Field>
            <Field label="Région" htmlFor="onboarding-region" hint="Facultatif.">
              <Select id="onboarding-region" name="region" defaultValue={formData.region}>
                <option value="">Choisissez...</option>
                {regions.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </Select>
            </Field>
            <Field label="Équipe fétiche" htmlFor="onboarding-equipe" hint="Facultatif." className="lg:col-span-2">
              <Input id="onboarding-equipe" name="equipe" defaultValue={formData.equipe} placeholder="Ex : The Red Barons" />
            </Field>
          </CardBody>
        </Card>

        {/* Ligues */}
        <Card>
          <CardHeader><CardTitle>Vos ligues</CardTitle></CardHeader>
          <CardBody>
            <MultiLigueSearch initialLigues={user.ligues} initialCustom={user.ligueCustom} />
          </CardBody>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader><CardTitle>Signature</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-1.5">
            <Label htmlFor="onboarding-signature">Signature (BBCode)</Label>
            <p className="m-0 text-sm text-bb-text-muted">Facultatif. Elle s&apos;affiche sous vos messages du forum, 250 caractères au plus.</p>
            <BBCodeEditor id="onboarding-signature" name="signature" defaultValue={formData.signature} maxLength={250} rows={3} onChange={(v) => setFormData(p => ({ ...p, signature: v }))} />
          </CardBody>
        </Card>

        {/* Thème : appliqué tout de suite et enregistré dans le profil (même sélecteur que le menu du compte) */}
        <Card>
          <CardHeader><CardTitle>Thème du site</CardTitle></CardHeader>
          <CardBody className="flex flex-col gap-3">
            <p className="m-0 text-sm text-bb-text-muted">Vous pourrez le changer à tout moment depuis le menu de votre compte.</p>
            <ThemePicker isLoggedIn />
          </CardBody>
        </Card>

        <Button type="submit" variant="primary" size="tap" className="min-h-12 w-full text-base" disabled={isPending}>
          {isPending && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          Valider mon profil et entrer
          {!isPending && <ArrowRight size={18} aria-hidden="true" />}
        </Button>
      </form>

      {/* Générateur d'avatar DiceBear : panneau du bas sur téléphone, fenêtre centrée sur ordinateur */}
      <Sheet open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <SheetContent title="Générateur d'avatar" side={isDesktop ? "center" : "bottom"}>
          <div className="flex flex-col gap-4 pt-2 pb-2">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- image générée par le service DiceBear */}
              <img
                src={`https://api.dicebear.com/7.x/${genStyle}/svg?seed=${genSeed}`}
                alt="Aperçu de l'avatar"
                width={120}
                height={120}
                className="size-[120px] rounded-bb-md bg-bb-surface-2"
              />
            </div>
            <Field label="Graine" htmlFor="onboarding-seed" hint="Un mot ou un nom : la même graine donne toujours le même avatar.">
              <Input id="onboarding-seed" type="text" value={genSeed} onChange={(e) => setGenSeed(e.target.value)} placeholder="Ex : Grumbly" />
            </Field>
            <div role="group" aria-label="Style de l'avatar" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DICEBEAR_STYLES.map(s => (
                <Button
                  key={s.id}
                  type="button"
                  variant="secondary"
                  size="tap"
                  aria-pressed={genStyle === s.id}
                  onClick={() => setGenStyle(s.id)}
                  className={genStyle === s.id ? "border-bb-accent-text bg-bb-accent-soft" : ""}
                >
                  {s.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-col gap-2 lg:flex-row-reverse">
              <Button type="button" variant="primary" size="tap" className="w-full lg:w-auto" onClick={() => {
                const url = `https://api.dicebear.com/7.x/${genStyle}/svg?seed=${genSeed}`;
                setFormData(prev => ({ ...prev, image: url }));
                setIsGeneratorOpen(false);
              }}>
                Confirmer
              </Button>
              <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={() => setIsGeneratorOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
