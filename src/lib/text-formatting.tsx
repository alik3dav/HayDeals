import type { ReactNode } from 'react';

const LINK_PROTOCOL_ALLOWLIST = new Set(['http:', 'https:', 'mailto:']);

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] };

function sanitizeLinkUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmedUrl, 'https://haydeals.local');

    if (!LINK_PROTOCOL_ALLOWLIST.has(parsedUrl.protocol)) {
      return null;
    }

    if (parsedUrl.protocol === 'mailto:') {
      return `mailto:${parsedUrl.pathname}${parsedUrl.search}`;
    }

    return parsedUrl.href;
  } catch {
    return null;
  }
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];

  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const rawLine = lines[lineIndex];
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      lineIndex += 1;
      continue;
    }

    if (trimmedLine.startsWith('>')) {
      const quoteLines: string[] = [];

      while (lineIndex < lines.length) {
        const quoteLine = lines[lineIndex].trim();
        if (!quoteLine.startsWith('>')) {
          break;
        }

        quoteLines.push(quoteLine.replace(/^>\s?/, ''));
        lineIndex += 1;
      }

      blocks.push({ type: 'blockquote', lines: quoteLines });
      continue;
    }

    const unorderedMatch = trimmedLine.match(/^[-*]\s+(.+)/);
    if (unorderedMatch) {
      const items: string[] = [];

      while (lineIndex < lines.length) {
        const listLine = lines[lineIndex].trim();
        const listMatch = listLine.match(/^[-*]\s+(.+)/);
        if (!listMatch) {
          break;
        }

        items.push(listMatch[1]);
        lineIndex += 1;
      }

      blocks.push({ type: 'unordered-list', items });
      continue;
    }

    const orderedMatch = trimmedLine.match(/^\d+\.\s+(.+)/);
    if (orderedMatch) {
      const items: string[] = [];

      while (lineIndex < lines.length) {
        const listLine = lines[lineIndex].trim();
        const listMatch = listLine.match(/^\d+\.\s+(.+)/);
        if (!listMatch) {
          break;
        }

        items.push(listMatch[1]);
        lineIndex += 1;
      }

      blocks.push({ type: 'ordered-list', items });
      continue;
    }

    const paragraphLines: string[] = [];

    while (lineIndex < lines.length) {
      const nextLine = lines[lineIndex];
      const nextTrimmedLine = nextLine.trim();

      if (!nextTrimmedLine) {
        break;
      }

      if (/^>/.test(nextTrimmedLine) || /^[-*]\s+/.test(nextTrimmedLine) || /^\d+\.\s+/.test(nextTrimmedLine)) {
        break;
      }

      paragraphLines.push(nextLine);
      lineIndex += 1;
    }

    blocks.push({ type: 'paragraph', lines: paragraphLines });
  }

  return blocks;
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let linkMatch = linkPattern.exec(text);

  while (linkMatch) {
    if (linkMatch.index > lastIndex) {
      parts.push(...parseEmphasis(text.slice(lastIndex, linkMatch.index), `${keyPrefix}-inline-${lastIndex}`));
    }

    const [, label, rawUrl] = linkMatch;
    const safeUrl = sanitizeLinkUrl(rawUrl);

    if (safeUrl) {
      parts.push(
        <a className="text-primary underline-offset-2 hover:underline" href={safeUrl} key={`${keyPrefix}-link-${linkMatch.index}`} rel="noreferrer noopener" target="_blank">
          {parseEmphasis(label, `${keyPrefix}-label-${linkMatch.index}`)}
        </a>,
      );
    } else {
      parts.push(...parseEmphasis(linkMatch[0], `${keyPrefix}-unsafe-${linkMatch.index}`));
    }

    lastIndex = linkPattern.lastIndex;
    linkMatch = linkPattern.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push(...parseEmphasis(text.slice(lastIndex), `${keyPrefix}-tail`));
  }

  return parts;
}

function parseEmphasis(text: string, keyPrefix: string): ReactNode[] {
  const strongPattern = /\*\*([^*]+)\*\*/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match = strongPattern.exec(text);

  while (match) {
    if (match.index > cursor) {
      nodes.push(...parseItalic(text.slice(cursor, match.index), `${keyPrefix}-strong-text-${cursor}`));
    }

    nodes.push(
      <strong className="font-semibold text-foreground" key={`${keyPrefix}-strong-${match.index}`}>
        {parseItalic(match[1], `${keyPrefix}-strong-inner-${match.index}`)}
      </strong>,
    );

    cursor = strongPattern.lastIndex;
    match = strongPattern.exec(text);
  }

  if (cursor < text.length) {
    nodes.push(...parseItalic(text.slice(cursor), `${keyPrefix}-end`));
  }

  return nodes;
}

function parseItalic(text: string, keyPrefix: string): ReactNode[] {
  const italicPattern = /(\*|_)([^*_]+)\1/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match = italicPattern.exec(text);

  while (match) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    nodes.push(
      <em className="italic text-foreground/95" key={`${keyPrefix}-italic-${match.index}`}>
        {match[2]}
      </em>,
    );

    cursor = italicPattern.lastIndex;
    match = italicPattern.exec(text);
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export function renderFormattedContent(content: string, keyPrefix = 'formatted'): ReactNode[] {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return [];
  }

  const blocks = parseBlocks(normalizedContent);

  return blocks.map((block, index) => {
    const key = `${keyPrefix}-block-${index}`;

    if (block.type === 'paragraph') {
      return (
        <p className="leading-relaxed text-muted-foreground" key={key}>
          {block.lines.map((line, lineIndex) => (
            <span key={`${key}-line-${lineIndex}`}>
              {lineIndex > 0 ? <br /> : null}
              {parseInline(line, `${key}-line-content-${lineIndex}`)}
            </span>
          ))}
        </p>
      );
    }

    if (block.type === 'blockquote') {
      return (
        <blockquote className="border-l-2 border-primary/40 pl-3 text-muted-foreground" key={key}>
          {block.lines.map((line, lineIndex) => (
            <p className="leading-relaxed" key={`${key}-line-${lineIndex}`}>
              {parseInline(line, `${key}-quote-${lineIndex}`)}
            </p>
          ))}
        </blockquote>
      );
    }

    if (block.type === 'unordered-list') {
      return (
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground" key={key}>
          {block.items.map((item, itemIndex) => (
            <li className="leading-relaxed" key={`${key}-item-${itemIndex}`}>
              {parseInline(item, `${key}-item-inline-${itemIndex}`)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ol className="list-decimal space-y-1 pl-5 text-muted-foreground" key={key}>
        {block.items.map((item, itemIndex) => (
          <li className="leading-relaxed" key={`${key}-item-${itemIndex}`}>
            {parseInline(item, `${key}-item-inline-${itemIndex}`)}
          </li>
        ))}
      </ol>
    );
  });
}

export function toPlainText(content: string) {
  return content
    .replace(/\r\n?/g, '\n')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(\*|_)([^*_]+)\1/g, '$2')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .trim();
}
