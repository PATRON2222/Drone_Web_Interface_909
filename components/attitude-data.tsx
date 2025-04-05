"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Compass, ArrowUp, RotateCw } from "lucide-react"

export function AttitudeData() {
  const [attitude, setAttitude] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttitudeData = async () => {
      try {
        console.log("Fetching attitude data...") // Debugging log
        const response = await fetch(`/params/ATTITUDE.json?t=${Date.now()}`)
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`)
        const data = await response.json()
        console.log("Fetched data:", data) // Debugging log
        setAttitude(data)
        setError(null) // Reset error if fetch is successful
      } catch (err: any) {
        console.error("Error fetching attitude data:", err)
        setError(err.message)
      }
    }

    fetchAttitudeData()
    const intervalId = setInterval(fetchAttitudeData, 500) // Refresh every 0.5s

    return () => clearInterval(intervalId)
  }, [])

  const radToDeg = (rad: number) => ((rad * 180) / Math.PI).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attitude Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <p className="text-sm text-red-500">Error: {error}</p>
        ) : attitude ? (
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
          <p className="text-sm text-muted-foreground">Loading attitude data...</p>
        )}
      </CardContent>
    </Card>
  )
}
