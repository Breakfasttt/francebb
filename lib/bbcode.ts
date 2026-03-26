export const smileysMap: Record<string, string> = {
  ":)": "🙂",
  ":-": "😐",
  ":(": "☹️",
  ";)": "😉",
  ":D": "😀",
  ":d": "😀",
  ":p": "😛",
  ":P": "😛",
  ":o": "😲",
  ":O": "😲",
  ":'(": "😢",
  ":/": "😕",
  "8)": "🤓",
  ":lol:": "😂",
  ":mad:": "😡",
  ":rolleyes:": "🙄",
  ":cool:": "😎",
  ":eek:": "😱",
  ":yikes:": "🙀",
};

/**
 * A simple BBCode parser that escapes HTML to prevent XSS and replaces known tags.
 */
export function parseBBCode(text: string, postStatusMap?: Record<string, { isDeleted: boolean, isModerated: boolean }>): string {
  if (!text) return "";

  // 1. Escape basic HTML tags to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Replace basic formatting
  // Using while loops for nested tags
  while (/\[b\]((?:(?!\[b\]).)*?)\[\/b\]/i.test(html)) {
    html = html.replace(/\[b\]((?:(?!\[b\]).)*?)\[\/b\]/i, "<strong>$1</strong>");
  }
  while (/\[i\]((?:(?!\[i\]).)*?)\[\/i\]/i.test(html)) {
    html = html.replace(/\[i\]((?:(?!\[i\]).)*?)\[\/i\]/i, "<em>$1</em>");
  }
  while (/\[u\]((?:(?!\[u\]).)*?)\[\/u\]/i.test(html)) {
    html = html.replace(/\[u\]((?:(?!\[u\]).)*?)\[\/u\]/i, "<u>$1</u>");
  }
  while (/\[s\]((?:(?!\[s\]).)*?)\[\/s\]/i.test(html)) {
    html = html.replace(/\[s\]((?:(?!\[s\]).)*?)\[\/s\]/i, "<s>$1</s>");
  }
  while (/\[color=(.*?)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/i.test(html)) {
    html = html.replace(/\[color=(.*?)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/i, "<span style='color: $1'>$2</span>");
  }
  while (/\[size=(.*?)\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i.test(html)) {
    // Basic protection/sanitization: ensure size is alphanumeric/unit-based
    const match = html.match(/\[size=(.*?)\]/i);
    const size = match ? match[1].replace(/[^a-zA-Z0-9.%-]/g, "") : "";
    html = html.replace(/\[size=.*?\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i, `<span style="font-size: ${size}; line-height: 1.2;">$1</span>`);
  }
  
  // Horizontal Rule
  html = html.replace(/\[hr\]/gi, "<hr style='border: none; border-top: 1px solid var(--glass-border); margin: 1.5rem 0; clear: both;' />");
  while (/\[quote\]((?:(?!\[quote\])[\s\S])*?)\[\/quote\]/i.test(html)) {
    html = html.replace(
      /\[quote\]((?:(?!\[quote\])[\s\S])*?)\[\/quote\]/i,
      `<div class="bb-quote-wrapper" style="margin: 1.5rem 0; display: flex; flex-direction: column;">
        <div style="display: flex; position: relative; z-index: 1;">
          <div style="background: var(--primary); color: var(--header-foreground); padding: 0.3rem 0.8rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; border-radius: 6px 6px 0 0; letter-spacing: 0.5px;">
            Citation
          </div>
        </div>
        <blockquote style='border-left:4px solid var(--primary); border-top: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); color: var(--text-secondary); background: var(--glass-bg); padding:1rem; margin:0; border-radius: 0 8px 8px 8px; font-style: italic;'>
          $1
        </blockquote>
      </div>`
    );
  }

  // Spoilers
  while (/\[spoiler\]((?:(?!\[spoiler\])[\s\S])*?)\[\/spoiler\]/i.test(html)) {
    html = html.replace(/\[spoiler\]((?:(?!\[spoiler\])[\s\S])*?)\[\/spoiler\]/i, 
      '<details class="bb-spoiler"><summary>Spoiler (cliquez pour afficher)</summary><div class="bb-spoiler-content">$1</div></details>');
  }
  while (/\[spoiler=(.*?)\]((?:(?!\[spoiler\])[\s\S])*?)\[\/spoiler\]/i.test(html)) {
    html = html.replace(/\[spoiler=(.*?)\]((?:(?!\[spoiler\])[\s\S])*?)\[\/spoiler\]/i, 
      '<details class="bb-spoiler"><summary>Spoiler: $1</summary><div class="bb-spoiler-content">$2</div></details>');
  }

  // Accordions
  while (/\[accordion=(.*?)\]((?:(?!\[accordion\])[\s\S])*?)\[\/accordion\]/i.test(html)) {
    html = html.replace(/\[accordion=(.*?)\]((?:(?!\[accordion\])[\s\S])*?)\[\/accordion\]/i, 
      '<details class="bb-accordion"><summary>$1</summary><section class="bb-accordion-content">$2</section></details>');
  }

  // 3. Replace Links
  // [url=https://example.com]text[/url]
  html = html.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--accent); text-decoration:underline;\">$2</a>");
  // [url]https://example.com[/url]
  html = html.replace(/\[url\](.*?)\[\/url\]/gi, "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--accent); text-decoration:underline;\">$1</a>");
  
  // Topic Links — [topic=ID]text[/topic]
  html = html.replace(/\[topic=([a-zA-Z0-9_-]+)\](.*?)\[\/topic\]/gi, "<a href=\"/forum/topic/$1\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--primary); text-decoration:none; font-weight:600; padding: 0.1rem 0.4rem; background: rgba(var(--primary-rgb, 100,200,255), 0.1); border-radius: 4px;\">📌 $2</a>");
  // [url]https://example.com[/url]
  html = html.replace(/\[url\](.*?)\[\/url\]/gi, "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--accent); text-decoration:underline;\">$1</a>");
  
  // @Mentions — [mention=UserID]Username[/mention]
  html = html.replace(/\[mention=([a-zA-Z0-9_-]+)\](.*?)\[\/mention\]/gi, "<a href=\"/profile?id=$1\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"mention\" style=\"color: var(--primary); font-weight: 700; background: rgba(var(--primary-rgb,100,200,255),0.12); padding: 0.05rem 0.35rem; border-radius: 4px; text-decoration: none;\">@$2</a>");

  // Quotes — [quote=UserID|PostID]content[/quote]
  html = html.replace(/\[quote=([a-zA-Z0-9_-]+)\|?([a-zA-Z0-9_-]*)\]([\s\S]*?)\[\/quote\]/gi, (match, userId, postId, content) => {
    let quoteContent = '';
    
    if (postId && postStatusMap && postStatusMap[postId]) {
      const status = postStatusMap[postId];
      if (status.isDeleted) {
        quoteContent = `<div style="border-left: 4px solid var(--text-muted); background: var(--glass-bg); padding: 1.5rem; border-radius: 0 8px 8px 8px; font-style: italic; color: var(--text-muted); text-align: center; border: 1px solid var(--glass-border);">Ce message a était supprimé par son auteur</div>`;
      } else if (status.isModerated) {
        quoteContent = `<div style="border-left: 4px solid var(--danger); background: var(--primary-transparent); padding: 1.5rem; border-radius: 0 8px 8px 8px; font-style: italic; color: var(--danger); text-align: center; border: 1px solid var(--danger);">Le contenu de ce message a été masqué par la modération.</div>`;
      }
    }

    if (!quoteContent) {
      quoteContent = `<div style="border-left: 4px solid var(--primary); background: var(--glass-bg); padding: 1rem; border-radius: 0 8px 8px 8px; font-style: italic; margin: 0; border-top: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border); border-bottom: 1px solid var(--glass-border); color: var(--text-secondary);"><div>${content}</div></div>`;
    }

    return `<div class="bb-quote-wrapper" style="margin: 1.5rem 0; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1;">
        <div style="display: flex; gap: 4px;">
          <div style="background: var(--primary); color: var(--header-foreground); padding: 0.3rem 0.8rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; border-radius: 6px 6px 0 0; letter-spacing: 0.5px;">Citation</div>
          <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-bottom: none; color: var(--text-muted); padding: 0.3rem 0.8rem; font-size: 0.7rem; border-radius: 6px 6px 0 0; font-weight: 600;">
            Par <a href="/profile?id=${userId}" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 800;">@${userId}</a>
          </div>
        </div>
        ${postId ? `<div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-bottom: none; color: var(--text-muted); padding: 0.3rem 0.8rem; font-size: 0.7rem; border-radius: 6px 6px 0 0;"><a href="#post-${postId}" style="color: inherit; text-decoration: none;">Voir le message</a></div>` : ""}
      </div>
      ${quoteContent}
    </div>`;
  });

  // 4. Replace Images
  html = html.replace(
    /\[img(?: align=(left|right|center))?(?: wrap=(yes|no))?\](.*?)\[\/img\]/gi,
    (match, align, wrap, url) => {
      let style = "max-width:100%; border-radius:8px;";
      const isWrap = wrap === "yes" || (!wrap && (align === "left" || align === "right"));
      
      if (isWrap) {
        if (align === "left") style += " float: left; margin: 0.5rem 1rem 0.5rem 0;";
        else if (align === "right") style += " float: right; margin: 0.5rem 0 0.5rem 1rem;";
        else style += " display: block; margin: 1rem auto;"; // center never wraps
      } else {
        if (align === "left") style += " display: block; margin: 1rem 0; margin-right: auto;";
        else if (align === "right") style += " display: block; margin: 1rem 0; margin-left: auto;";
        else style += " display: block; margin: 1rem auto;";
      }
      
      return `<img src="${url}" alt="Image" style="${style}" loading="lazy" />`;
    }
  );

  // 5. Replace YouTube Videos
  const youtubeWrapper = (id: string, align?: string, wrap?: string) => {
    let style = "position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px;";
    let outerStyle = "margin: 1.5rem 0; clear: both;";
    const isWrap = wrap === "yes" || (!wrap && (align === "left" || align === "right"));
    
    if (isWrap) {
      if (align === "left") {
        outerStyle = "float: left; width: 45%; margin: 0.5rem 1.5rem 0.5rem 0;";
      } else if (align === "right") {
        outerStyle = "float: right; width: 45%; margin: 0.5rem 0 0.5rem 1.5rem;";
      } else {
        outerStyle = "max-width: 800px; margin: 1.5rem auto;";
      }
    } else {
      if (align === "left") {
        outerStyle = "max-width: 800px; margin: 1.5rem 0; margin-right: auto;";
      } else if (align === "right") {
        outerStyle = "max-width: 800px; margin: 1.5rem 0; margin-left: auto;";
      } else {
        outerStyle = "max-width: 800px; margin: 1.5rem auto;";
      }
    }

    return `<div style="${outerStyle}"><div style="${style}"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allowfullscreen></iframe></div></div>`;
  };

  html = html.replace(
    /\[youtube(?: align=(left|right|center))?(?: wrap=(yes|no))?\]([a-zA-Z0-9_-]{11})\[\/youtube\]/gi,
    (match, align, wrap, id) => youtubeWrapper(id, align, wrap)
  );
  
  // also support [youtube]URL[/youtube] with optional align/wrap
  html = html.replace(
    /\[youtube(?: align=(left|right|center))?(?: wrap=(yes|no))?\]https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?\[\/youtube\]/gi,
    (match, align, wrap, id) => youtubeWrapper(id, align, wrap)
  );
  html = html.replace(
    /\[youtube(?: align=(left|right|center))?(?: wrap=(yes|no))?\]https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(&.*)?\[\/youtube\]/gi,
    (match, align, wrap, id) => youtubeWrapper(id, align, wrap)
  );

  // 6. Replace Smileys
  // We use word boundaries or space boundaries to not accidentally replace chars inside words if not careful,
  // but for things like :) it's safer to just replace them if they are common.
  // Actually, let's just do a simple replacement for the mapped smileys.
  Object.entries(smileysMap).forEach(([textFace, emoji]) => {
    // Escape regex chars in the text face
    const escapedTextFace = textFace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace standalone smileys or smileys with spaces
    const regex = new RegExp(`(^|\\s)${escapedTextFace}(?=\\s|$)`, 'g');
    html = html.replace(regex, `$1${emoji}`);
  });

  // 7. Replace Newlines with <br />
  html = html.replace(/\r\n|\r|\n/g, "<br />");

  return html;
}

/**
 * A simplified BBCode parser for inline elements only (titles, breadcrumbs).
 * Strips out block elements or media to prevent layout breaking.
 */
export function parseInlineBBCode(text: string): string {
  if (!text) return "";

  // 1. Escape basic HTML tags
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Replace basic inline formatting
  while (/\[b\]((?:(?!\[b\])[\s\S])*?)\[\/b\]/i.test(html)) {
    html = html.replace(/\[b\]((?:(?!\[b\])[\s\S])*?)\[\/b\]/i, "<strong>$1</strong>");
  }
  while (/\[i\]((?:(?!\[i\])[\s\S])*?)\[\/i\]/i.test(html)) {
    html = html.replace(/\[i\]((?:(?!\[i\])[\s\S])*?)\[\/i\]/i, "<em>$1</em>");
  }
  while (/\[u\]((?:(?!\[u\])[\s\S])*?)\[\/u\]/i.test(html)) {
    html = html.replace(/\[u\]((?:(?!\[u\])[\s\S])*?)\[\/u\]/i, "<u>$1</u>");
  }
  while (/\[s\]((?:(?!\[s\])[\s\S])*?)\[\/s\]/i.test(html)) {
    html = html.replace(/\[s\]((?:(?!\[s\])[\s\S])*?)\[\/s\]/i, "<s>$1</s>");
  }
  while (/\[color=(.*?)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/i.test(html)) {
    html = html.replace(/\[color=(.*?)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/i, "<span style='color: $1'>$2</span>");
  }
  while (/\[size=(.*?)\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i.test(html)) {
    html = html.replace(/\[size=.*?\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i, "<span>$1</span>");
  }

  // Strip block/media tags completely so user sees just the raw text or nothing
  html = html.replace(/\[hr\]/gi, " --- ");
  html = html.replace(/\[img(?: align=(?:left|right|center))?\].*?\[\/img\]/gi, "📸 Image");
  html = html.replace(/\[youtube(?: align=(?:left|right|center))?\].*?\[\/youtube\]/gi, "🎥 Vidéo");
  html = html.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, "$2"); // Strip link, keep text
  html = html.replace(/\[url\](.*?)\[\/url\]/gi, "$1");
  html = html.replace(/\[topic=([a-zA-Z0-9_-]+)\](.*?)\[\/topic\]/gi, "📌 $2"); // Keep just the text and an icon
  html = html.replace(/\[quote\]((?:(?!\[quote\])[\s\S])*?)\[\/quote\]/gi, "« $1 »");
  html = html.replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, "⚠️ Spoiler");
  html = html.replace(/\[spoiler=(.*?)\](.*?)\[\/spoiler\]/gi, "⚠️ Spoiler: $1");
  html = html.replace(/\[accordion=(.*?)\](.*?)\[\/accordion\]/gi, "📋 Accordion: $1");

  // 3. Replace Smileys
  Object.entries(smileysMap).forEach(([textFace, emoji]) => {
    const escapedTextFace = textFace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escapedTextFace}(?=\\s|$)`, 'g');
    html = html.replace(regex, `$1${emoji}`);
  });

  return html;
}
