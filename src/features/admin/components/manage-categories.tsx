import { upsertCategoryAction } from '@/features/admin/mutations';
import type { AdminCategory } from '@/features/admin/types';

import { EntityUpsertPanel } from './entity-upsert-panel';

export function ManageCategories({ categories }: { categories: AdminCategory[] }) {
  return (
    <EntityUpsertPanel
      action={upsertCategoryAction}
      columnsClassName="grid gap-2 md:grid-cols-4"
      createTitle="Add category"
      existingTitle="Existing categories"
      items={categories}
      namePlaceholder="Category name"
      slugPlaceholder="category-slug"
    />
  );
}
