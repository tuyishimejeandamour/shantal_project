import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { type Crop, CropStatus } from "@/lib/models/crop"
import { logger } from "@/lib/logger"

// GET all crops
export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const url = new URL(req.url)

  logger.apiRequest("GET", url.toString(), req.headers)

  try {
    const { searchParams } = url
    const farmer = searchParams.get("farmer")
    const name = searchParams.get("name")
    const location = searchParams.get("location")
    const quality = searchParams.get("quality")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const status = searchParams.get("status")

    logger.debug("Crops API - Query parameters", {
      farmer,
      name,
      location,
      quality,
      minPrice,
      maxPrice,
      status,
    })

    // Build query
    const query: any = {}
    if (farmer) query.farmer = farmer
    if (name) query.name = { $regex: name, $options: "i" }
    if (location) query.location = location
    if (quality) query.quality = quality
    if (status) query.status = status

    // Price range
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number.parseInt(minPrice)
      if (maxPrice) query.price.$lte = Number.parseInt(maxPrice)
    }

    logger.debug("Crops API - MongoDB query", { query })

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Get crops
    const crops = await db.collection("crops").find(query).toArray()

    logger.debug(`Crops API - Found ${crops.length} crops`)

    const response = NextResponse.json(crops)

    const duration = Date.now() - startTime
    logger.apiResponse("GET", url.toString(), response.status, {
      count: crops.length,
      duration: `${duration}ms`,
    })

    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Error fetching crops:", errorObj, { url: req.url })

    const response = NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 })

    logger.apiResponse("GET", url.toString(), response.status, {
      error: errorObj.message,
    })

    return response
  }
}

// POST new crop
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const url = new URL(req.url)

  try {
    const body = await req.json()
    logger.apiRequest("POST", url.toString(), req.headers, body)

    // Validate input
    if (!body.name || !body.farmer || !body.quantity || !body.price) {
      logger.warn("Crops API - Missing required fields", {
        provided: Object.keys(body),
        required: ["name", "farmer", "quantity", "price"],
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

    // Create new crop
    const newCrop: Crop = {
      ...body,
      status: CropStatus.AVAILABLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    logger.debug("Crops API - Creating new crop", {
      name: newCrop.name,
      farmer: newCrop.farmer,
    })

    // Insert crop into database
    const result = await db.collection("crops").insertOne(newCrop)

    logger.debug("Crops API - Crop created successfully", {
      cropId: result.insertedId.toString(),
    })

    // Return success response
    const response = NextResponse.json(
      {
        message: "Crop added successfully",
        cropId: result.insertedId,
      },
      { status: 201 },
    )

    const duration = Date.now() - startTime
    logger.apiResponse("POST", url.toString(), response.status, {
      cropId: result.insertedId.toString(),
      duration: `${duration}ms`,
    })

    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Error adding crop:", errorObj, { url: req.url })

    const response = NextResponse.json({ error: "Failed to add crop" }, { status: 500 })

    logger.apiResponse("POST", url.toString(), response.status, {
      error: errorObj.message,
    })

    return response
  }
}

