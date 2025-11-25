import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';

const RICH_TEXT_ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  'u',
  's',
  'span',
  'br',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
];

const RICH_TEXT_ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style'];

const baseConfig: DOMPurifyConfig = {
  ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
  ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
  FORBID_TAGS: ['script', 'style'],
};

export const sanitizeRichText = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, baseConfig);
};

export const getPlainTextFromRichText = (html: string): string => {
  if (!html) return '';

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  return html.replace(/<[^>]+>/g, ' ');
};

export const richTextHasContent = (html: string): boolean => {
  const plain = getPlainTextFromRichText(html)
    .replace(/\u00a0/g, ' ')
    .trim();
  return plain.length > 0;
};


