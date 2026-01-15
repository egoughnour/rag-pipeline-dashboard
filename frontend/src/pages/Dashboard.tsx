import { useQuery } from '@tanstack/react-query'
import { FileText, GitBranch, Clock, AlertCircle } from 'lucide-react'
import MetricsCard from '@/components/Dashboard/MetricsCard'
import ActivityFeed from '@/components/Dashboard/ActivityFeed'
import PipelineStatus from '@/components/Dashboard/PipelineStatus'
import ProcessingChart from '@/components/Dashboard/ProcessingChart'
import { fetchDashboardStats, fetchRecentActivity, fetchPipelines } from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function Dashboard() {
  useWebSocket()

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: () => fetchRecentActivity(),
  })

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelines'],
    queryFn: fetchPipelines,
  })

  // Mock chart data for now
  const chartData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    value: Math.floor(Math.random() * 100) + 50,
  }))

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Monitor your RAG pipeline performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Pipelines"
          value={metrics?.totalPipelines ?? 0}
          icon={GitBranch}
          iconColor="text-blue-500"
        />
        <MetricsCard
          title="Documents Today"
          value={metrics?.documentsProcessedToday ?? 0}
          icon={FileText}
          iconColor="text-green-500"
        />
        <MetricsCard
          title="Avg Processing Time"
          value={`${Math.round(metrics?.avgProcessingTime ?? 0)}ms`}
          icon={Clock}
          iconColor="text-purple-500"
        />
        <MetricsCard
          title="Total Chunks"
          value={metrics?.totalChunks ?? 0}
          icon={AlertCircle}
          iconColor="text-indigo-500"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProcessingChart
            data={chartData}
            title="Documents Processed (24h)"
            color="#10b981"
            yAxisLabel="Documents"
          />
        </div>
        <ActivityFeed activities={activity} />
      </div>

      {/* Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineStatus pipelines={pipelines} />
        <ProcessingChart
          data={chartData.map((d) => ({ ...d, value: Math.random() * 200 + 50 }))}
          title="Average Latency (24h)"
          color="#8b5cf6"
          yAxisLabel="ms"
        />
      </div>
    </div>
  )
}
