'use client';

import { Loader2, Upload, X } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/features/profile/components/user-avatar';
import { extractAvatarPathFromPublicUrl, removeAvatar, uploadAvatar } from '@/features/profile/upload-avatar-image';

type AvatarUploadProps = {
  userId: string;
  value: string;
  fallbackText: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
};

export function AvatarUpload({ userId, value, fallbackText, onChange, disabled }: AvatarUploadProps) {
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

    const result = await uploadAvatar(file, userId);

    setIsUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const previousPath = value ? extractAvatarPathFromPublicUrl(value) : '';

    if (previousPath) {
      void removeAvatar(previousPath);
    }

    onChange(result.publicUrl);
  };

  const onRemove = () => {
    if (disabled) {
      return;
    }

    const currentPath = value ? extractAvatarPathFromPublicUrl(value) : '';

    if (currentPath) {
      void removeAvatar(currentPath);
    }

    setError('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/70 p-3">
        <UserAvatar avatarUrl={value || null} className="h-14 w-14" fallbackText={fallbackText} textClassName="text-sm" />

        <div className="min-w-0 flex-1 text-xs text-muted-foreground">
          <p className="text-sm font-medium text-foreground">Profile avatar</p>
          <p>JPG, PNG, WEBP, AVIF · up to 2MB</p>
        </div>

        <div className="flex items-center gap-2">
          <Button disabled={disabled || isUploading} onClick={() => fileInputRef.current?.click()} size="sm" type="button" variant="outline">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
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
