import { DashboardHeader } from "@/components/dashboard-header"
import { ParametersList } from "@/components/parameters-list"

export default function ParametersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader title="MAVLink Parameters" description="Real-time telemetry parameters from the aircraft" />
      <ParametersList />
    </div>
  )
}

