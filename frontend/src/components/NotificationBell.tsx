import { useState, useEffect, useRef } from "react";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../api/api";

interface Notification {
  notification_id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="notification-bell-wrap" ref={ref}>
      <button className="notification-bell-btn" onClick={() => setOpen(!open)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="notification-mark-all">Mark all read</button>
            )}
          </div>
          <div className="notification-dropdown-body">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n.notification_id}
                  className={`notification-item ${!n.is_read ? "unread" : ""}`}
                  onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
                >
                  <span className="notification-type-icon">{typeIcon(n.type)}</span>
                  <div className="notification-item-content">
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{timeAgo(n.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
