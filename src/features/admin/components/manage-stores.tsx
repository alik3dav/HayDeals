import { upsertStoreAction } from '@/features/admin/mutations';
import type { AdminStore } from '@/features/admin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ManageStores({ stores }: { stores: AdminStore[] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add store</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertStoreAction} className="grid gap-2 md:grid-cols-5">
            <Input name="name" placeholder="Store name" required />
            <Input name="slug" placeholder="store-slug" required />
            <Input name="websiteUrl" placeholder="https://..." />
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked name="isActive" type="checkbox" /> Active
            </label>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing stores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stores.map((item) => (
            <form key={item.id} action={upsertStoreAction} className="grid gap-2 rounded-md border p-2 md:grid-cols-5">
              <input name="id" type="hidden" value={item.id} />
              <Input defaultValue={item.name} name="name" required />
              <Input defaultValue={item.slug} name="slug" required />
              <Input defaultValue={item.website_url ?? ''} name="websiteUrl" />
              <label className="flex items-center gap-2 text-sm">
                <input defaultChecked={item.is_active} name="isActive" type="checkbox" /> Active
              </label>
              <Button size="sm" type="submit" variant="secondary">
                Save
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
