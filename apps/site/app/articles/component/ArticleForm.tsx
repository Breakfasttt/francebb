"use client";

/**
 * Formulaire de création et de modification d'un article (refonte, carte 095, ADR 0006), sur le modèle du formulaire
 * d'une ligue (carte 094). Il est découpé en blocs lisibles sur téléphone : l'article (titre), le classement (tags avec
 * les suggestions des tags existants, ligue liée facultative), puis le contenu (éditeur BBCode), en dernier parce que
 * c'est le champ le plus long.
 * Sur ordinateur, la colonne « Publication » à droite porte les boutons ; sur téléphone, ils sont dans la barre collée
 * en bas de l'écran (`ComposeActionBar`) et l'écran n'a pas la barre de navigation du bas (`isComposePath`).
 * Les champs envoyés (`title`, `content`, `tags` séparés par des virgules, `ligueId`, `ligueCustom`) et les actions
 * serveur (`createArticle`, `updateArticle`) sont ceux d'avant la refonte.
 */
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Info, PenLine, Save, Send, Shield, Tags } from "lucide-react";
import { Button, Card, Field, Input, Label, cn, toast } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import LigueSearch from "@/common/components/LigueSearch/LigueSearch";
import TagSelector from "@/common/components/TagSelector/TagSelector";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import { createArticle, updateArticle } from "@/app/articles/actions";

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    tags: string[];
    ligueId?: string | null;
    ligueCustom?: string | null;
    /** Ligue déjà rattachée (modification), affichée comme choisie dans la recherche de ligue (carte 140). */
    ligue?: { id: string; name: string; acronym: string; region: string | null; geographicalZone: string | null } | null;
  };
  isEdit?: boolean;
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

export default function ArticleForm({ initialData, isEdit = false }: ArticleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [ligueId, setLigueId] = useState(initialData?.ligueId || "");
  const [ligueCustom, setLigueCustom] = useState(initialData?.ligueCustom || "");

  // Suggestions de tags : tous les tags existants, chargés à l'ouverture du formulaire
  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/articles/tags");
        if (res.ok) {
          const data: { name: string }[] = await res.json();
          setTagSuggestions(data.map((t) => t.name));
        }
      } catch (err) {
        console.error("Failed to fetch tags suggestions:", err);
      }
    }
    fetchTags();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Veuillez remplir le titre et le contenu.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tags", tags.join(","));
    formData.append("ligueId", ligueId);
    formData.append("ligueCustom", ligueCustom);

    try {
      if (isEdit && initialData?.id) {
        const result = await updateArticle(initialData.id, formData);
        if (result.success) {
          toast.success("Article mis à jour !");
          router.push(`/articles/${initialData.id}`);
        } else {
          toast.error(result.error || "Une erreur est survenue.");
        }
      } else {
        const result = await createArticle(formData);
        if (result.success) {
          toast.success("Article publié !");
          router.push(`/articles/${result.id}`);
        } else {
          toast.error(result.error || "Une erreur est survenue.");
        }
      }
    } catch (error) {
      console.error("Form Submit Error:", error);
      toast.error("Une erreur critique est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = isEdit ? "Mettre à jour l'article" : "Publier l'article";
  const submitIcon = isEdit ? <Save size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />;
  const cancelHref = isEdit && initialData?.id ? `/articles/${initialData.id}` : "/articles";

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_288px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <Block icon={<FileText size={18} />} title="L'article">
            <Field label="Titre de l'article (obligatoire)" htmlFor="title">
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Guide stratégique - Les Orques au tournoi NAF"
                required
              />
            </Field>
          </Block>

          <Block icon={<Tags size={18} />} title="Classement">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="article-tags">Tags de l&apos;article</Label>
              <TagSelector
                id="article-tags"
                value={tags}
                onChange={setTags}
                suggestions={tagSuggestions}
                placeholder="Ex : Stratégie, Guide, Orques…"
              />
              <p className={hint}>
                <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                Appuyez sur Entrée pour ajouter un tag. Un tag qui n&apos;existe pas encore est créé automatiquement.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="article-ligue">Ligue rattachée (facultatif)</Label>
              <LigueSearch
                inputId="article-ligue"
                initialLigue={initialData?.ligue}
                initialCustom={initialData?.ligueCustom}
                placeholder="Rechercher une ligue…"
                onChange={(lid, lcustom) => {
                  setLigueId(lid || "");
                  setLigueCustom(lcustom || "");
                }}
              />
              <p className={hint}>
                <Shield size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                Liez cet article à une ligue précise.
              </p>
            </div>
          </Block>

          <Block icon={<PenLine size={18} />} title="Contenu">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Contenu de l&apos;article (BBCode, obligatoire)</Label>
              <BBCodeEditor
                id="content"
                name="content"
                defaultValue={content}
                onChange={setContent}
                placeholder="Rédigez votre article ici..."
                rows={16}
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
            <Button type="submit" variant="primary" size="tap" className="w-full" disabled={loading}>
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
        <Button type="submit" variant="primary" size="tap" className="flex-1" disabled={loading}>
          {submitIcon} {isEdit ? "Mettre à jour" : "Publier"}
        </Button>
      </ComposeActionBar>
    </form>
  );
}
