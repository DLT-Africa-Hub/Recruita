import { sanitizeRichText } from '../../utils/richText';

interface RichTextContentProps {
  html?: string | null;
  className?: string;
  emptyPlaceholder?: string;
}

const RichTextContent = ({
  html,
  className = '',
  emptyPlaceholder = 'No description available.',
}: RichTextContentProps) => {
  if (!html) {
    return (
      <p className={`text-[#1C1C1CBF] text-[16px] leading-relaxed ${className}`}>
        {emptyPlaceholder}
      </p>
    );
  }

  const sanitizedHtml = sanitizeRichText(html);

  return (
    <div
      className={`rich-text-content text-[#1C1C1CBF] text-[16px] leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default RichTextContent;


