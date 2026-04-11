import Link from 'next/link';

import { moderateDealAction } from '@/features/admin/mutations';
import type { AdminDealQueueItem } from '@/features/admin/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function statusVariant(status: AdminDealQueueItem['moderation_status']) {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'destructive';
  return 'secondary';
}

export function DealsQueueTable({ deals }: { deals: AdminDealQueueItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b">
                <th className="py-2">Deal</th>
                <th className="py-2">Status</th>
                <th className="py-2">Meta</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="border-b align-top">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deal.stores?.[0]?.name ?? 'Unknown store'} • {deal.categories?.[0]?.name ?? 'No category'}
                    </p>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      <Badge variant={statusVariant(deal.moderation_status)}>{deal.moderation_status}</Badge>
                      {deal.is_featured ? <Badge variant="outline">featured</Badge> : null}
                    </div>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">
                    <p>Reports: {deal.reports_count}</p>
                    <p>Coupon: {deal.coupon_code || '—'}</p>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      <form action={moderateDealAction}>
                        <input name="dealId" type="hidden" value={deal.id} />
                        <input name="intent" type="hidden" value="approve" />
                        <Button size="sm" type="submit" variant="secondary">
                          Approve
                        </Button>
                      </form>
                      <form action={moderateDealAction}>
                        <input name="dealId" type="hidden" value={deal.id} />
                        <input name="intent" type="hidden" value="reject" />
                        <Button size="sm" type="submit" variant="destructive">
                          Reject
                        </Button>
                      </form>
                      <form action={moderateDealAction}>
                        <input name="dealId" type="hidden" value={deal.id} />
                        <input name="intent" type="hidden" value={deal.is_featured ? 'unfeature' : 'feature'} />
                        <Button size="sm" type="submit" variant="outline">
                          {deal.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </form>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/deals/${deal.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
