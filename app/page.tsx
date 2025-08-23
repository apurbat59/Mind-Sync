"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Sparkles,
  Search,
  Mic,
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  Users,
  ArrowRight,
  CheckCircle,
  Play,
  Mail,
  FileText,
  ChevronDown,
} from "lucide-react"
import AuthModal from "@/components/auth/auth-modal"
import { useRouter } from "next/navigation"
import UserManagement from "@/components/auth/user-management"

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const router = useRouter()
  // Add state for auth modal mode
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin")

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("mindsync-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsLoggedIn(true)
    }
  }, [])

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("mindsync-user", JSON.stringify(userData))
    setIsAuthOpen(false)
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      // Check if any accounts exist
      const existingUsers = JSON.parse(localStorage.getItem("mindsync-users") || "[]")
      if (existingUsers.length === 0) {
        // No accounts exist, force sign up mode
        setAuthModalMode("signup")
      }
      setIsAuthOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-blue-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MindSync
                </h1>
                <p className="text-xs text-blue-600 font-medium">AI-Powered Second Brain</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Pricing
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Welcome, {user?.name?.split(" ")[0]}</span>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setIsAuthOpen(true)} className="text-gray-600">
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setIsAuthOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Real-time Gmail Integration + AI Processing
            </Badge>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Your AI-Powered
                </span>
                <br />
                <span className="text-gray-900">Second Brain</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Connect your Gmail and watch as MindSync automatically ingests, processes, and makes all your emails{" "}
                <span className="text-blue-600 font-semibold">instantly searchable with AI</span>. Never lose track of
                important information again.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <Mail className="h-5 w-5 mr-2" />
                Connect Gmail & Start
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold bg-transparent"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-medium">Gmail OAuth Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Real-time Processing</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Live Email Sync</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20 transform rotate-1"></div>
              <Card className="relative bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-white font-medium">MindSync Dashboard - Live Gmail Sync</div>
                  </div>
                  <div className="p-8 bg-gradient-to-br from-blue-50 to-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Live Gmail Sync</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                          <div className="text-xs text-gray-500">Processing emails in real-time...</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Mic className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Voice Capture</span>
                          </div>
                          <div className="text-xs text-gray-500">"Remember to follow up with client..."</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Search className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">AI Search</span>
                          </div>
                          <div className="text-xs text-gray-500">"Show me emails about project deadlines"</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">Smart Insights</span>
                          </div>
                          <div className="text-xs text-gray-500">Found 12 action items in recent emails</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-700">Email Digest</span>
                          </div>
                          <div className="text-xs text-gray-500">47 emails processed today</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">AI Analysis</span>
                          </div>
                          <div className="text-xs text-gray-500">Understanding your email patterns</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Core Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Real-time Gmail integration with
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                AI processing
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Mail,
                title: "Live Gmail Integration",
                description: "Real-time email sync with OAuth authentication. Your emails are processed instantly.",
                color: "blue",
              },
              {
                icon: Search,
                title: "AI-Powered Email Search",
                description: "Ask questions about your emails in natural language and get instant answers.",
                color: "indigo",
              },
              {
                icon: Mic,
                title: "Voice Capture",
                description: "Instantly capture thoughts with voice. AI transcribes and connects to your emails.",
                color: "purple",
              },
              {
                icon: Brain,
                title: "Email Intelligence",
                description: "AI analyzes your email patterns, finds action items, and suggests responses.",
                color: "green",
              },
              {
                icon: TrendingUp,
                title: "Email Analytics",
                description: "Discover patterns in your communication and optimize your email workflow.",
                color: "orange",
              },
              {
                icon: FileText,
                title: "Smart Email Digests",
                description: "Get personalized summaries of important emails and action items.",
                color: "red",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 bg-white"
              >
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Real-time processing</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Connect your Gmail in
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                3 simple steps
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up & Connect Gmail",
                description: "Create your account and securely connect your Gmail using OAuth authentication.",
                icon: Mail,
              },
              {
                step: "02",
                title: "Real-time Email Processing",
                description: "Our AI immediately starts processing your emails, extracting insights and patterns.",
                icon: Brain,
              },
              {
                step: "03",
                title: "Search & Discover",
                description: "Ask questions about your emails and get instant AI-powered answers and insights.",
                icon: Search,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 z-0"></div>
                )}
                <Card className="relative z-10 bg-white border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <step.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">{step.step}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Simple pricing for
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                powerful email AI
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for trying out MindSync",
                features: [
                  "Connect 1 Gmail account",
                  "Process 1,000 emails/month",
                  "Basic AI search",
                  "Voice capture",
                  "Email insights",
                ],
                cta: "Start Free",
                popular: false,
              },
              {
                name: "Professional",
                price: "$19",
                period: "/month",
                description: "For professionals and power users",
                features: [
                  "Unlimited Gmail accounts",
                  "Unlimited email processing",
                  "Advanced AI search & analysis",
                  "Real-time email monitoring",
                  "Smart digests & insights",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-white border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "border-blue-500 shadow-lg scale-105" : "border-gray-200 hover:border-blue-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-gray-900">
                        {plan.price}
                        {plan.period && <span className="text-lg text-gray-600">{plan.period}</span>}
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleGetStarted}
                    className={`w-full py-3 font-semibold ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Development: User Management (remove in production) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">Development Tools</Badge>
            <h2 className="text-2xl font-bold text-gray-900">User Account Management</h2>
            <p className="text-gray-600">View and manage user accounts (development only)</p>
          </div>
          <UserManagement />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to supercharge your email workflow?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Connect your Gmail and let AI transform how you manage and search through your emails.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              <Mail className="h-5 w-5 mr-2" />
              Connect Gmail - Start Free
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-blue-200 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Secure OAuth connection</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Real-time processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Scroll to top button */}
      <Button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-40"
        size="sm"
      >
        <ChevronDown className="h-5 w-5 rotate-180" />
      </Button>
    </div>
  )
}
