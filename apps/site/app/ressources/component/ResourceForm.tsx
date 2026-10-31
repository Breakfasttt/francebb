"use client";

/**
 * Formulaire de proposition et de modification d'une ressource (refonte, carte 096, ADR 0006), sur le modèle des
 * formulaires d'une ligue (carte 094) et d'un article (carte 095). Il est découpé en blocs lisibles sur téléphone :
 * la ressource (titre, courte description de 200 caractères au plus, lien), l'image (aperçu, adresse d'une image ou
 * envoi d'un fichier vers le service d'hébergement d'images ImgBB), puis le classement (tags avec les suggestions des
 * tags existants).
 * Sur ordinateur, la colonne « Publication » à droite porte les boutons et rappelle que la ressource sera examinée par
 * la modération ; sur téléphone, les boutons sont dans la barre collée en bas de l'écran (`ComposeActionBar`) et
 * l'écran n'a pas la barre de navigation du bas (`isComposePath`).
 * Pour un outil officiel du site, seuls la description et l'image se modifient (le titre, le lien et les tags sont
 * fixes), et seulement par un administrateur.
 * Les champs envoyés (`title`, `description`, `link`, `imageUrl`, `tags` séparés par des virgules) et les actions
 * serveur (`submitResource`, `updateResourceAction`) sont ceux d'avant la refonte.
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ImageIcon, Info, Loader2, Save, Send, Tags, Upload, X } from "lucide-react";
import { Badge, Button, Card, Field, Input, Label, Textarea, cn, toast } from "@bbfrance/ui";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import { siteConfig } from "@/lib/siteConfig";
import { getResourceTags, submitResource, updateResourceAction } from "@/app/ressources/actions";

const DESCRIPTION_MAX = 200;
const FALLBACK_IMAGE = "/images/resource-placeholder.png";

interface ResourceFormProps {
  /** Ressource à modifier ; absente pour une nouvelle proposition. */
  initialData?: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string | null;
    link: string;
    tags: string[];
    isSystem?: boolean;
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

const hint = "m-0 flex items-start gap-1.5 text-sm text-bb-text-muted";
// Champ en lecture seule (outil officiel) : fond plus discret, pour qu'il ne ressemble pas à un champ à remplir
const readOnlyField = "read-only:cursor-default read-only:bg-bb-surface read-only:text-bb-text-muted";

