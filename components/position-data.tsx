"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Compass, ArrowUp } from "lucide-react"

// Flight path simulator for realistic position data
class PositionDataSimulator {
  // Current position
  x = 0
  y = 0
  z = -1.5 // Starting at 1.5m altitude (NED frame, so negative)

  // Global position
  lat = 47123456
  lon = 8123456
  alt = 100000
  relativeAlt = 1500 // 1.5m in mm

  // Velocities
  vx = 0.2
  vy = 0.1
  vz = 0

  // Flight pattern parameters
  radius = 5 // Radius of the pattern in meters
  angle = 0 // Current angle in the pattern
  angleIncrement = 0.05 // How fast we move around the pattern
  altitudeDirection = 0.01 // Small altitude change

  // Get the next position in a realistic flight pattern
  update() {
    // Update the angle for a circular/figure-8 pattern
    this.angle += this.angleIncrement

    // Calculate new position using a figure-8 pattern
    const targetX = this.radius * Math.sin(this.angle)
    const targetY = this.radius * Math.sin(this.angle * 2) * 0.5

    // Smoothly move toward the target position
    this.x = this.x * 0.95 + targetX * 0.05
    this.y = this.y * 0.95 + targetY * 0.05

    // Update velocities based on position changes
    this.vx = (targetX - this.x) * 2
    this.vy = (targetY - this.y) * 2

    // Update altitude with small changes
    if (Math.random() > 0.9) {
      this.altitudeDirection = Math.max(-0.02, Math.min(0.02, this.altitudeDirection + (Math.random() - 0.5) * 0.005))
    }

    this.z += this.altitudeDirection

    // Keep altitude within realistic bounds (NED frame, so negative values)
    this.z = Math.min(-0.5, Math.max(-3, this.z))
    this.vz = this.altitudeDirection

    // Update global position
    this.lat += Math.floor(this.vy * 10)
    this.lon += Math.floor(this.vx * 10)
    this.relativeAlt = Math.floor(-this.z * 1000) // Convert to mm
    this.alt = 100000 + this.relativeAlt

    return {
      localPosition: {
        x: this.x,
        y: this.y,
        z: this.z,
        vx: this.vx,
        vy: this.vy,
        vz: this.vz,
      },
      globalPosition: {
        lat: this.lat,
        lon: this.lon,
        alt: this.alt,
        relative_alt: this.relativeAlt,
        vx: Math.floor(this.vx * 100), // cm/s
        vy: Math.floor(this.vy * 100), // cm/s
        vz: Math.floor(this.vz * 100), // cm/s
        hdg: Math.floor(Math.random() * 360), // heading in degrees
      },
    }
  }
}

export function PositionData() {
  const [localPosition, setLocalPosition] = useState<any>(null)
  const [globalPosition, setGlobalPosition] = useState<any>(null)
  const simulator = useRef(new PositionDataSimulator())

  useEffect(() => {
    const fetchPositionData = async () => {
      try {
        // Fetch LOCAL_POSITION_NED
        const localRes = await fetch(`/params/LOCAL_POSITION_NED.json?t=${Date.now()}`)
        if (localRes.ok) {
          const localData = await localRes.json()
          setLocalPosition(localData)
        } else {
          // Generate realistic mock data if fetch fails
          const simulatedData = simulator.current.update()
          setLocalPosition(simulatedData.localPosition)
          setGlobalPosition(simulatedData.globalPosition)
          return
        }

        // Fetch GLOBAL_POSITION_INT
        const globalRes = await fetch(`/params/GLOBAL_POSITION_INT.json?t=${Date.now()}`)
        if (globalRes.ok) {
          const globalData = await globalRes.json()
          setGlobalPosition(globalData)
        } else {
          // Generate realistic mock data if fetch fails
          const simulatedData = simulator.current.update()
          setGlobalPosition(simulatedData.globalPosition)
        }
      } catch (error) {
        console.error("Error fetching position data:", error)
        // Generate realistic mock data if fetch fails
        const simulatedData = simulator.current.update()
        setLocalPosition(simulatedData.localPosition)
        setGlobalPosition(simulatedData.globalPosition)
      }
    }

    // Initial fetch
    fetchPositionData()

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchPositionData, 1000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {globalPosition && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>GPS Coordinates</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Latitude</div>
                <div className="font-mono text-sm">{(globalPosition.lat / 1e7).toFixed(6)}°</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Longitude</div>
                <div className="font-mono text-sm">{(globalPosition.lon / 1e7).toFixed(6)}°</div>
              </div>
            </div>
          </div>
        )}

        {globalPosition && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUp className="h-4 w-4" />
              <span>Altitude</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">MSL</div>
                <div className="font-mono text-sm">{(globalPosition.alt / 1000).toFixed(2)} m</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Relative</div>
                <div className="font-mono text-sm">{(globalPosition.relative_alt / 1000).toFixed(2)} m</div>
              </div>
            </div>
          </div>
        )}

        {localPosition && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4" />
              <span>Local Position</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">X</div>
                <div className="font-mono text-sm">{localPosition.x.toFixed(2)} m</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Y</div>
                <div className="font-mono text-sm">{localPosition.y.toFixed(2)} m</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Z</div>
                <div className="font-mono text-sm">{localPosition.z.toFixed(2)} m</div>
              </div>
            </div>
          </div>
        )}

        {localPosition && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Compass className="h-4 w-4" />
              <span>Velocity</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">VX</div>
                <div className="font-mono text-sm">{localPosition.vx.toFixed(2)} m/s</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">VY</div>
                <div className="font-mono text-sm">{localPosition.vy.toFixed(2)} m/s</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">VZ</div>
                <div className="font-mono text-sm">{localPosition.vz.toFixed(2)} m/s</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

