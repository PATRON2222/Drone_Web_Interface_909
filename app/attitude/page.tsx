import { DashboardHeader } from "@/components/dashboard-header"
import { AttitudeVisualizer } from "@/components/attitude-visualizer"
import { AttitudeData } from "@/components/attitude-data"

export default function AttitudePage() {
  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <DashboardHeader
        title="3D Attitude Visualization"
        description="Real-time 3D visualization of aircraft attitude (roll, pitch, yaw)"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        <div className="lg:col-span-2 h-[500px]">
          <AttitudeVisualizer />
        </div>
        <div>
          <AttitudeData />
        </div>
      </div>

      {/* ✅ Footer at the bottom */}
      <footer className="text-center text-sm text-muted-foreground mt-8">
        Made with ❤️ by <span className="font-semibold text-blue-500">Arnav Angarkar</span>
      </footer>
    </div>
  )
}
