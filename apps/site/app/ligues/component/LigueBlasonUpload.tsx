"use client";

/**
 * Blason d'une ligue dans son formulaire (refonte, carte 094) : aperçu, bouton « Envoyer un blason » (ou « Changer le
 * blason ») qui ouvre le choix d'une image, et « Retirer le blason ». L'image est envoyée au service d'hébergement
 * d'images ImgBB ; son adresse est gardée dans le champ caché `image`, enregistré avec le reste du formulaire.
 */
import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button, toast } from "@bbfrance/ui";
import { uploadImageFile } from "@/common/utils/imageUpload";
import LigueBlason from "./LigueBlason";

interface LigueBlasonUploadProps {
  initialImage?: string | null;
}

export default function LigueBlasonUpload({ initialImage }: LigueBlasonUploadProps) {
  const [image, setImage] = useState(initialImage || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImageFile(file);
      if (result.success && result.url) {
        setImage(result.url);
        toast.success("Blason envoyé. Pensez à enregistrer la ligue.");
      } else {
        toast.error(result.error || "L'envoi du blason a échoué.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImage("");
    toast.success("Blason retiré. Pensez à enregistrer la ligue.");
  };

  return (
    <div className="flex items-center gap-4">
      <LigueBlason image={image || null} alt={image ? "Aperçu du blason" : ""} size={96} />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <Button type="button" variant="secondary" size="tap" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 size={18} aria-hidden="true" className="animate-spin" /> : <Upload size={18} aria-hidden="true" />}
          {image ? "Changer le blason" : "Envoyer un blason"}
        </Button>
        {image && (
          <Button type="button" variant="quiet" size="tap" className="px-2 text-bb-danger-text" onClick={removeImage}>
            <X size={18} aria-hidden="true" />
            Retirer le blason
          </Button>
        )}
        <p className="m-0 text-sm text-bb-text-muted">Format carré conseillé, PNG ou JPG.</p>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" aria-hidden="true" tabIndex={-1} />
      <input type="hidden" name="image" value={image} />
    </div>
  );
}
