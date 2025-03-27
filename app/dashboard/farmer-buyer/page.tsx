"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Leaf, Package, ShoppingCart, Truck, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FarmerBuyerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [crops, setCrops] = useState([])
  const [storageBookings, setStorageBookings] = useState([])
  const [transportBookings, setTransportBookings] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch user's crops if they are a farmer
        if (user?.userType === "farmer") {
          const cropsResponse = await fetch(`/api/crops?farmer=${user.id}`)
          if (cropsResponse.ok) {
            const cropsData = await cropsResponse.json()
            setCrops(cropsData)
          }

          // Fetch storage bookings
          const storageResponse = await fetch(`/api/bookings/storage?farmer=${user.id}`)
          if (storageResponse.ok) {
            const storageData = await storageResponse.json()
            setStorageBookings(storageData)
          }

          // Fetch transport bookings
          const transportResponse = await fetch(`/api/bookings/transport?user=${user.id}`)
          if (transportResponse.ok) {
            const transportData = await transportResponse.json()
            setTransportBookings(transportData)
          }
        } else if (user?.userType === "buyer") {
          // Fetch buyer-specific data
          const ordersResponse = await fetch(`/api/orders?buyer=${user.id}`)
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json()
            // Process orders data
          }
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

  // Determine if this is a farmer or buyer dashboard
  const isFarmer = user?.userType === "farmer"
  const dashboardTitle = isFarmer ? "Farmer Dashboard" : "Buyer Dashboard"

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{dashboardTitle}</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here&apos;s an overview of your activities.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isFarmer ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{crops.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {crops.length > 0 ? `${crops.length} active crop listings` : "No active listings"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{storageBookings.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {storageBookings.length > 0 ? `${storageBookings.length} active bookings` : "No storage bookings"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No pending orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transport Bookings</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{transportBookings.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {transportBookings.length > 0
                      ? `${transportBookings.length} active bookings`
                      : "No transport bookings"}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders Placed</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No orders placed yet</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Crops</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No saved crops</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transport Bookings</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No transport bookings</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Farmers Connected</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No farmer connections</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {isFarmer ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="crops">My Crops</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="transport">Transport</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {crops.length === 0 && storageBookings.length === 0 && transportBookings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No recent activity to display.</p>
                        <p className="mt-2">Start by adding crops or booking services.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Display actual activity from the database */}
                        {crops.slice(0, 3).map((crop: any, index) => (
                          <div key={crop._id || index} className="flex items-center">
                            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                              <Package className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Crop listing: {crop.name} ({crop.quantity} {crop.unit})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(crop.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Display actual events from the database */}
                      {transportBookings.slice(0, 3).map((booking: any, index) => (
                        <div key={booking._id || index} className="flex items-center">
                          <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                            <Truck className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Transport: {booking.pickupLocation} to {booking.deliveryLocation}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {transportBookings.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No upcoming events scheduled.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="crops" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">My Crop Listings</h2>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Link href="/crops/add">Add New Crop</Link>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {crops.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>You haven&apos;t listed any crops yet.</p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      <Link href="/crops/add">Add Your First Crop</Link>
                    </Button>
                  </div>
                ) : (
                  crops.map((crop: any) => (
                    <Card key={crop._id}>
                      <CardHeader>
                        <CardTitle>{crop.name}</CardTitle>
                        <CardDescription>Listed on {new Date(crop.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Quantity:</span>
                            <span className="text-sm font-medium">
                              {crop.quantity} {crop.unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Quality:</span>
                            <span className="text-sm font-medium">{crop.quality}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <span className="text-sm font-medium">{crop.price} RWF/kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className="text-sm font-medium text-green-600">{crop.status}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="storage" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">My Storage Bookings</h2>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Link href="/storage">Find Storage</Link>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {storageBookings.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>You haven&apos;t booked any storage facilities yet.</p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      <Link href="/storage">Find Storage Facilities</Link>
                    </Button>
                  </div>
                ) : (
                  storageBookings.map((booking: any) => (
                    <Card key={booking._id}>
                      <CardHeader>
                        <CardTitle>{booking.storageName || "Storage Facility"}</CardTitle>
                        <CardDescription>Booked on {new Date(booking.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
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
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className="text-sm font-medium text-green-600">{booking.status}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="transport" className="space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">My Transport Bookings</h2>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Link href="/transport">Find Transport</Link>
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {transportBookings.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>You haven&apos;t booked any transport services yet.</p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      <Link href="/transport">Find Transport Services</Link>
                    </Button>
                  </div>
                ) : (
                  transportBookings.map((booking: any) => (
                    <Card key={booking._id}>
                      <CardHeader>
                        <CardTitle>{booking.transportName || "Transport Service"}</CardTitle>
                        <CardDescription>Booked on {new Date(booking.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Route:</span>
                            <span className="text-sm font-medium">
                              {booking.pickupLocation} to {booking.deliveryLocation}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Date:</span>
                            <span className="text-sm font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className="text-sm font-medium text-amber-600">{booking.status}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="marketplace" className="space-y-4">
            <TabsList>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="saved">Saved Items</TabsTrigger>
            </TabsList>
            <TabsContent value="marketplace" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Crops</CardTitle>
                  <CardDescription>Browse crops available for purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Link href="/marketplace">Browse Marketplace</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven&apos;t placed any orders yet.</p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="saved" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven&apos;t saved any items yet.</p>
                <p className="mt-2">Browse the marketplace and save items for later.</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

