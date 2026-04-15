import { upsertStoreAction } from '@/features/admin/mutations';
import type { AdminStore } from '@/features/admin/types';

import { EntityUpsertPanel } from './entity-upsert-panel';

export function ManageStores({ stores }: { stores: AdminStore[] }) {
  return (
    <EntityUpsertPanel
      action={upsertStoreAction}
      columnsClassName="grid gap-2 md:grid-cols-5"
      createTitle="Add store"
      existingTitle="Existing stores"
      includeWebsiteUrl
      items={stores}
      namePlaceholder="Store name"
      slugPlaceholder="store-slug"
    />
  );
}
