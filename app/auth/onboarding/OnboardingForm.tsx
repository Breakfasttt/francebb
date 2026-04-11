"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";
import { finishOnboarding } from "./actions";
import { updateTheme, getReferenceDataAction } from "@/app/profile/actions";
import Modal from "@/common/components/Modal/Modal";
import RankSelect from "@/common/components/RankSelect/RankSelect";
import UserAvatar, { Rank } from "@/common/components/UserAvatar/UserAvatar";
import MultiLigueSearch from "@/common/components/MultiLigueSearch/MultiLigueSearch";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { siteConfig } from "@/lib/siteConfig";
import { Dices, Loader2, Sparkles, Upload, ArrowRight, Palette } from "lucide-react";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";

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
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [isThemePending, startThemeUpdate] = useTransition();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    startThemeUpdate(async () => {
      try {
        await updateTheme(newTheme);
        await update({ theme: newTheme });
      } catch (e) {
        // Silencieux
      }
    });
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
        }
      } catch (error: any) {
        toast.error(error.message || "Erreur de configuration");
      }
    });
  };

  return (
    <PremiumCard className="onboarding-form-premium fade-in">
      <form onSubmit={handleSubmit} className="profile-edit-form">
        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />

        <div className="onboarding-sections-grid">
          <div className="onboarding-section-box">
             <div className="avatar-studio-inline">
                <UserAvatar image={formData.image} selectedRank={formData.avatarFrame as Rank} size={100} postCount={0} />
                <div className="studio-actions">
                   <label>Votre Avatar</label>
                   <div className="btn-group-avatar">
                      <button type="button" className="upload-btn-icon" onClick={handleRandomAvatar} title="Aléatoire"><Dices size={16} /></button>
                      <button type="button" className="upload-btn-icon" onClick={() => setIsGeneratorOpen(true)} title="Générer"><Sparkles size={16} /></button>
                      <button type="button" className="upload-btn-icon" onClick={() => fileInputRef.current?.click()}>{isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}</button>
                   </div>
                </div>
             </div>

             <div className="form-group">
                <label>Pseudo (Coach Name)</label>
                <input name="name" defaultValue={formData.name} required minLength={3} placeholder="Ex: Grumbly" />
             </div>
          </div>

          <div className="onboarding-section-box fields-grid">
             <div className="form-group">
                <label>Numéro NAF</label>
                <input name="nafNumber" defaultValue={formData.nafNumber} placeholder="Ex: 12345" />
             </div>
             <div className="form-group">
                <label>Région</label>
                <select name="region" defaultValue={formData.region}>
                   <option value="">Choisissez...</option>
                   {regions.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
             </div>
             <div className="form-group full-width">
                <label>Équipe fétiche</label>
                <input name="equipe" defaultValue={formData.equipe} placeholder="Ex: The Red Barons" />
             </div>
          </div>

          <div className="onboarding-section-box">
             <div className="form-group">
                <label>Vos Ligues</label>
                <MultiLigueSearch initialLigues={user.ligues} initialCustom={user.ligueCustom} />
             </div>
             <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Signature (BBCode)</label>
                <BBCodeEditor name="signature" defaultValue={formData.signature} maxLength={250} rows={3} onChange={(v) => setFormData(p => ({ ...p, signature: v }))} />
             </div>
          </div>

          {/* Thème */}
          <div className="onboarding-section-box theme-section">
             <label className="section-label-inner"><Palette size={16} /> Thème favori</label>
             <div className="theme-grid-mini">
                {['saison3', 'dark', 'blood', 'malpierre', 'naf'].map(t => (
                  <button 
                    key={t} 
                    type="button" 
                    className={`theme-dot ${mounted && theme === t ? 'active' : ''} ${t}`} 
                    onClick={() => handleThemeChange(t)}
                    title={t.charAt(0).toUpperCase() + t.slice(1)}
                  >
                    {isThemePending && theme === t && <Loader2 size={10} className="animate-spin" />}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <CTAButton 
          type="submit" 
          isLoading={isPending}
          icon={ArrowRight}
          fullWidth
        >
          Valider mon profil et entrer
        </CTAButton>
      </form>

      <Modal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} onConfirm={() => {
        const url = `https://api.dicebear.com/7.x/${genStyle}/svg?seed=${genSeed}`;
        setFormData(prev => ({ ...prev, image: url }));
        setIsGeneratorOpen(false);
      }} title="Générateur d'Avatar">
        <div className="avatar-gen-modal">
          <div className="gen-preview"><img src={`https://api.dicebear.com/7.x/${genStyle}/svg?seed=${genSeed}`} alt="" /></div>
          <input type="text" value={genSeed} onChange={(e) => setGenSeed(e.target.value)} placeholder="Seed..." />
          <div className="gen-styles-grid">
            {DICEBEAR_STYLES.map(s => (
              <button key={s.id} type="button" className={`style-item ${genStyle === s.id ? 'active' : ''}`} onClick={() => setGenStyle(s.id)}>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </PremiumCard>
  );
}
