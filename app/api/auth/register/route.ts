import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import type { User, UserType } from "@/lib/models/user"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, location, userType } = await req.json()

    // Validate input
    if (!name || !email || !password || !phone || !location || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      userType: userType as UserType,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert user into database
    const result = await db.collection("users").insertOne(newUser)

    // Return success response
    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

