"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${pathname}`)
      return
    }

    // Redirect users to their specific dashboard if they're on the wrong one
    if (!loading && isAuthenticated && user) {
      const currentPath = pathname.split("/")[2] || "" // Get the second part of the path

      // Define the correct path for each user type
      let correctPath = ""
      switch (user.userType) {
        case "farmer":
        case "buyer":
          correctPath = "" // Main dashboard
          break
        case "storage":
          correctPath = "storage-provider"
          break
        case "transporter":
          correctPath = "transporter"
          break
        case "cooperative":
          correctPath = "cooperative"
          break
      }

      // If user is on the wrong dashboard, redirect them
      if (
        currentPath !== correctPath &&
        pathname !== "/dashboard" &&
        correctPath === "" && // Handle root dashboard
        pathname !== `/dashboard/${correctPath}` &&
        correctPath !== ""
      ) {
        const redirectPath = correctPath ? `/dashboard/${correctPath}` : "/dashboard"
        router.push(redirectPath)
      }
    }
  }, [isAuthenticated, loading, router, pathname, user])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

