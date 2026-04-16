'use server';

import { revalidatePath } from 'next/cache';

import { decodeFeedCursor, getPublicDealsFeed } from '@/features/deals/queries';
import type { DealFeedFilters, DealSortOption } from '@/features/deals/types';
import { toggleDealSave, voteOnDeal } from '@/features/deal-details/mutations';

function refreshFeedAndDeal(dealId: string) {
  revalidatePath('/');
  revalidatePath(`/deals/${dealId}`);
}

export async function voteOnDealFromFeedAction(dealId: string, voteValue: 1 | -1) {
  const result = await voteOnDeal(dealId, voteValue);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to submit vote.');
  }

  refreshFeedAndDeal(dealId);
}

export async function toggleSaveFromFeedAction(dealId: string) {
  const result = await toggleDealSave(dealId);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to save deal.');
  }

  refreshFeedAndDeal(dealId);
}

export async function loadMoreDealsFromFeedAction({
  sort,
  filters,
  cursor,
}: {
  sort: DealSortOption;
  filters: DealFeedFilters;
  cursor: string;
}) {
  const decodedCursor = decodeFeedCursor(cursor);

  if (!decodedCursor) {
    throw new Error('Invalid feed cursor.');
  }

  return getPublicDealsFeed({
    sort,
    filters,
    cursor: decodedCursor,
  });
}
