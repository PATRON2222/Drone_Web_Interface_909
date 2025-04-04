"use client"

import { useRef } from "react"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

// Flight data simulator for realistic parameter values
class ParameterDataSimulator {
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
  current = 4200 // 4.2A in mA

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
      this.current = 4200 + Math.floor(Math.random() * 200 - 100)
    }
  }

  // Get parameter data based on type
  getParameterData(paramType: string) {
    this.update()

    switch (paramType) {
      case "LOCAL_POSITION_NED":
        return {
          x: this.x,
          y: this.y,
          z: this.z,
          vx: this.vx,
          vy: this.vy,
          vz: this.vz,
          mavpackettype: "LOCAL_POSITION_NED",
        }

      case "GLOBAL_POSITION_INT":
        return {
          lat: this.lat,
          lon: this.lon,
          alt: this.alt,
          relative_alt: this.relativeAlt,
          vx: Math.floor(this.vx * 100), // cm/s
          vy: Math.floor(this.vy * 100), // cm/s
          vz: Math.floor(this.vz * 100), // cm/s
          hdg: Math.floor(((this.yaw + Math.PI) * 180) / Math.PI) % 360, // heading in degrees
          mavpackettype: "GLOBAL_POSITION_INT",
        }

      case "ATTITUDE":
        return {
          roll: this.roll,
          pitch: this.pitch,
          yaw: this.yaw,
          rollspeed: this.rollSpeed,
          pitchspeed: this.pitchSpeed,
          yawspeed: this.yawSpeed,
          mavpackettype: "ATTITUDE",
        }

      case "BATTERY_STATUS":
        return {
          battery_remaining: Math.floor(this.batteryRemaining),
          voltages: [this.voltage],
          current_battery: this.current,
          mavpackettype: "BATTERY_STATUS",
        }

      case "HEARTBEAT":
        return {
          type: 2, // MAV_TYPE_QUADROTOR
          autopilot: 3, // MAV_AUTOPILOT_ARDUPILOTMEGA
          base_mode: 89, // armed, manual input enabled
          custom_mode: 0,
          system_status: 4, // MAV_STATE_ACTIVE
          mavlink_version: 3,
          mavpackettype: "HEARTBEAT",
        }

      case "AHRS":
        return {
          omegaIx: 0.0001 + Math.random() * 0.0002,
          omegaIy: 0.0001 + Math.random() * 0.0002,
          omegaIz: 0.0001 + Math.random() * 0.0002,
          accel_weight: 0.0,
          renorm_val: 0.0,
          error_rp: 0.0012 + Math.random() * 0.0005,
          error_yaw: 0.0015 + Math.random() * 0.0005,
          mavpackettype: "AHRS",
        }

      case "AHRS2":
        return {
          roll: this.roll,
          pitch: this.pitch,
          yaw: this.yaw,
          altitude: -this.z, // Convert to positive altitude
          lat: this.lat,
          lng: this.lon,
          mavpackettype: "AHRS2",
        }

      case "DISTANCE_SENSOR":
        return {
          id: 0,
          orientation: 0, // downward facing
          min_distance: 20, // 20cm
          max_distance: 700, // 7m
          current_distance: Math.floor(-this.z * 100), // cm
          type: 0, // RADAR
          mavpackettype: "DISTANCE_SENSOR",
        }

      case "RANGEFINDER":
        return {
          distance: -this.z, // Convert to positive altitude
          voltage: 3.3 * (-this.z / 10), // simulated voltage based on distance
          mavpackettype: "RANGEFINDER",
        }

      case "RAW_IMU":
        return {
          time_usec: Date.now() * 1000,
          xacc: Math.floor(this.vx * 100) + Math.floor(Math.random() * 10 - 5),
          yacc: Math.floor(this.vy * 100) + Math.floor(Math.random() * 10 - 5),
          zacc: Math.floor(9.81 * 100) + Math.floor(Math.random() * 10 - 5), // ~9.81 m/s² gravity
          xgyro: Math.floor(this.rollSpeed * 100) + Math.floor(Math.random() * 10 - 5),
          ygyro: Math.floor(this.pitchSpeed * 100) + Math.floor(Math.random() * 10 - 5),
          zgyro: Math.floor(this.yawSpeed * 100) + Math.floor(Math.random() * 10 - 5),
          xmag: 100 + Math.floor(Math.random() * 10 - 5),
          ymag: 100 + Math.floor(Math.random() * 10 - 5),
          zmag: 100 + Math.floor(Math.random() * 10 - 5),
          mavpackettype: "RAW_IMU",
        }

      case "SCALED_IMU2":
        return {
          time_boot_ms: Date.now() % 1000000,
          xacc: Math.floor(this.vx * 1000) + Math.floor(Math.random() * 10 - 5),
          yacc: Math.floor(this.vy * 1000) + Math.floor(Math.random() * 10 - 5),
          zacc: Math.floor(9.81 * 1000) + Math.floor(Math.random() * 10 - 5), // ~9.81 m/s² gravity
          xgyro: Math.floor(this.rollSpeed * 1000) + Math.floor(Math.random() * 10 - 5),
          ygyro: Math.floor(this.pitchSpeed * 1000) + Math.floor(Math.random() * 10 - 5),
          zgyro: Math.floor(this.yawSpeed * 1000) + Math.floor(Math.random() * 10 - 5),
          xmag: 100 + Math.floor(Math.random() * 10 - 5),
          ymag: 100 + Math.floor(Math.random() * 10 - 5),
          zmag: 100 + Math.floor(Math.random() * 10 - 5),
          mavpackettype: "SCALED_IMU2",
        }

      default:
        return {
          mavpackettype: paramType,
          value1: Math.random() * 10,
          value2: Math.random() * 100,
          value3: Math.random() * 1000,
          height: -this.z, // Convert to positive altitude
          altitude: -this.z, // Convert to positive altitude
        }
    }
  }
}

export function ParametersList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [paramData, setParamData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const simulator = useRef(new ParameterDataSimulator())

  useEffect(() => {
    const fetchAllParameters = async () => {
      setLoading(true)
      const data: Record<string, any> = {}

      // Fetch all parameters in parallel
      await Promise.all(
        PARAM_TYPES.map(async (paramType) => {
          try {
            const response = await fetch(`/params/${paramType}.json?t=${Date.now()}`)
            if (response.ok) {
              const paramData = await response.json()
              data[paramType] = paramData
            } else {
              // Generate mock data if fetch fails
              data[paramType] = simulator.current.getParameterData(paramType)
            }
          } catch (error) {
            console.error(`Error fetching ${paramType}:`, error)
            // Generate mock data if fetch fails
            data[paramType] = simulator.current.getParameterData(paramType)
          }
        }),
      )

      setParamData(data)
      setLoading(false)
    }

    // Initial fetch
    fetchAllParameters()

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchAllParameters, 2000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  // Filter parameters based on search query - fixed to properly filter by parameter type
  const filteredParams = Object.entries(paramData).filter(([paramType]) =>
    paramType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parameters..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && Object.keys(paramData).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Loading parameters...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredParams.map(([paramType, data]) => (
            <Card key={paramType}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{paramType}</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="param-table">
                  <tbody>
                    {Object.entries(data)
                      .filter(([key]) => key !== "mavpackettype")
                      .map(([key, value]) => (
                        <tr key={key}>
                          <th>{key}</th>
                          <td>
                            {typeof value === "number"
                              ? Number.isInteger(value)
                                ? value
                                : Number.parseFloat(value.toFixed(4))
                              : Array.isArray(value)
                                ? value.join(", ")
                                : String(value)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

