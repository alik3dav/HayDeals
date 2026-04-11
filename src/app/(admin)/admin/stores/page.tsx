import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { ManageStores } from '@/features/admin/components/manage-stores';
import { getStores } from '@/features/admin/queries';

export default async function AdminStoresPage() {
  const stores = await getStores();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Manage stores" description="Store directory management used by submitted deals." />
      <ManageStores stores={stores} />
    </div>
  );
}
