"use client";

import { useState, useRef, useEffect } from "react";
import { Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Youtube, Eye, PenLine, Loader2, Smile } from "lucide-react";
import SmileyGrid from "./SmileyGrid";
import { parseBBCode } from "@/lib/bbcode";
import Toast from "@/components/Toast";

interface BBCodeEditorProps {
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}

// A generic Imgur Client-ID suitable for anonymous uploads
const IMGUR_CLIENT_ID = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID || "c4d4ce51b914ce7";

export default function BBCodeEditor({ name, id, defaultValue = "", placeholder, rows = 10 }: BBCodeEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTool, setActiveTool] = useState<'link' | 'youtube' | 'image' | 'smileys' | null>(null);
  const [toolInputUrl, setToolInputUrl] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Sync external defaultValue changes
  useEffect(() => {
    setContent(defaultValue);
  }, [defaultValue]);

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
      insertTag(`[url=${toolInputUrl}]`, "[/url]");
      setToolInputUrl("");
      setActiveTool(null);
    }
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

  const toggleTool = (tool: 'link' | 'youtube' | 'image' | 'smileys') => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
      setToolInputUrl(""); // reset input when opening a new tool
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
          
          <div style={{ width: "1px", height: "20px", background: "var(--glass-border)", margin: "0 0.5rem" }}></div>
          
          <button type="button" onClick={() => toggleTool('link')} className={`toolbar-btn ${activeTool === 'link' ? 'active-tool' : ''}`} title="Ajouter un lien">
            <LinkIcon size={16} />
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
              <><PenLine size={16} /> Éditer</>
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
                placeholder="https://..." 
                value={toolInputUrl}
                onChange={(e) => setToolInputUrl(e.target.value)}
                style={{ flex: 1, padding: "0.4rem 0.8rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", borderRadius: "4px", color: "white" }}
                autoFocus
              />
              <button type="button" onClick={submitLink} className="widget-button" style={{ width: "auto", padding: "0.4rem 1.5rem" }}>Insérer</button>
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
