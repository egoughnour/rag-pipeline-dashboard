import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreatePipeline } from '@/hooks/usePipelines'
import type { PipelineConfig } from '@/types'

interface PipelineFormProps {
  onClose: () => void
}

const defaultConfig: PipelineConfig = {
  chunkSize: 512,
  chunkOverlap: 50,
  embeddingModel: 'text-embedding-3-small',
  sourceType: 'file',
}

export default function PipelineForm({ onClose }: PipelineFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [config, setConfig] = useState<PipelineConfig>(defaultConfig)

  const createPipeline = useCreatePipeline()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createPipeline.mutateAsync({
      name,
      description: description || undefined,
      config,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Create Pipeline</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pipeline Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter pipeline name"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this pipeline"
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Chunk Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chunk Size
              </label>
              <input
                type="number"
                value={config.chunkSize}
                onChange={(e) =>
                  setConfig({ ...config, chunkSize: parseInt(e.target.value) })
                }
                min={100}
                max={4000}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chunk Overlap
              </label>
              <input
                type="number"
                value={config.chunkOverlap}
                onChange={(e) =>
                  setConfig({ ...config, chunkOverlap: parseInt(e.target.value) })
                }
                min={0}
                max={500}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Embedding Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embedding Model
            </label>
            <select
              value={config.embeddingModel}
              onChange={(e) =>
                setConfig({ ...config, embeddingModel: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="text-embedding-3-small">text-embedding-3-small (1536 dims)</option>
              <option value="text-embedding-3-large">text-embedding-3-large (3072 dims)</option>
              <option value="text-embedding-ada-002">text-embedding-ada-002 (1536 dims)</option>
            </select>
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Type
            </label>
            <select
              value={config.sourceType}
              onChange={(e) =>
                setConfig({
                  ...config,
                  sourceType: e.target.value as 'file' | 'url' | 's3',
                })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="file">File Upload</option>
              <option value="url">URL Crawl</option>
              <option value="s3">S3 Bucket</option>
            </select>
          </div>

          {/* S3 Config (conditional) */}
          {config.sourceType === 's3' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S3 Bucket
                </label>
                <input
                  type="text"
                  value={config.s3Bucket || ''}
                  onChange={(e) =>
                    setConfig({ ...config, s3Bucket: e.target.value })
                  }
                  placeholder="bucket-name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  S3 Prefix
                </label>
                <input
                  type="text"
                  value={config.s3Prefix || ''}
                  onChange={(e) =>
                    setConfig({ ...config, s3Prefix: e.target.value })
                  }
                  placeholder="documents/"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createPipeline.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPipeline.isPending ? 'Creating...' : 'Create Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
