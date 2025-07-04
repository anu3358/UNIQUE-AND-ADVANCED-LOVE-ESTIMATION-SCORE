import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { developerAnalytics } from "@/lib/developer-analytics"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, username, birthDate, zodiacSign } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = storage.registerUser({
      email,
      password,
      fullName,
      username,
      birthDate,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Save registration data for developer analytics
    try {
      developerAnalytics.saveRegistrationData({
        email,
        full_name: fullName,
        username,
        birth_date: birthDate,
        zodiac_sign: zodiacSign,
      })
    } catch (error) {
      console.error("Failed to save registration analytics:", error)
    }

    return NextResponse.json({
      message: "User created successfully",
      user: result.user,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
