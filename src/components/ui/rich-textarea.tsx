'use client';

import { useRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type RichTextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  className?: string;
  hintClassName?: string;
};

function updateTextareaValue(textarea: HTMLTextAreaElement, nextValue: string, selectionStart: number, selectionEnd: number) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  nativeInputValueSetter?.call(textarea, nextValue);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.setSelectionRange(selectionStart, selectionEnd);
  textarea.focus();
}

export function RichTextArea({ className, hintClassName, ...props }: RichTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selected = textarea.value.slice(selectionStart, selectionEnd);
    const wrappedText = `${prefix}${selected || 'text'}${suffix}`;
    const nextValue = `${textarea.value.slice(0, selectionStart)}${wrappedText}${textarea.value.slice(selectionEnd)}`;
    const cursorStart = selectionStart + prefix.length;
    const cursorEnd = cursorStart + (selected || 'text').length;

    updateTextareaValue(textarea, nextValue, cursorStart, cursorEnd);
  };

  const insertListPrefix = (prefix: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = textarea.value.slice(selectionStart, selectionEnd);
    const fallbackText = prefix === '- ' ? '- item' : '1. item';
    const nextText = selectedText
      ? selectedText
          .split('\n')
          .map((line) => `${prefix}${line}`)
          .join('\n')
      : fallbackText;

    const nextValue = `${textarea.value.slice(0, selectionStart)}${nextText}${textarea.value.slice(selectionEnd)}`;
    const nextSelectionStart = selectionStart;
    const nextSelectionEnd = selectionStart + nextText.length;

    updateTextareaValue(textarea, nextValue, nextSelectionStart, nextSelectionEnd);
  };

  const insertLinkTemplate = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selected = textarea.value.slice(selectionStart, selectionEnd) || 'link text';
    const template = `[${selected}](https://)`;
    const nextValue = `${textarea.value.slice(0, selectionStart)}${template}${textarea.value.slice(selectionEnd)}`;
    const cursorStart = selectionStart + selected.length + 3;
    const cursorEnd = cursorStart + 8;

    updateTextareaValue(textarea, nextValue, cursorStart, cursorEnd);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        <button className="rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground" onClick={() => wrapSelection('**')} type="button">
          Bold
        </button>
        <button className="rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground" onClick={() => wrapSelection('*')} type="button">
          Italic
        </button>
        <button className="rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground" onClick={() => insertListPrefix('- ')} type="button">
          List
        </button>
        <button className="rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground" onClick={() => insertListPrefix('1. ')} type="button">
          Numbered
        </button>
        <button className="rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground" onClick={insertLinkTemplate} type="button">
          Link
        </button>
        <button className="rounded border border-border/70 px-2 py-1 text-xs text-muted-foreground transition hover:text-foreground" onClick={() => insertListPrefix('> ')} type="button">
          Quote
        </button>
      </div>

      <textarea
        {...props}
        className={cn('min-h-24 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm leading-relaxed', className)}
        ref={textareaRef}
      />

      <p className={cn('text-[11px] text-muted-foreground', hintClassName)}>
        Supports paragraphs, line breaks, **bold**, *italic*, lists, links ([text](https://)), and block quotes (&gt; quote).
      </p>
    </div>
  );
}
