"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Leaf, User, MapPin, Calendar, Tag, Truck, Warehouse, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CropDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [crop, setCrop] = useState<any>(null)
  const [farmer, setFarmer] = useState<any>(null)
  const [transporters, setTransporters] = useState<any[]>([])
  const [storages, setStorages] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch crop details
        const cropResponse = await fetch(`/api/crops/${params.id}`)
        if (!cropResponse.ok) {
          throw new Error("Failed to fetch crop details")
        }
        const cropData = await cropResponse.json()
        setCrop(cropData)

        // Fetch farmer details
        const farmerResponse = await fetch(`/api/users/${cropData.farmer}`)
        if (farmerResponse.ok) {
          const farmerData = await farmerResponse.json()
          setFarmer(farmerData)
        }

        // Fetch available transporters in the area
        const transportResponse = await fetch(`/api/transport?location=${cropData.location}`)
        if (transportResponse.ok) {
          const transportData = await transportResponse.json()
          setTransporters(transportData.slice(0, 3)) // Get top 3 transporters
        }

        // Fetch available storage facilities in the area
        const storageResponse = await fetch(`/api/storage?location=${cropData.location}`)
        if (storageResponse.ok) {
          const storageData = await storageResponse.json()
          setStorages(storageData.slice(0, 3)) // Get top 3 storage facilities
        }
      } catch (err) {
        console.error("Error fetching crop details:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleContactFarmer = () => {
    // In a real app, this could open a chat or messaging interface
    toast({
      title: "Contact Information",
      description: `Contact ${farmer?.name} at ${farmer?.phone || "N/A"}`,
    })
  }

  const handleReserveCrop = async () => {
    try {
      if (!user) {
        router.push(`/login?redirect=/marketplace/${params.id}`)
        return
      }

      // In a real app, this would create a reservation or order
      toast({
        title: "Reservation Request Sent",
        description: "The farmer will be notified of your interest.",
      })
    } catch (err) {
      console.error("Error reserving crop:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reserve crop. Please try again.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Loading crop details...</p>
        </div>
      </div>
    )
  }

  if (error || !crop) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>{error || "Crop not found"}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/marketplace")}>
          Back to Marketplace
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="relative w-full h-64">
              {crop.image ? (
                <Image
                  src={crop.image || "/placeholder.svg"}
                  alt={crop.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground opacity-20" />
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <CardTitle>{crop.name}</CardTitle>
                </div>
                <Badge
                  variant={crop.status === "available" ? "default" : "outline"}
                  className={
                    crop.status === "available"
                      ? "bg-green-100 text-green-800"
                      : crop.status === "reserved"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                {new Date(crop.harvestDate).toLocaleDateString()} • {crop.quality}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Farmer: {farmer?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Location: {crop.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Harvested: {new Date(crop.harvestDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Price: {crop.price} RWF/kg</span>
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium mb-2">Quantity Available</h3>
                <div className="flex items-center justify-between">
                  <span>
                    {crop.quantity} {crop.unit}
                  </span>
                  <span className="text-green-600 font-medium">Total Value: {crop.price * crop.quantity} RWF</span>
                </div>
              </div>

              {crop.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{crop.description}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleContactFarmer}>
                Contact Farmer
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleReserveCrop}
                disabled={crop.status !== "available"}
              >
                {crop.status === "available" ? "Reserve Crop" : "Not Available"}
              </Button>
            </CardFooter>
          </Card>

          <Tabs defaultValue="transport" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transport">Transport Options</TabsTrigger>
              <TabsTrigger value="storage">Storage Options</TabsTrigger>
            </TabsList>
            <TabsContent value="transport" className="space-y-4">
              <h2 className="text-xl font-semibold">Available Transport in {crop.location}</h2>
              {transporters.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {transporters.map((transporter) => (
                    <Card key={transporter._id} className="overflow-hidden">
                      <div className="relative w-full h-32">
                        {transporter.image ? (
                          <Image
                            src={transporter.image || "/placeholder.svg"}
                            alt={transporter.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Truck className="h-8 w-8 text-muted-foreground opacity-20" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{transporter.name}</CardTitle>
                        <CardDescription>
                          {transporter.vehicleType} - {transporter.capacity} Tons
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm">
                          <p className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {transporter.location}
                          </p>
                          <p className="mt-1 font-medium">{transporter.pricePerKm} RWF/km</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                          <Link href={`/transport/book/${transporter._id}`} className="w-full">
                            Book Transport
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                  <p>No transport providers available in this area.</p>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => router.push("/transport")}>
                    Browse All Transport Options
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="storage" className="space-y-4">
              <h2 className="text-xl font-semibold">Available Storage in {crop.location}</h2>
              {storages.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {storages.map((storage) => (
                    <Card key={storage._id} className="overflow-hidden">
                      <div className="relative w-full h-32">
                        {storage.image ? (
                          <Image
                            src={storage.image || "/placeholder.svg"}
                            alt={storage.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Warehouse className="h-8 w-8 text-muted-foreground opacity-20" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{storage.name}</CardTitle>
                        <CardDescription>{storage.available} Tons Available</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm">
                          <p className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {storage.location}
                          </p>
                          <p className="mt-1 font-medium">{storage.pricePerTon} RWF/ton/month</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                          <Link href={`/storage/book/${storage._id}`} className="w-full">
                            Book Storage
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Warehouse className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                  <p>No storage facilities available in this area.</p>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={() => router.push("/storage")}>
                    Browse All Storage Options
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {farmer ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{farmer.name}</p>
                      <p className="text-sm text-muted-foreground">{farmer.location}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Member since:</span>{" "}
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Crops listed:</span> {farmer.cropCount || "N/A"}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleContactFarmer}>
                    Contact Farmer
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Farmer information not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Similar Crops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Similar crops will appear here based on type and location.
                </p>
                <Button variant="outline" className="w-full" onClick={() => router.push("/marketplace")}>
                  Browse Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

