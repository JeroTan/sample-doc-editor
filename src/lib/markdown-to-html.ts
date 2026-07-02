type ListState = {
  type: "ol" | "ul";
  items: string[];
};

export function markdownToHtml(markdown: string) {
  const normalized = markdown.replace(/\r\n?/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  const html: string[] = [];
  const paragraph: string[] = [];
  let list: ListState | null = null;
  let codeLines: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }

    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  }

  function flushList() {
    if (!list) {
      return;
    }

    html.push(`<${list.type}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  }

  function flushCode() {
    if (!codeLines) {
      return;
    }

    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    codeLines = null;
  }

  for (const line of normalized.split("\n")) {
    if (codeLines) {
      if (/^```/u.test(line.trim())) {
        flushCode();
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (/^```/u.test(line.trim())) {
      flushParagraph();
      flushList();
      codeLines = [];
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/u.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      html.push(`<h${heading[1].length}>${renderInline(heading[2].trim())}</h${heading[1].length}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/u.test(line.trim())) {
      flushParagraph();
      flushList();
      html.push("<hr>");
      continue;
    }

    const quote = /^>\s?(.*)$/u.exec(line);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${renderInline(quote[1].trim())}</blockquote>`);
      continue;
    }

    const unordered = /^\s*[-*+]\s+(.+)$/u.exec(line);
    const ordered = /^\s*\d+[.)]\s+(.+)$/u.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      const type = ordered ? "ol" : "ul";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((unordered?.[1] ?? ordered?.[1] ?? "").trim());
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushCode();

  return html.join("");
}

function renderInline(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/gu, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/gu, "<strong>$1</strong>")
    .replace(/__([^_]+)__/gu, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/gu, "<del>$1</del>")
    .replace(/\*([^*]+)\*/gu, "<em>$1</em>")
    .replace(/_([^_]+)_/gu, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gu, (_match, label: string, href: string) => {
      const safeHref = sanitizeHref(href);
      return `<a href="${safeHref}" target="_blank" rel="noreferrer">${label}</a>`;
    });
}

function sanitizeHref(value: string) {
  const trimmed = value.trim();
  if (/^(https?:|mailto:|\/|#)/iu.test(trimmed)) {
    return trimmed.replace(/"/g, "&quot;");
  }

  return "#";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
