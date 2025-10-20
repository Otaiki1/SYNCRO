"use client"

import { useState } from "react"
import ManageIntegrationModal from "@/components/modals/manage-integration-modal"

export default function IntegrationsPage({ integrations, onToggle }) {
  const [sortBy, setSortBy] = useState("name")
  const [selectedIntegration, setSelectedIntegration] = useState(null)
  const [showManageModal, setShowManageModal] = useState(false)

  const supportedTools = [
    { name: "GitHub", icon: "🐙" },
    { name: "Gemini", icon: "💎" },
    { name: "Nano Banana", icon: "🍌" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
    { name: "Gemini", icon: "💎" },
  ]

  const sortedTools = [...supportedTools].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  const handleManageIntegration = (integration) => {
    setSelectedIntegration(integration)
    setShowManageModal(true)
  }

  return (
    <div>
      {/* Connected Services */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Services</h3>
        <div className="grid grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                  <p className="text-xs text-gray-500">{integration.type}</p>
                </div>
                <button
                  onClick={() => onToggle(integration.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integration.status === "connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {integration.status === "connected" ? "Connected" : "Disconnected"}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>Last sync: {integration.lastSync}</p>
                {integration.accounts > 0 && <p>{integration.accounts} accounts connected</p>}
              </div>

              <button
                onClick={() => handleManageIntegration(integration)}
                className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {integration.status === "connected" ? "Manage" : "Configure"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Supported AI Tools & Services</h3>
            <p className="text-sm text-gray-600">Automatically track AI subscription emails and receipts</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300"
            >
              <option value="name">Name</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {sortedTools.map((tool, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-300 cursor-pointer transition-colors"
            >
              <div className="text-4xl mb-2">{tool.icon}</div>
              <p className="text-sm font-medium text-gray-900">{tool.name}</p>
            </div>
          ))}
        </div>
      </div>

      {showManageModal && selectedIntegration && (
        <ManageIntegrationModal integration={selectedIntegration} onClose={() => setShowManageModal(false)} />
      )}
    </div>
  )
}
