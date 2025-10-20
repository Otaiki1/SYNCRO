"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(1)
  const [emailConnected, setEmailConnected] = useState(false)
  const [bankingConnected, setBankingConnected] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedSubscriptions, setScannedSubscriptions] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    toolsCount: "",
    monthlySpend: "",
  })

  useEffect(() => {
    if (emailConnected && isScanning) {
      const timer = setTimeout(() => {
        const foundSubs = [
          { name: "ChatGPT Pro", cost: "$20/month", icon: "🤖" },
          { name: "Midjourney", cost: "$30/month", icon: "🎨" },
          { name: "Claude Pro", cost: "$20/month", icon: "✨" },
          { name: "Perplexity Pro", cost: "$20/month", icon: "🔍" },
        ]
        setScannedSubscriptions(foundSubs)
        setIsScanning(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [emailConnected, isScanning])

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setScannedSubscriptions([])
      setIsScanning(false)
    }
  }

  const handleNext = () => {
    if (step === 4) {
      setStep(5) // Go to email connection
    } else if (step === 5 && emailConnected && scannedSubscriptions.length > 0) {
      setStep(6) // Go to banking connection (optional)
    } else if (step === 6) {
      onClose()
    } else if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleConnectEmail = () => {
    setEmailConnected(true)
    setIsScanning(true)
  }

  const handleConnectBanking = () => {
    setBankingConnected(true)
  }

  const handleSkipBanking = () => {
    onClose()
  }

  const isStepValid = () => {
    if (step === 1) return formData.name.trim() !== ""
    if (step === 2) return formData.role.trim() !== ""
    if (step === 3) return formData.toolsCount !== ""
    if (step === 4) return formData.monthlySpend.trim() !== ""
    if (step === 5) return emailConnected && scannedSubscriptions.length > 0
    if (step === 6) return true // Plaid is optional, always valid
    return false
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>

      {/* Left Side - Branding */}
      <div className="w-1/2 bg-black text-white p-12 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subsync.AI</h1>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-4">Welcome to Subsync.AI</h2>
          <p className="text-gray-300 text-lg mb-8">
            Track your AI subscription in one place. Optimize your spending and never miss a renewal again
          </p>

          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-100">
              Smart analysis
            </button>
            <button className="px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-100">
              Cost optimization
            </button>
            <button className="px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-100">
              Bank level security
            </button>
          </div>
        </div>

        <div className="text-gray-400 text-sm">© 2025 Subsync.AI. All rights reserved.</div>
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 bg-white p-12 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-sm text-gray-500">Step {step} out of 6</span>
          </div>

          <h3 className="text-3xl font-bold text-gray-900 mb-2">Let's get you started</h3>
          <p className="text-gray-600 mb-8">First tell us a bit about yourself to personalise your experience</p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">What is your name?</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">What is your Role?</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., Product Manager, Developer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How many AI tools do you currently use?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["1-3 tools", "4-7 tools", "8- 15 tools", "15+ tools"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, toolsCount: option })}
                    className={`p-4 rounded-lg border-2 font-medium transition-colors ${
                      formData.toolsCount === option
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Approximately monthly AI spend.</label>
              <input
                type="text"
                value={formData.monthlySpend}
                onChange={(e) => setFormData({ ...formData, monthlySpend: e.target.value })}
                placeholder="e.g., $100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">This helps us provide better insights</p>
            </div>
          )}

          {step === 5 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Connect your email to continue</label>
              <p className="text-sm text-gray-600 mb-6">
                We'll automatically track your AI subscriptions from your email receipts and invoices.
              </p>

              {!emailConnected ? (
                <button
                  onClick={handleConnectEmail}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-black transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22 4H2C0.9 4 0 4.9 0 6v12c0 1.1 0.9 2 2 2h20c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2z"
                      fill="#EA4335"
                    />
                    <path d="M12 12.5L2 6h20L12 12.5z" fill="#FBBC04" />
                    <path d="M0 6l12 9.5L24 6" stroke="#34A853" strokeWidth="0.5" fill="none" />
                  </svg>
                  <span className="font-medium text-gray-900">Connect Gmail</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Gmail connected</p>
                      <p className="text-sm text-gray-600">Your email is now synced</p>
                    </div>
                  </div>

                  {isScanning && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-700">Scanning your emails for AI subscriptions...</p>
                    </div>
                  )}

                  {scannedSubscriptions.length > 0 && !isScanning && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Found {scannedSubscriptions.length} subscriptions:
                      </p>
                      <div className="space-y-2">
                        {scannedSubscriptions.map((sub, idx) => (
                          <div
                            key={idx}
                            className="animate-slide-in flex items-center justify-between py-2"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{sub.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900">{sub.name}</p>
                                <p className="text-xs text-gray-600">{sub.cost}</p>
                              </div>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Connect your bank account (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-6">
                Link your bank account to automatically track subscription payments and get better spending insights.
              </p>

              {!bankingConnected ? (
                <button
                  onClick={handleConnectBanking}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-black transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 126 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="8" width="8" height="8" fill="#0066FF" />
                    <rect x="20" y="8" width="8" height="8" fill="#0066FF" />
                    <rect x="8" y="20" width="8" height="8" fill="#0066FF" />
                    <rect x="20" y="20" width="8" height="8" fill="#0066FF" />
                    <text x="40" y="24" fontSize="14" fontWeight="600" fill="#000000">
                      Plaid
                    </text>
                  </svg>
                  <span className="font-medium text-gray-900">Connect with Plaid</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bank account connected</p>
                    <p className="text-sm text-gray-600">Your account is now synced</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-3">
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {step === 6 ? "Get Started" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
          {step === 6 && (
            <button
              onClick={handleSkipBanking}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
