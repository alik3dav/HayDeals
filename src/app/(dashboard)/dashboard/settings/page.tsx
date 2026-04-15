import { DashboardPageHeader } from '@/features/dashboard/components/dashboard-shared';
import { ProfileSettingsForm } from '@/features/profile/components/profile-settings-form';
import { getProfileSettings } from '@/features/profile/queries';
import { requireUser } from '@/lib/auth/session';

export default async function DashboardSettingsPage() {
  const user = await requireUser();
  const profile = await getProfileSettings(user.id);

  if (!profile) {
    throw new Error('Profile was not found for authenticated user.');
  }

  return (
    <div className="space-y-3">
      <DashboardPageHeader title="Account settings" description="Manage your profile details and avatar." />
      <ProfileSettingsForm profile={profile} />
    </div>
  );
}
