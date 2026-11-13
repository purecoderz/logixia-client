import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorFrom } from "@/lib/apiError";
import { apiFetch } from "@/lib/http";

export type NotificationType =
  | "task_assigned"
  | "submission_graded"
  | "session_live"
  | "member_joined"
  | "task_submitted"
  | "deadline_reminder"
  | (string & {});

export interface AppNotification {
  id: number | string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  unread_count: number;
  items: AppNotification[];
}

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (limit: number) => [...notificationKeys.all, "list", limit] as const,
};

const EMPTY: NotificationsResponse = { unread_count: 0, items: [] };

export const NotificationService = {
  async list(limit = 20): Promise<NotificationsResponse> {
    const response = await apiFetch(`/notifications?limit=${limit}`);
    // Gracefully return empty until the backend exposes /notifications.
    if (response.status === 404) return EMPTY;
    if (!response.ok) throw await apiErrorFrom(response);
    const data: unknown = await response.json();
    if (Array.isArray(data)) {
      const items = data as AppNotification[];
      return {
        unread_count: items.filter((n) => !n.is_read).length,
        items,
      };
    }
    if (data && typeof data === "object" && "items" in data) {
      const res = data as NotificationsResponse;
      return {
        unread_count:
          typeof res.unread_count === "number"
            ? res.unread_count
            : res.items.filter((n) => !n.is_read).length,
        items: Array.isArray(res.items) ? res.items : [],
      };
    }
    return EMPTY;
  },

  async markRead(id: number | string): Promise<void> {
    const response = await apiFetch(
      `/notifications/${encodeURIComponent(String(id))}/read`,
      { method: "PATCH" },
    );
    if (response.status === 404) return;
    if (!response.ok) throw await apiErrorFrom(response);
  },

  async markAllRead(): Promise<void> {
    const response = await apiFetch("/notifications/read-all", {
      method: "POST",
    });
    if (response.status === 404) return;
    if (!response.ok) throw await apiErrorFrom(response);
  },
};

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: notificationKeys.list(limit),
    queryFn: () => NotificationService.list(limit),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => NotificationService.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: notificationKeys.all },
        (prev) => {
          if (!prev) return prev;
          const target = prev.items.find((n) => n.id === id);
          if (!target || target.is_read) return prev;
          return {
            unread_count: Math.max(0, prev.unread_count - 1),
            items: prev.items.map((n) =>
              n.id === id ? { ...n, is_read: true } : n,
            ),
          };
        },
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationService.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: notificationKeys.all },
        (prev) =>
          prev
            ? {
                unread_count: 0,
                items: prev.items.map((n) => ({ ...n, is_read: true })),
              }
            : prev,
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
