'use client';

import { Loader2, Upload, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  extractStoreLogoPathFromPublicUrl,
  removeStoreLogo,
  uploadStoreLogo,
} from '@/features/admin/upload-store-logo';

type StoreLogoUploadProps = {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
};

export function StoreLogoUpload({ value, onChange, disabled }: StoreLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!file || disabled) {
      return;
    }

    setError('');
    setIsUploading(true);

    const result = await uploadStoreLogo(file);

    setIsUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const previousPath = value ? extractStoreLogoPathFromPublicUrl(value) : '';

    if (previousPath) {
      void removeStoreLogo(previousPath);
    }

    onChange(result.publicUrl);
  };

  const onRemove = () => {
    if (disabled) {
      return;
    }

    const currentPath = value ? extractStoreLogoPathFromPublicUrl(value) : '';

    if (currentPath) {
      void removeStoreLogo(currentPath);
    }

    setError('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/70 p-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border/70 bg-muted/30">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Store logo" className="h-full w-full object-cover" src={value} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">1:1</div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-xs text-muted-foreground">
          <p className="text-sm font-medium text-foreground">Store logo icon</p>
          <p>Square logo · JPG, PNG, WEBP, AVIF · up to 2MB</p>
        </div>

        <div className="flex items-center gap-2">
          <Button disabled={disabled || isUploading} onClick={() => fileInputRef.current?.click()} size="sm" type="button" variant="outline">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {value ? 'Replace' : 'Upload'}
          </Button>

          {value ? (
            <Button disabled={disabled || isUploading} onClick={onRemove} size="icon" type="button" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <input
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={onFileSelected}
        ref={fileInputRef}
        type="file"
      />

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
