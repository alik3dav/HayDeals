import { cn } from '@/lib/utils';
import { renderFormattedContent } from '@/lib/text-formatting';

type FormattedTextProps = {
  content: string;
  className?: string;
  compact?: boolean;
};

export function FormattedText({ content, className, compact = false }: FormattedTextProps) {
  const renderedContent = renderFormattedContent(content);

  if (!renderedContent.length) {
    return null;
  }

  return (
    <div className={cn('space-y-3 text-sm', compact ? 'space-y-2 text-[13px]' : null, className)}>
      {renderedContent}
    </div>
  );
}
