'use client';

import { Loader2, Upload, X } from 'lucide-react';
import { useActionState, useRef, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { saveSidebarAdControlAction } from '@/features/admin/mutations';
import type { WebsiteControlSettings, WebsiteControlState } from '@/features/admin/types';
import {
  extractSidebarAdPathFromPublicUrl,
  removeSidebarAdImage,
  uploadSidebarAdImage,
} from '@/features/admin/upload-sidebar-ad-image';
import { SidebarAdModule } from '@/features/deals/components/sidebar-ad-module';

const INITIAL_STATE: WebsiteControlState = {
  ok: false,
  message: '',
};

type AdControlFormProps = {
  settings: WebsiteControlSettings;
};

export function AdControlForm({ settings }: AdControlFormProps) {
  const [state, formAction, isPending] = useActionState(saveSidebarAdControlAction, INITIAL_STATE);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(settings.sidebar_ad_background_image_url ?? '');
  const [adHref, setAdHref] = useState(settings.sidebar_ad_href ?? '');
  const [adTitle, setAdTitle] = useState(settings.sidebar_ad_title ?? '');
  const [adDescription, setAdDescription] = useState(settings.sidebar_ad_description ?? '');
  const [adButtonText, setAdButtonText] = useState(settings.sidebar_ad_button_text ?? '');
  const [adImageOnly, setAdImageOnly] = useState(settings.sidebar_ad_image_only);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    setUploadError('');
    setIsUploading(true);

    const result = await uploadSidebarAdImage(file);
    setIsUploading(false);

    if (!result.ok) {
      setUploadError(result.error);
      return;
    }

    const previousPath = backgroundImageUrl ? extractSidebarAdPathFromPublicUrl(backgroundImageUrl) : '';
    if (previousPath) {
      void removeSidebarAdImage(previousPath);
    }

    setBackgroundImageUrl(result.publicUrl);
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFileUpload(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const onRemove = () => {
    const previousPath = backgroundImageUrl ? extractSidebarAdPathFromPublicUrl(backgroundImageUrl) : '';

    if (previousPath) {
      void removeSidebarAdImage(previousPath);
    }

    setUploadError('');
    setBackgroundImageUrl('');
  };

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Ad image (strict 5:3 ratio)</label>
        <div className="rounded-lg border border-border/70 bg-card/70 p-3">
          <div className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-md border border-border/70 bg-secondary/30 aspect-[5/3]">
            {backgroundImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Sidebar ad" className="h-full w-full object-cover" src={backgroundImageUrl} />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted-foreground">Upload an ad image for preview.</div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button disabled={isUploading || isPending} onClick={() => fileInputRef.current?.click()} size="sm" type="button" variant="outline">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {backgroundImageUrl ? 'Replace image' : 'Upload image'}
            </Button>

            {backgroundImageUrl ? (
              <Button disabled={isUploading || isPending} onClick={onRemove} size="sm" type="button" variant="ghost">
                <X className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>

          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={onFileChange}
            ref={fileInputRef}
            type="file"
          />

          {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
        </div>
      </div>

      <input name="sidebarAdBackgroundImageUrl" type="hidden" value={backgroundImageUrl} />

      <div className="space-y-2">
        <label htmlFor="sidebar-ad-href" className="text-sm font-medium leading-none">
          Ad URL
        </label>
        <Input
          id="sidebar-ad-href"
          name="sidebarAdHref"
          placeholder="https://example.com/promo"
          value={adHref}
          onChange={(event) => setAdHref(event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="sidebar-ad-title" className="text-sm font-medium leading-none">
            Ad title text
          </label>
          <Input
            id="sidebar-ad-title"
            name="sidebarAdTitle"
            placeholder="Build your stack with vetted tools"
            value={adTitle}
            onChange={(event) => setAdTitle(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sidebar-ad-button-text" className="text-sm font-medium leading-none">
            Ad button text
          </label>
          <Input
            id="sidebar-ad-button-text"
            name="sidebarAdButtonText"
            placeholder="Explore picks"
            value={adButtonText}
            onChange={(event) => setAdButtonText(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="sidebar-ad-description" className="text-sm font-medium leading-none">
          Ad description text
        </label>
        <Textarea
          id="sidebar-ad-description"
          name="sidebarAdDescription"
          placeholder="Describe the promotion shown in the sidebar ad."
          rows={3}
          value={adDescription}
          onChange={(event) => setAdDescription(event.target.value)}
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-foreground">
        <input checked={adImageOnly} name="sidebarAdImageOnly" onChange={(event) => setAdImageOnly(event.target.checked)} type="checkbox" />
        Show only image (hide title, description, and button)
      </label>

      <div className="space-y-2 rounded-md border border-border/70 p-3">
        <p className="text-xs font-medium text-foreground">Preview</p>
        <div className="max-w-[260px]">
          <SidebarAdModule
            ad={{
              id: 'preview-sidebar-ad',
              href: adHref || '/',
              title: adTitle || 'Ad title',
              description: adDescription || 'Ad description',
              ctaLabel: adButtonText || 'Learn more',
              backgroundImageUrl: backgroundImageUrl || undefined,
              imageOnly: adImageOnly,
              label: 'Preview',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Ad settings are saved to Supabase and displayed in the homepage sidebar.</p>
        <Button disabled={isPending || isUploading} type="submit">
          {isPending ? 'Saving…' : 'Save ad settings'}
        </Button>
      </div>

      {state.message ? <p className={`text-xs ${state.ok ? 'text-emerald-400' : 'text-destructive'}`}>{state.message}</p> : null}
    </form>
  );
}
