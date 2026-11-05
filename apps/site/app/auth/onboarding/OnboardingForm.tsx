"use client";

/**
 * Formulaire d'inscription (onboarding), refait par la carte 091 (ADR 0006) : une seule page découpée en blocs
 * empilés (avatar, profil de coach, ligues, signature, thème), avec les composants de packages/ui. Les noms des
 * champs envoyés à l'action serveur `finishOnboarding` et la suite (mise à jour de la session, cookie
 * `onboarding_sync`) n'ont pas changé. À la fin, le membre revient sur la page qu'il voulait ouvrir, ou à l'accueil
 * (carte 133).
 */
import { useState, useEffect, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Button, Card, CardBody, CardHeader, CardTitle, Field, Input, Label, Select, toast,
} from "@bbfrance/ui";
import { useTheme } from "@/common/components/ThemeProvider/ThemeProvider";
import { finishOnboarding } from "./actions";
import { getReferenceDataAction } from "@/app/profile/actions";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import MultiLigueSearch from "@/common/components/MultiLigueSearch/MultiLigueSearch";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import ThemePicker from "@/common/components/AppShell/ThemePicker";
import AvatarGeneratorSheet, { randomDicebearUrl } from "@/common/components/AvatarGenerator/AvatarGeneratorSheet";
import { uploadImageFile } from "@/common/utils/imageUpload";
import { Dices, Loader2, Sparkles, Upload, ArrowRight } from "lucide-react";

/**
 * `callbackUrl` : page que le membre voulait ouvrir avant d'être envoyé vers l'inscription, déjà vérifiée par la
 * page (adresse du site uniquement). Il y est envoyé une fois l'inscription terminée (carte 133).
 */
export default function OnboardingForm({ user, callbackUrl }: { user: any; callbackUrl: string }) {
  const { update } = useSession();
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();

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
    try {
      const result = await uploadImageFile(file);
      if (result.success && result.url) {
        const url = result.url;
        setFormData(prev => ({ ...prev, image: url }));
        toast.success("Avatar envoyé !");
      } else {
        toast.error(result.error || "L'envoi de l'image a échoué.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRandomAvatar = () => {
    setFormData(prev => ({ ...prev, image: randomDicebearUrl() }));
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
          window.location.href = callbackUrl;
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
            <Field label="Numéro NAF" htmlFor="onboarding-naf" hint="Facultatif. C'est votre numéro de membre de la NAF, l'association internationale des joueurs de tournoi de Blood Bowl.">
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
            <Label htmlFor="onboarding-signature">Signature (texte mis en forme)</Label>
            <p className="m-0 text-sm text-bb-text-muted">Facultatif. Elle s&apos;affiche sous vos messages du forum, 250 caractères au plus. Les boutons de l&apos;éditeur mettent le texte en gras, en couleur, ajoutent un lien…</p>
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

      {/* Générateur d'avatar DiceBear : panneau du bas sur téléphone, fenêtre centrée sur ordinateur (composant partagé
          avec l'édition du profil) */}
      <AvatarGeneratorSheet
        open={isGeneratorOpen}
        onOpenChange={setIsGeneratorOpen}
        initialSeed={user.name || ""}
        seedInputId="onboarding-seed"
        onApply={(url) => setFormData(prev => ({ ...prev, image: url }))}
      />
    </>
  );
}
