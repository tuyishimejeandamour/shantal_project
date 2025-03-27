"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function DashboardRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user type
      switch (user.userType) {
        case "storage":
          router.push("/dashboard/storage-provider")
          break
        case "transporter":
          router.push("/dashboard/transporter")
          break
        case "cooperative":
          router.push("/dashboard/cooperative")
          break
        case "farmer":
        case "buyer":
        default:
          // For farmers and buyers, we'll use the existing dashboard page
          // So we don't need to redirect
          break
      }
    }
  }, [user, loading, router])

  // If the user is a farmer or buyer, we'll render the original dashboard
  // Otherwise, this is just a loading screen while redirecting
  if (loading || (user && !["farmer", "buyer"].includes(user.userType))) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If we get here, the user is a farmer or buyer, so we'll import and render the FarmerBuyerDashboard
  // This is a dynamic import to avoid circular dependencies
  const FarmerBuyerDashboard = require("./farmer-buyer/page").default
  return <FarmerBuyerDashboard />
}

