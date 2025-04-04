"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, ArrowUp, RotateCw } from "lucide-react"

// Attitude simulator for realistic attitude data
class AttitudeSimulator {
  // Attitude data
  roll = 0
  pitch = 0
  yaw = 0
  rollSpeed = 0
  pitchSpeed = 0
  yawSpeed = 0

  // Flight pattern parameters
  angle = 0
  angleIncrement = 0.05

  // Update attitude with realistic changes
  update() {
    // Update the angle for a circular/figure-8 pattern
    this.angle += this.angleIncrement

    // Calculate target attitude based on a realistic flight pattern
    const targetRoll = Math.sin(this.angle) * 0.2 // gentle roll, max ~11 degrees
    const targetPitch = Math.sin(this.angle * 2) * 0.1 // gentle pitch, max ~6 degrees
    const targetYaw = this.angle % (2 * Math.PI) // continuous yaw rotation

    // Smoothly move toward the target attitude
    this.roll = this.roll * 0.9 + targetRoll * 0.1
    this.pitch = this.pitch * 0.9 + targetPitch * 0.1

    // Calculate yaw change with proper handling of the 2π boundary
    let yawDiff = targetYaw - this.yaw
    if (yawDiff > Math.PI) yawDiff -= 2 * Math.PI
    if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI

    this.yawSpeed = yawDiff * 0.1
    this.yaw += this.yawSpeed

    // Keep yaw in range [0, 2π]
    if (this.yaw > 2 * Math.PI) this.yaw -= 2 * Math.PI
    if (this.yaw < 0) this.yaw += 2 * Math.PI

    // Calculate angular rates
    this.rollSpeed = (targetRoll - this.roll) * 2
    this.pitchSpeed = (targetPitch - this.pitch) * 2

    return {
      roll: this.roll,
      pitch: this.pitch,
      yaw: this.yaw,
      rollspeed: this.rollSpeed,
      pitchspeed: this.pitchSpeed,
      yawspeed: this.yawSpeed,
    }
  }
}

export function AttitudeData() {
  const [attitude, setAttitude] = useState<any>(null)
  const simulator = useRef(new AttitudeSimulator())

  useEffect(() => {
    const fetchAttitudeData = async () => {
      try {
        const response = await fetch(`/params/ATTITUDE.json?t=${Date.now()}`)
        if (!response.ok) {
          // Generate realistic mock data if fetch fails
          setAttitude(simulator.current.update())
          return
        }

        const data = await response.json()
        setAttitude(data)
      } catch (error) {
        console.error("Error fetching attitude data:", error)
        // Generate realistic mock data if fetch fails
        setAttitude(simulator.current.update())
      }
    }

    // Initial fetch
    fetchAttitudeData()

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchAttitudeData, 500)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  // Convert radians to degrees
  const radToDeg = (rad: number) => ((rad * 180) / Math.PI).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attitude Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {attitude ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCw className="h-4 w-4" />
                <span>Roll</span>
              </div>
              <div className="rounded-md border p-2">
                <div className="font-mono text-2xl">{radToDeg(attitude.roll)}°</div>
                <div className="text-xs text-muted-foreground">Roll Rate: {radToDeg(attitude.rollspeed)}°/s</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUp className="h-4 w-4" />
                <span>Pitch</span>
              </div>
              <div className="rounded-md border p-2">
                <div className="font-mono text-2xl">{radToDeg(attitude.pitch)}°</div>
                <div className="text-xs text-muted-foreground">Pitch Rate: {radToDeg(attitude.pitchspeed)}°/s</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Compass className="h-4 w-4" />
                <span>Yaw</span>
              </div>
              <div className="rounded-md border p-2">
                <div className="font-mono text-2xl">{radToDeg(attitude.yaw)}°</div>
                <div className="text-xs text-muted-foreground">Yaw Rate: {radToDeg(attitude.yawspeed)}°/s</div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Loading attitude data...</div>
        )}
      </CardContent>
    </Card>
  )
}

