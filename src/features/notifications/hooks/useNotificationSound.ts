import { useEffect, useRef } from "react";
import type { AppNotification } from "../services/notificationService";
import { playNotificationSound } from "../utils/notificationSound";

/**
 * Plays a notification chime when new unread notifications arrive after initial load.
 */
export function useNotificationSound(
  items: AppNotification[],
  unreadCount: number,
  isLoaded: boolean,
): void {
  const initialized = useRef(false);
  const prevUnread = useRef(0);
  const seenIds = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    if (!isLoaded) return;

    if (!initialized.current) {
      initialized.current = true;
      prevUnread.current = unreadCount;
      seenIds.current = new Set(items.map((item) => item.id));
      return;
    }

    const hasNewUnread = items.some(
      (item) => !item.is_read && !seenIds.current.has(item.id),
    );
    const countIncreased = unreadCount > prevUnread.current;

    if (hasNewUnread || countIncreased) {
      playNotificationSound();
    }

    prevUnread.current = unreadCount;
    for (const item of items) {
      seenIds.current.add(item.id);
    }
  }, [items, unreadCount, isLoaded]);
}
