"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, Users, Heart, TrendingUp, Clock, Star, Shield, Database } from "lucide-react"
import { developerAnalytics } from "@/lib/developer-analytics"

export default function DeveloperDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [calculations, setCalculations] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Simple password protection for developer dashboard
  const DEVELOPER_PASSWORD = "love2024dev" // Change this to your preferred password

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics()
    }
  }, [isAuthenticated])

  const loadAnalytics = () => {
    const summary = developerAnalytics.getAnalyticsSummary()
    const allCalculations = developerAnalytics.getAllCalculations()
    const allRegistrations = developerAnalytics.getAllRegistrations()

    setAnalytics(summary)
    setCalculations(allCalculations.slice(0, 50)) // Show latest 50
    setRegistrations(allRegistrations.slice(0, 50)) // Show latest 50
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === DEVELOPER_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert("Incorrect password")
    }
  }

  const exportData = () => {
    developerAnalytics.exportData()
  }

  const clearData = () => {
    if (confirm("Are you sure you want to clear all analytics data? This cannot be undone.")) {
      developerAnalytics.clearAllData()
      loadAnalytics()
      alert("All data cleared successfully")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Developer Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter developer password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Developer Analytics</h1>
              <p className="text-gray-600">Love Calculator Usage Data & Insights</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportData} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button onClick={clearData} variant="destructive" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Clear Data
              </Button>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Calculations</p>
                      <p className="text-2xl font-bold text-pink-600">{analytics.total_calculations}</p>
                    </div>
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">+{analytics.calculations_today} today</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">User Registrations</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.total_registrations}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">+{analytics.registrations_today} today</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Love Score</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.average_love_score}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Across all calculations</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-purple-600">{analytics.calculations_this_week}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Calculations this week</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="calculations" className="space-y-6">
              <TabsList>
                <TabsTrigger value="calculations">Recent Calculations</TabsTrigger>
                <TabsTrigger value="users">User Registrations</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
              </TabsList>

              <TabsContent value="calculations">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Love Calculations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {calculations.map((calc) => (
                        <div key={calc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">
                                  {calc.name1} + {calc.name2}
                                </span>
                                <Badge
                                  variant={
                                    calc.love_score >= 80 ? "default" : calc.love_score >= 60 ? "secondary" : "outline"
                                  }
                                >
                                  {calc.love_score}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{calc.message}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{new Date(calc.timestamp).toLocaleString()}</span>
                                {calc.user_email && <span>User: {calc.user_email}</span>}
                                {calc.zodiac_sign1 && <span>Zodiac: {calc.zodiac_sign1}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-pink-600">{calc.love_score}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {registrations.map((reg) => (
                        <div key={reg.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{reg.full_name}</h3>
                              <p className="text-sm text-gray-600">{reg.email}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{new Date(reg.timestamp).toLocaleString()}</span>
                                {reg.zodiac_sign && <Badge variant="outline">{reg.zodiac_sign}</Badge>}
                                {reg.username && <span>@{reg.username}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Most Popular Names
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.most_popular_names.map((name: any, index: number) => (
                          <div key={name.name} className="flex justify-between items-center">
                            <span className="capitalize">{name.name}</span>
                            <Badge variant="secondary">{name.count} uses</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Zodiac Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.zodiac_distribution.map((zodiac: any) => (
                          <div key={zodiac.sign} className="flex justify-between items-center">
                            <span className="capitalize">{zodiac.sign}</span>
                            <Badge variant="outline">{zodiac.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="usage">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Hourly Usage Pattern
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                      {analytics.hourly_usage.map((hour: any) => (
                        <div key={hour.hour} className="text-center">
                          <div className="text-xs text-gray-500 mb-1">{hour.hour}:00</div>
                          <div
                            className="bg-pink-200 rounded"
                            style={{
                              height: `${Math.max(4, (hour.count / Math.max(...analytics.hourly_usage.map((h: any) => h.count))) * 40)}px`,
                            }}
                          />
                          <div className="text-xs text-gray-600 mt-1">{hour.count}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
