import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { type StorageBooking, BookingStatus } from "@/lib/models/storage"
import { ObjectId } from "mongodb"

// GET storage bookings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const farmer = searchParams.get("farmer")
    const storage = searchParams.get("storage")
    const status = searchParams.get("status")

    // Build query
    const query: any = {}
    if (farmer) query.farmer = farmer
    if (storage) query.storage = storage
    if (status) query.status = status

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get bookings
    const bookings = await db.collection("storageBookings").find(query).toArray()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching storage bookings:", error)
    return NextResponse.json({ error: "Failed to fetch storage bookings" }, { status: 500 })
  }
}

// POST new storage booking
export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json()

    // Validate input
    if (!bookingData.storage || !bookingData.farmer || !bookingData.crop || !bookingData.quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Check if storage has enough capacity
    const storage = await db.collection("storage").findOne({ _id: new ObjectId(bookingData.storage) })
    if (!storage) {
      return NextResponse.json({ error: "Storage facility not found" }, { status: 404 })
    }

    if (storage.available < bookingData.quantity) {
      return NextResponse.json({ error: "Not enough storage capacity available" }, { status: 400 })
    }

    // Calculate total price
    const durationInDays = Math.ceil(
      (new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24),
    )
    const totalPrice = (storage.pricePerTon * bookingData.quantity * durationInDays) / 30 // Price per month

    // Create new booking
    const newBooking: StorageBooking = {
      ...bookingData,
      status: BookingStatus.PENDING,
      totalPrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert booking into database
    const result = await db.collection("storageBookings").insertOne(newBooking)

    // Update storage available capacity
    await db
      .collection("storage")
      .updateOne({ _id: new ObjectId(bookingData.storage) }, { $inc: { available: -bookingData.quantity } })

    // Return success response
    return NextResponse.json(
      {
        message: "Storage booking created successfully",
        bookingId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating storage booking:", error)
    return NextResponse.json({ error: "Failed to create storage booking" }, { status: 500 })
  }
}

