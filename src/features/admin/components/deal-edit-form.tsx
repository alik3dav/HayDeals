import { updateDealAction } from '@/features/admin/mutations';
import type { AdminDealEdit } from '@/features/admin/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function DealEditForm({ deal }: { deal: AdminDealEdit }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateDealAction} className="space-y-3">
          <input name="dealId" type="hidden" value={deal.id} />
          <Input defaultValue={deal.title} name="title" required />
          <Textarea defaultValue={deal.description ?? ''} name="description" />
          <Input defaultValue={deal.deal_url} name="dealUrl" required />
          <Input defaultValue={deal.coupon_code ?? ''} name="couponCode" placeholder="Coupon code" />
          <div className="grid gap-2 md:grid-cols-2">
            <Input defaultValue={deal.sale_price ?? ''} name="salePrice" type="number" />
            <Input defaultValue={deal.original_price ?? ''} name="originalPrice" type="number" />
          </div>
          <Input defaultValue={deal.expires_at ? deal.expires_at.slice(0, 16) : ''} name="expiresAt" type="datetime-local" />
          <div className="grid gap-2 md:grid-cols-2">
            <Select defaultValue={deal.category_id ?? ''} name="categoryId">
              <option value="">No category</option>
              {deal.categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select defaultValue={deal.store_id ?? ''} name="storeId">
              <option value="">No store</option>
              {deal.storeOptions.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Select>
          </div>
          <Select defaultValue={deal.moderation_status} name="moderationStatus">
            <option value="draft">draft</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <input defaultChecked={deal.is_featured} name="isFeatured" type="checkbox" /> Featured
          </label>
          <Textarea defaultValue={deal.moderation_note ?? ''} name="moderationNote" placeholder="Moderation note" />
          <Button type="submit">Save changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}
