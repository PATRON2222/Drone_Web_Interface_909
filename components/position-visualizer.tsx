"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Grid, Stars } from "@react-three/drei"
import { Suspense, useRef, useEffect, useState } from "react"
import { Vector3 } from "three"
import { Card } from "@/components/ui/card"

interface PositionData {
  x: number
  y: number
  z: number
  time: number
}

// 🛫 Simulated flight path generator
class LocalFlightPathSimulator {
  x = 0; y = 0; z = -1.5
  vx = 0.2; vy = 0.1; vz = 0
  radius = 5; angle = 0; angleIncrement = 0.05
  altitudeDirection = 0.01

  getNextPosition() {
    this.angle += this.angleIncrement
    const targetX = this.radius * Math.sin(this.angle)
    const targetY = this.radius * Math.sin(this.angle * 2) * 0.5
    this.x = this.x * 0.95 + targetX * 0.05
    this.y = this.y * 0.95 + targetY * 0.05
    this.vx = targetX - this.x
    this.vy = targetY - this.y

    if (Math.random() > 0.9) {
      this.altitudeDirection = Math.max(-0.02, Math.min(0.02, this.altitudeDirection + (Math.random() - 0.5) * 0.005))
    }
    this.z += this.altitudeDirection
    this.z = Math.min(-0.5, Math.max(-3, this.z))
    this.vz = this.altitudeDirection

    return { x: this.x, y: this.y, z: this.z, time: Date.now() }
  }
}

// 📍 Renders drone path as connected 3D points
function DroneTrail({ positions }: { positions: PositionData[] }) {
  return (
    <>
      {positions.map((pos, index) => {
        const vec = new Vector3(pos.x, pos.z, pos.y)
        return (
          <mesh key={index} position={vec}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={index === positions.length - 1 ? "red" : "#00E1FF"} />
          </mesh>
        )
      })}
    </>
  )
}

export function PositionVisualizer() {
  const [positions, setPositions] = useState<PositionData[]>([])
  const simulator = useRef(new LocalFlightPathSimulator())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/params/LOCAL_POSITION_NED.json?t=${Date.now()}`)
        if (!response.ok) throw new Error("Fallback to simulation")
        const data = await response.json()
        if (typeof data.x === "number" && typeof data.y === "number" && typeof data.z === "number") {
          setPositions((prev) => [...prev.slice(-200), { ...data, time: Date.now() }])
          return
        }
      } catch {
        const newPosition = simulator.current.getNextPosition()
        setPositions((prev) => [...prev.slice(-200), newPosition])
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-0 overflow-hidden h-[600px]">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <Suspense fallback={null}>
          <DroneTrail positions={positions} />
          <Grid
            args={[40, 40]}
            cellSize={1}
            cellThickness={0.4}
            cellColor="#6b7280"
            sectionSize={5}
            sectionThickness={1.2}
            sectionColor="#1f2937"
            fadeDistance={50}
            fadeStrength={1}
            infiniteGrid
          />
          <Stars radius={100} depth={50} count={2000} factor={4} fade />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </Card>
  )
}
