import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { logger } from "@/lib/logger"

export interface UserJwtPayload {
  userId: string
  email: string
  userType: string
}

export async function verifyAuth(token: string): Promise<UserJwtPayload | null> {
  if (!token) {
    logger.debug("Auth verification failed: No token provided")
    return null
  }

  try {
    const startTime = Date.now()
    logger.debug("Verifying JWT token")

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET environment variable is not set")
      throw new Error("JWT_SECRET is not configured")
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    const duration = Date.now() - startTime
    logger.debug(`JWT verification successful (${duration}ms)`)

    return payload as unknown as UserJwtPayload
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error")
    logger.error("Token verification failed:", errorObj)
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.debug("No Bearer token found in Authorization header")
    return null
  }
  return authHeader.split(" ")[1]
}

