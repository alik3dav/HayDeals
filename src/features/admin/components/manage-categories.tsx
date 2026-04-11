import { upsertCategoryAction } from '@/features/admin/mutations';
import type { AdminCategory } from '@/features/admin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ManageCategories({ categories }: { categories: AdminCategory[] }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertCategoryAction} className="grid gap-2 md:grid-cols-4">
            <Input name="name" placeholder="Category name" required />
            <Input name="slug" placeholder="category-slug" required />
            <label className="flex items-center gap-2 text-sm">
              <input defaultChecked name="isActive" type="checkbox" /> Active
            </label>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((item) => (
            <form key={item.id} action={upsertCategoryAction} className="grid gap-2 rounded-md border p-2 md:grid-cols-4">
              <input name="id" type="hidden" value={item.id} />
              <Input defaultValue={item.name} name="name" required />
              <Input defaultValue={item.slug} name="slug" required />
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
