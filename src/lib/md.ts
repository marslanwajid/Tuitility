import { marked } from 'marked';

export function encodeEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const renderer = {
  heading(this: any, { tokens, depth, text }: { tokens: any[]; depth: number; text: string }) {
    const htmlText = this.parser.parseInline(tokens);
    const id = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\u4e00-\u9fa5\-]+/g, '-');
    return `
      <h${depth} id="${id}">
        <a class="anchor" aria-hidden="true" href="#${id}">
          <svg class="octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0 0-4.95.751.751 0 0 0-1.042.018.751.751 0 0 0-.018 1.042 1.998 1.998 0 0 1 0 2.83l-2.5 2.5a2.002 2.002 0 0 1-2.83-2.83l1.25-1.25a.751.751 0 0 0-.018-1.042.751.751 0 0 0-1.042-.018l-1.25 1.25a3.5 3.5 0 0 0 0 4.95Z"></path>
          </svg>
        </a>
        ${htmlText}
      </h${depth}>
    `;
  }
};

marked.use({ renderer });

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function markdownToHtml(md: string): string {
  try {
    return marked.parse(md) as string;
  } catch {
    return '<p style="color:#ef4444">Failed to parse markdown.</p>';
  }
}
