import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { type TransportBooking, BookingStatus } from "@/lib/models/transport"
import { ObjectId } from "mongodb"

// GET transport bookings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user = searchParams.get("user")
    const transport = searchParams.get("transport")
    const status = searchParams.get("status")

    // Build query
    const query: any = {}
    if (user) query.user = user
    if (transport) query.transport = transport
    if (status) query.status = status

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get bookings
    const bookings = await db.collection("transportBookings").find(query).toArray()

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching transport bookings:", error)
    return NextResponse.json({ error: "Failed to fetch transport bookings" }, { status: 500 })
  }
}

// POST new transport booking
export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json()

    // Validate input
    if (!bookingData.transport || !bookingData.user || !bookingData.pickupLocation || !bookingData.deliveryLocation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Check if transport is available
    const transport = await db.collection("transport").findOne({ _id: new ObjectId(bookingData.transport) })
    if (!transport) {
      return NextResponse.json({ error: "Transport provider not found" }, { status: 404 })
    }

    if (transport.availability !== "Available") {
      return NextResponse.json({ error: "Transport provider is not available" }, { status: 400 })
    }

    // Calculate total price
    const totalPrice = transport.pricePerKm * bookingData.distance

    // Create new booking
    const newBooking: TransportBooking = {
      ...bookingData,
      status: BookingStatus.PENDING,
      totalPrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert booking into database
    const result = await db.collection("transportBookings").insertOne(newBooking)

    // Update transport availability
    await db
      .collection("transport")
      .updateOne(
        { _id: new ObjectId(bookingData.transport) },
        { $set: { availability: `Booked for ${new Date(bookingData.date).toLocaleDateString()}` } },
      )

    // Return success response
    return NextResponse.json(
      {
        message: "Transport booking created successfully",
        bookingId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating transport booking:", error)
    return NextResponse.json({ error: "Failed to create transport booking" }, { status: 500 })
  }
}

