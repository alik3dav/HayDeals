import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';

const LOGO_SIZE_OPTIONS = [
  { value: 'small', label: 'Small (120px)' },
  { value: 'medium', label: 'Medium (180px)' },
  { value: 'large', label: 'Large (240px)' },
  { value: 'custom', label: 'Custom size' },
] as const;

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
              <Select id="logo-size" defaultValue="medium">
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
        </CardContent>
      </Card>
    </div>
  );
}
