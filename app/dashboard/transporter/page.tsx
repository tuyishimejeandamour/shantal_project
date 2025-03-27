"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Truck, MapPin, Calendar, Loader2, Plus, BarChart } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function TransporterDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch transport vehicles owned by this provider
        const vehiclesResponse = await fetch(`/api/transport?provider=${user?.id}`)
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json()
          setVehicles(vehiclesData)
        }

        // Fetch bookings for this provider's transport services
        const bookingsResponse = await fetch(`/api/bookings/transport?provider=${user?.id}`)
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
          <h1 className="text-3xl font-bold tracking-tight">Transporter Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your transport services and bookings.
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
              <CardTitle className="text-sm font-medium">Transport Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {vehicles.length > 0 ? `${vehicles.length} vehicles listed` : "No vehicles listed"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vehicles.reduce((total: number, vehicle: any) => total + (vehicle.capacity || 0), 0)} Tons
              </div>
              <p className="text-xs text-muted-foreground">Total transport capacity</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vehicles.filter((vehicle: any) => vehicle.availability === "Available").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Vehicles ready for booking</p>
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

        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="routes">Popular Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">My Transport Vehicles</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Link href="/transport/register" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Vehicle
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>You haven&apos;t listed any transport vehicles yet.</p>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">
                    <Link href="/transport/register" className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Vehicle
                    </Link>
                  </Button>
                </div>
              ) : (
                vehicles.map((vehicle: any) => (
                  <Card key={vehicle._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{vehicle.name}</CardTitle>
                        <Badge
                          variant={vehicle.availability === "Available" ? "default" : "outline"}
                          className={
                            vehicle.availability !== "Available"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {vehicle.availability}
                        </Badge>
                      </div>
                      <CardDescription>
                        {vehicle.vehicleType} - {vehicle.capacity} Tons
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Location: {vehicle.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Price per km:</span>
                          <span className="text-sm font-medium">{vehicle.pricePerKm} RWF</span>
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium">Features:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {vehicle.features?.map((feature: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button
                          variant={vehicle.availability === "Available" ? "destructive" : "default"}
                          className={vehicle.availability !== "Available" ? "bg-green-600 hover:bg-green-700" : ""}
                          size="sm"
                        >
                          {vehicle.availability === "Available" ? "Mark as Unavailable" : "Mark as Available"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Transport Bookings</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {bookings.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>You don&apos;t have any transport bookings yet.</p>
                  <p className="mt-2">Once users book your transport services, they will appear here.</p>
                </div>
              ) : (
                bookings.map((booking: any) => (
                  <Card key={booking._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {booking.pickupLocation} to {booking.deliveryLocation}
                        </CardTitle>
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
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{booking.userName || "Unknown"}</span>
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
                          <span className="text-sm text-muted-foreground">Date:</span>
                          <span className="text-sm font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Distance:</span>
                          <span className="text-sm font-medium">{booking.distance} km</span>
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

          <TabsContent value="routes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Transport Routes</CardTitle>
                <CardDescription>Overview of your most requested routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart className="h-16 w-16 mx-auto mb-4 text-green-600 opacity-50" />
                  <p>Route analytics features coming soon!</p>
                  <p className="mt-2">Track your most popular routes, revenue per route, and more.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

