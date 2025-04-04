"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUp, Battery, Gauge, Thermometer } from "lucide-react"
import { ParameterCard } from "@/components/parameter-card"
import { AttitudeVisualizer } from "@/components/attitude-visualizer"

// Define the parameter types we're interested in
const PARAM_TYPES = [
  "LOCAL_POSITION_NED",
  "ATTITUDE",
  "AHRS",
  "AHRS2",
  "BATTERY_STATUS",
  "HEARTBEAT",
  "DISTANCE_SENSOR",
  "GLOBAL_POSITION_INT",
  "RANGEFINDER",
  "RAW_IMU",
  "SCALED_IMU2",
]

// Flight data simulator for realistic values
class FlightDataSimulator {
  // Position data
  x = 0
  y = 0
  z = -1.5 // Starting at 1.5m altitude (NED frame, so negative)
  vx = 0.2
  vy = 0.1
  vz = 0

  // Attitude data
  roll = 0
  pitch = 0
  yaw = 0
  rollSpeed = 0
  pitchSpeed = 0
  yawSpeed = 0

  // Global position
  lat = 47123456
  lon = 8123456
  alt = 100000
  relativeAlt = 1500 // 1.5m in mm

  // Battery data
  batteryRemaining = 78
  voltage = 11800 // 11.8V in mV

  // Flight pattern parameters
  radius = 5 // Radius of the pattern in meters
  angle = 0 // Current angle in the pattern
  angleIncrement = 0.05 // How fast we move around the pattern
  altitudeDirection = 0.01 // Small altitude change

  // Update all flight data with realistic changes
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

    // Update attitude based on movement
    // Roll is related to y-axis acceleration (turning)
    const targetRoll = this.vy * 0.5
    this.roll = this.roll * 0.9 + targetRoll * 0.1
    this.rollSpeed = targetRoll - this.roll

    // Pitch is related to x-axis acceleration (forward/backward)
    const targetPitch = -this.vx * 0.3
    this.pitch = this.pitch * 0.9 + targetPitch * 0.1
    this.pitchSpeed = targetPitch - this.pitch

    // Yaw changes based on the direction of movement
    const targetYaw = Math.atan2(this.vy, this.vx)

    // Ensure smooth yaw transitions (avoid jumps between -π and π)
    let yawDiff = targetYaw - this.yaw
    if (yawDiff > Math.PI) yawDiff -= 2 * Math.PI
    if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI

    this.yawSpeed = yawDiff * 0.1
    this.yaw += this.yawSpeed

    // Keep yaw in range [-π, π]
    if (this.yaw > Math.PI) this.yaw -= 2 * Math.PI
    if (this.yaw < -Math.PI) this.yaw += 2 * Math.PI

    // Update global position
    this.lat += Math.floor(this.vy * 10)
    this.lon += Math.floor(this.vx * 10)
    this.relativeAlt = Math.floor(-this.z * 1000) // Convert to mm
    this.alt = 100000 + this.relativeAlt

    // Slowly decrease battery
    if (Math.random() > 0.95) {
      this.batteryRemaining = Math.max(0, this.batteryRemaining - 0.1)
      this.voltage = Math.max(10000, this.voltage - 1)
    }

    return {
      localPosition: {
        x: this.x,
        y: this.y,
        z: this.z,
        vx: this.vx,
        vy: this.vy,
        vz: this.vz,
      },
      attitude: {
        roll: this.roll,
        pitch: this.pitch,
        yaw: this.yaw,
        rollspeed: this.rollSpeed,
        pitchspeed: this.pitchSpeed,
        yawspeed: this.yawSpeed,
      },
      globalPosition: {
        lat: this.lat,
        lon: this.lon,
        alt: this.alt,
        relative_alt: this.relativeAlt,
        vx: Math.floor(this.vx * 100), // cm/s
        vy: Math.floor(this.vy * 100), // cm/s
        vz: Math.floor(this.vz * 100), // cm/s
        hdg: Math.floor(((this.yaw + Math.PI) * 180) / Math.PI) % 360, // heading in degrees
      },
      battery: {
        battery_remaining: Math.floor(this.batteryRemaining),
        voltages: [this.voltage],
      },
    }
  }
}

