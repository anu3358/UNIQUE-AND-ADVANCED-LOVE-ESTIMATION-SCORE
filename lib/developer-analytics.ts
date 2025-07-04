interface CalculationData {
  id: string
  timestamp: string
  user_id: string | null
  user_email: string | null
  name1: string
  name2: string
  love_score: number
  compatibility_factors: any
  message: string
  user_agent: string
  ip_address?: string
  session_id: string
  zodiac_sign1?: string
  zodiac_sign2?: string
}

interface UserRegistrationData {
  id: string
  timestamp: string
  email: string
  full_name: string
  username: string | null
  birth_date: string | null
  zodiac_sign: string | null
  user_agent: string
  ip_address?: string
}

class DeveloperAnalytics {
  private getStorageKey(type: "calculations" | "registrations" | "sessions"): string {
    return `dev_analytics_${type}`
  }

  private getItem<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : []
    } catch {
      return []
    }
  }

  private setItem(key: string, value: any[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Failed to save analytics data:", error)
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private getUserAgent(): string {
    return typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"
  }

  // Save calculation data for developer
  saveCalculationData(data: {
    user_id: string | null
    user_email: string | null
    name1: string
    name2: string
    love_score: number
    compatibility_factors: any
    message: string
    zodiac_sign1?: string
    zodiac_sign2?: string
  }): void {
    const calculations = this.getItem<CalculationData>(this.getStorageKey("calculations"))

    const calculationData: CalculationData = {
      id: this.generateSessionId(),
      timestamp: new Date().toISOString(),
      user_agent: this.getUserAgent(),
      session_id: this.getSessionId(),
      ...data,
    }

    calculations.unshift(calculationData)

    // Keep only last 1000 calculations to prevent storage overflow
    if (calculations.length > 1000) {
      calculations.splice(1000)
    }

    this.setItem(this.getStorageKey("calculations"), calculations)
  }

  // Save user registration data for developer
  saveRegistrationData(data: {
    email: string
    full_name: string
    username: string | null
    birth_date: string | null
    zodiac_sign: string | null
  }): void {
    const registrations = this.getItem<UserRegistrationData>(this.getStorageKey("registrations"))

    const registrationData: UserRegistrationData = {
      id: this.generateSessionId(),
      timestamp: new Date().toISOString(),
      user_agent: this.getUserAgent(),
      ...data,
    }

    registrations.unshift(registrationData)
    this.setItem(this.getStorageKey("registrations"), registrations)
  }

  // Get session ID (persistent across page loads)
  private getSessionId(): string {
    let sessionId = localStorage.getItem("dev_session_id")
    if (!sessionId) {
      sessionId = this.generateSessionId()
      localStorage.setItem("dev_session_id", sessionId)
    }
    return sessionId
  }

  // Developer methods to retrieve data
  getAllCalculations(): CalculationData[] {
    return this.getItem<CalculationData>(this.getStorageKey("calculations"))
  }

  getAllRegistrations(): UserRegistrationData[] {
    return this.getItem<UserRegistrationData>(this.getStorageKey("registrations"))
  }

  getAnalyticsSummary() {
    const calculations = this.getAllCalculations()
    const registrations = this.getAllRegistrations()

    const today = new Date().toDateString()
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    return {
      total_calculations: calculations.length,
      total_registrations: registrations.length,
      calculations_today: calculations.filter((c) => new Date(c.timestamp).toDateString() === today).length,
      calculations_this_week: calculations.filter((c) => new Date(c.timestamp) >= thisWeek).length,
      registrations_today: registrations.filter((r) => new Date(r.timestamp).toDateString() === today).length,
      registrations_this_week: registrations.filter((r) => new Date(r.timestamp) >= thisWeek).length,
      average_love_score:
        calculations.length > 0
          ? Math.round(calculations.reduce((sum, c) => sum + c.love_score, 0) / calculations.length)
          : 0,
      most_popular_names: this.getMostPopularNames(calculations),
      zodiac_distribution: this.getZodiacDistribution(calculations),
      hourly_usage: this.getHourlyUsage(calculations),
    }
  }

  private getMostPopularNames(calculations: CalculationData[]) {
    const nameCount: { [key: string]: number } = {}

    calculations.forEach((calc) => {
      const name1 = calc.name1.toLowerCase().trim()
      const name2 = calc.name2.toLowerCase().trim()
      nameCount[name1] = (nameCount[name1] || 0) + 1
      nameCount[name2] = (nameCount[name2] || 0) + 1
    })

    return Object.entries(nameCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))
  }

  private getZodiacDistribution(calculations: CalculationData[]) {
    const zodiacCount: { [key: string]: number } = {}

    calculations.forEach((calc) => {
      if (calc.zodiac_sign1) {
        zodiacCount[calc.zodiac_sign1] = (zodiacCount[calc.zodiac_sign1] || 0) + 1
      }
    })

    return Object.entries(zodiacCount)
      .sort(([, a], [, b]) => b - a)
      .map(([sign, count]) => ({ sign, count }))
  }

  private getHourlyUsage(calculations: CalculationData[]) {
    const hourlyCount: { [key: number]: number } = {}

    calculations.forEach((calc) => {
      const hour = new Date(calc.timestamp).getHours()
      hourlyCount[hour] = (hourlyCount[hour] || 0) + 1
    })

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyCount[hour] || 0,
    }))
  }

  // Export data for developer
  exportData() {
    const data = {
      calculations: this.getAllCalculations(),
      registrations: this.getAllRegistrations(),
      summary: this.getAnalyticsSummary(),
      exported_at: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `love-calculator-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Clear all data (for privacy compliance)
  clearAllData(): void {
    localStorage.removeItem(this.getStorageKey("calculations"))
    localStorage.removeItem(this.getStorageKey("registrations"))
    localStorage.removeItem(this.getStorageKey("sessions"))
  }
}

export const developerAnalytics = new DeveloperAnalytics()
