"use client";

import { useSession } from "next-auth/react";
import { finishOnboarding } from "./actions";
import { User, MapPin, Trophy, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OnboardingForm({ defaultName }: { defaultName: string }) {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await finishOnboarding(formData);
      if (result.success) {
        // Mettre à jour la session côté client pour refléter le changement de flag
        await update({ 
          hasFinishedOnboarding: true,
          name: formData.get("name") 
        });
        toast.success("Profil configuré !");
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="magic-link-form">
      <div className="input-group">
        <label htmlFor="name">Votre Pseudo (Coach Name)</label>
        <div className="input-with-icon">
          <User size={18} />
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={defaultName}
            placeholder="Ex: GrumblyleNain"
            required
            minLength={3}
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="nafNumber">Numéro NAF (Optionnel)</label>
        <div className="input-with-icon">
          <Trophy size={18} />
          <input
            id="nafNumber"
            name="nafNumber"
            type="text"
            placeholder="Ex: 32451"
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="region">Votre Région</label>
        <div className="input-with-icon">
          <MapPin size={18} />
          <input
            id="region"
            name="region"
            type="text"
            placeholder="Ex: Île-de-France"
          />
        </div>
      </div>

      <button type="submit" className="login-method-button email" disabled={loading}>
        {loading ? "Configuration..." : "C'est parti !"}
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
