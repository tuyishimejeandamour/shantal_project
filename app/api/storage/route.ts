import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import type { Storage } from "@/lib/models/storage"
import { logger } from "@/lib/logger"

// GET all storage facilities
export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const url = new URL(req.url)

  logger.apiRequest("GET", url.toString(), req.headers)

  try {
    const { searchParams } = url
    const provider = searchParams.get("provider")
    const location = searchParams.get("location")
    const feature = searchParams.get("feature")
    const minAvailable = searchParams.get("minAvailable")

    logger.debug("Storage API - Query parameters", {
      provider,
      location,
      feature,
      minAvailable,
    })

    // Build query
    const query: any = {}
    if (provider) query.provider = provider
    if (location) query.location = location
    if (feature) query.features = feature

    // Available capacity
    if (minAvailable) query.available = { $gte: Number.parseInt(minAvailable) }

    logger.debug("Storage API - MongoDB query", { query })

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get storage facilities
    const storages = await db.collection("storage").find(query).toArray()

    logger.debug(`Storage API - Found ${storages.length} storage facilities`)

    const response = NextResponse.json(storages)

    const duration = Date.now() - startTime
    logger.apiResponse("GET", url.toString(), response.status, {
      count: storages.length,
      duration: `${duration}ms`,
    })

    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Error fetching storage facilities:", errorObj, { url: req.url })

    const response = NextResponse.json({ error: "Failed to fetch storage facilities" }, { status: 500 })

    logger.apiResponse("GET", url.toString(), response.status, {
      error: errorObj.message,
    })

    return response
  }
}

// POST new storage facility
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const url = new URL(req.url)

  try {
    const body = await req.json()
    logger.apiRequest("POST", url.toString(), req.headers, body)

    // Validate input
    if (!body.name || !body.provider || !body.capacity || !body.pricePerTon) {
      logger.warn("Storage API - Missing required fields", {
        provided: Object.keys(body),
        required: ["name", "provider", "capacity", "pricePerTon"],
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

    // Create new storage facility
    const newStorage: Storage = {
      ...body,
      available: body.capacity, // Initially all capacity is available
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    logger.debug("Storage API - Creating new storage facility", {
      name: newStorage.name,
      provider: newStorage.provider,
    })

    // Insert storage into database
    const result = await db.collection("storage").insertOne(newStorage)

    logger.debug("Storage API - Storage facility created successfully", {
      storageId: result.insertedId.toString(),
    })

    // Return success response
    const response = NextResponse.json(
      {
        message: "Storage facility added successfully",
        storageId: result.insertedId,
      },
      { status: 201 },
    )

    const duration = Date.now() - startTime
    logger.apiResponse("POST", url.toString(), response.status, {
      storageId: result.insertedId.toString(),
      duration: `${duration}ms`,
    })

    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Error adding storage facility:", errorObj, { url: req.url })

    const response = NextResponse.json({ error: "Failed to add storage facility" }, { status: 500 })

    logger.apiResponse("POST", url.toString(), response.status, {
      error: errorObj.message,
    })

    return response
  }
}

