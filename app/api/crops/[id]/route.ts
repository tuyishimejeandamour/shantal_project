import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// GET crop by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get crop
    const crop = await db.collection("crops").findOne({
      _id: new ObjectId(params.id),
    })

    if (!crop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json(crop)
  } catch (error) {
    console.error("Error fetching crop:", error)
    return NextResponse.json({ error: "Failed to fetch crop" }, { status: 500 })
  }
}

// UPDATE crop
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updateData = await req.json()

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Update crop
    const result = await db
      .collection("crops")
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { ...updateData, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Crop updated successfully" })
  } catch (error) {
    console.error("Error updating crop:", error)
    return NextResponse.json({ error: "Failed to update crop" }, { status: 500 })
  }
}

// DELETE crop
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Delete crop
    const result = await db.collection("crops").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Crop deleted successfully" })
  } catch (error) {
    console.error("Error deleting crop:", error)
    return NextResponse.json({ error: "Failed to delete crop" }, { status: 500 })
  }
}

