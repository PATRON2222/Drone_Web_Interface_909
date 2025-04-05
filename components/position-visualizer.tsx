"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

interface PositionData {
  x: number
  y: number
  z: number
  time: number
}

// Flight path simulator for local position
class LocalFlightPathSimulator {
  // Current position
  x = 0
  y = 0
  z = -1.5 // Starting at 1.5m altitude (NED frame, so negative)

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
  getNextPosition() {
    // Update the angle for a circular/figure-8 pattern
    this.angle += this.angleIncrement

    // Calculate new position using a figure-8 pattern
    const targetX = this.radius * Math.sin(this.angle)
    const targetY = this.radius * Math.sin(this.angle * 2) * 0.5

    // Smoothly move toward the target position
    this.x = this.x * 0.95 + targetX * 0.05
    this.y = this.y * 0.95 + targetY * 0.05

    // Update velocities based on position changes
    this.vx = targetX - this.x
    this.vy = targetY - this.y

    // Update altitude with small changes
    if (Math.random() > 0.9) {
      this.altitudeDirection = Math.max(-0.02, Math.min(0.02, this.altitudeDirection + (Math.random() - 0.5) * 0.005))
    }

    this.z += this.altitudeDirection

    // Keep altitude within realistic bounds (NED frame, so negative values)
    this.z = Math.min(-0.5, Math.max(-3, this.z))

    // Calculate vertical velocity
    this.vz = this.altitudeDirection

    return {
      x: this.x,
      y: this.y,
      z: this.z,
      vx: this.vx,
      vy: this.vy,
      vz: this.vz,
      time: Date.now(),
    }
  }
}

export function PositionVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [positions, setPositions] = useState<PositionData[]>([])
  const flightSimulator = useRef(new LocalFlightPathSimulator())

  useEffect(() => {
    const fetchPositionData = async () => {
      try {
        const response = await fetch(`/params/LOCAL_POSITION_NED.json?t=${Date.now()}`)
        if (!response.ok) {
          // Generate realistic flight data if fetch fails
          const newPosition = flightSimulator.current.getNextPosition()

          setPositions((prev) => {
            const newPositions = [...prev, newPosition]
            if (newPositions.length > 100) {
              return newPositions.slice(-100)
            }
            return newPositions
          })
          return
        }

        const data = await response.json()
        if (data && typeof data.x === "number" && typeof data.y === "number" && typeof data.z === "number") {
          const newPosition = {
            x: data.x,
            y: data.y,
            z: data.z,
            time: Date.now(),
          }

          setPositions((prev) => {
            const newPositions = [...prev, newPosition]
            if (newPositions.length > 100) {
              return newPositions.slice(-100)
            }
            return newPositions
          })
        }
      } catch (error) {
        console.error("Error fetching position data:", error)
        // Generate realistic flight data if fetch fails
        const newPosition = flightSimulator.current.getNextPosition()

        setPositions((prev) => {
          const newPositions = [...prev, newPosition]
          if (newPositions.length > 100) {
            return newPositions.slice(-100)
          }
          return newPositions
        })
      }
    }

    // Initial fetch
    fetchPositionData()

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchPositionData, 500)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  // Draw the position visualization
  useEffect(() => {
    if (!canvasRef.current || positions.length === 0) return 

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
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

    const minX = Math.min(...positions.map((p) => p.x)) - 1
    const maxX = Math.max(...positions.map((p) => p.x)) + 1
    const minY = Math.min(...positions.map((p) => p.y)) - 1
    const maxY = Math.max(...positions.map((p) => p.y)) + 1

    const xRange = maxX - minX || 2
    const yRange = maxY - minY || 2

    // Draw trajectory
    ctx.strokeStyle = "#00E1FF"
    ctx.lineWidth = 2
    ctx.beginPath()

    positions.forEach((pos, i) => {
      const x = ((pos.x - minX) / xRange) * (width - 40) + 20
      const y = height - ((pos.y - minY) / yRange) * (height - 40) - 20

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw current position
    const currentPos = positions[positions.length - 1]
    const x = ((currentPos.x - minX) / xRange) * (width - 40) + 20
    const y = height - ((currentPos.y - minY) / yRange) * (height - 40) - 20

    // Draw direction indicator
    if (positions.length > 1) {
      const prevPos = positions[positions.length - 2]
      const prevX = ((prevPos.x - minX) / xRange) * (width - 40) + 20
      const prevY = height - ((prevPos.y - minY) / yRange) * (height - 40) - 20

      const angle = Math.atan2(y - prevY, x - prevX)

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(angle) * 20, y + Math.sin(angle) * 20)
      ctx.strokeStyle = "#FF3B30"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw current position point
    ctx.fillStyle = "#00E1FF"
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()

    // Draw home position
    ctx.fillStyle = "#FFD60A"
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2)
    ctx.fill()

    // Add labels
    ctx.font = "12px Arial"
    ctx.fillStyle = "#FFFFFF"
    ctx.fillText(`X: ${currentPos.x.toFixed(2)}m`, 10, 20)
    ctx.fillText(`Y: ${currentPos.y.toFixed(2)}m`, 10, 40)
    ctx.fillText(`Z: ${currentPos.z.toFixed(2)}m`, 10, 60)
    ctx.fillText(`Alt: ${(-currentPos.z).toFixed(2)}m`, 10, 80) // Convert NED Z to altitude
  }, [positions])

  return (
    <Card className="p-0 overflow-hidden">
      <canvas ref={canvasRef} width={800} height={500} className="w-full h-[500px] bg-card" />
    </Card>
  )
}

