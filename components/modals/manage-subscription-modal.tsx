"use client"

import { X, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

export default function ManageSubscriptionModal({ subscription, onClose, onDelete, onEdit, darkMode }) {
  const [showButtons, setShowButtons] = useState(false)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} rounded-2xl p-8 max-w-md w-full`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Manage Subscription</h2>
          <button
            onClick={onClose}
            className={`p-2 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} rounded-lg`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`mb-6 p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} rounded-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl">
              {subscription.icon}
            </div>
            <div>
              <h3 className="font-semibold">{subscription.name}</h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{subscription.category}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Monthly cost</span>
              <span className="font-semibold">${subscription.price}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Next renewal</span>
              <span className="font-semibold">Dec 15 2025</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Days left</span>
              <span className="font-semibold text-green-600">{subscription.renewsIn} days</span>
            </div>
          </div>
        </div>

        <div onMouseEnter={() => setShowButtons(true)} onMouseLeave={() => setShowButtons(false)} className="space-y-3">
          {showButtons && (
            <>
              <button
                onClick={onEdit}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 ${
                  darkMode
                    ? "border-gray-700 hover:border-gray-600 text-white"
                    : "border-gray-300 hover:border-black text-gray-900"
                } rounded-lg transition-colors font-medium`}
              >
                <Edit className="w-4 h-4" />
                Edit Subscription
              </button>
              <button
                onClick={onDelete}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${
                  darkMode
                    ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                } rounded-lg transition-colors font-medium`}
              >
                <Trash2 className="w-4 h-4" />
                Cancel Subscription
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
