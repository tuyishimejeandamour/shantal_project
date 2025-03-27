"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Warehouse, Package, Calendar, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function StorageProviderDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storages, setStorages] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch storage facilities owned by this provider
        const storagesResponse = await fetch(`/api/storage?provider=${user?.id}`)
        if (storagesResponse.ok) {
          const storagesData = await storagesResponse.json()
          setStorages(storagesData)
        }

        // Fetch bookings for this provider's storage facilities
        const bookingsResponse = await fetch(`/api/bookings/storage?provider=${user?.id}`)
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json()
          setBookings(bookingsData)
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Storage Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your storage facilities and bookings.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Facilities</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storages.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {storages.length > 0 ? `${storages.length} facilities listed` : "No facilities listed"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {storages.reduce((total: number, storage: any) => total + (storage.capacity || 0), 0)} Tons
              </div>
              <p className="text-xs text-muted-foreground">Total storage capacity</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Space</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {storages.reduce((total: number, storage: any) => total + (storage.available || 0), 0)} Tons
              </div>
              <p className="text-xs text-muted-foreground">Available storage space</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {bookings.length > 0 ? `${bookings.length} active bookings` : "No active bookings"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="facilities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="facilities">My Facilities</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="facilities" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">My Storage Facilities</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Link href="/storage/register" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Facility
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {storages.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>You haven&apos;t listed any storage facilities yet.</p>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">
                    <Link href="/storage/register" className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Facility
                    </Link>
                  </Button>
                </div>
              ) : (
                storages.map((storage: any) => (
                  <Card key={storage._id}>
                    <CardHeader>
                      <CardTitle>{storage.name}</CardTitle>
                      <CardDescription>Location: {storage.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Capacity:</span>
                          <span className="text-sm font-medium">{storage.capacity} Tons</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Available:</span>
                          <span className="text-sm font-medium">{storage.available} Tons</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="text-sm font-medium">{storage.pricePerTon} RWF/ton/month</span>
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium">Features:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {storage.features?.map((feature: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Storage Bookings</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {bookings.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>You don&apos;t have any storage bookings yet.</p>
                  <p className="mt-2">Once farmers book your facilities, they will appear here.</p>
                </div>
              ) : (
                bookings.map((booking: any) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{booking.storageName || "Storage Booking"}</CardTitle>
                        <Badge
                          variant={booking.status === "confirmed" ? "default" : "outline"}
                          className={booking.status === "pending" ? "bg-amber-100 text-amber-800" : ""}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <CardDescription>Booked on {new Date(booking.createdAt).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Farmer:</span>
                          <span className="text-sm font-medium">{booking.farmerName || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Crop:</span>
                          <span className="text-sm font-medium">{booking.cropName || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Quantity:</span>
                          <span className="text-sm font-medium">{booking.quantity} Tons</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Duration:</span>
                          <span className="text-sm font-medium">
                            {new Date(booking.startDate).toLocaleDateString()} -{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Price:</span>
                          <span className="text-sm font-medium">{booking.totalPrice} RWF</span>
                        </div>
                      </div>

                      {booking.status === "pending" && (
                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">Confirm</Button>
                          <Button variant="outline" className="flex-1">
                            Decline
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage Utilization</CardTitle>
                <CardDescription>Overview of your storage capacity utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Analytics features coming soon!</p>
                  <p className="mt-2">Track your storage utilization, revenue, and more.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

