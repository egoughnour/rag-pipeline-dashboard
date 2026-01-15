import { Activity } from '@/types'
import {
  GitBranch,
  FileText,
  Play,
  Square,
  Search,
  AlertCircle,
} from 'lucide-react'

interface ActivityFeedProps {
  activities: Activity[]
}

const activityIcons: Record<Activity['type'], typeof GitBranch> = {
  pipeline_created: GitBranch,
  pipeline_started: Play,
  pipeline_stopped: Square,
  document_uploaded: FileText,
  document_processed: FileText,
  search_query: Search,
  error: AlertCircle,
}

const activityColors: Record<Activity['type'], string> = {
  pipeline_created: 'bg-blue-100 text-blue-600',
  pipeline_started: 'bg-green-100 text-green-600',
  pipeline_stopped: 'bg-gray-100 text-gray-600',
  document_uploaded: 'bg-purple-100 text-purple-600',
  document_processed: 'bg-green-100 text-green-600',
  search_query: 'bg-orange-100 text-orange-600',
  error: 'bg-red-100 text-red-600',
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type]
          const colorClass = activityColors[activity.type]

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
