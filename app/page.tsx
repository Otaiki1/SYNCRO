"use client"

import { useState, useCallback } from "react"
import { Home, CreditCard, BarChart3, Plug, Bell, Settings, Plus, Moon, Sun, Menu, X } from "lucide-react"
import DashboardPage from "@/components/pages/dashboard"
import SubscriptionsPage from "@/components/pages/subscriptions"
import AnalyticsPage from "@/components/pages/analytics"
import IntegrationsPage from "@/components/pages/integrations"
import SettingsPage from "@/components/pages/settings"
import OnboardingModal from "@/components/modals/onboarding-modal"
import AddSubscriptionModal from "@/components/modals/add-subscription-modal"
import UpgradePlanModal from "@/components/modals/upgrade-plan-modal"
import NotificationsPanel from "@/components/notifications-panel"
import ManageSubscriptionModal from "@/components/modals/manage-subscription-modal"
import InsightsModal from "@/components/modals/insights-modal"
import InsightsPage from "@/components/pages/insights"

export default function SubsyncApp() {
  const [activeView, setActiveView] = useState("dashboard")
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showAddSubscription, setShowAddSubscription] = useState(false)
  const [showUpgradePlan, setShowUpgradePlan] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showManageSubscription, setShowManageSubscription] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [currentPlan, setCurrentPlan] = useState("free")
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedSubscriptions, setSelectedSubscriptions] = useState(new Set())
  const [budgetLimit, setBudgetLimit] = useState(500)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showInsightsPage, setShowInsightsPage] = useState(false)

  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      name: "Midjourney",
      category: "Image Generation",
      price: 20,
      icon: "🎨",
      renewsIn: 5,
      status: "active",
      color: "#000000",
      renewalUrl: "https://www.midjourney.com/account/billing/manage",
      tags: ["image", "ai"],
      dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: "Gemini",
      category: "Image Generation",
      price: 20,
      icon: "💎",
      renewsIn: 12,
      status: "active",
      color: "#000000",
      renewalUrl: "https://gemini.google.com/app/settings",
      tags: ["image", "ai"],
      dateAdded: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      name: "Githubcopilot",
      category: "Code Generation",
      price: 20,
      icon: "👨‍💻",
      renewsIn: 5,
      status: "active",
      color: "#000000",
      renewalUrl: "https://github.com/settings/billing/summary",
      tags: ["code", "ai"],
      dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      name: "Notion AI",
      category: "Productivity",
      price: 20,
      icon: "📝",
      renewsIn: 5,
      status: "active",
      color: "#000000",
      renewalUrl: "https://www.notion.so/account/settings",
      tags: ["productivity"],
      dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 5,
      name: "ChatGPT Plus",
      category: "AI Chat",
      price: 20,
      icon: "🤖",
      renewsIn: 5,
      status: "active",
      color: "#000000",
      renewalUrl: "https://platform.openai.com/account/billing/overview",
      tags: ["chat", "ai"],
      dateAdded: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: 6,
      name: "Perplexity Pro",
      category: "Search",
      price: 20,
      icon: "🔍",
      renewsIn: 3,
      status: "expiring",
      color: "#000000",
      renewalUrl: "https://www.perplexity.ai/settings/subscription",
      tags: ["search", "ai"],
      dateAdded: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    },
  ])

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Spend Increases",
      description: "Your spend increased 18% this month - mostly from image generation tools",
      type: "info",
      read: false,
    },
    {
      id: 2,
      title: "Optimization Tip",
      description: "Consider consolidating your image generation tools to save costs",
      type: "tip",
      read: false,
    },
    {
      id: 3,
      title: "New Detection",
      description: "We detected a new Perplexity Pro subscription in your email",
      type: "alert",
      read: false,
    },
  ])

  const [integrations, setIntegrations] = useState([
    { id: 1, name: "Gmail", type: "Email Integration", status: "connected", lastSync: "2 minutes ago", accounts: 1 },
    { id: 2, name: "Plaid", type: "Banking Integration", status: "connected", lastSync: "2 minutes ago", accounts: 2 },
    { id: 3, name: "Manual tools", type: "Self-managed", status: "connected", lastSync: "2 minutes ago", accounts: 0 },
  ])

  const maxSubscriptions = currentPlan === "free" ? 5 : currentPlan === "pro" ? 20 : 100
  const totalSpend = subscriptions.reduce((sum, sub) => sum + sub.price, 0)

  const addToHistory = useCallback(
    (newState) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newState)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSubscriptions(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSubscriptions(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  const budgetExceeded = totalSpend > budgetLimit
  const budgetPercentage = (totalSpend / budgetLimit) * 100

  const checkDuplicate = (name) => {
    return subscriptions.some((sub) => sub.name.toLowerCase() === name.toLowerCase())
  }

  const handleManageSubscription = (subscription) => {
    setSelectedSubscription(subscription)
    setShowManageSubscription(true)
  }

  const handleRenewSubscription = (subscription) => {
    if (subscription.renewalUrl) {
      window.open(subscription.renewalUrl, "_blank")
    }
  }

  const handleViewInsights = () => {
    setShowInsights(true)
  }

  const handleAddSubscription = (newSub) => {
    if (checkDuplicate(newSub.name)) {
      alert(`${newSub.name} already exists in your subscriptions!`)
      return
    }

    if (subscriptions.length >= maxSubscriptions) {
      setShowUpgradePlan(true)
      return
    }

    const updatedSubs = [
      ...subscriptions,
      {
        ...newSub,
        id: Math.max(...subscriptions.map((s) => s.id), 0) + 1,
        tags: newSub.tags || [],
        dateAdded: new Date(),
      },
    ]
    setSubscriptions(updatedSubs)
    addToHistory(updatedSubs)
    setShowAddSubscription(false)
  }

  const handleDeleteSubscription = (id) => {
    const updatedSubs = subscriptions.filter((sub) => sub.id !== id)
    setSubscriptions(updatedSubs)
    addToHistory(updatedSubs)
  }

  const handleBulkDelete = () => {
    if (selectedSubscriptions.size === 0) return
    const updatedSubs = subscriptions.filter((sub) => !selectedSubscriptions.has(sub.id))
    setSubscriptions(updatedSubs)
    addToHistory(updatedSubs)
    setSelectedSubscriptions(new Set())
  }

  const handleToggleSubscriptionSelect = (id) => {
    const newSelected = new Set(selectedSubscriptions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedSubscriptions(newSelected)
  }

  const handleMarkNotificationRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleToggleIntegration = (id) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === id ? { ...int, status: int.status === "connected" ? "disconnected" : "connected" } : int,
      ),
    )
  }

  const handleUpgradePlan = (newPlan) => {
    setCurrentPlan(newPlan)
    setShowUpgradePlan(false)
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"} flex transition-colors duration-300`}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:relative w-56 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col transition-transform duration-300 z-40 h-screen bg-white dark:bg-gray-900`}
      >
        <div className="mb-12">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Subsync.AI</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "integrations", label: "Integrations", icon: Plug },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
              👤
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Caleb Alexhone</div>
              <button
                onClick={() => setShowUpgradePlan(true)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {currentPlan === "free" ? "Upgrade plan" : `${currentPlan} plan`}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        {showInsightsPage ? (
          <InsightsPage
            insights={notifications}
            totalSpend={totalSpend}
            onClose={() => setShowInsightsPage(false)}
            darkMode={darkMode}
          />
        ) : (
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {activeView === "dashboard" && "Dashboard"}
                  {activeView === "subscriptions" && "Subscriptions"}
                  {activeView === "analytics" && "Analytics"}
                  {activeView === "integrations" && "Integrations"}
                  {activeView === "settings" && "Settings"}
                </h2>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
                  {activeView === "dashboard" && "Welcome back! Here is your AI subscription overview."}
                  {activeView === "subscriptions" && "Manage and track all your AI tool subscriptions"}
                  {activeView === "analytics" && "View detailed analytics and spending insights"}
                  {activeView === "integrations" && "Central control for all your data connections"}
                  {activeView === "settings" && "Account management and preferences"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} rounded-lg transition-colors`}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} rounded-lg relative transition-colors`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {activeView === "subscriptions" && (
                  <button
                    onClick={() => setShowAddSubscription(true)}
                    className={`flex items-center gap-2 ${
                      darkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                    } px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add subscription</span>
                  </button>
                )}
              </div>
            </div>

            {/* Budget Alert */}
            {budgetExceeded && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Budget Alert: You've exceeded your ${budgetLimit} monthly limit by $
                  {(totalSpend - budgetLimit).toFixed(2)}
                </p>
                <div className="mt-2 w-full bg-red-200 dark:bg-red-800 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedSubscriptions.size > 0 && activeView === "subscriptions" && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedSubscriptions.size} subscription(s) selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Undo
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Redo
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            {/* Page Content */}
            {activeView === "dashboard" && (
              <DashboardPage
                subscriptions={subscriptions}
                totalSpend={totalSpend}
                insights={notifications}
                onViewInsights={handleViewInsights}
                onRenew={handleRenewSubscription}
                onManage={handleManageSubscription}
                darkMode={darkMode}
              />
            )}
            {activeView === "subscriptions" && (
              <SubscriptionsPage
                subscriptions={subscriptions}
                onDelete={handleDeleteSubscription}
                maxSubscriptions={maxSubscriptions}
                currentPlan={currentPlan}
                onManage={handleManageSubscription}
                onRenew={handleRenewSubscription}
                selectedSubscriptions={selectedSubscriptions}
                onToggleSelect={handleToggleSubscriptionSelect}
                darkMode={darkMode}
              />
            )}
            {activeView === "analytics" && (
              <AnalyticsPage subscriptions={subscriptions} totalSpend={totalSpend} darkMode={darkMode} />
            )}
            {activeView === "integrations" && (
              <IntegrationsPage integrations={integrations} onToggle={handleToggleIntegration} darkMode={darkMode} />
            )}
            {activeView === "settings" && (
              <SettingsPage
                currentPlan={currentPlan}
                onUpgrade={() => setShowUpgradePlan(true)}
                budgetLimit={budgetLimit}
                onBudgetChange={setBudgetLimit}
                darkMode={darkMode}
              />
            )}
          </div>
        )}
      </main>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onClose={() => setShowNotifications(false)}
          darkMode={darkMode}
        />
      )}

      {/* Modals */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} darkMode={darkMode} />}
      {showAddSubscription && (
        <AddSubscriptionModal
          onAdd={handleAddSubscription}
          onClose={() => setShowAddSubscription(false)}
          darkMode={darkMode}
        />
      )}
      {showUpgradePlan && (
        <UpgradePlanModal
          currentPlan={currentPlan}
          onUpgrade={handleUpgradePlan}
          onClose={() => setShowUpgradePlan(false)}
          darkMode={darkMode}
        />
      )}
      {showManageSubscription && selectedSubscription && (
        <ManageSubscriptionModal
          subscription={selectedSubscription}
          onClose={() => setShowManageSubscription(false)}
          onDelete={() => {
            handleDeleteSubscription(selectedSubscription.id)
            setShowManageSubscription(false)
          }}
          onEdit={() => {
            setShowManageSubscription(false)
            setShowAddSubscription(true)
          }}
          darkMode={darkMode}
        />
      )}
      {showInsights && (
        <InsightsModal
          insights={notifications}
          totalSpend={totalSpend}
          onClose={() => setShowInsights(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
