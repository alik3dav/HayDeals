import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { getAdminCounts } from '@/features/admin/queries';

export default async function AdminPage() {
  const counts = await getAdminCounts();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Admin moderation" description="Operational overview of content and safety queues." />
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending deals</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.pendingDeals}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open reports</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.openReports}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{counts.usersCount}</CardContent>
        </Card>
      </div>
    </div>
  );
}
