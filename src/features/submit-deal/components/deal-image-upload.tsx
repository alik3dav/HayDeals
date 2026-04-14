'use client';

import { ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { type ChangeEvent, type DragEvent, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { removeDealImage, uploadDealImage } from '@/features/submit-deal/upload-deal-image';

type DealImageUploadProps = {
  value: string;
  onChange: (nextUrl: string) => void;
  error?: string;
};

export function DealImageUpload({ value, onChange, error }: DealImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedPath, setUploadedPath] = useState('');


  const resolvedError = useMemo(() => error || uploadError, [error, uploadError]);

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    setUploadError('');
    setIsUploading(true);

    const result = await uploadDealImage(file);

    setIsUploading(false);

    if (!result.ok) {
      setUploadError(result.error);
      return;
    }

    if (uploadedPath) {
      void removeDealImage(uploadedPath);
    }

    setUploadedPath(result.path);
    onChange(result.publicUrl);
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFileUpload(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    await handleFileUpload(event.dataTransfer.files?.[0] ?? null);
  };

  const onRemove = () => {
    if (uploadedPath) {
      void removeDealImage(uploadedPath);
      setUploadedPath('');
    }

    setUploadError('');
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border border-border/70 bg-secondary/30 transition-colors',
          isDragActive && 'border-primary/60 bg-primary/5',
          resolvedError && 'border-destructive/60',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={onDrop}
      >
        {value ? (
          <div className="relative aspect-square w-full max-h-72 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Deal upload preview" className="h-full w-full object-cover" src={value} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button onClick={() => fileInputRef.current?.click()} size="sm" type="button" variant="secondary">
                Replace
              </Button>
              <Button onClick={onRemove} size="icon" type="button" variant="destructive">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            className="flex aspect-square max-h-72 w-full flex-col items-center justify-center gap-3 px-4 py-8 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            <div className="space-y-1">
              <p className="font-medium text-foreground">Upload main deal image</p>
              <p>Drag and drop or click to upload</p>
              <p className="text-xs">JPG, PNG, WEBP, AVIF · max 5MB</p>
            </div>
          </button>
        )}

        {isUploading ? (
          <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-background/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
            <Upload className="h-3.5 w-3.5 animate-pulse" />
            Uploading image...
          </div>
        ) : null}
      </div>

      <input className="hidden" onChange={onFileChange} ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" />

      {resolvedError ? <p className="text-xs text-destructive">{resolvedError}</p> : null}
    </div>
  );
}