export function TelemetryOverview() {
  const [localPosition, setLocalPosition] = useState<any>(null)
  const [attitude, setAttitude] = useState<any>(null)
  const [battery, setBattery] = useState<any>(null)
  const [globalPosition, setGlobalPosition] = useState<any>(null)
  const flightSimulator = useRef(new FlightDataSimulator())

  useEffect(() => {
    // Function to fetch parameter data or generate realistic simulated data
    const fetchParameterData = async () => {
      try {
        // Try to fetch real data first
        let useSimulatedData = false

        // Fetch LOCAL_POSITION_NED
        const localPositionRes = await fetch(`/params/LOCAL_POSITION_NED.json?t=${Date.now()}`)
        if (!localPositionRes.ok) {
          useSimulatedData = true
        } else {
          const localPositionData = await localPositionRes.json()
          setLocalPosition(localPositionData)
        }

        // Fetch ATTITUDE
        const attitudeRes = await fetch(`/params/ATTITUDE.json?t=${Date.now()}`)
        if (!attitudeRes.ok) {
          useSimulatedData = true
        } else {
          const attitudeData = await attitudeRes.json()
          setAttitude(attitudeData)
        }

        // Fetch BATTERY_STATUS
        const batteryRes = await fetch(`/params/BATTERY_STATUS.json?t=${Date.now()}`)
        if (!batteryRes.ok) {
          useSimulatedData = true
        } else {
          const batteryData = await batteryRes.json()
          setBattery(batteryData)
        }

        // Fetch GLOBAL_POSITION_INT
        const globalPositionRes = await fetch(`/params/GLOBAL_POSITION_INT.json?t=${Date.now()}`)
        if (!globalPositionRes.ok) {
          useSimulatedData = true
        } else {
          const globalPositionData = await globalPositionRes.json()
          setGlobalPosition(globalPositionData)
        }

        // If any fetch failed, use simulated data
        if (useSimulatedData) {
          const simulatedData = flightSimulator.current.update()
          setLocalPosition(simulatedData.localPosition)
          setAttitude(simulatedData.attitude)
          setBattery(simulatedData.battery)
          setGlobalPosition(simulatedData.globalPosition)
        }
      } catch (error) {
        console.error("Error fetching parameter data:", error)
        // Generate realistic simulated data if fetch fails
        const simulatedData = flightSimulator.current.update()
        setLocalPosition(simulatedData.localPosition)
        setAttitude(simulatedData.attitude)
        setBattery(simulatedData.battery)
        setGlobalPosition(simulatedData.globalPosition)
      }
    }

    // Initial fetch
    fetchParameterData()

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchParameterData, 1000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="attitude">Attitude</TabsTrigger>
        <TabsTrigger value="parameters">Parameters</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Altitude</CardTitle>
              <ArrowUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalPosition ? (-globalPosition.relative_alt / 1000).toFixed(2) + " m" : "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">Relative to home</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ground Speed</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {globalPosition
                  ? (Math.sqrt(Math.pow(globalPosition.vx, 2) + Math.pow(globalPosition.vy, 2)) / 100).toFixed(2) +
                    " m/s"
                  : "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">
                {globalPosition
                  ? ((Math.sqrt(Math.pow(globalPosition.vx, 2) + Math.pow(globalPosition.vy, 2)) / 100) * 3.6).toFixed(
                      2,
                    ) + " km/h"
                  : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battery</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{battery ? battery.battery_remaining + "%" : "Loading..."}</div>
              <p className="text-xs text-muted-foreground">
                {battery ? (battery.voltages[0] / 1000).toFixed(1) + "V" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attitude</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attitude ? (attitude.roll * (180 / Math.PI)).toFixed(1) + "°" : "Loading..."}
              </div>
              <p className="text-xs text-muted-foreground">
                {attitude
                  ? "P: " +
                    (attitude.pitch * (180 / Math.PI)).toFixed(1) +
                    "° Y: " +
                    (attitude.yaw * (180 / Math.PI)).toFixed(1) +
                    "°"
                  : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>3D Attitude Visualization</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <AttitudeVisualizer />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Position Data</CardTitle>
              <CardDescription>LOCAL_POSITION_NED</CardDescription>
            </CardHeader>
            <CardContent>
              {localPosition ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">X Position</div>
                      <div className="font-mono text-sm">{localPosition.x.toFixed(2)} m</div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">Y Position</div>
                      <div className="font-mono text-sm">{localPosition.y.toFixed(2)} m</div>
                    </div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">Z Position (Altitude)</div>
                    <div className="font-mono text-sm">{localPosition.z.toFixed(2)} m</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">X Velocity</div>
                      <div className="font-mono text-sm">{localPosition.vx.toFixed(2)} m/s</div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">Y Velocity</div>
                      <div className="font-mono text-sm">{localPosition.vy.toFixed(2)} m/s</div>
                    </div>
                    <div className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">Z Velocity</div>
                      <div className="font-mono text-sm">{localPosition.vz.toFixed(2)} m/s</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Loading position data...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="attitude">
        <Card>
          <CardHeader>
            <CardTitle>Attitude Visualization</CardTitle>
            <CardDescription>Real-time 3D visualization of aircraft attitude</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <AttitudeVisualizer />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="parameters">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PARAM_TYPES.map((paramType) => (
            <ParameterCard key={paramType} paramType={paramType} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

