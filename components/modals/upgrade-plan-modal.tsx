"use client"
import { X, Check, Copy } from "lucide-react"
import { useState } from "react"

function PaymentForm({ plan, paymentMethod, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [copied, setCopied] = useState(false)

  const stableTokenWallet = "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"

  const handlePayment = async (e) => {
    e.preventDefault()

    if (paymentMethod === "card") {
      if (!cardNumber || !expiry || !cvc) {
        setError("Please fill in all card details")
        return
      }
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(plan.price * 100),
          currency: "usd",
          paymentMethod,
          ...(paymentMethod === "card" && {
            cardNumber: cardNumber.replace(/\s/g, ""),
            expiry,
            cvc,
          }),
          planName: plan.displayName,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        setError("Payment failed. Please try again.")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim()
  }

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(stableTokenWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (paymentMethod === "stable") {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            Send {plan.price} USDC or USDT to the wallet address below:
          </p>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
            <code className="flex-1 text-xs font-mono text-gray-900 dark:text-gray-100 break-all">
              {stableTokenWallet}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 dark:text-green-400 mt-2">Copied to clipboard!</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Transaction Hash (optional)
          </label>
          <input
            type="text"
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onSuccess}
            className="flex-1 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength="19"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry</label>
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              maxLength="5"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVC</label>
            <input
              type="text"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
              maxLength="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay $${plan.price.toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}

export default function UpgradePlanModal({ currentPlan, onUpgrade, onClose, darkMode }) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("card")

  const plans = [
    {
      name: "free",
      displayName: "Free",
      price: 0,
      subscriptions: 5,
      features: ["Up to 5 subscriptions", "Basic analytics", "Email notifications"],
    },
    {
      name: "pro",
      displayName: "Pro",
      price: 9.99,
      subscriptions: 20,
      features: ["Up to 20 subscriptions", "Advanced analytics", "Priority support", "Custom alerts"],
      popular: true,
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      price: 29.99,
      subscriptions: 100,
      features: ["Unlimited subscriptions", "Full analytics", "24/7 support", "API access", "Team management"],
    },
  ]

  if (selectedPlan) {
    return (
      <div
        className={`fixed inset-0 ${darkMode ? "bg-black/50" : "bg-black/50"} flex items-center justify-center z-50`}
      >
        <div className={`${darkMode ? "bg-gray-900" : "bg-white"} rounded-xl p-8 max-w-md w-full`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Complete Payment</h2>
            <button
              onClick={() => setSelectedPlan(null)}
              className={`p-1 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} rounded-lg`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className={`mb-6 p-4 ${darkMode ? "bg-gray-800" : "bg-gray-50"} rounded-lg`}>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Upgrading to</p>
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mt-1`}>
              {selectedPlan.displayName} Plan
            </h3>
            <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mt-2`}>
              ${selectedPlan.price.toFixed(2)}/month
            </p>
          </div>

          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                paymentMethod === "card"
                  ? darkMode
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Card
            </button>
            <button
              onClick={() => setPaymentMethod("stable")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                paymentMethod === "stable"
                  ? darkMode
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : darkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Stable Token
            </button>
          </div>

          <PaymentForm
            plan={selectedPlan}
            paymentMethod={paymentMethod}
            onSuccess={() => {
              onUpgrade(selectedPlan.name)
              setSelectedPlan(null)
            }}
            onCancel={() => setSelectedPlan(null)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 ${darkMode ? "bg-black/50" : "bg-black/50"} flex items-center justify-center z-50`}>
      <div
        className={`${darkMode ? "bg-gray-900" : "bg-white"} rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Choose Your Plan</h2>
          <button
            onClick={onClose}
            className={`p-1 ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} rounded-lg`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 p-6 relative ${
                plan.popular
                  ? darkMode
                    ? "border-white bg-white/5"
                    : "border-black bg-black/5"
                  : darkMode
                    ? "border-gray-700"
                    : "border-gray-200"
              } ${currentPlan === plan.name ? (darkMode ? "ring-2 ring-white" : "ring-2 ring-black") : ""}`}
            >
              {plan.popular && (
                <div
                  className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${darkMode ? "bg-white text-black" : "bg-black text-white"} px-3 py-1 rounded-full text-xs font-semibold`}
                >
                  Most Popular
                </div>
              )}

              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                {plan.displayName}
              </h3>
              <div className="mb-6">
                <span className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>${plan.price}</span>
                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>/month</span>
              </div>

              <div className={`mb-6 pb-6 ${darkMode ? "border-gray-700" : "border-gray-200"} border-b`}>
                <p className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  Up to {plan.subscriptions} subscriptions
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    <Check className="w-4 h-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (currentPlan !== plan.name) {
                    setSelectedPlan(plan)
                  }
                }}
                disabled={currentPlan === plan.name}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  currentPlan === plan.name
                    ? darkMode
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : plan.popular
                      ? darkMode
                        ? "bg-white text-black hover:bg-gray-100"
                        : "bg-black text-white hover:bg-gray-800"
                      : darkMode
                        ? "border border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border border-gray-300 text-gray-900 hover:bg-gray-50"
                }`}
              >
                {currentPlan === plan.name ? "Current Plan" : "Choose Plan"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
