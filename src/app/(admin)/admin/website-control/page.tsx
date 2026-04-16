import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { WebsiteControlForm } from '@/features/admin/components/website-control-form';
import type { WebsiteControlSettings } from '@/features/admin/types';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_SETTINGS: WebsiteControlSettings = {
  logotype_url: null,
  logo_alt: null,
  logo_size: 'medium',
  primary_color: '#22c55e',
  accent_color: '#0f172a',
  site_announcement: null,
  sidebar_ad_background_image_url: null,
  sidebar_ad_title: null,
  sidebar_ad_description: null,
  sidebar_ad_button_text: null,
  sidebar_ad_image_only: false,
};

export default async function AdminWebsiteControlPage() {
  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from('website_control_settings')
    .select(
      'logotype_url, logo_alt, logo_size, primary_color, accent_color, site_announcement, sidebar_ad_background_image_url, sidebar_ad_title, sidebar_ad_description, sidebar_ad_button_text, sidebar_ad_image_only',
    )
    .eq('id', 1)
    .maybeSingle();

  const settings: WebsiteControlSettings = settingsRow
    ? {
        logotype_url: settingsRow.logotype_url,
        logo_alt: settingsRow.logo_alt,
        logo_size: settingsRow.logo_size,
        primary_color: settingsRow.primary_color,
        accent_color: settingsRow.accent_color,
        site_announcement: settingsRow.site_announcement,
        sidebar_ad_background_image_url: settingsRow.sidebar_ad_background_image_url,
        sidebar_ad_title: settingsRow.sidebar_ad_title,
        sidebar_ad_description: settingsRow.sidebar_ad_description,
        sidebar_ad_button_text: settingsRow.sidebar_ad_button_text,
        sidebar_ad_image_only: settingsRow.sidebar_ad_image_only ?? false,
      }
    : DEFAULT_SETTINGS;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Website control"
        description="Configure global branding settings like logo, colors, and homepage presentation."
      />

      <Card>
        <CardHeader>
          <CardTitle>Brand settings</CardTitle>
          <CardDescription>Manage visual identity and basic display preferences for the public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <WebsiteControlForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
