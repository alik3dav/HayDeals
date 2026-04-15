'use client';

import { useActionState, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarUpload } from '@/features/profile/components/avatar-upload';
import { updateProfileAction } from '@/features/profile/mutations';
import type { ProfileSettings, UpdateProfileState } from '@/features/profile/types';

const INITIAL_STATE: UpdateProfileState = {
  ok: false,
  message: '',
};

export function ProfileSettingsForm({ profile }: { profile: ProfileSettings }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, INITIAL_STATE);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');

  const fallbackText = useMemo(() => {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
    return name || profile.display_name || profile.username || profile.email || 'User';
  }, [profile.display_name, profile.email, profile.first_name, profile.last_name, profile.username]);

  return (
    <form action={formAction} className="space-y-4">
      <section className="space-y-3 rounded-xl border border-border/70 bg-card/60 p-4">
        <div>
          <p className="text-sm font-semibold">Profile</p>
          <p className="text-xs text-muted-foreground">Keep your account details up to date.</p>
        </div>

        <AvatarUpload disabled={isPending} fallbackText={fallbackText} onChange={setAvatarUrl} userId={profile.id} value={avatarUrl} />

        <input name="avatarUrl" type="hidden" value={avatarUrl} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs text-muted-foreground">
            <span>First name</span>
            <Input defaultValue={profile.first_name ?? ''} disabled={isPending} maxLength={60} name="firstName" placeholder="First name" />
            {state.errors?.firstName?.length ? <span className="text-destructive">{state.errors.firstName[0]}</span> : null}
          </label>

          <label className="space-y-1.5 text-xs text-muted-foreground">
            <span>Last name</span>
            <Input defaultValue={profile.last_name ?? ''} disabled={isPending} maxLength={60} name="lastName" placeholder="Last name" />
            {state.errors?.lastName?.length ? <span className="text-destructive">{state.errors.lastName[0]}</span> : null}
          </label>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">Signed in as {profile.email ?? profile.username ?? 'user'}.</p>
        <Button disabled={isPending} size="sm" type="submit">
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </section>

      {state.message ? <p className={`text-xs ${state.ok ? 'text-emerald-400' : 'text-destructive'}`}>{state.message}</p> : null}
    </form>
  );
}
