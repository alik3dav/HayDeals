import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type EntityRecord = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  website_url?: string | null;
};

type EntityUpsertPanelProps<T extends EntityRecord> = {
  action: (formData: FormData) => void;
  createTitle: string;
  existingTitle: string;
  columnsClassName: string;
  includeWebsiteUrl?: boolean;
  namePlaceholder: string;
  slugPlaceholder: string;
  items: T[];
};

function WebsiteInput({ defaultValue }: { defaultValue?: string }) {
  return <Input defaultValue={defaultValue} name="websiteUrl" placeholder="https://..." />;
}

export function EntityUpsertPanel<T extends EntityRecord>({
  action,
  createTitle,
  existingTitle,
  columnsClassName,
  includeWebsiteUrl = false,
  namePlaceholder,
  slugPlaceholder,
  items,
}: EntityUpsertPanelProps<T>) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{createTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className={columnsClassName}>
            <Input name="name" placeholder={namePlaceholder} required />
            <Input name="slug" placeholder={slugPlaceholder} required />
            {includeWebsiteUrl ? <WebsiteInput /> : null}
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked name="isActive" type="checkbox" /> Active
            </label>
            <Button className="max-md:w-full" type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{existingTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <form action={action} className={`${columnsClassName} rounded-md border p-2`} key={item.id}>
              <input name="id" type="hidden" value={item.id} />
              <Input defaultValue={item.name} name="name" required />
              <Input defaultValue={item.slug} name="slug" required />
              {includeWebsiteUrl ? <WebsiteInput defaultValue={item.website_url ?? ''} /> : null}
              <label className="flex items-center gap-2 text-sm">
                <input defaultChecked={item.is_active} name="isActive" type="checkbox" /> Active
              </label>
              <Button className="max-md:w-full" size="sm" type="submit" variant="secondary">
                Save
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
