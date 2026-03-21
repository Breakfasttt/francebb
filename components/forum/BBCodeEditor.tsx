"use client";

import Toast from "@/components/Toast";
import { parseBBCode } from "@/lib/bbcode";
import { siteConfig } from "@/lib/siteConfig";
import { Bold, Eye, EyeOff, Hash, Image as ImageIcon, Italic, Link as LinkIcon, Loader2, Palette, Smile, Underline, Youtube } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SmileyGrid from "./SmileyGrid";

interface BBCodeEditorProps {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}

const IMGUR_CLIENT_ID = siteConfig.api.imgur.clientId;

export default function BBCodeEditor({ name, id, defaultValue = "", placeholder, rows = 10 }: BBCodeEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTool, setActiveTool] = useState<'link' | 'youtube' | 'image' | 'smileys' | 'color' | 'topic' | null>(null);
  const [toolInputUrl, setToolInputUrl] = useState("");
  const [toolInputText, setToolInputText] = useState("");
  const [topicQuery, setTopicQuery] = useState("");
  const [topicResults, setTopicResults] = useState<{id: string; title: string; forumName: string}[]>([]);
  const [isSearchingTopics, setIsSearchingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<{id: string; title: string; forumName: string} | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    // Affichage prolongé pour que l'utilisateur ait le temps de lire l'erreur
    setTimeout(() => setToast(null), 7000);
  };

  // Sync external defaultValue changes
  useEffect(() => {
    setContent(defaultValue);
  }, [defaultValue]);

  // Topic search with debounce
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

  const insertTag = (startTag: string, endTag: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    // Fallback for browsers that don't support selectionStart
    if (typeof textarea.selectionStart === "undefined") {
      const newContent = content + startTag + endTag;
      setContent(newContent);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end, text.length);

    const newContent = before + startTag + selected + endTag + after;
    setContent(newContent);

    // Re-focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      // If we wrapped text, highlight it again. If empty, put cursor between tags.
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

  const submitLink = () => {
    if (toolInputUrl) {
      if (!textareaRef.current) return;
      const textarea = textareaRef.current;

      if (typeof textarea.selectionStart === "undefined") {
        const label = toolInputText.trim() !== "" ? toolInputText : toolInputUrl;
        const newContent = content + `[url=${toolInputUrl}]${label}[/url]`;
        setContent(newContent);
        setToolInputUrl("");
        setToolInputText("");
        setActiveTool(null);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = content;

      const before = text.substring(0, start);
      const selected = text.substring(start, end);
      const after = text.substring(end, text.length);

      const label = toolInputText.trim() !== "" ? toolInputText : (selected || toolInputUrl);
      const newContent = before + `[url=${toolInputUrl}]${label}[/url]` + after;
      setContent(newContent);

      setToolInputUrl("");
      setToolInputText("");
      setActiveTool(null);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = before.length + `[url=${toolInputUrl}]${label}[/url]`.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const submitTopic = () => {
    if (!selectedTopic || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const topicId = selectedTopic.id;
    const defaultTitle = selectedTopic.title;

    const label = toolInputText.trim() !== "" ? toolInputText : defaultTitle;

    if (typeof textarea.selectionStart === "undefined") {
      setContent(content + `[topic=${topicId}]${label}[/topic]`);
      setToolInputText(""); setTopicQuery(""); setTopicResults([]); setSelectedTopic(null); setActiveTool(null);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);
    const finalLabel = toolInputText.trim() !== "" ? toolInputText : (selected || defaultTitle);
    const tag = `[topic=${topicId}]${finalLabel}[/topic]`;

    setContent(before + tag + after);
    setToolInputText(""); setTopicQuery(""); setTopicResults([]); setSelectedTopic(null); setActiveTool(null);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(before.length + tag.length, before.length + tag.length);
    }, 0);
  };

  const submitYoutube = () => {
    if (toolInputUrl) {
      insertTag(`[youtube]${toolInputUrl}[/youtube]`, "");
      setToolInputUrl("");
      setActiveTool(null);
    }
  };

  const submitImageUrl = () => {
    if (toolInputUrl) {
      insertTag(`[img]${toolInputUrl}[/img]`, "");
      setToolInputUrl("");
      setActiveTool(null);
    }
  };

  const toggleTool = (tool: 'link' | 'youtube' | 'image' | 'smileys' | 'color' | 'topic') => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      setToolInputUrl(""); // reset input when opening a new tool
      setToolInputText("");
      setTopicQuery("");
      setTopicResults([]);
      setSelectedTopic(null);

      if ((tool === 'link' || tool === 'topic') && textareaRef.current) {
        const textarea = textareaRef.current;
        if (typeof textarea.selectionStart !== "undefined") {
          const selected = content.substring(textarea.selectionStart, textarea.selectionEnd);
          if (selected) {
            setToolInputText(selected);
          }
        }
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
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        insertTag(`[img]${data.data.link}[/img]`, "");
        setActiveTool(null);
        showToast("Image insérée avec succès !", "success");
      } else {
        showToast(`Erreur Imgur: ${data.data?.error || "Requête rejetée"}`, "error");
        console.error("Imgur error:", data);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Une erreur réseau est survenue lors de l'upload.", "error");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bbcode-editor" style={{ border: "1px solid var(--glass-border)", borderRadius: "8px", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />

      {/* Editor Toolbar */}
      <div
        className="editor-toolbar"
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "0.5rem",
          borderBottom: "1px solid var(--glass-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}
      >
        <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
          <button type="button" onClick={() => insertTag("[b]", "[/b]")} className="toolbar-btn" title="Gras">
            <Bold size={16} />
          </button>
          <button type="button" onClick={() => insertTag("[i]", "[/i]")} className="toolbar-btn" title="Italique">
            <Italic size={16} />
          </button>
          <button type="button" onClick={() => insertTag("[u]", "[/u]")} className="toolbar-btn" title="Souligné">
            <Underline size={16} />
          </button>

          <button type="button" onClick={() => toggleTool('color')} className={`toolbar-btn ${activeTool === 'color' ? 'active-tool' : ''}`} title="Couleur du texte">
            <Palette size={16} />
          </button>

          <div style={{ width: "1px", height: "20px", background: "var(--glass-border)", margin: "0 0.5rem" }}></div>

          <button type="button" onClick={() => toggleTool('link')} className={`toolbar-btn ${activeTool === 'link' ? 'active-tool' : ''}`} title="Ajouter un lien">
            <LinkIcon size={16} />
          </button>

          <button type="button" onClick={() => toggleTool('topic')} className={`toolbar-btn ${activeTool === 'topic' ? 'active-tool' : ''}`} title="Lier un sujet du forum">
            <Hash size={16} />
          </button>

          <button
            type="button"
            onClick={() => toggleTool('image')}
            className={`toolbar-btn ${activeTool === 'image' ? 'active-tool' : ''}`}
            title="Ajouter une image"
          >
            <ImageIcon size={16} />
          </button>

          <button type="button" onClick={() => toggleTool('youtube')} className={`toolbar-btn ${activeTool === 'youtube' ? 'active-tool' : ''}`} title="Ajouter une vidéo YouTube">
            <Youtube size={16} />
          </button>

          <div style={{ width: "1px", height: "20px", background: "var(--glass-border)", margin: "0 0.5rem" }}></div>

          <button type="button" onClick={() => toggleTool('smileys')} className={`toolbar-btn ${activeTool === 'smileys' ? 'active-tool' : ''}`} title="Insérer un smiley">
            <Smile size={16} />
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`widget-button ${isPreview ? "active" : "secondary-btn"}`}
            style={{ padding: "0.4rem 0.8rem", height: "auto", fontSize: "0.85rem" }}
          >
            {isPreview ? (
              <><EyeOff size={16} /> Fermer l'aperçu</>
            ) : (
              <><Eye size={16} /> Aperçu</>
            )}
          </button>
        </div>
      </div>

      {/* Inline Tool Panel */}
      {activeTool && (
        <div className="active-tool-panel" style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderBottom: "1px solid var(--glass-border)" }}>
          {activeTool === 'link' && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="url"
                placeholder="URL (ex: https://...)"
                value={toolInputUrl}
                onChange={(e) => setToolInputUrl(e.target.value)}
                style={{ flex: 1, padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "white" }}
                autoFocus
              />
              <input
                type="text"
                placeholder="Texte (optionnel)"
                value={toolInputText}
                onChange={(e) => setToolInputText(e.target.value)}
                style={{ flex: 1, padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "white" }}
              />
              <button type="button" onClick={submitLink} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.5rem" }}>Insérer</button>
            </div>
          )}
          {activeTool === 'topic' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Rechercher un sujet du forum..."
                  value={topicQuery}
                  onChange={(e) => setTopicQuery(e.target.value)}
                  style={{ width: "100%", padding: "0.4rem 2rem 0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "white" }}
                  autoFocus
                />
                {isSearchingTopics && (
                  <span style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)" }}>
                    <Loader2 size={14} className="animate-spin" color="#aaa" />
                  </span>
                )}
              </div>
              {topicResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0", maxHeight: "170px", overflowY: "auto", background: "rgba(0,0,0,0.5)", borderRadius: "6px", border: "1px solid var(--glass-border)" }}>
                  {topicResults.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => { setSelectedTopic(topic); setTopicResults([]); setTopicQuery(""); }}
                      style={{ textAlign: "left", padding: "0.5rem 0.8rem", background: selectedTopic?.id === topic.id ? "rgba(var(--primary-rgb,100,200,255),0.15)" : "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "white", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{topic.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#aaa" }}>📂 {topic.forumName}</div>
                    </button>
                  ))}
                </div>
              )}
              {topicQuery.trim().length >= 2 && topicResults.length === 0 && !isSearchingTopics && !selectedTopic && (
                <div style={{ padding: "0.5rem", color: "#aaa", fontSize: "0.88rem", textAlign: "center" }}>Aucun sujet trouvé.</div>
              )}
              {selectedTopic && (
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.5rem 0.8rem", background: "rgba(255,255,255,0.04)", borderRadius: "6px", border: "1px solid var(--glass-border)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>📌 {selectedTopic.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "#aaa" }}>📂 {selectedTopic.forumName}</div>
                  </div>
                  <input
                    type="text"
                    placeholder="Texte affiché (défaut = titre)"
                    value={toolInputText}
                    onChange={(e) => setToolInputText(e.target.value)}
                    style={{ flex: 1, padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "white", fontSize: "0.88rem" }}
                  />
                  <button type="button" onClick={submitTopic} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.2rem", flexShrink: 0 }}>Insérer</button>
                  <button type="button" onClick={() => setSelectedTopic(null)} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "1.1rem", padding: "0 0.2rem" }} title="Désélectionner">✕</button>
                </div>
              )}
            </div>
          )}
          {activeTool === 'youtube' && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="URL de la vidéo YouTube..."
                value={toolInputUrl}
                onChange={(e) => setToolInputUrl(e.target.value)}
                style={{ flex: 1, padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "white" }}
                autoFocus
              />
              <button type="button" onClick={submitYoutube} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.5rem" }}>Insérer</button>
            </div>
          )}
          {activeTool === 'image' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="url"
                  placeholder="URL d'une image existante (https://...)"
                  value={toolInputUrl}
                  onChange={(e) => setToolInputUrl(e.target.value)}
                  style={{ flex: 1, padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "white" }}
                  autoFocus
                />
                <button type="button" onClick={submitImageUrl} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.5rem" }}>Insérer l'URL</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
                <span style={{ color: "#aaa", fontSize: "0.9rem" }}>OU</span>
                <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="widget-button secondary-btn"
                disabled={isUploading}
                style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                {isUploading ? "Upload en cours..." : "Uploader depuis mon ordinateur (Imgur)"}
              </button>
            </div>
          )}
          {activeTool === 'color' && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {[
                { name: "Rouge", hex: "#ef4444" },
                { name: "Orange", hex: "#f97316" },
                { name: "Jaune", hex: "#eab308" },
                { name: "Vert", hex: "#22c55e" },
                { name: "Cyan", hex: "#06b6d4" },
                { name: "Bleu", hex: "#3b82f6" },
                { name: "Violet", hex: "#a855f7" },
                { name: "Rose", hex: "#ec4899" },
                { name: "Gris", hex: "#9ca3af" },
                { name: "Blanc", hex: "#ffffff" }
              ].map(color => (
                <button
                  key={color.hex}
                  type="button"
                  title={color.name}
                  onClick={() => {
                    insertTag(`[color=${color.hex}]`, "[/color]");
                    setActiveTool(null);
                  }}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: color.hex,
                    border: "2px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ))}
            </div>
          )}
          {activeTool === 'smileys' && (
            <SmileyGrid onSelect={handleSmileySelect} />
          )}
        </div>
      )}

      {/* Editor Content Area */}
      <div
        className="editor-content-area"
        style={{
          position: "relative",
          flex: 1,
          display: "grid",
          gridTemplateColumns: isPreview ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr",
          gap: isPreview ? "1rem" : "0",
          alignItems: "stretch"
        }}
      >
        <textarea
          id={id}
          name={name}
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: "100%",
            height: "100%",
            padding: "1rem",
            background: "rgba(0,0,0,0.2)",
            border: "none",
            color: "white",
            resize: "vertical",
            outline: "none",
            lineHeight: "1.5",
            fontSize: "1rem",
            fontFamily: "inherit",
            borderRight: isPreview ? "1px solid var(--glass-border)" : "none"
          }}
        />

        {isPreview && (
          <div
            className="editor-preview"
            style={{
              width: "100%",
              height: "100%",
              padding: "1rem",
              background: "rgba(255,255,255,0.02)",
              color: "#eee",
              overflowY: "auto",
              lineHeight: "1.6"
            }}
            dangerouslySetInnerHTML={{ __html: parseBBCode(content) || "<em style='color: #666;'>Aucun contenu à prévisualiser...</em>" }}
          />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        .toolbar-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #aaa;
          padding: 0.4rem;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .toolbar-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          color: white;
          border-color: var(--glass-border);
        }
        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
