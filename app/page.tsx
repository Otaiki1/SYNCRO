"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Home,
  CreditCard,
  BarChart3,
  Plug,
  Bell,
  Settings,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  Users,
  Download,
} from "lucide-react"
import WelcomePage from "@/components/pages/welcome"
import EnterpriseSetup from "@/components/pages/enterprise-setup"
import DashboardPage from "@/components/pages/dashboard"
import SubscriptionsPage from "@/components/pages/subscriptions"
import AnalyticsPage from "@/components/pages/analytics"
import IntegrationsPage from "@/components/pages/integrations"
import SettingsPage from "@/components/pages/settings"
import TeamsPage from "@/components/pages/teams"
import OnboardingModal from "@/components/modals/onboarding-modal"
import AddSubscriptionModal from "@/components/modals/add-subscription-modal"
import UpgradePlanModal from "@/components/modals/upgrade-plan-modal"
import NotificationsPanel from "@/components/notifications-panel"
import ManageSubscriptionModal from "@/components/modals/manage-subscription-modal"
import InsightsModal from "@/components/modals/insights-modal"
import InsightsPage from "@/components/pages/insights"
import EditSubscriptionModal from "@/components/modals/edit-subscription-modal"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { validateSubscriptionData } from "@/lib/validation"
import { generateSafeCSV, downloadCSV } from "@/lib/csv-utils"

