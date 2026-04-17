import { updateReportStatusAction } from '@/features/admin/mutations';
import type { AdminReport } from '@/features/admin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

export function ManageReports({ reports }: { reports: AdminReport[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.map((report) => (
          <form key={report.id} action={updateReportStatusAction} className="grid gap-2 rounded-md border p-2 md:grid-cols-[1fr_140px_90px]">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{report.deals?.[0]?.title ?? 'Unknown deal'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {report.reason} • by {report.profiles?.[0]?.username ?? 'unknown'}
              </p>
            </div>
            <input name="reportId" type="hidden" value={report.id} />
            <Select defaultValue={report.report_status} name="status">
              <option value="open">open</option>
              <option value="reviewed">reviewed</option>
              <option value="dismissed">dismissed</option>
            </Select>
            <Button size="sm" type="submit" variant="secondary">
              Save
            </Button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}
