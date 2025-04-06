"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Grid, Sparkles } from "@react-three/drei"
import { Suspense, useRef, useEffect, useState, memo } from "react"
import { Vector3, Color } from "three"

interface PositionData {
  x: number
  y: number
  z: number
  time: number
}

class LocalFlightPathSimulator {
  x = 0; y = 0; z = -1.5
  radius = 5; angle = 0; angleIncrement = 0.05
  altitudeDirection = 0.01

  getNextPosition() {
    this.angle += this.angleIncrement
    const targetX = this.radius * Math.sin(this.angle)
    const targetY = this.radius * Math.cos(this.angle)
    this.x = this.x * 0.95 + targetX * 0.05
    this.y = this.y * 0.95 + targetY * 0.05
    if (Math.random() > 0.9) {
      this.altitudeDirection += (Math.random() - 0.5) * 0.01
    }
    this.z += this.altitudeDirection
    this.z = Math.min(-0.5, Math.max(-3, this.z))
    return { x: this.x, y: this.y, z: this.z, time: Date.now() }
  }
}

const DronePath = memo(({ positions }: { positions: PositionData[] }) => {
  return (
    <>
      {positions.map((pos, i) => {
        const vec = new Vector3(pos.x, pos.z, pos.y)
        const opacity = i / positions.length
        return (
          <mesh key={i} position={vec}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#ffff00" transparent opacity={opacity} />
          </mesh>
        )
      })}
    </>
  )
})

const LiveDronePoint = ({ position }: { position: Vector3 }) => {
  const ref = useRef<any>(null)

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01
      ref.current.scale.setScalar(1 + 0.1 * Math.sin(Date.now() * 0.003))
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={"#f43f5e"}
        emissive={"#f43f5e"}
        emissiveIntensity={1}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  )
}

export function PositionVisualizer() {
  const [positions, setPositions] = useState<PositionData[]>([])
  const simulator = useRef(new LocalFlightPathSimulator())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/params/LOCAL_POSITION_NED.json?t=${Date.now()}`)
        if (!response.ok) throw new Error("Fallback")
        const data = await response.json()
        if (data && typeof data.x === "number") {
          setPositions((prev) => [...prev.slice(-150), { ...data, time: Date.now() }])
          return
        }
      } catch {
        const simData = simulator.current.getNextPosition()
        setPositions((prev) => [...prev.slice(-150), simData])
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 500)
    return () => clearInterval(interval)
  }, [])

  const currentPos = positions.length > 0
    ? new Vector3(positions.at(-1)!.x, positions.at(-1)!.z, positions.at(-1)!.y)
    : new Vector3(0, 0, 0)

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border shadow-lg bg-black">
      <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        <Suspense fallback={null}>
          <Grid args={[30, 30]} cellSize={1} fadeDistance={30} cellColor="#374151" />
          <Sparkles count={15} scale={10} speed={0.4} size={2} color={"#38bdf8"} />
          <DronePath positions={positions} />
          <LiveDronePoint position={currentPos} />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
