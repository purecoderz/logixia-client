import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { QueryClientContext } from "@tanstack/react-query";
import {
  Award,
  Bell,
  CheckCheck,
  ClipboardCheck,
  Clock,
  FileText,
  Radio,
  UserPlus,
} from "lucide-react";
import { useContext } from "react";
import { useInRouterContext, useNavigate } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type AppNotification,
  type NotificationType,
} from "../services/notificationService";

function typeIcon(type: NotificationType) {
  switch (type) {
    case "task_assigned":
      return <FileText size={16} className="text-accent" aria-hidden />;
    case "submission_graded":
      return <Award size={16} className="text-success" aria-hidden />;
    case "session_live":
      return <Radio size={16} className="text-danger" aria-hidden />;
    case "member_joined":
      return <UserPlus size={16} className="text-accent" aria-hidden />;
    case "task_submitted":
      return <ClipboardCheck size={16} className="text-success" aria-hidden />;
    case "deadline_reminder":
      return <Clock size={16} className="text-warning" aria-hidden />;
    default:
      return <Bell size={16} className="text-muted" aria-hidden />;
  }
}

function relativeTime(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 60_000) return "just now";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const queryClient = useContext(QueryClientContext);
  const inRouter = useInRouterContext();

  if (!queryClient || !inRouter) {
    return (
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-hover hover:text-foreground"
      >
        <Bell size={20} aria-hidden />
      </button>
    );
  }

  return <NotificationBellPopover />;
}

function NotificationBellPopover() {
  const navigate = useNavigate();
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unreadCount = data?.unread_count ?? 0;

  function handleSelect(item: AppNotification, close: () => void) {
    if (!item.is_read) {
      markRead.mutate(item.id);
    }
    close();
    if (item.link && item.link.startsWith("/")) {
      navigate(item.link);
    }
  }

  return (
    <Popover className="relative">
      <PopoverButton
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        title="Notifications"
        className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-body transition-colors hover:bg-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Bell size={20} aria-hidden />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverButton>

      <PopoverPanel
        anchor="bottom end"
        className="z-[60] mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-line bg-surface shadow-xl sm:w-96"
      >
        {({ close }) => (
          <>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-hover disabled:opacity-50"
                >
                  <CheckCheck size={14} aria-hidden />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-line">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Bell size={22} className="text-muted" aria-hidden />
                  <p className="text-sm font-medium text-foreground">
                    You’re all caught up
                  </p>
                  <p className="text-xs text-muted">
                    Task updates, grades, and live session alerts will appear
                    here.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item, close)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-hover ${
                      item.is_read ? "" : "bg-accent/[0.04]"
                    }`}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-input">
                      {typeIcon(item.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-snug ${
                            item.is_read
                              ? "font-medium text-body"
                              : "font-semibold text-foreground"
                          }`}
                        >
                          {item.title}
                        </p>
                        {!item.is_read && (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                          />
                        )}
                      </div>
                      {item.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                          {item.body}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted">
                        {relativeTime(item.created_at)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
