export interface Pipeline {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'error'
  config: PipelineConfig
  createdAt: string
  updatedAt: string
  documentCount?: number
  lastProcessedAt?: string
}

export interface PipelineConfig {
  chunkSize: number
  chunkOverlap: number
  embeddingModel: string
  sourceType: 'file' | 'url' | 's3'
  s3Bucket?: string
  s3Prefix?: string
}

export interface Document {
  id: string
  pipelineId: string
  name: string
  mimeType: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  chunkCount?: number
  errorMessage?: string
  uploadedAt: string
  processedAt?: string
}

export interface Chunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface SearchResult {
  id: string
  content: string
  score: number
  documentId: string
  documentName: string
  metadata: Record<string, unknown> | null
}

export interface DashboardMetrics {
  totalPipelines: number
  activePipelines: number
  totalDocuments: number
  totalChunks: number
  documentsProcessedToday: number
  avgProcessingTime: number
}

export interface Activity {
  id: string
  type: 'pipeline_created' | 'pipeline_started' | 'pipeline_stopped' | 'document_uploaded' | 'document_processed' | 'error'
  message: string
  timestamp: string
  pipelineId?: string
  documentId?: string
}

export interface MetricPoint {
  timestamp: string
  value: number
}

export interface PipelineMetrics {
  documentsProcessed: MetricPoint[]
  avgLatency: MetricPoint[]
  errorRate: MetricPoint[]
}
