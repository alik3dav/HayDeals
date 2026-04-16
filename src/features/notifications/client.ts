import type { SupabaseClient } from '@supabase/supabase-js';

import type { UserNotification } from '@/features/notifications/types';

const NOTIFICATION_SELECT =
  'id, type, message, is_read, created_at, deal_id, target_type, target_id, actor:profiles!notifications_actor_profile_id_fkey(username, display_name, avatar_url), deal:deals!notifications_deal_id_fkey(id, title)';

type RawNotification = {
  id: string;
  type: UserNotification['type'];
  message: string;
  is_read: boolean;
  created_at: string;
  deal_id: string | null;
  target_type: string | null;
  target_id: string | null;
  actor: UserNotification['actor'] | UserNotification['actor'][] | null;
  deal: UserNotification['deal'] | UserNotification['deal'][] | null;
};

function toSingleRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function mapNotification(row: RawNotification): UserNotification {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    dealId: row.deal_id,
    targetType: row.target_type,
    targetId: row.target_id,
    actor: toSingleRelation(row.actor),
    deal: toSingleRelation(row.deal),
  };
}

export async function fetchUnreadNotificationsCount(supabase: SupabaseClient, profileId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_profile_id', profileId)
    .eq('is_read', false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function fetchRecentNotifications(
  supabase: SupabaseClient,
  profileId: string,
  limit = 10,
): Promise<UserNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .eq('recipient_profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as RawNotification[] | null)?.map(mapNotification) ?? [];
}

export async function markNotificationsRead(
  supabase: SupabaseClient,
  profileId: string,
  notificationIds: string[],
): Promise<void> {
  if (notificationIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('recipient_profile_id', profileId)
    .in('id', notificationIds)
    .eq('is_read', false);

  if (error) {
    throw error;
  }
}
