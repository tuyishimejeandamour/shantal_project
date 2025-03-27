"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, Leaf, Truck, Warehouse, Loader2, BarChart } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CooperativeDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState([])
  const [crops, setCrops] = useState([])
  const [storageBookings, setStorageBookings] = useState([])
  const [transportBookings, setTransportBookings] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch cooperative members
        const membersResponse = await fetch(`/api/cooperative/members?cooperative=${user?.id}`)
        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          setMembers(membersData)
        }

        // Fetch cooperative crops
        const cropsResponse = await fetch(`/api/crops?cooperative=${user?.id}`)
        if (cropsResponse.ok) {
          const cropsData = await cropsResponse.json()
          setCrops(cropsData)
        }

        // Fetch storage bookings
        const storageResponse = await fetch(`/api/bookings/storage?cooperative=${user?.id}`)
        if (storageResponse.ok) {
          const storageData = await storageResponse.json()
          setStorageBookings(storageData)
        }

        // Fetch transport bookings
        const transportResponse = await fetch(`/api/bookings/transport?cooperative=${user?.id}`)
        if (transportResponse.ok) {
          const transportData = await transportResponse.json()
          setTransportBookings(transportData)
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
          <h1 className="text-3xl font-bold tracking-tight">Cooperative Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Manage your cooperative and members.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {members.length > 0 ? `${members.length} registered members` : "No members registered"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crop Listings</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Storage Bookings</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Transport Bookings</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transportBookings.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {transportBookings.length > 0 ? `${transportBookings.length} active bookings` : "No transport bookings"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="crops">Crops</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Cooperative Members</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Link href="/cooperative/invite">Invite Members</Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Member Directory</CardTitle>
                <CardDescription>All registered members of your cooperative</CardDescription>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No members have joined your cooperative yet.</p>
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      <Link href="/cooperative/invite">Invite Your First Member</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                      <div>Name</div>
                      <div>Location</div>
                      <div>Crops</div>
                      <div>Joined</div>
                    </div>
                    {members.map((member: any) => (
                      <div key={member._id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
                        <div>{member.name}</div>
                        <div>{member.location}</div>
                        <div>{member.cropCount || 0}</div>
                        <div>{new Date(member.joinedDate).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crops" className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Cooperative Crops</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Link href="/crops/add">Add Cooperative Crop</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {crops.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <p>No crops have been listed by your cooperative yet.</p>
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

          <TabsContent value="services" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Services</CardTitle>
                  <CardDescription>Manage cooperative storage bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {storageBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No storage bookings have been made yet.</p>
                      <Button className="mt-4 bg-green-600 hover:bg-green-700">
                        <Link href="/storage">Find Storage Facilities</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {storageBookings.slice(0, 3).map((booking: any) => (
                        <div
                          key={booking._id}
                          className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium">{booking.storageName || "Storage Facility"}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.quantity} Tons - {booking.status}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transport Services</CardTitle>
                  <CardDescription>Manage cooperative transport bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {transportBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No transport bookings have been made yet.</p>
                      <Button className="mt-4 bg-green-600 hover:bg-green-700">
                        <Link href="/transport">Find Transport Services</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transportBookings.slice(0, 3).map((booking: any) => (
                        <div
                          key={booking._id}
                          className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium">
                              {booking.pickupLocation} to {booking.deliveryLocation}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString()} - {booking.status}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cooperative Performance</CardTitle>
                <CardDescription>Overview of your cooperative's performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart className="h-16 w-16 mx-auto mb-4 text-green-600 opacity-50" />
                  <p>Analytics features coming soon!</p>
                  <p className="mt-2">Track your cooperative's growth, revenue, and member performance.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

