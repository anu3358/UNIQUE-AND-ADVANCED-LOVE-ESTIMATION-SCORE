import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { developerAnalytics } from "@/lib/developer-analytics"

interface CompatibilityFactors {
  nameHarmony: number
  numerologyMatch: number
  zodiacCompatibility: number
  personalityAlignment: number
  communicationStyle: number
  emotionalConnection: number
  lifestyleMatch: number
  longTermPotential: number
}

function calculateNameHarmony(name1: string, name2: string): number {
  const vowels1 = name1.toLowerCase().match(/[aeiou]/g)?.length || 0
  const vowels2 = name2.toLowerCase().match(/[aeiou]/g)?.length || 0
  const consonants1 = name1.length - vowels1
  const consonants2 = name2.length - vowels2

  const vowelRatio = Math.abs(vowels1 - vowels2) / Math.max(vowels1, vowels2, 1)
  const consonantRatio = Math.abs(consonants1 - consonants2) / Math.max(consonants1, consonants2, 1)

  return Math.round((1 - (vowelRatio + consonantRatio) / 2) * 100)
}

function calculateNumerology(name1: string, name2: string): number {
  const getNameNumber = (name: string): number => {
    const values: { [key: string]: number } = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: 9,
      j: 1,
      k: 2,
      l: 3,
      m: 4,
      n: 5,
      o: 6,
      p: 7,
      q: 8,
      r: 9,
      s: 1,
      t: 2,
      u: 3,
      v: 4,
      w: 5,
      x: 6,
      y: 7,
      z: 8,
    }

    let sum = 0
    for (const char of name.toLowerCase()) {
      sum += values[char] || 0
    }

    while (sum > 9) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, digit) => acc + Number.parseInt(digit), 0)
    }

    return sum
  }

  const num1 = getNameNumber(name1)
  const num2 = getNameNumber(name2)

  const compatibility = [
    [85, 60, 75, 70, 80, 65, 90, 75, 70], // 1
    [60, 85, 70, 80, 65, 90, 75, 70, 85], // 2
    [75, 70, 85, 60, 90, 75, 80, 85, 65], // 3
    [70, 80, 60, 85, 75, 70, 65, 90, 80], // 4
    [80, 65, 90, 75, 85, 80, 70, 65, 75], // 5
    [65, 90, 75, 70, 80, 85, 85, 80, 70], // 6
    [90, 75, 80, 65, 70, 85, 85, 75, 80], // 7
    [75, 70, 85, 90, 65, 80, 75, 85, 70], // 8
    [70, 85, 65, 80, 75, 70, 80, 70, 85], // 9
  ]

  return compatibility[num1 - 1][num2 - 1]
}

function calculateZodiacCompatibility(sign1?: string, sign2?: string): number {
  if (!sign1 || !sign2) return 75

  const compatibility: { [key: string]: { [key: string]: number } } = {
    aries: {
      aries: 80,
      taurus: 60,
      gemini: 85,
      cancer: 65,
      leo: 95,
      virgo: 70,
      libra: 85,
      scorpio: 75,
      sagittarius: 90,
      capricorn: 65,
      aquarius: 85,
      pisces: 70,
    },
    taurus: {
      aries: 60,
      taurus: 85,
      gemini: 70,
      cancer: 90,
      leo: 75,
      virgo: 95,
      libra: 80,
      scorpio: 85,
      sagittarius: 65,
      capricorn: 90,
      aquarius: 70,
      pisces: 85,
    },
    gemini: {
      aries: 85,
      taurus: 70,
      gemini: 80,
      cancer: 70,
      leo: 85,
      virgo: 75,
      libra: 95,
      scorpio: 70,
      sagittarius: 85,
      capricorn: 60,
      aquarius: 90,
      pisces: 75,
    },
    cancer: {
      aries: 65,
      taurus: 90,
      gemini: 70,
      cancer: 85,
      leo: 80,
      virgo: 85,
      libra: 75,
      scorpio: 95,
      sagittarius: 60,
      capricorn: 80,
      aquarius: 65,
      pisces: 90,
    },
    leo: {
      aries: 95,
      taurus: 75,
      gemini: 85,
      cancer: 80,
      leo: 85,
      virgo: 70,
      libra: 90,
      scorpio: 80,
      sagittarius: 95,
      capricorn: 70,
      aquarius: 85,
      pisces: 75,
    },
    virgo: {
      aries: 70,
      taurus: 95,
      gemini: 75,
      cancer: 85,
      leo: 70,
      virgo: 80,
      libra: 75,
      scorpio: 85,
      sagittarius: 65,
      capricorn: 95,
      aquarius: 70,
      pisces: 80,
    },
    libra: {
      aries: 85,
      taurus: 80,
      gemini: 95,
      cancer: 75,
      leo: 90,
      virgo: 75,
      libra: 85,
      scorpio: 75,
      sagittarius: 80,
      capricorn: 70,
      aquarius: 95,
      pisces: 80,
    },
    scorpio: {
      aries: 75,
      taurus: 85,
      gemini: 70,
      cancer: 95,
      leo: 80,
      virgo: 85,
      libra: 75,
      scorpio: 90,
      sagittarius: 70,
      capricorn: 85,
      aquarius: 75,
      pisces: 95,
    },
    sagittarius: {
      aries: 90,
      taurus: 65,
      gemini: 85,
      cancer: 60,
      leo: 95,
      virgo: 65,
      libra: 80,
      scorpio: 70,
      sagittarius: 85,
      capricorn: 65,
      aquarius: 90,
      pisces: 70,
    },
    capricorn: {
      aries: 65,
      taurus: 90,
      gemini: 60,
      cancer: 80,
      leo: 70,
      virgo: 95,
      libra: 70,
      scorpio: 85,
      sagittarius: 65,
      capricorn: 85,
      aquarius: 70,
      pisces: 80,
    },
    aquarius: {
      aries: 85,
      taurus: 70,
      gemini: 90,
      cancer: 65,
      leo: 85,
      virgo: 70,
      libra: 95,
      scorpio: 75,
      sagittarius: 90,
      capricorn: 70,
      aquarius: 85,
      pisces: 75,
    },
    pisces: {
      aries: 70,
      taurus: 85,
      gemini: 75,
      cancer: 90,
      leo: 75,
      virgo: 80,
      libra: 80,
      scorpio: 95,
      sagittarius: 70,
      capricorn: 80,
      aquarius: 75,
      pisces: 85,
    },
  }

  return compatibility[sign1.toLowerCase()]?.[sign2.toLowerCase()] || 75
}

