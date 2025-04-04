import { DashboardHeader } from "@/components/dashboard-header"
import { TelemetryOverview } from "@/components/telemetry-overview"

export default function Home() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        title="MAVLink Telemetry Dashboard"
        description="Real-time flight data monitoring and visualization"
      />
      <TelemetryOverview />
    </div>
  )
}

