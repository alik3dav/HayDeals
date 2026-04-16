"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createOptionalClient } from '@/lib/supabase/browser';
import { fetchRecentNotifications, fetchUnreadNotificationsCount, markNotificationsRead } from '@/features/notifications/client';
import type { UserNotification } from '@/features/notifications/types';

const RECENT_NOTIFICATIONS_LIMIT = 10;

type UseNotificationsOptions = {
  enabled: boolean;
};

export function useNotifications({ enabled }: UseNotificationsOptions) {
  const supabase = useMemo(() => (enabled ? createOptionalClient() : null), [enabled]);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const syncingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!supabase) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled) {
        setProfileId(user?.id ?? null);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const refreshUnreadCount = useCallback(async () => {
    if (!supabase || !profileId) {
      setUnreadCount(0);
      return;
    }

    const count = await fetchUnreadNotificationsCount(supabase, profileId);
    setUnreadCount(count);
  }, [profileId, supabase]);

  const loadNotifications = useCallback(async (): Promise<UserNotification[]> => {
    if (!supabase || !profileId) {
      setNotifications([]);
      return [];
    }

    setLoadingList(true);

    try {
      const rows = await fetchRecentNotifications(supabase, profileId, RECENT_NOTIFICATIONS_LIMIT);
      setNotifications(rows);
      setLoadedOnce(true);
      return rows;
    } finally {
      setLoadingList(false);
    }
  }, [profileId, supabase]);

  const markAllVisibleAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!supabase || !profileId || syncingRef.current) {
      return;
    }

    const unreadIds =
      notificationIds ??
      notifications.filter((notification) => !notification.isRead).map((notification) => notification.id);

    if (unreadIds.length === 0) {
      return;
    }

    syncingRef.current = true;

    try {
      await markNotificationsRead(supabase, profileId, unreadIds);
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } finally {
      syncingRef.current = false;
    }
  }, [notifications, profileId, supabase]);

  useEffect(() => {
    if (!profileId) {
      return;
    }

    void refreshUnreadCount();
  }, [profileId, refreshUnreadCount]);

  useEffect(() => {
    if (!supabase || !profileId) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_profile_id=eq.${profileId}`,
        },
        () => {
          void refreshUnreadCount();
          if (loadedOnce) {
            void loadNotifications();
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadedOnce, loadNotifications, profileId, refreshUnreadCount, supabase]);

  return {
    notifications,
    unreadCount,
    loadingList,
    loadedOnce,
    loadNotifications,
    markAllVisibleAsRead,
  };
}
