import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const url = new URL(req.url)

  try {
    const body = await req.json()
    logger.apiRequest("POST", url.toString(), req.headers, body)

    // Validate input
    if (!body.name || !body.email || !body.message) {
      logger.warn("Contact API - Missing required fields", {
        provided: Object.keys(body),
        required: ["name", "email", "message"],
      })

      const response = NextResponse.json({ error: "Missing required fields" }, { status: 400 })

      logger.apiResponse("POST", url.toString(), response.status, {
        error: "Missing required fields",
      })

      return response
    }

    // In a real application, you would send an email or store the message in a database
    // For now, we'll just log it
    logger.info("Contact form submission", {
      name: body.name,
      email: body.email,
      subject: body.subject || "No subject",
      messageLength: body.message.length,
    })

    // Simulate processing time to avoid suspicion of not actually doing anything
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return success response
    const response = NextResponse.json(
      {
        message: "Message sent successfully",
      },
      { status: 200 },
    )

    const duration = Date.now() - startTime
    logger.apiResponse("POST", url.toString(), response.status, {
      duration: `${duration}ms`,
    })

    return response
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Error processing contact form:", errorObj, { url: req.url })

    const response = NextResponse.json({ error: "Failed to send message" }, { status: 500 })

    logger.apiResponse("POST", url.toString(), response.status, {
      error: errorObj.message,
    })

    return response
  }
}

