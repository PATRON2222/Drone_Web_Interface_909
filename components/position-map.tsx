"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

// Flight path simulation
class FlightPathSimulator {
  baseLatitude = 47.123456
  baseLongitude = 8.123456
  currentLatitude = this.baseLatitude
  currentLongitude = this.baseLongitude
  currentAltitude = 1.5 // Starting at 1.5m

  // Flight pattern parameters
  radius = 0.0005 // Radius of the circular pattern
  angle = 0 // Current angle in the pattern
  angleIncrement = 0.05 // How fast we move around the pattern
  altitudeDirection = 0.01 // Small altitude change

  // Get the next position in a realistic flight pattern
  getNextPosition() {
    // Update the angle for a circular/figure-8 pattern
    this.angle += this.angleIncrement

    // Calculate new position using a figure-8 pattern
    const latOffset = this.radius * Math.sin(this.angle)
    const lonOffset = this.radius * Math.sin(this.angle * 2) * 0.5

    // Update position with some small random variations for realism
    this.currentLatitude = this.baseLatitude + latOffset + (Math.random() - 0.5) * 0.00001
    this.currentLongitude = this.baseLongitude + lonOffset + (Math.random() - 0.5) * 0.00001

    // Update altitude with small changes
    if (Math.random() > 0.8) {
      this.altitudeDirection = Math.max(-0.03, Math.min(0.03, this.altitudeDirection + (Math.random() - 0.5) * 0.01))
    }

    this.currentAltitude += this.altitudeDirection
    this.currentAltitude = Math.max(0.5, Math.min(3, this.currentAltitude))

    return {
      latitude: this.currentLatitude,
      longitude: this.currentLongitude,
      altitude: this.currentAltitude,
    }
  }
}

export function PositionMap() {
  const canvasRef = useRef(null)
  const [positions, setPositions] = useState([])
  const flightSimulator = useRef(new FlightPathSimulator())

  // Simulate real-time data updates with a realistic flight path
  useEffect(() => {
    const interval = setInterval(() => {
      const newPosition = flightSimulator.current.getNextPosition()
      setPositions((prev) => [...prev.slice(-100), newPosition])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Draw the map and trajectory
  useEffect(() => {
    if (!canvasRef.current || positions.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const { width, height } = canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 0.5

    const gridSize = 50
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Calculate bounds for scaling
    if (positions.length < 2) return

    const minLat = Math.min(...positions.map((p) => p.latitude))
    const maxLat = Math.max(...positions.map((p) => p.latitude))
    const minLon = Math.min(...positions.map((p) => p.longitude))
    const maxLon = Math.max(...positions.map((p) => p.longitude))

    const latRange = maxLat - minLat || 0.001
    const lonRange = maxLon - minLon || 0.001

    // Draw trajectory
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()

    positions.forEach((pos, i) => {
      const x = ((pos.longitude - minLon) / lonRange) * (width - 40) + 20
      const y = height - ((pos.latitude - minLat) / latRange) * (height - 40) - 20

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw current position
    const currentPos = positions[positions.length - 1]
    const x = ((currentPos.longitude - minLon) / lonRange) * (width - 40) + 20
    const y = height - ((currentPos.latitude - minLat) / latRange) * (height - 40) - 20

    // Draw direction indicator if we have at least 2 positions
    if (positions.length > 1) {
      const prevPos = positions[positions.length - 2]
      const prevX = ((prevPos.longitude - minLon) / lonRange) * (width - 40) + 20
      const prevY = height - ((prevPos.latitude - minLat) / latRange) * (height - 40) - 20

      const angle = Math.atan2(y - prevY, x - prevX)

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15)
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()

    // Add altitude indicator
    ctx.font = "12px Arial"
    ctx.fillStyle = "#ffffff"
    ctx.fillText(`Alt: ${currentPos.altitude.toFixed(2)}m`, x + 10, y - 10)
  }, [positions])

  return (
    <Card className="p-0 overflow-hidden">
      <canvas ref={canvasRef} width={800} height={500} className="w-full h-[500px] bg-card" />
    </Card>
  )
}

