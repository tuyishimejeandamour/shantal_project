"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, MapPin, Warehouse, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function StoragePage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [storages, setStorages] = useState<any[]>([])

  // Filter options
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedFeature, setSelectedFeature] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")

  useEffect(() => {
    const fetchStorages = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        if (selectedLocation !== "all") params.append("location", selectedLocation)
        if (selectedFeature !== "all") params.append("feature", selectedFeature)
        if (selectedAvailability === "available") params.append("minAvailable", "1")

        // Fetch storage facilities from API
        const response = await fetch(`/api/storage?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch storage facilities")
        }

        const data = await response.json()
        setStorages(data)
      } catch (err) {
        console.error("Error fetching storage facilities:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStorages()
  }, [selectedLocation, selectedFeature, selectedAvailability])

  // Filter storage facilities based on search term
  const filteredStorages = storages.filter(
    (storage) =>
      storage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storage.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Storage Facilities</h1>
          <p className="text-muted-foreground">Find and book storage facilities for your crops.</p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search storage facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {user?.userType === "storage" && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Link href="/storage/register">Register Facility</Link>
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
                    <SelectItem value="kamonyi">Kamonyi</SelectItem>
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
                    <SelectItem value="climate-control">Climate Control</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="pest-control">Pest Control</SelectItem>
                    <SelectItem value="loading-equipment">Loading Equipment</SelectItem>
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
        ) : filteredStorages.length === 0 ? (
          <div className="text-center py-12">
            <Warehouse className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No storage facilities found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStorages.map((storage) => (
              <Card key={storage._id} className="overflow-hidden">
                <div className="relative w-full h-48">
                  {storage.image ? (
                    <Image src={storage.image || "/placeholder.svg"} alt={storage.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Warehouse className="h-12 w-12 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  <Badge variant="outline" className="absolute top-2 right-2 bg-blue-50">
                    {storage.available} Tons Available
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{storage.name}</CardTitle>
                  <CardDescription>{storage.providerName || "Storage Provider"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Location: {storage.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Warehouse className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Total Capacity: {storage.capacity} Tons</span>
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
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="font-medium">{storage.pricePerTon} RWF/ton/month</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled={storage.available <= 0}>
                    <Link href={`/storage/book/${storage._id}`} className="w-full">
                      Book Storage
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

