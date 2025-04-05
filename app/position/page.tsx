import { DashboardHeader } from "@/components/dashboard-header"
import { PositionVisualizer } from "@/components/position-visualizer"
import { PositionData } from "@/components/position-data"

export default function PositionPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        title="Position Tracking"
        description="Real-time position and trajectory visualization"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px]"> {/* 👈 Ensures space for 3D Canvas */}
          <PositionVisualizer />
        </div>
        <div>
          <PositionData />
        </div>
      </div>
    </div>
  )
}
