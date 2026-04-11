import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { ManageCategories } from '@/features/admin/components/manage-categories';
import { getCategories } from '@/features/admin/queries';

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Manage categories" description="Create and update category taxonomy." />
      <ManageCategories categories={categories} />
    </div>
  );
}
