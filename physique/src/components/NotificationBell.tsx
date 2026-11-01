import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  notificationLabel,
} from "../hooks/useRequests";
import { Icon } from "./Icon";
import type { AppNotification } from "../lib/types";

function navigateFor(n: AppNotification): string {
  // Both coach (coach_request) and athlete (accepted/rejected) land on their
  // dashboard; the coach dashboard surfaces the requests section, the athlete
  // dashboard surfaces the coaching state.
  if (n.type === "coach_request_rejected") return "/coaches";
  return "/app";
}

export function NotificationBell() {
  const { data: notifications } = useNotifications();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function openItem(n: AppNotification) {
    if (!n.read_at) markRead.mutate(n.id);
    setOpen(false);
    navigate(navigateFor(n));
  }

  const count = unread ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="الإشعارات"
        className="relative grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-ada-muted transition hover:bg-white/[0.08] hover:text-ada-text"
      >
        <Icon name="bell" size={18} />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ada-teal px-1 font-mono-num text-[10px] font-bold text-ada-navy">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0f12] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)] sm:left-auto sm:right-0">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <span className="text-sm font-semibold text-ada-text">الإشعارات</span>
            {count > 0 ? (
              <span className="text-xs text-ada-muted">{count} غير مقروء</span>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications?.length ? (
              <ul className="divide-y divide-white/[0.04]">
                {notifications.map((n) => {
                  const label = notificationLabel(n);
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/[0.04]"
                      >
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            n.read_at ? "bg-white/[0.15]" : "bg-ada-teal"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-ada-text">
                            {label.title}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-xs text-ada-muted">
                            {label.body}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-ada-muted">
                لا توجد إشعارات حالياً
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
