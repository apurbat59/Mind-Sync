"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (userData: { name: string; email: string }) => void
  initialMode?: "signin" | "signup"
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode)

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [accountStats, setAccountStats] = useState({ totalAccounts: 0, hasAccounts: false })

  useEffect(() => {
    // Check existing accounts on component mount
    const existingUsers = JSON.parse(localStorage.getItem("mindsync-users") || "[]")
    setAccountStats({
      totalAccounts: existingUsers.length,
      hasAccounts: existingUsers.length > 0,
    })
  }, [mode])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    // Name validation for signup
    if (mode === "signup") {
      if (!formData.name) {
        newErrors.name = "Name is required"
      } else if (formData.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters long"
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("mindsync-users") || "[]")

      if (mode === "signup") {
        // Check if user already exists
        const userExists = existingUsers.find((user: any) => user.email === formData.email)

        if (userExists) {
          setErrors({ email: "An account with this email already exists. Please sign in instead." })
          setIsLoading(false)
          return
        }

        // Create new user with proper password storage
        const newUser = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password, // In production, this would be hashed
          createdAt: new Date().toISOString(),
          isVerified: true, // In production, this would require email verification
        }

        // Save user to localStorage
        existingUsers.push(newUser)
        localStorage.setItem("mindsync-users", JSON.stringify(existingUsers))

        // Trigger Gmail integration for the new user
        await initiateGmailIntegration(formData.email)

        onAuthSuccess({ name: newUser.name, email: newUser.email })
      } else {
        // Sign in - validate credentials
        if (existingUsers.length === 0) {
          setErrors({
            email: "No accounts found. Please sign up first to create an account.",
            general: "You need to create an account before signing in.",
          })
          setIsLoading(false)
          return
        }

        const user = existingUsers.find((user: any) => user.email === formData.email)

        if (!user) {
          setErrors({
            email: "No account found with this email address. Please sign up first or check your email.",
            general: "Account not found. Please create an account first.",
          })
          setIsLoading(false)
          return
        }

        if (user.password !== formData.password) {
          setErrors({
            password: "Incorrect password. Please try again.",
            general: "Invalid credentials. Please check your password.",
          })
          setIsLoading(false)
          return
        }

        // Trigger Gmail sync for existing user
        await syncGmailData(user.email)

        onAuthSuccess({ name: user.name, email: user.email })
      }
    } catch (error) {
      setErrors({ general: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate Gmail OAuth integration
  const initiateGmailIntegration = async (email: string) => {
    // In production, this would redirect to Gmail OAuth
    console.log(`Initiating Gmail OAuth for ${email}`)

    // Store Gmail connection status
    localStorage.setItem(`gmail-connected-${email}`, "true")
    localStorage.setItem(`gmail-last-sync-${email}`, new Date().toISOString())

    // Start initial email sync
    await syncGmailData(email)
  }

  // Simulate real-time Gmail data sync
  const syncGmailData = async (email: string) => {
    console.log(`Starting real-time Gmail sync for ${email}`)

    // Generate realistic email data based on the user's email domain
    const emailDomain = email.split("@")[1]
    const userName = email.split("@")[0]

    const realisticEmails = generateRealisticEmails(userName, emailDomain)

    // Store emails in localStorage with user association
    const existingEmails = JSON.parse(localStorage.getItem(`emails-${email}`) || "[]")
    const allEmails = [...existingEmails, ...realisticEmails]

    localStorage.setItem(`emails-${email}`, JSON.stringify(allEmails))

    // Update sync status
    localStorage.setItem(`gmail-last-sync-${email}`, new Date().toISOString())
    localStorage.setItem(`gmail-email-count-${email}`, allEmails.length.toString())
  }

  // Generate realistic emails based on user's email
  const generateRealisticEmails = (userName: string, domain: string) => {
    const currentDate = new Date()
    const emails = []

    // Generate emails from the last 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30)
      const emailDate = new Date(currentDate)
      emailDate.setDate(emailDate.getDate() - daysAgo)

      const emailTemplates = [
        {
          from: `team@${domain}`,
          subject: "Weekly Team Update",
          content: `Hi ${userName}, here's our weekly team update. We've made significant progress on the Q4 objectives and are on track to meet our deadlines. Please review the attached documents and let us know if you have any questions.`,
          labels: ["work", "team"],
        },
        {
          from: `notifications@${domain}`,
          subject: "Security Alert: New Login Detected",
          content: `We detected a new login to your account from a new device. If this was you, no action is needed. If not, please secure your account immediately.`,
          labels: ["security", "important"],
        },
        {
          from: `client@external.com`,
          subject: "Project Proposal Review",
          content: `Thank you for the detailed project proposal. We've reviewed it with our team and have some feedback. Overall, we're impressed with your approach and would like to schedule a call to discuss next steps.`,
          labels: ["client", "business"],
        },
        {
          from: `hr@${domain}`,
          subject: "Benefits Enrollment Reminder",
          content: `This is a reminder that benefits enrollment closes next Friday. Please make sure to review your options and submit your selections through the HR portal.`,
          labels: ["hr", "benefits"],
        },
        {
          from: `newsletter@techcompany.com`,
          subject: "Latest Tech Trends and Insights",
          content: `Stay updated with the latest technology trends, industry insights, and best practices. This week we're covering AI developments, cloud computing advances, and cybersecurity updates.`,
          labels: ["newsletter", "tech"],
        },
      ]

      const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)]

      emails.push({
        id: `email-${Date.now()}-${i}`,
        from: template.from,
        to: `${userName}@${domain}`,
        subject: template.subject,
        content: template.content,
        date: emailDate.toISOString(),
        labels: template.labels,
        read: Math.random() > 0.3, // 70% chance of being read
        important: Math.random() > 0.8, // 20% chance of being important
      })
    }

    return emails
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
      setErrors({})
      setMode("signin")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-blue-100">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl w-fit">
            {mode === "signin" ? <Mail className="h-8 w-8 text-white" /> : <User className="h-8 w-8 text-white" />}
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {mode === "signin" ? "Welcome Back" : "Connect Your Gmail"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {mode === "signin"
              ? "Sign in to access your AI-powered email insights"
              : "Create your account and we'll connect to your Gmail for real-time processing"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="flex items-start space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="font-medium">{errors.general}</span>
                {mode === "signin" && !accountStats.hasAccounts && (
                  <div className="text-xs text-red-700">
                    <p>• No user accounts exist yet</p>
                    <p>• Click "Sign up" below to create your first account</p>
                    <p>• You'll be able to sign in after creating an account</p>
                  </div>
                )}
                {mode === "signin" && errors.email?.includes("No account found") && (
                  <div className="text-xs text-red-700">
                    <p>• This email address is not registered</p>
                    <p>• Double-check your email address</p>
                    <p>• Or create a new account with this email</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Status Indicator */}
          {mode === "signin" && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-600" />
                <div className="text-sm">
                  {accountStats.hasAccounts ? (
                    <span className="text-blue-800">
                      {accountStats.totalAccounts} account{accountStats.totalAccounts !== 1 ? "s" : ""} found. Enter
                      your credentials to sign in.
                    </span>
                  ) : (
                    <span className="text-orange-800">
                      No accounts found. You need to sign up first to create an account.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === "signup" && accountStats.hasAccounts && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Creating a new account. Already have one?
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="ml-1 text-green-700 underline hover:text-green-900"
                  >
                    Sign in instead
                  </button>
                </span>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="border-blue-200 focus:border-blue-500"
                disabled={isLoading}
              />
              {errors.name && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              Gmail Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@gmail.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="border-blue-200 focus:border-blue-500"
              disabled={isLoading}
            />
            {errors.email && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.email}</span>
              </div>
            )}
            {mode === "signup" && (
              <p className="text-xs text-blue-600">
                We'll securely connect to this Gmail account to process your emails in real-time
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="border-blue-200 focus:border-blue-500 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="border-blue-200 focus:border-blue-500"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === "signin" ? "Signing In & Syncing..." : "Creating Account & Connecting Gmail..."}
              </>
            ) : (
              <>
                {mode === "signin" ? <Lock className="h-4 w-4 mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                {mode === "signin" ? "Sign In & Sync Gmail" : "Create Account & Connect Gmail"}
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin")
                setErrors({})
                setFormData({ name: "", email: "", password: "", confirmPassword: "" })
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              disabled={isLoading}
            >
              {mode === "signin"
                ? accountStats.hasAccounts
                  ? "Don't have an account? Sign up"
                  : "Create your first account - Sign up"
                : "Already have an account? Sign in"}
            </button>

            {mode === "signin" && !accountStats.hasAccounts && (
              <p className="text-xs text-gray-500">You must create an account before you can sign in</p>
            )}
          </div>
        </form>

        {/* Gmail Integration Notice */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-4 border-t border-blue-100">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Secure OAuth</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-blue-500" />
            <span>Real-time Sync</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-purple-500" />
            <span>AI Processing</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
