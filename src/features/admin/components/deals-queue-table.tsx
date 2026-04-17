import Link from 'next/link';
import { MoreVertical } from 'lucide-react';

import { moderateDealAction } from '@/features/admin/mutations';
import type { AdminDealQueueItem } from '@/features/admin/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
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
        <div className="space-y-2 md:hidden">
          {deals.map((deal) => (
            <article className="rounded-md border border-border/70 bg-card/70 p-3" key={`mobile-${deal.id}`}>
              <div className="space-y-1">
                <p className="line-clamp-2 text-sm font-medium">{deal.title}</p>
                <p className="text-xs text-muted-foreground">
                  {deal.stores?.[0]?.name ?? 'Unknown store'} • {deal.categories?.[0]?.name ?? 'No category'}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant={statusVariant(deal.moderation_status)}>{deal.moderation_status}</Badge>
                {deal.is_featured ? <Badge variant="outline">featured</Badge> : null}
                <span className="text-xs text-muted-foreground">Reports: {deal.reports_count}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Coupon: {deal.coupon_code || '—'}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <form action={moderateDealAction}>
                  <input name="dealId" type="hidden" value={deal.id} />
                  <input name="intent" type="hidden" value="approve" />
                  <button className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-8')} type="submit">
                    Approve
                  </button>
                </form>
                <form action={moderateDealAction}>
                  <input name="dealId" type="hidden" value={deal.id} />
                  <input name="intent" type="hidden" value="reject" />
                  <button className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-8')} type="submit">
                    Reject
                  </button>
                </form>
                <form action={moderateDealAction}>
                  <input name="dealId" type="hidden" value={deal.id} />
                  <input name="intent" type="hidden" value={deal.is_featured ? 'unfeature' : 'feature'} />
                  <button className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-8')} type="submit">
                    {deal.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                </form>
                <Link className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'h-8')} href={`/admin/deals/${deal.id}/edit`}>
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
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
                    <details className="relative inline-block">
                      <summary
                        aria-label="Open actions menu"
                        className={cn(
                          'list-none cursor-pointer [&::-webkit-details-marker]:hidden',
                          buttonVariants({ size: 'icon', variant: 'ghost' }),
                        )}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </summary>

                      <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border bg-background p-1 shadow-lg">
                        <form action={moderateDealAction}>
                          <input name="dealId" type="hidden" value={deal.id} />
                          <input name="intent" type="hidden" value="approve" />
                          <button
                            className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'w-full justify-start')}
                            type="submit"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={moderateDealAction}>
                          <input name="dealId" type="hidden" value={deal.id} />
                          <input name="intent" type="hidden" value="reject" />
                          <button
                            className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'w-full justify-start')}
                            type="submit"
                          >
                            Reject
                          </button>
                        </form>
                        <form action={moderateDealAction}>
                          <input name="dealId" type="hidden" value={deal.id} />
                          <input name="intent" type="hidden" value={deal.is_featured ? 'unfeature' : 'feature'} />
                          <button
                            className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'w-full justify-start')}
                            type="submit"
                          >
                            {deal.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                        </form>
                        <Link
                          className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }), 'w-full justify-start')}
                          href={`/admin/deals/${deal.id}/edit`}
                        >
                          Edit
                        </Link>
                      </div>
                    </details>
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
