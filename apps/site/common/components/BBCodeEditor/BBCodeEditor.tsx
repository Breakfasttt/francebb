"use client";

/**
 * Éditeur de message BBCode, partagé par le forum, les articles, la messagerie, les ligues, le profil et
 * l'administration. Le BBCode est une syntaxe de mise en forme par balises entre crochets, par exemple `[b]gras[/b]`.
 *
 * Refonte de la carte 087 (ADR 0006) :
 * - la barre n'affiche que les outils les plus utilisés (gras, italique, lien, image, spoiler, smileys) ; tous les
 *   autres sont rangés par rubrique dans le panneau « Plus d'outils de mise en forme » : un petit panneau sous le
 *   bouton « + » sur ordinateur, un panneau qui monte du bas sur téléphone. Aucun outil n'a disparu ;
 * - un outil à options (lien, image, couleur…) ouvre son formulaire sous la barre sur ordinateur, et dans le panneau
 *   du bas sur téléphone, où il reste visible quel que soit l'endroit de la page ;
 * - « @ » tapé en début de mot (au début du texte, après une espace ou un retour à la ligne) ouvre la recherche d'un
 *   membre à mentionner ; ailleurs (par exemple dans une adresse électronique) il s'écrit simplement (carte 112).
 *   Le caractère est toujours écrit : Échap ferme l'outil ouvert et le « @ » reste dans le texte ;
 * - « Aperçu » affiche le rendu sous la zone de texte sur ordinateur, et à sa place sur téléphone ;
 * - `screen` : sur téléphone, la barre d'outils reste collée en haut de l'écran pendant que la zone de texte grandit
 *   avec le message (pages de réponse, de modification et de nouveau sujet, qui occupent tout l'écran).
 *
 * Carte 184 : l'outil Image commence par un gros bouton « Choisir des photos » ; sur téléphone, le champ d'adresse
 * ne prend plus le focus (le clavier ne s'ouvre plus). Plusieurs photos se choisissent d'un coup : elles partent une
 * par une, la progression s'affiche (« Envoi 2 sur 4… »), puis elles sont insérées en galerie (`[gallery]`). Une
 * photo trop grande est réduite avant l'envoi (`common/utils/photoUpload.ts`).
 *
 * Ce qui ne change pas : la zone de texte garde l'attribut `name` (les formulaires lisent son contenu avec
 * FormData), et l'événement `bbcode-insert-text` (envoyé par « Citer ») ajoute son texte à la fin (carte 183).
 */
import BBCodeContent from "@/common/components/BBCodeContent/BBCodeContent";
import SmileyGrid from "@/common/components/SmileyGrid/SmileyGrid";
import { uploadImageFile } from "@/common/utils/imageUpload";
import { IMAGE_UPLOAD_MAX_BYTES } from "@/common/utils/imageUploadLimits";
import { galleryTag, photoFailureMessage, shrinkPhoto, uploadProgressLabel } from "@/common/utils/photoUpload";
import { appendQuote } from "@/lib/forumQuote";
import {
  Avatar,
  Button,
  Field,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  Textarea,
  Tooltip,
  cn,
  toast,
  useMediaQuery,
  DESKTOP_QUERY,
} from "@bbfrance/ui";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Eye, ImagePlus, List, ListOrdered, Loader2, Plus, Subscript, Superscript, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import AIAssistantSheet from "./AIAssistantSheet";
import { buildAIPrompt } from "./aiPrompt";
import {
  MORE_TOOL_GROUPS,
  PANEL_TOOL_LABELS,
  PHONE_ONLY_MORE_TOOLS,
  PRIMARY_TOOLS,
  TEXT_COLORS,
  TEXT_SIZES,
  type EditorTool,
  type PanelToolId,
} from "./editorTools";

interface BBCodeEditorProps {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  onChange?: (value: string) => void;
  required?: boolean;
  /** Éditeur d'une page de rédaction qui occupe tout l'écran sur téléphone (barre d'outils collée en haut). */
  screen?: boolean;
}

const MORE_TOOLS_LABEL = "Plus d'outils de mise en forme";

type Align = "center" | "left" | "right";
type FoundTopic = { id: string; title: string; forumName: string };
type FoundMember = { id: string; name: string; image: string | null };

/** Bouton à deux états (option d'une image, format d'un schéma…) : l'état choisi est annoncé par aria-pressed. */
function ToggleChip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="tap"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn("px-3 font-semibold", pressed && "border-bb-accent-text bg-bb-accent-soft text-bb-accent-text")}
    >
      {children}
    </Button>
  );
}

