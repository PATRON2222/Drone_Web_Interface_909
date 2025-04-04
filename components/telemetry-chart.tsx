"use client"

import { useEffect, useState, useRef } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Sample data - with realistic drone altitude pattern
const generateInitialData = () => {
  const data = []
  const now = new Date()

  // Start with a base altitude and create a realistic pattern
  let altitude = 1.5 // Starting at 1.5m
  let altitudeDirection = 0.01 // Small increment
  let airspeed = 5.2 // Starting airspeed

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 1000)

    // Add some small realistic variations to altitude
    altitude += altitudeDirection

    // Occasionally change direction slightly
    if (Math.random() > 0.8) {
      altitudeDirection = Math.max(-0.03, Math.min(0.03, altitudeDirection + (Math.random() - 0.5) * 0.01))
    }

    // Keep altitude within realistic bounds for a low-flying drone (0.5m to 3m)
    altitude = Math.max(0.5, Math.min(3, altitude))

    // Airspeed changes slightly
    airspeed = Math.max(4.8, Math.min(5.5, airspeed + (Math.random() - 0.5) * 0.1))

    data.push({
      time: time.toISOString().substr(11, 8),
      altitude: altitude,
      airspeed: airspeed,
    })
  }

  return data
}

export function TelemetryChart() {
  const [data, setData] = useState(generateInitialData())
  const lastAltitude = useRef(data[data.length - 1]?.altitude || 1.5)
  const altitudeDirection = useRef(0.01)
  const lastAirspeed = useRef(data[data.length - 1]?.airspeed || 5.2)

  // Simulate real-time data updates with realistic changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = [...data.slice(1)]
      const now = new Date()

      // Update altitude with realistic small changes
      let altitude = lastAltitude.current

      // Occasionally change direction slightly
      if (Math.random() > 0.8) {
        altitudeDirection.current = Math.max(
          -0.03,
          Math.min(0.03, altitudeDirection.current + (Math.random() - 0.5) * 0.01),
        )
      }

      altitude += altitudeDirection.current

      // Keep altitude within realistic bounds
      altitude = Math.max(0.5, Math.min(3, altitude))
      lastAltitude.current = altitude

      // Update airspeed with small realistic changes
      let airspeed = lastAirspeed.current + (Math.random() - 0.5) * 0.1
      airspeed = Math.max(4.8, Math.min(5.5, airspeed))
      lastAirspeed.current = airspeed

      newData.push({
        time: now.toISOString().substr(11, 8),
        altitude: altitude,
        airspeed: airspeed,
      })

      setData(newData)
    }, 1000)

    return () => clearInterval(interval)
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}m`}
          domain={[0, 3.5]} // Fixed domain for altitude
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}m/s`}
          domain={[0, 10]} // Fixed domain for airspeed
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Altitude</span>
                      <span className="font-bold text-primary">{payload[0].value.toFixed(2)}m</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Airspeed</span>
                      <span className="font-bold text-primary">{payload[1].value.toFixed(2)}m/s</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line yAxisId="left" type="monotone" dataKey="altitude" stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="airspeed" stroke="#16a34a" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

