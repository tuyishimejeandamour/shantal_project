"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, MapPin, Truck, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function TransportPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transporters, setTransporters] = useState<any[]>([])

  // Filter options
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedVehicleType, setSelectedVehicleType] = useState("all")
  const [selectedFeature, setSelectedFeature] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")

  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        if (selectedLocation !== "all") params.append("location", selectedLocation)
        if (selectedVehicleType !== "all") params.append("vehicleType", selectedVehicleType)
        if (selectedFeature !== "all") params.append("feature", selectedFeature)
        if (selectedAvailability !== "all") params.append("availability", "Available")

        // Fetch transport providers from API
        const response = await fetch(`/api/transport?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch transport providers")
        }

        const data = await response.json()
        setTransporters(data)
      } catch (err) {
        console.error("Error fetching transport providers:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTransporters()
  }, [selectedLocation, selectedVehicleType, selectedFeature, selectedAvailability])

  // Filter transporters based on search term
  const filteredTransporters = transporters.filter(
    (transporter) =>
      transporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transporter.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Transport Services</h1>
          <p className="text-muted-foreground">Find and book transport services for your crops.</p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search transport providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {user?.userType === "transporter" && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Link href="/transport/register">Register Vehicle</Link>
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    <SelectItem value="kigali">Kigali</SelectItem>
                    <SelectItem value="huye">Huye</SelectItem>
                    <SelectItem value="musanze">Musanze</SelectItem>
                    <SelectItem value="rubavu">Rubavu</SelectItem>
                    <SelectItem value="nyagatare">Nyagatare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle Type</label>
                <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="lorry">Lorry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Features</label>
                <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any features" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any features</SelectItem>
                    <SelectItem value="refrigerated">Refrigerated</SelectItem>
                    <SelectItem value="gps-tracking">GPS Tracking</SelectItem>
                    <SelectItem value="covered">Covered</SelectItem>
                    <SelectItem value="hydraulic-lift">Hydraulic Lift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any availability</SelectItem>
                    <SelectItem value="available">Available Now</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredTransporters.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No transport providers found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTransporters.map((transporter) => (
              <Card key={transporter._id} className="overflow-hidden">
                <div className="relative w-full h-48">
                  {transporter.image ? (
                    <Image
                      src={transporter.image || "/placeholder.svg"}
                      alt={transporter.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Truck className="h-12 w-12 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className={`absolute top-2 right-2 ${transporter.availability === "Available" ? "bg-green-50" : "bg-amber-50"}`}
                  >
                    {transporter.availability}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{transporter.name}</CardTitle>
                  <CardDescription>{transporter.providerName || "Transport Provider"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Location: {transporter.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {transporter.vehicleType} - {transporter.capacity} Tons
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Features:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {transporter.features?.map((feature: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{transporter.pricePerKm} RWF/km</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={transporter.availability !== "Available"}
                  >
                    <Link href={`/transport/book/${transporter._id}`} className="w-full">
                      Book Transport
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

