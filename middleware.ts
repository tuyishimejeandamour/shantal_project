import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "./lib/auth"
import { logger } from "./lib/logger"

// Add routes that require authentication
const protectedRoutes = ["/dashboard", "/marketplace/add", "/storage/register", "/transport/register"]

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl

  logger.debug(`Middleware processing request for ${pathname}`)

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  if (isProtectedRoute) {
    logger.debug(`Protected route detected: ${pathname}`)

    // Get token from cookies
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      logger.debug(`No auth token found for protected route: ${pathname}`)

      // Redirect to login if no token
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)

      const duration = Date.now() - startTime
      logger.info(`Redirecting to login from ${pathname} - No auth token (${duration}ms)`)

      return NextResponse.redirect(url)
    }

    try {
      // Verify token with timeout
      const verifyPromise = verifyAuth(token)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Auth verification timed out")), 5000)
      })

      const payload = await Promise.race([verifyPromise, timeoutPromise]).catch((error) => {
        logger.error(`Auth verification error for ${pathname}:`, error)
        return null
      })

      if (!payload) {
        logger.debug(`Invalid token for protected route: ${pathname}`)

        // Redirect to login if token is invalid
        const url = new URL("/login", request.url)
        url.searchParams.set("redirect", pathname)

        const duration = Date.now() - startTime
        logger.info(`Redirecting to login from ${pathname} - Invalid token (${duration}ms)`)

        return NextResponse.redirect(url)
      }

      logger.debug(`Auth successful for ${pathname} - User: ${payload.userId}`)
    } catch (error) {
      logger.error(
        `Middleware error processing ${pathname}:`,
        error instanceof Error ? error : new Error("Unknown error"),
      )

      // Redirect to login if verification fails
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)

      return NextResponse.redirect(url)
    }
  }

  const duration = Date.now() - startTime
  logger.debug(`Middleware completed for ${pathname} (${duration}ms)`)

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/marketplace/add/:path*",
    "/storage/register/:path*",
    "/transport/register/:path*",
    "/crops/add/:path*",
  ],
}

