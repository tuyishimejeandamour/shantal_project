"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Filter, MapPin, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function MarketplacePage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [crops, setCrops] = useState<any[]>([])

  // Filter options
  const [selectedCropType, setSelectedCropType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedQuality, setSelectedQuality] = useState("all")

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        if (searchTerm) params.append("name", searchTerm)
        if (selectedLocation !== "all") params.append("location", selectedLocation)
        if (selectedQuality !== "all") params.append("quality", selectedQuality)
        params.append("minPrice", priceRange[0].toString())
        params.append("maxPrice", priceRange[1].toString())
        params.append("status", "available")

        // Fetch crops from API
        const response = await fetch(`/api/crops?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch crops")
        }

        const data = await response.json()
        setCrops(data)
      } catch (err) {
        console.error("Error fetching crops:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCrops()
  }, [searchTerm, selectedCropType, selectedLocation, selectedQuality, priceRange])

  // Filter crops based on search term and price range
  const filteredCrops = crops.filter(
    (crop) =>
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      crop.price >= priceRange[0] &&
      crop.price <= priceRange[1],
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">Find and connect with farmers to purchase crops directly.</p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <div className="flex-1">
              <Input placeholder="Search crops..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {user?.userType === "farmer" && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Link href="/crops/add">Add New Crop</Link>
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Crop Type</label>
                <Select value={selectedCropType} onValueChange={setSelectedCropType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All crops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All crops</SelectItem>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="beans">Beans</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="cassava">Cassava</SelectItem>
                    <SelectItem value="sweet-potatoes">Sweet Potatoes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <label className="text-sm font-medium">Quality</label>
                <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="All qualities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All qualities</SelectItem>
                    <SelectItem value="Grade A">Grade A</SelectItem>
                    <SelectItem value="Grade B">Grade B</SelectItem>
                    <SelectItem value="Grade C">Grade C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-3">
                <label className="text-sm font-medium">
                  Price Range (RWF/kg): {priceRange[0]} - {priceRange[1]}
                </label>
                <Slider
                  defaultValue={[0, 1000]}
                  max={1000}
                  step={50}
                  value={priceRange}
                  onValueChange={setPriceRange}
                />
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
        ) : filteredCrops.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No crops found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCrops.map((crop) => (
              <Card key={crop._id} className="overflow-hidden">
                <div className="relative w-full h-48">
                  {crop.image ? (
                    <Image src={crop.image || "/placeholder.svg"} alt={crop.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground opacity-20" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2" variant="outline">
                    {crop.quality}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{crop.name}</CardTitle>
                  <CardDescription>Harvested: {new Date(crop.harvestDate).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        Quantity: {crop.quantity} {crop.unit}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Location: {crop.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Farmer: {crop.farmerName || "Unknown"}</span>
                      <span className="font-medium">{crop.price} RWF/kg</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Link href={`/marketplace/${crop._id}`} className="w-full">
                      View Details
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

