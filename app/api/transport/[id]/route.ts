import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// GET transport provider by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get transport provider
    const transport = await db.collection("transport").findOne({
      _id: new ObjectId(params.id),
    })

    if (!transport) {
      return NextResponse.json({ error: "Transport provider not found" }, { status: 404 })
    }

    return NextResponse.json(transport)
  } catch (error) {
    console.error("Error fetching transport provider:", error)
    return NextResponse.json({ error: "Failed to fetch transport provider" }, { status: 500 })
  }
}

