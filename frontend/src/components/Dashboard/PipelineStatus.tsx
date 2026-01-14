import { Link } from 'react-router-dom'
import { Pipeline } from '@/types'
import { Play, Pause, AlertCircle, ChevronRight } from 'lucide-react'

interface PipelineStatusProps {
  pipelines: Pipeline[]
}

const statusConfig = {
  active: {
    icon: Play,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Active',
  },
  paused: {
    icon: Pause,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    label: 'Paused',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Error',
  },
}

export default function PipelineStatus({ pipelines }: PipelineStatusProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Status</h3>
        <Link
          to="/pipelines"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all
        </Link>
      </div>

      {pipelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>No pipelines configured</p>
          <Link
            to="/pipelines"
            className="mt-2 text-sm text-primary-600 hover:text-primary-700"
          >
            Create your first pipeline
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pipelines.slice(0, 5).map((pipeline) => {
            const config = statusConfig[pipeline.status]
            const StatusIcon = config.icon

            return (
              <Link
                key={pipeline.id}
                to={`/pipelines/${pipeline.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pipeline.name}</p>
                    <p className="text-sm text-gray-500">
                      {pipeline.documentCount ?? 0} documents
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
