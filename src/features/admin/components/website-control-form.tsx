'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { saveWebsiteControlAction } from '@/features/admin/mutations';
import type { WebsiteControlSettings, WebsiteControlState } from '@/features/admin/types';

const INITIAL_STATE: WebsiteControlState = {
  ok: false,
  message: '',
};

const LOGO_SIZE_OPTIONS = [
  { value: 'small', label: 'Small (120px)' },
  { value: 'medium', label: 'Medium (180px)' },
  { value: 'large', label: 'Large (240px)' },
  { value: 'custom', label: 'Custom size' },
] as const;

type WebsiteControlFormProps = {
  settings: WebsiteControlSettings;
};

export function WebsiteControlForm({ settings }: WebsiteControlFormProps) {
  const [state, formAction, isPending] = useActionState(saveWebsiteControlAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="logotype-url" className="text-sm font-medium leading-none">
            Logotype URL
          </label>
          <Input id="logotype-url" name="logotypeUrl" placeholder="https://cdn.example.com/logo.svg" defaultValue={settings.logotype_url ?? ''} />
        </div>
        <div className="space-y-2">
          <label htmlFor="logo-alt" className="text-sm font-medium leading-none">
            Logotype alt text
          </label>
          <Input id="logo-alt" name="logoAlt" placeholder="CipiDeals" defaultValue={settings.logo_alt ?? ''} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="logo-size" className="text-sm font-medium leading-none">
            Logotype size preset
          </label>
          <Select id="logo-size" defaultValue={settings.logo_size} name="logoSize">
            {LOGO_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="primary-color" className="text-sm font-medium leading-none">
            Primary color
          </label>
          <Input id="primary-color" name="primaryColor" type="color" defaultValue={settings.primary_color} className="h-10 w-full p-1" />
        </div>

        <div className="space-y-2">
          <label htmlFor="accent-color" className="text-sm font-medium leading-none">
            Accent color
          </label>
          <Input id="accent-color" name="accentColor" type="color" defaultValue={settings.accent_color} className="h-10 w-full p-1" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="site-announcement" className="text-sm font-medium leading-none">
          Global announcement banner
        </label>
        <Textarea
          id="site-announcement"
          name="siteAnnouncement"
          placeholder="Write a short message for all visitors (e.g., seasonal promo)."
          rows={3}
          defaultValue={settings.site_announcement ?? ''}
        />
      </div>

      <div className="space-y-3 rounded-md border border-border/70 p-4">
        <h3 className="text-sm font-semibold text-foreground">Sidebar ad settings</h3>
        <p className="text-xs text-muted-foreground">Control the sidebar ad image and optional text shown on the public homepage.</p>

        <div className="space-y-2">
          <label htmlFor="sidebar-ad-background-image-url" className="text-sm font-medium leading-none">
            Ad background image URL
          </label>
          <Input
            id="sidebar-ad-background-image-url"
            name="sidebarAdBackgroundImageUrl"
            placeholder="https://cdn.example.com/ads/sidebar-promo.jpg"
            defaultValue={settings.sidebar_ad_background_image_url ?? ''}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="sidebar-ad-title" className="text-sm font-medium leading-none">
              Ad title text
            </label>
            <Input id="sidebar-ad-title" name="sidebarAdTitle" placeholder="Build your stack with vetted tools" defaultValue={settings.sidebar_ad_title ?? ''} />
          </div>

          <div className="space-y-2">
            <label htmlFor="sidebar-ad-button-text" className="text-sm font-medium leading-none">
              Ad button text
            </label>
            <Input id="sidebar-ad-button-text" name="sidebarAdButtonText" placeholder="Explore picks" defaultValue={settings.sidebar_ad_button_text ?? ''} />
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
            defaultValue={settings.sidebar_ad_description ?? ''}
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-foreground">
          <input defaultChecked={settings.sidebar_ad_image_only} name="sidebarAdImageOnly" type="checkbox" />
          Show only image (hide title, description, and button)
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Branding changes are saved to Supabase website settings.</p>
        <Button disabled={isPending} type="submit">
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {state.message ? <p className={`text-xs ${state.ok ? 'text-emerald-400' : 'text-destructive'}`}>{state.message}</p> : null}
    </form>
  );
}
