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
export function parseBBCode(text: string): string {
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
  while (/\[quote\]((?:(?!\[quote\])[\s\S])*?)\[\/quote\]/i.test(html)) {
    html = html.replace(
      /\[quote\]((?:(?!\[quote\])[\s\S])*?)\[\/quote\]/i,
      "<blockquote style='border-left:4px solid var(--primary); padding-left:1rem; margin-left:0; color:#aaa; background:rgba(255,255,255,0.05); padding:1rem; border-radius:4px;'>$1</blockquote>"
    );
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

  // 4. Replace Images
  html = html.replace(
    /\[img\](.*?)\[\/img\]/gi,
    "<img src=\"$1\" alt=\"Image\" style=\"max-width:100%; border-radius:8px; display:block; margin:0.5rem 0;\" loading=\"lazy\" />"
  );

  // 5. Replace YouTube Videos
  html = html.replace(
    /\[youtube\]([a-zA-Z0-9_-]{11})\[\/youtube\]/gi,
    "<div style=\"position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin:1rem 0; border-radius:8px;\"><iframe src=\"https://www.youtube.com/embed/$1\" style=\"position:absolute; top:0; left:0; width:100%; height:100%;\" frameborder=\"0\" allowfullscreen></iframe></div>"
  );
  
  // also support [youtube]URL[/youtube]
  html = html.replace(
    /\[youtube\]https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?\[\/youtube\]/gi,
    "<div style=\"position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin:1rem 0; border-radius:8px;\"><iframe src=\"https://www.youtube.com/embed/$1\" style=\"position:absolute; top:0; left:0; width:100%; height:100%;\" frameborder=\"0\" allowfullscreen></iframe></div>"
  );
  html = html.replace(
    /\[youtube\]https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(&.*)?\[\/youtube\]/gi,
    "<div style=\"position:relative; padding-bottom:56.25%; height:0; overflow:hidden; margin:1rem 0; border-radius:8px;\"><iframe src=\"https://www.youtube.com/embed/$1\" style=\"position:absolute; top:0; left:0; width:100%; height:100%;\" frameborder=\"0\" allowfullscreen></iframe></div>"
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

  // Strip block/media tags completely so user sees just the raw text or nothing
  html = html.replace(/\[img\].*?\[\/img\]/gi, "📸 Image");
  html = html.replace(/\[youtube\].*?\[\/youtube\]/gi, "🎥 Vidéo");
  html = html.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, "$2"); // Strip link, keep text
  html = html.replace(/\[url\](.*?)\[\/url\]/gi, "$1");
  html = html.replace(/\[topic=([a-zA-Z0-9_-]+)\](.*?)\[\/topic\]/gi, "📌 $2"); // Keep just the text and an icon
  html = html.replace(/\[quote\]((?:(?!\[quote\])[\s\S])*?)\[\/quote\]/gi, "« $1 »");

  // 3. Replace Smileys
  Object.entries(smileysMap).forEach(([textFace, emoji]) => {
    const escapedTextFace = textFace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escapedTextFace}(?=\\s|$)`, 'g');
    html = html.replace(regex, `$1${emoji}`);
  });

  return html;
}
