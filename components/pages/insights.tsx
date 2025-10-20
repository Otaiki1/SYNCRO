"use client"

import { TrendingUp, AlertCircle, Lightbulb, ArrowLeft } from "lucide-react"

export default function InsightsPage({ insights, totalSpend, onClose, darkMode }) {
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950" : "bg-white"}`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onClose}
                className={`p-2 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} rounded-lg transition-colors`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Detailed Insights</h1>
            </div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Comprehensive analysis of your AI subscription spending and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Spending Card */}
        <div
          className={`mb-8 p-6 ${darkMode ? "bg-gray-900 border border-gray-800" : "bg-black text-white"} rounded-lg`}
        >
          <p className={`${darkMode ? "text-gray-400" : "text-gray-300"} text-sm mb-2`}>This Month's AI Spend</p>
          <h2 className={`text-5xl font-bold ${darkMode ? "text-white" : ""} mb-2`}>${totalSpend.toFixed(2)}</h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-400"} text-sm`}>12% increase from last month</p>
        </div>

        {/* Insights Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={`p-6 ${darkMode ? "bg-gray-900 border border-blue-900/50" : "bg-blue-50 border border-blue-200"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <TrendingUp className={`w-6 h-6 ${darkMode ? "text-blue-400" : "text-blue-600"} mt-1 flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Spend Increases</h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Your spend increased 18% this month - mostly from image generation tools like Midjourney and DALL-E.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 ${darkMode ? "bg-gray-900 border border-green-900/50" : "bg-green-50 border border-green-200"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className={`w-6 h-6 ${darkMode ? "text-green-400" : "text-green-600"} mt-1 flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Optimization Tip</h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Consider consolidating your image generation tools to save costs. You're currently paying for 3
                  similar services.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 ${darkMode ? "bg-gray-900 border border-purple-900/50" : "bg-purple-50 border border-purple-200"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-6 h-6 ${darkMode ? "text-purple-400" : "text-purple-600"} mt-1 flex-shrink-0`}
              />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>New Detection</h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  We detected a new Perplexity Pro subscription in your email. Would you like to add it to your
                  dashboard?
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 ${darkMode ? "bg-gray-900 border border-yellow-900/50" : "bg-yellow-50 border border-yellow-200"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-6 h-6 ${darkMode ? "text-yellow-400" : "text-yellow-600"} mt-1 flex-shrink-0`}
              />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Upcoming Renewals</h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  3 subscriptions are expiring in the next 7 days. Make sure to renew them to avoid service
                  interruptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
