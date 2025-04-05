import { DashboardHeader } from "@/components/dashboard-header"
import { ParametersList } from "@/components/parameters-list"

export default function ParametersPage() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background p-6">
      <DashboardHeader
        title="MAVLink Parameters"
        description="Real-time telemetry parameters from the aircraft"
      />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        <ParametersList />
      </div>
    </div>
  )
}
