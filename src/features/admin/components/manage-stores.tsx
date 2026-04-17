'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { upsertStoreAction } from '@/features/admin/mutations';
import type { AdminStore } from '@/features/admin/types';

import { StoreLogoUpload } from './store-logo-upload';

type StoreFormRowProps = {
  store: AdminStore;
};

function StoreFormRow({ store }: StoreFormRowProps) {
  const [logoUrl, setLogoUrl] = useState(store.logo_url ?? '');

  return (
    <form action={upsertStoreAction} className="space-y-3 rounded-md border p-3">
      <input name="id" type="hidden" value={store.id} />
      <input name="logoUrl" type="hidden" value={logoUrl} />

      <div className="grid gap-2 md:grid-cols-5">
        <Input defaultValue={store.name} name="name" required />
        <Input defaultValue={store.slug} name="slug" required />
        <Input defaultValue={store.website_url ?? ''} name="websiteUrl" placeholder="https://..." />
        <label className="flex items-center gap-2 text-sm">
          <input defaultChecked={store.is_active} name="isActive" type="checkbox" /> Active
        </label>
        <Button className="max-md:w-full" size="sm" type="submit" variant="secondary">
          Save
        </Button>
      </div>

      <StoreLogoUpload onChange={setLogoUrl} value={logoUrl} />
    </form>
  );
}

export function ManageStores({ stores }: { stores: AdminStore[] }) {
  const [createLogoUrl, setCreateLogoUrl] = useState('');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add store</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={upsertStoreAction} className="space-y-3">
            <input name="logoUrl" type="hidden" value={createLogoUrl} />

            <div className="grid gap-2 md:grid-cols-5">
              <Input name="name" placeholder="Store name" required />
              <Input name="slug" placeholder="store-slug" required />
              <Input name="websiteUrl" placeholder="https://..." />
              <label className="flex items-center gap-2 text-sm">
                <input defaultChecked name="isActive" type="checkbox" /> Active
              </label>
              <Button className="max-md:w-full" type="submit">
                Create
              </Button>
            </div>

            <StoreLogoUpload onChange={setCreateLogoUrl} value={createLogoUrl} />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing stores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stores.map((store) => (
            <StoreFormRow key={store.id} store={store} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
