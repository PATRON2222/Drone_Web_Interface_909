import { DashboardHeader } from "@/components/dashboard-header"
import { ParametersList } from "@/components/parameters-list"
import { PositionVisualizer } from "@/components/position-visualiser" // ✅ Add this import

export default function ParametersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        title="MAVLink Parameters"
        description="Real-time telemetry parameters from the aircraft"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ParametersList />
        <PositionVisualizer /> {/* ✅ Add this here */}
      </div>
    </div>
  )
}
