interface UserProfile {
  id: string
  username: string | null
  full_name: string | null
  email: string
  zodiac_sign: string | null
  birth_date: string | null
  created_at: string
}

interface LoveCalculation {
  id: string
  user_id: string | null
  name1: string
  name2: string
  love_score: number
  compatibility_factors: any
  message: string | null
  created_at: string
  session_id: string
}

class LocalStorage {
  private getItem<T>(key: string): T | null {
    if (typeof window === "undefined") return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  private setItem(key: string, value: any): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  // Generate session ID for anonymous users
  private getSessionId(): string {
    let sessionId = localStorage.getItem("love_calculator_session")
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2)
      localStorage.setItem("love_calculator_session", sessionId)
    }
    return sessionId
  }

  // User management
  getCurrentUser(): UserProfile | null {
    return this.getItem<UserProfile>("love_calculator_user")
  }

  setCurrentUser(user: UserProfile | null): void {
    if (user) {
      this.setItem("love_calculator_user", user)
    } else {
      localStorage.removeItem("love_calculator_user")
    }
  }

  // User registration
  registerUser(userData: {
    email: string
    password: string
    fullName: string
    username?: string
    birthDate?: string
  }): { success: boolean; user?: UserProfile; error?: string } {
    const users = this.getItem<UserProfile[]>("love_calculator_users") || []

    // Check if user already exists
    if (users.find((u) => u.email === userData.email)) {
      return { success: false, error: "User already exists" }
    }

    const zodiacSign = userData.birthDate ? this.getZodiacSign(new Date(userData.birthDate)) : null

    const newUser: UserProfile = {
      id: this.generateId(),
      email: userData.email,
      full_name: userData.fullName,
      username: userData.username || null,
      birth_date: userData.birthDate || null,
      zodiac_sign: zodiacSign,
      created_at: new Date().toISOString(),
    }

    users.push(newUser)
    this.setItem("love_calculator_users", users)
    this.setCurrentUser(newUser)

    return { success: true, user: newUser }
  }

  // User login
  loginUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const users = this.getItem<UserProfile[]>("love_calculator_users") || []
    const user = users.find((u) => u.email === email)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // In a real app, you'd verify the password hash
    // For demo purposes, we'll just check if password is provided
    if (!password) {
      return { success: false, error: "Password required" }
    }

    this.setCurrentUser(user)
    return { success: true, user }
  }

  // Logout
  logoutUser(): void {
    this.setCurrentUser(null)
  }

  // Love calculations - works for both logged in and anonymous users
  saveCalculation(calculation: Omit<LoveCalculation, "id" | "created_at" | "session_id">): LoveCalculation {
    const calculations = this.getItem<LoveCalculation[]>("love_calculator_history") || []

    const newCalculation: LoveCalculation = {
      ...calculation,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      session_id: this.getSessionId(),
    }

    calculations.unshift(newCalculation) // Add to beginning

    // Keep only last 100 calculations to prevent storage overflow
    if (calculations.length > 100) {
      calculations.splice(100)
    }

    this.setItem("love_calculator_history", calculations)
    return newCalculation
  }

  // Get calculations for current user (logged in) or session (anonymous)
  getCurrentUserCalculations(): LoveCalculation[] {
    const calculations = this.getItem<LoveCalculation[]>("love_calculator_history") || []
    const currentUser = this.getCurrentUser()
    const sessionId = this.getSessionId()

    if (currentUser) {
      // Return calculations for logged-in user AND current session (before login)
      return calculations.filter((calc) => calc.user_id === currentUser.id || calc.session_id === sessionId)
    } else {
      // Return calculations for current anonymous session
      return calculations.filter((calc) => calc.session_id === sessionId)
    }
  }

  // Get all calculations for a specific user
  getUserCalculations(userId: string): LoveCalculation[] {
    const calculations = this.getItem<LoveCalculation[]>("love_calculator_history") || []
    return calculations.filter((calc) => calc.user_id === userId)
  }

  // Get all calculations (for developer analytics)
  getAllCalculations(): LoveCalculation[] {
    return this.getItem<LoveCalculation[]>("love_calculator_history") || []
  }

  // Analytics for current user/session
  getCurrentUserAnalytics() {
    const calculations = this.getCurrentUserCalculations()

    if (calculations.length === 0) {
      return {
        totalCalculations: 0,
        averageScore: 0,
        highCompatibility: 0,
        recentActivity: [],
        topNames: [],
        scoreDistribution: {
          excellent: 0, // 90-100%
          great: 0, // 80-89%
          good: 0, // 70-79%
          fair: 0, // 60-69%
          low: 0, // <60%
        },
      }
    }

    const totalCalculations = calculations.length
    const averageScore = Math.round(calculations.reduce((sum, calc) => sum + calc.love_score, 0) / totalCalculations)
    const highCompatibility = calculations.filter((calc) => calc.love_score >= 80).length

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentActivity = calculations.filter((calc) => new Date(calc.created_at) >= sevenDaysAgo)

    // Get most used names
    const nameCount: { [key: string]: number } = {}
    calculations.forEach((calc) => {
      const name1 = calc.name1.toLowerCase().trim()
      const name2 = calc.name2.toLowerCase().trim()
      nameCount[name1] = (nameCount[name1] || 0) + 1
      nameCount[name2] = (nameCount[name2] || 0) + 1
    })

    const topNames = Object.entries(nameCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }))

    // Score distribution
    const scoreDistribution = {
      excellent: calculations.filter((calc) => calc.love_score >= 90).length,
      great: calculations.filter((calc) => calc.love_score >= 80 && calc.love_score < 90).length,
      good: calculations.filter((calc) => calc.love_score >= 70 && calc.love_score < 80).length,
      fair: calculations.filter((calc) => calc.love_score >= 60 && calc.love_score < 70).length,
      low: calculations.filter((calc) => calc.love_score < 60).length,
    }

    return {
      totalCalculations,
      averageScore,
      highCompatibility,
      recentActivity: recentActivity.length,
      topNames,
      scoreDistribution,
    }
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private getZodiacSign(birthDate: Date): string {
    const month = birthDate.getMonth() + 1
    const day = birthDate.getDate()

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries"
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus"
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini"
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer"
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo"
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo"
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra"
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio"
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius"
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn"
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius"
    return "pisces"
  }

  // Clear user data but keep anonymous session data
  clearUserData(): void {
    localStorage.removeItem("love_calculator_user")
    localStorage.removeItem("love_calculator_users")
  }

  // Clear all data including anonymous sessions
  clearAllData(): void {
    localStorage.removeItem("love_calculator_user")
    localStorage.removeItem("love_calculator_users")
    localStorage.removeItem("love_calculator_history")
    localStorage.removeItem("love_calculator_session")
  }
}

export const storage = new LocalStorage()
