import { DashboardHeader } from "@/components/dashboard-header"
import { AttitudeVisualizer } from "@/components/attitude-visualizer"
import { AttitudeData } from "@/components/attitude-data"

export default function AttitudePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        title="3D Attitude Visualization"
        description="Real-time 3D visualization of aircraft attitude (roll, pitch, yaw)"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttitudeVisualizer />
        </div>
        <div>
          <AttitudeData />
        </div>
      </div>
    </div>
  )
}

