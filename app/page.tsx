"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Sparkles, User, History, TrendingUp, Share2, Star, LogIn, Shield, BarChart3 } from "lucide-react"
import { storage } from "@/lib/storage"

interface LoveResult {
  loveScore: number
  message: string
  factors: {
    nameHarmony: number
    numerologyMatch: number
    zodiacCompatibility: number
    personalityAlignment: number
    communicationStyle: number
    emotionalConnection: number
    lifestyleMatch: number
    longTermPotential: number
  }
  detailedAnalysis: {
    strengths: string[]
    challenges: string[]
    advice: string[]
    timeline: {
      shortTerm: string
      mediumTerm: string
      longTerm: string
    }
  }
  calculationId?: string
}

interface UserProfile {
  id: string
  username: string | null
  full_name: string | null
  email: string
  zodiac_sign: string | null
  birth_date: string | null
}

export default function LoveCalculator() {
  const [name1, setName1] = useState("")
  const [name2, setName2] = useState("")
  const [result, setResult] = useState<LoveResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("calculator")
  const [showLogin, setShowLogin] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })

  useEffect(() => {
    // Check for existing user session
    const currentUser = storage.getCurrentUser()
    setUser(currentUser)

    // Load history and analytics for current user/session
    loadUserData()
  }, [])

  const loadUserData = () => {
    // Get calculations for current user (logged in) or session (anonymous)
    const userCalculations = storage.getCurrentUserCalculations()
    setHistory(userCalculations)

    // Get analytics for current user/session
    const userAnalytics = storage.getCurrentUserAnalytics()
    setAnalytics(userAnalytics)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name1.trim() || !name2.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/calculate-love", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name1: name1.trim(),
          name2: name2.trim(),
          userId: user?.id,
          zodiacSign1: user?.zodiac_sign,
          zodiacSign2: null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)

        // Save calculation to local storage (works for both logged in and anonymous users)
        storage.saveCalculation({
          user_id: user?.id || null,
          name1: name1.trim(),
          name2: name2.trim(),
          love_score: data.loveScore,
          compatibility_factors: data.factors,
          message: data.message,
        })

        // Refresh user data
        loadUserData()
      } else {
        console.error("Calculation failed:", data.error)
      }
    } catch (error) {
      console.error("Error calculating love:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setShowLogin(false)
        setLoginForm({ email: "", password: "" })
        loadUserData() // Refresh data after login
      } else {
        alert(data.error || "Login failed")
      }
    } catch (error) {
      alert("Network error. Please try again.")
    }
  }

  const signOut = () => {
    storage.logoutUser()
    setUser(null)
    setActiveTab("calculator")
    loadUserData() // Refresh to show anonymous session data
  }

  const resetForm = () => {
    setName1("")
    setName2("")
    setResult(null)
  }

  const shareResult = async () => {
    if (result && navigator.share) {
      try {
        await navigator.share({
          title: "Love Calculator Result",
          text: `${name1} + ${name2} = ${result.loveScore}% compatibility! ${result.message}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Heart className="h-10 w-10 text-red-500 fill-current animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Advanced Love Calculator
            </h1>
            <Heart className="h-10 w-10 text-red-500 fill-current animate-pulse" />
          </div>
          <p className="text-gray-600">Discover deep compatibility with advanced analysis 💕</p>
        </div>

        {user ? (
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">Welcome, {user.full_name || user.email}!</span>
              {user.zodiac_sign && <Badge variant="secondary">{user.zodiac_sign}</Badge>}
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="mb-6 flex justify-center">
            <Button onClick={() => setShowLogin(true)} variant="outline" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In to Save Results Permanently
            </Button>
          </div>
        )}

        {showLogin && !user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button type="submit">Sign In</Button>
                  <Button type="button" variant="outline" onClick={() => setShowLogin(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={() => (window.location.href = "/auth/signup")}>
                    Sign Up
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">Privacy Notice</p>
                <p className="text-blue-700">
                  We collect anonymous usage data to improve our service.{" "}
                  {!user && "Your calculations are saved locally in your browser. "}
                  Sign up to save your results permanently across devices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="history">History {!user && "(Session)"}</TabsTrigger>
            <TabsTrigger value="analytics">Analytics {!user && "(Session)"}</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Calculate Love Compatibility</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {!result ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name1" className="text-sm font-medium text-gray-700">
                          Your Name
                        </label>
                        <Input
                          id="name1"
                          type="text"
                          placeholder="Enter your name"
                          value={name1}
                          onChange={(e) => setName1(e.target.value)}
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="name2" className="text-sm font-medium text-gray-700">
                          Their Name
                        </label>
                        <Input
                          id="name2"
                          type="text"
                          placeholder="Enter their name"
                          value={name2}
                          onChange={(e) => setName2(e.target.value)}
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !name1.trim() || !name2.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin" />
                          Analyzing Compatibility...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 fill-current" />
                          Calculate Advanced Compatibility
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Main Score */}
                    <div className="text-center space-y-4">
                      <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text">
                        {result.loveScore}%
                      </div>

                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Heart
                            key={i}
                            className={`h-6 w-6 mx-1 ${
                              i < Math.floor(result.loveScore / 20) ? "text-red-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-lg font-medium text-gray-700">
                        {name1} + {name2}
                      </p>

                      <div className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-lg border border-pink-200">
                        <p className="text-gray-700 font-medium">{result.message}</p>
                      </div>
                    </div>

                    {/* Detailed Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(result.factors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                            <span>{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </div>

                    {/* Detailed Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-green-600">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {result.detailedAnalysis.strengths.map((strength, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Star className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-orange-600">Growth Areas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {result.detailedAnalysis.challenges.map((challenge, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <TrendingUp className="h-3 w-3 text-orange-500 mt-1 flex-shrink-0" />
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-blue-600">Advice</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1">
                            {result.detailedAnalysis.advice.slice(0, 3).map((advice, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Heart className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                                {advice}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                      <Button onClick={resetForm} variant="outline">
                        Try Again
                      </Button>
                      <Button onClick={shareResult} className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Result
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Your Love History {!user && "(This Session)"}
                </CardTitle>
                {!user && (
                  <p className="text-sm text-gray-600">
                    Your calculations are saved for this browser session. Sign up to save permanently!
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No calculations yet. Start exploring love compatibility!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map((calc) => (
                      <div key={calc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {calc.name1} + {calc.name2}
                            </h3>
                            <p className="text-sm text-gray-600">{calc.message}</p>
                            <p className="text-xs text-gray-400">{new Date(calc.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-pink-600">{calc.love_score}%</div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Heart
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(calc.love_score / 20) ? "text-red-500 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Your Love Analytics {!user && "(This Session)"}
                </CardTitle>
                {!user && (
                  <p className="text-sm text-gray-600">
                    Analytics based on your current browser session. Sign up to track across devices!
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {analytics && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">{analytics.totalCalculations}</div>
                        <div className="text-sm text-gray-600">Total Calculations</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{analytics.averageScore}%</div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{analytics.highCompatibility}</div>
                        <div className="text-sm text-gray-600">High Compatibility</div>
                      </div>
                    </div>

                    {analytics.totalCalculations > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Names */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Star className="h-5 w-5" />
                              Most Used Names
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {analytics.topNames.length > 0 ? (
                              <div className="space-y-2">
                                {analytics.topNames.map((name: any, index: number) => (
                                  <div key={name.name} className="flex justify-between items-center">
                                    <span className="font-medium">{name.name}</span>
                                    <Badge variant="secondary">{name.count} times</Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No data yet</p>
                            )}
                          </CardContent>
                        </Card>

                        {/* Score Distribution */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Score Distribution
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Excellent (90-100%)</span>
                                <Badge variant="default">{analytics.scoreDistribution.excellent}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Great (80-89%)</span>
                                <Badge variant="secondary">{analytics.scoreDistribution.great}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Good (70-79%)</span>
                                <Badge variant="outline">{analytics.scoreDistribution.good}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Fair (60-69%)</span>
                                <Badge variant="outline">{analytics.scoreDistribution.fair}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Low (&lt;60%)</span>
                                <Badge variant="outline">{analytics.scoreDistribution.low}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Developer Access */}
        <div className="mt-8 text-center">
          <a href="/developer" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Developer Analytics
          </a>
        </div>
      </div>
    </div>
  )
}
