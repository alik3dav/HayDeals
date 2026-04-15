import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { WebsiteControlForm } from '@/features/admin/components/website-control-form';

export default function AdminWebsiteControlPage() {
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
          <WebsiteControlForm />
        </CardContent>
      </Card>
    </div>
  );
}
