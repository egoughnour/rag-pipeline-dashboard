import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Upload, Settings } from 'lucide-react'
import { usePipeline, usePipelineMetrics, useStartPipeline, useStopPipeline } from '@/hooks/usePipelines'
import { useDocuments } from '@/hooks/useDocuments'
import { useWebSocket } from '@/hooks/useWebSocket'
import ProcessingChart from '@/components/Dashboard/ProcessingChart'
import DocumentList from '@/components/Documents/DocumentList'
import { useEffect } from 'react'

export default function PipelineDetail() {
  const { id } = useParams<{ id: string }>()
  const { subscribeToPipeline } = useWebSocket()
  const { data: pipeline, isLoading } = usePipeline(id!)
  const { data: metrics } = usePipelineMetrics(id!)
  const { data: documents = [] } = useDocuments(id)
  const startPipeline = useStartPipeline()
  const stopPipeline = useStopPipeline()

  useEffect(() => {
    if (id) {
      return subscribeToPipeline(id)
    }
  }, [id, subscribeToPipeline])

  if (isLoading || !pipeline) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/pipelines"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {pipeline.name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[pipeline.status]
                }`}
              >
                {pipeline.status}
              </span>
            </div>
            {pipeline.description && (
              <p className="text-gray-500 mt-1">{pipeline.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pipeline.status === 'active' ? (
            <button
              onClick={() => stopPipeline.mutate(pipeline.id)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              <Pause className="h-4 w-4" />
              Pause
            </button>
          ) : (
            <button
              onClick={() => startPipeline.mutate(pipeline.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Play className="h-4 w-4" />
              Start
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Config Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Chunk Size</p>
            <p className="text-lg font-medium text-gray-900">
              {pipeline.config.chunkSize}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Chunk Overlap</p>
            <p className="text-lg font-medium text-gray-900">
              {pipeline.config.chunkOverlap}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Embedding Model</p>
            <p className="text-lg font-medium text-gray-900">
              {pipeline.config.embeddingModel}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Source Type</p>
            <p className="text-lg font-medium text-gray-900 capitalize">
              {pipeline.config.sourceType}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Charts */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProcessingChart
            data={metrics.documentsProcessed}
            title="Documents Processed"
            color="#10b981"
            yAxisLabel="Documents"
          />
          <ProcessingChart
            data={metrics.avgLatency}
            title="Average Latency"
            color="#8b5cf6"
            yAxisLabel="ms"
          />
        </div>
      )}

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Documents ({documents.length})
          </h3>
          <Link
            to={`/documents?pipeline=${pipeline.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Link>
        </div>
        <DocumentList documents={documents.slice(0, 10)} />
        {documents.length > 10 && (
          <div className="mt-4 text-center">
            <Link
              to={`/documents?pipeline=${pipeline.id}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all {documents.length} documents
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
