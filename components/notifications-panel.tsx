"use client"
import { X } from "lucide-react"

export default function NotificationsPanel({ notifications, onMarkRead, onClose }) {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-40 flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-2 p-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                notification.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
              }`}
              onClick={() => onMarkRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                </div>
                {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button className="w-full py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
          Mark all as read
        </button>
      </div>
    </div>
  )
}
