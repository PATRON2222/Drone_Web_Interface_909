"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Battery, Cpu, Signal } from "lucide-react"

export function TelemetryStatus() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            <span className="font-medium">Battery Status</span>
          </div>
          <Badge variant="outline">78%</Badge>
        </div>
        <Progress value={78} className="h-2" />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Voltage</span>
            <span>11.8V</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current</span>
            <span>4.2A</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Capacity Used</span>
            <span>1240mAh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time Remaining</span>
            <span>~22min</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Signal className="h-4 w-4" />
            <span className="font-medium">Communication</span>
          </div>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600"
          >
            Connected
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Signal Strength</span>
            <span>92%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Link Quality</span>
            <span>98%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data Rate</span>
            <span>57.6 kbps</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Packet Loss</span>
            <span>0.2%</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <span className="font-medium">System Health</span>
          </div>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600"
          >
            Normal
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CPU Load</span>
            <span>24%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Memory Usage</span>
            <span>32%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Temperature</span>
            <span>32°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Storage</span>
            <span>45% used</span>
          </div>
        </div>
      </div>
    </div>
  )
}

