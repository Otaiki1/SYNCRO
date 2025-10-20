"use client"

import { ArrowRight } from "lucide-react"

export default function DashboardPage({ subscriptions, totalSpend, insights, onViewInsights, onRenew, onManage }) {
  const upcomingRenewals = subscriptions
    .filter((sub) => sub.status === "expiring")
    .sort((a, b) => a.renewsIn - b.renewsIn)
    .slice(0, 3)

  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active").length

  return (
    <div>
      {/* Hero Card */}
      <div className="bg-black rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gray-700 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-2">This Month's AI spend</p>
          <h3 className="text-5xl font-bold text-white mb-2">${totalSpend.toFixed(2)}</h3>
          <p className="text-gray-400 text-sm mb-6">12% from last month</p>
          <button
            onClick={onViewInsights}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            View detailed insights
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's AI spend</h3>
        <div className="grid grid-cols-3 gap-4">
          {subscriptions.slice(0, 6).map((sub) => (
            <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl">
                    {sub.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{sub.name}</h4>
                    <p className="text-xs text-gray-500">{sub.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${sub.price}</p>
                  <p className="text-xs text-gray-500">/Month</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={sub.status === "expiring" ? "text-orange-600" : "text-gray-600"}>
                    {sub.status === "expiring" ? `Expires in ${sub.renewsIn} days` : `Renewal in ${sub.renewsIn} days`}
                  </span>
                  <span
                    className={
                      sub.status === "expiring" ? "text-orange-600 font-semibold" : "text-green-600 font-semibold"
                    }
                  >
                    {sub.status === "expiring" ? "Expiring" : "Active"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${sub.status === "expiring" ? "bg-orange-500" : "bg-green-500"}`}
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => (sub.status === "expiring" ? onRenew(sub) : onManage(sub))}
                className={`w-full py-2 rounded-lg text-sm font-medium ${
                  sub.status === "expiring"
                    ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {sub.status === "expiring" ? "Renew now" : "Manage subscription"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-8">
        {/* Upcoming Renewals */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Renewals</h3>
          <div className="space-y-3">
            {upcomingRenewals.map((renewal, idx) => (
              <div
                key={renewal.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-lg">
                    {renewal.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{renewal.name}</h4>
                    <p className="text-xs text-red-600">Expires in {renewal.renewsIn} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">${renewal.price}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700">
                    Renew
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Summary */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Summary</h3>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight) => (
              <div key={insight.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {insight.type === "info" && "📊"}
                    {insight.type === "tip" && "💡"}
                    {insight.type === "alert" && "🔍"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    {insight.type === "alert" && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        Add to dashboard
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
