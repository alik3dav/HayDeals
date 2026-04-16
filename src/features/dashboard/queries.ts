import { createClient } from '@/lib/supabase/server';

import type { DashboardCommentActivityItem, DashboardDealListItem, DashboardOverviewData, DashboardSavedDealListItem } from '@/features/dashboard/types';

const RECENT_LIMIT = 6;

export async function getDashboardOverviewData(profileId: string): Promise<DashboardOverviewData> {
  const supabase = await createClient();

  const [
    { count: submittedDeals, error: submittedDealsError },
    { count: approvedDeals, error: approvedDealsError },
    { count: pendingDeals, error: pendingDealsError },
    { count: savedDeals, error: savedDealsError },
    { count: commentsPosted, error: commentsPostedError },
    { data: recentDeals, error: recentDealsError },
    { data: recentBookmarks, error: recentBookmarksError },
    { data: recentComments, error: recentCommentsError },
  ] = await Promise.all([
    supabase.from('deals').select('id', { count: 'exact', head: true }).eq('profile_id', profileId),
    supabase.from('deals').select('id', { count: 'exact', head: true }).eq('profile_id', profileId).eq('moderation_status', 'approved'),
    supabase.from('deals').select('id', { count: 'exact', head: true }).eq('profile_id', profileId).eq('moderation_status', 'pending'),
    supabase.from('deal_bookmarks').select('id', { count: 'exact', head: true }).eq('profile_id', profileId),
    supabase.from('deal_comments').select('id', { count: 'exact', head: true }).eq('profile_id', profileId).eq('is_deleted', false),
    supabase
      .from('deals')
      .select('id, slug, title, created_at, moderation_status, score, comments_count')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT),
    supabase
      .from('deal_bookmarks')
      .select('created_at, deals:deals!deal_bookmarks_deal_id_fkey(id, slug, title, created_at, score, comments_count)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT),
    supabase
      .from('deal_comments')
      .select('id, body, created_at, deals:deals!deal_comments_deal_id_fkey(id, slug, title)')
      .eq('profile_id', profileId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(RECENT_LIMIT),
  ]);

  if (submittedDealsError) throw submittedDealsError;
  if (approvedDealsError) throw approvedDealsError;
  if (pendingDealsError) throw pendingDealsError;
  if (savedDealsError) throw savedDealsError;
  if (commentsPostedError) throw commentsPostedError;
  if (recentDealsError) throw recentDealsError;
  if (recentBookmarksError) throw recentBookmarksError;
  if (recentCommentsError) throw recentCommentsError;

  const normalizedBookmarks: DashboardSavedDealListItem[] = (recentBookmarks ?? []).flatMap((bookmark) => {
    const deal = Array.isArray(bookmark.deals) ? bookmark.deals[0] : bookmark.deals;

    if (!deal) {
      return [];
    }

    return [
      {
        id: deal.id,
        slug: deal.slug,
        title: deal.title,
        created_at: deal.created_at,
        score: deal.score,
        comments_count: deal.comments_count,
        bookmarked_at: bookmark.created_at,
      },
    ];
  });

  const normalizedComments: DashboardCommentActivityItem[] = (recentComments ?? []).map((comment) => {
    const deal = Array.isArray(comment.deals) ? comment.deals[0] : comment.deals;

    return {
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at,
      deal: deal ? { id: deal.id, slug: deal.slug, title: deal.title } : null,
    };
  });

  return {
    stats: {
      submittedDeals: submittedDeals ?? 0,
      approvedDeals: approvedDeals ?? 0,
      pendingDeals: pendingDeals ?? 0,
      savedDeals: savedDeals ?? 0,
      commentsPosted: commentsPosted ?? 0,
    },
    recentDeals: (recentDeals ?? []) as DashboardDealListItem[],
    recentSavedDeals: normalizedBookmarks,
    recentComments: normalizedComments,
  };
}

export async function getMyDeals(profileId: string): Promise<DashboardDealListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('deals')
    .select('id, slug, title, created_at, moderation_status, score, comments_count')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return (data ?? []) as DashboardDealListItem[];
}

export async function getSavedDeals(profileId: string): Promise<DashboardSavedDealListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('deal_bookmarks')
    .select('created_at, deals:deals!deal_bookmarks_deal_id_fkey(id, slug, title, created_at, score, comments_count)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return (data ?? []).flatMap((bookmark) => {
    const deal = Array.isArray(bookmark.deals) ? bookmark.deals[0] : bookmark.deals;

    if (!deal) {
      return [];
    }

    return [
      {
        id: deal.id,
        slug: deal.slug,
        title: deal.title,
        created_at: deal.created_at,
        score: deal.score,
        comments_count: deal.comments_count,
        bookmarked_at: bookmark.created_at,
      },
    ];
  });
}

export async function getActivity(profileId: string): Promise<DashboardCommentActivityItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('deal_comments')
    .select('id, body, created_at, deals:deals!deal_comments_deal_id_fkey(id, slug, title)')
    .eq('profile_id', profileId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  return (data ?? []).map((comment) => {
    const deal = Array.isArray(comment.deals) ? comment.deals[0] : comment.deals;

    return {
      id: comment.id,
      body: comment.body,
      created_at: comment.created_at,
      deal: deal ? { id: deal.id, slug: deal.slug, title: deal.title } : null,
    };
  });
}
