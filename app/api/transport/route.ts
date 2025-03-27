import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import type { Transport } from "@/lib/models/transport"
import { logger } from "@/lib/logger"

// GET all transport providers
export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const url = new URL(req.url)

  logger.apiRequest("GET", url.toString(), req.headers)

  try {
    const { searchParams } = url
    const provider = searchParams.get("provider")
    const location = searchParams.get("location")
    const vehicleType = searchParams.get("vehicleType")
    const feature = searchParams.get("feature")
    const minCapacity = searchParams.get("minCapacity")
    const availability = searchParams.get("availability")

    logger.debug("Transport API - Query parameters", {
      provider,
      location,
      vehicleType,
      feature,
      minCapacity,
      availability,
    })

    // Build query
    const query: any = {}
    if (provider) query.provider = provider
    if (location) query.location = location
    if (vehicleType) query.vehicleType = vehicleType
    if (feature) query.features = feature
    if (availability) query.availability = availability

    // Capacity
    if (minCapacity) query.capacity = { $gte: Number.parseInt(minCapacity) }

    logger.debug("Transport API - MongoDB query", { query })

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get transport providers
    const transporters = await db.collection("transport").find(query).toArray()

    logger.debug(`Transport API - Found ${transporters.length} transport providers`)

    const response = NextResponse.json(transporters)

    const duration = Date.now() - startTime
    logger.apiResponse("GET", url.toString(), response.status, {
      count: transporters.length,
      duration: `${duration}ms`,
    })

    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Error fetching transport providers:", errorObj, { url: req.url })

    const response = NextResponse.json({ error: "Failed to fetch transport providers" }, { status: 500 })

    logger.apiResponse("GET", url.toString(), response.status, {
      error: errorObj.message,
    })

    return response
  }
}

// POST new transport provider
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const url = new URL(req.url)

  try {
    const body = await req.json()
    logger.apiRequest("POST", url.toString(), req.headers, body)

    // Validate input
    if (!body.name || !body.provider || !body.capacity || !body.pricePerKm) {
      logger.warn("Transport API - Missing required fields", {
        provided: Object.keys(body),
        required: ["name", "provider", "capacity", "pricePerKm"],
      })

      const response = NextResponse.json({ error: "Missing required fields" }, { status: 400 })

      logger.apiResponse("POST", url.toString(), response.status, {
        error: "Missing required fields",
      })

      return response
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Create new transport provider
    const newTransport: Transport = {
      ...body,
      availability: "Available", // Initially available
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    logger.debug("Transport API - Creating new transport provider", {
      name: newTransport.name,
      provider: newTransport.provider,
    })

    // Insert transport into database
    const result = await db.collection("transport").insertOne(newTransport)

    logger.debug("Transport API - Transport provider created successfully", {
      transportId: result.insertedId.toString(),
    })

    // Return success response
    const response = NextResponse.json(
      {
        message: "Transport provider added successfully",
        transportId: result.insertedId,
      },
      { status: 201 },
    )

    const duration = Date.now() - startTime
    logger.apiResponse("POST", url.toString(), response.status, {
      transportId: result.insertedId.toString(),
      duration: `${duration}ms`,
    })

    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Error adding transport provider:", errorObj, { url: req.url })

    const response = NextResponse.json({ error: "Failed to add transport provider" }, { status: 500 })

    logger.apiResponse("POST", url.toString(), response.status, {
      error: errorObj.message,
    })

    return response
  }
}

