"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Calendar, BarChart3 } from "lucide-react"

export default function AnalyticsPage({ subscriptions, totalSpend, darkMode }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const monthlyData = [
    { month: "Jul", spend: 42 },
    { month: "Aug", spend: 48 },
    { month: "Sep", spend: 55 },
    { month: "Oct", spend: 62 },
    { month: "Nov", spend: 58 },
    { month: "Dec", spend: 67 },
  ]

  const categorySpend = subscriptions.reduce((acc, sub) => {
    const existing = acc.find((item) => item.name === sub.category)
    if (existing) {
      existing.value += sub.price
    } else {
      acc.push({ name: sub.category, value: sub.price })
    }
    return acc
  }, [])

  const COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"]

  const topTools = [...subscriptions].sort((a, b) => b.price - a.price).slice(0, 4)

  const handleExportCSV = () => {
    const headers = ["Name", "Category", "Price", "Renewal Date", "Status"]
    const rows = subscriptions.map((sub) => [
      sub.name,
      sub.category,
      `$${sub.price}`,
      new Date(Date.now() + sub.renewsIn * 24 * 60 * 60 * 1000).toLocaleDateString(),
      sub.status,
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `subscriptions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getSimilarTools = (category) => {
    return subscriptions.filter((sub) => sub.category === category)
  }

  const upcomingRenewals = subscriptions
    .map((sub) => ({
      ...sub,
      renewalDate: new Date(Date.now() + sub.renewsIn * 24 * 60 * 60 * 1000),
    }))
    .sort((a, b) => a.renewalDate - b.renewalDate)

  return (
    <div className="space-y-8">
      {/* Export Button */}
      <div className="flex gap-3">
        <button
          onClick={handleExportCSV}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          <Download className="w-4 h-4" />
          Export as CSV
        </button>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar View
        </button>
        <button
          onClick={() => setShowComparison(!showComparison)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Compare Tools
        </button>
      </div>

      {/* Calendar View */}
      {showCalendar && (
        <div
          className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Renewal Calendar
          </h3>
          <div className="space-y-2">
            {upcomingRenewals.map((renewal) => (
              <div
                key={renewal.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-sm">
                    {renewal.icon}
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{renewal.name}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {renewal.renewalDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>${renewal.price}</p>
                  <p
                    className={`text-xs ${
                      renewal.renewsIn <= 3
                        ? "text-red-600 dark:text-red-400"
                        : darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                    }`}
                  >
                    {renewal.renewsIn} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Comparison */}
      {showComparison && (
        <div
          className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Cost Comparison by Category
          </h3>
          <div className="space-y-4">
            {categorySpend.map((category, idx) => {
              const tools = getSimilarTools(category.name)
              return (
                <div key={idx}>
                  <p className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {category.name} - Total: ${category.value}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        className={`p-3 rounded-lg border ${
                          darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-xs">
                            {tool.icon}
                          </div>
                          <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {tool.name}
                          </p>
                        </div>
                        <p className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          ${tool.price}
                        </p>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>/month</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
        <div className="mb-6">
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Monthly Overview</h3>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Your spending trend over the past 6 months
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="month" stroke={darkMode ? "#9ca3af" : "#9ca3af"} />
            <YAxis
              stroke={darkMode ? "#9ca3af" : "#9ca3af"}
              label={{ value: "$", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#1f2937" : "#fff",
                border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                borderRadius: "8px",
                color: darkMode ? "#fff" : "#000",
              }}
              formatter={(value) => `$${value}`}
            />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: "#6366f1", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div
          className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Monthly Overview</h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              How you're spending across AI categories
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categorySpend}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categorySpend.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-2 text-sm">
            {categorySpend.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    {cat.name}: ${cat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`border rounded-xl p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
        >
          <div className="mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Top Tools</h3>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Ranked by monthly spend</p>
          </div>
          <div className="space-y-4">
            {topTools.map((tool, idx) => {
              const percentage = ((tool.price / totalSpend) * 100).toFixed(0)
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between pb-4 border-b ${
                    darkMode ? "border-gray-700" : "border-gray-100"
                  } last:border-b-0`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: "#000" }}></div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{tool.name}</p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{tool.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>${tool.price}</p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{percentage}% of Total</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
