import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Play, Pause, Trash2, MoreVertical, AlertCircle } from 'lucide-react'
import { usePipelines, useStartPipeline, useStopPipeline, useDeletePipeline } from '@/hooks/usePipelines'
import PipelineForm from '@/components/Pipelines/PipelineForm'

export default function Pipelines() {
  const [showForm, setShowForm] = useState(false)
  const { data: pipelines = [], isLoading } = usePipelines()
  const startPipeline = useStartPipeline()
  const stopPipeline = useStopPipeline()
  const deletePipeline = useDeletePipeline()

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="text-gray-500 mt-1">Manage your RAG pipelines</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Pipeline
        </button>
      </div>

      {pipelines.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pipelines yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first pipeline to start indexing documents
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Pipeline
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pipelines.map((pipeline) => (
                <tr key={pipeline.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/pipelines/${pipeline.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {pipeline.name}
                    </Link>
                    {pipeline.description && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {pipeline.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[pipeline.status]
                      }`}
                    >
                      {pipeline.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pipeline.documentCount ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pipeline.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {pipeline.status === 'active' ? (
                        <button
                          onClick={() => stopPipeline.mutate(pipeline.id)}
                          className="p-1 text-gray-400 hover:text-yellow-600"
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => startPipeline.mutate(pipeline.id)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Start"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this pipeline?')) {
                            deletePipeline.mutate(pipeline.id)
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/pipelines/${pipeline.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <PipelineForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