function generateDetailedAnalysis(factors: CompatibilityFactors, name1: string, name2: string): any {
  return {
    strengths: [
      factors.nameHarmony > 80 ? "Your names create beautiful harmony together" : null,
      factors.numerologyMatch > 85 ? "Strong numerological connection" : null,
      factors.emotionalConnection > 80 ? "Deep emotional understanding" : null,
      factors.communicationStyle > 85 ? "Excellent communication potential" : null,
    ].filter(Boolean),
    challenges: [
      factors.lifestyleMatch < 60 ? "May need to work on lifestyle compatibility" : null,
      factors.personalityAlignment < 65 ? "Different personality types - can be complementary" : null,
    ].filter(Boolean),
    advice: [
      "Focus on open communication",
      "Embrace your differences as strengths",
      "Build shared experiences together",
      "Support each other's individual growth",
    ],
    timeline: {
      shortTerm: factors.emotionalConnection > 75 ? "Strong initial attraction" : "Growing connection",
      mediumTerm: factors.communicationStyle > 70 ? "Deepening understanding" : "Learning to communicate",
      longTerm: factors.longTermPotential > 80 ? "Excellent long-term potential" : "Requires mutual effort",
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name1, name2, userId, zodiacSign1, zodiacSign2 } = await request.json()

    if (!name1 || !name2) {
      return NextResponse.json({ error: "Both names are required" }, { status: 400 })
    }

    // Calculate compatibility factors
    const factors: CompatibilityFactors = {
      nameHarmony: calculateNameHarmony(name1, name2),
      numerologyMatch: calculateNumerology(name1, name2),
      zodiacCompatibility: calculateZodiacCompatibility(zodiacSign1, zodiacSign2),
      personalityAlignment: Math.floor(Math.random() * 30) + 70,
      communicationStyle: Math.floor(Math.random() * 25) + 70,
      emotionalConnection: Math.floor(Math.random() * 35) + 65,
      lifestyleMatch: Math.floor(Math.random() * 40) + 60,
      longTermPotential: Math.floor(Math.random() * 30) + 70,
    }

    // Calculate overall love score
    const weights = {
      nameHarmony: 0.15,
      numerologyMatch: 0.15,
      zodiacCompatibility: 0.1,
      personalityAlignment: 0.2,
      communicationStyle: 0.15,
      emotionalConnection: 0.15,
      lifestyleMatch: 0.05,
      longTermPotential: 0.05,
    }

    const loveScore = Math.round(
      Object.entries(factors).reduce((sum, [key, value]) => {
        return sum + value * weights[key as keyof typeof weights]
      }, 0),
    )

    let message = ""
    if (loveScore >= 90) {
      message = "Absolutely perfect match! You're destined to be together! 💕✨"
    } else if (loveScore >= 80) {
      message = "Amazing compatibility! This is true love material! 💖"
    } else if (loveScore >= 70) {
      message = "Great potential for a beautiful relationship! 💘"
    } else if (loveScore >= 60) {
      message = "Good foundation - nurture this connection! 💗"
    } else {
      message = "Every relationship has potential with effort and understanding! 💝"
    }

    // Generate detailed analysis
    const detailedAnalysis = generateDetailedAnalysis(factors, name1, name2)

    // Save data for developer analytics
    try {
      developerAnalytics.saveCalculationData({
        user_id: userId,
        user_email: userId ? "user@example.com" : null, // You can get actual email from user session
        name1,
        name2,
        love_score: loveScore,
        compatibility_factors: factors,
        message,
        zodiac_sign1: zodiacSign1,
        zodiac_sign2: zodiacSign2,
      })
    } catch (error) {
      console.error("Failed to save developer analytics:", error)
    }

    // Save to local storage if user is logged in
    let calculationId = null
    if (userId) {
      try {
        const savedCalculation = storage.saveCalculation({
          user_id: userId,
          name1,
          name2,
          love_score: loveScore,
          compatibility_factors: factors,
          message,
        })
        calculationId = savedCalculation.id
      } catch (error) {
        console.error("Storage save error:", error)
      }
    }

    return NextResponse.json({
      loveScore,
      message,
      factors,
      detailedAnalysis,
      calculationId,
    })
  } catch (error) {
    console.error("Love calculation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
