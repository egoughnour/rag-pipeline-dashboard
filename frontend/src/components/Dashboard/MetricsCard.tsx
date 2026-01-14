import { LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  iconColor?: string
}

export default function MetricsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-primary-500',
}: MetricsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <p
              className={`text-sm mt-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
