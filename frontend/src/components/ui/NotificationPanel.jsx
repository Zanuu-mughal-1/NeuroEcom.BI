import { X, Check, AlertCircle, Info } from 'lucide-react'

export default function NotificationPanel({ notifications, onClose, position = 'header' }) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check size={16} className="text-bloom" />
      case 'error':
        return <AlertCircle size={16} className="text-danger" />
      case 'info':
        return <Info size={16} className="text-neo" />
      default:
        return <Info size={16} className="text-text-mid" />
    }
  }

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-bloom/10 border-bloom/30'
      case 'error':
        return 'bg-danger/10 border-danger/30'
      case 'info':
        return 'bg-neo/10 border-neo/30'
      default:
        return 'bg-surface border-border'
    }
  }

  const positionClass = position === 'header' 
    ? 'absolute top-full right-0 mt-2 w-96'
    : 'absolute bottom-full left-4 right-4 mb-2 w-full'

  return (
    <div className={`${positionClass} glass rounded-xl border border-border shadow-xl z-50 animate-fade-up`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-text-bright text-sm">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-void rounded-lg transition-colors"
        >
          <X size={14} className="text-text-dim" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications && notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map((notif, idx) => (
              <div
                key={idx}
                className={`px-4 py-3 flex gap-3 hover:bg-void/50 transition-colors ${getNotificationStyle(notif.type)}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-bright line-clamp-2">
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-text-dim mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                  )}
                  {notif.time && (
                    <p className="text-[10px] text-text-dim/60 mt-1">
                      {notif.time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-text-dim">No notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <button className="w-full text-xs text-neo hover:text-neo-bright transition-colors font-medium py-2">
            Mark all as read
          </button>
        </div>
      )}
    </div>
  )
}
