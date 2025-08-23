"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Shield, Zap, CheckCircle, Loader2, Chrome } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (userData: { name: string; email: string; avatar: string }) => void
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"welcome" | "connecting" | "success">("welcome")

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setStep("connecting")

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate successful login with mock user data
    const mockUser = {
      name: "John Doe",
      email: "john.doe@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setStep("success")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onLogin(mockUser)
    setIsLoading(false)
    setStep("welcome")
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setStep("welcome")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-blue-100">
        {step === "welcome" && (
          <>
            <DialogHeader className="text-center space-y-4">
              <div className="mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl w-fit">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Welcome to MindSync</DialogTitle>
              <DialogDescription className="text-gray-600">
                Sign in with your Gmail account to start building your AI-powered second brain
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Benefits */}
              <div className="space-y-3">
                {[
                  { icon: Zap, text: "Instant setup - no configuration needed" },
                  { icon: Shield, text: "Enterprise-grade security & privacy" },
                  { icon: CheckCircle, text: "Access all your Gmail data instantly" },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm text-gray-600">
                    <benefit.icon className="h-4 w-4 text-blue-600" />
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Login Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-blue-300 py-3 font-semibold shadow-sm"
              >
                <Chrome className="h-5 w-5 mr-3" />
                Continue with Gmail
              </Button>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>GDPR Ready</span>
                </div>
              </div>
            </div>
          </>
        )}

        {step === "connecting" && (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl w-fit">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-gray-900">Connecting to Gmail</DialogTitle>
              <DialogDescription className="text-gray-600">
                Securely connecting to your Gmail account...
              </DialogDescription>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm text-blue-800">Authenticating with Google</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-600">Setting up your workspace</span>
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-400">Initializing AI processing</span>
                <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl w-fit">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-gray-900">Welcome aboard!</DialogTitle>
              <DialogDescription className="text-gray-600">
                Your account is ready. Redirecting to your dashboard...
              </DialogDescription>
            </div>

            <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Account Created Successfully
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
