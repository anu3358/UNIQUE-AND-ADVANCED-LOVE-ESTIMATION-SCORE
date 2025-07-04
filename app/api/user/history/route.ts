import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const allCalculations = storage.getUserCalculations(userId)
    const calculations = allCalculations.slice(offset, offset + limit)

    return NextResponse.json({
      calculations,
      totalCount: allCalculations.length,
      hasMore: offset + limit < allCalculations.length,
    })
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
