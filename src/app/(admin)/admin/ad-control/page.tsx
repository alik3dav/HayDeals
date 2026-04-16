import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { AdControlForm } from '@/features/admin/components/ad-control-form';
import type { WebsiteControlSettings } from '@/features/admin/types';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_SETTINGS: WebsiteControlSettings = {
  logotype_url: null,
  logo_alt: null,
  logo_size: 'medium',
  primary_color: '#34d399',
  accent_color: '#121826',
  site_announcement: null,
  sidebar_ad_background_image_url: null,
  sidebar_ad_title: null,
  sidebar_ad_description: null,
  sidebar_ad_button_text: null,
  sidebar_ad_href: null,
  sidebar_ad_image_only: false,
};

export default async function AdminAdControlPage() {
  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from('website_control_settings')
    .select('sidebar_ad_background_image_url, sidebar_ad_title, sidebar_ad_description, sidebar_ad_button_text, sidebar_ad_href, sidebar_ad_image_only')
    .eq('id', 1)
    .maybeSingle();

  const settings: WebsiteControlSettings = settingsRow
    ? {
        ...DEFAULT_SETTINGS,
        sidebar_ad_background_image_url: settingsRow.sidebar_ad_background_image_url,
        sidebar_ad_title: settingsRow.sidebar_ad_title,
        sidebar_ad_description: settingsRow.sidebar_ad_description,
        sidebar_ad_button_text: settingsRow.sidebar_ad_button_text,
        sidebar_ad_href: settingsRow.sidebar_ad_href,
        sidebar_ad_image_only: settingsRow.sidebar_ad_image_only ?? false,
      }
    : DEFAULT_SETTINGS;

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Ad control" description="Manage the homepage sidebar ad, image upload, overlay content, and destination URL." />

      <Card>
        <CardHeader>
          <CardTitle>Sidebar ad settings</CardTitle>
          <CardDescription>Upload ad media to Supabase storage and configure text/button overlay content.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdControlForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
