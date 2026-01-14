import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Upload, Filter, AlertCircle } from 'lucide-react'
import { useDocuments, useUploadDocument } from '@/hooks/useDocuments'
import { usePipelines } from '@/hooks/usePipelines'
import DocumentList from '@/components/Documents/DocumentList'

export default function Documents() {
  const [searchParams] = useSearchParams()
  const pipelineId = searchParams.get('pipeline') || undefined
  const [selectedPipeline, setSelectedPipeline] = useState(pipelineId)

  const { data: documents = [], isLoading } = useDocuments(selectedPipeline)
  const { data: pipelines = [] } = usePipelines()
  const uploadDocument = useUploadDocument()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedPipeline) return

    for (const file of Array.from(files)) {
      await uploadDocument.mutateAsync({ pipelineId: selectedPipeline, file })
    }

    e.target.value = ''
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
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">
            Manage indexed documents across pipelines
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Pipeline Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPipeline || ''}
              onChange={(e) => setSelectedPipeline(e.target.value || undefined)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Pipelines</option>
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Upload
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
              disabled={!selectedPipeline}
            />
          </label>
        </div>
      </div>

      {!selectedPipeline && pipelines.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
          <p className="text-sm">
            Select a pipeline to upload documents or view documents across all
            pipelines.
          </p>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents found
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedPipeline
              ? 'Upload your first document to this pipeline'
              : 'Select a pipeline and upload documents to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <DocumentList documents={documents} showPipeline={!selectedPipeline} />
        </div>
      )}
    </div>
  )
}
