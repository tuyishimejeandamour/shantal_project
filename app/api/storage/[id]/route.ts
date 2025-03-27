import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// GET storage facility by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get storage facility
    const storage = await db.collection("storage").findOne({
      _id: new ObjectId(params.id),
    })

    if (!storage) {
      return NextResponse.json({ error: "Storage facility not found" }, { status: 404 })
    }

    return NextResponse.json(storage)
  } catch (error) {
    console.error("Error fetching storage facility:", error)
    return NextResponse.json({ error: "Failed to fetch storage facility" }, { status: 500 })
  }
}