export default function SubsyncApp() {
  const [mode, setMode] = useState<"welcome" | "individual" | "enterprise" | "enterprise-setup">("welcome")
  const [workspace, setWorkspace] = useState<any>(null)
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
  const [showEditSubscription, setShowEditSubscription] = useState(false) // Declare the variable here

  const [toasts, setToasts] = useState([])
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const [operationTimeouts, setOperationTimeouts] = useState(new Map())

  const [priceChanges, setPriceChanges] = useState([
    {
      id: 1,
      subscriptionId: 2,
      name: "Netflix",
      oldPrice: 13.99,
      newPrice: 15.49,
      changeDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      annualImpact: 18,
    },
  ])

  const [renewalReminders, setRenewalReminders] = useState([])
  const [consolidationSuggestions, setConsolidationSuggestions] = useState([
    {
      id: 1,
      category: "Streaming",
      services: ["Netflix", "Disney+", "Spotify Premium"],
      currentCost: 34.47,
      suggestedBundle: "Disney+ Bundle (Disney+, Hulu, ESPN+)",
      bundleCost: 19.99,
      savings: 14.48,
    },
  ])

  const [emailAccounts, setEmailAccounts] = useState([
    {
      id: 1,
      email: "caleb@gmail.com",
      provider: "gmail",
      isPrimary: true,
      connectedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastScanned: new Date(Date.now() - 2 * 60 * 1000),
      subscriptionCount: 4,
    },
    {
      id: 2,
      email: "caleb.work@company.com",
      provider: "gmail",
      isPrimary: false,
      connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastScanned: new Date(Date.now() - 5 * 60 * 1000),
      subscriptionCount: 2,
    },
  ])

  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      name: "ChatGPT Plus",
      category: "AI Tools",
      price: 20,
      icon: "🤖",
      renewsIn: 5,
      status: "active",
      color: "#10A37F",
      renewalUrl: "https://platform.openai.com/account/billing/overview",
      tags: ["ai", "chat"],
      dateAdded: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      emailAccountId: 1,
      lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      hasApiKey: true,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 2,
      name: "Netflix",
      category: "Streaming",
      price: 15.49,
      icon: "🎬",
      renewsIn: 12,
      status: "active",
      color: "#E50914",
      renewalUrl: "https://www.netflix.com/account",
      tags: ["streaming", "entertainment"],
      dateAdded: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      emailAccountId: 1,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 3,
      name: "Spotify Premium",
      category: "Streaming",
      price: 10.99,
      icon: "🎵",
      renewsIn: 8,
      status: "active",
      color: "#1DB954",
      renewalUrl: "https://www.spotify.com/account/subscription/",
      tags: ["streaming", "music"],
      dateAdded: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      emailAccountId: 1,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 4,
      name: "Notion",
      category: "Productivity",
      price: 10,
      icon: "📝",
      renewsIn: 15,
      status: "active",
      color: "#000000",
      renewalUrl: "https://www.notion.so/account/settings",
      tags: ["productivity", "notes"],
      dateAdded: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      emailAccountId: 2,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 5,
      name: "Adobe Creative Cloud",
      category: "Design",
      price: 54.99,
      icon: "🎨",
      renewsIn: 20,
      status: "active",
      color: "#FF0000",
      renewalUrl: "https://account.adobe.com/plans",
      tags: ["design", "creative"],
      dateAdded: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      emailAccountId: 2,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 6,
      name: "GitHub Copilot",
      category: "AI Tools",
      price: 10,
      icon: "👨‍💻",
      renewsIn: 5,
      status: "trial",
      color: "#000000",
      renewalUrl: "https://github.com/settings/billing/summary",
      tags: ["ai", "code", "development"],
      dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      emailAccountId: 2,
      lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      hasApiKey: false,
      isTrial: true,
      trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priceAfterTrial: 10,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 7,
      name: "Midjourney",
      category: "AI Tools",
      price: 30,
      icon: "🖼️",
      renewsIn: 10,
      status: "active",
      color: "#000000",
      renewalUrl: "https://www.midjourney.com/account/billing/manage",
      tags: ["ai", "image", "creative"],
      dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      emailAccountId: 1,
      lastUsedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      hasApiKey: true,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 8,
      name: "Microsoft 365",
      category: "Productivity",
      price: 6.99,
      icon: "💼",
      renewsIn: 25,
      status: "active",
      color: "#0078D4",
      renewalUrl: "https://account.microsoft.com/services/",
      tags: ["productivity", "office"],
      dateAdded: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      emailAccountId: 2,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 9,
      name: "Disney+",
      category: "Streaming",
      price: 7.99,
      icon: "🏰",
      renewsIn: 18,
      status: "active",
      color: "#113CCF",
      renewalUrl: "https://www.disneyplus.com/account",
      tags: ["streaming", "entertainment"],
      dateAdded: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      emailAccountId: 1,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 10,
      name: "Figma Professional",
      category: "Design",
      price: 12,
      icon: "🎯",
      renewsIn: 7,
      status: "trial",
      color: "#F24E1E",
      renewalUrl: "https://www.figma.com/settings",
      tags: ["design", "ui", "collaboration"],
      dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      emailAccountId: 2,
      isTrial: true,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priceAfterTrial: 12,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 11,
      name: "Vercel Pro",
      category: "Development",
      price: 20,
      icon: "▲",
      renewsIn: 3,
      status: "cancelled",
      color: "#000000",
      renewalUrl: "https://vercel.com/account/billing",
      tags: ["development", "hosting"],
      dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      emailAccountId: 2,
      isTrial: false,
      source: "manual",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "variable",
      priceRange: { min: 15, max: 50 },
      priceHistory: [
        { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), amount: 18 },
        { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), amount: 22 },
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), amount: 20 },
      ],
      billingCycle: "monthly",
      cancelledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      activeUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 13,
      name: "ChatGPT Plus",
      category: "AI Tools",
      price: 20,
      icon: "🤖",
      renewsIn: 8,
      status: "active",
      color: "#10A37F",
      renewalUrl: "https://platform.openai.com/account/billing/overview",
      tags: ["ai", "chat"],
      dateAdded: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      emailAccountId: 2,
      lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      hasApiKey: true,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
    },
    {
      id: 14,
      name: "Spotify Premium",
      category: "Streaming",
      price: 10.99,
      icon: "🎵",
      renewsIn: 0,
      status: "paused",
      color: "#1DB954",
      renewalUrl: "https://www.spotify.com/account/subscription/",
      tags: ["streaming", "music"],
      dateAdded: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      emailAccountId: 1,
      isTrial: false,
      source: "auto_detected",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "monthly",
      pausedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      resumesAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 15,
      name: "Notion Lifetime",
      category: "Productivity",
      price: 299,
      icon: "📝",
      renewsIn: null,
      status: "active",
      color: "#000000",
      renewalUrl: null,
      tags: ["productivity", "notes"],
      dateAdded: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      emailAccountId: 1,
      isTrial: false,
      source: "manual",
      manuallyEdited: false,
      editedFields: [],
      pricingType: "fixed",
      billingCycle: "lifetime",
    },
  ])

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Duplicate Subscription Detected",
      description: "You have 2 ChatGPT Plus accounts across different emails - Potential savings: $20/month",
      type: "duplicate",
      read: false,
      duplicateInfo: {
        name: "ChatGPT Plus",
        count: 2,
        totalCost: 40,
        potentialSavings: 20,
      },
    },
    {
      id: 2,
      title: "Unused AI Tool",
      description: "Midjourney hasn't been used in 35 days - Consider canceling to save $30/month",
      type: "unused",
      read: false,
      subscriptionId: 7,
    },
    {
      id: 3,
      title: "Spend Increases",
      description: "Your spend increased 18% this month - mostly from image generation tools",
      type: "info",
      read: false,
    },
    {
      id: 4,
      title: "New Detection",
      description: "We detected a new Perplexity Pro subscription in your email",
      type: "alert",
      read: false,
      detectedSubscription: {
        name: "Perplexity Pro",
        category: "AI Tools",
        price: 20,
        logo: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png",
        tags: ["search", "ai"],
        renewsIn: 30,
        status: "active",
        icon: "🔍",
        color: "#000000",
        renewalUrl: "https://www.perplexity.ai/settings/subscription",
        emailAccountId: 1,
      },
    },
  ])

  const [integrations, setIntegrations] = useState([
    { id: 1, name: "Gmail", type: "Email Integration", status: "connected", lastSync: "2 minutes ago", accounts: 2 },
    { id: 2, name: "Plaid", type: "Banking Integration", status: "connected", lastSync: "2 minutes ago", accounts: 2 },
    { id: 3, name: "Manual tools", type: "Self-managed", status: "connected", lastSync: "2 minutes ago", accounts: 0 },
  ])

  const handleModeSelect = (selectedMode: "individual" | "enterprise") => {
    if (selectedMode === "individual") {
      setMode("individual")
    } else {
      setMode("enterprise-setup")
    }
  }

  const handleEnterpriseSetupComplete = (workspaceData: any) => {
    setWorkspace(workspaceData)
    setMode("enterprise")
    setCurrentPlan("enterprise")
  }

  const handleBackToWelcome = () => {
    setMode("welcome")
  }

  const maxSubscriptions = currentPlan === "free" ? 5 : currentPlan === "pro" ? 20 : 100
  const recurringSpend = subscriptions
    .filter((sub) => sub.billingCycle !== "lifetime" && sub.status === "active")
    .reduce((sum, sub) => sum + sub.price, 0)
  const totalSpend = subscriptions
    .filter((sub) => sub.status === "active" || sub.status === "cancelled")
    .reduce((sum, sub) => {
      if (sub.billingCycle === "lifetime") {
        return sum
      }
      return sum + sub.price
    }, 0)

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

  const checkRenewalReminders = () => {
    const reminders = subscriptions
      .filter((sub) => {
        if (sub.status !== "active") return false
        const daysUntilRenewal = sub.renewsIn || 0
        return daysUntilRenewal <= 3 && daysUntilRenewal >= 0
      })
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        price: sub.price,
        renewsIn: sub.renewsIn,
        renewalDate: new Date(Date.now() + sub.renewsIn * 24 * 60 * 60 * 1000),
      }))

    setRenewalReminders(reminders)
  }

  const checkBudgetAlerts = () => {
    const percentage = (totalSpend / budgetLimit) * 100

    if (percentage >= 100) {
      return {
        level: "critical",
        message: `You've exceeded your $${budgetLimit} budget by $${(totalSpend - budgetLimit).toFixed(2)}`,
        percentage: percentage.toFixed(0),
      }
    } else if (percentage >= 80) {
      return {
        level: "warning",
        message: `You've used ${percentage.toFixed(0)}% of your $${budgetLimit} budget`,
        percentage: percentage.toFixed(0),
      }
    }

    return null
  }

  useEffect(() => {
    checkRenewalReminders()
  }, [subscriptions])

  const budgetAlert = checkBudgetAlerts()

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
    setShowInsightsPage(true)
  }

  const showToast = useCallback((toast) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleAddSubscription = async (newSub) => {
    const validation = validateSubscriptionData(newSub)
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]
      showToast({
        title: "Validation error",
        description: firstError,
        variant: "error",
      })
      return
    }

    if (checkDuplicate(newSub.name)) {
      showToast({
        title: "Duplicate subscription",
        description: `${newSub.name} already exists in your subscriptions`,
        variant: "error",
      })
      return
    }

    if (subscriptions.length >= maxSubscriptions) {
      setShowUpgradePlan(true)
      return
    }

    setLoading(true)

    try {
      await withTimeout(new Promise((resolve) => setTimeout(resolve, 500)), 30000)

      const updatedSubs = [
        ...subscriptions,
        {
          ...newSub,
          id: Math.max(...subscriptions.map((s) => s.id), 0) + 1,
          tags: newSub.tags || [],
          dateAdded: new Date(),
          emailAccountId: emailAccounts.find((acc) => acc.isPrimary)?.id || 1,
          source: "manual",
          manuallyEdited: false,
          editedFields: [],
          pricingType: "fixed",
          billingCycle: "monthly",
        },
      ]
      setSubscriptions(updatedSubs)
      addToHistory(updatedSubs)
      setShowAddSubscription(false)

      showToast({
        title: "Subscription added",
        description: `${newSub.name} has been added to your subscriptions`,
        variant: "success",
        action: {
          label: "Undo",
          onClick: () => {
            undo()
            showToast({
              title: "Undone",
              description: "Subscription addition has been undone",
              variant: "default",
            })
          },
        },
      })
    } catch (error) {
      showToast({
        title: "Error",
        description: error.message || "Failed to add subscription",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscription = (id) => {
    const sub = subscriptions.find((s) => s.id === id)
    if (!sub) return

    setConfirmDialog({
      title: "Delete subscription?",
      description: `Are you sure you want to delete ${sub.name}? This action cannot be undone.`,
      variant: "danger",
      confirmLabel: "Delete",
      onConfirm: () => {
        const updatedSubs = subscriptions.filter((s) => s.id !== id)
        setSubscriptions(updatedSubs)
        addToHistory(updatedSubs)
        setConfirmDialog(null)

        showToast({
          title: "Subscription deleted",
          description: `${sub.name} has been removed`,
          variant: "success",
          action: {
            label: "Undo",
            onClick: () => {
              undo()
              showToast({
                title: "Undone",
                description: "Subscription has been restored",
                variant: "default",
              })
            },
          },
        })
      },
      onCancel: () => setConfirmDialog(null),
    })
  }

  const handleBulkDelete = () => {
    if (selectedSubscriptions.size === 0) {
      showToast({
        title: "No subscriptions selected",
        description: "Please select at least one subscription to delete",
        variant: "error",
      })
      return
    }

    setConfirmDialog({
      title: "Delete selected subscriptions?",
      description: `Are you sure you want to delete ${selectedSubscriptions.size} subscription(s)? This action cannot be undone.`,
      variant: "danger",
      confirmLabel: "Delete All",
      onConfirm: async () => {
        setBulkActionLoading(true)
        setConfirmDialog(null)

        const results = []
        const selectedIds = Array.from(selectedSubscriptions)

        for (const id of selectedIds) {
          try {
            // Simulate async operation with potential failure
            await new Promise((resolve, reject) => {
              setTimeout(() => {
                // Simulate 10% failure rate for demo
                if (Math.random() < 0.1) {
                  reject(new Error("Failed to delete"))
                } else {
                  resolve(true)
                }
              }, 100)
            })
            results.push({ id, success: true })
          } catch (error) {
            results.push({ id, success: false, error: error.message })
          }
        }

        const successCount = results.filter((r) => r.success).length
        const failureCount = results.filter((r) => !r.success).length

        const successfulIds = results.filter((r) => r.success).map((r) => r.id)
        const updatedSubs = subscriptions.filter((sub) => !successfulIds.includes(sub.id))
        setSubscriptions(updatedSubs)
        addToHistory(updatedSubs)

        setSelectedSubscriptions(new Set())
        setBulkActionLoading(false)

        if (failureCount === 0) {
          showToast({
            title: "All subscriptions deleted",
            description: `Successfully deleted ${successCount} subscription(s)`,
            variant: "success",
            action: {
              label: "Undo",
              onClick: () => {
                undo()
                showToast({
                  title: "Undone",
                  description: "Subscriptions have been restored",
                  variant: "default",
                })
              },
            },
          })
        } else {
          showToast({
            title: "Partial deletion",
            description: `${successCount} succeeded, ${failureCount} failed. Please try again for failed items.`,
            variant: "warning",
          })
        }
      },
      onCancel: () => setConfirmDialog(null),
    })
  }

  const handleBulkExport = () => {
    if (selectedSubscriptions.size === 0) {
      showToast({
        title: "No subscriptions selected",
        description: "Please select at least one subscription to export",
        variant: "error",
      })
      return
    }

    const selectedSubs = subscriptions.filter((sub) => selectedSubscriptions.has(sub.id))

    const headers = ["Name", "Category", "Price", "Billing Cycle", "Status", "Renewal Date", "Email"]
    const rows = selectedSubs.map((sub) => [
      sub.name,
      sub.category,
      sub.price,
      sub.billingCycle || "monthly",
      sub.status,
      sub.renewsIn ? `${sub.renewsIn} days` : "N/A",
      sub.email || "N/A",
    ])

    const csvContent = generateSafeCSV(headers, rows)
    downloadCSV(csvContent, "subscriptions-export")

    showToast({
      title: "Export successful",
      description: `${selectedSubs.length} subscription(s) exported to CSV`,
      variant: "success",
    })
  }

  const withTimeout = async (promise: Promise<any>, timeoutMs = 30000) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    })

    try {
      return await Promise.race([promise, timeoutPromise])
    } catch (error) {
      if (error.message === "Operation timed out") {
        showToast({
          title: "Operation timed out",
          description: "The operation took too long. Please try again.",
          variant: "error",
        })
      }
      throw error
    }
  }

  const handleBulkCancel = () => {
    if (selectedSubscriptions.size === 0) return

    setConfirmDialog({
      title: "Cancel selected subscriptions?",
      description: `Are you sure you want to cancel ${selectedSubscriptions.size} subscription(s)? They will remain active until their renewal date.`,
      variant: "warning",
      confirmLabel: "Cancel All",
      onConfirm: async () => {
        setBulkActionLoading(true)
        setConfirmDialog(null)

        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 800))

        const updatedSubs = subscriptions.map((sub) => {
          if (selectedSubscriptions.has(sub.id)) {
            const daysUntilRenewal = sub.renewsIn || 0
            const activeUntil = new Date(Date.now() + daysUntilRenewal * 24 * 60 * 60 * 1000)
            return {
              ...sub,
              status: "cancelled",
              cancelledAt: new Date(),
              activeUntil,
            }
          }
          return sub
        })

        setSubscriptions(updatedSubs)
        addToHistory(updatedSubs)

        const count = selectedSubscriptions.size
        setSelectedSubscriptions(new Set())
        setBulkActionLoading(false)

        showToast({
          title: "Subscriptions cancelled",
          description: `${count} subscription(s) have been cancelled`,
          variant: "success",
        })
      },
      onCancel: () => setConfirmDialog(null),
    })
  }

  const handleBulkPause = () => {
    if (selectedSubscriptions.size === 0) return

    setConfirmDialog({
      title: "Pause selected subscriptions?",
      description: `Are you sure you want to pause ${selectedSubscriptions.size} subscription(s)? They will be paused for 30 days.`,
      variant: "warning",
      confirmLabel: "Pause All",
      onConfirm: async () => {
        setBulkActionLoading(true)
        setConfirmDialog(null)

        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 800))

        const updatedSubs = subscriptions.map((sub) => {
          if (selectedSubscriptions.has(sub.id)) {
            return {
              ...sub,
              status: "paused",
              pausedAt: new Date(),
              resumesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          }
          return sub
        })

        setSubscriptions(updatedSubs)
        addToHistory(updatedSubs)

        const count = selectedSubscriptions.size
        setSelectedSubscriptions(new Set())
        setBulkActionLoading(false)

        showToast({
          title: "Subscriptions paused",
          description: `${count} subscription(s) have been paused for 30 days`,
          variant: "success",
        })
      },
      onCancel: () => setConfirmDialog(null),
    })
  }

  const handleAddFromNotification = (subscription) => {
    if (checkDuplicate(subscription.name)) {
      alert(`${subscription.name} already exists in your subscriptions!`)
      return
    }

    if (subscriptions.length >= maxSubscriptions) {
      setShowUpgradePlan(true)
      return
    }

    const updatedSubs = [
      ...subscriptions,
      {
        ...subscription,
        id: Math.max(...subscriptions.map((s) => s.id), 0) + 1,
        dateAdded: new Date(),
        emailAccountId: subscription.emailAccountId || emailAccounts.find((acc) => acc.isPrimary)?.id || 1,
        source: "manual",
        manuallyEdited: false,
        editedFields: [],
        pricingType: "fixed",
        billingCycle: "monthly",
      },
    ]
    setSubscriptions(updatedSubs)
    addToHistory(updatedSubs)
  }

  const handleRemoveEmailAccount = (id: number) => {
    const emailToRemove = emailAccounts.find((acc) => acc.id === id)

    if (!emailToRemove) return

    // Prevent deletion of primary email
    if (emailToRemove.isPrimary) {
      const otherEmails = emailAccounts.filter((acc) => acc.id !== id)

      if (otherEmails.length === 0) {
        alert("Cannot delete your last email account. You need at least one email to track subscriptions.")
        return
      }

      alert("Cannot delete primary email. Please set another email as primary first.")
      return
    }

    // Mark subscriptions from this email as "source_removed"
    const affectedSubscriptions = subscriptions.filter((sub) => sub.emailAccountId === id)

    if (affectedSubscriptions.length > 0) {
      const confirmDelete = window.confirm(
        `This email has ${affectedSubscriptions.length} subscription(s). These will be marked as "source removed" but kept for your records. Continue?`,
      )

      if (!confirmDelete) return

      // Update subscriptions to mark as source_removed
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.emailAccountId === id
            ? {
                ...sub,
                status: "source_removed",
                statusNote: `Email ${emailToRemove.email} was disconnected on ${new Date().toLocaleDateString()}`,
              }
            : sub,
        ),
      )
    }

    setEmailAccounts(emailAccounts.filter((acc) => acc.id !== id))

    // Update integrations count
    setIntegrations(
      integrations.map((int) => (int.name === "Gmail" ? { ...int, accounts: emailAccounts.length - 1 } : int)),
    )
  }

  const handleSetPrimaryEmail = (id: number) => {
    const newPrimary = emailAccounts.find((acc) => acc.id === id)

    if (!newPrimary) return

    const confirmChange = window.confirm(
      `Set ${newPrimary.email} as your primary email? This will be used for new subscriptions and notifications.`,
    )

    if (!confirmChange) return

    setEmailAccounts(
      emailAccounts.map((acc) => ({
        ...acc,
        isPrimary: acc.id === id,
      })),
    )
  }

  const handleRescanEmail = (id: number) => {
    setEmailAccounts(emailAccounts.map((acc) => (acc.id === id ? { ...acc, lastScanned: new Date() } : acc)))
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length

  const detectDuplicates = () => {
    const duplicates = []
    const subscriptionNames = {}

    subscriptions.forEach((sub) => {
      const name = sub.name.toLowerCase()
      if (!subscriptionNames[name]) {
        subscriptionNames[name] = []
      }
      subscriptionNames[name].push(sub)
    })

    Object.entries(subscriptionNames).forEach(([name, subs]) => {
      if (subs.length > 1) {
        const totalCost = subs.reduce((sum, s) => sum + s.price, 0)
        const potentialSavings = totalCost - subs[0].price
        duplicates.push({
          name: subs[0].name,
          count: subs.length,
          subscriptions: subs,
          totalCost,
          potentialSavings,
        })
      }
    })

    return duplicates
  }

  const detectUnusedSubscriptions = () => {
    const now = new Date()
    return subscriptions
      .filter((sub) => {
        // Only check AI tools that have API keys connected
        if (sub.category !== "AI Tools" || !sub.hasApiKey) return false
        if (!sub.lastUsedAt) return false
        const daysSinceLastUse = Math.floor((now - sub.lastUsedAt) / (1000 * 60 * 60 * 24))
        return daysSinceLastUse >= 30
      })
      .map((sub) => {
        const daysSinceLastUse = Math.floor((now - sub.lastUsedAt) / (1000 * 60 * 60 * 24))
        return {
          ...sub,
          daysSinceLastUse,
        }
      })
  }

  const getTrialSubscriptions = () => {
    return subscriptions.filter((sub) => sub.isTrial)
  }

  const getCancelledSubscriptions = () => {
    return subscriptions.filter((sub) => sub.status === "cancelled")
  }

  const getPausedSubscriptions = () => {
    return subscriptions.filter((sub) => sub.status === "paused")
  }

  const handleEditSubscription = (id: number, updates: any) => {
    setSubscriptions(
      subscriptions.map((sub) => {
        if (sub.id !== id) return sub

        const editedFields = Object.keys(updates).filter((key) => updates[key] !== sub[key])

        return {
          ...sub,
          ...updates,
          manuallyEdited: true,
          editedFields: [...new Set([...sub.editedFields, ...editedFields])],
          source: sub.source === "auto_detected" ? "manual" : sub.source,
        }
      }),
    )
    setShowEditSubscription(false)
  }

  const handleCancelSubscription = (id: number) => {
    const sub = subscriptions.find((s) => s.id === id)
    if (!sub) return

    const daysUntilRenewal = sub.renewsIn || 0
    const activeUntil = new Date(Date.now() + daysUntilRenewal * 24 * 60 * 60 * 1000)

    setSubscriptions(
      subscriptions.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "cancelled",
              cancelledAt: new Date(),
              activeUntil,
            }
          : s,
      ),
    )
  }

  const handlePauseSubscription = (id: number, resumeDate?: Date) => {
    const sub = subscriptions.find((s) => s.id === id)
    if (!sub) return

    setSubscriptions(
      subscriptions.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "paused",
              pausedAt: new Date(),
              resumesAt: resumeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          : s,
      ),
    )
  }

  const handleResumeSubscription = (id: number) => {
    setSubscriptions(
      subscriptions.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "active",
              pausedAt: undefined,
              resumesAt: undefined,
            }
          : s,
      ),
    )
  }

  const duplicates = detectDuplicates()
  const unusedSubscriptions = detectUnusedSubscriptions()
  const trialSubscriptions = getTrialSubscriptions()
  const cancelledSubscriptions = getCancelledSubscriptions()
  const pausedSubscriptions = getPausedSubscriptions()

  // UNDECLARED VARIABLES FIXES
  const handleToggleSubscriptionSelect = (id: number) => {
    setSelectedSubscriptions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleToggleIntegration = (id: number) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id ? { ...int, status: int.status === "connected" ? "disconnected" : "connected" } : int,
      ),
    )
  }

  const handleMarkNotificationRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleUpgradePlan = (newPlan: string) => {
    setCurrentPlan(newPlan)
    setShowUpgradePlan(false)
    showToast({
      title: "Plan upgraded",
      description: `Your plan has been upgraded to ${newPlan}`,
      variant: "success",
    })
  }

  const handleAddEmailAccount = (emailAccountData: any) => {
    const newId = emailAccounts.length > 0 ? Math.max(...emailAccounts.map((acc) => acc.id)) + 1 : 1
    setEmailAccounts([...emailAccounts, { ...emailAccountData, id: newId }])
    setIntegrations(
      integrations.map((int) => (int.name === "Gmail" ? { ...int, accounts: emailAccounts.length + 1 } : int)),
    )
    showToast({
      title: "Email account added",
      description: `${emailAccountData.email} has been successfully connected.`,
      variant: "success",
    })
  }

  useEffect(() => {
    const newNotifications = []

    // Price change notifications
    priceChanges.forEach((change) => {
      newNotifications.push({
        id: `price_${change.id}`,
        title: "Price Increase Detected",
        description: `${change.name} increased from $${change.oldPrice} to $${change.newPrice} (+$${change.annualImpact}/year)`,
        type: "price_change",
        read: false,
        priceChangeInfo: change,
      })
    })

    // Renewal reminder notifications
    renewalReminders.forEach((reminder) => {
      newNotifications.push({
        id: `renewal_${reminder.id}`,
        title: "Upcoming Renewal",
        description: `${reminder.name} renews in ${reminder.renewsIn} day${reminder.renewsIn !== 1 ? "s" : ""} ($${reminder.price})`,
        type: "renewal",
        read: false,
        subscriptionId: reminder.id,
      })
    })

    // Budget alert notifications
    if (budgetAlert) {
      newNotifications.push({
        id: "budget_alert",
        title: budgetAlert.level === "critical" ? "Budget Exceeded" : "Budget Warning",
        description: budgetAlert.message,
        type: "budget",
        read: false,
      })
    }

    // Consolidation suggestion notifications
    consolidationSuggestions.forEach((suggestion) => {
      newNotifications.push({
        id: `consolidation_${suggestion.id}`,
        title: "Consolidation Opportunity",
        description: `You have ${suggestion.services.length} ${suggestion.category} services - Consider ${suggestion.suggestedBundle} and save $${suggestion.savings}/month`,
        type: "consolidation",
        read: false,
        suggestionId: suggestion.id,
      })
    })

    // Merge with existing notifications (avoid duplicates)
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id))
      const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id))
      return [...prev, ...uniqueNew]
    })
  }, [priceChanges, renewalReminders, budgetAlert, consolidationSuggestions])

  const handleResolveNotificationAction = (action, data) => {
    console.log("[v0] Resolving notification action:", action, data)

    switch (action) {
      case "resolve_duplicate":
        // Keep only one subscription, remove others
        const duplicateInfo = data
        const subsToKeep = duplicateInfo.subscriptions[0]
        const subsToRemove = duplicateInfo.subscriptions.slice(1)

        setConfirmDialog({
          title: "Resolve duplicate subscriptions?",
          description: `This will keep ${subsToKeep.name} and remove ${subsToRemove.length} duplicate(s). You'll save $${duplicateInfo.potentialSavings}/month.`,
          variant: "warning",
          confirmLabel: "Resolve",
          onConfirm: () => {
            const idsToRemove = subsToRemove.map((s) => s.id)
            const updatedSubs = subscriptions.filter((sub) => !idsToRemove.includes(sub.id))
            setSubscriptions(updatedSubs)
            addToHistory(updatedSubs)
            setConfirmDialog(null)

            showToast({
              title: "Duplicate resolved",
              description: `Removed ${subsToRemove.length} duplicate subscription(s). Saving $${duplicateInfo.potentialSavings}/month`,
              variant: "success",
            })
          },
          onCancel: () => setConfirmDialog(null),
        })
        break

      case "cancel_unused":
        const unusedSub = subscriptions.find((s) => s.id === data)
        if (unusedSub) {
          setConfirmDialog({
            title: "Cancel unused subscription?",
            description: `Cancel ${unusedSub.name}? It hasn't been used in over 30 days.`,
            variant: "warning",
            confirmLabel: "Cancel Subscription",
            onConfirm: () => {
              handleCancelSubscription(data)
              setConfirmDialog(null)
              showToast({
                title: "Subscription cancelled",
                description: "Unused subscription has been cancelled",
                variant: "success",
              })
            },
            onCancel: () => setConfirmDialog(null),
          })
        }
        break

      case "cancel_trial":
        const trialSub = subscriptions.find((s) => s.id === data)
        if (trialSub) {
          setConfirmDialog({
            title: "Cancel trial subscription?",
            description: `Cancel ${trialSub.name} before you're charged $${trialSub.priceAfterTrial}?`,
            variant: "warning",
            confirmLabel: "Cancel Trial",
            onConfirm: () => {
              handleCancelSubscription(data)
              setConfirmDialog(null)
              showToast({
                title: "Trial cancelled",
                description: "Trial subscription has been cancelled before charge",
                variant: "success",
              })
            },
            onCancel: () => setConfirmDialog(null),
          })
        }
        break

      case "view_consolidation":
        // Open analytics or show consolidation details
        setShowInsightsPage(true)
        break
    }
  }

  if (showOnboarding) {
    return (
      <OnboardingModal
        onClose={() => setShowOnboarding(false)}
        onModeSelect={handleModeSelect}
        darkMode={darkMode}
        emailAccounts={emailAccounts}
        onAddEmailAccount={handleAddEmailAccount}
        onRemoveEmailAccount={handleRemoveEmailAccount}
      />
    )
  }

  if (mode === "welcome") {
    return <WelcomePage onSelectMode={handleModeSelect} darkMode={darkMode} />
  }

  if (mode === "enterprise-setup") {
    return (
      <EnterpriseSetup onComplete={handleEnterpriseSetupComplete} onBack={handleBackToWelcome} darkMode={darkMode} />
    )
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-[#1E2A35] text-[#F9F6F2]" : "bg-[#F9F6F2] text-[#1E2A35]"} flex transition-colors duration-300`}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 ${darkMode ? "hover:bg-[#2D3748]" : "hover:bg-gray-100"} rounded-lg`}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:relative w-56 border-r ${darkMode ? "border-[#374151] bg-[#2D3748]" : "border-gray-200 bg-white"} p-6 flex flex-col transition-transform duration-300 z-40 h-screen`}
      >
        <div className="mb-12">
          <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>Subsync.AI</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "integrations", label: "Integrations", icon: Plug },
            ...(mode === "enterprise" ? [{ id: "teams", label: "Teams", icon: Users }] : []),
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
                    ? darkMode
                      ? "bg-[#FFD166] text-[#1E2A35]"
                      : "bg-[#1E2A35] text-white"
                    : darkMode
                      ? "text-[#F9F6F2] hover:bg-[#374151]"
                      : "text-[#1E2A35] hover:bg-[#F9F6F2]"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className={`mt-auto pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${darkMode ? "bg-[#FFD166]" : "bg-[#FFD166]"} rounded-full flex items-center justify-center text-lg text-[#1E2A35]`}
            >
              👤
            </div>
            <div className="flex-1">
              <div className={`text-sm font-semibold ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>
                Caleb Alexhone
              </div>
              <button
                onClick={() => setShowUpgradePlan(true)}
                className={`text-xs ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
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
                <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>
                  {activeView === "dashboard" && "Dashboard"}
                  {activeView === "subscriptions" && "Subscriptions"}
                  {activeView === "analytics" && "Analytics"}
                  {activeView === "integrations" && "Integrations"}
                  {activeView === "teams" && "Teams"}
                  {activeView === "settings" && "Settings"}
                </h2>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
                  {activeView === "dashboard" && "Welcome back! Here is your AI subscription overview."}
                  {activeView === "subscriptions" && "Manage and track all your AI tool subscriptions"}
                  {activeView === "analytics" && "View detailed analytics and spending insights"}
                  {activeView === "integrations" && "Central control for all your data connections"}
                  {activeView === "teams" && "Manage your team members and their subscriptions"}
                  {activeView === "settings" && "Account management and preferences"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 ${darkMode ? "hover:bg-[#2D3748]" : "hover:bg-gray-100"} rounded-lg transition-colors`}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 ${darkMode ? "hover:bg-[#2D3748]" : "hover:bg-gray-100"} rounded-lg relative transition-colors`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 bg-[#E86A33] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                {activeView === "subscriptions" && (
                  <button
                    onClick={() => setShowAddSubscription(true)}
                    className={`flex items-center gap-2 ${
                      darkMode
                        ? "bg-[#FFD166] text-[#1E2A35] hover:bg-[#FFD166]/90"
                        : "bg-[#1E2A35] text-white hover:bg-[#2D3748]"
                    } px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add subscription</span>
                  </button>
                )}
              </div>
            </div>

            {budgetAlert && (
              <div
                className={`mb-6 p-4 ${
                  budgetAlert.level === "critical"
                    ? darkMode
                      ? "bg-[#E86A33]/20 border-[#E86A33]"
                      : "bg-red-50 border-red-200"
                    : darkMode
                      ? "bg-[#FFD166]/20 border-[#FFD166]"
                      : "bg-yellow-50 border-yellow-200"
                } border rounded-lg`}
              >
                <p
                  className={`text-sm font-medium ${
                    budgetAlert.level === "critical"
                      ? darkMode
                        ? "text-[#E86A33]"
                        : "text-red-800"
                      : darkMode
                        ? "text-[#FFD166]"
                        : "text-yellow-800"
                  }`}
                >
                  {budgetAlert.level === "critical" ? "🚨 " : "⚠️ "}
                  {budgetAlert.message}
                </p>
                <div
                  className={`mt-2 w-full ${
                    budgetAlert.level === "critical"
                      ? darkMode
                        ? "bg-[#E86A33]/30"
                        : "bg-red-200"
                      : darkMode
                        ? "bg-[#FFD166]/30"
                        : "bg-yellow-200"
                  } rounded-full h-2`}
                >
                  <div
                    className={budgetAlert.level === "critical" ? "bg-[#E86A33]" : "bg-[#FFD166]"}
                    style={{
                      width: `${Math.min(Number.parseFloat(budgetAlert.percentage), 100)}%`,
                      height: "100%",
                      borderRadius: "9999px",
                    }}
                  ></div>
                </div>
              </div>
            )}

            {selectedSubscriptions.size > 0 && activeView === "subscriptions" && (
              <div
                className={`mb-6 p-4 ${darkMode ? "bg-[#007A5C]/20 border-[#007A5C]" : "bg-blue-50 border-blue-200"} border rounded-lg flex items-center justify-between`}
              >
                <p className={`text-sm font-medium ${darkMode ? "text-[#007A5C]" : "text-blue-800"}`}>
                  {selectedSubscriptions.size} subscription(s) selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0 || bulkActionLoading}
                    className={`px-3 py-1.5 text-sm ${darkMode ? "bg-[#2D3748] hover:bg-[#374151]" : "bg-gray-200 hover:bg-gray-300"} rounded disabled:opacity-50 flex items-center gap-2`}
                  >
                    {bulkActionLoading ? <LoadingSpinner size="sm" darkMode={darkMode} /> : "Undo"}
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1 || bulkActionLoading}
                    className={`px-3 py-1.5 text-sm ${darkMode ? "bg-[#2D3748] hover:bg-[#374151]" : "bg-gray-200 hover:bg-gray-300"} rounded disabled:opacity-50`}
                  >
                    Redo
                  </button>
                  <button
                    onClick={handleBulkExport}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-sm bg-[#007A5C] text-white rounded hover:bg-[#007A5C]/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={handleBulkPause}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-sm bg-[#FFD166] text-[#1E2A35] rounded hover:bg-[#FFD166]/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {bulkActionLoading && <LoadingSpinner size="sm" />}
                    Pause Selected
                  </button>
                  <button
                    onClick={handleBulkCancel}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-sm bg-[#FFD166] text-[#1E2A35] rounded hover:bg-[#FFD166]/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {bulkActionLoading && <LoadingSpinner size="sm" />}
                    Cancel Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="px-3 py-1.5 text-sm bg-[#E86A33] text-white rounded hover:bg-[#E86A33]/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {bulkActionLoading && <LoadingSpinner size="sm" darkMode />}
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
                emailAccounts={emailAccounts}
                trialSubscriptions={trialSubscriptions}
                cancelledSubscriptions={cancelledSubscriptions}
                pausedSubscriptions={pausedSubscriptions}
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
                emailAccounts={emailAccounts}
                onEdit={handleEditSubscription}
                onCancel={handleCancelSubscription}
                onPause={handlePauseSubscription}
              />
            )}
            {activeView === "analytics" && (
              <AnalyticsPage subscriptions={subscriptions} totalSpend={totalSpend} darkMode={darkMode} />
            )}
            {activeView === "integrations" && (
              <IntegrationsPage integrations={integrations} onToggle={handleToggleIntegration} darkMode={darkMode} />
            )}
            {activeView === "teams" && (
              <TeamsPage
                workspace={workspace}
                subscriptions={subscriptions}
                darkMode={darkMode}
                emailAccounts={emailAccounts}
              />
            )}
            {activeView === "settings" && (
              <SettingsPage
                currentPlan={currentPlan}
                onUpgrade={handleUpgradePlan}
                budgetLimit={budgetLimit}
                onBudgetChange={setBudgetLimit}
                darkMode={darkMode}
                emailAccounts={emailAccounts}
                onAddEmailAccount={handleAddEmailAccount}
                onRemoveEmailAccount={handleRemoveEmailAccount}
                onSetPrimaryEmail={handleSetPrimaryEmail}
                onRescanEmail={handleRescanEmail}
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
          onAddSubscription={handleAddFromNotification}
          onResolveAction={handleResolveNotificationAction}
          darkMode={darkMode}
        />
      )}

      {/* Modals */}
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
            setShowEditSubscription(true)
          }}
          onCancel={handleCancelSubscription}
          onPause={handlePauseSubscription}
          onResume={handleResumeSubscription}
          darkMode={darkMode}
        />
      )}
      {showEditSubscription && selectedSubscription && (
        <EditSubscriptionModal
          subscription={selectedSubscription}
          onSave={(updates) => handleEditSubscription(selectedSubscription.id, updates)}
          onClose={() => setShowEditSubscription(false)}
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

      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            action={toast.action}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>

      {confirmDialog && (
        <ConfirmationDialog
          title={confirmDialog.title}
          description={confirmDialog.description}
          variant={confirmDialog.variant}
          confirmLabel={confirmDialog.confirmLabel}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
          darkMode={darkMode}
        />
      )}
    </div>
  )
}
