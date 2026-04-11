/**
 * Moteur de rendu BBCode pour BBFrance.
 * Gère la transformation du BBCode en HTML sécurisé.
 * Supporte : formatting, couleurs, spoilers, accordéons, citations, galeries et YouTube.
 */
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
 * A simple helper to sanitize URLs and prevent JS injection
 */
function sanitizeUrl(url: string, base: string = "#"): string {
  if (!url) return base;
  const decoded = url.trim().replace(/\s/g, "");
  // Bloquer absolument javascript: et data:
  if (decoded.toLowerCase().startsWith("javascript:") || decoded.toLowerCase().startsWith("data:")) return base;
  // Autoriser les protocoles standards ou les liens relatifs
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(decoded)) return decoded;
  // Par défaut, on préfixe par https:// si ça ressemble à un domaine
  return `https://${decoded}`;
}

/**
 * A simple helper to sanitize styles (color/size) to prevent CSS injection
 */
function sanitizeStyle(value: string, type: 'color' | 'size'): string {
  const v = value.trim().split(';')[0]; // On ne prend que la première instruction CSS
  if (type === 'color') {
    // Regex simple pour hex, rgb, hsl ou noms de couleurs
    if (/^(#[0-9a-f]{3,8}|[a-z]{3,20}|rgba?\(.*\)|hsla?\(.*\))$/i.test(v)) return v;
  } else if (type === 'size') {
    // On autorise chiffres + unités simples (% em rem px)
    if (/^[0-9.]+(%|em|rem|px|pt|vh|vw)?$/i.test(v)) return v;
  }
  return "";
}

/**
 * A simple BBCode parser that escapes HTML to prevent XSS and replaces known tags.
 */
export function parseBBCode(text: string, postStatusMap?: Record<string, { isDeleted: boolean, isModerated: boolean }>, currentUserId?: string): string {
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
    html = html.replace(/\[color=(.*?)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/i, (match, color, content) => {
      const safeColor = sanitizeStyle(color, 'color') || 'inherit';
      return `<span style="color: ${safeColor}">${content}</span>`;
    });
  }
  while (/\[size=(.*?)\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i.test(html)) {
    html = html.replace(/\[size=(.*?)\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i, (match, size, content) => {
      const safeSize = sanitizeStyle(size, 'size') || 'inherit';
      return `<span style="font-size: ${safeSize}; line-height: 1.2;">${content}</span>`;
    });
  }
  
  // Alignment blocks
  while (/\[center\]((?:(?!\[center\])[\s\S])*?)\[\/center\]/i.test(html)) {
    html = html.replace(/\[center\]((?:(?!\[center\])[\s\S])*?)\[\/center\]/i, "<div style='text-align: center;'>$1</div>");
  }
  while (/\[right\]((?:(?!\[right\])[\s\S])*?)\[\/right\]/i.test(html)) {
    html = html.replace(/\[right\]((?:(?!\[right\])[\s\S])*?)\[\/right\]/i, "<div style='text-align: right;'>$1</div>");
  }
  while (/\[justify\]((?:(?!\[justify\])[\s\S])*?)\[\/justify\]/i.test(html)) {
    html = html.replace(/\[justify\]((?:(?!\[justify\])[\s\S])*?)\[\/justify\]/i, "<div style='text-align: justify;'>$1</div>");
  }

  // Code blocks
  while (/\[code\]((?:(?!\[code\])[\s\S])*?)\[\/code\]/i.test(html)) {
    html = html.replace(/\[code\]((?:(?!\[code\])[\s\S])*?)\[\/code\]/i, "<pre style='background: rgba(0,0,0,0.35); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); font-family: monospace; white-space: pre-wrap; color: var(--text-secondary); margin: 1rem 0; font-size: 0.85rem;'>$1</pre>");
  }

  // Sub/Sup
  while (/\[sup\]((?:(?!\[sup\])[\s\S])*?)\[\/sup\]/i.test(html)) {
    html = html.replace(/\[sup\]((?:(?!\[sup\])[\s\S])*?)\[\/sup\]/i, "<sup>$1</sup>");
  }
  while (/\[sub\]((?:(?!\[sub\])[\s\S])*?)\[\/sub\]/i.test(html)) {
    html = html.replace(/\[sub\]((?:(?!\[sub\])[\s\S])*?)\[\/sub\]/i, "<sub>$1</sub>");
  }
  
  // Horizontal Rule
  html = html.replace(/\[hr\]/gi, "<hr style='border: none; border-top: 1px solid var(--glass-border); margin: 1rem 0; clear: both;' />");

  // 3. Spoilers (Body-First structure for persistent size)
  html = html.replace(/\[spoiler(?:=(.*?))?\]([\s\S]*?)\[\/spoiler\]/gi, (match, title, content) => {
    const trimmedContent = content.trim();
    return `<div class="bb-spoiler-wrapper">${title ? `<div class="bb-spoiler-header">${title}</div>` : ""}<div class="bb-spoiler-box" onclick="this.classList.add('revealed')"><div class="bb-spoiler-body">${trimmedContent}<button class="bb-spoiler-rehide" title="Recouvrir le bloc" onclick="event.stopPropagation(); this.closest('.bb-spoiler-box').classList.remove('revealed');">👁️</button></div><div class="bb-spoiler-mask"><span class="bb-spoiler-mask-text">👁️ SPOILER</span></div></div></div>`;
  });

  // 4. Accordions
  while (/\[accordion=(.*?)\]((?:(?!\[accordion\])[\s\S])*?)\[\/accordion\]/i.test(html)) {
    html = html.replace(/\[accordion=(.*?)\]((?:(?!\[accordion\])[\s\S])*?)\[\/accordion\]/i, (match, title, content) => {
      const trimmed = content.trim();
      return `<details class="bb-accordion"><summary>${title}</summary><section class="bb-accordion-content">${trimmed}</section></details>`;
    });
  }

  // 5. Quotes (Unified Tabbed Design)
  html = html.replace(/\[quote(?:=([^|\]]+)\|?([a-zA-Z0-9_-]*)(?:\|([^\]]*))?)?\]([\s\S]*?)\[\/quote\]/gi, (match, userId, postId, userName, content) => {
    let quoteContent = '';
    if (postId && postStatusMap && postStatusMap[postId]) {
      const status = postStatusMap[postId];
      if (status.isDeleted) {
        quoteContent = `<div style="text-align: center; color: var(--text-muted); padding: 0.5rem;">Ce message a été supprimé par son auteur</div>`;
      } else if (status.isModerated) {
        quoteContent = `<div style="text-align: center; color: var(--danger); padding: 0.5rem;">Le contenu de ce message a été masqué par la modération.</div>`;
      }
    }
    const displayContent = (quoteContent || content).trim();
    const tabs = [];
    tabs.push(`<div style="background: var(--primary); color: var(--header-foreground); padding: 0.35rem 1rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; border-radius: 8px 8px 0 0; letter-spacing: 0.5px; border: 1px solid var(--primary); border-bottom: none; display: flex; align-items: center;">Citation ${userId ? '' : ' '}</div>`);
    if (userId) {
      const isMe = currentUserId === userId;
      const profileHref = isMe ? '/profile' : `/spy/${userId}`;
      const displayName = userName || userId;
      tabs.push(`<div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-bottom: none; color: var(--text-muted); padding: 0.35rem 1rem; font-size: 0.7rem; border-radius: 8px 8px 0 0; font-weight: 600; margin-left: -1px; display: flex; align-items: center;">Par&nbsp;<a href="${profileHref}" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 800;">@${displayName}</a></div>`);
    }
    if (postId) {
      tabs.push(`<div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-bottom: none; color: var(--text-muted); padding: 0.35rem 1rem; font-size: 0.7rem; border-radius: 8px 8px 0 0; font-weight: 600; margin-left: -1px; display: flex; align-items: center;"><a href="#post-${postId}" style="color: inherit; text-decoration: none;">Voir le message</a></div>`);
    }
    return `<div class="bb-quote-wrapper" style="margin: 1rem 0; display: flex; flex-direction: column;"><div style="display: flex; align-items: stretch; position: relative; z-index: 2; margin-bottom: -1px;">${tabs.join("")}</div><blockquote style='border: 1px solid var(--glass-border); border-left: 4px solid var(--primary); background: var(--glass-bg); padding: 0.8rem 1.2rem; margin: 0; border-radius: 0 8px 8px 8px; font-style: italic; color: var(--text-secondary); position: relative; z-index: 1;'>${displayContent}</blockquote></div>`;
  });

  // 6. Links
  html = html.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, (match, url, content) => {
    return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent); text-decoration:underline;">${content}</a>`;
  });
  html = html.replace(/\[url\](.*?)\[\/url\]/gi, (match, url) => {
    const safeUrl = sanitizeUrl(url);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--accent); text-decoration:underline;">${url}</a>`;
  });
  html = html.replace(/\[topic=([a-zA-Z0-9_-]+)\](.*?)\[\/topic\]/gi, "<a href=\"/forum/topic/$1\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--primary); text-decoration:none; font-weight:600; padding: 0.1rem 0.4rem; background: rgba(var(--primary-rgb, 100,200,255), 0.1); border-radius: 4px;\">📌 $2</a>");
  html = html.replace(/\[mention=([a-zA-Z0-9_-]+)\](.*?)\[\/mention\]/gi, (match, mId, mName) => {
    const isMe = currentUserId === mId;
    const href = isMe ? '/profile' : `/spy/${mId}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="mention" style="color: var(--primary); font-weight: 700; background: rgba(var(--primary-rgb,100,200,255),0.12); padding: 0.05rem 0.35rem; border-radius: 4px; text-decoration: none;">@${mName}</a>`;
  });

  // 7. Replace Images
  html = html.replace(
    /\[img(?: align=(left|right|center))?(?: wrap=(yes|no))?(?: thumb=(yes|no))?\](.*?)\[\/img\]/gi,
    (match, align, wrap, thumb, url) => {
      const safeUrl = sanitizeUrl(url);
      const isThumb = thumb !== "no";
      let style = "max-width:100%; border-radius:8px;";
      if (isThumb) style += " max-width: 400px; max-height: 250px; object-fit: contain;";
      const isWrap = wrap === "yes" || (!wrap && (align === "left" || align === "right"));
      if (isWrap) {
        if (align === "left") style += " float: left; margin: 0.3rem 1rem 0.3rem 0;";
        else if (align === "right") style += " float: right; margin: 0.3rem 0 0.3rem 1rem;";
        else style += " display: block; margin: 0.8rem auto;";
      } else {
        if (align === "left") style += " display: block; margin: 0.8rem 0; margin-right: auto;";
        else if (align === "right") style += " display: block; margin: 0.8rem 0; margin-left: auto;";
        else style += " display: block; margin: 0.8rem auto;";
      }
      return `<img src="${safeUrl}" alt="Image" style="${style}" loading="lazy" />`;
    }
  );

  // 8. Replace YouTube Videos
  const youtubeWrapper = (id: string, align?: string, wrap?: string, thumb?: string) => {
    const isThumb = thumb !== "no";
    let style = "position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px;";
    let outerStyle = `margin: 1rem 0; clear: both; width: 100%; max-width: ${isThumb ? '480px' : '800px'};`;
    const isWrap = wrap === "yes" || (!wrap && (align === "left" || align === "right"));
    if (isWrap) {
      if (align === "left") outerStyle = `float: left; width: 45%; max-width: ${isThumb ? '350px' : '45%'}; margin: 0.3rem 1.2rem 0.3rem 0;`;
      else if (align === "right") outerStyle = `float: right; width: 45%; max-width: ${isThumb ? '350px' : '45%'}; margin: 0.3rem 0 0.3rem 1.2rem;`;
      else outerStyle = `max-width: ${isThumb ? '480px' : '800px'}; margin: 1rem auto;`;
    } else {
      if (align === "left") outerStyle = `max-width: ${isThumb ? '480px' : '800px'}; margin: 1rem 0; margin-right: auto;`;
      else if (align === "right") outerStyle = `max-width: ${isThumb ? '480px' : '800px'}; margin: 1rem 0; margin-left: auto;`;
      else outerStyle = `max-width: ${isThumb ? '480px' : '800px'}; margin: 1rem auto;`;
    }
    return `<div style="${outerStyle}"><div style="${style}"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0" allowfullscreen></iframe></div></div>`;
  };

  html = html.replace(/\[youtube(?: align=(left|right|center))?(?: wrap=(yes|no))?(?: thumb=(yes|no))?\]([a-zA-Z0-9_-]{11})\[\/youtube\]/gi, (match, align, wrap, thumb, id) => youtubeWrapper(id, align, wrap, thumb));
  html = html.replace(/\[youtube(?: align=(left|right|center))?(?: wrap=(yes|no))?(?: thumb=(yes|no))?\]https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?\[\/youtube\]/gi, (match, align, wrap, thumb, id) => youtubeWrapper(id, align, wrap, thumb));
  html = html.replace(/\[youtube(?: align=(left|right|center))?(?: wrap=(yes|no))?(?: thumb=(yes|no))?\]https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(&.*)?\[\/youtube\]/gi, (match, align, wrap, thumb, id) => youtubeWrapper(id, align, wrap, thumb));

  // 9. Lists [list] and [*]
  const parseListItems = (content: string) => {
    let items = content.trim();
    if (items.startsWith("[*]")) items = items.substring(3);
    return items.split(/\[\*\]/gi).map(item => `<li>${item.trim()}</li>`).join("");
  };

  while (/\[list\]([\s\S]*?)\[\/list\]/i.test(html)) {
    html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/i, (match, content) => {
      const cleanContent = content.replace(/\r\n|\r|\n/g, "");
      return `<ul style="margin: 0.8rem 0; padding-left: 1.5rem; list-style-type: disc;">${parseListItems(cleanContent)}</ul>`;
    });
  }
  while (/\[list=(-|1|a|i)\]([\s\S]*?)\[\/list\]/i.test(html)) {
    html = html.replace(/\[list=(-|1|a|i)\]([\s\S]*?)\[\/list\]/i, (match, type, content) => {
      let listStyle = "decimal"; let tag = "ol";
      if (type === "-") { listStyle = "dash"; tag = "ul"; }
      else if (type === "a") listStyle = "lower-alpha";
      else if (type === "i") listStyle = "lower-roman";
      const cleanContent = content.replace(/\r\n|\r|\n/g, "");
      return `<${tag} style="margin: 0.8rem 0; padding-left: 1.5rem; list-style-type: ${listStyle};">${parseListItems(cleanContent)}</${tag}>`;
    });
  }

  // 10. Tables [table], [tr], [td], [th]
  while (/\[td\]((?:(?!\[td\])[\s\S])*?)\[\/td\]/i.test(html)) {
    html = html.replace(/\[td\]((?:(?!\[td\])[\s\S])*?)\[\/td\]/i, "<td style='padding: 0.8rem; border: 1px solid var(--glass-border); vertical-align: top; color: var(--foreground);'>$1</td>");
  }
  while (/\[th\]((?:(?!\[th\])[\s\S])*?)\[\/th\]/i.test(html)) {
    html = html.replace(/\[th\]((?:(?!\[th\])[\s\S])*?)\[\/th\]/i, "<th style='padding: 0.8rem; border: 1px solid var(--glass-border); background: var(--primary-transparent); color: var(--accent); font-weight: 800; text-align: left;'>$1</th>");
  }
  while (/\[tr\]((?:(?!\[tr\])[\s\S])*?)\[\/tr\]/i.test(html)) {
    html = html.replace(/\[tr\]((?:(?!\[tr\])[\s\S])*?)\[\/tr\]/i, "<tr style='transition: background 0.2s;'>$1</tr>");
  }
  while (/\[table\]([\s\S]*?)\[\/table\]/i.test(html)) {
    html = html.replace(/\[table\]([\s\S]*?)\[\/table\]/i, (match, content) => {
      const cleanContent = content.replace(/\r\n|\r|\n/g, "");
      return `<div style="overflow-x: auto; margin: 1rem 0; border-radius: 8px; border: 1px solid var(--glass-border);"><table style="width: 100%; border-collapse: collapse; background: var(--card-bg); font-size: 0.9rem;">${cleanContent}</table></div>`;
    });
  }

  // 11. Gallery [gallery]URL1,URL2,URL3[/gallery]
  while (/\[gallery(?:=(\d))?\]([\s\S]*?)\[\/gallery\]/i.test(html)) {
    html = html.replace(/\[gallery(?:=(\d))?\]([\s\S]*?)\[\/gallery\]/i, (match, cols, content) => {
      const urls = content.trim().split(/[\n,]/).map((u: string) => u.trim()).filter((u: string) => u);
      const images = urls.map((url: string) => `<div class="bb-gallery-item"><img src="${url}" alt="Gallery" loading="lazy" /></div>`).join("");
      return `<div class="bb-gallery">${images}</div>`;
    });
  }

  // 12. Replace Smileys
  Object.entries(smileysMap).forEach(([textFace, emoji]) => {
    const escapedTextFace = textFace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escapedTextFace}(?=\\s|$)`, 'g');
    html = html.replace(regex, `$1${emoji}`);
  });
  
  // 13. Clean up newlines between block-level tags to avoid redundant <br /> gaps
  html = html.replace(/(<\/div>|<\/ul>|<\/table>|<\/details>|<\/blockquote>|<\/section>|<hr.*?>)\s*\n/gi, '$1');
  html = html.replace(/\n\s*(<div|<ul|<table|<details|<blockquote|<section|<hr)/gi, '$1');

  // 14. Replace Newlines with <br />
  html = html.replace(/\r\n|\r|\n/g, "<br />");

  return html;
}

/**
 * A simplified BBCode parser for inline elements only (titles, breadcrumbs).
 */
export function parseInlineBBCode(text: string): string {
  if (!text) return "";
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  while (/\[b\]((?:(?!\[b\])[\s\S])*?)\[\/b\]/i.test(html)) { html = html.replace(/\[b\]((?:(?!\[b\])[\s\S])*?)\[\/b\]/i, "<strong>$1</strong>"); }
  while (/\[i\]((?:(?!\[i\])[\s\S])*?)\[\/i\]/i.test(html)) { html = html.replace(/\[i\]((?:(?!\[i\])[\s\S])*?)\[\/i\]/i, "<em>$1</em>"); }
  while (/\[u\]((?:(?!\[u\])[\s\S])*?)\[\/u\]/i.test(html)) { html = html.replace(/\[u\]((?:(?!\[u\])[\s\S])*?)\[\/u\]/i, "<u>$1</u>"); }
  while (/\[s\]((?:(?!\[s\])[\s\S])*?)\[\/s\]/i.test(html)) { html = html.replace(/\[s\]((?:(?!\[s\])[\s\S])*?)\[\/s\]/i, "<s>$1</s>"); }
  while (/\[color=(.*?)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/i.test(html)) {
    html = html.replace(/\[color=(.*?)\]((?:(?!\[color=)[\s\S])*?)\[\/color\]/i, (match, color, content) => {
      const safeColor = sanitizeStyle(color, 'color') || 'inherit';
      return `<span style="color: ${safeColor}">${content}</span>`;
    });
  }
  while (/\[size=(.*?)\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i.test(html)) {
    html = html.replace(/\[size=(.*?)\]((?:(?!\[size=)[\s\S])*?)\[\/size\]/i, (match, size, content) => {
      const safeSize = sanitizeStyle(size, 'size') || 'inherit';
      return `<span style="font-size: ${safeSize}">${content}</span>`;
    });
  }
  html = html.replace(/\[hr\]/gi, " --- ");
  html = html.replace(/\[img(?: align=(?:left|right|center))?\].*?\[\/img\]/gi, "📸 Image");
  html = html.replace(/\[youtube(?: align=(?:left|right|center))?\].*?\[\/youtube\]/gi, "🎥 Vidéo");
  html = html.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, "$2");
  html = html.replace(/\[url\](.*?)\[\/url\]/gi, "$1");
  html = html.replace(/\[topic=([a-zA-Z0-9_-]+)\](.*?)\[\/topic\]/gi, "📌 $2");
  html = html.replace(/\[quote\]((?:(?!\[quote\])[\s\S])*?)\[\/quote\]/gi, "« $1 »");
  html = html.replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, "⚠️ Spoiler");
  html = html.replace(/\[spoiler=(.*?)\](.*?)\[\/spoiler\]/gi, "⚠️ Spoiler: $1");
  html = html.replace(/\[accordion=(.*?)\](.*?)\[\/accordion\]/gi, "📋 Accordion: $1");
  Object.entries(smileysMap).forEach(([textFace, emoji]) => {
    const escapedTextFace = textFace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escapedTextFace}(?=\\s|$)`, 'g');
    html = html.replace(regex, `$1${emoji}`);
  });
  return html;
}

/**
 * Removes all BBCode tags to get raw text for snippets.
 */
export function stripBBCode(text: string): string {
  if (!text) return "";
  
  // Replace [img] and [youtube] with placeholders or empty
  let plain = text
    .replace(/\[img(?:.*?)\](.*?)\[\/img\]/gi, "")
    .replace(/\[youtube(?:.*?)\](.*?)\[\/youtube\]/gi, "");
    
  // Replace tags with content
  plain = plain.replace(/\[(?:.*?)\]/gi, "");
  
  // Replace smileys with their emoji equivalent
  Object.entries(smileysMap).forEach(([textFace, emoji]) => {
    const escapedTextFace = textFace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escapedTextFace}(?=\\s|$)`, 'g');
    plain = plain.replace(regex, `$1${emoji}`);
  });

  return plain.trim();
}
