import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Create response that clears the auth cookie
    const response = NextResponse.json({
      message: "Logged out successfully",
    })

    // Clear the auth cookie
    response.cookies.set({
      name: "auth_token",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}

