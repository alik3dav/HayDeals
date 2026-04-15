'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { saveWebsiteControlAction } from '@/features/admin/mutations';
import type { WebsiteControlState } from '@/features/admin/types';

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

export function WebsiteControlForm() {
  const [state, formAction, isPending] = useActionState(saveWebsiteControlAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="logotype-url" className="text-sm font-medium leading-none">
            Logotype URL
          </label>
          <Input id="logotype-url" name="logotypeUrl" placeholder="https://cdn.example.com/logo.svg" />
        </div>
        <div className="space-y-2">
          <label htmlFor="logo-alt" className="text-sm font-medium leading-none">
            Logotype alt text
          </label>
          <Input id="logo-alt" name="logoAlt" placeholder="HayDeals" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="logo-size" className="text-sm font-medium leading-none">
            Logotype size preset
          </label>
          <Select id="logo-size" defaultValue="medium" name="logoSize">
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
          <Input id="primary-color" name="primaryColor" type="color" defaultValue="#22c55e" className="h-10 w-full p-1" />
        </div>

        <div className="space-y-2">
          <label htmlFor="accent-color" className="text-sm font-medium leading-none">
            Accent color
          </label>
          <Input id="accent-color" name="accentColor" type="color" defaultValue="#0f172a" className="h-10 w-full p-1" />
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
        />
      </div>

      <div className="rounded-md border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        Save behavior can be connected to a settings table or CMS endpoint when backend persistence is ready.
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Use save to keep your branding updates once persistence is connected.</p>
        <Button disabled={isPending} type="submit">
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {state.message ? <p className={`text-xs ${state.ok ? 'text-emerald-400' : 'text-destructive'}`}>{state.message}</p> : null}
    </form>
  );
}
