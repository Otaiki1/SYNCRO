"use client"

import { useState } from "react"
import { Edit2, Trash2 } from "lucide-react"

export default function SubscriptionsPage({ subscriptions, onDelete, maxSubscriptions, currentPlan }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const categories = ["all", ...new Set(subscriptions.map((s) => s.category))]
  const statuses = ["all", "active", "expiring", "expired"]

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || sub.category === filterCategory
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price)
  } else if (sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price)
  } else if (sortBy === "renewal") {
    filtered.sort((a, b) => a.renewsIn - b.renewsIn)
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  }

  const totalCost = filtered.reduce((sum, sub) => sum + sub.price, 0)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-600 text-sm mb-2">Total subscriptions</p>
          <h3 className="text-3xl font-bold text-gray-900">{subscriptions.length}</h3>
          <p className="text-xs text-gray-600 mt-2">{maxSubscriptions - subscriptions.length} slots available</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-600 text-sm mb-2">Monthly Cost</p>
          <h3 className="text-3xl font-bold text-gray-900">${subscriptions.reduce((sum, s) => sum + s.price, 0)}</h3>
          <p className="text-xs text-red-600 mt-2">-$35 last month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-600 text-sm mb-2">Yearly Cost</p>
          <h3 className="text-3xl font-bold text-gray-900">
            ${(subscriptions.reduce((sum, s) => sum + s.price, 0) * 12).toFixed(0)}
          </h3>
          <p className="text-xs text-gray-600 mt-2">Projected</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-600 text-sm mb-2">Renewal Due</p>
          <h3 className="text-3xl font-bold text-gray-900">
            {subscriptions.filter((s) => s.status === "expiring").length}
          </h3>
          <p className="text-xs text-orange-600 mt-2">Next 7 days</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search subscriptions"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="name">Sort by Name</option>
          <option value="price-high">Price: High to Low</option>
          <option value="price-low">Price: Low to High</option>
          <option value="renewal">Renewal Soon</option>
        </select>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-3">
        {filtered.map((sub) => (
          <div
            key={sub.id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl">{sub.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{sub.name}</h4>
                <p className="text-xs text-gray-500">{sub.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="font-bold text-gray-900">${sub.price}</p>
                <p className="text-xs text-gray-500">/Month</p>
              </div>

              <div className="text-right min-w-32">
                <p className="text-sm text-gray-600">
                  {sub.status === "expiring" ? `Expires in ${sub.renewsIn} days` : `Renewal in ${sub.renewsIn} days`}
                </p>
                <span
                  className={`text-xs font-semibold ${
                    sub.status === "expiring" ? "text-orange-600" : "text-green-600"
                  }`}
                >
                  {sub.status === "expiring" ? "Expiring" : "Active"}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(sub.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subscriptions found</p>
        </div>
      )}
    </div>
  )
}
