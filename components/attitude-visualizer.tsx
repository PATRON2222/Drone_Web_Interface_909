"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// Attitude simulator for realistic attitude visualization
class AttitudeSimulator {
  // Attitude data
  roll = 0
  pitch = 0
  yaw = 0

  // Flight pattern parameters
  angle = 0
  angleIncrement = 0.02 // Slower for smoother visualization

  // Update attitude with realistic changes
  update() {
    // Update the angle for a circular/figure-8 pattern
    this.angle += this.angleIncrement

    // Calculate target attitude based on a realistic flight pattern
    const targetRoll = Math.sin(this.angle) * 0.2 // gentle roll, max ~11 degrees
    const targetPitch = Math.sin(this.angle * 2) * 0.1 // gentle pitch, max ~6 degrees
    const targetYaw = this.angle % (2 * Math.PI) // continuous yaw rotation

    // Smoothly move toward the target attitude
    this.roll = this.roll * 0.95 + targetRoll * 0.05
    this.pitch = this.pitch * 0.95 + targetPitch * 0.05

    // Calculate yaw change with proper handling of the 2π boundary
    let yawDiff = targetYaw - this.yaw
    if (yawDiff > Math.PI) yawDiff -= 2 * Math.PI
    if (yawDiff < -Math.PI) yawDiff += 2 * Math.PI

    this.yaw += yawDiff * 0.05

    // Keep yaw in range [0, 2π]
    if (this.yaw > 2 * Math.PI) this.yaw -= 2 * Math.PI
    if (this.yaw < 0) this.yaw += 2 * Math.PI

    return {
      roll: this.roll,
      pitch: this.pitch,
      yaw: this.yaw,
    }
  }
}

export function AttitudeVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const aircraftRef = useRef<THREE.Group | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const simulatorRef = useRef(new AttitudeSimulator())

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.set(0, 2, 5)
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Create aircraft model
    const aircraft = createAircraft()
    scene.add(aircraft)
    aircraftRef.current = aircraft

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222)
    scene.add(gridHelper)

    // Add coordinate axes
    const axesHelper = new THREE.AxesHelper(2)
    scene.add(axesHelper)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()

      rendererRef.current.setSize(width, height)
    }

    // Initial resize
    handleResize()
    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    // Cleanup
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
      }

      window.removeEventListener("resize", handleResize)

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }

      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
    }
  }, [])

  // Function to create aircraft model
  const createAircraft = () => {
    const group = new THREE.Group()

    // Create body
    const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.5, 2, 8)
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x00e1ff, flatShading: true })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.rotation.x = Math.PI / 2
    group.add(body)

    // Create wings
    const wingGeometry = new THREE.BoxGeometry(3, 0.1, 0.5)
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x0077aa, flatShading: true })
    const wing = new THREE.Mesh(wingGeometry, wingMaterial)
    wing.position.y = 0.1
    group.add(wing)

    // Create tail
    const tailGeometry = new THREE.BoxGeometry(1, 0.1, 0.5)
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x0077aa, flatShading: true })
    const tail = new THREE.Mesh(tailGeometry, tailMaterial)
    tail.position.z = -0.9
    tail.position.y = 0.1
    group.add(tail)

    // Create vertical stabilizer
    const vStabGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.5)
    const vStabMaterial = new THREE.MeshPhongMaterial({ color: 0x0077aa, flatShading: true })
    const vStab = new THREE.Mesh(vStabGeometry, vStabMaterial)
    vStab.position.z = -0.9
    vStab.position.y = 0.3
    group.add(vStab)

    return group
  }

  // Function to update aircraft attitude
  const updateAttitude = (roll: number, pitch: number, yaw: number) => {
    if (!aircraftRef.current) return

    // Reset rotation
    aircraftRef.current.rotation.set(0, 0, 0)

    // Apply rotations in the correct order: yaw, pitch, roll
    aircraftRef.current.rotateY(yaw)
    aircraftRef.current.rotateX(pitch)
    aircraftRef.current.rotateZ(roll)
  }

  // Fetch attitude data or use simulator
  useEffect(() => {
    const fetchAttitudeData = async () => {
      try {
        const response = await fetch(`/params/ATTITUDE.json?t=${Date.now()}`)
        if (!response.ok) {
          // Generate realistic simulated data if fetch fails
          const simulatedAttitude = simulatorRef.current.update()
          updateAttitude(simulatedAttitude.roll, simulatedAttitude.pitch, simulatedAttitude.yaw)
          return
        }

        const data = await response.json()
        if (data && typeof data.roll === "number" && typeof data.pitch === "number" && typeof data.yaw === "number") {
          updateAttitude(data.roll, data.pitch, data.yaw)
        }
      } catch (error) {
        console.error("Error fetching attitude data:", error)
        // Generate realistic simulated data if fetch fails
        const simulatedAttitude = simulatorRef.current.update()
        updateAttitude(simulatedAttitude.roll, simulatedAttitude.pitch, simulatedAttitude.yaw)
      }
    }

    // Initial fetch
    fetchAttitudeData()

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchAttitudeData, 100)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  return <div ref={containerRef} className="w-full h-full rounded-lg bg-black/10" />
}