/** Petit titre d'un groupe d'options dans le formulaire d'un outil. */
function OptionLabel({ children }: { children: ReactNode }) {
  return <p className="m-0 text-sm font-semibold text-bb-text">{children}</p>;
}

export default function BBCodeEditor({ name, id, defaultValue = "", placeholder, rows = 10, maxLength, onChange, required, screen = false }: BBCodeEditorProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const uid = useId();
  const [content, setContent] = useState(defaultValue);
  const [isPreview, setIsPreview] = useState(false);
  // Envoi de photos en cours : numéro de la photo envoyée et nombre total (null quand rien ne part)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const isUploading = uploadProgress !== null;
  const [activeTool, setActiveTool] = useState<PanelToolId | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toolInputThumb, setToolInputThumb] = useState(true);
  const [toolInputUrl, setToolInputUrl] = useState("");
  const [toolInputText, setToolInputText] = useState("");
  const [toolInputAlign, setToolInputAlign] = useState<Align>("center");
  const [toolInputWrap, setToolInputWrap] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [topicQuery, setTopicQuery] = useState("");
  const [topicResults, setTopicResults] = useState<FoundTopic[]>([]);
  const [isSearchingTopics, setIsSearchingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<FoundTopic | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<FoundMember[]>([]);
  const [isSearchingMentions, setIsSearchingMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    toast[type](message, { duration: 7000 });
  };

  useEffect(() => {
    setContent(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (topicQuery.trim().length < 2) {
      setTopicResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingTopics(true);
      try {
        const res = await fetch(`/api/forum/topics/search?q=${encodeURIComponent(topicQuery)}`);
        const data = await res.json();
        setTopicResults(data);
      } catch {
        setTopicResults([]);
      } finally {
        setIsSearchingTopics(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [topicQuery]);

  useEffect(() => {
    if (mentionQuery.trim().length < 2) {
      setMentionResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingMentions(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(mentionQuery)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMentionResults(data);
        }
      } catch {
        setMentionResults([]);
      } finally {
        setIsSearchingMentions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  // Échap ferme l'outil ouvert (la recherche de membre ouverte par « @ » est gérée dans handleTextareaChange)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTool) {
        setActiveTool(null);
        textareaRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTool]);

  // À l'ouverture d'un outil, le premier champ de son formulaire reçoit le focus (sur téléphone, le clavier s'ouvre)
  useEffect(() => {
    if (!activeTool) return;
    const frame = requestAnimationFrame(() => optionsRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [activeTool, isDesktop]);

  // Page de rédaction sur téléphone : la zone de texte grandit avec le message et c'est la page qui défile
  // (le navigateur garde ainsi le curseur visible au-dessus du clavier)
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (!screen || isDesktop) {
      textarea.style.height = "";
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  }, [content, screen, isDesktop, isPreview]);

  const generateAIPrompt = () => {
    setAiPrompt(buildAIPrompt(content));
    setIsAIModalOpen(true);
  };

  const handleContentChange = (newContent: string) => {
    if (maxLength && newContent.length > maxLength) {
      newContent = newContent.substring(0, maxLength);
    }
    setContent(newContent);
    if (onChange) onChange(newContent);
  };

  /**
   * Saisie dans la zone de texte. Le « @ » s'écrit toujours ; s'il vient d'être tapé en début de mot (au tout début du
   * texte, après une espace ou un retour à la ligne), la recherche d'un membre à mentionner s'ouvre en plus. Le test
   * se fait sur le texte, et non sur la touche appuyée, parce que les claviers de téléphone Android n'indiquent
   * souvent pas la touche (« Unidentified »). submitMention retire ce « @ » quand un membre est choisi.
   */
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const pos = e.target.selectionStart;
    const typedOneChar = value.length === content.length + 1;
    handleContentChange(value);
    if (!typedOneChar || isPreview || activeTool === "mention") return;
    const atWordStart = pos === 1 || (pos > 1 && /\s/.test(value[pos - 2]));
    if (value[pos - 1] === "@" && atWordStart) {
      setMoreOpen(false);
      setActiveTool("mention");
      setMentionQuery("");
      setMentionResults([]);
    }
  };

  const insertTag = (startTag: string, endTag: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    if (typeof textarea.selectionStart === "undefined") {
      const newContent = content + startTag + endTag;
      handleContentChange(newContent);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    // Texte lu dans la zone elle-même : un envoi de photos peut se terminer après que le membre a continué d'écrire
    const text = textarea.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);

    const newContent = before + startTag + selected + endTag + after;
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      if (selected.length > 0) {
        textarea.setSelectionRange(start + startTag.length, start + startTag.length + selected.length);
      } else {
        textarea.setSelectionRange(start + startTag.length, start + startTag.length);
      }
    }, 0);
  };

  // Texte envoyé depuis l'extérieur de l'éditeur (bouton « Citer » d'un message du forum, carte 183) : il s'ajoute à
  // la fin du texte déjà écrit, sans rien remplacer. L'éditeur ne prend pas le focus : la page ne défile pas et le
  // clavier du téléphone ne s'ouvre pas, le coach garde sa position de lecture.
  useEffect(() => {
    const handleRemoteInsert = (e: Event) => {
      const textToInsert = (e as CustomEvent<string>).detail;
      if (textToInsert) {
        handleContentChange(appendQuote(textareaRef.current?.value ?? content, textToInsert));
      }
    };
    window.addEventListener("bbcode-insert-text", handleRemoteInsert);
    return () => window.removeEventListener("bbcode-insert-text", handleRemoteInsert);
    // L'écouteur lit le texte courant : il est réinstallé à chaque changement du texte, comme avant la refonte
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleSmileySelect = (code: string) => {
    insertTag(code, "");
    setActiveTool(null);
  };

  const insertListTag = (type: string) => {
    const start = type ? `[list=${type}]\n[*] ` : `[list]\n[*] `;
    insertTag(start, `\n[/list]`);
    setActiveTool(null);
  };

  const submitLink = () => {
    if (toolInputUrl) {
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = content;
      const before = text.substring(0, start);
      const selected = text.substring(start, end);
      const after = text.substring(end, text.length);
      const label = toolInputText.trim() !== "" ? toolInputText : selected || toolInputUrl;
      const tag = `[url=${toolInputUrl}]${label}[/url]`;
      const newContent = before + tag + after;
      handleContentChange(newContent);
      setToolInputUrl("");
      setToolInputText("");
      setActiveTool(null);
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = before.length + tag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const submitTopic = () => {
    if (!selectedTopic || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);
    const finalLabel = toolInputText.trim() !== "" ? toolInputText : selected || selectedTopic.title;
    const tag = `[topic=${selectedTopic.id}]${finalLabel}[/topic]`;
    handleContentChange(before + tag + after);
    setToolInputText("");
    setTopicQuery("");
    setTopicResults([]);
    setSelectedTopic(null);
    setActiveTool(null);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(before.length + tag.length, before.length + tag.length);
    }, 0);
  };

  const submitMention = (userId: string, username: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const tag = `[mention=${userId}]${username}[/mention]`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    let finalBefore = before;
    if (before.endsWith("@")) finalBefore = before.slice(0, -1);
    handleContentChange(finalBefore + tag + " " + after);
    setMentionQuery("");
    setMentionResults([]);
    setActiveTool(null);
    setTimeout(() => {
      textarea.focus();
      const newPos = finalBefore.length + tag.length + 1;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const resetMediaOptions = () => {
    setToolInputUrl("");
    setToolInputAlign("center");
    setToolInputWrap(false);
    setToolInputThumb(true);
    setActiveTool(null);
  };

  /** Balise [img] ou [youtube] avec les options choisies (alignement, habillage, taille réduite). */
  const mediaTag = (tagName: "img" | "youtube", url: string) => {
    let tag = `[${tagName}`;
    if (toolInputAlign !== "center") tag += ` align=${toolInputAlign}`;
    if (toolInputAlign !== "center") tag += ` wrap=${toolInputWrap ? "yes" : "no"}`;
    if (!toolInputThumb) tag += ` thumb=no`;
    return `${tag}]${url}[/${tagName}]`;
  };

  const submitYoutube = () => {
    if (toolInputUrl) {
      insertTag(mediaTag("youtube", toolInputUrl), "");
      resetMediaOptions();
    }
  };

  const submitImageUrl = () => {
    if (toolInputUrl) {
      insertTag(mediaTag("img", toolInputUrl), "");
      resetMediaOptions();
    }
  };

  const submitSpoiler = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);

    const title = toolInputText.trim();
    const hidden = toolInputUrl.trim();

    const startTag = title !== "" ? `[spoiler=${title}]` : "[spoiler]";
    // Priorité au champ « Texte à cacher » s'il est rempli, sinon le texte sélectionné
    const contentToHide = hidden || content.substring(start, end);

    const tag = `${startTag}${contentToHide}[/spoiler]`;
    handleContentChange(before + tag + after);

    setToolInputText("");
    setToolInputUrl("");
    setActiveTool(null);
    setTimeout(() => {
      textarea.focus();
      const newPos = before.length + tag.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const submitAccordion = () => {
    if (toolInputText.trim() !== "") {
      insertTag(`[accordion=${toolInputText}]`, "[/accordion]");
      setToolInputText("");
      setActiveTool(null);
    }
  };

  const toggleTool = (tool: PanelToolId) => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      setToolInputUrl("");
      setToolInputText("");
      setToolInputAlign("center");
      setToolInputThumb(true);
      setTopicQuery("");
      setTopicResults([]);
      setSelectedTopic(null);
      setMentionQuery("");
      setMentionResults([]);
      if ((tool === "link" || tool === "topic" || tool === "spoiler" || tool === "accordion") && textareaRef.current) {
        const textarea = textareaRef.current;
        const selected = content.substring(textarea.selectionStart, textarea.selectionEnd);
        if (selected) {
          if (tool === "spoiler") {
            setToolInputUrl(selected);
          } else {
            setToolInputText(selected);
          }
        }
      }
    }
  };

  /** Action d'un outil, qu'il soit dans la barre ou dans le panneau « Plus d'outils ». */
  const runTool = (tool: EditorTool) => {
    setMoreOpen(false);
    if (tool.kind === "insert") {
      insertTag(tool.open, tool.close);
      return;
    }
    if (tool.kind === "ai") {
      setActiveTool(null);
      generateAIPrompt();
      return;
    }
    toggleTool(tool.id);
  };

  const closeTools = () => {
    setMoreOpen(false);
    setActiveTool(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  /**
   * Photos choisies sur l'appareil : réduites si besoin, envoyées une par une (progression affichée), puis insérées.
   * Une seule photo devient une balise [img] avec les options choisies ; plusieurs deviennent une galerie.
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (files.length === 0) return;
    const urls: string[] = [];
    const errors: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress({ current: index + 1, total: files.length });
        const photo = await shrinkPhoto(file, IMAGE_UPLOAD_MAX_BYTES);
        const result = await uploadImageFile(photo);
        if (result.success && result.url) urls.push(result.url);
        else errors.push(result.error || "L'envoi de l'image a échoué.");
      }
    } finally {
      setUploadProgress(null);
    }
    if (urls.length > 0) {
      insertTag(urls.length === 1 ? mediaTag("img", urls[0]) : galleryTag(urls), "");
      resetMediaOptions();
    }
    if (errors.length > 0) {
      showToast(photoFailureMessage(errors.length, files.length, errors[0]), "error");
    } else {
      showToast(urls.length > 1 ? `${urls.length} photos ajoutées en galerie.` : "Image envoyée avec succès !", "success");
    }
  };

  const submitGallery = () => {
    if (!toolInputUrl.trim()) return;
    insertTag(`[gallery]${toolInputUrl.trim()}[/gallery]`, "");
    setToolInputUrl("");
    setActiveTool(null);
  };

  const fieldId = (suffix: string) => `${uid}-${suffix}`;

  /** Options communes à l'image et à la vidéo : alignement, taille réduite, habillage du texte. */
  const mediaOptions = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <OptionLabel>Alignement</OptionLabel>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { v: "left", icon: AlignLeft, t: "Gauche" },
              { v: "center", icon: AlignCenter, t: "Centre" },
              { v: "right", icon: AlignRight, t: "Droite" },
            ] as const
          ).map((al) => (
            <ToggleChip key={al.v} pressed={toolInputAlign === al.v} onClick={() => setToolInputAlign(al.v)}>
              <al.icon size={16} aria-hidden="true" /> {al.t}
            </ToggleChip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <OptionLabel>Affichage</OptionLabel>
        <div className="flex flex-wrap gap-2">
          <ToggleChip pressed={toolInputThumb} onClick={() => setToolInputThumb(!toolInputThumb)}>
            Taille réduite
          </ToggleChip>
          {/* L'habillage (texte qui coule autour) n'a de sens que pour un média aligné à gauche ou à droite */}
          {toolInputAlign !== "center" && (
            <ToggleChip pressed={toolInputWrap} onClick={() => setToolInputWrap(!toolInputWrap)}>
              Habiller le texte autour
            </ToggleChip>
          )}
        </div>
      </div>
    </div>
  );

  /** Formulaire de l'outil ouvert. */
  const renderToolOptions = (tool: PanelToolId): ReactNode => {
    switch (tool) {
      case "link":
        return (
          <div className="flex flex-col gap-3">
            <Field label="Adresse du lien" htmlFor={fieldId("link-url")}>
              <Input id={fieldId("link-url")} type="url" inputMode="url" placeholder="https://…" value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} data-autofocus />
            </Field>
            <Field label="Texte affiché (facultatif)" htmlFor={fieldId("link-text")} hint="Sans texte, c'est le texte sélectionné ou l'adresse qui s'affiche.">
              <Input id={fieldId("link-text")} type="text" value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} />
            </Field>
            <Button type="button" variant="primary" size="tap" onClick={submitLink}>
              Insérer le lien
            </Button>
          </div>
        );
      case "topic":
        return (
          <div className="flex flex-col gap-3">
            {!selectedTopic && (
              <Field label="Rechercher un sujet du forum" htmlFor={fieldId("topic-search")} hint="Au moins deux lettres du titre.">
                <div className="relative">
                  <Input id={fieldId("topic-search")} type="text" value={topicQuery} onChange={(e) => setTopicQuery(e.target.value)} className="pr-10" data-autofocus />
                  {isSearchingTopics && <Loader2 size={16} aria-hidden="true" className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-bb-text-muted" />}
                </div>
              </Field>
            )}
            {topicResults.length > 0 && (
              <ul className="m-0 flex max-h-56 list-none flex-col overflow-y-auto rounded-bb-md border border-bb-border p-0">
                {topicResults.map((topic) => (
                  <li key={topic.id} className="border-b border-bb-border last:border-b-0">
                    <Button
                      type="button"
                      variant="quiet"
                      className="min-h-12 w-full flex-col items-start justify-center gap-0 rounded-none px-3 py-2 text-left font-normal whitespace-normal text-bb-text"
                      onClick={() => {
                        setSelectedTopic(topic);
                        setTopicResults([]);
                        setTopicQuery("");
                      }}
                    >
                      <span className="font-semibold">{topic.title}</span>
                      <span className="text-sm text-bb-text-muted">{topic.forumName}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {selectedTopic && (
              <>
                <div className="flex items-center gap-2 rounded-bb-md border border-bb-border bg-bb-surface-2 py-1 pr-1 pl-3">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-semibold break-words">{selectedTopic.title}</p>
                    <p className="m-0 text-sm text-bb-text-muted">{selectedTopic.forumName}</p>
                  </div>
                  <Button type="button" variant="quiet" size="tap-icon" aria-label="Choisir un autre sujet" onClick={() => setSelectedTopic(null)}>
                    <X size={18} aria-hidden="true" />
                  </Button>
                </div>
                <Field label="Texte affiché (facultatif)" htmlFor={fieldId("topic-text")} hint="Sans texte, c'est le titre du sujet qui s'affiche.">
                  <Input id={fieldId("topic-text")} type="text" value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} />
                </Field>
                <Button type="button" variant="primary" size="tap" onClick={submitTopic}>
                  Insérer le lien du sujet
                </Button>
              </>
            )}
          </div>
        );
      case "mention":
        return (
          <div className="flex flex-col gap-3">
            <Field label="Rechercher un membre" htmlFor={fieldId("mention-search")} hint="Au moins deux lettres du pseudo.">
              <div className="relative">
                <Input id={fieldId("mention-search")} type="text" value={mentionQuery} onChange={(e) => setMentionQuery(e.target.value)} className="pr-10" data-autofocus />
                {isSearchingMentions && <Loader2 size={16} aria-hidden="true" className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-bb-text-muted" />}
              </div>
            </Field>
            {mentionResults.length > 0 && (
              <ul className="m-0 flex max-h-56 list-none flex-col overflow-y-auto rounded-bb-md border border-bb-border p-0">
                {mentionResults.map((user) => (
                  <li key={user.id} className="border-b border-bb-border last:border-b-0">
                    <Button
                      type="button"
                      variant="quiet"
                      className="min-h-12 w-full justify-start gap-3 rounded-none px-3 text-left font-semibold text-bb-text"
                      onClick={() => submitMention(user.id, user.name || "Anonyme")}
                    >
                      <Avatar name={user.name} src={user.image} size={28} />
                      {user.name}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case "image":
        return (
          <div className="flex flex-col gap-4">
            {/* Photos de l'appareil d'abord (carte 184) ; le texte du bouton suit l'envoi (« Envoi 2 sur 4… ») */}
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="primary"
                size="tap"
                className="min-h-14 w-full text-base whitespace-normal lg:w-auto lg:self-start"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-describedby={fieldId("photos-hint")}
              >
                {isUploading ? <Loader2 size={20} aria-hidden="true" className="animate-spin" /> : <ImagePlus size={20} aria-hidden="true" />}
                {uploadProgress ? uploadProgressLabel(uploadProgress.current, uploadProgress.total) : "Choisir des photos"}
              </Button>
              <p id={fieldId("photos-hint")} className="m-0 text-sm text-bb-text-muted">
                Une ou plusieurs photos de l&apos;appareil : plusieurs photos forment une galerie.
              </p>
              <p aria-live="polite" className="sr-only">
                {uploadProgress ? uploadProgressLabel(uploadProgress.current, uploadProgress.total) : ""}
              </p>
            </div>
            <p className="m-0 flex items-center gap-3 text-sm text-bb-text-muted before:h-px before:flex-1 before:bg-bb-border after:h-px after:flex-1 after:bg-bb-border">
              ou une image déjà en ligne
            </p>
            {/* Sur téléphone, pas de focus automatique ici : le clavier recouvrirait le bouton des photos */}
            <Field label="Adresse de l'image" htmlFor={fieldId("image-url")}>
              <Input id={fieldId("image-url")} type="url" inputMode="url" placeholder="https://…" value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} data-autofocus={isDesktop ? true : undefined} />
            </Field>
            {mediaOptions}
            <Button type="button" variant="secondary" size="tap" className="lg:self-start" onClick={submitImageUrl}>
              Insérer l&apos;image
            </Button>
          </div>
        );
      case "gallery":
        return (
          <div className="flex flex-col gap-3">
            <Field label="Adresses des images" htmlFor={fieldId("gallery")} hint="Séparées par des virgules ou des retours à la ligne.">
              <Textarea id={fieldId("gallery")} rows={3} placeholder="https://…/image1.jpg, https://…/image2.jpg" value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} data-autofocus />
            </Field>
            <Button type="button" variant="primary" size="tap" onClick={submitGallery}>
              Créer la galerie
            </Button>
          </div>
        );
      case "youtube":
        return (
          <div className="flex flex-col gap-4">
            <Field label="Adresse ou identifiant de la vidéo" htmlFor={fieldId("youtube")}>
              <Input id={fieldId("youtube")} type="text" placeholder="https://www.youtube.com/watch?v=…" value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} data-autofocus />
            </Field>
            {mediaOptions}
            <Button type="button" variant="primary" size="tap" onClick={submitYoutube}>
              Insérer la vidéo
            </Button>
          </div>
        );
      case "size":
        return (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              {TEXT_SIZES.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="secondary"
                  size="tap"
                  onClick={() => {
                    insertTag(`[size=${s}]`, "[/size]");
                    setActiveTool(null);
                  }}
                >
                  <span style={{ fontSize: s }}>{s}</span>
                </Button>
              ))}
            </div>
            <p className="m-0 text-sm text-bb-text-muted">La taille s&apos;applique au texte sélectionné (1rem est la taille normale).</p>
          </div>
        );
      case "color":
        return (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-5 gap-2 lg:flex lg:flex-wrap">
              {TEXT_COLORS.map((c) => (
                <Tooltip key={c.value} content={c.name}>
                  <Button
                    type="button"
                    variant="quiet"
                    size="tap-icon"
                    aria-label={c.name}
                    className="w-full lg:w-11"
                    onClick={() => {
                      insertTag(`[color=${c.value}]`, "[/color]");
                      setActiveTool(null);
                    }}
                  >
                    <span aria-hidden="true" className="block size-8 rounded-full border-2 border-bb-border" style={{ background: c.value }} />
                  </Button>
                </Tooltip>
              ))}
            </div>
            <p className="m-0 text-sm text-bb-text-muted">La couleur s&apos;applique au texte sélectionné.</p>
          </div>
        );
      case "spoiler":
        return (
          <div className="flex flex-col gap-3">
            <Field label="Titre (facultatif)" htmlFor={fieldId("spoiler-title")}>
              <Input id={fieldId("spoiler-title")} type="text" value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} data-autofocus />
            </Field>
            <Field label="Texte à cacher" htmlFor={fieldId("spoiler-text")} hint="Laissé vide, c'est le texte sélectionné qui est caché.">
              <Input id={fieldId("spoiler-text")} type="text" value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} />
            </Field>
            <Button type="button" variant="primary" size="tap" onClick={submitSpoiler}>
              Insérer le spoiler
            </Button>
          </div>
        );
      case "accordion":
        return (
          <div className="flex flex-col gap-3">
            <Field label="Titre de l'accordéon" htmlFor={fieldId("accordion")} hint="Le texte sélectionné devient le contenu du bloc repliable.">
              <Input id={fieldId("accordion")} type="text" value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} data-autofocus />
            </Field>
            <Button type="button" variant="primary" size="tap" onClick={submitAccordion}>
              Insérer l&apos;accordéon
            </Button>
          </div>
        );
      case "list":
        return (
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "", t: "Points (•)", i: List },
              { v: "-", t: "Tirets (-)", i: List },
              { v: "1", t: "Numéros (1.)", i: ListOrdered },
              { v: "a", t: "Lettres (a.)", i: ListOrdered },
            ].map((ls) => (
              <Button key={ls.v} type="button" variant="secondary" size="tap" onClick={() => insertListTag(ls.v)}>
                <ls.i size={16} aria-hidden="true" /> {ls.t}
              </Button>
            ))}
          </div>
        );
      case "align":
        return (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { v: "center", t: "Centrer le texte", i: AlignCenter },
              { v: "right", t: "Aligner à droite", i: AlignRight },
              { v: "justify", t: "Justifier", i: AlignJustify },
            ].map((al) => (
              <Button
                key={al.v}
                type="button"
                variant="secondary"
                size="tap"
                onClick={() => {
                  insertTag(`[${al.v}]`, `[/${al.v}]`);
                  setActiveTool(null);
                }}
              >
                <al.i size={16} aria-hidden="true" /> {al.t}
              </Button>
            ))}
          </div>
        );
      case "typo":
        return (
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "sup", t: "Exposant", i: Superscript },
              { v: "sub", t: "Indice", i: Subscript },
            ].map((ty) => (
              <Button
                key={ty.v}
                type="button"
                variant="secondary"
                size="tap"
                onClick={() => {
                  insertTag(`[${ty.v}]`, `[/${ty.v}]`);
                  setActiveTool(null);
                }}
              >
                <ty.i size={16} aria-hidden="true" /> {ty.t}
              </Button>
            ))}
          </div>
        );
      case "smileys":
        return <SmileyGrid onSelect={handleSmileySelect} />;
    }
  };

  /** Rubriques du panneau « Plus d'outils » (l'outil rangé là sur téléphone seulement n'y est pas sur ordinateur). */
  const moreToolsList = (
    <div className="flex flex-col gap-4">
      {MORE_TOOL_GROUPS.map((group) => {
        const tools = group.tools.filter((tool) => !(isDesktop && PHONE_ONLY_MORE_TOOLS.has(tool.id)));
        return (
          <section key={group.title} aria-label={group.title} className="flex flex-col gap-1.5">
            <h3 className="m-0 border-0 p-0 text-xs font-bold tracking-wide text-bb-text-muted uppercase not-italic">{group.title}</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  type="button"
                  variant="secondary"
                  size="tap"
                  onClick={() => runTool(tool)}
                  className="justify-start gap-2 px-3 text-left text-sm font-semibold whitespace-normal"
                >
                  <tool.icon size={18} aria-hidden="true" className="shrink-0 text-bb-accent-text" />
                  {tool.label}
                </Button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  const toolbarButtonClass = "size-11 shrink-0 lg:size-9";

  const plusButton = (
    <Button
      type="button"
      variant="quiet"
      size="tap-icon"
      aria-label={MORE_TOOLS_LABEL}
      aria-haspopup="dialog"
      aria-expanded={moreOpen}
      onClick={() => {
        setActiveTool(null);
        setMoreOpen(!moreOpen);
      }}
      className={cn(toolbarButtonClass, moreOpen && "bg-bb-accent-soft text-bb-accent-text")}
    >
      <Plus size={20} aria-hidden="true" />
    </Button>
  );

  // Panneau du bas (téléphone) : la liste « Plus d'outils », ou le formulaire de l'outil ouvert
  const sheetOpen = !isDesktop && (moreOpen || activeTool !== null);

  return (
    <div className="bbcode-editor relative flex flex-col rounded-bb-md border border-bb-border bg-bb-surface-2 font-bb-sans text-bb-text transition-colors focus-within:border-bb-focus">
      <input type="file" accept="image/*" multiple ref={fileInputRef} className="hidden" onChange={handleImageUpload} tabIndex={-1} aria-hidden="true" />

      {/* Barre d'outils, collée en haut de l'écran sur téléphone dans une page de rédaction */}
      <div
        role="toolbar"
        aria-label="Mise en forme du message"
        className={cn(
          "flex items-center gap-0.5 rounded-t-bb-md border-b border-bb-border bg-bb-surface px-1 py-1",
          screen && "max-lg:sticky max-lg:top-14 max-lg:z-20"
        )}
      >
        {PRIMARY_TOOLS.map(({ tool, desktopOnly }) => {
          const pressed = tool.kind === "panel" ? activeTool === tool.id : undefined;
          return (
            <Tooltip key={tool.id} content={tool.label}>
              <Button
                type="button"
                variant="quiet"
                size="tap-icon"
                aria-label={tool.label}
                aria-pressed={pressed}
                onClick={() => runTool(tool)}
                className={cn(toolbarButtonClass, desktopOnly && "max-lg:hidden", pressed && "bg-bb-accent-soft text-bb-accent-text")}
              >
                <tool.icon size={18} aria-hidden="true" />
              </Button>
            </Tooltip>
          );
        })}

        {isDesktop ? (
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger asChild>{plusButton}</PopoverTrigger>
            <PopoverContent aria-label="Plus d'outils" className="w-[400px]" onCloseAutoFocus={(e) => e.preventDefault()}>
              {moreToolsList}
            </PopoverContent>
          </Popover>
        ) : (
          plusButton
        )}

        <div className="flex-1" />

        <Tooltip content={isPreview ? "Revenir à l'écriture" : "Voir le rendu du message"}>
          <Button
            type="button"
            variant="quiet"
            size="tap"
            aria-label="Aperçu"
            aria-pressed={isPreview}
            onClick={() => setIsPreview(!isPreview)}
            className={cn("min-w-11 shrink-0 gap-1.5 px-2 lg:min-h-9 lg:px-3", isPreview && "bg-bb-accent-soft text-bb-accent-text")}
          >
            <Eye size={18} aria-hidden="true" />
            <span className="hidden text-sm lg:inline">Aperçu</span>
          </Button>
        </Tooltip>
      </div>

      {/* Ordinateur : formulaire de l'outil ouvert, sous la barre */}
      {isDesktop && activeTool && (
        <div className="border-b border-bb-border bg-bb-surface px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <p className="m-0 flex-1 text-sm font-bold text-bb-text">{PANEL_TOOL_LABELS[activeTool]}</p>
            <Button type="button" variant="quiet" size="icon" aria-label="Fermer l'outil" onClick={closeTools}>
              <X size={18} aria-hidden="true" />
            </Button>
          </div>
          <div ref={optionsRef} className="max-w-2xl">
            {renderToolOptions(activeTool)}
          </div>
        </div>
      )}

      <Textarea
        id={id}
        name={name}
        ref={textareaRef}
        value={content}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={cn(
          "block min-h-[120px] resize-y rounded-none border-0 bg-transparent px-3 py-3 [font-family:inherit] focus-visible:outline-none",
          screen && "max-lg:min-h-[calc(100dvh-18rem)] max-lg:resize-none max-lg:overflow-hidden",
          isPreview && "max-lg:hidden"
        )}
      />

      {isPreview && (
        <section aria-label="Aperçu du message" className="border-t border-bb-border px-4 py-4 lg:max-h-[400px] lg:overflow-y-auto">
          <p className="m-0 mb-2 text-xs font-bold tracking-wide text-bb-text-muted uppercase">Aperçu</p>
          {content ? <BBCodeContent content={content} /> : <p className="m-0 text-bb-text-muted italic">Aucun contenu…</p>}
        </section>
      )}

      {maxLength && (
        <div className={cn("flex justify-end rounded-b-bb-md border-t border-bb-border px-3 py-1 text-sm", content.length >= maxLength ? "text-bb-danger-text" : "text-bb-text-muted")}>
          {content.length} / {maxLength}
        </div>
      )}

      {/* Téléphone : panneau qui monte du bas, pour « Plus d'outils » et pour le formulaire de l'outil ouvert */}
      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeTools()}>
        <SheetContent
          ref={sheetRef}
          title={activeTool ? PANEL_TOOL_LABELS[activeTool] : "Plus d'outils"}
          onOpenAutoFocus={(e) => {
            // Pas de focus sur la croix de fermeture : le panneau lui-même le reçoit, puis le premier champ du
            // formulaire de l'outil (effet plus haut)
            e.preventDefault();
            sheetRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {sheetOpen &&
            (activeTool ? (
              <div ref={optionsRef} className="pb-2">
                {renderToolOptions(activeTool)}
              </div>
            ) : (
              moreToolsList
            ))}
        </SheetContent>
      </Sheet>

      <AIAssistantSheet open={isAIModalOpen} onOpenChange={setIsAIModalOpen} prompt={aiPrompt} />
    </div>
  );
}
