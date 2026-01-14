import { FileText, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useDeleteDocument } from '@/hooks/useDocuments'
import type { Document } from '@/types'

interface DocumentListProps {
  documents: Document[]
  showPipeline?: boolean
}

export default function DocumentList({ documents, showPipeline = false }: DocumentListProps) {
  const deleteDocument = useDeleteDocument()

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-gray-400" />,
    processing: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <AlertCircle className="h-4 w-4 text-red-500" />,
  }

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No documents</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document
            </th>
            {showPipeline && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pipeline
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chunks
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uploaded
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.mimeType}</p>
                  </div>
                </div>
              </td>
              {showPipeline && (
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.pipelineId}
                </td>
              )}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {statusIcons[doc.status]}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[doc.status]
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {doc.chunkCount ?? '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatFileSize(doc.size)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(doc.uploadedAt)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this document?')) {
                      deleteDocument.mutate(doc.id)
                    }
                  }}
                  disabled={doc.status === 'processing'}
                  className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
