"use client";

import Toast from "@/common/components/Toast/Toast";
import { parseBBCode } from "@/lib/bbcode";
import { siteConfig } from "@/lib/siteConfig";
import { Bold, ChevronDown, Eye, EyeOff, Ghost, Hash, Image as ImageIcon, Italic, Link as LinkIcon, Loader2, Palette, Smile, Underline, User as UserIcon, Youtube, Strikethrough, Type, Minus, AlignLeft, AlignCenter, AlignRight, WrapText, Sparkles, Bot, List, ListOrdered, Table as TableIcon, Code, AlignJustify, Superscript, Subscript, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SmileyGrid from "@/common/components/SmileyGrid/SmileyGrid";
import Tooltip from "@/common/components/Tooltip/Tooltip";
import Modal from "@/common/components/Modal/Modal";

interface BBCodeEditorProps {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  onChange?: (value: string) => void;
  required?: boolean;
}

const IMGBB_API_KEY = siteConfig.api.imgbb.apiKey;

export default function BBCodeEditor({ name, id, defaultValue = "", placeholder, rows = 10, maxLength, onChange, required }: BBCodeEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTool, setActiveTool] = useState<'link' | 'youtube' | 'image' | 'gallery' | 'smileys' | 'color' | 'size' | 'topic' | 'mention' | 'spoiler' | 'accordion' | 'list' | 'align' | 'code' | 'typo' | null>(null);
  const [toolInputThumb, setToolInputThumb] = useState(true);
  const [toolInputUrl, setToolInputUrl] = useState("");
  const [toolInputText, setToolInputText] = useState("");
  const [toolInputAlign, setToolInputAlign] = useState<"center" | "left" | "right">("center");
  const [toolInputWrap, setToolInputWrap] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [topicQuery, setTopicQuery] = useState("");
  const [topicResults, setTopicResults] = useState<{id: string; title: string; forumName: string}[]>([]);
  const [isSearchingTopics, setIsSearchingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<{id: string; title: string; forumName: string} | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<{id: string; name: string; image: string | null}[]>([]);
  const [isSearchingMentions, setIsSearchingMentions] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 7000);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "@" && !isPreview && activeTool !== 'mention') {
        const textarea = textareaRef.current;
        if (textarea && document.activeElement === textarea) {
          e.preventDefault();
          setActiveTool('mention');
          setMentionQuery("");
          setMentionResults([]);
        }
      }
      
      if (e.key === "Escape" && activeTool) {
        setActiveTool(null);
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreview, activeTool]);

  const generateAIPrompt = () => {
    const rules = `Tu es "BB-Assistant", l'intelligence artificielle experte en formatage BBCode pour le forum "France Blood Bowl" (BBFrance). 
Ton rôle est de métamorphoser le texte brut de l'utilisateur en un post de forum parfaitement structuré, lisible et visuellement impressionnant.

CONTEXTE VISUEL (Modern UI) :
Le forum utilise un design "Glassmorphism" raffiné. Les blocs (spoilers, citations, accordéons) sont thémables et possèdent une forte identité visuelle. Priorise l'organisation spatiale.

DICTIONNAIRE DES BALISES ET SYNTAXES :
1. MISE EN FORME DE BASE : 
   - [b]gras[/b], [i]italique[/i], [u]souligné[/u], [s]barré[/s]
   - [hr] (Saut de section avec ligne horizontale élégante)
   - [size=1.5rem]Titre Principal[/size], [size=1.25rem]Sous-titre[/size]
   - [color=#c21d1d]texte rouge[/color] (Couleur officielle du site), [color=#ffd700]texte or[/color] (Accentuation)

2. ORGANISATION ET DONNÉES :
   - [list][*]item[/list] (Puces classiques)
   - [list=1], [list=a] (Listes ordonnées)
   - [list=-] (Liste avec tirets Blood Bowl)
   - [table][tr][th]Titre[/th][/tr][tr][td]Valeur[/td][/tr][/table] (Tableaux structurés)

3. MÉDIAS ET RÉFÉRENCES :
   - [img align=left|right|center wrap=yes|no thumb=yes|no]LIEN_DIRECT_IMAGE[/img]
   - [youtube align=left|right|center wrap=yes|no thumb=yes|no]ID_VIDEO_OU_URL_BRUTE[/youtube]
   - [gallery]URL1, URL2, URL3[/gallery]
   IMPORTANT : Le contenu entre les balises [img] et [youtube] doit être du texte brut uniquement. 
   ERREUR À NE JAMAIS FAIRE : [img][http://site.com/img.jpg](http://site.com/img.jpg)[/img] <-- INTERDIT !
   CE QU'IL FAUT FAIRE : [img]https://site.com/img.jpg[/img] <-- CORRECT !

4. COMPOSANTS INTERACTIFS (ESSENTIEL) :
   - [spoiler=Titre]Contenu caché[/spoiler]
   - [accordion=Titre]Contenu rétractable[/accordion]
   - [quote=Pseudo]texte[/quote]

5. NAVIGATION :
   - [url=URL_BRUTE]texte[/url]. Exemple : [url=https://google.com]Google[/url]
   - [mention=ID]Pseudo[/mention], [topic=ID]Titre du sujet[/topic]

RÈGLES D'OR DE RÉDACTION :
- RÉPONDS DANS UN BLOC DE CODE : Encapsule tout ton code BBCode final dans un seul bloc de code Markdown \`\`\`bbcode [ton_code] \`\`\`. C'est crucial pour éviter les erreurs de formatage.
- ZÉRO MARKDOWN À L'INTÉRIEUR : Ne jamais utiliser de crochets '[' et ']' sauf pour les balises BBCode.
- NE JAMAIS écrire de liens sous la forme [texte](url).
- YOUTUBE : Utilise uniquement l'ID ou l'URL brute. JAMAIS de Markdown entre les balises. (Exemple correct : [youtube]dQw4w9WgXcQ[/youtube]).
- Aère le texte avec des [hr] et des titres en couleur (#c21d1d).
- N'invente pas de nouvelles informations. Reste fidèle au contenu de l'utilisateur.
- Utilise systématiquement les [accordion] pour condenser les pavés de texte.
- RÉPONDS EXCLUSIVEMENT PAR LE CODE BBCODE GÉNÉRÉ. AUCUN COMMENTAIRE AUTOUR DU BLOC DE CODE.

TEXTE À FORMATER :
-----------------
${content || "(Le champ est vide. Imagine un exemple de post de tournoi Blood Bowl parfaitement formaté pour me montrer tes capacités.)"}
-----------------`;
    setAiPrompt(rules);
    setIsAIModalOpen(true);
  };

  const copyAIPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    showToast("Prompt copié ! Prêt à être collé dans une I.A.", "success");
  };

  const openAI = (url: string) => {
    copyAIPrompt();
    window.open(url, "_blank");
  };

  const handleContentChange = (newContent: string) => {
    if (maxLength && newContent.length > maxLength) {
      newContent = newContent.substring(0, maxLength);
    }
    setContent(newContent);
    if (onChange) onChange(newContent);
  };

  useEffect(() => {
    const handleRemoteInsert = (e: any) => {
      const textToInsert = e.detail;
      if (textToInsert) {
        insertTag(textToInsert, "");
      }
    };
    window.addEventListener('bbcode-insert-text', handleRemoteInsert);
    return () => window.removeEventListener('bbcode-insert-text', handleRemoteInsert);
  }, [content]);

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
    const text = content;
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

  const handleSmileySelect = (code: string) => {
    insertTag(code, "");
    setActiveTool(null);
  };

  const insertListTag = (type: string) => {
    const start = type ? `[list=${type}]\n[*] ` : `[list]\n[*] `;
    insertTag(start, `\n[/list]`);
    setActiveTool(null);
  };

  const insertTableTemplate = () => {
    const template = `[table]\n[tr]\n[th]Header 1[/th]\n[th]Header 2[/th]\n[/tr]\n[tr]\n[td]Cell 1[/td]\n[td]Cell 2[/td]\n[/tr]\n[/table]`;
    insertTag(template, "");
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
      const label = toolInputText.trim() !== "" ? toolInputText : (selected || toolInputUrl);
      const tag = `[url=${toolInputUrl}]${label}[/url]`;
      const newContent = before + tag + after;
      handleContentChange(newContent);
      setToolInputUrl(""); setToolInputText(""); setActiveTool(null);
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
    const finalLabel = toolInputText.trim() !== "" ? toolInputText : (selected || selectedTopic.title);
    const tag = `[topic=${selectedTopic.id}]${finalLabel}[/topic]`;
    handleContentChange(before + tag + after);
    setToolInputText(""); setTopicQuery(""); setTopicResults([]); setSelectedTopic(null); setActiveTool(null);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(before.length + tag.length, before.length + tag.length);
    }, 0);
  };

  const submitMention = (id: string, username: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const tag = `[mention=${id}]${username}[/mention]`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    let finalBefore = before;
    if (before.endsWith("@")) finalBefore = before.slice(0, -1);
    handleContentChange(finalBefore + tag + " " + after);
    setMentionQuery(""); setMentionResults([]); setActiveTool(null);
    setTimeout(() => {
      textarea.focus();
      const newPos = finalBefore.length + tag.length + 1;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const submitYoutube = () => {
    if (toolInputUrl) {
      let tag = "[youtube";
      if (toolInputAlign !== "center") tag += ` align=${toolInputAlign}`;
      if (toolInputAlign !== "center") tag += ` wrap=${toolInputWrap ? "yes" : "no"}`;
      if (!toolInputThumb) tag += ` thumb=no`;
      tag += `]${toolInputUrl}[/youtube]`;
      insertTag(tag, "");
      setToolInputUrl(""); setToolInputAlign("center"); setToolInputWrap(false); setToolInputThumb(true); setActiveTool(null);
    }
  };

  const submitImageUrl = () => {
    if (toolInputUrl) {
      let tag = "[img";
      if (toolInputAlign !== "center") tag += ` align=${toolInputAlign}`;
      if (toolInputAlign !== "center") tag += ` wrap=${toolInputWrap ? "yes" : "no"}`;
      if (!toolInputThumb) tag += ` thumb=no`;
      tag += `]${toolInputUrl}[/img]`;
      insertTag(tag, "");
      setToolInputUrl(""); setToolInputAlign("center"); setToolInputWrap(false); setToolInputThumb(true); setActiveTool(null);
    }
  };

  const submitSpoiler = () => {
    const startTag = toolInputText.trim() !== "" ? `[spoiler=${toolInputText}]` : "[spoiler]";
    insertTag(startTag, "[/spoiler]");
    setToolInputText(""); setActiveTool(null);
  };

  const submitAccordion = () => {
    if (toolInputText.trim() !== "") {
      insertTag(`[accordion=${toolInputText}]`, "[/accordion]");
      setToolInputText(""); setActiveTool(null);
    }
  };

  const toggleTool = (tool: 'link' | 'youtube' | 'image' | 'gallery' | 'smileys' | 'color' | 'size' | 'topic' | 'mention' | 'spoiler' | 'accordion' | 'list' | 'align' | 'code' | 'typo') => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      setToolInputUrl(""); setToolInputText(""); setToolInputAlign("center"); setToolInputThumb(true);
      setTopicQuery(""); setTopicResults([]); setSelectedTopic(null);
      setMentionQuery(""); setMentionResults([]);
      if ((tool === 'link' || tool === 'topic' || tool === 'spoiler' || tool === 'accordion') && textareaRef.current) {
        const textarea = textareaRef.current;
        const selected = content.substring(textarea.selectionStart, textarea.selectionEnd);
        if (selected) setToolInputText(selected);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        let tag = "[img";
        if (toolInputAlign !== "center") tag += ` align=${toolInputAlign}`;
        if (toolInputAlign !== "center") tag += ` wrap=${toolInputWrap ? "yes" : "no"}`;
        if (!toolInputThumb) tag += " thumb=no";
        tag += `]${data.data.url}[/img]`;
        insertTag(tag, "");
        setActiveTool(null);
        setToolInputAlign("center");
        setToolInputWrap(false);
        showToast("Image uploadée avec succès !", "success");
        setToolInputThumb(true);
      } else {
        showToast(`Erreur ImgBB: ${data.error?.message || "Requête rejetée"}`, "error");
      }
    } catch (error) {
      showToast("Une erreur réseau est survenue lors de l'upload.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submitGallery = () => {
    if (!toolInputUrl.trim()) return;
    insertTag(`[gallery]${toolInputUrl.trim()}[/gallery]`, "");
    setToolInputUrl("");
    setActiveTool(null);
  };

  return (
    <div className="bbcode-editor" style={{ border: "1px solid var(--glass-border)", borderRadius: "8px", overflow: "visible", display: "flex", flexDirection: "column", position: "relative" }}>
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageUpload} />

      <div className="editor-toolbar" style={{ background: "var(--glass-bg)", padding: "0.4rem", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem", position: "relative", zIndex: 10, borderRadius: "8px 8px 0 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.15rem", alignItems: "center" }}>
          <Tooltip text="Gras">
            <button type="button" onClick={() => insertTag("[b]", "[/b]")} className="toolbar-btn"><Bold size={16} /></button>
          </Tooltip>
          <Tooltip text="Italique">
            <button type="button" onClick={() => insertTag("[i]", "[/i]")} className="toolbar-btn"><Italic size={16} /></button>
          </Tooltip>
          <Tooltip text="Souligné">
            <button type="button" onClick={() => insertTag("[u]", "[/u]")} className="toolbar-btn"><Underline size={16} /></button>
          </Tooltip>
          <Tooltip text="Barré">
            <button type="button" onClick={() => insertTag("[s]", "[/s]")} className="toolbar-btn"><Strikethrough size={16} /></button>
          </Tooltip>
          <Tooltip text="Taille du texte">
            <button type="button" onClick={() => toggleTool('size')} className={`toolbar-btn ${activeTool === 'size' ? 'active-tool' : ''}`}><Type size={16} /></button>
          </Tooltip>
          <Tooltip text="Couleur du texte">
            <button type="button" onClick={() => toggleTool('color')} className={`toolbar-btn ${activeTool === 'color' ? 'active-tool' : ''}`}><Palette size={16} /></button>
          </Tooltip>
          
          <div style={{ width: "1px", height: "16px", background: "var(--glass-border)", margin: "0 0.1rem" }}></div>
          
          <Tooltip text="Séparateur horizontal">
            <button type="button" onClick={() => insertTag("[hr]", "")} className="toolbar-btn"><Minus size={16} /></button>
          </Tooltip>
          
          <Tooltip text="Liste">
            <button type="button" onClick={() => toggleTool('list')} className={`toolbar-btn ${activeTool === 'list' ? 'active-tool' : ''}`}><List size={16} /></button>
          </Tooltip>
          
          <Tooltip text="Tableau">
            <button type="button" onClick={() => insertTableTemplate()} className="toolbar-btn"><TableIcon size={16} /></button>
          </Tooltip>
          
          <div style={{ width: "1px", height: "16px", background: "var(--glass-border)", margin: "0 0.1rem" }}></div>

          <Tooltip text="Ajouter un lien">
            <button type="button" onClick={() => toggleTool('link')} className={`toolbar-btn ${activeTool === 'link' ? 'active-tool' : ''}`}><LinkIcon size={16} /></button>
          </Tooltip>
          <Tooltip text="Lier un sujet du forum">
            <button type="button" onClick={() => toggleTool('topic')} className={`toolbar-btn ${activeTool === 'topic' ? 'active-tool' : ''}`}><Hash size={16} /></button>
          </Tooltip>
          <Tooltip text="Ajouter une image">
            <button type="button" onClick={() => toggleTool('image')} className={`toolbar-btn ${activeTool === 'image' ? 'active-tool' : ''}`}><ImageIcon size={16} /></button>
          </Tooltip>
          <Tooltip text="Créer une galerie d'images">
            <button type="button" onClick={() => toggleTool('gallery')} className={`toolbar-btn ${activeTool === 'gallery' ? 'active-tool' : ''}`}><LayoutGrid size={16} /></button>
          </Tooltip>
          <Tooltip text="Ajouter une vidéo YouTube">
            <button type="button" onClick={() => toggleTool('youtube')} className={`toolbar-btn ${activeTool === 'youtube' ? 'active-tool' : ''}`}><Youtube size={16} /></button>
          </Tooltip>
          <Tooltip text="Taguer un membre (@)">
            <button type="button" onClick={() => toggleTool('mention')} className={`toolbar-btn ${activeTool === 'mention' ? 'active-tool' : ''}`}><UserIcon size={16} /></button>
          </Tooltip>

          <div style={{ width: "1px", height: "16px", background: "var(--glass-border)", margin: "0 0.2rem" }}></div>

          <Tooltip text="Spoiler">
            <button type="button" onClick={() => toggleTool('spoiler')} className={`toolbar-btn ${activeTool === 'spoiler' ? 'active-tool' : ''}`}><Ghost size={16} /></button>
          </Tooltip>
          <Tooltip text="Accordéon (Détails)">
            <button type="button" onClick={() => toggleTool('accordion')} className={`toolbar-btn ${activeTool === 'accordion' ? 'active-tool' : ''}`}><ChevronDown size={16} /></button>
          </Tooltip>
          <Tooltip text="Bloc de code">
            <button type="button" onClick={() => insertTag("[code]", "[/code]")} className="toolbar-btn"><Code size={16} /></button>
          </Tooltip>
          <Tooltip text="Alignement du texte">
            <button type="button" onClick={() => toggleTool('align')} className={`toolbar-btn ${activeTool === 'align' ? 'active-tool' : ''}`}><AlignCenter size={16} /></button>
          </Tooltip>
          <Tooltip text="Typographie (Exposant/Indice)">
            <button type="button" onClick={() => toggleTool('typo')} className={`toolbar-btn ${activeTool === 'typo' ? 'active-tool' : ''}`}><Superscript size={14} /></button>
          </Tooltip>
          
          <div style={{ width: "1px", height: "16px", background: "var(--glass-border)", margin: "0 0.2rem" }}></div>

          <Tooltip text="Insérer un smiley">
            <button type="button" onClick={() => toggleTool('smileys')} className={`toolbar-btn ${activeTool === 'smileys' ? 'active-tool' : ''}`}><Smile size={16} /></button>
          </Tooltip>
          <Tooltip text="Assistant I.A. (Mise en forme)">
            <button type="button" onClick={generateAIPrompt} className="toolbar-btn ai-btn" style={{ color: "var(--accent)" }}>
              <Sparkles size={16} />
            </button>
          </Tooltip>
        </div>

        <div>
          <Tooltip text={isPreview ? "Fermer l'aperçu" : "Aperçu"}>
            <button type="button" onClick={() => setIsPreview(!isPreview)} className={`widget-button ${isPreview ? "active" : "secondary-btn"}`} style={{ padding: "0.4rem 0.8rem", height: "auto", fontSize: "0.85rem" }}>
              {isPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Tooltip>
        </div>
      </div>

      {activeTool && (
        <div className="active-tool-panel" style={{ background: "var(--glass-bg)", padding: "1rem", borderBottom: "1px solid var(--glass-border)" }}>
          {activeTool === 'link' && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="url" placeholder="URL (ex: https://...)" value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} style={{ flex: 1, padding: "0.4rem 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "var(--foreground)" }} autoFocus />
              <input type="text" placeholder="Texte (optionnel)" value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} style={{ flex: 1, padding: "0.4rem 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "var(--foreground)" }} />
              <button type="button" onClick={submitLink} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.5rem" }}>Insérer</button>
            </div>
          )}
          {activeTool === 'topic' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ position: "relative" }}>
                <input type="text" placeholder="Rechercher un sujet du forum..." value={topicQuery} onChange={(e) => setTopicQuery(e.target.value)} style={{ width: "100%", padding: "0.4rem 2rem 0.4rem 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "var(--foreground)", outline: "none" }} autoFocus />
                {isSearchingTopics && <span style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)" }}><Loader2 size={14} className="animate-spin" color="var(--text-muted)" /></span>}
              </div>
              {topicResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0", maxHeight: "170px", overflowY: "auto", background: "var(--card-bg)", backdropFilter: "blur(12px)", borderRadius: "6px", border: "1px solid var(--glass-border)", boxShadow: "var(--glass-shadow)", marginTop: "0.3rem" }}>
                  {topicResults.map((topic) => (
                    <button key={topic.id} type="button" onClick={() => { setSelectedTopic(topic); setTopicResults([]); setTopicQuery(""); }} style={{ textAlign: "left", padding: "0.6rem 0.9rem", background: selectedTopic?.id === topic.id ? "var(--primary-transparent)" : "transparent", border: "none", borderBottom: "1px solid var(--glass-border)", color: "var(--foreground)", cursor: "pointer", transition: "background 0.2s" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{topic.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>📂 {topic.forumName}</div>
                    </button>
                  ))}
                </div>
              )}
              {selectedTopic && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem 0.8rem", background: "var(--glass-bg)", borderRadius: "6px", border: "1px solid var(--glass-border)" }}>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "0.88rem" }}>📌 {selectedTopic.title}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>📂 {selectedTopic.forumName}</div></div>
                  <input type="text" placeholder="Texte affiché (défaut = titre)" value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} style={{ flex: 1, padding: "0.4rem 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "var(--foreground)", fontSize: "0.88rem" }} />
                  <button type="button" onClick={submitTopic} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.2rem", flexShrink: 0 }}>Insérer</button>
                  <button type="button" onClick={() => setSelectedTopic(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem", padding: "0 0.2rem" }}>✕</button>
                </div>
              )}
            </div>
          )}
          {activeTool === 'youtube' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>ID ou URL YouTube</span>
                  <input type="text" placeholder="Vidéo YouTube..." value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} style={{ width: "100%", height: "36px", padding: "0 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", color: "var(--foreground)" }} autoFocus />
                </div>
                
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Alignement</span>
                    <div style={{ display: "flex", background: "var(--glass-bg)", borderRadius: "6px", border: "1px solid var(--glass-border)", padding: "0.2rem" }}>
                      {[ {v:'left', i:AlignLeft, t:'Gauche'}, {v:'center', i:AlignCenter, t:'Centre'}, {v:'right', i:AlignRight, t:'Droite'} ].map(al => (
                        <Tooltip key={al.v} text={al.t}>
                          <button type="button" onClick={() => setToolInputAlign(al.v as any)} className={`toolbar-btn ${toolInputAlign === al.v ? 'active-tool' : ''}`} style={{ padding: "0.3rem" }}>
                            <al.i size={16} />
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Miniature</span>
                    <Tooltip text={toolInputThumb ? "Taille réduite (recommandé)" : "Taille réelle"}>
                      <button 
                        type="button" onClick={() => setToolInputThumb(!toolInputThumb)} 
                        className={`toolbar-btn ${toolInputThumb ? 'active-tool' : ''}`} 
                        style={{ padding: "0.3rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", width: "40px", height: "36px" }}
                      >
                        <Bot size={16} />
                      </button>
                    </Tooltip>
                  </div>

                  {toolInputAlign !== "center" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Habillage</span>
                      <Tooltip text={toolInputWrap ? "Texte autour de la vidéo" : "Vidéo seule sur sa ligne"}>
                        <button 
                          type="button" onClick={() => setToolInputWrap(!toolInputWrap)} 
                          className={`toolbar-btn ${toolInputWrap ? 'active-tool' : ''}`} 
                          style={{ padding: "0.3rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", width: "40px", height: "36px" }}
                        >
                          <WrapText size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
              <button type="button" onClick={submitYoutube} className="widget-button" style={{ width: "auto", padding: "0.4rem 2rem", height: "38px" }}>Insérer la vidéo</button>
            </div>
          )}
          {activeTool === 'gallery' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Liste des URLs d'images (séparées par des virgules ou retours à la ligne)</span>
                <textarea 
                  placeholder="https://image1.jpg, https://image2.jpg..." 
                  value={toolInputUrl} 
                  onChange={(e) => setToolInputUrl(e.target.value)} 
                  style={{ width: "100%", height: "80px", padding: "0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", color: "var(--foreground)", resize: "none", fontSize: "0.85rem" }} 
                  autoFocus 
                />
              </div>
              <button type="button" onClick={submitGallery} className="widget-button" style={{ width: "auto", padding: "0.4rem 2rem", height: "38px" }}>Créer la galerie</button>
            </div>
          )}
          {activeTool === 'mention' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input type="text" placeholder="Rechercher un membre (@)..." value={mentionQuery} onChange={(e) => setMentionQuery(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "var(--foreground)", outline: "none" }} autoFocus />
              {mentionResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0", maxHeight: "170px", overflowY: "auto", background: "var(--card-bg)", backdropFilter: "blur(12px)", borderRadius: "6px", border: "1px solid var(--glass-border)", boxShadow: "var(--glass-shadow)", marginTop: "0.3rem" }}>
                  {mentionResults.map((user) => (
                    <button key={user.id} type="button" onClick={() => submitMention(user.id, user.name || "Anonyme")} style={{ textAlign: "left", padding: "0.6rem 0.9rem", background: "transparent", border: "none", borderBottom: "1px solid var(--glass-border)", color: "var(--foreground)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.8rem", transition: "background 0.2s" }}>
                      {user.image ? <img src={user.image} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%" }} /> : <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center" }}><UserIcon size={14} color="var(--text-muted)" /></div>}
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{user.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTool === 'image' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>URL de l'image</span>
                  <input type="url" placeholder="https://..." value={toolInputUrl} onChange={(e) => setToolInputUrl(e.target.value)} style={{ width: "100%", height: "36px", padding: "0 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", color: "var(--foreground)" }} autoFocus />
                </div>
                
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Alignement</span>
                    <div style={{ display: "flex", background: "var(--glass-bg)", borderRadius: "6px", border: "1px solid var(--glass-border)", padding: "0.2rem" }}>
                      {[ {v:'left', i:AlignLeft, t:'Gauche'}, {v:'center', i:AlignCenter, t:'Centre'}, {v:'right', i:AlignRight, t:'Droite'} ].map(al => (
                        <Tooltip key={al.v} text={al.t}>
                          <button type="button" onClick={() => setToolInputAlign(al.v as any)} className={`toolbar-btn ${toolInputAlign === al.v ? 'active-tool' : ''}`} style={{ padding: "0.3rem" }}>
                            <al.i size={16} />
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Miniature</span>
                    <Tooltip text={toolInputThumb ? "Taille réduite (recommandé)" : "Taille réelle"}>
                      <button 
                        type="button" onClick={() => setToolInputThumb(!toolInputThumb)} 
                        className={`toolbar-btn ${toolInputThumb ? 'active-tool' : ''}`} 
                        style={{ padding: "0.3rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", width: "40px", height: "36px" }}
                      >
                        <Bot size={16} />
                      </button>
                    </Tooltip>
                  </div>

                  {toolInputAlign !== "center" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Habillage</span>
                      <Tooltip text={toolInputWrap ? "Texte autour de l'image" : "Image seule sur sa ligne"}>
                        <button 
                          type="button" onClick={() => setToolInputWrap(!toolInputWrap)} 
                          className={`toolbar-btn ${toolInputWrap ? 'active-tool' : ''}`} 
                          style={{ padding: "0.3rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", width: "40px", height: "36px" }}
                        >
                          <WrapText size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={submitImageUrl} className="widget-button" style={{ flex: 1, height: "38px" }}>Insérer via URL</button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="widget-button secondary-btn" disabled={isUploading} style={{ flex: 1, height: "38px", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                  {isUploading ? "Upload..." : "Uploader depuis PC"}
                </button>
              </div>
            </div>
          )}
          {activeTool === 'size' && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["0.7rem", "0.85rem", "1rem", "1.25rem", "1.5rem", "2rem"].map(s => (
                <button key={s} type="button" onClick={() => { insertTag(`[size=${s}]`, "[/size]"); setActiveTool(null); }} className="widget-button secondary-btn" style={{ width: "auto", padding: "0.4rem 1rem", fontSize: s }}>{s}</button>
              ))}
            </div>
          )}
          {activeTool === 'color' && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899", "#9ca3af", "#ffffff"].map(c => (
                <button key={c} type="button" onClick={() => { insertTag(`[color=${c}]`, "[/color]"); setActiveTool(null); }} style={{ width: "24px", height: "24px", borderRadius: "50%", background: c, border: "2px solid var(--glass-border)", cursor: "pointer" }} />
              ))}
            </div>
          )}
          {activeTool === 'spoiler' && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="text" placeholder="Titre spoiler..." value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} style={{ flex: 1, padding: "0.4rem 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "var(--foreground)" }} autoFocus />
              <button type="button" onClick={submitSpoiler} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.5rem" }}>Insérer</button>
            </div>
          )}
          {activeTool === 'accordion' && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="text" placeholder="Titre accordéon..." value={toolInputText} onChange={(e) => setToolInputText(e.target.value)} style={{ flex: 1, padding: "0.4rem 0.8rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "var(--foreground)" }} autoFocus />
              <button type="button" onClick={submitAccordion} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.5rem" }}>Insérer</button>
            </div>
          )}
          {activeTool === 'list' && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginRight: "0.5rem", textTransform: "uppercase" }}>Style de liste :</span>
              {[
                { v: "", t: "Points (•)", i: List },
                { v: "-", t: "Tirets (-)", i: List },
                { v: "1", t: "Numéros (1.)", i: ListOrdered },
                { v: "a", t: "Lettres (a.)", i: ListOrdered }
              ].map(ls => (
                <button key={ls.v} type="button" onClick={() => insertListTag(ls.v)} className="widget-button secondary-btn" style={{ width: "auto", padding: "0.4rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ls.i size={14} /> {ls.t}
                </button>
              ))}
            </div>
          )}
          {activeTool === 'align' && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginRight: "0.5rem", textTransform: "uppercase" }}>Alignement :</span>
              {[
                { v: "center", t: "Centre", i: AlignCenter },
                { v: "right", t: "Droite", i: AlignRight },
                { v: "justify", t: "Justifié", i: AlignJustify }
              ].map(al => (
                <button key={al.v} type="button" onClick={() => { insertTag(`[${al.v}]`, `[/${al.v}]`); setActiveTool(null); }} className="widget-button secondary-btn" style={{ width: "auto", padding: "0.4rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <al.i size={14} /> {al.t}
                </button>
              ))}
            </div>
          )}
          {activeTool === 'typo' && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginRight: "0.5rem", textTransform: "uppercase" }}>Style de texte :</span>
              {[
                { v: "sup", t: "Exposant", i: Superscript },
                { v: "sub", t: "Indice", i: Subscript }
              ].map(ty => (
                <button key={ty.v} type="button" onClick={() => { insertTag(`[${ty.v}]`, `[/${ty.v}]`); setActiveTool(null); }} className="widget-button secondary-btn" style={{ width: "auto", padding: "0.4rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ty.i size={14} /> {ty.t}
                </button>
              ))}
            </div>
          )}
          {activeTool === 'smileys' && <SmileyGrid onSelect={handleSmileySelect} />}
        </div>
      )}

      <div className="editor-content-area" style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <textarea
          id={id} name={name} ref={textareaRef} value={content} onChange={(e) => handleContentChange(e.target.value)} placeholder={placeholder} rows={rows}
          required={required}
          style={{ width: "100%", height: isPreview ? "200px" : "100%", padding: "1rem", background: "var(--glass-bg)", border: "none", color: "var(--foreground)", resize: "vertical", outline: "none", fontSize: "1rem", fontFamily: "inherit" }}
        />
        {isPreview && (
          <div className="editor-preview" style={{ width: "100%", minHeight: "150px", maxHeight: "400px", padding: "1.5rem", background: "transparent", color: "var(--foreground)", overflowY: "auto" }} dangerouslySetInnerHTML={{ __html: parseBBCode(content) || "<em style='color: var(--text-muted);'>Aucun contenu...</em>" }} />
        )}
      </div>

      {maxLength && (
        <div style={{ padding: "0.3rem 1rem", background: "var(--glass-bg)", borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "flex-end", fontSize: "0.75rem", color: content.length >= maxLength ? "var(--danger)" : "var(--text-muted)", borderRadius: "0 0 8px 8px" }}>
          {content.length} / {maxLength}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style jsx>{`
        .toolbar-btn { background: transparent; border: 1px solid transparent; color: var(--text-muted); padding: 0.3rem; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .toolbar-btn:hover { background: var(--glass-bg); color: var(--foreground); border-color: var(--glass-border); }
        .active-tool { color: var(--primary); background: var(--primary-transparent); }
        .pending { filter: grayscale(0.5); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      {isAIModalOpen && (
        <Modal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
          title="Assistant de Mise en forme I.A."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
              Nous avons préparé un prompt optimisé incluant les règles spécifiques du forum et votre contenu actuel.
            </p>
            
            <div style={{ 
              background: "rgba(0,0,0,0.2)", 
              padding: "1rem", 
              borderRadius: "8px", 
              fontSize: "0.75rem", 
              maxHeight: "150px", 
              overflowY: "auto", 
              border: "1px solid var(--glass-border)",
              fontFamily: "monospace",
              color: "var(--text-secondary)"
            }}>
              {aiPrompt}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button type="button" onClick={copyAIPrompt} className="widget-button" style={{ width: "100%", justifyContent: "center" }}>
                Copier le prompt
              </button>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <button type="button" onClick={() => openAI("https://gemini.google.com/app")} className="widget-button secondary-btn" style={{ fontSize: "0.8rem", padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                  <Sparkles size={14} /> Gemini
                </button>
                <button type="button" onClick={() => openAI("https://claude.ai/new")} className="widget-button secondary-btn" style={{ fontSize: "0.8rem", padding: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                  <Bot size={14} /> Claude
                </button>
              </div>
              <button type="button" onClick={() => openAI("https://chatgpt.com")} className="widget-button secondary-btn" style={{ fontSize: "0.8rem", padding: "0.5rem", width: "100%", justifyContent: "center" }}>
                Ouvrir ChatGPT
              </button>
            </div>
            
            <p style={{ fontSize: "0.75rem", fontStyle: "italic", textAlign: "center", color: "var(--text-muted)", margin: 0 }}>
              Le prompt sera automatiquement copié dans votre presse-papier à l'ouverture de l'I.A.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
