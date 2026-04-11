import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { ManageReports } from '@/features/admin/components/manage-reports';
import { getReports } from '@/features/admin/queries';

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Manage reports" description="Triage report reasons and resolve moderation outcomes." />
      <ManageReports reports={reports} />
    </div>
  );
}
