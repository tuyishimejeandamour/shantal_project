import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"
import { getTokenFromRequest, verifyAuth } from "@/lib/auth"

// GET user profile
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyAuth(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user is requesting their own profile
    if (payload.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get user
    const user = await db.collection("users").findOne({
      _id: new ObjectId(params.id),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data without password
    const { password, ...userData } = user

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

// UPDATE user profile
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyAuth(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user is updating their own profile
    if (payload.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get update data
    const updateData = await req.json()

    // Validate input
    if (!updateData.name || !updateData.phone || !updateData.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Update user
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name: updateData.name,
          phone: updateData.phone,
          location: updateData.location,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}

