'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface PositionData {
  x: number
  y: number
  z: number
  time: number
}

interface Props {
  positions: PositionData[]
}

export default function ColoredGridWithSprites({ positions }: Props) {
  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#111827"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid
      />
      <Positions points={positions} />
    </Canvas>
  )
}

function Positions({ points }: { points: PositionData[] }) {
  return (
    <>
      {points.map((pos, index) => (
        <mesh key={index} position={[pos.x, pos.z, pos.y]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={index === points.length - 1 ? 'red' : 'deepskyblue'} />
        </mesh>
      ))}
    </>
  )
}
