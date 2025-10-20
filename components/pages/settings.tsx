"use client"
import { LogOut, Bell, AlertCircle } from "lucide-react"
import { useState } from "react"

export default function SettingsPage({ currentPlan, onUpgrade, budgetLimit, onBudgetChange, darkMode }) {
  const [alertThreshold, setAlertThreshold] = useState(80)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)
  const [recommendations, setRecommendations] = useState(true)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Plan Information */}
      <div className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className={darkMode ? "text-gray-400" : "text-gray-600"}>You are currently on the</p>
            <p className={`text-2xl font-bold capitalize ${darkMode ? "text-white" : "text-gray-900"}`}>
              {currentPlan} Plan
            </p>
          </div>
          {currentPlan === "free" && (
            <button
              onClick={onUpgrade}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                darkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Budget & Alerts */}
      <div className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <h3
          className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          <AlertCircle className="w-5 h-5" />
          Budget & Alerts
        </h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Monthly Budget Limit
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className={`absolute left-3 top-2.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>$</span>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => onBudgetChange(Number(e.target.value))}
                  className={`w-full pl-7 pr-4 py-2 border rounded-lg ${
                    darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Set your maximum monthly spending limit
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Alert Threshold
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="flex-1"
              />
              <span className={`text-sm font-medium w-12 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {alertThreshold}%
              </span>
            </div>
            <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Alert when spending reaches {alertThreshold}% of your budget
            </p>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Email
            </label>
            <input
              type="email"
              value="caleb@example.com"
              disabled
              className={`w-full px-4 py-2 border rounded-lg ${
                darkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-300 text-gray-600"
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Name
            </label>
            <input
              type="text"
              value="Caleb Alexhone"
              disabled
              className={`w-full px-4 py-2 border rounded-lg ${
                darkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-300 text-gray-600"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <h3
          className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4"
            />
            <div>
              <p className={darkMode ? "text-white" : "text-gray-700"}>Email alerts for budget overages</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Get notified when you exceed your budget
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weeklyReports}
              onChange={(e) => setWeeklyReports(e.target.checked)}
              className="w-4 h-4"
            />
            <div>
              <p className={darkMode ? "text-white" : "text-gray-700"}>Weekly spending summary</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Receive a summary of your spending every Monday
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={recommendations}
              onChange={(e) => setRecommendations(e.target.checked)}
              className="w-4 h-4"
            />
            <div>
              <p className={darkMode ? "text-white" : "text-gray-700"}>Optimization recommendations</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Get AI-powered suggestions to reduce spending
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className={`border rounded-xl p-6 ${darkMode ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"}`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-red-400" : "text-red-900"}`}>Danger Zone</h3>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