export default function ResourceForm({ initialData }: ResourceFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const isSystem = !!initialData?.isSystem;
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [previewFailed, setPreviewFailed] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggestions de tags : tous les tags existants, chargés à l'ouverture du formulaire
  useEffect(() => {
    getResourceTags().then(setSuggestions);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${siteConfig.api.imgbb.apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setImageUrl(data.data.url);
        toast.success("Image envoyée. Pensez à enregistrer la ressource.");
      } else {
        toast.error("Erreur lors de l'envoi de l'image : " + (data.error?.message || "cause inconnue"));
      }
    } catch {
      toast.error("Erreur réseau lors de l'envoi de l'image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("tags", tags.join(","));
    setLoading(true);
    try {
      const res = isEdit ? await updateResourceAction(initialData.id, formData) : await submitResource(formData);
      if (res.success) {
        toast.success(
          isEdit
            ? isSystem ? "Outil officiel mis à jour" : "Ressource mise à jour : elle repasse en validation par l'équipe."
            : "Ressource soumise avec succès ! Elle sera visible après validation par l'équipe."
        );
        router.push("/ressources");
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitIcon = isEdit ? <Save size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />;
  const preview = imageUrl && previewFailed !== imageUrl ? imageUrl : FALLBACK_IMAGE;
  const validationNote = isSystem
    ? "Un outil officiel reste visible : il ne repasse pas par la validation."
    : isEdit
      ? "Une ressource modifiée repasse en attente : elle sera de nouveau visible après validation par l'équipe de modération."
      : "Toutes les ressources proposées sont examinées par l'équipe de modération avant d'être visibles.";

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Block icon={<BookOpen size={18} />} title="La ressource">
            <Field
              label="Titre de la ressource (obligatoire)"
              htmlFor="title"
              hint={isSystem ? "Le titre d'un outil officiel ne peut pas être modifié." : undefined}
            >
              <Input
                id="title"
                name="title"
                type="text"
                defaultValue={initialData?.title}
                placeholder="Ex : Blood Bowl Team Builder"
                required
                readOnly={isSystem}
                className={readOnlyField}
              />
            </Field>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Courte description (obligatoire)</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value.substring(0, DESCRIPTION_MAX))}
                placeholder="Décrivez brièvement l'utilité de cette ressource…"
                required
                rows={3}
                aria-describedby="description-count"
                className="font-bb-sans"
              />
              <p id="description-count" className={cn("m-0 text-right text-sm", description.length >= DESCRIPTION_MAX ? "text-bb-danger-text" : "text-bb-text-muted")}>
                {description.length} / {DESCRIPTION_MAX} caractères
              </p>
            </div>
            <Field
              label="Lien vers la ressource (obligatoire)"
              htmlFor="link"
              hint={isSystem ? "Le lien d'un outil officiel est fixe." : "Adresse complète de la page, qui commence par https://"}
            >
              <Input
                id="link"
                name="link"
                type="url"
                inputMode="url"
                defaultValue={initialData?.link}
                placeholder="https://…"
                required
                readOnly={isSystem}
                className={readOnlyField}
              />
            </Field>
          </Block>

          <Block icon={<ImageIcon size={18} />} title="Image (facultatif)">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Aperçu : l'image par défaut remplace une image absente ou introuvable */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={imageUrl ? "Aperçu de l'image" : ""}
                onError={() => setPreviewFailed(imageUrl)}
                className="aspect-[16/9] w-full max-w-60 shrink-0 rounded-bb-md border border-bb-border bg-bb-surface-2 object-cover sm:w-48"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="imageUrl">Image : adresse web</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    inputMode="url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://…/image.png"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="tap" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <Loader2 size={18} aria-hidden="true" className="animate-spin" /> : <Upload size={18} aria-hidden="true" />}
                    {imageUrl ? "Changer l'image" : "Envoyer une image"}
                  </Button>
                  {imageUrl && (
                    <Button type="button" variant="quiet" size="tap" className="px-2 text-bb-danger-text" onClick={() => setImageUrl("")}>
                      <X size={18} aria-hidden="true" />
                      Retirer l&apos;image
                    </Button>
                  )}
                </div>
                <p className={hint}>
                  <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  Collez l&apos;adresse d&apos;une image, ou envoyez un fichier depuis votre appareil (il est hébergé sur ImgBB).
                </p>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" aria-hidden="true" tabIndex={-1} />
          </Block>

          <Block icon={<Tags size={18} />} title="Classement">
            {isSystem ? (
              <div className="flex flex-col gap-2">
                <p className="m-0 text-sm font-semibold text-bb-text">Tags</p>
                <span className="flex flex-wrap gap-1.5">
                  {tags.length > 0 ? tags.map((tag) => <Badge key={tag} variant="neutral">{tag}</Badge>) : <span className="text-sm text-bb-text-muted">Aucun tag</span>}
                </span>
                <p className={hint}>
                  <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  Les tags d&apos;un outil officiel sont gérés par l&apos;administration.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="resource-tags">Tags</Label>
                <TagSelector id="resource-tags" value={tags} onChange={setTags} suggestions={suggestions} placeholder="Ex : Outil, Guide, Roster…" />
                <p className={hint}>
                  <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  Appuyez sur Entrée pour ajouter un tag. Un tag qui n&apos;existe pas encore est créé automatiquement.
                </p>
              </div>
            )}
          </Block>

          {/* Téléphone : rappel de la validation par la modération (sur ordinateur, il est dans la colonne « Publication ») */}
          <p className={cn(hint, "lg:hidden")}>
            <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {validationNote}
          </p>
        </div>

        {/* Colonne « Publication » (ordinateur) */}
        <aside aria-label="Publication" className="hidden lg:block">
          <Card className="flex flex-col gap-3 p-4 lg:sticky lg:top-20">
            <h2 className="m-0 flex items-center gap-2 border-0 p-0 text-base font-bold text-bb-text normal-case not-italic">
              <span aria-hidden="true" className="text-bb-accent-text">{submitIcon}</span>
              Publication
            </h2>
            <p className="m-0 text-sm text-bb-text-muted">{validationNote}</p>
            <Button type="submit" variant="primary" size="tap" className="w-full" disabled={loading}>
              {isEdit ? "Mettre à jour" : "Soumettre la ressource"}
            </Button>
            <Button asChild variant="secondary" size="tap" className="w-full">
              <Link href="/ressources">Annuler</Link>
            </Button>
          </Card>
        </aside>
      </div>

      <ComposeActionBar className="lg:hidden">
        <Button asChild variant="secondary" size="tap">
          <Link href="/ressources">Annuler</Link>
        </Button>
        <Button type="submit" variant="primary" size="tap" className="flex-1" disabled={loading}>
          {submitIcon} {isEdit ? "Mettre à jour" : "Soumettre"}
        </Button>
      </ComposeActionBar>
    </form>
  );
}
