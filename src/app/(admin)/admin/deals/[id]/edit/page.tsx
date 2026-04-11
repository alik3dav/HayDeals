import { notFound } from 'next/navigation';

import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { DealEditForm } from '@/features/admin/components/deal-edit-form';
import { getDealForEdit } from '@/features/admin/queries';

export default async function AdminDealEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getDealForEdit(id);

  if (!deal) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Edit deal" description="Update deal metadata and moderation fields." />
      <DealEditForm deal={deal} />
    </div>
  );
}
